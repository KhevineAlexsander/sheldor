import {
  ARENA_TIERS,
  CONFIG,
  CONFIG_ITENS,
  DUNGEONS_CATALOG,
  EQUIPMENT_CATALOG,
  PET_CATALOG,
  CATALOGO_EQUIPAMENTOS,
  CATALOGO_PICARETAS,
  CATALOGO_CONSUMIVEIS,
  MATERIAIS_CATALOGO,
  criarInstanciaEquip,
  criarInstanciaPicareta,
  migrarPerfilParaV3
} from './gameData';
import { ClanData, DailyQuest, DungeonParty, EquipSlot, PlayerProfile } from '../types/rpgBot';
import {
  calcularPoderTotal,
  aplicarDesgasteGolpe,
  atualizarToxicidadeEBuffs,
  fatorDurabilidade,
  adicionarAoInventario
} from './itemSystemV3';
import {
  handleMineV3,
  handleFundirV3,
  handleForjarV3,
  handleConsertarV3,
  handleEncantarV3,
  handleUsarV3,
  handleBuffsV3,
  handleEquipadosV3,
  handleInventarioV3
} from './commandHandlersV3';
import {
  handleEquiparV3,
  handleDesequiparV3,
  handleVenderV3,
  handleBauV3
} from './itemCommandsExtra';

export function formatTimeRemaining(msRemaining: number): string {
  if (msRemaining <= 0) return '0s';
  const totalSeconds = Math.ceil(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}min ${seconds < 10 ? '0' : ''}${seconds}s`;
  }
  return `${seconds}s`;
}

export function regenerarEnergia(player: PlayerProfile): void {
  const agora = Date.now();
  const tempoDecorrido = Math.max(0, agora - (player.ultimaAtualizacaoEnergia || agora));
  const pontosRegen = Math.floor(tempoDecorrido / (CONFIG.energia.regenSegundos * 1000));

  if (pontosRegen > 0) {
    player.energia = Math.min(player.energiaMax, (player.energia || 0) + pontosRegen);
    player.ultimaAtualizacaoEnergia = agora;
  }
}

export function calculateTotalAttack(profile: PlayerProfile): number {
  return calcularPoderTotal(profile).ataque;
}

export function calculateTotalDefense(profile: PlayerProfile): number {
  return calcularPoderTotal(profile).defesa;
}

export interface EngineResult {
  messageText: string;
  updatedProfiles: PlayerProfile[];
  activeProfileId: string;
  activeParty: DungeonParty | null;
  updatedClans?: ClanData[];
  soundType?: 'slash' | 'hit' | 'success' | 'fumble' | 'levelup' | 'heal' | 'dice';
}

export function processRpgCommand(
  rawInput: string,
  profiles: PlayerProfile[],
  activeProfileId: string,
  currentParty: DungeonParty | null,
  clans: ClanData[] = [],
  currentUserUid?: string
): EngineResult {
  const agora = Date.now();
  const trimmed = rawInput.trim();
  const input = trimmed.startsWith('#') ? trimmed.substring(1).trim() : trimmed;
  const parts = input.split(/\s+/);
  const command = parts[0]?.toLowerCase() || 'menu';
  const args = parts.slice(1);

  // Deep copy and migrate profiles map
  const profilesMap: Record<string, PlayerProfile> = {};
  profiles.forEach((rawP) => {
    const safePlayer = migrarPerfilParaV3(rawP);
    safePlayer.donoId = safePlayer.donoId || currentUserUid || `user_${safePlayer.id}`;
    regenerarEnergia(safePlayer);
    atualizarToxicidadeEBuffs(safePlayer, agora);
    profilesMap[safePlayer.id.toLowerCase()] = safePlayer;
  });

  const activePlayer = profilesMap[activeProfileId.toLowerCase()] || Object.values(profilesMap)[0];
  let updatedParty = currentParty ? { ...currentParty, membrosIds: [...currentParty.membrosIds] } : null;
  const updatedClansList = clans.map((c) => ({ ...c, membrosIds: [...c.membrosIds] }));

  // Helper for Level Up
  const checkLevelUp = (player: PlayerProfile): string[] => {
    const logs: string[] = [];
    while (player.xp >= player.xpProximo) {
      player.nivel += 1;
      player.xp -= player.xpProximo;
      player.xpProximo = Math.round(100 * Math.pow(player.nivel, 1.5));
      player.hpMax += 20;
      player.hp = player.hpMax;
      player.ataqueBase += 3;
      player.defesaBase += 2;
      player.energiaMax = Math.min(CONFIG.energia.teto, CONFIG.energia.maxPadrao + player.nivel * CONFIG.energia.maxPorNivel);
      player.energia = player.energiaMax;
      logs.push(`✨ PARABÉNS! Você alcançou o Nível ${player.nivel}! (+20 HP Máx, +3 Ataque, +2 Defesa, Energia restaurada)`);
    }
    return logs;
  };

  // Helper to validate Cooldown & Energy
  const validarCooldownEEnergia = (
    cooldownTimestamp: number,
    cdSegundos: number,
    custoEnergia: number,
    nomeAcao: string
  ): { liberado: boolean; erroTexto?: string } => {
    if (cooldownTimestamp > agora) {
      const restante = formatTimeRemaining(cooldownTimestamp - agora);
      return {
        liberado: false,
        erroTexto: `⏳ Calma, guerreiro! ${nomeAcao} ainda em recarga.
Tente novamente em ${restante}.
⚡ Energia: ${activePlayer.energia}/${activePlayer.energiaMax}`
      };
    }

    if (activePlayer.energia < custoEnergia) {
      const segProximoPonto = CONFIG.energia.regenSegundos - Math.floor(((agora - activePlayer.ultimaAtualizacaoEnergia) / 1000) % CONFIG.energia.regenSegundos);
      return {
        liberado: false,
        erroTexto: `⚡ Energia insuficiente! Você precisa de ${custoEnergia} energia para ${nomeAcao}.
Atual: ${activePlayer.energia}/${activePlayer.energiaMax} (próximo ponto em ${segProximoPonto}s).`
      };
    }

    return { liberado: true };
  };

  // Helper to apply Cooldown & Energy
  const aplicarConsumo = (cdProp: keyof PlayerProfile['cooldowns'], cdSegundos: number, custoEnergia: number) => {
    activePlayer.cooldowns[cdProp] = agora + cdSegundos * 1000;
    activePlayer.energia = Math.max(0, activePlayer.energia - custoEnergia);
  };

  // --- #MENU ---
  if (command === 'menu' || command === 'ajuda' || command === 'help') {
    return {
      messageText: `╭───📜 MENU DE COMANDOS SHELDOR RPG v2.0 ───╮
⚔️ COMBATE & ARENA:
#duelorpg @perfil - Duelo PvP real (Cooldown 5min, 10⚡)
#arena <1-4> - Batalha de 3 ondas na Arena (Cooldown 20min, 20⚡)
#dungeon - Lista Dungeons & Chefões (Cooldown 2h, 25⚡)
#dungeon criar <tipo> - Cria grupo de incursão
#dungeon entrar <id> - Entra na party com outro guerreiro
#dungeon iniciar - Inicia ataque da party ao Boss

⛏️ MINERAÇÃO, TRABALHO & ECONOMIA:
#mine - Minera jazidas (Cooldown 3min, 8⚡, fadiga diária)
#trabalhar - Turno de trabalho seguro (Cooldown 30min, 15⚡)
#consertar picareta - Repara a picareta (15% custo, 10min cd)
#curar - Recupera 100% HP na enfermaria (Cooldown 5min)
#usar <pocao_hp|pocao_energia> - Consome poção do inventário
#roleta <valor> <cor|numero> - Cassino (Cooldown 30s)

🛡️ EQUIPAMENTOS, FORJA & PETS:
#equipar <item> - Equipa peça (ex: #equipar elmo_couro)
#desequipar <slot> - Remove do slot (elmo, armadura, arma, escudo, etc.)
#encantar <slot> - Fortalece armaduras/armas de +1 a +5
#pet - Exibe seu pet atual ou lista para compra
#pet alimentar - Alimenta pet por 12h (+dano e +crítico ativo)
#pet treinar - Treina pet para subir de nível (Cooldown 1h, 5⚡)

📋 COMUNIDADE & PROGRESSÃO:
#quest - Quests diárias do dia com baús de recompensa
#diario - Recompensa de login diário com streak
#cla - Detalhes do seu clã ou lista de clãs
#cla doar <valor> - Doa moedas para o banco da guilda
#perfil ou #status - Exibe ficha completa e energia
#ranking - Tabela dos maiores guerreiros do reino
╰──────────────────────────────────────────╯`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      updatedClans: updatedClansList,
      soundType: 'dice'
    };
  }

  // --- #MINE (Mineração com Picareta, Durabilidade e Drops v3.0) ---
  if (command === 'mine' || command === 'minerar') {
    const resMine = handleMineV3(activePlayer, agora);
    const lvlLogs = checkLevelUp(activePlayer);
    const msg = lvlLogs.length > 0 ? `${resMine.messageText}\n${lvlLogs.join('\n')}` : resMine.messageText;

    return {
      messageText: msg,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resMine.soundType
    };
  }

  // --- #CONSERTAR <slot|picareta|tudo> ---
  if (command === 'consertar' || command === 'reparar') {
    const resCons = handleConsertarV3(activePlayer, args[0] || 'tudo', agora);
    return {
      messageText: resCons.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resCons.soundType
    };
  }

  // --- #FUNDIR <minerio> <qtd> ---
  if (command === 'fundir' || command === 'smelt') {
    const resFund = handleFundirV3(activePlayer, args[0], args[1], agora);
    return {
      messageText: resFund.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resFund.soundType
    };
  }

  // --- #FORJAR <item> ---
  if (command === 'forjar' || command === 'craft') {
    const resForj = handleForjarV3(activePlayer, args[0], agora);
    return {
      messageText: resForj.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resForj.soundType
    };
  }

  // --- #BUFFS & TOXICIDADE ---
  if (command === 'buffs' || command === 'toxicidade' || command === 'statusbuff') {
    return {
      messageText: handleBuffsV3(activePlayer, agora),
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'dice'
    };
  }

  // --- #EQUIPADOS & BÔNUS DE SET ---
  if (command === 'equipados' || command === 'gears' || command === 'set') {
    return {
      messageText: handleEquipadosV3(activePlayer),
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'dice'
    };
  }

  // --- #INVENTARIO [pagina] ---
  if (command === 'inventario' || command === 'inv' || command === 'mochila') {
    return {
      messageText: handleInventarioV3(activePlayer, args[0]),
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'dice'
    };
  }

  // --- #BAU [resgatar] ---
  if (command === 'bau' || command === 'baú' || command === 'espera') {
    return {
      messageText: handleBauV3(activePlayer, args[0]),
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'dice'
    };
  }

  // --- #VENDER <item> <qtd> ---
  if (command === 'vender' || command === 'sell') {
    const resVend = handleVenderV3(activePlayer, args[0], args[1]);
    return {
      messageText: resVend.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resVend.soundType
    };
  }

  // --- #TRABALHAR ---
  if (command === 'trabalhar' || command === 'work') {
    const val = validarCooldownEEnergia(
      activePlayer.cooldowns.trabalhar,
      CONFIG.cooldownsSeg.trabalhar,
      CONFIG.custoEnergia.trabalhar,
      'O turno de trabalho'
    );
    if (!val.liberado) {
      return {
        messageText: val.erroTexto!,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    aplicarConsumo('trabalhar', CONFIG.cooldownsSeg.trabalhar, CONFIG.custoEnergia.trabalhar);

    activePlayer.contadores24h.trabalhar = activePlayer.contadores24h.trabalhar.filter((t) => agora - t < 86400000);
    activePlayer.contadores24h.trabalhar.push(agora);
    const turnosHoje = activePlayer.contadores24h.trabalhar.length;
    const multTurno = turnosHoje > CONFIG.limitesDiarios.trabalhoIntegral ? 0.3 : 1.0;

    let valorTrabalho = Math.round((200 + Math.floor(Math.random() * 151) + activePlayer.nivel * 10) * multTurno);
    let expGanha = Math.round((25 + Math.floor(Math.random() * 21)) * multTurno);
    let eventoMsg = '';

    // Random Event (5%)
    const evtRoll = Math.random();
    if (evtRoll < 0.05) {
      valorTrabalho = Math.round(valorTrabalho * 1.5);
      eventoMsg = '\n🌟 Evento: O mestre da guilda pagou Hora Extra (+50% moedas)!';
    } else if (evtRoll > 0.95) {
      const danoAcidente = Math.round(activePlayer.hpMax * 0.1);
      activePlayer.hp = Math.max(1, activePlayer.hp - danoAcidente);
      eventoMsg = `\n⚠️ Evento: Você tropeçou numa viga e sofreu ${danoAcidente} de dano leve.`;
    }

    activePlayer.moedas += valorTrabalho;
    activePlayer.xp += expGanha;

    const lvlLogs = checkLevelUp(activePlayer);

    return {
      messageText: `💼 Você trabalhou e recebeu ${valorTrabalho} moedas!
✨ EXP: +${expGanha}
⚡ Energia restante: ${activePlayer.energia}/${activePlayer.energiaMax} (-15)
⏳ Próximo turno de trabalho em 30min (Turnos hoje: ${turnosHoje}/8 integrais)${eventoMsg}
${lvlLogs.length > 0 ? '\n' + lvlLogs.join('\n') : ''}`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'success'
    };
  }

  // --- #DUELORPG @Target (Anti-Abuso & Transferência Real) ---
  if (command === 'duelorpg' || command === 'duelo' || command === 'pvp') {
    const val = validarCooldownEEnergia(
      activePlayer.cooldowns.duelo,
      CONFIG.cooldownsSeg.duelo,
      CONFIG.custoEnergia.duelo,
      'Seu guerreiro'
    );
    if (!val.liberado) {
      return {
        messageText: val.erroTexto!,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    const targetQuery = args[0] ? args[0].replace(/^[@#]/, '').toLowerCase() : '';
    if (!targetQuery) {
      return {
        messageText: `❌ Especifique o oponente! Exemplo: #duelorpg @ALEXBOT ou #duelorpg @Nunesjj`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    const targetKey = Object.keys(profilesMap).find(
      (k) => k === targetQuery || profilesMap[k].nome.toLowerCase() === targetQuery
    );

    if (!targetKey) {
      return {
        messageText: `❌ Oponente '@${args[0]}' não encontrado! Digite #ranking para ver jogadores disponíveis.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    const opponent = profilesMap[targetKey];

    // Anti-Alt rule: Cannot duel self or profile with same donoId
    if (opponent.id === activePlayer.id || (opponent.donoId && opponent.donoId === activePlayer.donoId)) {
      return {
        messageText: `❌ Regra Anti-Abuso: Você não pode duelar contra suas próprias contas/perfis para farmar moedas! Escolha outro jogador ou bot.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    // HP >= 30% rule
    if (activePlayer.hp < activePlayer.hpMax * 0.3) {
      return {
        messageText: `❌ Vida muito baixa! Você precisa de pelo menos 30% de HP para entrar em duelo (${Math.round(activePlayer.hpMax * 0.3)} HP). Cure-se com #curar.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    if (opponent.hp < opponent.hpMax * 0.3) {
      return {
        messageText: `❌ O oponente @${opponent.nome} está gravemente ferido (<30% HP) e não pode lutar agora.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    // Cooldown against same opponent
    const duelosPassados = (activePlayer.contadores24h.duelosPorOponente[opponent.id] || []).filter(
      (t) => agora - t < 86400000
    );
    const ultimoDueloMesmo = duelosPassados.length > 0 ? duelosPassados[duelosPassados.length - 1] : 0;
    if (agora - ultimoDueloMesmo < CONFIG.cooldownsSeg.dueloMesmoOponente * 1000) {
      const restMesmo = formatTimeRemaining(CONFIG.cooldownsSeg.dueloMesmoOponente * 1000 - (agora - ultimoDueloMesmo));
      return {
        messageText: `⏳ Você já duelou contra @${opponent.nome} recentemente! Aguarde ${restMesmo} para desafiá-lo novamente (ou duele com outro jogador).`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    // Apply consumption
    aplicarConsumo('duelo', CONFIG.cooldownsSeg.duelo, CONFIG.custoEnergia.duelo);
    duelosPassados.push(agora);
    activePlayer.contadores24h.duelosPorOponente[opponent.id] = duelosPassados;

    // Repetition factor for reward: 1st duel: 100%, 2nd: 50%, 3rd+: 0%
    const indexDuelo = duelosPassados.length - 1;
    const fatorRepeticao = indexDuelo < CONFIG.pvp.fatorRepeticao.length ? CONFIG.pvp.fatorRepeticao[indexDuelo] : 0.0;

    // Simulation with exact Section 5 formulas
    const p1Atk = calculateTotalAttack(activePlayer);
    const p1Def = calculateTotalDefense(activePlayer);
    const p2Atk = calculateTotalAttack(opponent);
    const p2Def = calculateTotalDefense(opponent);

    let p1Hp = activePlayer.hp;
    let p2Hp = opponent.hp;
    const battleLines: string[] = [];

    // Critical and dodge helpers
    const petCritBonusP1 = activePlayer.pet && agora < activePlayer.pet.fomeAteTimestamp ? activePlayer.pet.bonusCriticoPct / 100 : 0;
    const petCritBonusP2 = opponent.pet && agora < opponent.pet.fomeAteTimestamp ? opponent.pet.bonusCriticoPct / 100 : 0;

    for (let round = 1; round <= CONFIG.combate.rodadasPvP; round++) {
      // P1 strikes P2
      if (Math.random() < CONFIG.combate.chanceEsquiva) {
        battleLines.push(`💨 @${opponent.nome}: ESQUIVOU do golpe!`);
      } else {
        const isCrit = Math.random() < (CONFIG.combate.chanceCritico + petCritBonusP1);
        const bloqueado = !!opponent.equipamentos.escudo && opponent.equipamentos.escudo.durabilidade > 0 && Math.random() < CONFIG_ITENS.desgaste.chanceBloqueio;
        const base = p1Atk * (CONFIG.combate.variacaoMin + Math.random() * (CONFIG.combate.variacaoMax - CONFIG.combate.variacaoMin));
        let dano = Math.max(1, Math.round(base - p2Def * CONFIG.combate.mitigacaoDefesa));
        if (bloqueado) dano = Math.max(1, Math.round(dano * (1 - CONFIG_ITENS.desgaste.reducaoBloqueio)));
        if (isCrit) dano = Math.round(dano * CONFIG.combate.multCritico);
        p2Hp -= dano;
        aplicarDesgasteGolpe(activePlayer, opponent, isCrit, bloqueado);
        battleLines.push(`⚔️ ${activePlayer.nome}: -${dano} HP${isCrit ? ' (💥 CRÍTICO!)' : ''}${bloqueado ? ' (🛡️ BLOQUEADO!)' : ''}`);
      }

      if (p2Hp <= 0) break;

      // P2 strikes P1
      if (Math.random() < CONFIG.combate.chanceEsquiva) {
        battleLines.push(`💨 ${activePlayer.nome}: ESQUIVOU do golpe!`);
      } else {
        const isCrit = Math.random() < (CONFIG.combate.chanceCritico + petCritBonusP2);
        const bloqueado = !!activePlayer.equipamentos.escudo && activePlayer.equipamentos.escudo.durabilidade > 0 && Math.random() < CONFIG_ITENS.desgaste.chanceBloqueio;
        const base = p2Atk * (CONFIG.combate.variacaoMin + Math.random() * (CONFIG.combate.variacaoMax - CONFIG.combate.variacaoMin));
        let dano = Math.max(1, Math.round(base - p1Def * CONFIG.combate.mitigacaoDefesa));
        if (bloqueado) dano = Math.max(1, Math.round(dano * (1 - CONFIG_ITENS.desgaste.reducaoBloqueio)));
        if (isCrit) dano = Math.round(dano * CONFIG.combate.multCritico);
        p1Hp -= dano;
        aplicarDesgasteGolpe(opponent, activePlayer, isCrit, bloqueado);
        battleLines.push(`🛡️ @${opponent.nome}: -${dano} HP${isCrit ? ' (💥 CRÍTICO!)' : ''}${bloqueado ? ' (🛡️ BLOQUEADO!)' : ''}`);
      }

      if (p1Hp <= 0) break;
    }

    const playerWon = p1Hp > p2Hp && p1Hp > 0;
    activePlayer.hp = Math.max(1, p1Hp);
    opponent.hp = Math.max(1, p2Hp);

    const pecasDesgastadas = Object.values(activePlayer.equipamentos)
      .filter((e) => e && e.durabilidade > 0 && e.durabilidade / e.durabilidadeMax <= 0.25)
      .map((e) => e!.nome);
    const avisoDesgaste = pecasDesgastadas.length > 0 ? `\n⚠️ Alerta de Durabilidade: ${pecasDesgastadas.join(', ')} estão abaixo de 25%! Use #consertar.` : '';

    if (playerWon) {
      activePlayer.vitoriasPvP += 1;
      opponent.derrotasPvP += 1;

      // Real transfer calculation: max 10% of loser coins
      const recompensaBase = 100 + activePlayer.nivel * 30;
      const limitePerdedor = Math.max(20, Math.floor(opponent.moedas * CONFIG.pvp.limitePctSaldoPerdedor));
      const moedasGanhas = Math.round(Math.min(recompensaBase, limitePerdedor) * fatorRepeticao);
      const expGanha = Math.round((40 + opponent.nivel * 5) * fatorRepeticao);

      // Debit from loser, credit to winner
      opponent.moedas = Math.max(0, opponent.moedas - moedasGanhas);
      activePlayer.moedas += moedasGanhas;
      activePlayer.xp += expGanha;

      const lvlLogs = checkLevelUp(activePlayer);

      return {
        messageText: `╭───⚔️ DUELO ───╮
${activePlayer.nome} VS @${opponent.nome}
╰────────────────╯

${battleLines.join('\n')}

╭───🏆 VITÓRIA! 🏆───╮
💰 Recompensa (transferida do perdedor): +${moedasGanhas}
✨ EXP: +${expGanha}
❤️ HP restante: ${activePlayer.hp}/${activePlayer.hpMax}
⚡ Energia: ${activePlayer.energia}/${activePlayer.energiaMax} (-10)
⏳ Próximo duelo global em 5min (Mesmo alvo: 30min)${fatorRepeticao < 1 ? ` (Fator repetição: ${Math.round(fatorRepeticao * 100)}%)` : ''}${avisoDesgaste}
${lvlLogs.length > 0 ? '\n' + lvlLogs.join('\n') : ''}`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'success'
      };
    } else {
      activePlayer.derrotasPvP += 1;
      opponent.vitoriasPvP += 1;

      const limiteAtivo = Math.max(20, Math.floor(activePlayer.moedas * CONFIG.pvp.limitePctSaldoPerdedor));
      const perdaMoedas = Math.min(activePlayer.moedas, Math.round(limiteAtivo * fatorRepeticao));
      activePlayer.moedas -= perdaMoedas;
      opponent.moedas += perdaMoedas;

      return {
        messageText: `╭───⚔️ DUELO ───╮
${activePlayer.nome} VS @${opponent.nome}
╰────────────────╯

${battleLines.join('\n')}

╭───💀 DERROTA! 💀───╮
💸 Moedas perdidas: -${perdaMoedas} (transferidas para @${opponent.nome})
❤️ HP restante: ${activePlayer.hp}/${activePlayer.hpMax}
⚡ Energia: ${activePlayer.energia}/${activePlayer.energiaMax} (-10)
⏳ Próximo duelo em 5min. Cure-se com #curar!`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'hit'
      };
    }
  }

  // --- #ARENA <1-4> ---
  if (command === 'arena') {
    const val = validarCooldownEEnergia(
      activePlayer.cooldowns.arena,
      CONFIG.cooldownsSeg.arena,
      CONFIG.custoEnergia.arena,
      'A Arena'
    );
    if (!val.liberado) {
      return {
        messageText: val.erroTexto!,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    const tierNum = parseInt(args[0], 10) || 1;
    const tier = ARENA_TIERS.find((t) => t.id === tierNum) || ARENA_TIERS[0];

    if (activePlayer.moedas < tier.custoEntrada) {
      return {
        messageText: `❌ Moedas insuficientes! A Arena ${tier.nome} custa ${tier.custoEntrada} moedas. Saldo: ${activePlayer.moedas}.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    // Apply consumption and entry fee
    aplicarConsumo('arena', CONFIG.cooldownsSeg.arena, CONFIG.custoEnergia.arena);
    activePlayer.moedas -= tier.custoEntrada;

    const playerPower = calculateTotalAttack(activePlayer) + calculateTotalDefense(activePlayer);
    const requiredPower = tier.id * 42;
    const successRatio = playerPower / requiredPower;
    const wavesDefeated =
      successRatio >= 1.25 ? 3 : successRatio >= 0.85 ? (Math.random() > 0.35 ? 3 : 2) : Math.random() > 0.5 ? 2 : 1;

    if (wavesDefeated === 3) {
      activePlayer.moedas += tier.recompensaMoedas;
      activePlayer.xp += tier.recompensaXp;
      const lvlLogs = checkLevelUp(activePlayer);

      return {
        messageText: `╭───🏆 VITÓRIA NA ARENA 🏆───╮
🏟️ Arena: ${tier.nome}
╰──────────────────────────╯

⚔️ Derrotou: 3/3 inimigos

╭───💰 RECOMPENSAS ───╮
💵 Moedas: +${tier.recompensaMoedas}
✨ EXP: +${tier.recompensaXp}
⚡ Energia: ${activePlayer.energia}/${activePlayer.energiaMax} (-20)
⏳ Cooldown de Arena: 20min
${lvlLogs.length > 0 ? '\n' + lvlLogs.join('\n') : ''}`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'success'
      };
    } else {
      const taxaMedica = Math.floor(tier.custoEntrada * 0.1);
      activePlayer.moedas = Math.max(0, activePlayer.moedas - taxaMedica);
      activePlayer.hp = Math.max(1, activePlayer.hp - 40 * tier.id);
      const xpParcial = Math.round((tier.recompensaXp * wavesDefeated) / 3 * 0.3);
      activePlayer.xp += xpParcial;

      return {
        messageText: `╭───💀 DERROTA NA ARENA 💀───╮
🏟️ Arena: ${tier.nome}
╰────────────────────────────╯

⚔️ Derrotou: ${wavesDefeated}/3 inimigos

╭───💸 PERDAS ───╮
💵 Inscrição + Taxa Médica: -${tier.custoEntrada + taxaMedica} moedas
✨ EXP de consolação: +${xpParcial}
⏳ Cooldown de Arena: 20min`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'hit'
      };
    }
  }

  // --- #DUNGEON ---
  if (command === 'dungeon') {
    const subAction = args[0]?.toLowerCase();

    // #dungeon list
    if (!subAction || subAction === 'lista' || subAction === 'menu') {
      const dungeonListText = DUNGEONS_CATALOG.map((d) => {
        const unlocked = activePlayer.nivel >= d.nivelMin;
        const iconLock = unlocked ? '✅' : '🔒';
        return `${d.icone} ${d.nome} ${iconLock}
📊 Nv.${d.nivelMin}+ | 👥 ${d.jogadoresMax} jogadores | ⚡ 25 energia
💰 ${d.recompensaMoedas.toLocaleString()} (dividido) | ✨ ${d.recompensaXp} XP cada
👹 Boss: ${d.boss.icone} ${d.boss.nome}`;
      }).join('\n\n');

      return {
        messageText: `╭───🏰 DUNGEONS ───╮
Seu Nível: ${activePlayer.nivel} | ⚡ Energia: ${activePlayer.energia}/${activePlayer.energiaMax}
╰─────────────────╯

${dungeonListText}

*Para criar um grupo: #dungeon criar <tipo>*
*(floresta, caverna, ruinas, vulcao, abismo)*`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'dice'
      };
    }

    // #dungeon criar <tipo>
    if (subAction === 'criar') {
      const tipo = args[1]?.toLowerCase();
      const validTypes = ['floresta', 'caverna', 'ruinas', 'vulcao', 'abismo'];

      if (!tipo || !validTypes.includes(tipo)) {
        return {
          messageText: `❌ Dungeon inválida!
🏰 Tipos: floresta, caverna, ruinas, vulcao, abismo`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const val = validarCooldownEEnergia(
        activePlayer.cooldowns.dungeon,
        CONFIG.cooldownsSeg.dungeon,
        CONFIG.custoEnergia.dungeon,
        'A Dungeon'
      );
      if (!val.liberado) {
        return {
          messageText: val.erroTexto!,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const dung = DUNGEONS_CATALOG.find((d) => d.id.toLowerCase() === tipo.toLowerCase() || d.nome.toLowerCase().includes(tipo.toLowerCase()));
      if (!dung) {
        return {
          messageText: `❌ Dungeon '${tipo}' não encontrada! Use #dungeon para listar.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }
      if (activePlayer.nivel < dung.nivelMin) {
        return {
          messageText: `❌ Nível insuficiente! Requer Nível ${dung.nivelMin}+ para ${dung.nome}. Seu nível: ${activePlayer.nivel}.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const partyId = Math.floor(10000000 + Math.random() * 90000000).toString();
      updatedParty = {
        id: partyId,
        dungeonId: dung.id,
        criadorId: activePlayer.id,
        membrosIds: [activePlayer.id],
        status: 'esperando',
        bossHpAtual: dung.boss.hpMax,
        expiraEmTimestamp: agora + 15 * 60 * 1000 // 15 min de validade
      };

      return {
        messageText: `╭───🎉 PARTY CRIADA ───╮
${dung.icone} ${dung.nome}

🆔 ID: ${partyId}
👥 Membros: 1/${dung.jogadoresMax}
👹 Boss: ${dung.boss.icone} ${dung.boss.nome}
⏳ Esta sala expira em 15min.

Digite #dungeon iniciar para atacar ou #dungeon entrar ${partyId} com outros perfis!`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'success'
      };
    }

    // #dungeon entrar <id>
    if (subAction === 'entrar' || subAction === 'join') {
      const idQuery = args[1];
      if (!updatedParty || updatedParty.id !== idQuery) {
        return {
          messageText: `❌ Party com ID '${idQuery || ''}' não encontrada ou já expirou! Crie uma com #dungeon criar <tipo>.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const party = updatedParty;
      const dung = DUNGEONS_CATALOG.find((d) => d.id === party.dungeonId)!;

      // Anti-Alt check: cannot join with 2 profiles from same owner
      const criador = profilesMap[party.criadorId.toLowerCase()];
      if (criador && criador.donoId === activePlayer.donoId && activePlayer.id !== party.criadorId) {
        return {
          messageText: `❌ Regra Anti-Abuso: Você não pode ingressar na mesma party com múltiplas contas/perfis do mesmo dono!`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: party,
          soundType: 'fumble'
        };
      }

      if (!party.membrosIds.includes(activePlayer.id)) {
        if (party.membrosIds.length >= dung.jogadoresMax) {
          return {
            messageText: `❌ Party lotada! Máximo de ${dung.jogadoresMax} jogadores.`,
            updatedProfiles: Object.values(profilesMap),
            activeProfileId: activePlayer.id,
            activeParty: party,
            soundType: 'fumble'
          };
        }
        party.membrosIds.push(activePlayer.id);
      }

      return {
        messageText: `✅ ${activePlayer.nome} entrou na Party!
${dung.icone} Dungeon: ${dung.nome}
👥 Membros: ${party.membrosIds.length}/${dung.jogadoresMax} (${party.membrosIds.map((id) => profilesMap[id.toLowerCase()]?.nome || id).join(', ')})
Digite #dungeon iniciar para atacar!`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: party,
        soundType: 'success'
      };
    }

    // #dungeon iniciar
    if (subAction === 'iniciar' || subAction === 'start' || subAction === 'atacar') {
      if (!updatedParty) {
        return {
          messageText: `❌ Nenhuma party ativa! Crie uma com #dungeon criar floresta.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const activeP = updatedParty;
      const dung = DUNGEONS_CATALOG.find((d) => d.id === activeP.dungeonId)!;
      const partyMembers = activeP.membrosIds.map((id) => profilesMap[id.toLowerCase()]).filter(Boolean);

      // Verify energy of all members
      for (const m of partyMembers) {
        if (m.energia < CONFIG.custoEnergia.dungeon) {
          return {
            messageText: `❌ O membro @${m.nome} não possui energia suficiente (${m.energia}/${CONFIG.custoEnergia.dungeon}⚡)! A dungeon não pode iniciar.`,
            updatedProfiles: Object.values(profilesMap),
            activeProfileId: activePlayer.id,
            activeParty: activeP,
            soundType: 'fumble'
          };
        }
      }

      // Apply cooldown & energy to all members
      partyMembers.forEach((m) => {
        m.cooldowns.dungeon = agora + CONFIG.cooldownsSeg.dungeon * 1000;
        m.energia = Math.max(0, m.energia - CONFIG.custoEnergia.dungeon);
      });

      let totalPartyAtk = 0;
      let totalPartyDef = 0;
      partyMembers.forEach((m) => {
        totalPartyAtk += calculateTotalAttack(m);
        totalPartyDef += calculateTotalDefense(m);
      });

      let bossHp = dung.boss.hpMax;
      const raidLog: string[] = [];

      for (let turn = 1; turn <= 6; turn++) {
        const teamDamage = Math.floor(totalPartyAtk * (1.0 + Math.random() * 0.4) - dung.boss.defesa * 0.5);
        const dmgReal = Math.max(30, teamDamage);
        bossHp -= dmgReal;
        raidLog.push(`⚔️ Turno ${turn}: Grupo causou -${dmgReal} HP no Boss!`);

        if (bossHp <= 0) break;

        const bossDamage = Math.floor(dung.boss.ataque * (0.9 + Math.random() * 0.3) - totalPartyDef * 0.25);
        raidLog.push(`🔥 ${dung.boss.nome} revidou desferindo -${Math.max(20, bossDamage)} HP no grupo!`);
      }

      const victory = bossHp <= 0 || totalPartyAtk > dung.boss.defesa * 1.4;

      if (victory) {
        const shareGold = Math.floor(dung.recompensaMoedas / partyMembers.length);
        const shareExp = dung.recompensaXp;
        const dropId = dung.dropLoot[Math.floor(Math.random() * dung.dropLoot.length)];
        const catCons = CATALOGO_CONSUMIVEIS[dropId];
        const catMat = MATERIAIS_CATALOGO[dropId];

        const lvlMessages: string[] = [];
        partyMembers.forEach((m) => {
          m.moedas += shareGold;
          m.xp += shareExp;
          m.dungeonsCompletadas += 1;
          if (catCons) {
            adicionarAoInventario(m, {
              tipo: 'consumivel',
              itemId: catCons.id,
              nome: catCons.nome,
              quantidade: 1,
              icone: catCons.icone,
              precoVenda: Math.round(catCons.preco * 0.4),
              descricao: catCons.descricao
            });
          } else if (catMat) {
            adicionarAoInventario(m, {
              tipo: 'material',
              itemId: dropId,
              nome: catMat.nome,
              quantidade: 1,
              icone: catMat.icone,
              precoVenda: catMat.precoVenda,
              descricao: 'Material de forja e aprimoramento'
            });
          } else {
            adicionarAoInventario(m, {
              tipo: 'material',
              itemId: dropId,
              nome: dropId,
              quantidade: 1,
              icone: '🎁',
              precoVenda: 250
            });
          }
          const lMsg = checkLevelUp(m);
          if (lMsg.length > 0) lvlMessages.push(...lMsg);
        });

        updatedParty = null;

        const dropNomeExibicao = catCons?.nome || catMat?.nome || dropId;

        return {
          messageText: `╭───🏰 DUNGEON CONCLUÍDA! ───╮
${dung.icone} ${dung.nome}
👹 Boss: ${dung.boss.icone} ${dung.boss.nome} (DERROTADO!)
╰─────────────────────────────╯

${raidLog.join('\n')}

╭───💎 RECOMPENSAS DA PARTY ───╮
👥 Participantes: ${partyMembers.map((p) => p.nome).join(', ')}
💰 Moedas por membro: +${shareGold.toLocaleString()}
✨ EXP por membro: +${shareExp}
📦 Loot Obtido: ${dropNomeExibicao}
⏳ Cooldown de Dungeon: 2h
${lvlMessages.length > 0 ? '\n' + lvlMessages.join('\n') : ''}`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: null,
          soundType: 'levelup'
        };
      } else {
        partyMembers.forEach((m) => {
          m.hp = Math.max(1, Math.round(m.hpMax * 0.25));
        });

        updatedParty = null;

        return {
          messageText: `╭───💀 DERROTA NA DUNGEON 💀───╮
${dung.icone} ${dung.nome}
👹 O Boss ${dung.boss.nome} sobrepujou o grupo!
❤️ Todos os guerreiros recuaram com 25% de HP.
⏳ Cooldown de Dungeon aplicado: 2h. Cure-se com #curar!`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: null,
          soundType: 'hit'
        };
      }
    }
  }

  // --- #PET (Mascotes de Batalha) ---
  if (command === 'pet') {
    const subAction = args[0]?.toLowerCase();

    // #pet (View current pet or catalog)
    if (!subAction) {
      if (activePlayer.pet) {
        const pet = activePlayer.pet;
        const alimentado = agora < pet.fomeAteTimestamp;
        const horasRestantes = alimentado ? Math.ceil((pet.fomeAteTimestamp - agora) / 3600000) : 0;

        return {
          messageText: `╭───🐾 SEU MASCOTE DE BATALHA ───╮
${pet.icone} Nome: ${pet.nome} (Nv.${pet.nivel})
🍖 Status: ${alimentado ? `Alimentado (+${pet.bonusDanoPct}% Dano, +${pet.bonusCriticoPct}% Crítico Ativo por ${horasRestantes}h)` : 'Com Fome! (Bônus inativo. Use #pet alimentar)'}
╰────────────────────────────────╯
*Comandos: #pet alimentar (100 moedas) | #pet treinar (1h cd)*`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'dice'
        };
      } else {
        return {
          messageText: `╭───🐾 LOJA DE MASCOTES ───╮
Você ainda não tem um mascote! Escolha um para adotar:

🐺 #pet comprar lobo - 💰 1.500 moedas
(+10% chance de crítico, +5% de dano)

🐱 #pet comprar gato - 💰 1.200 moedas
(+8% chance de crítico, agilidade nas esquivas)

🐲 #pet comprar dragao - 💰 4.000 moedas
(+12% de dano ardente, +5% de crítico)
╰──────────────────────────╯`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'dice'
        };
      }
    }

    // #pet comprar <tipo>
    if (subAction === 'comprar') {
      const tipo = args[1]?.toLowerCase() as 'lobo' | 'gato' | 'dragao';
      const petModel = PET_CATALOG[tipo];
      if (!petModel) {
        return {
          messageText: `❌ Tipo inválido! Escolha: lobo, gato, dragao.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      if (activePlayer.moedas < petModel.preco) {
        return {
          messageText: `❌ Moedas insuficientes! ${petModel.nome} custa ${petModel.preco} moedas. Seu saldo: ${activePlayer.moedas}.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      activePlayer.moedas -= petModel.preco;
      activePlayer.pet = {
        tipo,
        nome: petModel.nome,
        icone: petModel.icone,
        nivel: 1,
        xp: 0,
        fomeAteTimestamp: agora + 12 * 3600 * 1000, // 12h alimentado
        bonusDanoPct: petModel.bonusDanoPct,
        bonusCriticoPct: petModel.bonusCriticoPct
      };

      return {
        messageText: `🎉 Você adotou ${petModel.icone} ${petModel.nome}!
🍖 Ele já está alimentado pelas próximas 12h concedendo +${petModel.bonusDanoPct}% de Dano e +${petModel.bonusCriticoPct}% de Acerto Crítico!`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'levelup'
      };
    }

    // #pet alimentar
    if (subAction === 'alimentar') {
      if (!activePlayer.pet) {
        return {
          messageText: `❌ Você não possui um pet! Digite #pet comprar lobo.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const custoComida = 100;
      if (activePlayer.moedas < custoComida) {
        return {
          messageText: `❌ Moedas insuficientes! Alimentar seu pet custa 100 moedas.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      activePlayer.moedas -= custoComida;
      activePlayer.pet.fomeAteTimestamp = agora + 12 * 3600 * 1000;

      return {
        messageText: `🍖 ${activePlayer.pet.icone} ${activePlayer.pet.nome} comeu deliciosamente e está satisfeito pelas próximas 12 horas! (+${activePlayer.pet.bonusDanoPct}% dano e +${activePlayer.pet.bonusCriticoPct}% crítico ativos).`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'heal'
      };
    }

    // #pet treinar
    if (subAction === 'treinar') {
      if (!activePlayer.pet) {
        return {
          messageText: `❌ Você não possui um pet para treinar!`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const val = validarCooldownEEnergia(
        activePlayer.cooldowns.petTreinar,
        CONFIG.cooldownsSeg.petTreinar,
        CONFIG.custoEnergia.petTreinar,
        'O treino do pet'
      );
      if (!val.liberado) {
        return {
          messageText: val.erroTexto!,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      aplicarConsumo('petTreinar', CONFIG.cooldownsSeg.petTreinar, CONFIG.custoEnergia.petTreinar);
      activePlayer.pet.xp += 50;

      let upMsg = '';
      if (activePlayer.pet.xp >= activePlayer.pet.nivel * 100) {
        activePlayer.pet.nivel += 1;
        activePlayer.pet.xp = 0;
        activePlayer.pet.bonusDanoPct += 2;
        activePlayer.pet.bonusCriticoPct += 2;
        upMsg = `\n🌟 SEU PET SUBIU PARA O NÍVEL ${activePlayer.pet.nivel}! (+2% bônus de dano e crítico)`;
      }

      return {
        messageText: `🐾 Você treinou com ${activePlayer.pet.icone} ${activePlayer.pet.nome}! (+50 XP de Pet)
⚡ Energia: ${activePlayer.energia}/${activePlayer.energiaMax} (-5)
⏳ Próximo treino em 1h.${upMsg}`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'success'
      };
    }
  }

  // --- #ROLETA <valor> <vermelho|preto|numero> (Cassino com Limite Diário) ---
  if (command === 'roleta' || command === 'cassino') {
    const val = validarCooldownEEnergia(
      activePlayer.cooldowns.roleta,
      CONFIG.cooldownsSeg.roleta,
      0,
      'A mesa de roleta'
    );
    if (!val.liberado) {
      return {
        messageText: val.erroTexto!,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    if (activePlayer.contadores24h.roletaContador >= CONFIG.limitesDiarios.roletaApostas) {
      return {
        messageText: `❌ Limite diário de apostas atingido (${CONFIG.limitesDiarios.roletaApostas}/20 apostas hoje)! Volte amanhã para manter o jogo responsável.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    const valorAposta = parseInt(args[0], 10);
    const apostaAlvo = args[1]?.toLowerCase();

    if (!valorAposta || valorAposta <= 0 || !apostaAlvo) {
      return {
        messageText: `❌ Uso: #roleta <valor> <vermelho|preto|0 a 36>
Exemplo: #roleta 50 vermelho ou #roleta 20 7
*(Aposta máxima: 10% do seu saldo atual | Cooldown 30s)*`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    if (activePlayer.moedas < valorAposta) {
      return {
        messageText: `❌ Saldo insuficiente! Você possui ${activePlayer.moedas} moedas.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    const tetoAposta = Math.max(50, Math.floor(activePlayer.moedas * 0.1));
    if (valorAposta > tetoAposta) {
      return {
        messageText: `❌ Aposta máxima permitida é de 10% do seu saldo (${tetoAposta} moedas).`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    aplicarConsumo('roleta', CONFIG.cooldownsSeg.roleta, 0);
    activePlayer.contadores24h.roletaContador += 1;

    // Spin roulette 0 to 36
    const sorteado = Math.floor(Math.random() * 37);
    const corSorteada = sorteado === 0 ? 'verde' : sorteado % 2 === 0 ? 'preto' : 'vermelho';

    let ganhou = false;
    let premio = 0;

    if (apostaAlvo === 'vermelho' || apostaAlvo === 'preto') {
      if (corSorteada === apostaAlvo) {
        ganhou = true;
        premio = valorAposta * 2;
      }
    } else {
      const numApostado = parseInt(apostaAlvo, 10);
      if (!isNaN(numApostado) && numApostado === sorteado) {
        ganhou = true;
        premio = valorAposta * 14;
      }
    }

    if (ganhou) {
      const lucro = premio - valorAposta;
      activePlayer.moedas += lucro;
      return {
        messageText: `╭───🎰 ROLETA DA FORTUNA ───╮
Número sorteado: ${sorteado} (${corSorteada.toUpperCase()})
Sua aposta: ${apostaAlvo}

🎉 PARABÉNS! Você venceu e faturou +${lucro} moedas!
💰 Saldo atual: ${activePlayer.moedas.toLocaleString()}
⏳ Cooldown: 30s (Apostas hoje: ${activePlayer.contadores24h.roletaContador}/20)
╰───────────────────────────╯`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'success'
      };
    } else {
      activePlayer.moedas -= valorAposta;
      return {
        messageText: `╭───🎰 ROLETA DA FORTUNA ───╮
Número sorteado: ${sorteado} (${corSorteada.toUpperCase()})
Sua aposta: ${apostaAlvo}

💀 Que pena! A banca venceu desta vez (-${valorAposta} moedas).
💰 Saldo atual: ${activePlayer.moedas.toLocaleString()}
⏳ Cooldown: 30s (Apostas hoje: ${activePlayer.contadores24h.roletaContador}/20)
╰───────────────────────────╯`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'hit'
      };
    }
  }

  // --- #ENCANTAR <slot> (+1 a +5) v3.0 ---
  if (command === 'encantar') {
    const resEnc = handleEncantarV3(activePlayer, args[0], agora);
    return {
      messageText: resEnc.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resEnc.soundType
    };
  }

  // --- #EQUIPAR <uid|id> v3.0 ---
  if (command === 'equipar' || command === 'equip') {
    const dungeonAberta = !!updatedParty && updatedParty.status === 'em_combate';
    const resEq = handleEquiparV3(activePlayer, args.join(' '), dungeonAberta);
    return {
      messageText: resEq.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resEq.soundType
    };
  }

  // --- #DESEQUIPAR <slot> v3.0 ---
  if (command === 'desequipar' || command === 'unequip') {
    const dungeonAberta = !!updatedParty && updatedParty.status === 'em_combate';
    const resDes = handleDesequiparV3(activePlayer, args[0], dungeonAberta);
    return {
      messageText: resDes.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resDes.soundType
    };
  }

  // --- #USAR <item> v3.0 (Poções, Elixires, Bandagens, etc.) ---
  if (command === 'usar' || command === 'use' || command === 'beber') {
    const resUsar = handleUsarV3(activePlayer, args.join(' '), agora);
    return {
      messageText: resUsar.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resUsar.soundType
    };
  }

  // --- #QUEST (Missões Diárias) ---
  if (command === 'quest' || command === 'missoes') {
    const dateStr = new Date().toISOString().slice(0, 10);
    const countMine = activePlayer.contadores24h.mine.length;
    const countTrab = activePlayer.contadores24h.trabalhar.length;
    const countDuelo = Object.values(activePlayer.contadores24h.duelosPorOponente).reduce(
      (acc, arr) => acc + arr.length,
      0
    );

    const q1Done = activePlayer.diario.questsConcluidas.includes(`quest_mine_${dateStr}`) || countMine >= 5;
    const q2Done = activePlayer.diario.questsConcluidas.includes(`quest_trabalhar_${dateStr}`) || countTrab >= 2;
    const q3Done = activePlayer.diario.questsConcluidas.includes(`quest_duelo_${dateStr}`) || countDuelo >= 1;

    return {
      messageText: `╭───📋 MISSÕES DIÁRIAS (Reset 00:00) ───╮
1. Mineração Diária (5 minerações)
Progresso: ${Math.min(5, countMine)}/5 | ${q1Done ? '✅ Concluída (+350g, +80XP)' : '⏳ Em andamento'}

2. Trabalhador Incansável (2 turnos)
Progresso: ${Math.min(2, countTrab)}/2 | ${q2Done ? '✅ Concluída (+300g, +60XP)' : '⏳ Em andamento'}

3. Provador de Glória (1 duelo PvP)
Progresso: ${Math.min(1, countDuelo)}/1 | ${q3Done ? '✅ Concluída (+400g, +100XP)' : '⏳ Em andamento'}
╰───────────────────────────────────────╯
*As recompensas são creditadas automaticamente ao atingir as metas!*`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'dice'
    };
  }

  // --- #DIARIO (Daily Login Streak) ---
  if (command === 'diario' || command === 'daily') {
    const hojeStr = new Date().toISOString().slice(0, 10);
    if (activePlayer.diario.data === hojeStr && activePlayer.diario.coletadoHoje) {
      return {
        messageText: `✅ Você já resgatou sua recompensa diária hoje!
🔥 Sequência atual de login: ${activePlayer.diario.streak} dias seguidos.
Volte amanhã após a meia-noite para mais recompensas!`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'dice'
      };
    }

    // Advance streak
    const novoStreak = activePlayer.diario.data === hojeStr ? activePlayer.diario.streak : activePlayer.diario.streak + 1;
    const bonusMoedas = 150 * Math.min(7, novoStreak);
    const bonusXp = 50 * Math.min(7, novoStreak);

    activePlayer.diario.data = hojeStr;
    activePlayer.diario.streak = novoStreak;
    activePlayer.diario.coletadoHoje = true;
    activePlayer.moedas += bonusMoedas;
    activePlayer.xp += bonusXp;

    // Free energy potion on day 7
    if (novoStreak % 7 === 0) {
      adicionarAoInventario(activePlayer, {
        itemId: 'pocao_energia',
        nome: 'Poção de Energia (+30⚡)',
        quantidade: 1,
        tipo: 'consumivel',
        icone: '⚡',
        precoVenda: 60,
        descricao: 'Restaura +30 de Energia instantaneamente'
      });
    }

    const lvlLogs = checkLevelUp(activePlayer);

    return {
      messageText: `╭───📅 RECOMPENSA DIÁRIA ───╮
🔥 Sequência: ${novoStreak}º dia consecutivo!
💰 Moedas: +${bonusMoedas}
✨ EXP: +${bonusXp}
${novoStreak % 7 === 0 ? '🎁 BÔNUS DE 7 DIAS: 1x Poção de Energia recebida!\n' : ''}
Volte amanhã para manter sua chama acesa!
╰───────────────────────────╯
${lvlLogs.length > 0 ? '\n' + lvlLogs.join('\n') : ''}`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'levelup'
    };
  }

  // --- #USAR <item> (v3.0 Consumíveis, Poções, Elixires & Ferramentas) ---
  if (command === 'usar' || command === 'use') {
    const resUsar = handleUsarV3(activePlayer, args[0] || '', agora);
    return {
      messageText: resUsar.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resUsar.soundType
    };
  }

  // --- #CLA (Sistema de Clãs / Guildas) ---
  if (command === 'cla' || command === 'guilda') {
    const subAction = args[0]?.toLowerCase();

    // List clans
    if (!subAction) {
      if (activePlayer.claId) {
        const meuCla = updatedClansList.find((c) => c.id === activePlayer.claId);
        if (meuCla) {
          return {
            messageText: `╭───🏰 SEU CLÃ: [${meuCla.tag}] ${meuCla.nome} ───╮
👑 Líder: @${meuCla.liderId}
📊 Nível da Guilda: ${meuCla.nivel}
👥 Membros (${meuCla.membrosIds.length}): ${meuCla.membrosIds.map((id) => profilesMap[id.toLowerCase()]?.nome || id).join(', ')}
💰 Cofre do Clã: ${meuCla.moedasBanco.toLocaleString()} moedas
🏆 Vitórias em Guerra: ${meuCla.vitoriasGuerra}
╰────────────────────────────────────────────────╯
*Comandos: #cla doar <valor>*`,
            updatedProfiles: Object.values(profilesMap),
            activeProfileId: activePlayer.id,
            activeParty: updatedParty,
            updatedClans: updatedClansList,
            soundType: 'dice'
          };
        }
      }

      const lista = updatedClansList
        .map((c) => `🏰 [${c.tag}] ${c.nome} (Nv.${c.nivel}) - 👥 ${c.membrosIds.length} membros | 💰 ${c.moedasBanco}g`)
        .join('\n');

      return {
        messageText: `╭───🏰 CLÃS DO REINO ───╮
${lista}
╰───────────────────────╯
*Para fundar um novo clã: #cla criar <Nome do Clã> (Custa 2.000 moedas)*`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        updatedClans: updatedClansList,
        soundType: 'dice'
      };
    }

    // #cla criar <nome>
    if (subAction === 'criar') {
      const nomeCla = args.slice(1).join(' ');
      if (!nomeCla.trim()) {
        return {
          messageText: `❌ Informe o nome do clã! Exemplo: #cla criar Cavaleiros de Ferro`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const custoCla = 2000;
      if (activePlayer.moedas < custoCla) {
        return {
          messageText: `❌ Moedas insuficientes! Fundar um clã custa 2.000 moedas. Saldo: ${activePlayer.moedas}.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      activePlayer.moedas -= custoCla;
      const cleanId = `cla_${Date.now()}`;
      const tag = nomeCla.substring(0, 4).toUpperCase();
      const novoCla: ClanData = {
        id: cleanId,
        nome: nomeCla.trim(),
        tag,
        liderId: activePlayer.id,
        membrosIds: [activePlayer.id],
        nivel: 1,
        moedasBanco: 500,
        vitoriasGuerra: 0,
        criadoEmTimestamp: agora
      };

      updatedClansList.push(novoCla);
      activePlayer.claId = cleanId;

      return {
        messageText: `🎉 CLÃ FUNDADO COM SUCESSO!
🏰 [${tag}] ${nomeCla}
👑 Líder: @${activePlayer.nome}
💰 Depósito inicial no cofre: 500 moedas.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        updatedClans: updatedClansList,
        soundType: 'levelup'
      };
    }

    // #cla doar <valor>
    if (subAction === 'doar') {
      if (!activePlayer.claId) {
        return {
          messageText: `❌ Você não pertence a nenhum clã!`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const valor = parseInt(args[1], 10);
      if (!valor || valor <= 0) {
        return {
          messageText: `❌ Informe um valor válido! Exemplo: #cla doar 100`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      if (activePlayer.moedas < valor) {
        return {
          messageText: `❌ Saldo insuficiente para doação.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }

      const cla = updatedClansList.find((c) => c.id === activePlayer.claId);
      if (cla) {
        activePlayer.moedas -= valor;
        cla.moedasBanco += valor;
        return {
          messageText: `🏰 Você doou ${valor} moedas para o cofre do clã [${cla.tag}]!
💰 Saldo total do clã: ${cla.moedasBanco.toLocaleString()} moedas.`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          updatedClans: updatedClansList,
          soundType: 'success'
        };
      }
    }
  }

  // --- #EQUIPAR <uid|id> (v3.0 Validação de Nível, Durabilidade & Slots) ---
  if (command === 'equipar' || command === 'equip') {
    const dungeonAberta = Boolean(updatedParty && updatedParty.status === 'em_combate');
    const resEquip = handleEquiparV3(activePlayer, args[0] || '', dungeonAberta);
    return {
      messageText: resEquip.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resEquip.soundType
    };
  }

  // --- #DESEQUIPAR <slot> (v3.0 Retorno ao Inventário) ---
  if (command === 'desequipar' || command === 'unequip') {
    const dungeonAberta = Boolean(updatedParty && updatedParty.status === 'em_combate');
    const resDes = handleDesequiparV3(activePlayer, args[0] || '', dungeonAberta);
    return {
      messageText: resDes.messageText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: resDes.soundType
    };
  }

  // --- #STATUS / #PERFIL ---
  if (command === 'status' || command === 'perfil' || command === 'profile') {
    const totalAtk = calculateTotalAttack(activePlayer);
    const totalDef = calculateTotalDefense(activePlayer);
    const eq = activePlayer.equipamentos;

    const petStatus = activePlayer.pet
      ? `${activePlayer.pet.icone} ${activePlayer.pet.nome} (Nv.${activePlayer.pet.nivel}) ${agora < activePlayer.pet.fomeAteTimestamp ? '🍖 Alimentado' : '⚠️ Com Fome'}`
      : 'Nenhum';

    const claStatus = activePlayer.claId
      ? updatedClansList.find((c) => c.id === activePlayer.claId)?.nome || 'Sem Clã'
      : 'Sem Clã';

    const profileText = `╭───👤 PERFIL SHELDOR RPG ───╮
Nome: ${activePlayer.nome} (Nv.${activePlayer.nivel})
❤️ Vida (HP): ${activePlayer.hp}/${activePlayer.hpMax}
⚡ Energia: ${activePlayer.energia}/${activePlayer.energiaMax} (Regen: 30/h)
✨ EXP: ${activePlayer.xp}/${activePlayer.xpProximo}
💰 Moedas: ${activePlayer.moedas.toLocaleString()}
⚔️ Ataque Total: ${totalAtk} (Base ${activePlayer.ataqueBase})
🛡️ Defesa Total: ${totalDef} (Base ${activePlayer.defesaBase})
☣️ Toxicidade: ${activePlayer.toxicidade || 0}/100
🏰 Clã: ${claStatus}
🐾 Mascote: ${petStatus}
🛠️ Ferramenta: ${activePlayer.ferramenta ? `${activePlayer.ferramenta.nome} (${activePlayer.ferramenta.durabilidade}/${activePlayer.ferramenta.durabilidadeMax})` : 'Nenhuma'}
🏆 Vitórias PvP: ${activePlayer.vitoriasPvP} | 💀 Derrotas: ${activePlayer.derrotasPvP}
╰────────────────────────────╯
*Use #equipados para ver todas as peças e bônus de Set.*`;

    return {
      messageText: profileText,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'dice'
    };
  }

  // --- #LOJA ---
  if (command === 'loja' || command === 'shop') {
    return {
      messageText: `╭───🏪 MERCADO DO REINO ───╮
🪵 #comprar picareta_madeira - 150g (Nv.1 | 30 durab)
🪨 #comprar picareta_pedra - 600g (Nv.3 | 60 durab)
🧪 #comprar pocao_cura_p - 60g (Cura 25% HP)
🧪 #comprar pocao_cura_m - 200g (Cura 50% HP)
⚡ #comprar pocao_energia - 150g (+30⚡, limite 3/dia)
🩹 #comprar bandagem - 40g (Cura 10% HP sem toxicidade)
🪨 #comprar pedra_amolar - 350g (Restaura 25% durab de arma/escudo)
📜 #comprar pergaminho_protecao - 1200g (Evita destruição no #encantar)
🎩 #comprar elmo_couro - 200g | 🥋 #comprar armadura_couro - 400g
🗡️ #comprar espada_madeira - 480g | 🛡️ #comprar escudo_madeira - 280g
╰───────────────────────────╯
*Para forjar itens superiores de Ferro, Aço e Mithril: use #forjar <item> ou #fundir <minerio>.*`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'dice'
    };
  }

  // --- #COMPRAR <item> ---
  if (command === 'comprar' || command === 'buy') {
    const itemQuery = args[0]?.toLowerCase().replace(/^#/, '');

    // Comprar Picaretas básicas na loja
    if (itemQuery === 'picareta_madeira' || itemQuery === 'picareta_pedra') {
      const tipo = itemQuery === 'picareta_pedra' ? 'pedra' : 'madeira';
      const cat = CATALOGO_PICARETAS[tipo];
      if (activePlayer.moedas < cat.preco) {
        return {
          messageText: `❌ Moedas insuficientes! A ${cat.nome} custa ${cat.preco}g (Saldo: ${activePlayer.moedas}g).`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }
      activePlayer.moedas -= cat.preco;
      const instPic = criarInstanciaPicareta(tipo);
      adicionarAoInventario(activePlayer, { tipo: 'picareta', instancia: instPic });
      return {
        messageText: `⛏️ Você comprou uma ${instPic.nome}! Ela foi guardada em seu inventário. Equipe com #equipar ${instPic.uid}.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'success'
      };
    }

    // Comprar Consumíveis
    const catCons = CATALOGO_CONSUMIVEIS[itemQuery];
    if (catCons) {
      if (activePlayer.moedas < catCons.preco) {
        return {
          messageText: `❌ Moedas insuficientes! ${catCons.nome} custa ${catCons.preco}g (Saldo: ${activePlayer.moedas}g).`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }
      activePlayer.moedas -= catCons.preco;
      adicionarAoInventario(activePlayer, {
        tipo: 'consumivel',
        itemId: catCons.id,
        nome: catCons.nome,
        quantidade: 1,
        icone: catCons.icone,
        precoVenda: Math.round(catCons.preco * 0.4),
        descricao: catCons.descricao
      });
      return {
        messageText: `🧪 Você comprou 1x ${catCons.nome}! Use com #usar ${catCons.id}.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'success'
      };
    }

    // Comprar Equipamento da loja
    const catEq = CATALOGO_EQUIPAMENTOS[itemQuery];
    if (catEq) {
      if (activePlayer.moedas < catEq.precoBase) {
        return {
          messageText: `❌ Saldo insuficiente! ${catEq.nome} custa ${catEq.precoBase}g (Seu saldo: ${activePlayer.moedas}g).`,
          updatedProfiles: Object.values(profilesMap),
          activeProfileId: activePlayer.id,
          activeParty: updatedParty,
          soundType: 'fumble'
        };
      }
      activePlayer.moedas -= catEq.precoBase;
      const instEq = criarInstanciaEquip(catEq.id, 'comum');
      adicionarAoInventario(activePlayer, { tipo: 'equip', instancia: instEq });
      return {
        messageText: `🛡️ Você comprou ${instEq.nome}! O item foi colocado em seu inventário. Equipe com #equipar ${instEq.uid}.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'success'
      };
    }

    return {
      messageText: `❌ Item '${itemQuery}' não disponível na loja. Digite #loja para ver as opções.`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'fumble'
    };
  }

  // --- #CURAR ---
  if (command === 'curar' || command === 'heal') {
    const custoCura = 50 + activePlayer.nivel * 5;
    if (activePlayer.hp >= activePlayer.hpMax) {
      return {
        messageText: `❤️ Sua vida já está cheia (${activePlayer.hp}/${activePlayer.hpMax} HP)!`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'dice'
      };
    }

    const val = validarCooldownEEnergia(activePlayer.cooldowns.curar, CONFIG.cooldownsSeg.curar, 0, 'A enfermaria');
    if (!val.liberado) {
      return {
        messageText: val.erroTexto!,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    if (activePlayer.moedas < custoCura) {
      return {
        messageText: `❌ Você precisa de ${custoCura} moedas para os curativos da enfermaria.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    activePlayer.moedas -= custoCura;
    activePlayer.hp = activePlayer.hpMax;
    aplicarConsumo('curar', CONFIG.cooldownsSeg.curar, 0);

    return {
      messageText: `✨ Curativos aplicados! Seus ferimentos foram curados e seu HP foi restaurado para ${activePlayer.hpMax} HP!
💰 Custo pago: ${custoCura} moedas.
⏳ Cooldown da enfermaria: 5min.`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'heal'
    };
  }

  // --- #RANKING ---
  if (command === 'ranking' || command === 'top') {
    const sorted = Object.values(profilesMap).sort(
      (a, b) => b.nivel * 1000 + b.vitoriasPvP * 50 - (a.nivel * 1000 + a.vitoriasPvP * 50)
    );

    const rankingText = sorted
      .map(
        (p, idx) =>
          `${idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'} #${idx + 1} ${p.avatar} @${p.nome} - Nv.${p.nivel} | ⚔️ ${p.vitoriasPvP} vitórias | 💰 ${p.moedas}g`
      )
      .join('\n');

    return {
      messageText: `╭───🏆 RANKING DOS GUERREIROS ───╮
${rankingText}
╰────────────────────────────────╯
*Desafie qualquer um com: #duelorpg @Nome*`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'dice'
    };
  }

  // --- #CRIARPERFIL <nome> ---
  if (command === 'criarperfil' || command === 'newprofile') {
    const newName = args[0] ? args.join(' ') : '';
    if (!newName.trim()) {
      return {
        messageText: `❌ Informe o nome do novo guerreiro! Exemplo: #criarperfil Arthur`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    const cleanId = newName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (profilesMap[cleanId]) {
      return {
        messageText: `❌ Já existe um guerreiro com o nome '${newName}'. Escolha outro nome.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    const newProfile = migrarPerfilParaV3({
      id: cleanId,
      nome: newName.trim(),
      donoId: currentUserUid || `user_${cleanId}`,
      avatar: '🗡️',
      nivel: 1,
      xp: 0,
      xpProximo: 100,
      hp: 180,
      hpMax: 180,
      ataqueBase: 22,
      defesaBase: 12,
      energia: 100,
      energiaMax: 100,
      ultimaAtualizacaoEnergia: agora,
      moedas: 500,
      vitoriasPvP: 0,
      derrotasPvP: 0,
      dungeonsCompletadas: 0,
      ferramenta: criarInstanciaPicareta('madeira'),
      equipamentos: {
        elmo: criarInstanciaEquip('elmo_couro', 'comum'),
        armadura: criarInstanciaEquip('armadura_couro', 'comum'),
        calca: criarInstanciaEquip('calca_couro', 'comum'),
        botas: criarInstanciaEquip('botas_couro', 'comum'),
        arma: criarInstanciaEquip('espada_madeira', 'comum'),
        escudo: null
      },
      inventario: [
        { uid: 'inv_new_1', itemId: 'pedra', nome: 'Pedra Rústica', quantidade: 5, tipo: 'material', icone: '🪨', precoVenda: 15 },
        { uid: 'inv_new_2', itemId: 'pocao_cura_p', nome: 'Poção de Cura P', quantidade: 2, tipo: 'consumivel', icone: '🧪', precoVenda: 25 }
      ],
      bauEspera: [],
      buffs: [],
      toxicidade: 0,
      ultimaAtualizacaoToxicidade: agora,
      elixires: { vitalidade: 0, poder: 0, guarda: 0 },
      cooldowns: {
        mine: 0,
        trabalhar: 0,
        arena: 0,
        duelo: 0,
        dungeon: 0,
        curar: 0,
        consertar: 0,
        forjar: 0,
        fundir: 0,
        encantar: 0,
        pocaoCura: 0,
        roleta: 0,
        petTreinar: 0
      },
      contadores24h: {
        mine: [],
        trabalhar: [],
        pocoesCura: [],
        roletaContador: 0,
        duelosPorOponente: {}
      },
      diario: {
        data: new Date().toISOString().slice(0, 10),
        streak: 1,
        coletadoHoje: false,
        pocoesEnergiaCompradas: 0,
        pocoesCuraUsadasHoje: 0,
        questsConcluidas: []
      },
      pet: null,
      claId: null
    });

    profilesMap[cleanId] = newProfile;

    return {
      messageText: `🎉 Novo guerreiro '@${newName}' forjado com sucesso!
Para jogar com ele, digite: #trocarperfil ${newName}
Ou desafie-o para um duelo com: #duelorpg @${newName}`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: cleanId,
      activeParty: updatedParty,
      soundType: 'levelup'
    };
  }

  // --- #TROCARPERFIL <nome> ---
  if (command === 'trocarperfil' || command === 'switchprofile') {
    const targetQuery = args[0] ? args.join(' ').toLowerCase().replace(/^@/, '') : '';
    if (!targetQuery) {
      const nomes = Object.values(profilesMap).map((p) => `@${p.nome}`).join(', ');
      return {
        messageText: `Perfis disponíveis: ${nomes}\nExemplo de uso: #trocarperfil Nunesjj`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'dice'
      };
    }

    const matched = Object.values(profilesMap).find(
      (p) => p.id === targetQuery || p.nome.toLowerCase() === targetQuery
    );

    if (!matched) {
      return {
        messageText: `❌ Perfil '${targetQuery}' não encontrado. Crie um com #criarperfil <nome>.`,
        updatedProfiles: Object.values(profilesMap),
        activeProfileId: activePlayer.id,
        activeParty: updatedParty,
        soundType: 'fumble'
      };
    }

    return {
      messageText: `🔄 Perfil ativo alterado para '${matched.nome}' (Nv.${matched.nivel})! Suas ações e comandos agora controlam este guerreiro.`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: matched.id,
      activeParty: updatedParty,
      soundType: 'success'
    };
  }

  // --- #RESETAR (Reiniciar Perfil do Zero) ---
  if (command === 'resetar' || command === 'reiniciar' || command === 'reset') {
    const freshProfile = migrarPerfilParaV3({
      id: activePlayer.id,
      nome: activePlayer.nome,
      donoId: activePlayer.donoId || currentUserUid || `user_${activePlayer.id}`,
      avatar: activePlayer.avatar || '🗡️',
      nivel: 1,
      xp: 0,
      xpProximo: 100,
      hp: 180,
      hpMax: 180,
      ataqueBase: 22,
      defesaBase: 12,
      energia: 100,
      energiaMax: 100,
      ultimaAtualizacaoEnergia: agora,
      moedas: 500,
      vitoriasPvP: 0,
      derrotasPvP: 0,
      dungeonsCompletadas: 0,
      ferramenta: criarInstanciaPicareta('madeira'),
      equipamentos: {
        elmo: criarInstanciaEquip('elmo_couro', 'comum'),
        armadura: criarInstanciaEquip('armadura_couro', 'comum'),
        calca: criarInstanciaEquip('calca_couro', 'comum'),
        botas: criarInstanciaEquip('botas_couro', 'comum'),
        arma: criarInstanciaEquip('espada_madeira', 'comum'),
        escudo: null
      },
      inventario: [
        { uid: 'inv_res_1', tipo: 'material', itemId: 'pedra', nome: 'Pedra Rústica', quantidade: 5, icone: '🪨', precoVenda: 15 },
        { uid: 'inv_res_2', tipo: 'consumivel', itemId: 'pocao_cura_p', nome: 'Poção de Cura P', quantidade: 2, icone: '🧪', precoVenda: 25 }
      ],
      bauEspera: [],
      buffs: [],
      toxicidade: 0,
      ultimaAtualizacaoToxicidade: agora,
      elixires: { vitalidade: 0, poder: 0, guarda: 0 },
      cooldowns: {
        mine: 0,
        trabalhar: 0,
        arena: 0,
        duelo: 0,
        dungeon: 0,
        curar: 0,
        consertar: 0,
        forjar: 0,
        fundir: 0,
        encantar: 0,
        pocaoCura: 0,
        roleta: 0,
        petTreinar: 0
      },
      contadores24h: {
        mine: [],
        trabalhar: [],
        pocoesCura: [],
        roletaContador: 0,
        duelosPorOponente: {}
      },
      diario: {
        data: new Date().toISOString().slice(0, 10),
        streak: 1,
        coletadoHoje: false,
        pocoesEnergiaCompradas: 0,
        pocoesCuraUsadasHoje: 0,
        questsConcluidas: []
      },
      pet: null,
      claId: null
    });

    profilesMap[activePlayer.id] = freshProfile;

    return {
      messageText: `🔄 Personagem '@${activePlayer.nome}' foi REINICIADO DO ZERO!
✨ Nível 1 | 💰 500 moedas | 🪵 Picareta de Madeira | 🥋 Equipamentos de Couro Iniciais.`,
      updatedProfiles: Object.values(profilesMap),
      activeProfileId: activePlayer.id,
      activeParty: updatedParty,
      soundType: 'levelup'
    };
  }

  // Unknown command fallback
  return {
    messageText: `❌ Comando não encontrado! Tente #menu para ver todos os comandos disponíveis no Sheldor RPG.`,
    updatedProfiles: Object.values(profilesMap),
    activeProfileId: activePlayer.id,
    activeParty: updatedParty,
    soundType: 'fumble'
  };
}

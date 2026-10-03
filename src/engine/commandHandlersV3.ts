import {
  CONFIG,
  CONFIG_ITENS,
  CATALOGO_EQUIPAMENTOS,
  CATALOGO_PICARETAS,
  CATALOGO_CONSUMIVEIS,
  RECEITAS_FUNDICAO,
  RECEITAS_FORJA,
  MATERIAIS_CATALOGO,
  criarInstanciaEquip,
  criarInstanciaPicareta
} from './gameData';
import {
  EquipSlot,
  InstanciaEquip,
  InstanciaPicareta,
  ItemInventario,
  PlayerProfile,
  Raridade
} from '../types/rpgBot';
import {
  adicionarAoInventario,
  calcularPoderTotal,
  repararItem,
  atualizarToxicidadeEBuffs
} from './itemSystemV3';

export function handleMineV3(activePlayer: PlayerProfile, agora: number): { messageText: string; soundType: 'dice' | 'fumble' | 'success' } {
  if (!activePlayer.ferramenta) {
    return {
      messageText: `❌ Você precisa equipar uma picareta para minerar! Adquira uma na #loja.`,
      soundType: 'fumble'
    };
  }

  const pic = activePlayer.ferramenta;
  if (pic.durabilidade <= 0) {
    return {
      messageText: `💥 Sua ${pic.nome} está quebrada (0/${pic.durabilidadeMax} durabilidade)! Use #consertar picareta para repará-la.`,
      soundType: 'fumble'
    };
  }

  if (activePlayer.nivel < pic.nivelMin) {
    return {
      messageText: `❌ Nível insuficiente! A ${pic.nome} requer Nível ${pic.nivelMin}+. Seu nível: ${activePlayer.nivel}.`,
      soundType: 'fumble'
    };
  }

  // Check buff de foco (-25% cd)
  const temBuffFoco = Array.isArray(activePlayer.buffs) && activePlayer.buffs.some((b) => b.tipo === 'foco' && b.expiraEm > agora);
  const cdEfetivo = Math.max(
    CONFIG_ITENS.cooldownMinimoMineSeg,
    Math.round(CONFIG.cooldownsSeg.mine * (1 - pic.reducaoCd) * (temBuffFoco ? 0.75 : 1.0))
  );

  const tempoPassado = Math.floor((agora - (activePlayer.cooldowns.mine || 0)) / 1000);
  if (tempoPassado < cdEfetivo) {
    const restante = cdEfetivo - tempoPassado;
    return {
      messageText: `⏳ Suas mãos ainda estão cansadas! Aguarde ${restante}s para minerar novamente.`,
      soundType: 'fumble'
    };
  }

  if (activePlayer.energia < CONFIG.custoEnergia.mine) {
    return {
      messageText: `⚡ Energia insuficiente! Minerar requer ${CONFIG.custoEnergia.mine}⚡ (Você tem ${activePlayer.energia}/${activePlayer.energiaMax}). Descanse ou use uma poção.`,
      soundType: 'fumble'
    };
  }

  // Deduct
  activePlayer.energia -= CONFIG.custoEnergia.mine;
  activePlayer.cooldowns.mine = agora;
  pic.durabilidade = Math.max(0, pic.durabilidade - 1);
  const quebrou = pic.durabilidade <= 0;

  // Fatigue window 24h
  activePlayer.contadores24h.mine = activePlayer.contadores24h.mine.filter((t) => agora - t < 86400000);
  activePlayer.contadores24h.mine.push(agora);
  const total24h = activePlayer.contadores24h.mine.length;

  let multFadiga = 1.0;
  for (const f of CONFIG.fadigaMine) {
    if (total24h <= f.ate) {
      multFadiga = f.mult;
      break;
    }
  }

  // Buff de sorte (+25% em raros)
  const temBuffSorte = Array.isArray(activePlayer.buffs) && activePlayer.buffs.some((b) => b.tipo === 'sorte' && b.expiraEm > agora);
  const multSorte = temBuffSorte ? 1.25 : 1.0;

  const baseMoedas = Math.floor(120 + Math.random() * 81);
  const moedasGanhas = Math.max(1, Math.round((baseMoedas + activePlayer.nivel * 8) * pic.multMoedas * multFadiga * multSorte));
  activePlayer.moedas += moedasGanhas;
  activePlayer.xp += Math.max(2, Math.round(15 * multFadiga));

  // Sorteio de drop por picareta
  const roll = Math.random() * 100;
  let dropItem: { id: string; nome: string; icone: string; qtd: number } | null = null;

  if (pic.tipo === 'madeira') {
    if (roll < 70) dropItem = { id: 'pedra', nome: 'Pedra Rústica', icone: '🪨', qtd: 2 };
    else if (roll < 95) dropItem = { id: 'carvao', nome: 'Carvão Mineral', icone: '🪨', qtd: 2 };
  } else if (pic.tipo === 'pedra') {
    if (roll < 45) dropItem = { id: 'pedra', nome: 'Pedra Rústica', icone: '🪨', qtd: 2 };
    else if (roll < 65) dropItem = { id: 'carvao', nome: 'Carvão Mineral', icone: '🪨', qtd: 2 };
    else if (roll < 95) dropItem = { id: 'minerio_ferro', nome: 'Minério de Ferro', icone: '⛏️', qtd: 2 };
  } else if (pic.tipo === 'ferro') {
    if (roll < 25) dropItem = { id: 'pedra', nome: 'Pedra Rústica', icone: '🪨', qtd: 2 };
    else if (roll < 30) dropItem = { id: 'carvao', nome: 'Carvão Mineral', icone: '🪨', qtd: 2 };
    else if (roll < 70) dropItem = { id: 'minerio_ferro', nome: 'Minério de Ferro', icone: '⛏️', qtd: 2 };
    else if (roll < 95) dropItem = { id: 'minerio_ouro', nome: 'Minério de Ouro', icone: '✨', qtd: 1 };
    else if (roll < 99) dropItem = { id: 'gema_bruta', nome: 'Gema Bruta de Encantamento', icone: '💎', qtd: 1 };
  } else if (pic.tipo === 'ouro') {
    if (roll < 10) dropItem = { id: 'pedra', nome: 'Pedra Rústica', icone: '🪨', qtd: 2 };
    else if (roll < 35) dropItem = { id: 'minerio_ferro', nome: 'Minério de Ferro', icone: '⛏️', qtd: 2 };
    else if (roll < 80) dropItem = { id: 'minerio_ouro', nome: 'Minério de Ouro', icone: '✨', qtd: 1 };
    else if (roll < 95) dropItem = { id: 'gema_bruta', nome: 'Gema Bruta de Encantamento', icone: '💎', qtd: 1 };
  } else if (pic.tipo === 'diamante') {
    if (roll < 10) dropItem = { id: 'pedra', nome: 'Pedra Rústica', icone: '🪨', qtd: 2 };
    else if (roll < 30) dropItem = { id: 'minerio_ferro', nome: 'Minério de Ferro', icone: '⛏️', qtd: 2 };
    else if (roll < 65) dropItem = { id: 'minerio_ouro', nome: 'Minério de Ouro', icone: '✨', qtd: 1 };
    else if (roll < 85) dropItem = { id: 'gema_bruta', nome: 'Gema Bruta de Encantamento', icone: '💎', qtd: 1 };
    else if (roll < 95) dropItem = { id: 'diamante_bruto', nome: 'Diamante Bruto', icone: '💠', qtd: 1 };
  }

  let dropMsg = 'Nenhum minério encontrado';
  if (dropItem) {
    const qtdEfetiva = Math.max(1, Math.floor(dropItem.qtd * multFadiga));
    const matCat = MATERIAIS_CATALOGO[dropItem.id];
    adicionarAoInventario(activePlayer, {
      tipo: 'material',
      itemId: dropItem.id,
      nome: dropItem.nome,
      quantidade: qtdEfetiva,
      icone: dropItem.icone,
      precoVenda: matCat ? matCat.precoVenda : 15
    });
    dropMsg = `${dropItem.icone} ${dropItem.nome} x${qtdEfetiva}`;
  }

  let quebraAviso = '';
  if (quebrou) {
    quebraAviso = `\n💥 Atenção: Sua ${pic.nome} quebrou! Conserte com #consertar picareta.`;
  }

  return {
    messageText: `⛏️ Você minerou com a ${pic.nome}!
💰 +${moedasGanhas} moedas
${dropMsg}
🔧 Durabilidade: ${pic.durabilidade}/${pic.durabilidadeMax}
⚡ Energia: ${activePlayer.energia}/${activePlayer.energiaMax}${quebraAviso}`,
    soundType: 'dice'
  };
}

export function encontrarMaterialOuConsumivel(player: PlayerProfile, itemId: string) {
  return player.inventario.find(
    (i): i is Extract<ItemInventario, { tipo: 'material' | 'consumivel' }> =>
      (i.tipo === 'material' || i.tipo === 'consumivel') && i.itemId === itemId
  );
}

export function handleFundirV3(
  activePlayer: PlayerProfile,
  minerioArg: string,
  qtdArg: string,
  agora: number
): { messageText: string; soundType: 'success' | 'fumble' } {
  const chave = minerioArg?.toLowerCase();
  const receita = RECEITAS_FUNDICAO[chave];
  if (!receita) {
    return {
      messageText: `❌ Minério ou receita inválida! Opções: ferro, aco, ouro, mithril.
Exemplo: #fundir ferro 5 ou #fundir aco 2`,
      soundType: 'fumble'
    };
  }

  const qtd = Math.min(20, Math.max(1, parseInt(qtdArg) || 1));
  const tempoPassado = Math.floor((agora - (activePlayer.cooldowns.fundir || 0)) / 1000);
  if (tempoPassado < CONFIG.cooldownsSeg.fundir) {
    return {
      messageText: `⏳ A fornalha ainda está superaquecida! Aguarde ${CONFIG.cooldownsSeg.fundir - tempoPassado}s para fundir novamente.`,
      soundType: 'fumble'
    };
  }

  // Validar materiais
  const minReq = receita.minerioQtd * qtd;
  const carvaoReq = receita.carvaoQtd * qtd;
  const extraReq = (receita.adicionalQtd || 0) * qtd;

  const itemMinerio = encontrarMaterialOuConsumivel(activePlayer, receita.minerioId);
  const itemCarvao = receita.carvaoQtd > 0 ? encontrarMaterialOuConsumivel(activePlayer, 'carvao') : null;
  const itemExtra = receita.adicionalId ? encontrarMaterialOuConsumivel(activePlayer, receita.adicionalId) : null;

  if (!itemMinerio || itemMinerio.quantidade < minReq) {
    return {
      messageText: `❌ Materiais insuficientes! Para fundir ${qtd}x ${receita.resultadoNome} você precisa de ${minReq}x de ${receita.minerioId} (Você tem ${itemMinerio?.quantidade || 0}).`,
      soundType: 'fumble'
    };
  }

  if (receita.carvaoQtd > 0 && (!itemCarvao || itemCarvao.quantidade < carvaoReq)) {
    return {
      messageText: `❌ Carvão insuficiente! Requer ${carvaoReq}x Carvão Mineral para queimar na fornalha.`,
      soundType: 'fumble'
    };
  }

  if (receita.adicionalId && (!itemExtra || itemExtra.quantidade < extraReq)) {
    return {
      messageText: `❌ Ingrediente especial insuficiente! Requer ${extraReq}x ${receita.adicionalId}.`,
      soundType: 'fumble'
    };
  }

  // Consumir
  itemMinerio.quantidade -= minReq;
  if (itemCarvao) itemCarvao.quantidade -= carvaoReq;
  if (itemExtra) itemExtra.quantidade -= extraReq;

  activePlayer.inventario = activePlayer.inventario.filter(
    (i) => i.tipo !== 'material' || i.quantidade > 0
  );

  activePlayer.cooldowns.fundir = agora;

  const matCat = MATERIAIS_CATALOGO[receita.resultadoId];
  adicionarAoInventario(activePlayer, {
    tipo: 'material',
    itemId: receita.resultadoId,
    nome: receita.resultadoNome,
    quantidade: qtd,
    icone: receita.resultadoIcone,
    precoVenda: matCat ? matCat.precoVenda : 120
  });

  return {
    messageText: `🔥 ${receita.resultadoIcone} Fundição concluída com sucesso!
Foram forjados ${qtd}x ${receita.resultadoNome}.
Os lingotes foram guardados em seu inventário.`,
    soundType: 'success'
  };
}

export function handleForjarV3(
  activePlayer: PlayerProfile,
  itemArg: string,
  agora: number
): { messageText: string; soundType: 'success' | 'fumble' } {
  const chave = itemArg?.toLowerCase();
  const receita = RECEITAS_FORJA[chave];
  if (!receita) {
    return {
      messageText: `❌ Receita de forja não encontrada!
Use #loja ou confira as opções: picareta_ferro, picareta_ouro, picareta_diamante, espada_ferro, armadura_ferro, espada_aco, etc.`,
      soundType: 'fumble'
    };
  }

  if (activePlayer.nivel < receita.nivelMin) {
    return {
      messageText: `❌ Nível insuficiente para forjar ${receita.nome}! Requer Nível ${receita.nivelMin}+.`,
      soundType: 'fumble'
    };
  }

  const tempoPassado = Math.floor((agora - (activePlayer.cooldowns.forjar || 0)) / 1000);
  if (tempoPassado < CONFIG.cooldownsSeg.forjar) {
    return {
      messageText: `⏳ A bigorna ainda está resfriando! Aguarde ${CONFIG.cooldownsSeg.forjar - tempoPassado}s para forjar novamente.`,
      soundType: 'fumble'
    };
  }

  if (activePlayer.energia < CONFIG.custoEnergia.forjar) {
    return {
      messageText: `⚡ Energia insuficiente! Forjar consome ${CONFIG.custoEnergia.forjar}⚡ (Você tem ${activePlayer.energia}/${activePlayer.energiaMax}).`,
      soundType: 'fumble'
    };
  }

  if (activePlayer.moedas < receita.moedas) {
    return {
      messageText: `💰 Moedas insuficientes! A forja cobra ${receita.moedas}g (Seu saldo: ${activePlayer.moedas}g).`,
      soundType: 'fumble'
    };
  }

  // Validar lingotes
  if (receita.lingoteId && receita.lingoteQtd) {
    const lingItem = encontrarMaterialOuConsumivel(activePlayer, receita.lingoteId);
    if (!lingItem || lingItem.quantidade < receita.lingoteQtd) {
      return {
        messageText: `❌ Lingotes insuficientes! Requer ${receita.lingoteQtd}x ${receita.lingoteId} (Você tem ${lingItem?.quantidade || 0}).`,
        soundType: 'fumble'
      };
    }
  }

  // Validar materiais extras
  if (receita.materiaisExtras) {
    for (const m of receita.materiaisExtras) {
      const extraItem = encontrarMaterialOuConsumivel(activePlayer, m.itemId);
      if (!extraItem || extraItem.quantidade < m.qtd) {
        return {
          messageText: `❌ Material extra insuficiente: Requer ${m.qtd}x ${m.itemId}.`,
          soundType: 'fumble'
        };
      }
    }
  }

  // Consumir
  activePlayer.energia -= CONFIG.custoEnergia.forjar;
  activePlayer.moedas -= receita.moedas;
  activePlayer.cooldowns.forjar = agora;

  if (receita.lingoteId && receita.lingoteQtd) {
    const lingItem = encontrarMaterialOuConsumivel(activePlayer, receita.lingoteId)!;
    lingItem.quantidade -= receita.lingoteQtd;
  }

  if (receita.materiaisExtras) {
    for (const m of receita.materiaisExtras) {
      const extraItem = encontrarMaterialOuConsumivel(activePlayer, m.itemId)!;
      extraItem.quantidade -= m.qtd;
    }
  }

  activePlayer.inventario = activePlayer.inventario.filter(
    (i) => i.tipo !== 'material' || i.quantidade > 0
  );

  // Chance de qualidade superior: 10% de subir raridade
  let raridade: Raridade = 'comum';
  const rollQualidade = Math.random();
  if (rollQualidade < 0.1) {
    raridade = 'incomum';
  }

  if (receita.tipo === 'picareta') {
    const picTipo = receita.resultadoId as any;
    const instPic = criarInstanciaPicareta(picTipo);
    adicionarAoInventario(activePlayer, { tipo: 'picareta', instancia: instPic });
    return {
      messageText: `⚒️ ${instPic.icone} Você forjou com perfeição uma ${instPic.nome}!
Durabilidade: ${instPic.durabilidade}/${instPic.durabilidadeMax} | Bônus: +${Math.round((instPic.multMoedas - 1) * 100)}% moedas.
Equipe com #equipar ${instPic.uid}`,
      soundType: 'success'
    };
  } else {
    const instEq = criarInstanciaEquip(receita.resultadoId, raridade);
    adicionarAoInventario(activePlayer, { tipo: 'equip', instancia: instEq });
    const qualMsg = raridade !== 'comum' ? `🌟 BÔNUS DE QUALIDADE: A peça veio com raridade ${raridade.toUpperCase()}!` : '';
    return {
      messageText: `⚒️ ${instEq.icone} Forja concluída!
Item criado: ${instEq.nome} [${CONFIG_ITENS.raridade[instEq.raridade].label}]
Durabilidade: ${instEq.durabilidade}/${instEq.durabilidadeMax}
${qualMsg}
Equipe digitando #equipar ${instEq.uid}`,
      soundType: 'success'
    };
  }
}

export function handleConsertarV3(
  activePlayer: PlayerProfile,
  alvoArg: string,
  agora: number
): { messageText: string; soundType: 'success' | 'fumble' } {
  const alvo = alvoArg?.toLowerCase();

  // Consertar Picareta
  if (alvo === 'picareta' || alvo === 'ferramenta') {
    if (!activePlayer.ferramenta) {
      return { messageText: `❌ Nenhuma picareta equipada para consertar.`, soundType: 'fumble' };
    }
    const pic = activePlayer.ferramenta;
    if (pic.durabilidade >= pic.durabilidadeMax) {
      return { messageText: `🔧 Sua ${pic.nome} já está com a durabilidade cheia (${pic.durabilidade}/${pic.durabilidadeMax})!`, soundType: 'fumble' };
    }

    const cat = CATALOGO_PICARETAS[pic.tipo];
    const precoBase = cat ? cat.preco : 1000;
    const custo = Math.ceil(precoBase * 0.3 * ((pic.durabilidadeMax - pic.durabilidade) / pic.durabilidadeMax) * (pic.durabilidade <= 0 ? 1.25 : 1.0));

    if (activePlayer.moedas < custo) {
      return { messageText: `💰 Moedas insuficientes! Consertar a ${pic.nome} custa ${custo}g (Seu saldo: ${activePlayer.moedas}g).`, soundType: 'fumble' };
    }

    activePlayer.moedas -= custo;
    const piso = Math.floor(pic.durabilidadeOriginal * CONFIG_ITENS.reparo.pisoDurabMax);
    pic.durabilidadeMax = Math.max(piso, Math.floor(pic.durabilidadeMax * (1 - CONFIG_ITENS.reparo.perdaDurabMax)));
    pic.durabilidade = pic.durabilidadeMax;
    pic.reparos += 1;
    activePlayer.cooldowns.consertar = agora;

    return {
      messageText: `🛠️ ${pic.nome} consertada com sucesso!
💰 Custo pago: ${custo} moedas.
🔧 Durabilidade restaurada para ${pic.durabilidade}/${pic.durabilidadeMax}.
⚠️ Desgaste estrutural permanente: -3% da durabilidade máxima (Piso: ${piso}).`,
      soundType: 'success'
    };
  }

  // Consertar Tudo
  if (alvo === 'tudo' || alvo === 'all') {
    const slots = ['elmo', 'armadura', 'calca', 'botas', 'arma', 'escudo'] as EquipSlot[];
    let totalCusto = 0;
    const pecasConsertadas: string[] = [];

    slots.forEach((s) => {
      const eq = activePlayer.equipamentos[s];
      if (eq && eq.durabilidade < eq.durabilidadeMax) {
        const cat = CATALOGO_EQUIPAMENTOS[eq.itemId];
        const precoBase = cat ? cat.precoBase : 1000;
        const multRar = CONFIG_ITENS.raridade[eq.raridade]?.preco || 1.0;
        const c = repararItem(eq, precoBase, multRar);
        totalCusto += c;
        pecasConsertadas.push(eq.nome);
      }
    });

    if (activePlayer.ferramenta && activePlayer.ferramenta.durabilidade < activePlayer.ferramenta.durabilidadeMax) {
      const pic = activePlayer.ferramenta;
      const cat = CATALOGO_PICARETAS[pic.tipo];
      const precoBase = cat ? cat.preco : 1000;
      const c = repararItem(pic, precoBase, 1.0);
      totalCusto += c;
      pecasConsertadas.push(pic.nome);
    }

    if (pecasConsertadas.length === 0) {
      return { messageText: `✨ Todos os seus equipamentos e ferramentas já estão com durabilidade máxima!`, soundType: 'success' };
    }

    // Taxa de conveniência de +10%
    const custoFinal = Math.ceil(totalCusto * 1.1);
    if (activePlayer.moedas < custoFinal) {
      return { messageText: `💰 Moedas insuficientes! Consertar todo o equipamento custa ${custoFinal}g (incluindo taxa de conveniência de +10%). Saldo: ${activePlayer.moedas}g.`, soundType: 'fumble' };
    }

    activePlayer.moedas -= custoFinal;
    activePlayer.cooldowns.consertar = agora;

    return {
      messageText: `🛠️ Reparo Geral Concluído!
Peças restauradas (${pecasConsertadas.length}): ${pecasConsertadas.join(', ')}.
💰 Custo total pago: ${custoFinal} moedas (taxa +10% inclusa).
⚠️ Durabilidade máxima de cada peça reparada reduziu em 3%.`,
      soundType: 'success'
    };
  }

  // Consertar Slot Específico
  const slot = alvo as EquipSlot;
  const eq = activePlayer.equipamentos[slot];
  if (!eq) {
    return { messageText: `❌ Nenhum equipamento equipado no slot '${alvoArg}'. Slots: elmo, armadura, calca, botas, arma, escudo, picareta, tudo.`, soundType: 'fumble' };
  }

  if (eq.durabilidade >= eq.durabilidadeMax) {
    return { messageText: `🛡️ ${eq.nome} já está com durabilidade cheia (${eq.durabilidade}/${eq.durabilidadeMax})!`, soundType: 'fumble' };
  }

  const cat = CATALOGO_EQUIPAMENTOS[eq.itemId];
  const precoBase = cat ? cat.precoBase : 1000;
  const multRar = CONFIG_ITENS.raridade[eq.raridade]?.preco || 1.0;
  const custo = repararItem(eq, precoBase, multRar);

  if (activePlayer.moedas < custo) {
    return { messageText: `💰 Saldo insuficiente! Consertar ${eq.nome} custa ${custo}g (Você tem ${activePlayer.moedas}g).`, soundType: 'fumble' };
  }

  activePlayer.moedas -= custo;
  activePlayer.cooldowns.consertar = agora;

  return {
    messageText: `🛠️ ${eq.nome} reparado(a)!
💰 Custo pago: ${custo} moedas.
🔧 Durabilidade: ${eq.durabilidade}/${eq.durabilidadeMax}.
⚠️ Durabilidade máxima reduziu em 3% pelo desgaste da forja.`,
    soundType: 'success'
  };
}

export function handleEncantarV3(
  activePlayer: PlayerProfile,
  slotArg: string,
  agora: number
): { messageText: string; soundType: 'success' | 'fumble' | 'dice' } {
  const slot = slotArg?.toLowerCase() as EquipSlot;
  const item = activePlayer.equipamentos[slot];
  if (!slot || !item) {
    return {
      messageText: `❌ Especifique um slot com equipamento equipado! Exemplo: #encantar arma ou #encantar armadura.
Slots: elmo, armadura, calca, botas, arma, escudo.`,
      soundType: 'fumble'
    };
  }

  const tempoPassado = Math.floor((agora - (activePlayer.cooldowns.encantar || 0)) / 1000);
  if (tempoPassado < CONFIG.cooldownsSeg.encantar) {
    return {
      messageText: `⏳ A forja arcana ainda está emanando calor! Aguarde ${CONFIG.cooldownsSeg.encantar - tempoPassado}s.`,
      soundType: 'fumble'
    };
  }

  const nivelAtual = item.encantamento || 0;
  if (nivelAtual >= 5) {
    return {
      messageText: `✨ ${item.nome} já atingiu o nível máximo de encantamento (+5)!`,
      soundType: 'dice'
    };
  }

  const gemasReq = 2 + nivelAtual;
  const ouroReq = 3;

  const itemGema = activePlayer.inventario.find((i) => i.tipo === 'material' && (i as any).itemId === 'gema_bruta') as any;
  const itemOuro = activePlayer.inventario.find((i) => i.tipo === 'material' && (i as any).itemId === 'minerio_ouro') as any;

  if (!itemGema || itemGema.quantidade < gemasReq) {
    return {
      messageText: `❌ Gemas insuficientes! Para tentar encantar para +${nivelAtual + 1}, você precisa de ${gemasReq}x Gema Bruta (Você tem ${itemGema?.quantidade || 0}). Minere nas jazidas (#mine) para conseguir.`,
      soundType: 'fumble'
    };
  }

  if (!itemOuro || itemOuro.quantidade < ouroReq) {
    return {
      messageText: `❌ Minério de Ouro insuficiente! Requer ${ouroReq}x Minério de Ouro condutor (Você tem ${itemOuro?.quantidade || 0}).`,
      soundType: 'fumble'
    };
  }

  // Consumir
  itemGema.quantidade -= gemasReq;
  itemOuro.quantidade -= ouroReq;
  activePlayer.inventario = activePlayer.inventario.filter(
    (i) => i.tipo !== 'material' || (i as any).quantidade > 0
  );
  activePlayer.cooldowns.encantar = agora;

  const chances = CONFIG_ITENS.encantamento.chances;
  const chance = chances[nivelAtual] || 0.2;
  const sucesso = Math.random() < chance;

  if (sucesso) {
    item.encantamento = nivelAtual + 1;
    return {
      messageText: `✨ SUCESSO LUZENTE!
${item.icone} Seu ${item.nome} foi encantado para +${item.encantamento}!
Bônus ampliado em +${item.encantamento * 8}% de poder.`,
      soundType: 'success'
    };
  } else {
    // Falha
    let quebrouPeca = false;
    let protegidoPorPergaminho = false;

    if (nivelAtual >= 2) {
      // Nível alvo é +3, +4 ou +5
      const chanceQuebra = CONFIG_ITENS.encantamento.chanceQuebra[nivelAtual] || 0.15;
      if (Math.random() < chanceQuebra) {
        // Verificar Pergaminho de Proteção
        const idxPerg = activePlayer.inventario.findIndex((i) => i.tipo === 'consumivel' && i.itemId === 'pergaminho_protecao');
        if (idxPerg >= 0) {
          const perg = activePlayer.inventario[idxPerg] as any;
          perg.quantidade -= 1;
          if (perg.quantidade <= 0) activePlayer.inventario.splice(idxPerg, 1);
          protegidoPorPergaminho = true;
        } else {
          quebrouPeca = true;
          activePlayer.equipamentos[slot] = null;
        }
      }
    }

    if (quebrouPeca) {
      return {
        messageText: `💥 FALHA CRÍTICA CATASTRÓFICA!
A energia arcana desestabilizou e seu ${item.nome} DESINTEGROU-SE em cinzas!
(Use Pergaminho de Proteção para evitar perdas futuras em encantamentos +3 ou superior).`,
        soundType: 'fumble'
      };
    }

    if (protegidoPorPergaminho) {
      return {
        messageText: `🛡️ O encantamento falhou, mas seu Pergaminho de Proteção Arcana absorveu o choque e evitou a destruição do ${item.nome}!
Os materiais foram consumidos.`,
        soundType: 'dice'
      };
    }

    return {
      messageText: `💨 O encantamento falhou! Os materiais foram consumidos pela forja arcana, mas o equipamento permaneceu intacto em +${nivelAtual}.`,
      soundType: 'fumble'
    };
  }
}

export function handleUsarV3(
  activePlayer: PlayerProfile,
  itemArg: string,
  agora: number
): { messageText: string; soundType: 'heal' | 'success' | 'fumble' } {
  const chave = itemArg?.toLowerCase();
  atualizarToxicidadeEBuffs(activePlayer, agora);

  // 1. Procurar no inventário
  const idx = activePlayer.inventario.findIndex(
    (i) => i.tipo === 'consumivel' && (i.itemId.toLowerCase() === chave || i.nome.toLowerCase().includes(chave))
  );

  if (idx < 0) {
    return {
      messageText: `❌ Você não possui o item '${itemArg}' em seu inventário. Digite #inventario para ver seus consumíveis.`,
      soundType: 'fumble'
    };
  }

  const itemInv = activePlayer.inventario[idx] as any;
  const itemId = itemInv.itemId;
  const cat = CATALOGO_CONSUMIVEIS[itemId];

  if (activePlayer.nivel < (cat?.nivelMin || 1)) {
    return {
      messageText: `❌ Nível insuficiente para usar ${itemInv.nome}! Requer Nível ${cat?.nivelMin}+.`,
      soundType: 'fumble'
    };
  }

  // Trava de Toxicidade: se envenenado (= 100), bloqueia poções
  if (activePlayer.toxicidade >= CONFIG_ITENS.toxicidade.envenenado && cat?.categoria !== 'util') {
    return {
      messageText: `☣️ SEU CORPO ESTÁ COMPLETAMENTE ENVENENADO (100/100 Toxicidade)!
Você não pode ingerir mais poções até que a toxicidade decaia abaixo de 50. Descanse ou use um Elixir Supremo.`,
      soundType: 'fumble'
    };
  }

  // Poções de Cura
  if (itemId.startsWith('pocao_cura_') || itemId === 'elixir_supremo') {
    const tempoPassado = Math.floor((agora - (activePlayer.cooldowns.pocaoCura || 0)) / 1000);
    if (tempoPassado < CONFIG_ITENS.pocoes.cdCompartilhadoSeg) {
      return {
        messageText: `⏳ Cooldown de poção de cura ativo! Aguarde ${CONFIG_ITENS.pocoes.cdCompartilhadoSeg - tempoPassado}s.`,
        soundType: 'fumble'
      };
    }

    // Limite diário de 10
    activePlayer.contadores24h.pocoesCura = activePlayer.contadores24h.pocoesCura.filter((t) => agora - t < 86400000);
    if (activePlayer.contadores24h.pocoesCura.length >= CONFIG_ITENS.pocoes.limiteCuraDia) {
      return {
        messageText: `❌ Limite diário de 10 poções de cura atingido! Espere o reset diário para beber mais poções de cura.`,
        soundType: 'fumble'
      };
    }

    let pctCura = 0.25;
    if (itemId === 'pocao_cura_m') pctCura = 0.5;
    if (itemId === 'pocao_cura_g') pctCura = 0.8;
    if (itemId === 'elixir_supremo') pctCura = 1.0;

    const hpCurado = Math.round(activePlayer.hpMax * pctCura);
    activePlayer.hp = Math.min(activePlayer.hpMax, activePlayer.hp + hpCurado);
    activePlayer.toxicidade = Math.min(100, (activePlayer.toxicidade || 0) + (cat?.toxicidade || 10));

    if (itemId === 'elixir_supremo') {
      activePlayer.toxicidade = Math.max(0, activePlayer.toxicidade - 50);
    }

    activePlayer.cooldowns.pocaoCura = agora;
    activePlayer.contadores24h.pocoesCura.push(agora);

    // Consumir 1 unidade
    itemInv.quantidade -= 1;
    if (itemInv.quantidade <= 0) activePlayer.inventario.splice(idx, 1);

    return {
      messageText: `🧪 Você bebeu ${itemInv.nome}!
❤️ HP restaurado: +${hpCurado} HP (${activePlayer.hp}/${activePlayer.hpMax})
☣️ Toxicidade: ${activePlayer.toxicidade}/100.`,
      soundType: 'heal'
    };
  }

  // Poções de Buff
  if (cat?.categoria === 'buff') {
    if (itemId === 'pocao_energia') {
      if (activePlayer.diario.pocoesEnergiaCompradas >= CONFIG.limitesDiarios.pocaoEnergia) {
        return { messageText: `❌ Limite de 3 poções de energia por dia atingido!`, soundType: 'fumble' };
      }
      activePlayer.energia = Math.min(activePlayer.energiaMax, activePlayer.energia + 30);
      activePlayer.diario.pocoesEnergiaCompradas += 1;
      activePlayer.toxicidade = Math.min(100, activePlayer.toxicidade + 20);

      itemInv.quantidade -= 1;
      if (itemInv.quantidade <= 0) activePlayer.inventario.splice(idx, 1);

      return {
        messageText: `⚡ Você bebeu Poção de Energia!
Energia restaurada: +30⚡ (${activePlayer.energia}/${activePlayer.energiaMax})
☣️ Toxicidade: ${activePlayer.toxicidade}/100.`,
        soundType: 'success'
      };
    }

    const tipoBuff = itemId.replace('pocao_', '') as any;
    const duracaoMs = itemId === 'pocao_sabedoria' ? 3600000 : itemId === 'pocao_foco' ? 1200000 : 1800000;
    const valor = itemId === 'pocao_forca' || itemId === 'pocao_defesa' ? 0.15 : 0.25;

    // Verificar se já possui buff do mesmo tipo
    const buffExistente = activePlayer.buffs.find((b) => b.tipo === tipoBuff);
    if (buffExistente) {
      buffExistente.expiraEm = agora + duracaoMs; // Renova duração
    } else {
      // Máximo 3 buffs ativos
      if (activePlayer.buffs.length >= CONFIG_ITENS.pocoes.maxBuffs) {
        const nomesAtivos = activePlayer.buffs.map((b) => b.nome).join(', ');
        return {
          messageText: `❌ Limite de 3 buffs ativos atingido! Buffs atuais: ${nomesAtivos}. Espere um expirar para beber outra poção de buff.`,
          soundType: 'fumble'
        };
      }

      activePlayer.buffs.push({
        tipo: tipoBuff,
        valor,
        expiraEm: agora + duracaoMs,
        nome: cat.nome,
        icone: cat.icone
      });
    }

    activePlayer.toxicidade = Math.min(100, activePlayer.toxicidade + cat.toxicidade);

    itemInv.quantidade -= 1;
    if (itemInv.quantidade <= 0) activePlayer.inventario.splice(idx, 1);

    return {
      messageText: `✨ ${cat.icone} Você consumiu ${cat.nome}!
Efeito ativado: ${cat.descricao}
☣️ Toxicidade: ${activePlayer.toxicidade}/100.`,
      soundType: 'success'
    };
  }

  // Elixires Permanentes
  if (cat?.categoria === 'elixir') {
    if (!activePlayer.elixires) activePlayer.elixires = { vitalidade: 0, poder: 0, guarda: 0 };

    if (itemId === 'elixir_vitalidade') {
      if (activePlayer.elixires.vitalidade >= 10) {
        return { messageText: `❌ Limite de 10 Elixires de Vitalidade atingido para este guerreiro!`, soundType: 'fumble' };
      }
      activePlayer.elixires.vitalidade += 1;
      activePlayer.hpMax += 10;
      activePlayer.hp += 10;
    } else if (itemId === 'elixir_poder') {
      if (activePlayer.elixires.poder >= 10) {
        return { messageText: `❌ Limite de 10 Elixires de Poder atingido para este guerreiro!`, soundType: 'fumble' };
      }
      activePlayer.elixires.poder += 1;
      activePlayer.ataqueBase += 2;
    } else if (itemId === 'elixir_guarda') {
      if (activePlayer.elixires.guarda >= 10) {
        return { messageText: `❌ Limite de 10 Elixires de Guarda atingido para este guerreiro!`, soundType: 'fumble' };
      }
      activePlayer.elixires.guarda += 1;
      activePlayer.defesaBase += 2;
    }

    itemInv.quantidade -= 1;
    if (itemInv.quantidade <= 0) activePlayer.inventario.splice(idx, 1);

    return {
      messageText: `🌟 ${cat.icone} PODER PERMANENTE ABSORVIDO!
${cat.descricao}
Progresso de elixires: Vitalidade (${activePlayer.elixires.vitalidade}/10), Poder (${activePlayer.elixires.poder}/10), Guarda (${activePlayer.elixires.guarda}/10).`,
      soundType: 'success'
    };
  }

  // Pedra de Amolar
  if (itemId === 'pedra_amolar') {
    const arma = activePlayer.equipamentos.arma;
    const escudo = activePlayer.equipamentos.escudo;
    if (!arma && !escudo) {
      return { messageText: `❌ Você não tem nenhuma arma ou escudo equipado para amolar!`, soundType: 'fumble' };
    }
    const peca = arma || escudo!;
    const ganho = Math.round(peca.durabilidadeMax * 0.25);
    peca.durabilidade = Math.min(peca.durabilidadeMax, peca.durabilidade + ganho);

    itemInv.quantidade -= 1;
    if (itemInv.quantidade <= 0) activePlayer.inventario.splice(idx, 1);

    return {
      messageText: `🪨 Você usou a Pedra de Amolar no(a) ${peca.nome}!
Durabilidade restaurada em +${ganho} (${peca.durabilidade}/${peca.durabilidadeMax}).`,
      soundType: 'success'
    };
  }

  // Kit de Reparo
  if (itemId === 'kit_reparo') {
    if (!activePlayer.ferramenta) {
      return { messageText: `❌ Nenhuma picareta equipada para reparar!`, soundType: 'fumble' };
    }
    const pic = activePlayer.ferramenta;
    pic.durabilidade = Math.min(pic.durabilidadeMax, pic.durabilidade + 30);

    itemInv.quantidade -= 1;
    if (itemInv.quantidade <= 0) activePlayer.inventario.splice(idx, 1);

    return {
      messageText: `🧰 Você usou o Kit de Reparo na ${pic.nome}!
Durabilidade restaurada em +30 (${pic.durabilidade}/${pic.durabilidadeMax}).`,
      soundType: 'success'
    };
  }

  // Bandagem
  if (itemId === 'bandagem') {
    const tempoPassado = Math.floor((agora - (activePlayer.cooldowns.curar || 0)) / 1000);
    if (tempoPassado < CONFIG.cooldownsSeg.bandagem) {
      return { messageText: `⏳ Aguarde ${CONFIG.cooldownsSeg.bandagem - tempoPassado}s para aplicar outra bandagem.`, soundType: 'fumble' };
    }
    const cura = Math.round(activePlayer.hpMax * 0.1);
    activePlayer.hp = Math.min(activePlayer.hpMax, activePlayer.hp + cura);
    activePlayer.cooldowns.curar = agora;

    itemInv.quantidade -= 1;
    if (itemInv.quantidade <= 0) activePlayer.inventario.splice(idx, 1);

    return {
      messageText: `🩹 Bandagem aplicada! Ferimentos leves curados em +${cura} HP (${activePlayer.hp}/${activePlayer.hpMax}) sem gerar toxicidade.`,
      soundType: 'heal'
    };
  }

  return {
    messageText: `❌ Item consumível não reconhecido para uso imediato.`,
    soundType: 'fumble'
  };
}

export function handleBuffsV3(activePlayer: PlayerProfile, agora: number): string {
  atualizarToxicidadeEBuffs(activePlayer, agora);

  const buffsText =
    activePlayer.buffs.length > 0
      ? activePlayer.buffs
          .map((b) => {
            const minRest = Math.max(1, Math.ceil((b.expiraEm - agora) / 60000));
            return `  ${b.icone} ${b.nome}: restam ${minRest} min (+${Math.round(b.valor * 100)}%)`;
          })
          .join('\n')
      : '  Nenhum buff temporário ativo no momento.';

  let statusTox = '🟢 Normal';
  if (activePlayer.toxicidade >= CONFIG_ITENS.toxicidade.envenenado) {
    statusTox = '☠️ ENVENENADO (Poções bloqueadas, -5% HP a cada 10 min)';
  } else if (activePlayer.toxicidade >= CONFIG_ITENS.toxicidade.intoxicado) {
    statusTox = '☣️ INTOXICADO (-15% Ataque e Defesa)';
  }

  const elix = activePlayer.elixires || { vitalidade: 0, poder: 0, guarda: 0 };

  return `╭───🧪 STATUS & BUFFS ───╮
🔮 Buffs Ativos (${activePlayer.buffs.length}/3):
${buffsText}

☣️ Toxicidade: ${activePlayer.toxicidade}/100
Estado: ${statusTox}
(Decai 1 ponto por minuto)

🌟 Elixires Permanentes:
  ❤️ Vitalidade: ${elix.vitalidade}/10 (+${elix.vitalidade * 10} HP Máx)
  ⚔️ Poder: ${elix.poder}/10 (+${elix.poder * 2} Atk Base)
  🛡️ Guarda: ${elix.guarda}/10 (+${elix.guarda * 2} Def Base)
╰────────────────────────╯`;
}

export function handleEquipadosV3(activePlayer: PlayerProfile): string {
  const slots: EquipSlot[] = ['elmo', 'armadura', 'calca', 'botas', 'arma', 'escudo'];
  const poder = calcularPoderTotal(activePlayer);

  const slotsLines = slots.map((s) => {
    const item = activePlayer.equipamentos[s];
    if (!item) {
      return `  [${s.toUpperCase()}]: Vazio`;
    }
    const catRar = CONFIG_ITENS.raridade[item.raridade] || CONFIG_ITENS.raridade.comum;
    const enc = item.encantamento > 0 ? ` +${item.encantamento}` : '';
    const estado = item.durabilidade <= 0 ? '💥 QUEBRADO' : `${item.durabilidade}/${item.durabilidadeMax}`;
    return `  [${s.toUpperCase()}]: ${item.icone} ${item.nome}${enc} (${catRar.label}) | Durab: ${estado}`;
  });

  const pic = activePlayer.ferramenta;
  const picLine = pic
    ? `  [FERRAMENTA]: ${pic.icone} ${pic.nome} | Durab: ${pic.durabilidade}/${pic.durabilidadeMax} (+${Math.round((pic.multMoedas - 1) * 100)}% moedas)`
    : `  [FERRAMENTA]: Nenhuma picareta equipada`;

  const setLine = poder.set.count > 0
    ? `🏆 Bônus de Set: Conjunto de ${poder.set.tierSet?.toUpperCase()} (${poder.set.count}/6 peças): +${Math.round(poder.set.bonusAtkDef * 100)}% Atk/Def`
    : `🏆 Bônus de Set: Nenhum ativo (equipe 3+ peças do mesmo tier)`;

  return `╭───🛡️ EQUIPAMENTOS ATIVOS ───╮
${slotsLines.join('\n')}
${picLine}

${setLine}

⚔️ Poder Total:
  ⚔️ Ataque: ${poder.ataque}
  🛡️ Defesa: ${poder.defesa}
  ❤️ HP Máximo: ${poder.hpMax}
╰─────────────────────────────╯`;
}

export function handleInventarioV3(activePlayer: PlayerProfile, paginaArg: string): string {
  const pagina = Math.max(1, parseInt(paginaArg) || 1);
  const itensPorPagina = 8;
  const totalItens = activePlayer.inventario.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
  const inicio = (pagina - 1) * itensPorPagina;
  const itensPagina = activePlayer.inventario.slice(inicio, inicio + itensPorPagina);

  const linhas = itensPagina.map((item, idx) => {
    const num = inicio + idx + 1;
    if (item.tipo === 'equip') {
      const eq = item.instancia;
      const rar = CONFIG_ITENS.raridade[eq.raridade]?.label || 'Comum';
      const enc = eq.encantamento > 0 ? ` +${eq.encantamento}` : '';
      return `${num}. ${eq.icone} ${eq.nome}${enc} [${rar}] (Durab: ${eq.durabilidade}/${eq.durabilidadeMax}) • ID: ${eq.uid}`;
    } else if (item.tipo === 'picareta') {
      const pic = item.instancia;
      return `${num}. ${pic.icone} ${pic.nome} (Durab: ${pic.durabilidade}/${pic.durabilidadeMax}) • ID: ${pic.uid}`;
    } else {
      return `${num}. ${item.icone} ${item.nome} x${item.quantidade} • Valor: ${item.precoVenda * item.quantidade}g`;
    }
  });

  const conteudo = linhas.length > 0 ? linhas.join('\n') : '  Inventário vazio.';
  const bauAviso = activePlayer.bauEspera && activePlayer.bauEspera.length > 0
    ? `\n📦 Você tem ${activePlayer.bauEspera.length} item(ns) no Baú de Espera! Use #bau para ver.`
    : '';

  return `╭───🎒 INVENTÁRIO (${totalItens}/${CONFIG_ITENS.inventario.slots}) ───╮
Página ${pagina}/${totalPaginas}

${conteudo}
${bauAviso}
╰────────────────────────────────╯
*Use #equipar <ID>, #usar <item> ou #vender <item> <qtd>*`;
}

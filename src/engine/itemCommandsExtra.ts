import {
  CONFIG_ITENS,
  CATALOGO_EQUIPAMENTOS,
  CATALOGO_PICARETAS,
  CATALOGO_CONSUMIVEIS,
  MATERIAIS_CATALOGO,
  criarInstanciaEquip,
  criarInstanciaPicareta
} from './gameData';
import {
  EquipSlot,
  InstanciaEquip,
  InstanciaPicareta,
  ItemInventario,
  PlayerProfile
} from '../types/rpgBot';
import { adicionarAoInventario } from './itemSystemV3';

export function handleEquiparV3(
  activePlayer: PlayerProfile,
  query: string,
  dungeonAberta: boolean
): { messageText: string; soundType: 'success' | 'fumble' } {
  if (dungeonAberta) {
    return {
      messageText: `❌ Troca de equipamento bloqueada durante uma incursão em Dungeon ou combate de Arena!`,
      soundType: 'fumble'
    };
  }

  if (!query) {
    return {
      messageText: `❌ Especifique o ID ou nome do equipamento para equipar!
Exemplo: #equipar eq_8f3a21 ou #equipar pic_91a2`,
      soundType: 'fumble'
    };
  }

  const termo = query.toLowerCase();

  // Procurar no inventário por UID ou por itemId/nome
  const idx = activePlayer.inventario.findIndex((i) => {
    if (i.tipo === 'equip') {
      return i.instancia.uid.toLowerCase() === termo || i.instancia.itemId.toLowerCase() === termo || i.instancia.nome.toLowerCase().includes(termo);
    }
    if (i.tipo === 'picareta') {
      return i.instancia.uid.toLowerCase() === termo || i.instancia.tipo.toLowerCase() === termo || i.instancia.nome.toLowerCase().includes(termo);
    }
    return false;
  });

  if (idx < 0) {
    return {
      messageText: `❌ Item '${query}' não encontrado no inventário! Use #inventario para ver os IDs disponíveis.`,
      soundType: 'fumble'
    };
  }

  const itemInv = activePlayer.inventario[idx];

  // Caso seja Picareta
  if (itemInv.tipo === 'picareta') {
    const novaPic = itemInv.instancia;
    if (activePlayer.nivel < novaPic.nivelMin) {
      return {
        messageText: `❌ Nível insuficiente! ${novaPic.nome} requer Nível ${novaPic.nivelMin}+.`,
        soundType: 'fumble'
      };
    }

    const picAntiga = activePlayer.ferramenta;
    activePlayer.ferramenta = novaPic;
    activePlayer.inventario.splice(idx, 1);

    if (picAntiga) {
      adicionarAoInventario(activePlayer, { tipo: 'picareta', instancia: picAntiga });
    }

    return {
      messageText: `⛏️ ${novaPic.nome} equipada no slot Ferramenta!
Durabilidade: ${novaPic.durabilidade}/${novaPic.durabilidadeMax} | Bônus: +${Math.round((novaPic.multMoedas - 1) * 100)}% moedas.`,
      soundType: 'success'
    };
  }

  // Caso seja Equipamento
  if (itemInv.tipo === 'equip') {
    const novoEq = itemInv.instancia;
    const cat = CATALOGO_EQUIPAMENTOS[novoEq.itemId];
    const nivelMin = cat ? cat.nivelMin : 1;

    if (activePlayer.nivel < nivelMin) {
      return {
        messageText: `❌ Nível insuficiente! ${novoEq.nome} requer Nível ${nivelMin}+.`,
        soundType: 'fumble'
      };
    }

    const slot = novoEq.slot;
    const eqAntigo = activePlayer.equipamentos[slot];

    activePlayer.equipamentos[slot] = novoEq;
    activePlayer.inventario.splice(idx, 1);

    if (eqAntigo) {
      adicionarAoInventario(activePlayer, { tipo: 'equip', instancia: eqAntigo });
    }

    return {
      messageText: `🛡️ ${novoEq.nome} equipado(a) no slot [${slot.toUpperCase()}]!
Durabilidade: ${novoEq.durabilidade}/${novoEq.durabilidadeMax}${novoEq.encantamento > 0 ? ` (+${novoEq.encantamento})` : ''}.`,
      soundType: 'success'
    };
  }

  return {
    messageText: `❌ Este item não pode ser equipado.`,
    soundType: 'fumble'
  };
}

export function handleDesequiparV3(
  activePlayer: PlayerProfile,
  slotArg: string,
  dungeonAberta: boolean
): { messageText: string; soundType: 'success' | 'fumble' } {
  if (dungeonAberta) {
    return {
      messageText: `❌ Troca de equipamento bloqueada durante uma incursão em Dungeon ou combate de Arena!`,
      soundType: 'fumble'
    };
  }

  const slot = slotArg?.toLowerCase() as EquipSlot;
  if (slot === ('picareta' as any) || slot === ('ferramenta' as any)) {
    if (!activePlayer.ferramenta) {
      return { messageText: `❌ Nenhuma picareta equipada.`, soundType: 'fumble' };
    }
    const pic = activePlayer.ferramenta;
    const res = adicionarAoInventario(activePlayer, { tipo: 'picareta', instancia: pic });
    if (!res.adicionado && !res.foiProBau) {
      return { messageText: `❌ Inventário e Baú cheios! Libere espaço antes de desequipar.`, soundType: 'fumble' };
    }
    activePlayer.ferramenta = null;
    return {
      messageText: `⛏️ ${pic.nome} desequipada e guardada no ${res.foiProBau ? 'Baú de Espera' : 'Inventário'}.`,
      soundType: 'success'
    };
  }

  const item = activePlayer.equipamentos[slot];
  if (!item) {
    return {
      messageText: `❌ Nenhum equipamento equipado no slot '${slotArg}'. Slots: elmo, armadura, calca, botas, arma, escudo, picareta.`,
      soundType: 'fumble'
    };
  }

  const res = adicionarAoInventario(activePlayer, { tipo: 'equip', instancia: item });
  if (!res.adicionado && !res.foiProBau) {
    return { messageText: `❌ Inventário e Baú cheios! Libere espaço antes de desequipar.`, soundType: 'fumble' };
  }

  activePlayer.equipamentos[slot] = null;
  return {
    messageText: `🛡️ ${item.nome} desequipado(a) e guardado(a) no ${res.foiProBau ? 'Baú de Espera' : 'Inventário'}.`,
    soundType: 'success'
  };
}

export function handleVenderV3(
  activePlayer: PlayerProfile,
  termo: string,
  qtdArg: string
): { messageText: string; soundType: 'success' | 'fumble' } {
  if (!termo) {
    return {
      messageText: `❌ Especifique o que deseja vender! Exemplo: #vender pedra 5 ou #vender eq_8f3a21 1.`,
      soundType: 'fumble'
    };
  }

  const chave = termo.toLowerCase();
  const qtdDesejada = Math.max(1, parseInt(qtdArg) || 1);

  // Procurar no inventário
  const idx = activePlayer.inventario.findIndex((i) => {
    if (i.tipo === 'material' || i.tipo === 'consumivel') {
      return i.itemId.toLowerCase() === chave || i.nome.toLowerCase().includes(chave);
    }
    if (i.tipo === 'equip') {
      return i.instancia.uid.toLowerCase() === chave || i.instancia.itemId.toLowerCase() === chave;
    }
    if (i.tipo === 'picareta') {
      return i.instancia.uid.toLowerCase() === chave || i.instancia.tipo.toLowerCase() === chave;
    }
    return false;
  });

  if (idx < 0) {
    return {
      messageText: `❌ Item '${termo}' não encontrado no inventário para venda.`,
      soundType: 'fumble'
    };
  }

  const item = activePlayer.inventario[idx];

  // Caso material ou consumível
  if (item.tipo === 'material' || item.tipo === 'consumivel') {
    const cat = CATALOGO_CONSUMIVEIS[item.itemId];
    if (cat?.naoVendivel) {
      return { messageText: `❌ ${item.nome} é um item lendário/sagrado e não pode ser vendido a NPCs!`, soundType: 'fumble' };
    }

    const qtdVender = Math.min(item.quantidade, qtdDesejada);
    const precoUnitario = item.precoVenda || 15;
    const totalMoedas = precoUnitario * qtdVender;

    item.quantidade -= qtdVender;
    if (item.quantidade <= 0) {
      activePlayer.inventario.splice(idx, 1);
    }
    activePlayer.moedas += totalMoedas;

    return {
      messageText: `💰 Você vendeu ${qtdVender}x ${item.nome} para os mercadores!
Recebido: +${totalMoedas.toLocaleString()} moedas.
Saldo atual: ${activePlayer.moedas.toLocaleString()} moedas.`,
      soundType: 'success'
    };
  }

  // Caso Equipamento
  if (item.tipo === 'equip') {
    const eq = item.instancia;
    const cat = CATALOGO_EQUIPAMENTOS[eq.itemId];
    const precoBase = cat ? cat.precoBase : 500;
    const estado = Math.max(0.3, eq.durabilidade / eq.durabilidadeMax);
    const multRar = CONFIG_ITENS.raridade[eq.raridade]?.preco || 1.0;
    const precoVenda = Math.round(precoBase * 0.4 * estado * multRar);

    activePlayer.inventario.splice(idx, 1);
    activePlayer.moedas += precoVenda;

    return {
      messageText: `💰 Você vendeu ${eq.nome} [${eq.raridade.toUpperCase()}]!
🔧 Estado da peça: ${Math.round(estado * 100)}% de conservação.
Recebido: +${precoVenda.toLocaleString()} moedas.
Saldo atual: ${activePlayer.moedas.toLocaleString()} moedas.`,
      soundType: 'success'
    };
  }

  // Caso Picareta
  if (item.tipo === 'picareta') {
    const pic = item.instancia;
    const cat = CATALOGO_PICARETAS[pic.tipo];
    const precoBase = cat ? cat.preco : 600;
    const estado = Math.max(0.3, pic.durabilidade / pic.durabilidadeMax);
    const precoVenda = Math.round(precoBase * 0.4 * estado);

    activePlayer.inventario.splice(idx, 1);
    activePlayer.moedas += precoVenda;

    return {
      messageText: `💰 Você vendeu ${pic.nome}!
Recebido: +${precoVenda.toLocaleString()} moedas.
Saldo atual: ${activePlayer.moedas.toLocaleString()} moedas.`,
      soundType: 'success'
    };
  }

  return { messageText: `❌ Não foi possível vender este item.`, soundType: 'fumble' };
}

export function handleBauV3(activePlayer: PlayerProfile, acaoArg: string): string {
  if (!Array.isArray(activePlayer.bauEspera)) activePlayer.bauEspera = [];

  // Limpar itens expirados (>24h)
  const agora = Date.now();
  activePlayer.bauEspera = activePlayer.bauEspera.filter((i) => i.expiraEm > agora);

  if (activePlayer.bauEspera.length === 0) {
    return `📦 Seu Baú de Espera está vazio! Quando seu inventário estiver cheio, os novos drops ficarão guardados aqui por 24 horas.`;
  }

  if (acaoArg?.toLowerCase() === 'resgatar' || acaoArg?.toLowerCase() === 'claim') {
    let resgatados = 0;
    while (activePlayer.bauEspera.length > 0 && activePlayer.inventario.length < CONFIG_ITENS.inventario.slots) {
      const bItem = activePlayer.bauEspera.shift()!;
      const matCat = MATERIAIS_CATALOGO[bItem.itemId];
      adicionarAoInventario(activePlayer, {
        tipo: 'material',
        itemId: bItem.itemId,
        nome: bItem.nome,
        quantidade: bItem.quantidade,
        icone: bItem.icone,
        precoVenda: matCat ? matCat.precoVenda : 15
      });
      resgatados += 1;
    }

    return `📦 Resgate concluído!
${resgatados} lote(s) transferidos para seu inventário principal.
Restantes no Baú: ${activePlayer.bauEspera.length}.`;
  }

  const linhas = activePlayer.bauEspera.map((b, idx) => {
    const horasRest = Math.max(1, Math.ceil((b.expiraEm - agora) / 3600000));
    return `  ${idx + 1}. ${b.icone} ${b.nome} x${b.quantidade} (expira em ${horasRest}h)`;
  });

  return `╭───📦 BAÚ DE ESPERA (${activePlayer.bauEspera.length}/${CONFIG_ITENS.inventario.bauEsperaMax}) ───╮
${linhas.join('\n')}
╰────────────────────────────────╯
*Digite #bau resgatar para mover os itens para o inventário!*`;
}

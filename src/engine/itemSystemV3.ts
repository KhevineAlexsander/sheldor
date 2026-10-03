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

export function fatorDurabilidade(dur: number, durMax: number): number {
  if (dur <= 0) return 0;
  const p = Math.max(0, Math.min(1, dur / durMax));
  return p >= 0.5 ? 1 : 0.6 + 0.8 * p;
}

export function bonusEfetivo(peca: InstanciaEquip, tipo: 'atk' | 'def'): number {
  const cat = CATALOGO_EQUIPAMENTOS[peca.itemId];
  if (!cat) return 0;
  const base = tipo === 'atk' ? cat.bonusAtaque : cat.bonusDefesa;
  const multRar = CONFIG_ITENS.raridade[peca.raridade]?.mult || 1.0;
  const multEnc = 1 + CONFIG_ITENS.encantamento.bonusPorNivel * (peca.encantamento || 0);
  const fator = fatorDurabilidade(peca.durabilidade, peca.durabilidadeMax);
  return base * multRar * multEnc * fator;
}

export function bonusDeSet(pecas: InstanciaEquip[]): {
  bonusAtkDef: number;
  bonusHP: number;
  tierSet: string | null;
  count: number;
} {
  const ativas = pecas.filter((p) => p && p.durabilidade > 0);
  const tiers: Record<string, number> = {};
  ativas.forEach((p) => {
    tiers[p.tier] = (tiers[p.tier] || 0) + 1;
  });

  let melhorTier: string | null = null;
  let maxCount = 0;
  for (const [tier, count] of Object.entries(tiers)) {
    if (count > maxCount) {
      maxCount = count;
      melhorTier = tier;
    }
  }

  if (maxCount >= 6) {
    return { bonusAtkDef: 0.2, bonusHP: 0.1, tierSet: melhorTier, count: maxCount };
  } else if (maxCount >= 5) {
    return { bonusAtkDef: 0.12, bonusHP: 0, tierSet: melhorTier, count: maxCount };
  } else if (maxCount >= 3) {
    return { bonusAtkDef: 0.05, bonusHP: 0, tierSet: melhorTier, count: maxCount };
  }
  return { bonusAtkDef: 0, bonusHP: 0, tierSet: null, count: 0 };
}

export function atualizarToxicidadeEBuffs(player: PlayerProfile, agora: number): void {
  if (Array.isArray(player.buffs)) {
    player.buffs = player.buffs.filter((b) => b.expiraEm > agora);
  } else {
    player.buffs = [];
  }

  const ult = player.ultimaAtualizacaoToxicidade || agora;
  const minutos = Math.floor((agora - ult) / 60000);
  if (minutos > 0) {
    player.toxicidade = Math.max(
      0,
      (player.toxicidade || 0) - minutos * CONFIG_ITENS.toxicidade.decaiPorMin
    );
    player.ultimaAtualizacaoToxicidade = agora;
  }

  if (player.toxicidade >= CONFIG_ITENS.toxicidade.envenenado) {
    const ciclos10m = Math.floor((agora - ult) / 600000);
    if (ciclos10m > 0) {
      const perda = Math.floor(player.hpMax * 0.05 * ciclos10m);
      player.hp = Math.max(1, player.hp - perda);
    }
  }
}

export function calcularPoderTotal(p: PlayerProfile, agora: number = Date.now()) {
  atualizarToxicidadeEBuffs(p, agora);
  const pecas = Object.values(p.equipamentos).filter(Boolean) as InstanciaEquip[];
  const atkEq = pecas.reduce((s, e) => s + bonusEfetivo(e, 'atk'), 0);
  const defEq = pecas.reduce((s, e) => s + bonusEfetivo(e, 'def'), 0);
  const set = bonusDeSet(pecas);

  let buffAtk = 0;
  let buffDef = 0;
  if (Array.isArray(p.buffs)) {
    p.buffs.forEach((b) => {
      if (b.tipo === 'forca') buffAtk += b.valor;
      if (b.tipo === 'defesa') buffDef += b.valor;
    });
  }
  buffAtk = Math.min(CONFIG_ITENS.pocoes.tetoBuffAtkDef, buffAtk);
  buffDef = Math.min(CONFIG_ITENS.pocoes.tetoBuffAtkDef, buffDef);

  const penalidadeTox =
    p.toxicidade >= CONFIG_ITENS.toxicidade.intoxicado
      ? CONFIG_ITENS.toxicidade.penalidadeIntoxicado
      : 1.0;

  let atkTotal = (p.ataqueBase + atkEq) * (1 + set.bonusAtkDef) * (1 + buffAtk) * penalidadeTox;
  let defTotal = (p.defesaBase + defEq) * (1 + set.bonusAtkDef) * (1 + buffDef) * penalidadeTox;

  if (p.pet && agora < p.pet.fomeAteTimestamp) {
    atkTotal *= 1 + p.pet.bonusDanoPct / 100;
  }

  const hpMaxTotal = Math.round(p.hpMax * (1 + set.bonusHP));

  return {
    ataque: Math.round(atkTotal),
    defesa: Math.round(defTotal),
    hpMax: hpMaxTotal,
    set,
    buffAtk,
    buffDef,
    intoxicado: p.toxicidade >= CONFIG_ITENS.toxicidade.intoxicado,
    envenenado: p.toxicidade >= CONFIG_ITENS.toxicidade.envenenado
  };
}

export function aplicarDesgasteGolpe(
  atacante: PlayerProfile,
  defensor: PlayerProfile,
  critico: boolean,
  bloqueado: boolean
) {
  if (atacante.equipamentos.arma && atacante.equipamentos.arma.durabilidade > 0) {
    atacante.equipamentos.arma.durabilidade = Math.max(
      0,
      atacante.equipamentos.arma.durabilidade - CONFIG_ITENS.desgaste.golpeDado
    );
  }

  if (bloqueado && defensor.equipamentos.escudo && defensor.equipamentos.escudo.durabilidade > 0) {
    defensor.equipamentos.escudo.durabilidade = Math.max(
      0,
      defensor.equipamentos.escudo.durabilidade - CONFIG_ITENS.desgaste.bloqueio
    );
  }

  const slotsValidos = (['elmo', 'armadura', 'calca', 'botas'] as EquipSlot[]).filter(
    (s) => defensor.equipamentos[s] && defensor.equipamentos[s]!.durabilidade > 0
  );

  if (slotsValidos.length > 0) {
    const pesos: Record<string, number> = { elmo: 15, armadura: 45, calca: 25, botas: 15 };
    const pesoTotal = slotsValidos.reduce((acc, s) => acc + (pesos[s] || 10), 0);
    let rand = Math.random() * pesoTotal;
    let slotSorteado = slotsValidos[0];
    for (const s of slotsValidos) {
      rand -= pesos[s] || 10;
      if (rand <= 0) {
        slotSorteado = s;
        break;
      }
    }

    const dano = critico ? CONFIG_ITENS.desgaste.critico : CONFIG_ITENS.desgaste.golpeRecebido;
    defensor.equipamentos[slotSorteado]!.durabilidade = Math.max(
      0,
      defensor.equipamentos[slotSorteado]!.durabilidade - dano
    );
  }
}

export function repararItem(
  item: InstanciaEquip | InstanciaPicareta,
  precoBase: number,
  multRar: number = 1.0
): number {
  const perdido = item.durabilidadeMax - item.durabilidade;
  if (perdido <= 0) return 0;
  let custo = precoBase * multRar * CONFIG_ITENS.reparo.custoPct * (perdido / item.durabilidadeMax);
  if (item.durabilidade <= 0) {
    custo *= 1 + CONFIG_ITENS.reparo.adicionalQuebrado;
  }
  const piso = Math.floor(item.durabilidadeOriginal * CONFIG_ITENS.reparo.pisoDurabMax);
  item.durabilidadeMax = Math.max(
    piso,
    Math.floor(item.durabilidadeMax * (1 - CONFIG_ITENS.reparo.perdaDurabMax))
  );
  item.durabilidade = item.durabilidadeMax;
  item.reparos += 1;
  return Math.ceil(custo);
}

export function adicionarAoInventario(
  player: PlayerProfile,
  item:
    | {
        tipo: 'material' | 'consumivel';
        itemId: string;
        nome: string;
        quantidade: number;
        icone: string;
        precoVenda: number;
        descricao?: string;
      }
    | { tipo: 'equip'; instancia: InstanciaEquip }
    | { tipo: 'picareta'; instancia: InstanciaPicareta }
): { adicionado: boolean; foiProBau: boolean } {
  if (!Array.isArray(player.inventario)) player.inventario = [];
  if (!Array.isArray(player.bauEspera)) player.bauEspera = [];

  if (item.tipo === 'material' || item.tipo === 'consumivel') {
    const existente = player.inventario.find(
      (i) =>
        (i.tipo === 'material' || i.tipo === 'consumivel') &&
        i.itemId === item.itemId &&
        i.quantidade < CONFIG_ITENS.inventario.stack
    );
    if (existente && (existente.tipo === 'material' || existente.tipo === 'consumivel')) {
      const espaco = CONFIG_ITENS.inventario.stack - existente.quantidade;
      const colocar = Math.min(espaco, item.quantidade);
      existente.quantidade += colocar;
      const restante = item.quantidade - colocar;
      if (restante <= 0) return { adicionado: true, foiProBau: false };
      item.quantidade = restante;
    }
  }

  if (player.inventario.length < CONFIG_ITENS.inventario.slots) {
    if (item.tipo === 'material' || item.tipo === 'consumivel') {
      player.inventario.push({
        uid: `mat_${Math.random().toString(36).substring(2, 9)}`,
        tipo: item.tipo,
        itemId: item.itemId,
        nome: item.nome,
        quantidade: item.quantidade,
        icone: item.icone,
        precoVenda: item.precoVenda,
        descricao: item.descricao
      });
    } else if (item.tipo === 'equip') {
      player.inventario.push({
        uid: item.instancia.uid,
        tipo: 'equip',
        instancia: item.instancia
      });
    } else if (item.tipo === 'picareta') {
      player.inventario.push({
        uid: item.instancia.uid,
        tipo: 'picareta',
        instancia: item.instancia
      });
    }
    return { adicionado: true, foiProBau: false };
  }

  if (player.bauEspera.length < CONFIG_ITENS.inventario.bauEsperaMax) {
    let nome = '';
    let icone = '📦';
    let qtd = 1;
    let id = '';

    if (item.tipo === 'material' || item.tipo === 'consumivel') {
      nome = item.nome;
      icone = item.icone;
      qtd = item.quantidade;
      id = item.itemId;
    } else if (item.tipo === 'equip') {
      nome = item.instancia.nome;
      icone = item.instancia.icone;
      qtd = 1;
      id = item.instancia.itemId;
    } else if (item.tipo === 'picareta') {
      nome = item.instancia.nome;
      icone = item.instancia.icone;
      qtd = 1;
      id = item.instancia.tipo;
    }

    player.bauEspera.push({
      itemId: id,
      nome,
      quantidade: qtd,
      expiraEm: Date.now() + CONFIG_ITENS.inventario.bauEsperaHoras * 3600 * 1000,
      icone
    });
    return { adicionado: false, foiProBau: true };
  }

  return { adicionado: false, foiProBau: false };
}

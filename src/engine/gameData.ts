import {
  ArenaTier,
  ClanData,
  DailyQuest,
  DungeonDef,
  EquipSlot,
  EquipTier,
  InstanciaEquip,
  InstanciaPicareta,
  ItemInventario,
  PicaretaTipo,
  PlayerProfile,
  Raridade,
  CatalogoEquipItem,
  CatalogoPicaretaItem
} from '../types/rpgBot';

export const CONFIG = {
  energia: {
    maxPadrao: 100,
    regenSegundos: 120, // 1 ponto a cada 2 min (30/h)
    maxPorNivel: 2,
    teto: 160
  },
  cooldownsSeg: {
    mine: 180, // 3 min base
    trabalhar: 1800, // 30 min
    arena: 1200, // 20 min global
    duelo: 300, // 5 min global
    dueloMesmoOponente: 1800, // 30 min contra mesmo alvo
    dungeon: 7200, // 2h por jogador
    curar: 300, // 5 min
    consertar: 120, // 2 min por comando
    consertarPicareta: 600, // 10 min
    roleta: 30, // 30 seg
    petTreinar: 3600, // 1h
    encantar: 120, // 2 min
    forjar: 300, // 5 min
    fundir: 20, // 20s
    pocaoCura: 20, // 20s compartilhado
    bandagem: 60 // 60s
  },
  custoEnergia: {
    mine: 8,
    trabalhar: 15,
    arena: 20,
    duelo: 10,
    dungeon: 25,
    petTreinar: 5,
    encantar: 5,
    forjar: 10
  },
  fadigaMine: [
    { ate: 20, mult: 1.0 },
    { ate: 40, mult: 0.6 },
    { ate: 60, mult: 0.25 },
    { ate: Infinity, mult: 0.05 }
  ],
  limitesDiarios: {
    trabalhoIntegral: 8,
    arenaIntegral: 10,
    pocaoCura: 10,
    pocaoEnergia: 3,
    bandagem: 5,
    roletaApostas: 20
  },
  combate: {
    variacaoMin: 0.85,
    variacaoMax: 1.15,
    mitigacaoDefesa: 0.5,
    chanceCritico: 0.08,
    multCritico: 1.5,
    chanceEsquiva: 0.05,
    rodadasPvP: 5
  },
  pvp: {
    fatorRepeticao: [1.0, 0.5, 0.0],
    limitePctSaldoPerdedor: 0.10
  },
  taxaTransferencia: 0.05
};

export const CONFIG_ITENS = {
  cooldownMinimoMineSeg: 120, // Piso global inegociável
  picaretas: {
    madeira: { nivel: 1, durab: 30, multMoedas: 0.8, reducaoCd: 0, preco: 150 },
    pedra: { nivel: 3, durab: 60, multMoedas: 1.0, reducaoCd: 0, preco: 600 },
    ferro: { nivel: 5, durab: 120, multMoedas: 1.3, reducaoCd: 0.05, preco: 2500 },
    ouro: { nivel: 10, durab: 80, multMoedas: 1.5, reducaoCd: 0.1, preco: 6000 },
    diamante: { nivel: 15, durab: 250, multMoedas: 2.0, reducaoCd: 0.2, preco: 20000 }
  },
  raridade: {
    comum: { mult: 1.0, durab: 1.0, preco: 1.0, label: 'Comum', cor: 'text-slate-300' },
    incomum: { mult: 1.15, durab: 1.1, preco: 1.5, label: 'Incomum', cor: 'text-emerald-400' },
    raro: { mult: 1.35, durab: 1.25, preco: 2.5, label: 'Raro', cor: 'text-cyan-400' },
    epico: { mult: 1.6, durab: 1.5, preco: 5.0, label: 'Épico', cor: 'text-purple-400' },
    lendario: { mult: 2.0, durab: 2.0, preco: 12.0, label: 'Lendário', cor: 'text-amber-400' }
  },
  desgaste: {
    golpeDado: 0.5,
    golpeRecebido: 1.0,
    critico: 2.0,
    bloqueio: 1.0,
    chanceBloqueio: 0.2,
    reducaoBloqueio: 0.4
  },
  reparo: {
    custoPct: 0.35,
    adicionalQuebrado: 0.25,
    perdaDurabMax: 0.03, // 3%
    pisoDurabMax: 0.4, // Piso de 40% do original
    taxaTudo: 0.1 // +10%
  },
  pocoes: {
    limiteCuraDia: 10,
    cdCompartilhadoSeg: 20,
    maxBuffs: 3,
    tetoBuffAtkDef: 0.4
  },
  toxicidade: {
    decaiPorMin: 1,
    intoxicado: 75,
    envenenado: 100,
    penalidadeIntoxicado: 0.85
  },
  encantamento: {
    bonusPorNivel: 0.08,
    chances: [0.9, 0.75, 0.55, 0.35, 0.2],
    chanceQuebra: [0, 0, 0.15, 0.25, 0.35]
  },
  inventario: {
    slots: 40,
    stack: 99,
    bauEsperaMax: 20,
    bauEsperaHoras: 24
  }
};

// --- CATÁLOGO DE PICARETAS ---
export const CATALOGO_PICARETAS: Record<PicaretaTipo, CatalogoPicaretaItem> = {
  madeira: {
    tipo: 'madeira',
    nome: 'Picareta de Madeira',
    nivelMin: 1,
    durabilidadeBase: 30,
    multMoedas: 0.8,
    reducaoCd: 0,
    preco: 150,
    icone: '🪵'
  },
  pedra: {
    tipo: 'pedra',
    nome: 'Picareta de Pedra',
    nivelMin: 3,
    durabilidadeBase: 60,
    multMoedas: 1.0,
    reducaoCd: 0,
    preco: 600,
    icone: '🪨'
  },
  ferro: {
    tipo: 'ferro',
    nome: 'Picareta de Ferro',
    nivelMin: 5,
    durabilidadeBase: 120,
    multMoedas: 1.3,
    reducaoCd: 0.05,
    preco: 2500,
    icone: '⛏️'
  },
  ouro: {
    tipo: 'ouro',
    nome: 'Picareta de Ouro',
    nivelMin: 10,
    durabilidadeBase: 80,
    multMoedas: 1.5,
    reducaoCd: 0.1,
    preco: 6000,
    icone: '🥇'
  },
  diamante: {
    tipo: 'diamante',
    nome: 'Picareta de Diamante',
    nivelMin: 15,
    durabilidadeBase: 250,
    multMoedas: 2.0,
    reducaoCd: 0.2,
    preco: 20000,
    icone: '💎'
  }
};

// --- CATÁLOGO DE EQUIPAMENTOS POR TIER & SLOT ---
export const CATALOGO_EQUIPAMENTOS: Record<string, CatalogoEquipItem> = {
  // --- TIER COURO (Nível 1) ---
  elmo_couro: {
    id: 'elmo_couro',
    nome: 'Elmo de Couro',
    slot: 'elmo',
    tier: 'couro',
    nivelMin: 1,
    bonusAtaque: 0,
    bonusDefesa: 4, // 65% de 6 = ~4
    durabilidadeBase: 48, // 60 * 0.8
    precoBase: 200,
    icone: '🎩'
  },
  armadura_couro: {
    id: 'armadura_couro',
    nome: 'Armadura de Couro',
    slot: 'armadura',
    tier: 'couro',
    nivelMin: 1,
    bonusAtaque: 0,
    bonusDefesa: 6,
    durabilidadeBase: 72, // 60 * 1.2
    precoBase: 400,
    icone: '🥋'
  },
  calca_couro: {
    id: 'calca_couro',
    nome: 'Calça de Couro',
    slot: 'calca',
    tier: 'couro',
    nivelMin: 1,
    bonusAtaque: 0,
    bonusDefesa: 4, // 60% de 6 = ~4
    durabilidadeBase: 54, // 60 * 0.9
    precoBase: 240,
    icone: '👖'
  },
  botas_couro: {
    id: 'botas_couro',
    nome: 'Botas de Couro',
    slot: 'botas',
    tier: 'couro',
    nivelMin: 1,
    bonusAtaque: 0,
    bonusDefesa: 3, // 50% de 6 = 3
    durabilidadeBase: 42, // 60 * 0.7
    precoBase: 160,
    icone: '🥾'
  },
  espada_madeira: {
    id: 'espada_madeira',
    nome: 'Espada de Treino',
    slot: 'arma',
    tier: 'couro',
    nivelMin: 1,
    bonusAtaque: 6,
    bonusDefesa: 1, // 15% de 6 = 1
    durabilidadeBase: 60,
    precoBase: 480,
    icone: '🗡️'
  },
  escudo_madeira: {
    id: 'escudo_madeira',
    nome: 'Escudo Rústico de Madeira',
    slot: 'escudo',
    tier: 'couro',
    nivelMin: 1,
    bonusAtaque: 0,
    bonusDefesa: 4, // 70% de 6 = 4
    durabilidadeBase: 66, // 60 * 1.1
    precoBase: 280,
    icone: '🛡️'
  },

  // --- TIER FERRO (Nível 5) ---
  elmo_ferro: {
    id: 'elmo_ferro',
    nome: 'Elmo de Ferro',
    slot: 'elmo',
    tier: 'ferro',
    nivelMin: 5,
    bonusAtaque: 0,
    bonusDefesa: 8, // 65% de 12
    durabilidadeBase: 80,
    precoBase: 750,
    icone: '🪖'
  },
  armadura_ferro: {
    id: 'armadura_ferro',
    nome: 'Cota de Malha de Ferro',
    slot: 'armadura',
    tier: 'ferro',
    nivelMin: 5,
    bonusAtaque: 0,
    bonusDefesa: 12,
    durabilidadeBase: 120,
    precoBase: 1500,
    icone: '🦺'
  },
  calca_ferro: {
    id: 'calca_ferro',
    nome: 'Perneiras de Ferro',
    slot: 'calca',
    tier: 'ferro',
    nivelMin: 5,
    bonusAtaque: 0,
    bonusDefesa: 7, // 60% de 12
    durabilidadeBase: 90,
    precoBase: 900,
    icone: '🛡️'
  },
  botas_ferro: {
    id: 'botas_ferro',
    nome: 'Botas de Ferro',
    slot: 'botas',
    tier: 'ferro',
    nivelMin: 5,
    bonusAtaque: 0,
    bonusDefesa: 6, // 50% de 12
    durabilidadeBase: 70,
    precoBase: 600,
    icone: '👢'
  },
  espada_ferro: {
    id: 'espada_ferro',
    nome: 'Espada Larga de Ferro',
    slot: 'arma',
    tier: 'ferro',
    nivelMin: 5,
    bonusAtaque: 16,
    bonusDefesa: 2, // 15% de 12
    durabilidadeBase: 100,
    precoBase: 1800,
    icone: '⚔️'
  },
  escudo_ferro: {
    id: 'escudo_ferro',
    nome: 'Escudo Reforçado de Ferro',
    slot: 'escudo',
    tier: 'ferro',
    nivelMin: 5,
    bonusAtaque: 0,
    bonusDefesa: 8, // 70% de 12
    durabilidadeBase: 110,
    precoBase: 1050,
    icone: '🛡️'
  },

  // --- TIER AÇO (Nível 10) ---
  elmo_aco: {
    id: 'elmo_aco',
    nome: 'Elmo Templário de Aço',
    slot: 'elmo',
    tier: 'aco',
    nivelMin: 10,
    bonusAtaque: 0,
    bonusDefesa: 14,
    durabilidadeBase: 128,
    precoBase: 2500,
    icone: '👑'
  },
  armadura_aco: {
    id: 'armadura_aco',
    nome: 'Armadura Completa de Aço',
    slot: 'armadura',
    tier: 'aco',
    nivelMin: 10,
    bonusAtaque: 0,
    bonusDefesa: 22,
    durabilidadeBase: 192,
    precoBase: 5000,
    icone: '🛡️'
  },
  calca_aco: {
    id: 'calca_aco',
    nome: 'Grevas Polidas de Aço',
    slot: 'calca',
    tier: 'aco',
    nivelMin: 10,
    bonusAtaque: 0,
    bonusDefesa: 13,
    durabilidadeBase: 144,
    precoBase: 3000,
    icone: '👖'
  },
  botas_aco: {
    id: 'botas_aco',
    nome: 'Soleretes Pesados de Aço',
    slot: 'botas',
    tier: 'aco',
    nivelMin: 10,
    bonusAtaque: 0,
    bonusDefesa: 11,
    durabilidadeBase: 112,
    precoBase: 2000,
    icone: '🥾'
  },
  espada_aco: {
    id: 'espada_aco',
    nome: 'Espada Bastarda de Aço',
    slot: 'arma',
    tier: 'aco',
    nivelMin: 10,
    bonusAtaque: 30,
    bonusDefesa: 3,
    durabilidadeBase: 160,
    precoBase: 6000,
    icone: '🗡️'
  },
  escudo_aco: {
    id: 'escudo_aco',
    nome: 'Escudo Pavise de Aço',
    slot: 'escudo',
    tier: 'aco',
    nivelMin: 10,
    bonusAtaque: 0,
    bonusDefesa: 15,
    durabilidadeBase: 176,
    precoBase: 3500,
    icone: '🛡️'
  },

  // --- TIER MITHRIL (Nível 15) ---
  elmo_mithril: {
    id: 'elmo_mithril',
    nome: 'Coroa de Batalha de Mithril',
    slot: 'elmo',
    tier: 'mithril',
    nivelMin: 15,
    bonusAtaque: 0,
    bonusDefesa: 23,
    durabilidadeBase: 192,
    precoBase: 8000,
    icone: '💎'
  },
  armadura_mithril: {
    id: 'armadura_mithril',
    nome: 'Couraça Élfica de Mithril',
    slot: 'armadura',
    tier: 'mithril',
    nivelMin: 15,
    bonusAtaque: 0,
    bonusDefesa: 36,
    durabilidadeBase: 288,
    precoBase: 16000,
    icone: '🦺'
  },
  calca_mithril: {
    id: 'calca_mithril',
    nome: 'Perneiras Arcanas de Mithril',
    slot: 'calca',
    tier: 'mithril',
    nivelMin: 15,
    bonusAtaque: 0,
    bonusDefesa: 22,
    durabilidadeBase: 216,
    precoBase: 9600,
    icone: '👖'
  },
  botas_mithril: {
    id: 'botas_mithril',
    nome: 'Botas Aladas de Mithril',
    slot: 'botas',
    tier: 'mithril',
    nivelMin: 15,
    bonusAtaque: 0,
    bonusDefesa: 18,
    durabilidadeBase: 168,
    precoBase: 6400,
    icone: '👢'
  },
  espada_mithril: {
    id: 'espada_mithril',
    nome: 'Lâmina Celestial de Mithril',
    slot: 'arma',
    tier: 'mithril',
    nivelMin: 15,
    bonusAtaque: 50,
    bonusDefesa: 5,
    durabilidadeBase: 240,
    precoBase: 19200,
    icone: '✨'
  },
  escudo_mithril: {
    id: 'escudo_mithril',
    nome: 'Baluarte Luminescente de Mithril',
    slot: 'escudo',
    tier: 'mithril',
    nivelMin: 15,
    bonusAtaque: 0,
    bonusDefesa: 25,
    durabilidadeBase: 264,
    precoBase: 11200,
    icone: '🛡️'
  },

  // --- TIER DRAGÃO (Nível 20) ---
  elmo_dragao: {
    id: 'elmo_dragao',
    nome: 'Crânio do Dragão Ancestral',
    slot: 'elmo',
    tier: 'dragao',
    nivelMin: 20,
    bonusAtaque: 0,
    bonusDefesa: 36,
    durabilidadeBase: 288,
    precoBase: 25000,
    icone: '🐲'
  },
  armadura_dragao: {
    id: 'armadura_dragao',
    nome: 'Escamas Fundidas de Dragão',
    slot: 'armadura',
    tier: 'dragao',
    nivelMin: 20,
    bonusAtaque: 0,
    bonusDefesa: 55,
    durabilidadeBase: 432,
    precoBase: 50000,
    icone: '🐉'
  },
  calca_dragao: {
    id: 'calca_dragao',
    nome: 'Perneiras Dracônicas Ígneas',
    slot: 'calca',
    tier: 'dragao',
    nivelMin: 20,
    bonusAtaque: 0,
    bonusDefesa: 33,
    durabilidadeBase: 324,
    precoBase: 30000,
    icone: '🔥'
  },
  botas_dragao: {
    id: 'botas_dragao',
    nome: 'Garras Pisoteadoras de Dragão',
    slot: 'botas',
    tier: 'dragao',
    nivelMin: 20,
    bonusAtaque: 0,
    bonusDefesa: 28,
    durabilidadeBase: 252,
    precoBase: 20000,
    icone: '🐾'
  },
  espada_dragao: {
    id: 'espada_dragao',
    nome: 'Ruína Solar de Sangue Dracônico',
    slot: 'arma',
    tier: 'dragao',
    nivelMin: 20,
    bonusAtaque: 80,
    bonusDefesa: 8,
    durabilidadeBase: 360,
    precoBase: 60000,
    icone: '🗡️'
  },
  escudo_dragao: {
    id: 'escudo_dragao',
    nome: 'Coração Impenetrável de Dragão',
    slot: 'escudo',
    tier: 'dragao',
    nivelMin: 20,
    bonusAtaque: 0,
    bonusDefesa: 39,
    durabilidadeBase: 396,
    precoBase: 35000,
    icone: '🛡️'
  }
};

// Aliases para compatibilidade transitória com v2
export const EQUIPMENT_CATALOG: Record<string, any> = CATALOGO_EQUIPAMENTOS;

// --- RECEITAS DE FUNDIÇÃO (Minério -> Lingote) ---
export interface ReceitaFundicao {
  id: string;
  nome: string;
  minerioId: string;
  minerioQtd: number;
  carvaoQtd: number;
  adicionalId?: string;
  adicionalQtd?: number;
  resultadoId: string;
  resultadoNome: string;
  resultadoIcone: string;
}

export const RECEITAS_FUNDICAO: Record<string, ReceitaFundicao> = {
  ferro: {
    id: 'ferro',
    nome: 'Lingote de Ferro',
    minerioId: 'minerio_ferro',
    minerioQtd: 2,
    carvaoQtd: 1,
    resultadoId: 'lingote_ferro',
    resultadoNome: 'Lingote de Ferro',
    resultadoIcone: '🧱'
  },
  aco: {
    id: 'aco',
    nome: 'Lingote de Aço',
    minerioId: 'lingote_ferro',
    minerioQtd: 2,
    carvaoQtd: 2,
    resultadoId: 'lingote_aco',
    resultadoNome: 'Lingote de Aço',
    resultadoIcone: '⛓️'
  },
  ouro: {
    id: 'ouro',
    nome: 'Lingote de Ouro',
    minerioId: 'minerio_ouro',
    minerioQtd: 2,
    carvaoQtd: 1,
    resultadoId: 'lingote_ouro',
    resultadoNome: 'Lingote de Ouro',
    resultadoIcone: '🧈'
  },
  mithril: {
    id: 'mithril',
    nome: 'Lingote de Mithril',
    minerioId: 'lingote_ouro',
    minerioQtd: 2,
    carvaoQtd: 0,
    adicionalId: 'gema_bruta',
    adicionalQtd: 1,
    resultadoId: 'lingote_mithril',
    resultadoNome: 'Lingote de Mithril',
    resultadoIcone: '🔮'
  }
};

// --- RECEITAS DE FORJA ---
export interface ReceitaForja {
  id: string;
  nome: string;
  tipo: 'picareta' | 'equip';
  lingoteId?: string;
  lingoteQtd?: number;
  materiaisExtras?: { itemId: string; qtd: number }[];
  moedas: number;
  nivelMin: number;
  resultadoId: string;
}

export const RECEITAS_FORJA: Record<string, ReceitaForja> = {
  // Picaretas
  picareta_ferro: {
    id: 'picareta_ferro',
    nome: 'Picareta de Ferro',
    tipo: 'picareta',
    lingoteId: 'lingote_ferro',
    lingoteQtd: 12,
    materiaisExtras: [{ itemId: 'carvao', qtd: 5 }],
    moedas: 1500,
    nivelMin: 5,
    resultadoId: 'ferro'
  },
  picareta_ouro: {
    id: 'picareta_ouro',
    nome: 'Picareta de Ouro',
    tipo: 'picareta',
    lingoteId: 'lingote_ouro',
    lingoteQtd: 8,
    materiaisExtras: [
      { itemId: 'lingote_ferro', qtd: 8 },
      { itemId: 'gema_bruta', qtd: 3 }
    ],
    moedas: 3000,
    nivelMin: 10,
    resultadoId: 'ouro'
  },
  picareta_diamante: {
    id: 'picareta_diamante',
    nome: 'Picareta de Diamante',
    tipo: 'picareta',
    materiaisExtras: [
      { itemId: 'diamante_bruto', qtd: 6 },
      { itemId: 'lingote_ouro', qtd: 10 },
      { itemId: 'gema_bruta', qtd: 5 }
    ],
    moedas: 8000,
    nivelMin: 15,
    resultadoId: 'diamante'
  },

  // Equipamentos de Ferro
  elmo_ferro: { id: 'elmo_ferro', nome: 'Elmo de Ferro', tipo: 'equip', lingoteId: 'lingote_ferro', lingoteQtd: 5, moedas: 500, nivelMin: 5, resultadoId: 'elmo_ferro' },
  armadura_ferro: { id: 'armadura_ferro', nome: 'Armadura de Ferro', tipo: 'equip', lingoteId: 'lingote_ferro', lingoteQtd: 8, moedas: 800, nivelMin: 5, resultadoId: 'armadura_ferro' },
  calca_ferro: { id: 'calca_ferro', nome: 'Calça de Ferro', tipo: 'equip', lingoteId: 'lingote_ferro', lingoteQtd: 6, moedas: 600, nivelMin: 5, resultadoId: 'calca_ferro' },
  botas_ferro: { id: 'botas_ferro', nome: 'Botas de Ferro', tipo: 'equip', lingoteId: 'lingote_ferro', lingoteQtd: 4, moedas: 400, nivelMin: 5, resultadoId: 'botas_ferro' },
  espada_ferro: { id: 'espada_ferro', nome: 'Espada de Ferro', tipo: 'equip', lingoteId: 'lingote_ferro', lingoteQtd: 7, moedas: 700, nivelMin: 5, resultadoId: 'espada_ferro' },
  escudo_ferro: { id: 'escudo_ferro', nome: 'Escudo de Ferro', tipo: 'equip', lingoteId: 'lingote_ferro', lingoteQtd: 6, moedas: 600, nivelMin: 5, resultadoId: 'escudo_ferro' },

  // Equipamentos de Aço
  elmo_aco: { id: 'elmo_aco', nome: 'Elmo de Aço', tipo: 'equip', lingoteId: 'lingote_aco', lingoteQtd: 5, moedas: 1200, nivelMin: 10, resultadoId: 'elmo_aco' },
  armadura_aco: { id: 'armadura_aco', nome: 'Armadura de Aço', tipo: 'equip', lingoteId: 'lingote_aco', lingoteQtd: 8, moedas: 2000, nivelMin: 10, resultadoId: 'armadura_aco' },
  calca_aco: { id: 'calca_aco', nome: 'Calça de Aço', tipo: 'equip', lingoteId: 'lingote_aco', lingoteQtd: 6, moedas: 1500, nivelMin: 10, resultadoId: 'calca_aco' },
  botas_aco: { id: 'botas_aco', nome: 'Botas de Aço', tipo: 'equip', lingoteId: 'lingote_aco', lingoteQtd: 4, moedas: 1000, nivelMin: 10, resultadoId: 'botas_aco' },
  espada_aco: { id: 'espada_aco', nome: 'Espada de Aço', tipo: 'equip', lingoteId: 'lingote_aco', lingoteQtd: 7, moedas: 1800, nivelMin: 10, resultadoId: 'espada_aco' },
  escudo_aco: { id: 'escudo_aco', nome: 'Escudo de Aço', tipo: 'equip', lingoteId: 'lingote_aco', lingoteQtd: 6, moedas: 1500, nivelMin: 10, resultadoId: 'escudo_aco' },

  // Equipamentos de Mithril
  elmo_mithril: { id: 'elmo_mithril', nome: 'Elmo de Mithril', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 5, moedas: 4000, nivelMin: 15, resultadoId: 'elmo_mithril' },
  armadura_mithril: { id: 'armadura_mithril', nome: 'Armadura de Mithril', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 8, moedas: 6000, nivelMin: 15, resultadoId: 'armadura_mithril' },
  calca_mithril: { id: 'calca_mithril', nome: 'Calça de Mithril', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 6, moedas: 4500, nivelMin: 15, resultadoId: 'calca_mithril' },
  botas_mithril: { id: 'botas_mithril', nome: 'Botas de Mithril', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 4, moedas: 3500, nivelMin: 15, resultadoId: 'botas_mithril' },
  espada_mithril: { id: 'espada_mithril', nome: 'Espada de Mithril', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 7, moedas: 5500, nivelMin: 15, resultadoId: 'espada_mithril' },
  escudo_mithril: { id: 'escudo_mithril', nome: 'Escudo de Mithril', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 6, moedas: 4500, nivelMin: 15, resultadoId: 'escudo_mithril' },

  // Equipamentos de Dragão (Exige Mithril + 3 Escamas de Dragão)
  elmo_dragao: { id: 'elmo_dragao', nome: 'Elmo de Dragão', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 5, materiaisExtras: [{ itemId: 'escama_dragao', qtd: 3 }], moedas: 12000, nivelMin: 20, resultadoId: 'elmo_dragao' },
  armadura_dragao: { id: 'armadura_dragao', nome: 'Armadura de Dragão', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 8, materiaisExtras: [{ itemId: 'escama_dragao', qtd: 3 }], moedas: 18000, nivelMin: 20, resultadoId: 'armadura_dragao' },
  calca_dragao: { id: 'calca_dragao', nome: 'Calça de Dragão', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 6, materiaisExtras: [{ itemId: 'escama_dragao', qtd: 3 }], moedas: 14000, nivelMin: 20, resultadoId: 'calca_dragao' },
  botas_dragao: { id: 'botas_dragao', nome: 'Botas de Dragão', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 4, materiaisExtras: [{ itemId: 'escama_dragao', qtd: 3 }], moedas: 10000, nivelMin: 20, resultadoId: 'botas_dragao' },
  espada_dragao: { id: 'espada_dragao', nome: 'Espada de Dragão', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 7, materiaisExtras: [{ itemId: 'escama_dragao', qtd: 3 }], moedas: 16000, nivelMin: 20, resultadoId: 'espada_dragao' },
  escudo_dragao: { id: 'escudo_dragao', nome: 'Escudo de Dragão', tipo: 'equip', lingoteId: 'lingote_mithril', lingoteQtd: 6, materiaisExtras: [{ itemId: 'escama_dragao', qtd: 3 }], moedas: 14000, nivelMin: 20, resultadoId: 'escudo_dragao' }
};

// --- CATÁLOGO DE CONSUMÍVEIS & POÇÕES ---
export interface CatalogoConsumivel {
  id: string;
  nome: string;
  categoria: 'cura' | 'buff' | 'elixir' | 'util';
  preco: number;
  nivelMin: number;
  icone: string;
  toxicidade: number;
  descricao: string;
  naoVendivel?: boolean;
}

export const CATALOGO_CONSUMIVEIS: Record<string, CatalogoConsumivel> = {
  // Poções de Cura
  pocao_cura_p: {
    id: 'pocao_cura_p',
    nome: 'Poção de Cura P',
    categoria: 'cura',
    preco: 60,
    nivelMin: 1,
    icone: '🧪',
    toxicidade: 10,
    descricao: 'Restaura 25% do HP máximo (+10 toxicidade).'
  },
  pocao_cura_m: {
    id: 'pocao_cura_m',
    nome: 'Poção de Cura M',
    categoria: 'cura',
    preco: 200,
    nivelMin: 8,
    icone: '🧪',
    toxicidade: 15,
    descricao: 'Restaura 50% do HP máximo (+15 toxicidade).'
  },
  pocao_cura_g: {
    id: 'pocao_cura_g',
    nome: 'Poção de Cura G',
    categoria: 'cura',
    preco: 600,
    nivelMin: 15,
    icone: '⚗️',
    toxicidade: 20,
    descricao: 'Restaura 80% do HP máximo (+20 toxicidade).'
  },
  elixir_supremo: {
    id: 'elixir_supremo',
    nome: 'Elixir Supremo',
    categoria: 'cura',
    preco: 2500,
    nivelMin: 20,
    icone: '🌟',
    toxicidade: 0,
    descricao: 'Restaura 100% do HP máximo e purifica 50 de toxicidade.',
    naoVendivel: true
  },

  // Poções de Buff
  pocao_forca: {
    id: 'pocao_forca',
    nome: 'Poção de Força',
    categoria: 'buff',
    preco: 180,
    nivelMin: 1,
    icone: '💪',
    toxicidade: 25,
    descricao: '+15% de ataque durante 30 minutos.'
  },
  pocao_defesa: {
    id: 'pocao_defesa',
    nome: 'Poção de Defesa',
    categoria: 'buff',
    preco: 180,
    nivelMin: 1,
    icone: '🛡️',
    toxicidade: 25,
    descricao: '+15% de defesa durante 30 minutos.'
  },
  pocao_sorte: {
    id: 'pocao_sorte',
    nome: 'Poção de Sorte',
    categoria: 'buff',
    preco: 220,
    nivelMin: 1,
    icone: '🍀',
    toxicidade: 25,
    descricao: '+25% de chance de minérios raros durante 30 minutos.'
  },
  pocao_foco: {
    id: 'pocao_foco',
    nome: 'Poção de Foco',
    categoria: 'buff',
    preco: 200,
    nivelMin: 1,
    icone: '🎯',
    toxicidade: 25,
    descricao: '-25% de cooldown na mineração (piso 2min) durante 20 minutos.'
  },
  pocao_sabedoria: {
    id: 'pocao_sabedoria',
    nome: 'Poção de Sabedoria',
    categoria: 'buff',
    preco: 250,
    nivelMin: 1,
    icone: '📖',
    toxicidade: 25,
    descricao: '+25% de EXP recebida durante 60 minutos.'
  },
  pocao_energia: {
    id: 'pocao_energia',
    nome: 'Poção de Energia',
    categoria: 'buff',
    preco: 150,
    nivelMin: 1,
    icone: '⚡',
    toxicidade: 20,
    descricao: 'Recupera +30 de Energia instantaneamente (limite 3/dia).'
  },

  // Elixires Permanentes (máximo 10 usos cada)
  elixir_vitalidade: {
    id: 'elixir_vitalidade',
    nome: 'Elixir de Vitalidade',
    categoria: 'elixir',
    preco: 3000,
    nivelMin: 10,
    icone: '❤️',
    toxicidade: 0,
    descricao: 'Concede permanentemente +10 ao HP máximo (máximo 10 usos).',
    naoVendivel: true
  },
  elixir_poder: {
    id: 'elixir_poder',
    nome: 'Elixir de Poder',
    categoria: 'elixir',
    preco: 3500,
    nivelMin: 10,
    icone: '⚔️',
    toxicidade: 0,
    descricao: 'Concede permanentemente +2 ao Ataque base (máximo 10 usos).',
    naoVendivel: true
  },
  elixir_guarda: {
    id: 'elixir_guarda',
    nome: 'Elixir da Guarda',
    categoria: 'elixir',
    preco: 3500,
    nivelMin: 10,
    icone: '🛡️',
    toxicidade: 0,
    descricao: 'Concede permanentemente +2 à Defesa base (máximo 10 usos).',
    naoVendivel: true
  },

  // Outros Consumíveis Úteis
  pedra_amolar: {
    id: 'pedra_amolar',
    nome: 'Pedra de Amolar',
    categoria: 'util',
    preco: 350,
    nivelMin: 1,
    icone: '🪨',
    toxicidade: 0,
    descricao: 'Restaura 25% da durabilidade máxima de uma arma ou escudo equipado.'
  },
  kit_reparo: {
    id: 'kit_reparo',
    nome: 'Kit de Reparo de Ferramentas',
    categoria: 'util',
    preco: 400,
    nivelMin: 1,
    icone: '🧰',
    toxicidade: 0,
    descricao: 'Restaura +30 de durabilidade na picareta sem custos em moedas.'
  },
  pergaminho_protecao: {
    id: 'pergaminho_protecao',
    nome: 'Pergaminho de Proteção Arcana',
    categoria: 'util',
    preco: 1200,
    nivelMin: 1,
    icone: '📜',
    toxicidade: 0,
    descricao: 'Protege o equipamento de ser destruído em falhas de encantamento (+3 ou superior).'
  },
  bandagem: {
    id: 'bandagem',
    nome: 'Bandagem de Primeiros Socorros',
    categoria: 'cura',
    preco: 40,
    nivelMin: 1,
    icone: '🩹',
    toxicidade: 0,
    descricao: 'Cura 10% do HP máximo sem gerar toxicidade (cooldown 60s, limite 5/dia).'
  }
};

// Aliases para materiais de mineração e forja
export const MATERIAIS_CATALOGO: Record<string, { nome: string; icone: string; precoVenda: number }> = {
  pedra: { nome: 'Pedra Rústica', icone: '🪨', precoVenda: 15 },
  carvao: { nome: 'Carvão Mineral', icone: '🪨', precoVenda: 30 },
  minerio_ferro: { nome: 'Minério de Ferro', icone: '⛏️', precoVenda: 45 },
  minerio_ouro: { nome: 'Minério de Ouro', icone: '✨', precoVenda: 90 },
  gema_bruta: { nome: 'Gema Bruta de Encantamento', icone: '💎', precoVenda: 250 },
  diamante_bruto: { nome: 'Diamante Bruto', icone: '💠', precoVenda: 600 },
  lingote_ferro: { nome: 'Lingote de Ferro', icone: '🧱', precoVenda: 120 },
  lingote_aco: { nome: 'Lingote de Aço', icone: '⛓️', precoVenda: 350 },
  lingote_ouro: { nome: 'Lingote de Ouro', icone: '🧈', precoVenda: 280 },
  lingote_mithril: { nome: 'Lingote de Mithril', icone: '🔮', precoVenda: 900 },
  escama_dragao: { nome: 'Escama de Dragão Ígneo', icone: '🐉', precoVenda: 2000 }
};

// --- FACTORY HELPERS ---
export function criarInstanciaPicareta(tipo: PicaretaTipo): InstanciaPicareta {
  const cat = CATALOGO_PICARETAS[tipo] || CATALOGO_PICARETAS.madeira;
  return {
    uid: `pic_${Math.random().toString(36).substring(2, 9)}`,
    tipo: cat.tipo,
    nome: cat.nome,
    durabilidade: cat.durabilidadeBase,
    durabilidadeMax: cat.durabilidadeBase,
    durabilidadeOriginal: cat.durabilidadeBase,
    reparos: 0,
    nivelMin: cat.nivelMin,
    multMoedas: cat.multMoedas,
    reducaoCd: cat.reducaoCd,
    icone: cat.icone
  };
}

export function criarInstanciaEquip(itemId: string, raridade: Raridade = 'comum'): InstanciaEquip {
  const cat = CATALOGO_EQUIPAMENTOS[itemId] || CATALOGO_EQUIPAMENTOS.espada_madeira;
  const multRar = CONFIG_ITENS.raridade[raridade] || CONFIG_ITENS.raridade.comum;
  const durMax = Math.round(cat.durabilidadeBase * multRar.durab);

  return {
    uid: `eq_${Math.random().toString(36).substring(2, 9)}`,
    itemId: cat.id,
    nome: cat.nome,
    slot: cat.slot,
    tier: cat.tier,
    raridade,
    durabilidade: durMax,
    durabilidadeMax: durMax,
    durabilidadeOriginal: durMax,
    reparos: 0,
    encantamento: 0,
    icone: cat.icone
  };
}

// --- MIGRAÇÃO DE PERFIS ANTIGOS ---
export function migrarPerfilParaV3(rawProfile: any): PlayerProfile {
  const p = { ...rawProfile };

  // Migrar picareta legada para ferramenta v3
  if (!p.ferramenta) {
    if (p.picareta) {
      const tipoRaw = (p.picareta.tipo || 'madeira').toLowerCase() as PicaretaTipo;
      const tipo = ['madeira', 'pedra', 'ferro', 'ouro', 'diamante'].includes(tipoRaw) ? tipoRaw : 'madeira';
      const inst = criarInstanciaPicareta(tipo);
      // Preservar proporção de durabilidade
      const prop = p.picareta.durabilidadeMax > 0 ? p.picareta.durabilidade / p.picareta.durabilidadeMax : 1;
      inst.durabilidade = Math.max(1, Math.round(inst.durabilidadeMax * prop));
      p.ferramenta = inst;
    } else {
      p.ferramenta = criarInstanciaPicareta('madeira');
    }
  }

  // Migrar equipamentos antigos para InstanciaEquip
  if (!p.equipamentos || typeof p.equipamentos !== 'object') {
    p.equipamentos = { elmo: null, armadura: null, calca: null, botas: null, arma: null, escudo: null };
  } else {
    for (const slot of ['elmo', 'armadura', 'calca', 'botas', 'arma', 'escudo'] as EquipSlot[]) {
      const item = p.equipamentos[slot];
      if (item && (!item.uid || !item.tier)) {
        p.equipamentos[slot] = criarInstanciaEquip(item.id || `${slot}_couro`, 'comum');
        if (item.nivelEncantamento) {
          p.equipamentos[slot].encantamento = item.nivelEncantamento;
        }
      }
    }
  }

  // Migrar inventário antigo
  if (!Array.isArray(p.inventario)) {
    p.inventario = [];
  } else {
    p.inventario = p.inventario.map((item: any) => {
      if (item.instancia) return item; // já é v3
      if (item.tipo === 'equipamento') {
        return {
          uid: `inv_${Math.random().toString(36).substring(2, 9)}`,
          tipo: 'equip' as const,
          instancia: criarInstanciaEquip(item.itemId || item.id || 'espada_madeira', 'comum')
        };
      }
      return {
        uid: item.uid || `mat_${Math.random().toString(36).substring(2, 9)}`,
        tipo: 'material' as const,
        itemId: item.itemId || item.id || 'pedra',
        nome: item.nome || 'Material',
        quantidade: item.quantidade || 1,
        icone: item.icone || '📦',
        precoVenda: item.precoVenda || 15,
        descricao: item.descricao
      };
    });
  }

  // Inicializar Baú de Espera
  if (!Array.isArray(p.bauEspera)) p.bauEspera = [];

  // Inicializar Buffs, Toxicidade & Elixires
  if (!Array.isArray(p.buffs)) p.buffs = [];
  if (typeof p.toxicidade !== 'number') p.toxicidade = 0;
  if (!p.ultimaAtualizacaoToxicidade) p.ultimaAtualizacaoToxicidade = Date.now();
  if (!p.elixires) p.elixires = { vitalidade: 0, poder: 0, guarda: 0 };

  // Inicializar Cooldowns novos
  if (!p.cooldowns) p.cooldowns = {} as any;
  p.cooldowns.forjar = p.cooldowns.forjar || 0;
  p.cooldowns.fundir = p.cooldowns.fundir || 0;
  p.cooldowns.pocaoCura = p.cooldowns.pocaoCura || 0;

  // Inicializar contadores24h
  if (!p.contadores24h) p.contadores24h = {} as any;
  if (!Array.isArray(p.contadores24h.pocoesCura)) p.contadores24h.pocoesCura = [];

  return p as PlayerProfile;
}

// --- DUNGEONS & ARENAS CATALOGS ---
export const ARENA_TIERS: ArenaTier[] = [
  { id: 1, nome: 'Bronze', custoEntrada: 100, ondasTotal: 3, recompensaMoedas: 300, recompensaXp: 120, icone: '🥉', nivelRecomendado: 1 },
  { id: 2, nome: 'Prata', custoEntrada: 500, ondasTotal: 3, recompensaMoedas: 1500, recompensaXp: 400, icone: '🥈', nivelRecomendado: 5 },
  { id: 3, nome: 'Ouro', custoEntrada: 2000, ondasTotal: 3, recompensaMoedas: 6000, recompensaXp: 1200, icone: '🥇', nivelRecomendado: 10 },
  { id: 4, nome: 'Diamante', custoEntrada: 8000, ondasTotal: 3, recompensaMoedas: 25000, recompensaXp: 3500, icone: '💎', nivelRecomendado: 15 }
];

export const DUNGEONS_CATALOG: DungeonDef[] = [
  {
    id: 'caverna_escura',
    nome: 'Caverna dos Trogloditas',
    nivelMin: 1,
    jogadoresMax: 3,
    ondas: 3,
    boss: { nome: 'Gargantua das Pedras', hpMax: 1200, ataque: 35, defesa: 20, icone: '🗿' },
    recompensaMoedas: 800,
    recompensaXp: 350,
    icone: '🦇',
    dropLoot: ['lingote_ferro', 'pocao_cura_m', 'pedra_amolar']
  },
  {
    id: 'cripta_ancestral',
    nome: 'Cripta dos Amaldiçoados',
    nivelMin: 6,
    jogadoresMax: 4,
    ondas: 4,
    boss: { nome: 'Lorde Lich Malakar', hpMax: 3500, ataque: 68, defesa: 42, icone: '💀' },
    recompensaMoedas: 3200,
    recompensaXp: 1100,
    icone: '⚰️',
    dropLoot: ['lingote_aco', 'gema_bruta', 'kit_reparo', 'pocao_forca']
  },
  {
    id: 'vulcao_infernal',
    nome: 'Fornalha do Dragão Ígneo',
    nivelMin: 12,
    jogadoresMax: 4,
    ondas: 4,
    boss: { nome: 'Ignis, o Dragão Tirano', hpMax: 8500, ataque: 125, defesa: 80, icone: '🐲' },
    recompensaMoedas: 12000,
    recompensaXp: 4000,
    icone: '🌋',
    dropLoot: ['escama_dragao', 'diamante_bruto', 'lingote_mithril', 'elixir_vitalidade']
  },
  {
    id: 'abismo_sombrio',
    nome: 'Abismo dos Esquecidos',
    nivelMin: 18,
    jogadoresMax: 5,
    ondas: 5,
    boss: { nome: 'Devorador das Sombras', hpMax: 18000, ataque: 210, defesa: 130, icone: '👁️' },
    recompensaMoedas: 35000,
    recompensaXp: 10000,
    icone: '🌌',
    dropLoot: ['escama_dragao', 'elixir_supremo', 'elixir_poder', 'pergaminho_protecao']
  }
];

export const DAILY_QUESTS: DailyQuest[] = [
  { id: 'q_mine_5', descricao: 'Explorar veios de minério (#mine) 5 vezes', progressoMax: 5, recompensaMoedas: 300, recompensaXp: 100, tipo: 'mine' },
  { id: 'q_work_3', descricao: 'Cumprir 3 turnos de trabalho (#trabalhar)', progressoMax: 3, recompensaMoedas: 250, recompensaXp: 80, tipo: 'trabalho' },
  { id: 'q_pvp_2', descricao: 'Desafiar 2 adversários em duelo (#duelorpg)', progressoMax: 2, recompensaMoedas: 400, recompensaXp: 150, tipo: 'duelo' },
  { id: 'q_dungeon_1', descricao: 'Completar 1 incursão em Dungeon cooperativa (#dungeon)', progressoMax: 1, recompensaMoedas: 800, recompensaXp: 300, tipo: 'dungeon' },
  { id: 'q_roleta_3', descricao: 'Fazer 3 apostas na Roleta do Cassino (#roleta)', progressoMax: 3, recompensaMoedas: 200, recompensaXp: 50, tipo: 'roleta' },
  { id: 'q_consertar_1', descricao: 'Consertar 1 equipamento ou picareta desgastada (#consertar)', progressoMax: 1, recompensaMoedas: 200, recompensaXp: 80, tipo: 'consertar' },
  { id: 'q_pocao_1', descricao: 'Beber 1 poção ou elixir no campo (#usar)', progressoMax: 1, recompensaMoedas: 150, recompensaXp: 60, tipo: 'pocao' }
];

export const INITIAL_PROFILES: PlayerProfile[] = [
  migrarPerfilParaV3({
    id: 'nunesjj',
    nome: 'nunesjj',
    donoId: 'user_1',
    avatar: '🧙‍♂️',
    nivel: 6,
    xp: 220,
    xpProximo: 600,
    hp: 310,
    hpMax: 310,
    ataqueBase: 38,
    defesaBase: 26,
    energia: 100,
    energiaMax: 112,
    ultimaAtualizacaoEnergia: Date.now(),
    moedas: 4500,
    vitoriasPvP: 8,
    derrotasPvP: 2,
    dungeonsCompletadas: 3,
    ferramenta: criarInstanciaPicareta('ferro'),
    equipamentos: {
      elmo: criarInstanciaEquip('elmo_ferro', 'incomum'),
      armadura: criarInstanciaEquip('armadura_ferro', 'comum'),
      calca: criarInstanciaEquip('calca_couro', 'comum'),
      botas: criarInstanciaEquip('botas_ferro', 'comum'),
      arma: criarInstanciaEquip('espada_ferro', 'incomum'),
      escudo: criarInstanciaEquip('escudo_ferro', 'comum')
    },
    inventario: [
      { uid: 'inv_1', tipo: 'material', itemId: 'lingote_ferro', nome: 'Lingote de Ferro', quantidade: 8, icone: '🧱', precoVenda: 120 },
      { uid: 'inv_2', tipo: 'material', itemId: 'carvao', nome: 'Carvão Mineral', quantidade: 14, icone: '🪨', precoVenda: 30 },
      { uid: 'inv_3', tipo: 'material', itemId: 'gema_bruta', nome: 'Gema Bruta de Encantamento', quantidade: 2, icone: '💎', precoVenda: 250 },
      { uid: 'inv_4', tipo: 'consumivel', itemId: 'pocao_cura_m', nome: 'Poção de Cura M', quantidade: 3, icone: '🧪', precoVenda: 80 }
    ],
    bauEspera: [],
    buffs: [],
    toxicidade: 0,
    ultimaAtualizacaoToxicidade: Date.now(),
    elixires: { vitalidade: 1, poder: 0, guarda: 0 },
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
      streak: 4,
      coletadoHoje: false,
      pocoesEnergiaCompradas: 0,
      pocoesCuraUsadasHoje: 0,
      questsConcluidas: []
    },
    pet: {
      tipo: 'lobo',
      nome: 'Fenrir',
      icone: '🐺',
      nivel: 3,
      xp: 45,
      fomeAteTimestamp: Date.now() + 6 * 3600 * 1000,
      bonusDanoPct: 5,
      bonusCriticoPct: 8
    },
    claId: 'cla_valhalla'
  }),
  migrarPerfilParaV3({
    id: 'alexbot',
    nome: 'ALEXBOT',
    donoId: 'bot_alex',
    avatar: '🤖',
    nivel: 8,
    xp: 510,
    xpProximo: 800,
    hp: 420,
    hpMax: 420,
    ataqueBase: 52,
    defesaBase: 38,
    energia: 100,
    energiaMax: 116,
    ultimaAtualizacaoEnergia: Date.now(),
    moedas: 8900,
    vitoriasPvP: 14,
    derrotasPvP: 5,
    dungeonsCompletadas: 6,
    ferramenta: criarInstanciaPicareta('ouro'),
    equipamentos: {
      elmo: criarInstanciaEquip('elmo_aco', 'raro'),
      armadura: criarInstanciaEquip('armadura_aco', 'incomum'),
      calca: criarInstanciaEquip('calca_aco', 'comum'),
      botas: criarInstanciaEquip('botas_aco', 'comum'),
      arma: criarInstanciaEquip('espada_aco', 'raro'),
      escudo: criarInstanciaEquip('escudo_aco', 'comum')
    },
    inventario: [
      { uid: 'inv_5', tipo: 'material', itemId: 'lingote_aco', nome: 'Lingote de Aço', quantidade: 6, icone: '⛓️', precoVenda: 350 },
      { uid: 'inv_6', tipo: 'consumivel', itemId: 'pocao_forca', nome: 'Poção de Força', quantidade: 2, icone: '💪', precoVenda: 70 },
      { uid: 'inv_7', tipo: 'consumivel', itemId: 'pedra_amolar', nome: 'Pedra de Amolar', quantidade: 1, icone: '🪨', precoVenda: 140 }
    ],
    bauEspera: [],
    buffs: [],
    toxicidade: 0,
    ultimaAtualizacaoToxicidade: Date.now(),
    elixires: { vitalidade: 2, poder: 2, guarda: 1 },
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
      streak: 7,
      coletadoHoje: true,
      pocoesEnergiaCompradas: 0,
      pocoesCuraUsadasHoje: 0,
      questsConcluidas: ['q_mine_5']
    },
    pet: {
      tipo: 'dragao',
      nome: 'Draco',
      icone: '🐲',
      nivel: 5,
      xp: 120,
      fomeAteTimestamp: Date.now() + 12 * 3600 * 1000,
      bonusDanoPct: 10,
      bonusCriticoPct: 15
    },
    claId: 'cla_valhalla'
  })
];

export const INITIAL_CLANS: ClanData[] = [
  {
    id: 'cla_valhalla',
    nome: 'Guerreiros de Valhalla',
    tag: 'VALH',
    liderId: 'alexbot',
    membrosIds: ['alexbot', 'nunesjj'],
    nivel: 3,
    moedasBanco: 45000,
    vitoriasGuerra: 12,
    criadoEmTimestamp: Date.now() - 30 * 24 * 3600 * 1000
  },
  {
    id: 'cla_sombras',
    nome: 'Legião das Sombras',
    tag: 'DARK',
    liderId: 'shadowk',
    membrosIds: ['shadowk', 'jahbot'],
    nivel: 2,
    moedasBanco: 18000,
    vitoriasGuerra: 6,
    criadoEmTimestamp: Date.now() - 15 * 24 * 3600 * 1000
  }
];

export const PET_CATALOG: Record<
  string,
  { tipo: 'lobo' | 'gato' | 'dragao'; nome: string; preco: number; bonusDanoPct: number; bonusCriticoPct: number; icone: string }
> = {
  lobo: { tipo: 'lobo', nome: 'Lobo Cinzento', preco: 1500, bonusDanoPct: 5, bonusCriticoPct: 8, icone: '🐺' },
  gato: { tipo: 'gato', nome: 'Gato Sombrio', preco: 3000, bonusDanoPct: 8, bonusCriticoPct: 12, icone: '🐱' },
  dragao: { tipo: 'dragao', nome: 'Dragão Carmesim', preco: 10000, bonusDanoPct: 15, bonusCriticoPct: 20, icone: '🐲' }
};

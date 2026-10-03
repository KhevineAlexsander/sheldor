export type Raridade = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario';
export type EquipSlot = 'elmo' | 'armadura' | 'calca' | 'botas' | 'arma' | 'escudo';
export type EquipTier = 'couro' | 'ferro' | 'aco' | 'mithril' | 'dragao';
export type PicaretaTipo = 'madeira' | 'pedra' | 'ferro' | 'ouro' | 'diamante';

export interface InstanciaEquip {
  uid: string;
  itemId: string;
  nome: string;
  slot: EquipSlot;
  tier: EquipTier;
  raridade: Raridade;
  durabilidade: number;
  durabilidadeMax: number;
  durabilidadeOriginal: number;
  reparos: number;
  encantamento: number; // 0 a 5
  icone: string;
}

export interface InstanciaPicareta {
  uid: string;
  tipo: PicaretaTipo;
  nome: string;
  durabilidade: number;
  durabilidadeMax: number;
  durabilidadeOriginal: number;
  reparos: number;
  nivelMin: number;
  multMoedas: number;
  reducaoCd: number;
  icone: string;
}

export interface CatalogoEquipItem {
  id: string;
  nome: string;
  slot: EquipSlot;
  tier: EquipTier;
  nivelMin: number;
  bonusAtaque: number;
  bonusDefesa: number;
  durabilidadeBase: number;
  precoBase: number;
  icone: string;
}

export interface CatalogoPicaretaItem {
  tipo: PicaretaTipo;
  nome: string;
  nivelMin: number;
  durabilidadeBase: number;
  multMoedas: number;
  reducaoCd: number;
  preco: number;
  icone: string;
}

export interface BuffAtivo {
  tipo: 'forca' | 'defesa' | 'sorte' | 'foco' | 'sabedoria';
  valor: number;
  expiraEm: number;
  nome: string;
  icone: string;
}

export interface BauItem {
  itemId: string;
  nome: string;
  quantidade: number;
  expiraEm: number;
  icone: string;
}

export type ItemInventario =
  | {
      uid: string;
      tipo: 'material' | 'consumivel';
      itemId: string;
      nome: string;
      quantidade: number;
      icone: string;
      precoVenda: number;
      descricao?: string;
    }
  | {
      uid: string;
      tipo: 'equip';
      instancia: InstanciaEquip;
    }
  | {
      uid: string;
      tipo: 'picareta';
      instancia: InstanciaPicareta;
    };

export interface ArenaTier {
  id: number;
  nome: string;
  custoEntrada: number;
  ondasTotal: number;
  recompensaMoedas: number;
  recompensaXp: number;
  icone: string;
  nivelRecomendado: number;
}

export interface DailyQuest {
  id: string;
  descricao: string;
  progressoMax: number;
  recompensaMoedas: number;
  recompensaXp: number;
  tipo: string;
}

export interface DungeonDef {
  id: string;
  nome: string;
  nivelMin: number;
  jogadoresMax: number;
  ondas: number;
  boss: {
    nome: string;
    hpMax: number;
    ataque: number;
    defesa: number;
    icone: string;
  };
  recompensaMoedas: number;
  recompensaXp: number;
  icone: string;
  dropLoot: string[];
}

export interface PetData {
  tipo: 'lobo' | 'gato' | 'dragao';
  nome: string;
  icone: string;
  nivel: number;
  xp: number;
  fomeAteTimestamp: number;
  bonusDanoPct: number;
  bonusCriticoPct: number;
}

export interface PlayerCooldowns {
  mine: number;
  trabalhar: number;
  arena: number;
  duelo: number;
  dungeon: number;
  curar: number;
  consertar: number;
  forjar: number;
  fundir: number;
  encantar: number;
  pocaoCura: number;
  roleta: number;
  petTreinar: number;
}

export interface PlayerDailyData {
  data: string;
  streak: number;
  coletadoHoje: boolean;
  pocoesEnergiaCompradas: number;
  pocoesCuraUsadasHoje: number;
  questsConcluidas: string[];
}

export interface PlayerContadores24h {
  mine: number[];
  trabalhar: number[];
  pocoesCura: number[];
  roletaContador: number;
  duelosPorOponente: Record<string, number[]>;
}

export interface PlayerProfile {
  id: string;
  nome: string;
  donoId?: string;
  avatar: string;
  nivel: number;
  xp: number;
  xpProximo: number;
  hp: number;
  hpMax: number;
  ataqueBase: number;
  defesaBase: number;
  energia: number;
  energiaMax: number;
  ultimaAtualizacaoEnergia: number;
  moedas: number;
  vitoriasPvP: number;
  derrotasPvP: number;
  dungeonsCompletadas: number;

  // v3.0 Ferramenta (Picareta)
  ferramenta: InstanciaPicareta | null;
  // Compatibilidade transitória com v2
  picareta?: {
    tipo: string;
    durabilidade: number;
    durabilidadeMax: number;
    nivel: number;
  };

  // v3.0 Equipamentos instanciados
  equipamentos: {
    elmo: InstanciaEquip | null;
    armadura: InstanciaEquip | null;
    calca: InstanciaEquip | null;
    botas: InstanciaEquip | null;
    arma: InstanciaEquip | null;
    escudo: InstanciaEquip | null;
  };

  // v3.0 Inventário e Baú
  inventario: ItemInventario[];
  bauEspera: BauItem[];

  // v3.0 Buffs, Toxicidade & Elixires
  buffs: BuffAtivo[];
  toxicidade: number;
  ultimaAtualizacaoToxicidade: number;
  elixires: {
    vitalidade: number;
    poder: number;
    guarda: number;
  };

  cooldowns: PlayerCooldowns;
  contadores24h: PlayerContadores24h;
  diario: PlayerDailyData;
  pet: PetData | null;
  claId?: string | null;
}

export interface ClanData {
  id: string;
  nome: string;
  tag: string;
  liderId: string;
  membrosIds: string[];
  nivel: number;
  moedasBanco: number;
  vitoriasGuerra: number;
  criadoEmTimestamp: number;
}

export interface DungeonParty {
  id: string;
  dungeonId: string;
  criadorId: string;
  membrosIds: string[];
  status: 'esperando' | 'em_combate' | 'vitoria' | 'derrota';
  bossHpAtual: number;
  expiraEmTimestamp: number;
}

export interface BotChatMessage {
  id: string;
  remetente: 'user' | 'bot';
  texto: string;
  timestamp: string;
  comandoOrigem?: string;
}

export interface EngineResult {
  messageText: string;
  updatedProfiles: PlayerProfile[];
  activeProfileId: string;
  activeParty: DungeonParty | null;
  updatedClans?: ClanData[];
  soundType?: 'success' | 'fumble' | 'hit' | 'levelup' | 'heal' | 'dice';
}

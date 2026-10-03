export interface Attributes {
  forca: number; // FOR
  agilidade: number; // AGI
  vitalidade: number; // VIT
  inteligencia: number; // INT
  percepcao: number; // PER
}

export interface Character {
  nome: string;
  classe: string;
  nivel: number;
  xpAtual: number;
  xpProximo: number;
  hpAtual: number;
  hpMax: number;
  manaAtual: number;
  manaMax: number;
  atributos: Attributes;
  inventario: string[];
  moedas: number;
  statusEspecial: string;
  tema: string;
  avatarIcon?: string;
  pontosDisponiveis?: number;
}

export interface Enemy {
  nome: string;
  hpAtual: number;
  hpMax: number;
  ataque: number;
  defesa: number;
  descricao?: string;
  recompensaXp?: number;
  recompensaLoot?: string[];
  recompensaMoedas?: number;
}

export interface CombatState {
  emCombate: boolean;
  rodada: number;
  iniciativaJogador: number;
  iniciativaInimigo: number;
  vezDoJogador: boolean;
  inimigo: Enemy | null;
  historicoCombate?: string[];
}

export interface DiceRollResult {
  atributoNome: string;
  d20: number;
  modificador: number;
  total: number;
  dificuldade: number;
  sucesso: boolean;
  critico: boolean; // Natural 20
  falhaCritica: boolean; // Natural 1
  descricaoFormatada: string;
}

export interface TurnResponse {
  rawGMResponse: string;
  statusTexto?: string;
  narrativa: string;
  opcoes: string[];
  rolagem?: DiceRollResult | null;
  combate?: CombatState | null;
  danoJogador?: number;
  danoInimigo?: number;
  curaJogador?: number;
  xpGanho?: number;
  lootGanho?: string[];
  moedasGanhas?: number;
  novoStatus?: string;
  gameOver?: boolean;
  subiuDeNivel?: boolean;
}

export interface GameLogMessage {
  id: string;
  remetente: 'mestre' | 'jogador' | 'sistema';
  conteudo: string;
  rolagem?: DiceRollResult | null;
  timestamp: string;
  statusSnapshot?: {
    hp: number;
    hpMax: number;
    mana: number;
    manaMax: number;
    nivel: number;
  };
}

export interface UniversePreset {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  icone: string;
  bannerColor: string;
  exemploCenario: string;
  classesSugeridas: string[];
}

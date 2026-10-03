import { Attributes, Character, UniversePreset } from '../types/game';

export const UNIVERSES: UniversePreset[] = [
  {
    id: 'ilha_do_martelo',
    titulo: 'O Torneio da Ilha do Martelo (3DeT Victory)',
    subtitulo: 'Artes Marciais Épicas, Shonen & Exército Arsenal',
    descricao:
      'A cada dois anos, os maiores lutadores da Terra e de mundos além-convergência recebem um misterioso envelope púrpura. Na lendária Ilha do Martelo, enfrentam guerreiros supremos sob o jugo do temível General Púrpura!',
    icone: '⚔️',
    bannerColor: 'from-amber-600 via-purple-700 to-indigo-950',
    exemploCenario: 'A arena colossal da Ilha do Martelo com holofotes púrpuras cortando os céus e a multidão rugindo.',
    classesSugeridas: ['Artista Marcial', 'Guerreiro de Kendô', 'Soldado Tático', 'Arcanauta', 'Ninja Renegado', 'Ciborgue de Combate']
  },
  {
    id: 'fantasia_medieval',
    titulo: 'Fantasia Medieval & Tormenta',
    subtitulo: 'Espadas, Masmorras, Deuses e Monstros Ancestrais',
    descricao:
      'Uma terra de lendas esquecidas, florestas élficas ancestrais, ruínas dominadas por cultistas e dragões adormecidos sobre tesouros proibidos.',
    icone: '🛡️',
    bannerColor: 'from-amber-700 via-orange-800 to-stone-950',
    exemploCenario: 'Uma taverna úmida na fronteira de um reino ameaçado por uma névoa escarlate maligna.',
    classesSugeridas: ['Guerreiro de Armadura', 'Mago Evocador', 'Paladino Sagrado', 'Ladino das Sombras', 'Clérigo Curador', 'Patrulheiro Selvagem']
  },
  {
    id: 'cyberpunk_2099',
    titulo: 'Cyberpunk 2099: Neo-Metrópole',
    subtitulo: 'Cromados, Alta Tecnologia, Baixa Vida e Néon',
    descricao:
      'Megacorporações governam das alturas de arranha-céus colossais, enquanto nas sarjetas chuvosas e imersas em néon, mercenários e netrunners arriscam a vida por dados e eurodólares.',
    icone: '⚡',
    bannerColor: 'from-cyan-500 via-fuchsia-600 to-slate-950',
    exemploCenario: 'Um beco estreito banhado por chuva ácida e hologramas fluorescentes defeituosos na Baixa Metrópole.',
    classesSugeridas: ['Mercenário Solo', 'Netrunner Hacker', 'Techie Biônico', 'Atirador de Precisão', 'Infiltrador Cromado']
  },
  {
    id: 'terror_cosmico',
    titulo: 'Terror Cósmico nas Sombras',
    subtitulo: 'Mistérios Ocultos, Entidades Proibidas & Sanidade',
    descricao:
      'Na década de 1920 ou em eras esquecidas, segredos cósmicos sussurram em vilarejos costeiros isolados e grimórios esquecidos. Cada verdade descoberta custa um fragmento de sua mente.',
    icone: '👁️',
    bannerColor: 'from-emerald-900 via-teal-950 to-black',
    exemploCenario: 'Um píer envolto em névoa salgada e pesada onde moradores com rostos estranhos observam em silêncio.',
    classesSugeridas: ['Detetive Ocultista', 'Erudito de Antiguidades', 'Médico Alienista', 'Jornalista Investigativo', 'Médium Espiritualista']
  },
  {
    id: 'pos_apocaliptico',
    titulo: 'Ermos Pós-Apocalípticos',
    subtitulo: 'Sobrevivência, Sucata, Carcaças e Areia Tóxica',
    descricao:
      'Cinzas cobrem a civilização caída. Gangues motorizadas disputam os últimos galões de combustível e água potável entre carcaças de ferro oxidado.',
    icone: '☢️',
    bannerColor: 'from-amber-600 via-yellow-900 to-neutral-950',
    exemploCenario: 'Um posto de gasolina fortificado em meio a dunas de areia radioativa e fumaça de diesel.',
    classesSugeridas: ['Sucateiro do Deserto', 'Pistoleiro dos Ermos', 'Mecânico de Blindados', 'Mutante Adaptado', 'Rastreador Nômade']
  },
  {
    id: 'sci_fi',
    titulo: 'Fronteira Estelar Sci-Fi',
    subtitulo: 'Naves de Batalha, Estações Orbitais e Mundos Alienígenas',
    descricao:
      'Nos limites da galáxia conhecida, naves de carga e esquadrões de elite cruzam portais de salto espacial descobrindo megastruturas alienígenas esquecidas.',
    icone: '🚀',
    bannerColor: 'from-blue-600 via-indigo-900 to-slate-950',
    exemploCenario: 'A baía de descompressão de uma estação espacial militar flutuando na órbita de uma anã branca.',
    classesSugeridas: ['Piloto Estelar', 'Fuzileiro de Choque', 'Engenheiro Quântico', 'Especialista em Xenologia', 'Contrabandista Galáctico']
  }
];

export interface PresetHero {
  nome: string;
  classe: string;
  universoId: string;
  descricao: string;
  atributos: Attributes;
  inventario: string[];
  moedas: number;
  avatarIcon: string;
}

export const PRESET_HEROES: PresetHero[] = [
  // 3DeT Victory / Ilha do Martelo Heroes
  {
    nome: 'Rin Asakusa',
    classe: 'Campeã de Artes Marciais',
    universoId: 'ilha_do_martelo',
    descricao: 'Última campeã do torneio. Mestrança de karatê, judô e técnica de chamas fênix ascendente com agilidade suprema.',
    atributos: { forca: 4, agilidade: 5, vitalidade: 4, inteligencia: 3, percepcao: 4 },
    inventario: ['Faixas de Combate Reforçadas', 'Poção Revigorante de Chamas', 'Envelope Púrpura de Convocação'],
    moedas: 120,
    avatarIcon: '🔥'
  },
  {
    nome: 'Gatimu Ngugi',
    classe: 'Mestre da Espada Kendô',
    universoId: 'ilha_do_martelo',
    descricao: 'Campeão queniano com domínio magistral de espada pesada, vigor físico implacável e golpes diretos fulminantes.',
    atributos: { forca: 5, agilidade: 4, vitalidade: 4, inteligencia: 3, percepcao: 4 },
    inventario: ['Espada de Kendô Pesada de Aço Escuro', 'Proteção Peitoral Cerimonial', 'Bálsamo de Ervas Restaurador'],
    moedas: 100,
    avatarIcon: '🗡️'
  },
  {
    nome: 'Dani da Silva',
    classe: 'Mestre de Judô e Contra-Ataques',
    universoId: 'ilha_do_martelo',
    descricao: 'Prodígio dos tatames e torneios de rua com reflexos de chaveamento e vigor inquebrantável.',
    atributos: { forca: 4, agilidade: 4, vitalidade: 5, inteligencia: 3, percepcao: 4 },
    inventario: ['Kimono de Tecido Balístico', 'Faixa Preta Reforçada', 'Garrafa Isotônica de Energia'],
    moedas: 95,
    avatarIcon: '🥋'
  },
  {
    nome: 'Chelsea Smith',
    classe: 'Soldada Tática de Elite',
    universoId: 'ilha_do_martelo',
    descricao: 'Especialista em chutes acrobáticos, saltos velozes e faca tática de precisão mortal.',
    atributos: { forca: 3, agilidade: 6, vitalidade: 4, inteligencia: 3, percepcao: 4 },
    inventario: ['Faca de Combate Militar', 'Botas com Amortecedor de Salto', 'Kit de Primeiros Socorros Rápido'],
    moedas: 110,
    avatarIcon: '⚡'
  },
  {
    nome: 'Kel',
    classe: 'Arcanauta Caçadora de Monstros',
    universoId: 'ilha_do_martelo',
    descricao: 'Viajante de outro mundo armada com um machado animalesco colossal e resistência sobrenatural.',
    atributos: { forca: 5, agilidade: 3, vitalidade: 5, inteligencia: 3, percepcao: 4 },
    inventario: ['Machado de Garra Dracônica', 'Manto de Peles de Monstro', 'Frasco de Sangue de Wyvern'],
    moedas: 80,
    avatarIcon: '🪓'
  },
  {
    nome: 'Karator',
    classe: 'Titã Bio-Metálico',
    universoId: 'ilha_do_martelo',
    descricao: 'Guerreiro de constituição de aço vivo com força descomunal e couraça impenetrável.',
    atributos: { forca: 6, agilidade: 2, vitalidade: 6, inteligencia: 2, percepcao: 4 },
    inventario: ['Manoplas de Titânio Forjado', 'Núcleo de Energia Bruta', 'Chapa Metálica de Reparo'],
    moedas: 70,
    avatarIcon: '🦾'
  },
  // Fantasia Medieval Heroes
  {
    nome: 'Sir Valerius',
    classe: 'Paladino da Luz',
    universoId: 'fantasia_medieval',
    descricao: 'Defensor da justiça munido de escudo imponente e espada consagrada por bênçãos sagradas.',
    atributos: { forca: 5, agilidade: 3, vitalidade: 5, inteligencia: 3, percepcao: 4 },
    inventario: ['Espada Bastarda Sagrada', 'Escudo de Aço Polido', 'Frasco de Água Benta Curativa'],
    moedas: 85,
    avatarIcon: '🛡️'
  },
  {
    nome: 'Elyon da Torre Alta',
    classe: 'Mago Evocador Arcano',
    universoId: 'fantasia_medieval',
    descricao: 'Estudioso dos elementos capaz de conjurar labaredas místicas e barreiras de força protetoras.',
    atributos: { forca: 2, agilidade: 3, vitalidade: 3, inteligencia: 7, percepcao: 5 },
    inventario: ['Cajado de Madeira Entalhada com Cristal', 'Grimório Encadernado em Couro', '2x Elixires de Mana Concentrada'],
    moedas: 130,
    avatarIcon: '🔮'
  },
  {
    nome: 'Lyra dos Becos',
    classe: 'Ladina Sorrateira',
    universoId: 'fantasia_medieval',
    descricao: 'Furtiva e certeira, mestre em gazuas, adagas envenenadas e emboscadas fulminantes.',
    atributos: { forca: 3, agilidade: 6, vitalidade: 3, inteligencia: 3, percepcao: 5 },
    inventario: ['Par de Adagas Onduladas', 'Gazuas de Aço Flexível', 'Capa de Camuflagem Noturna'],
    moedas: 140,
    avatarIcon: '🗡️'
  },
  // Cyberpunk Heroes
  {
    nome: 'Kael "Ghost" Vance',
    classe: 'Netrunner Infiltrador',
    universoId: 'cyberpunk_2099',
    descricao: 'Especialista em invasão de sistemas neurais, quebra de ICE corporativo e sobrecargas bio-elétricas.',
    atributos: { forca: 2, agilidade: 4, vitalidade: 3, inteligencia: 7, percepcao: 4 },
    inventario: ['Cyberdeck Neural Mk.IV', 'Pistola Smart 9mm Silenciada', 'Patch de Estimulante Neural (Medikit)'],
    moedas: 350,
    avatarIcon: '💻'
  },
  {
    nome: 'Valkyrie Rox',
    classe: 'Solo de Combate Urbano',
    universoId: 'cyberpunk_2099',
    descricao: 'Corpo blindado por ligas subdérmicas de carbono, especialista em armamento pesado e combate próximo.',
    atributos: { forca: 5, agilidade: 5, vitalidade: 5, inteligencia: 2, percepcao: 3 },
    inventario: ['Rifle de Assalto Magnético', 'Lâmina Monomolecular de Pulso', '2x Injetores de Coagulação Rápida'],
    moedas: 280,
    avatarIcon: '💥'
  },
  // Terror Cósmico Heroes
  {
    nome: 'Dr. Arthur Blackwood',
    classe: 'Detetive e Ocultista',
    universoId: 'terror_cosmico',
    descricao: 'Investigador particular com mente afiada para decifrar enigmas e símbolos proibidos de cultos arcanos.',
    atributos: { forca: 3, agilidade: 3, vitalidade: 4, inteligencia: 5, percepcao: 5 },
    inventario: ['Revólver calibre .38 especial (com 6 balas)', 'Lanterna de Querosene', 'Diário com Notas Ocultas', 'Frasco de Calmantivo'],
    moedas: 45,
    avatarIcon: '🕵️'
  }
];

export function calculateInitialCharacter(
  nome: string,
  classe: string,
  tema: string,
  atributos: Attributes,
  avatarIcon: string = '⚔️'
): Character {
  // Base HP = 15 + Vitalidade * 3
  const hpMax = 15 + atributos.vitalidade * 3;
  // Base Mana/Energia = 10 + Inteligência * 2 + Agilidade
  const manaMax = 10 + atributos.inteligencia * 2 + atributos.agilidade;

  return {
    nome: nome.trim() || 'Viajante Sem Nome',
    classe: classe.trim() || 'Aventureiro',
    nivel: 1,
    xpAtual: 0,
    xpProximo: 50,
    hpAtual: hpMax,
    hpMax,
    manaAtual: manaMax,
    manaMax,
    atributos,
    inventario: ['Ração de Viagem (3 dias)', 'Cantil com Água Fresca', 'Bálsamo Curativo Simples (+10 HP)'],
    moedas: 50,
    statusEspecial: 'Normal',
    tema,
    avatarIcon,
    pontosDisponiveis: 0
  };
}

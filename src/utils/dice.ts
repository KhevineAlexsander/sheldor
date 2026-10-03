import { Attributes, DiceRollResult } from '../types/game';

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function performAttributeCheck(
  nomeAtributo: keyof Attributes,
  valorAtributo: number,
  dificuldade: number = 12,
  nomeAmigavel?: string
): DiceRollResult {
  const d20 = rollD20();
  // With 20 base points distributed over 5 stats, each point provides direct +1 modifier to tests
  const modificador = valorAtributo;
  const total = d20 + modificador;
  const critico = d20 === 20;
  const falhaCritica = d20 === 1;

  let sucesso = total >= dificuldade;
  if (critico) sucesso = true;
  if (falhaCritica) sucesso = false;

  const labelAtributo = nomeAmigavel || {
    forca: 'Força',
    agilidade: 'Agilidade',
    vitalidade: 'Vitalidade',
    inteligencia: 'Inteligência',
    percepcao: 'Percepção'
  }[nomeAtributo];

  const resultadoTexto = critico
    ? 'SUCESSO CRÍTICO!'
    : falhaCritica
    ? 'FALHA CRÍTICA!'
    : sucesso
    ? 'SUCESSO'
    : 'FALHA';

  const descricaoFormatada = `[Teste de ${labelAtributo}: d20(${d20}) + Modificador(${modificador}) = ${total} vs Dificuldade(${dificuldade}) -> ${resultadoTexto}]`;

  return {
    atributoNome: labelAtributo,
    d20,
    modificador,
    total,
    dificuldade,
    sucesso,
    critico,
    falhaCritica,
    descricaoFormatada
  };
}

export function calculateCombatDamage(
  ataqueAtacante: number,
  defesaDefensor: number,
  modificadorAtaque: number = 0
): number {
  const rolagem = rollDice(6); // Adiciona variação tática de 1d6 ao ataque
  const poderTotal = ataqueAtacante + modificadorAtaque + rolagem;
  const dano = Math.max(1, poderTotal - defesaDefensor);
  return dano;
}

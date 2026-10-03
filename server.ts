import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Helper for local procedural GM in case Gemini is offline or not configured
function generateProceduralFallback(
  character: any,
  playerAction: string,
  combatState: any,
  universe: string
) {
  const isAttack = /ata|golpe|luta|dispar|faca|espada|soco|chute|magia|lança|combate/i.test(playerAction);
  const isSearch = /investig|procur|olh|examin|perceb|busc|vasculh/i.test(playerAction);
  const isDialog = /fal|convers|negoc|pergunt|grit|dizer/i.test(playerAction);

  let rollInfo = null;
  let hpDelta = 0;
  let xpGain = 0;
  let lootFound: string[] = [];
  let coinsFound = 0;
  let narrativaText = '';
  let options = [
    'Avançar com cautela e investigar os arredores',
    'Preparar armas e adotar postura defensiva',
    'Utilizar uma perícia ou item do inventário',
    'Ação Livre: O jogador pode digitar qualquer outra ação personalizada'
  ];

  let nextCombat = combatState?.emCombate ? { ...combatState } : null;

  if (combatState?.emCombate && combatState.inimigo) {
    const enemy = { ...combatState.inimigo };
    const d20 = Math.floor(Math.random() * 20) + 1;
    const statMod = character.atributos.agilidade || 3;
    const total = d20 + statMod;
    const dc = 12;
    const success = total >= dc;
    const isCrit = d20 === 20;

    rollInfo = {
      atributoNome: 'Agilidade',
      d20,
      modificador: statMod,
      total,
      dificuldade: dc,
      sucesso: success,
      critico: isCrit,
      falhaCritica: d20 === 1,
      descricaoFormatada: `[Teste de Agilidade: d20(${d20}) + Modificador(${statMod}) = ${total} vs Dificuldade(${dc}) -> ${
        isCrit ? 'SUCESSO CRÍTICO!' : success ? 'SUCESSO' : 'FALHA'
      }]`
    };

    if (success) {
      const playerDmg = Math.max(1, (character.atributos.forca || 4) + Math.floor(Math.random() * 6) + 1 - enemy.defesa);
      enemy.hpAtual = Math.max(0, enemy.hpAtual - playerDmg);
      narrativaText += `Você executa uma manobra precisa contra ${enemy.nome}, rompendo sua guarda e desferindo ${playerDmg} pontos de dano! `;

      if (enemy.hpAtual <= 0) {
        narrativaText += `Com um golpe espetacular, ${enemy.nome} cai derrotado ao chão! A arena/área silencia por um instante antes de um eco de vitória vibrar ao redor.`;
        xpGain = enemy.recompensaXp || 25;
        coinsFound = enemy.recompensaMoedas || 30;
        lootFound = ['Fragmento de Cristal de Batalha', 'Elixir Revigorante (+15 HP)'];
        nextCombat = null;
        options = [
          'Vasculhar o corpo do oponente e recolher despojos',
          'Recuperar o fôlego e curar ferimentos',
          'Seguir para a próxima câmara ou arena principal',
          'Ação Livre: O jogador pode digitar qualquer outra ação personalizada'
        ];
      } else {
        const enemyDmg = Math.max(1, enemy.ataque - (character.atributos.vitalidade || 3));
        hpDelta = -enemyDmg;
        narrativaText += `Entretanto, furioso com o impacto, ${enemy.nome} contra-ataca velozmente com suas presas/lâminas causando ${enemyDmg} de dano a você!`;
        nextCombat.inimigo = enemy;
        nextCombat.rodada += 1;
        options = [
          `Desferir um ataque decisivo contra ${enemy.nome}`,
          'Fintar para o flanco e tentar um ataque surpresa',
          'Usar uma poção ou item do inventário para restaurar forças',
          'Ação Livre: O jogador pode digitar qualquer outra ação personalizada'
        ];
      }
    } else {
      const enemyDmg = Math.max(2, enemy.ataque - (character.atributos.vitalidade || 3) + 2);
      hpDelta = -enemyDmg;
      narrativaText += `Sua investida vacila por um instante diante da velocidade de ${enemy.nome}, que aproveita a abertura para atingi-lo em cheio, causando ${enemyDmg} de dano!`;
      nextCombat.rodada += 1;
      options = [
        `Recompor a postura e contra-atacar ${enemy.nome}`,
        'Recuar defensivamente para tentar achar uma brecha',
        'Consumir um bálsamo curativo rapidamente',
        'Ação Livre: O jogador pode digitar qualquer outra ação personalizada'
      ];
    }
  } else if (isAttack) {
    // Initiate combat
    const d20 = Math.floor(Math.random() * 20) + 1;
    const agi = character.atributos.agilidade || 3;
    const initPlayer = d20 + agi;
    const initEnemy = Math.floor(Math.random() * 20) + 3;

    rollInfo = {
      atributoNome: 'Iniciativa (Agilidade)',
      d20,
      modificador: agi,
      total: initPlayer,
      dificuldade: initEnemy,
      sucesso: initPlayer >= initEnemy,
      critico: d20 === 20,
      falhaCritica: d20 === 1,
      descricaoFormatada: `[Teste de Iniciativa: d20(${d20}) + Modificador(${agi}) = ${initPlayer} vs Iniciativa Inimiga(${initEnemy}) -> ${
        initPlayer >= initEnemy ? 'SUCESSO (Você age primeiro!)' : 'FALHA (O inimigo age primeiro!)'
      }]`
    };

    const enemyName = universe.includes('Martelo')
      ? 'Gladiador Cibernético do Exército Arsenal'
      : universe.includes('Cyberpunk')
      ? 'Sicário Cromado da Megacorp'
      : universe.includes('Terror')
      ? 'Cultista Possuído das Sombras'
      : 'Guerreiro de Armadura Negra';

    const enemy = {
      nome: enemyName,
      hpAtual: 24,
      hpMax: 24,
      ataque: 5,
      defesa: 2,
      recompensaXp: 20,
      recompensaMoedas: 35
    };

    nextCombat = {
      emCombate: true,
      rodada: 1,
      iniciativaJogador: initPlayer,
      iniciativaInimigo: initEnemy,
      vezDoJogador: initPlayer >= initEnemy,
      inimigo: enemy
    };

    narrativaText = `O som do aço ecoa de repente! Surgindo das sombras diante de você, ${enemyName} empunha suas armas com olhos ardentes. O combate começa em alta tensão!`;
    options = [
      `Atacar frontalmente com força máxima contra ${enemy.nome}`,
      'Buscar cobertura e esperar o momento ideal para um contra-ataque',
      'Canalizar energia/mana para desestabilizar a postura inimiga',
      'Ação Livre: O jogador pode digitar qualquer outra ação personalizada'
    ];
  } else if (isSearch) {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const per = character.atributos.percepcao || 4;
    const total = d20 + per;
    const dc = 12;
    const success = total >= dc;

    rollInfo = {
      atributoNome: 'Percepção',
      d20,
      modificador: per,
      total,
      dificuldade: dc,
      sucesso: success,
      critico: d20 === 20,
      falhaCritica: d20 === 1,
      descricaoFormatada: `[Teste de Percepção: d20(${d20}) + Modificador(${per}) = ${total} vs Dificuldade(${dc}) -> ${
        success ? 'SUCESSO' : 'FALHA'
      }]`
    };

    if (success) {
      coinsFound = 25;
      lootFound = ['Cristal Arcano Brilhante', 'Pergaminho de Mapeamento'];
      xpGain = 15;
      narrativaText = `Seus sentidos apurados notam um compartimento oculto sob uma laje de pedra talhada. Ao remover a proteção, você encontra pertences valiosos e segredos do local intactos!`;
      options = [
        'Examinar detalhadamente o pergaminho e decifrar suas rotas',
        'Guardar os tesouros e prosseguir pelo corredor leste',
        'Fazer uma breve pausa tática para inspecionar os arredores',
        'Ação Livre: O jogador pode digitar qualquer outra ação personalizada'
      ];
    } else {
      narrativaText = `Você examina as paredes e o chão cuidadosamente, mas as sombras e as ranhuras antigas dificultam qualquer descoberta extraordinária. Apenas a sensação de estar sendo vigiado persiste.`;
      options = [
        'Avançar cautelosamente para a próxima câmara',
        'Acender uma tocha ou lanterna para iluminar melhor o ambiente',
        'Tentar escutar ruídos além das pesadas portas de ferro',
        'Ação Livre: O jogador pode digitar qualquer outra ação personalizada'
      ];
    }
  } else {
    narrativaText = `Sua ação '${playerAction}' repercute pelo ambiente. O ar ao seu redor fica carregado de expectativa à medida que o destino responde à sua escolha. O cenário se desdobra diante de seus olhos com novos caminhos e desafios à vista.`;
    options = [
      'Explorar a passagem adiante com os sentidos em alerta máximo',
      'Interagir com o elemento mais proeminente da sala',
      'Consultar seu inventário para preparar equipamentos',
      'Ação Livre: O jogador pode digitar qualquer outra ação personalizada'
    ];
  }

  const updatedHp = Math.max(0, Math.min(character.hpMax, character.hpAtual + hpDelta));
  const updatedXp = character.xpAtual + xpGain;
  const updatedMoedas = character.moedas + coinsFound;
  const updatedInv = [...character.inventario, ...lootFound];

  const statusBlock = `---
[STATUS DO PERSONAGEM]
- Nome: ${character.nome} | Classe: ${character.classe} | Nível: ${character.nivel} (XP: ${updatedXp}/${character.xpProximo})
- Vida (HP): ${updatedHp}/${character.hpMax} | Mana/Energia: ${character.manaAtual}/${character.manaMax}
- Atributos: [FOR: ${character.atributos.forca}] [AGI: ${character.atributos.agilidade}] [VIT: ${character.atributos.vitalidade}] [INT: ${character.atributos.inteligencia}] [PER: ${character.atributos.percepcao}]
- Inventário: ${updatedInv.join(', ')}, [Moedas: ${updatedMoedas}]
- Status Especial: [${updatedHp === 0 ? 'Morto / Inconsciente' : character.statusEspecial || 'Nenhum'}]
---`;

  return {
    rawGMResponse: `${statusBlock}\n\n${rollInfo ? rollInfo.descricaoFormatada + '\n\n' : ''}[NARRATIVA]\n${narrativaText}\n\n[OPÇÕES DE AÇÃO]\n1. ${options[0]}\n2. ${options[1]}\n3. ${options[2]}\n4. ${options[3]}`,
    statusTexto: statusBlock,
    narrativa: narrativaText,
    opcoes: options,
    rolagem: rollInfo,
    combate: nextCombat,
    danoJogador: hpDelta < 0 ? Math.abs(hpDelta) : 0,
    curaJogador: hpDelta > 0 ? hpDelta : 0,
    xpGanho: xpGain,
    lootGanho: lootFound,
    moedasGanhas: coinsFound,
    novoStatus: updatedHp === 0 ? 'Inconsciente' : character.statusEspecial,
    gameOver: updatedHp === 0
  };
}

// Main Game Master Turn API
app.post('/api/gm/turn', async (req: Request, res: Response) => {
  try {
    const { character, playerAction, combatState, history = [], universe = 'Torneio da Ilha do Martelo' } = req.body;

    if (!character) {
      res.status(400).json({ error: 'Personagem não fornecido.' });
      return;
    }

    if (!ai) {
      const fallbackResult = generateProceduralFallback(character, playerAction, combatState, universe);
      res.json(fallbackResult);
      return;
    }

    // Prepare system instructions for Gemini with strict rules
    const systemInstruction = `Você é o Game Master (GM) de um RPG de Texto Completo e Imersivo. Seu objetivo é gerenciar todo o universo do jogo, mecânicas de regras, combate, estória e fichas de personagens de forma autônoma.

ESTRUTURA OBRIGATÓRIA DA RESPOSTA:
Em TODA resposta, você DEVE manter exatamente a seguinte estrutura estrita:

---
[STATUS DO PERSONAGEM]
- Nome: <Nome> | Classe: <Classe> | Nível: <Nível> (XP: <Atual>/<Próximo>)
- Vida (HP): <Atual>/<Máximo> | Mana/Energia: <Atual>/<Máximo>
- Atributos: [FOR: X] [AGI: X] [VIT: X] [INT: X] [PER: X]
- Inventário: [Item 1], [Item 2], [Moedas: X]
- Status Especial: [Nenhum / Envenenado / Sangrando / etc.]
---

[TESTE DE DADO] (APENAS se houver teste ou ação com risco ou combate neste turno)
[Teste de <Atributo>: d20(X) + Modificador(Y) = Z vs Dificuldade(W) -> SUCESSO/FALHA]

[COMBATE] (APENAS se houver combate ativo)
- Inimigo: <Nome do Inimigo> | HP: <Atual>/<Máximo> | Ataque: <Ataque> | Defesa: <Defesa>
- Iniciativa: Jogador <Inic Jogador> vs Inimigo <Inic Inimigo>
- Dano causado: <Ataque - Defesa>

[NARRATIVA]
Descreva a cena de maneira extremamente imersiva, rica em detalhes sensoriais, tensão e contextualizada com as escolhas anteriores do jogador.

[OPÇÕES DE AÇÃO]
1. [Ação A de combate, exploração ou diálogo contextualizada]
2. [Ação B alternativa tática ou arriscada]
3. [Ação C focada em habilidades específicas da classe ou uso de itens]
4. [Ação Livre: O jogador pode digitar qualquer outra ação personalizada]

REGRAS MECÂNICAS FUNDAMENTAIS:
1. ROLAGEM DE DADOS: Sempre que o jogador tentar algo arriscado, desafiador ou atacar/defender, simule internamente o d20 e mostre a fórmula exata com o modificador do atributo do jogador (onde Modificador = Atributo, e.g. Força 4 dá Modificador 4). O d20 natural 20 é Acerto Crítico e d20 natural 1 é Falha Crítica.
2. COMBATE POR TURNOS:
   - Se um inimigo surgir, role Iniciativa (d20 + Agilidade).
   - Apresente os atributos do Inimigo (HP, Ataque, Defesa).
   - Dano = Ataque do Atacante - Defesa do Defensor (mínimo 1 de dano).
   - Atualize imediatamente o HP do jogador e do inimigo no bloco de status!
3. PROGRESSÃO E RECOMPENSAS:
   - Ao vencer combates ou desvendar mistérios, conceda XP (ex: 15 a 50 XP) e itens de loot/moedas no inventário.
   - Quando o XP atingir ou superar o Próximo XP (ex: 50 XP no Nível 1), o personagem sobe para o Nível 2! Ao subir de nível, aumente HP Máximo em +5, Mana/Energia em +5 e conceda +3 pontos para os atributos.
4. CONDUTA:
   - Seja neutro e desafiador. Mantenha coerência temporal absoluta com as ações anteriores.
   - Se o HP do jogador chegar a 0, declare a derrota para que o jogador use o Checkpoint.`;

    const combatContext = combatState?.emCombate
      ? `ESTADO ATUAL DE COMBATE:
Inimigo: ${combatState.inimigo?.nome} (HP: ${combatState.inimigo?.hpAtual}/${combatState.inimigo?.hpMax}, Ataque: ${combatState.inimigo?.ataque}, Defesa: ${combatState.inimigo?.defesa})
Rodada: ${combatState.rodada}`
      : 'NÃO HÁ COMBATE ATIVO.';

    const promptText = `UNIVERSO ATUAL: ${universe}
PERSONAGEM ATUAL:
Nome: ${character.nome} | Classe: ${character.classe} | Nível: ${character.nivel} (XP: ${character.xpAtual}/${character.xpProximo})
HP: ${character.hpAtual}/${character.hpMax} | Mana: ${character.manaAtual}/${character.manaMax}
Atributos: FOR: ${character.atributos.forca}, AGI: ${character.atributos.agilidade}, VIT: ${character.atributos.vitalidade}, INT: ${character.atributos.inteligencia}, PER: ${character.atributos.percepcao}
Inventário: ${character.inventario.join(', ')} | Moedas: ${character.moedas}
Status: ${character.statusEspecial || 'Nenhum'}

${combatContext}

AÇÃO ESCOLHIDA PELO JOGADOR:
"${playerAction}"

HISTÓRICO RECENTE:
${history.slice(-4).map((h: any) => `${h.remetente.toUpperCase()}: ${h.conteudo}`).join('\n\n')}

Gere a resposta completa do Game Master seguindo estritamente a estrutura solicitada.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    const gmText = response.text || '';

    // Parse sections from the text response
    let narrative = '';
    const narrativeMatch = gmText.match(/\[NARRATIVA\]([\s\S]*?)(?=\[OPÇÕES DE AÇÃO\]|$)/i);
    if (narrativeMatch) {
      narrative = narrativeMatch[1].trim();
    } else {
      narrative = gmText;
    }

    // Parse options
    const options: string[] = [];
    const optionsMatch = gmText.match(/\[OPÇÕES DE AÇÃO\]([\s\S]*?)$/i);
    if (optionsMatch) {
      const optionLines = optionsMatch[1].split('\n');
      for (const line of optionLines) {
        const cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
        if (cleaned) {
          options.push(cleaned);
        }
      }
    }

    if (options.length < 3) {
      options.push('Explorar o ambiente ao redor cautelosamente');
      options.push('Preparar equipamentos e armas para qualquer surpresa');
      options.push('Usar um item do inventário ou habilidade de classe');
      options.push('Ação Livre: O jogador pode digitar qualquer outra ação personalizada');
    }

    // Parse dice roll if present
    let rollResult = null;
    const rollMatch = gmText.match(/\[Teste de ([^:]+):\s*d20\((\d+)\)\s*\+\s*Modificador\((\d+)\)\s*=\s*(\d+)\s*vs\s*(?:Dificuldade|Iniciativa Inimiga)\((\d+)\)\s*->\s*([^\]]+)\]/i);
    if (rollMatch) {
      const d20 = parseInt(rollMatch[2], 10);
      const mod = parseInt(rollMatch[3], 10);
      const total = parseInt(rollMatch[4], 10);
      const diff = parseInt(rollMatch[5], 10);
      const outcome = rollMatch[6].trim();
      rollResult = {
        atributoNome: rollMatch[1].trim(),
        d20,
        modificador: mod,
        total,
        dificuldade: diff,
        sucesso: /sucesso/i.test(outcome),
        critico: d20 === 20 || /crítico/i.test(outcome),
        falhaCritica: d20 === 1,
        descricaoFormatada: rollMatch[0],
      };
    }

    // Parse combat block
    let newCombatState: any = combatState?.emCombate ? { ...combatState } : null;
    const combatMatch = gmText.match(/\[COMBATE\]([\s\S]*?)(?=\[NARRATIVA\]|$)/i);
    if (combatMatch) {
      const enemyMatch = combatMatch[1].match(/Inimigo:\s*([^\|]+)\|\s*HP:\s*(\d+)\/(\d+)\|\s*Ataque:\s*(\d+)\|\s*Defesa:\s*(\d+)/i);
      if (enemyMatch) {
        const hpAtual = parseInt(enemyMatch[2], 10);
        const hpMax = parseInt(enemyMatch[3], 10);
        const ataque = parseInt(enemyMatch[4], 10);
        const defesa = parseInt(enemyMatch[5], 10);

        if (hpAtual > 0) {
          newCombatState = {
            emCombate: true,
            rodada: (combatState?.rodada || 0) + 1,
            iniciativaJogador: combatState?.iniciativaJogador || 14,
            iniciativaInimigo: combatState?.iniciativaInimigo || 12,
            vezDoJogador: true,
            inimigo: {
              nome: enemyMatch[1].trim(),
              hpAtual,
              hpMax,
              ataque,
              defesa,
            },
          };
        } else {
          newCombatState = null; // Combat ended!
        }
      }
    }

    // Extract character status updates from [STATUS DO PERSONAGEM]
    let hpAtual = character.hpAtual;
    let hpMax = character.hpMax;
    let manaAtual = character.manaAtual;
    let manaMax = character.manaMax;
    let xpAtual = character.xpAtual;
    let xpProximo = character.xpProximo;
    let nivel = character.nivel;

    const hpMatch = gmText.match(/Vida\s*\(HP\):\s*(\d+)\/(\d+)/i);
    if (hpMatch) {
      hpAtual = parseInt(hpMatch[1], 10);
      hpMax = parseInt(hpMatch[2], 10);
    }

    const manaMatch = gmText.match(/Mana\/Energia:\s*(\d+)\/(\d+)/i);
    if (manaMatch) {
      manaAtual = parseInt(manaMatch[1], 10);
      manaMax = parseInt(manaMatch[2], 10);
    }

    const xpMatch = gmText.match(/XP:\s*(\d+)\/(\d+)/i);
    if (xpMatch) {
      xpAtual = parseInt(xpMatch[1], 10);
      xpProximo = parseInt(xpMatch[2], 10);
    }

    const levelMatch = gmText.match(/Nível:\s*(\d+)/i);
    if (levelMatch) {
      nivel = parseInt(levelMatch[1], 10);
    }

    const danoJogador = Math.max(0, character.hpAtual - hpAtual);
    const curaJogador = Math.max(0, hpAtual - character.hpAtual);
    const xpGanho = Math.max(0, xpAtual - character.xpAtual);

    res.json({
      rawGMResponse: gmText,
      statusTexto: gmText.match(/\[STATUS DO PERSONAGEM\][\s\S]*?---/i)?.[0] || '',
      narrativa: narrative,
      opcoes: options,
      rolagem: rollResult,
      combate: newCombatState,
      danoJogador,
      curaJogador,
      xpGanho,
      gameOver: hpAtual <= 0,
      subiuDeNivel: nivel > character.nivel,
    });
  } catch (error: any) {
    console.error('Error generating GM turn via Gemini:', error);
    // Graceful fallback to procedural generator
    const { character, playerAction, combatState, universe = 'Torneio da Ilha do Martelo' } = req.body;
    const fallbackResult = generateProceduralFallback(character, playerAction, combatState, universe);
    res.json(fallbackResult);
  }
});

// Setup server and Vite middleware
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();

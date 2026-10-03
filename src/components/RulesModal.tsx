import React from 'react';
import { BookOpen, X, Dices, Swords, Shield, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-100">
              Guia de Regras & Mecânicas do Jogo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-amber-300 flex items-center gap-2 text-sm font-serif">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1. Criação & Atributos (20 Pontos Base)
            </h4>
            <p>
              Ao criar seu herói, você distribui 20 pontos entre os 5 atributos fundamentais:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-slate-400">
              <li><strong className="text-red-400">Força (FOR):</strong> Poder físico, impacto dos ataques corpo a corpo e proezas de atletismo.</li>
              <li><strong className="text-emerald-400">Agilidade (AGI):</strong> Destreza manual, esquiva, furtividade e determinação da Iniciativa no combate.</li>
              <li><strong className="text-amber-400">Vitalidade (VIT):</strong> Resistência física a ferimentos e doenças. Define a Vida máxima (HP = 15 + VIT * 3).</li>
              <li><strong className="text-cyan-400">Inteligência (INT):</strong> Mana mágica, conhecimento arcano, raciocínio tático e tecnologias.</li>
              <li><strong className="text-purple-400">Percepção (PER):</strong> Sentidos aguçados, pontaria, detecção de emboscadas e segredos ocultos.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-purple-300 flex items-center gap-2 text-sm font-serif">
              <Dices className="w-4 h-4 text-purple-400" />
              2. Rolagem de Dados Simulada (d20)
            </h4>
            <p>
              Para qualquer ação com risco ou no combate, o Game Master rola um dado de 20 faces (d20) e adiciona o modificador correspondente:
            </p>
            <div className="bg-slate-900 p-3 rounded-lg border border-purple-800/40 font-mono text-xs text-purple-200">
              [Teste de Agilidade: d20(14) + Modificador(3) = 17 vs Dificuldade(15) -&gt; SUCESSO]
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
              <li><strong>Acerto Crítico:</strong> Obter 20 natural no d20 garante um sucesso espetacular independente da dificuldade.</li>
              <li><strong>Falha Crítica:</strong> Obter 1 natural no d20 resulta em um tropeço ou complicação imprevista.</li>
              <li><strong>Metas:</strong> Fácil (6), Média (9), Difícil (12), Muito Difícil (15), Extrema (18+).</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-red-300 flex items-center gap-2 text-sm font-serif">
              <Swords className="w-4 h-4 text-red-400" />
              3. Sistema de Combate por Turnos
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-300">
              <li><strong>Iniciativa:</strong> Cada lado rola <code>d20 + Agilidade</code>. O maior valor age primeiro na rodada.</li>
              <li><strong>Atributos do Inimigo:</strong> Cada oponente possui HP, Ataque e Defesa claramente informados.</li>
              <li><strong>Cálculo de Dano:</strong> O dano causado é calculado por <code>Ataque do Atacante - Defesa do Defensor</code> (mínimo de 1 ponto de dano).</li>
              <li><strong>Atualização Imediata:</strong> Os pontos de vida são atualizados no final de cada ação.</li>
            </ol>
          </div>

          {/* Section 4 */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-emerald-300 flex items-center gap-2 text-sm font-serif">
              <Award className="w-4 h-4 text-emerald-400" />
              4. Progressão, Nível & Checkpoint
            </h4>
            <p className="text-xs text-slate-300">
              Ao derrotar inimigos e desvendar enigmas, você recebe Pontos de Experiência (XP) e itens de loot.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
              <li><strong>Subir de Nível:</strong> Ao atingir a meta de XP, você ganha <strong>+3 pontos de atributos</strong> para distribuir livremente, além de <strong>+5 de HP Máximo</strong> e <strong>+5 de Mana Máxima</strong>.</li>
              <li><strong>Morte & Checkpoint:</strong> Se seu HP chegar a 0, você pode restaurar o Checkpoint para voltar ao último momento seguro com HP restaurado.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition"
          >
            Entendido, Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
};

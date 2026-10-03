import React, { useState } from 'react';
import { Dices, X, Sparkles, RefreshCw } from 'lucide-react';
import { rollD20, rollDice } from '../utils/dice';
import { playDiceRollSound, playSuccessSound, playCriticalFumbleSound } from '../utils/audio';

interface ManualDiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  agilidadeMod?: number;
  forcaMod?: number;
}

export const ManualDiceModal: React.FC<ManualDiceModalProps> = ({
  isOpen,
  onClose,
  agilidadeMod = 3,
  forcaMod = 4
}) => {
  const [selectedDie, setSelectedDie] = useState<number>(20);
  const [modifier, setModifier] = useState<number>(agilidadeMod);
  const [difficulty, setDifficulty] = useState<number>(12);
  const [result, setResult] = useState<{
    dieRoll: number;
    modifier: number;
    total: number;
    success: boolean;
    isCrit: boolean;
    isFumble: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleRoll = () => {
    playDiceRollSound();
    const dieRoll = rollDice(selectedDie);
    const total = dieRoll + modifier;
    const isCrit = selectedDie === 20 && dieRoll === 20;
    const isFumble = selectedDie === 20 && dieRoll === 1;
    let success = total >= difficulty;
    if (isCrit) success = true;
    if (isFumble) success = false;

    setTimeout(() => {
      setResult({
        dieRoll,
        modifier,
        total,
        success,
        isCrit,
        isFumble
      });
      if (isCrit || success) {
        playSuccessSound();
      } else if (isFumble) {
        playCriticalFumbleSound();
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-purple-400" />
            <h3 className="font-serif font-bold text-base text-slate-100">
              Rolar Dados Manuais
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Die Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase">
            Tipo de Dado
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[6, 12, 20, 100].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDie(d)}
                className={`py-2 rounded-xl font-mono text-xs font-bold border transition cursor-pointer ${
                  selectedDie === d
                    ? 'bg-purple-600 text-slate-100 border-purple-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                d{d}
              </button>
            ))}
          </div>
        </div>

        {/* Modifier and Difficulty inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">
              Modificador (+):
            </label>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 font-mono outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">
              Dificuldade (DC):
            </label>
            <input
              type="number"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 font-mono outline-none"
            />
          </div>
        </div>

        {/* Roll Display */}
        {result && (
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-800/40 text-center space-y-2 animate-in zoom-in-95 duration-200">
            <div className="text-3xl font-black font-mono text-amber-300">
              d{selectedDie}({result.dieRoll}) + Mod({result.modifier}) = {result.total}
            </div>

            <div className="flex items-center justify-center gap-2">
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                  result.isCrit
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : result.isFumble
                    ? 'bg-purple-950 text-purple-300 border-purple-700'
                    : result.success
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                }`}
              >
                {result.isCrit
                  ? '🌟 CRÍTICO!'
                  : result.isFumble
                  ? '💀 FALHA CRÍTICA!'
                  : result.success
                  ? '✓ SUCESSO vs DC ' + difficulty
                  : '✗ FALHA vs DC ' + difficulty}
              </span>
            </div>
          </div>
        )}

        {/* Roll Action Button */}
        <button
          onClick={handleRoll}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-100 font-bold text-sm tracking-wide shadow-lg shadow-purple-900/30 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Dices className="w-4 h-4" />
          <span>Rolar d{selectedDie} Agora</span>
        </button>
      </div>
    </div>
  );
};

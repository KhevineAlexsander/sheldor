import React, { useEffect, useState } from 'react';
import { Dices, Sparkles, CheckCircle, AlertTriangle, Flame } from 'lucide-react';
import { DiceRollResult } from '../types/game';

interface DiceRollAnimationProps {
  roll: DiceRollResult | null;
  onClose?: () => void;
}

export const DiceRollAnimation: React.FC<DiceRollAnimationProps> = ({ roll, onClose }) => {
  const [animating, setAnimating] = useState(true);
  const [displayNumber, setDisplayNumber] = useState(1);

  useEffect(() => {
    if (!roll) return;
    setAnimating(true);

    let counter = 0;
    const interval = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 20) + 1);
      counter++;
      if (counter > 10) {
        clearInterval(interval);
        setDisplayNumber(roll.d20);
        setAnimating(false);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [roll]);

  if (!roll) return null;

  const isCrit = roll.critico;
  const isFumble = roll.falhaCritica;
  const isSuccess = roll.sucesso;

  const badgeColor = isCrit
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-amber-500/20'
    : isFumble
    ? 'bg-purple-900/40 text-purple-300 border-purple-600/60 shadow-purple-900/30'
    : isSuccess
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-emerald-500/20'
    : 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-rose-500/20';

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/70 border border-purple-500/30 p-4 shadow-xl mb-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: 3D Die representation */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl font-mono shadow-2xl transition-all duration-300 ${
                animating
                  ? 'animate-spin bg-purple-600/40 border-2 border-purple-400 text-purple-200 rotate-180'
                  : isCrit
                  ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 border-2 border-amber-300 shadow-amber-500/50 scale-105'
                  : isFumble
                  ? 'bg-gradient-to-tr from-purple-950 to-red-950 text-red-200 border-2 border-red-500 shadow-red-900/50'
                  : isSuccess
                  ? 'bg-gradient-to-tr from-emerald-700 to-teal-500 text-slate-950 border-2 border-emerald-300 shadow-emerald-600/40'
                  : 'bg-gradient-to-tr from-rose-800 to-pink-700 text-slate-100 border-2 border-rose-400 shadow-rose-900/40'
              }`}
            >
              {displayNumber}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 text-slate-300 text-[10px] font-mono px-1 rounded border border-slate-700">
              d20
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Rolagem de Teste
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${badgeColor}`}>
                {isCrit ? '🌟 Acerto Crítico!' : isFumble ? '💀 Falha Crítica!' : isSuccess ? '✓ Sucesso' : '✗ Falha'}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">
              Teste de {roll.atributoNome}
            </div>
          </div>
        </div>

        {/* Center / Right: Math Breakdown exact format */}
        <div className="flex-1 max-w-lg bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800/80">
          <div className="text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-purple-300">d20({roll.d20})</span> +{' '}
              <span className="text-cyan-300">Mod({roll.modificador})</span> ={' '}
              <span className="text-amber-300 font-bold text-sm">{roll.total}</span>
            </div>
            <div className="text-slate-400">
              vs Dificuldade: <span className="text-slate-200 font-bold font-mono">{roll.dificuldade}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/60 truncate">
            {roll.descricaoFormatada}
          </p>
        </div>
      </div>
    </div>
  );
};

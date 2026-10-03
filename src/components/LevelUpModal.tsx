import React, { useState } from 'react';
import { Award, Plus, Minus, Sparkles, Check, Heart, Zap } from 'lucide-react';
import { Attributes, Character } from '../types/game';
import { playSuccessSound, playLevelUpSound } from '../utils/audio';

interface LevelUpModalProps {
  character: Character;
  isOpen: boolean;
  onConfirmLevelUp: (newAttributes: Attributes) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  character,
  isOpen,
  onConfirmLevelUp
}) => {
  const [allocated, setAllocated] = useState<Attributes>({ ...character.atributos });
  const pointsToSpend = 3;

  const currentTotal =
    allocated.forca +
    allocated.agilidade +
    allocated.vitalidade +
    allocated.inteligencia +
    allocated.percepcao;

  const baseTotal =
    character.atributos.forca +
    character.atributos.agilidade +
    character.atributos.vitalidade +
    character.atributos.inteligencia +
    character.atributos.percepcao;

  const remaining = pointsToSpend - (currentTotal - baseTotal);

  if (!isOpen) return null;

  const handleAdjust = (stat: keyof Attributes, delta: number) => {
    if (delta > 0 && remaining <= 0) return;
    if (delta < 0 && allocated[stat] <= character.atributos[stat]) return;

    setAllocated((prev) => ({
      ...prev,
      [stat]: prev[stat] + delta
    }));
    playSuccessSound();
  };

  const handleSave = () => {
    if (remaining !== 0) return;
    playLevelUpSound();
    onConfirmLevelUp(allocated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/30">
            <Award className="w-8 h-8 animate-bounce" />
          </div>
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-400">
            Vitória & Evolução
          </span>
          <h3 className="font-serif text-2xl font-black text-slate-100">
            Você Subiu para o Nível {character.nivel + 1}!
          </h3>
          <p className="text-xs text-slate-400">
            Seus feitos extraordinários expandiram suas habilidades. Distribua seus 3 novos pontos de atributos!
          </p>
        </div>

        {/* Level Perks Banner */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-rose-300">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>+5 HP Máximo garantido</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-300">
            <Zap className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            <span>+5 Mana/Energia garantida</span>
          </div>
        </div>

        {/* Points allocation tracker */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">
            Alocação de Atributos (+3 Pts)
          </span>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              remaining === 0
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
            }`}
          >
            Restantes: {remaining}
          </span>
        </div>

        {/* Stats Adjuster */}
        <div className="space-y-2">
          {[
            { key: 'forca', label: 'Força (FOR)', desc: 'Ataque físico e armas pesadas', color: 'text-red-400' },
            { key: 'agilidade', label: 'Agilidade (AGI)', desc: 'Iniciativa, esquiva e destreza', color: 'text-emerald-400' },
            { key: 'vitalidade', label: 'Vitalidade (VIT)', desc: 'Resistência a ferimentos', color: 'text-amber-400' },
            { key: 'inteligencia', label: 'Inteligência (INT)', desc: 'Poderes arcanos e energia', color: 'text-cyan-400' },
            { key: 'percepcao', label: 'Percepção (PER)', desc: 'Detecção de ameaças e precisão', color: 'text-purple-400' },
          ].map(({ key, label, desc, color }) => {
            const statKey = key as keyof Attributes;
            const currentVal = allocated[statKey];
            const baseVal = character.atributos[statKey];
            const added = currentVal - baseVal;

            return (
              <div
                key={key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-mono ${color}`}>{label}</span>
                    {added > 0 && (
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 rounded">
                        +{added}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{desc}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjust(statKey, -1)}
                    disabled={currentVal <= baseVal}
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-7 text-center font-mono font-bold text-slate-100 text-sm">
                    {currentVal}
                  </span>

                  <button
                    onClick={() => handleAdjust(statKey, 1)}
                    disabled={remaining <= 0}
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 flex items-center justify-center text-amber-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={remaining !== 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Confirmar Evolução do Nível {character.nivel + 1}</span>
        </button>
      </div>
    </div>
  );
};

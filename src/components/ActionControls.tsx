import React, { useState } from 'react';
import { Send, CornerDownLeft, Sparkles, Compass, ShieldAlert, Zap } from 'lucide-react';

interface ActionControlsProps {
  options: string[];
  onSelectAction: (actionText: string) => void;
  loading: boolean;
  emCombate: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  options,
  onSelectAction,
  loading,
  emCombate
}) => {
  const [customAction, setCustomAction] = useState('');

  // Extract primary options (usually first 3)
  const choices = options.slice(0, 3);

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim() || loading) return;
    onSelectAction(customAction.trim());
    setCustomAction('');
  };

  return (
    <div className="sticky bottom-0 z-30 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 p-4 shadow-2xl">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Numbered Quick Action Choices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {choices.map((choice, index) => {
            // Pick an icon based on index or text
            const isCombat = /ataca|golpe|luta|dispar|faca|espada/i.test(choice);
            const isSkill = /perícia|magia|mana|item|habilidade/i.test(choice);

            return (
              <button
                key={index}
                disabled={loading}
                onClick={() => onSelectAction(choice)}
                className={`group relative text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  emCombate && isCombat
                    ? 'bg-red-950/40 hover:bg-red-900/60 border-red-800/60 hover:border-red-500 shadow-md shadow-red-950/20'
                    : isSkill
                    ? 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-800/60 hover:border-purple-500'
                    : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-950 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition">
                    {index + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-200 group-hover:text-amber-100 font-medium leading-snug line-clamp-3">
                    {choice}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Option 4: Free Action Input Bar */}
        <form onSubmit={handleSubmitCustom} className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <input
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              disabled={loading}
              placeholder="4. Ação Livre: Digite qualquer ação personalizada (ex: 'Salto para trás e conjuro uma barreira')..."
              className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 outline-none transition disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!customAction.trim() || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <span>Executar</span>
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

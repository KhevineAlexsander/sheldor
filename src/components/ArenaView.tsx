import React from 'react';
import { ARENA_TIERS } from '../engine/gameData';
import { PlayerProfile } from '../types/rpgBot';
import { Swords, Trophy, Skull, Coins, Sparkles } from 'lucide-react';

interface ArenaViewProps {
  activeProfile: PlayerProfile;
  onEnterArena: (tierId: number) => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({ activeProfile, onEnterArena }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif font-bold text-lg text-slate-100">
            Arena dos Campeões (#arena 1-4)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Pague a taxa de inscrição e enfrente 3 ondas consecutivas de gladiadores. Se vencer todas, fature o prêmio acumulado e bastante EXP. Se for derrotado, perderá parte das moedas!
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ARENA_TIERS.map((tier) => {
          const canAfford = activeProfile.moedas >= tier.custoEntrada;
          const isRecommended = activeProfile.nivel >= tier.nivelRecomendado;

          return (
            <div
              key={tier.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{tier.icone}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                    Arena #{tier.id}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-slate-100">
                  Arena {tier.nome}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Recomendado: Nível {tier.nivelRecomendado}+
                </p>

                {/* Details */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 my-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Inscrição:</span>
                    <span className="text-rose-400 font-bold">{tier.custoEntrada} moedas</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Ondas:</span>
                    <span className="text-slate-200">{tier.ondasTotal} inimigos</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Prêmio:</span>
                    <span className="text-emerald-400 font-bold">+{tier.recompensaMoedas}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">EXP:</span>
                    <span className="text-purple-300 font-bold">+{tier.recompensaXp} XP</span>
                  </div>
                </div>
              </div>

              <button
                disabled={!canAfford}
                onClick={() => onEnterArena(tier.id)}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  canAfford
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-md cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Swords className="w-4 h-4" />
                <span>
                  {canAfford ? `Lutar na Arena (#arena ${tier.id})` : 'Moedas Insuficientes'}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

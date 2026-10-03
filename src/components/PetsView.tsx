import React from 'react';
import { PlayerProfile } from '../types/rpgBot';
import { PET_CATALOG } from '../engine/gameData';
import { Sparkles, Heart, Zap, Award, Flame, Utensils, Dumbbell } from 'lucide-react';
import { formatTimeRemaining } from '../engine/rpgEngine';

interface PetsViewProps {
  activeProfile: PlayerProfile;
  onAdoptPet: (tipo: 'lobo' | 'gato' | 'dragao') => void;
  onFeedPet: () => void;
  onTrainPet: () => void;
}

export const PetsView: React.FC<PetsViewProps> = ({
  activeProfile,
  onAdoptPet,
  onFeedPet,
  onTrainPet
}) => {
  const pet = activeProfile.pet;
  const agora = Date.now();
  const alimentado = pet ? agora < pet.fomeAteTimestamp : false;
  const tempoAlimentado = pet && alimentado ? formatTimeRemaining(pet.fomeAteTimestamp - agora) : '0s';

  const cdTreino = pet && activeProfile.cooldowns.petTreinar > agora ? activeProfile.cooldowns.petTreinar - agora : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif font-bold text-lg text-slate-100">
            Mascotes & Companheiros de Batalha (#pet)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Adote um pet leal para lutar ao seu lado. Quando bem alimentados, os mascotes concedem aumentos passivos permanentes de dano e acerto crítico em duelos, arenas e dungeons.
        </p>
      </div>

      {/* Active Pet Card */}
      {pet ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border-2 border-purple-500/50 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/40 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2 rounded-2xl bg-slate-950 border border-purple-700/50">
                {pet.icone}
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700">
                  MASCOTE ATIVO
                </span>
                <h4 className="font-serif text-lg font-bold text-slate-100 mt-0.5">
                  {pet.nome} (Nível {pet.nivel})
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                  alimentado
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>{alimentado ? `Alimentado (${tempoAlimentado})` : 'Com Fome! (Bônus Inativo)'}</span>
              </span>
            </div>
          </div>

          {/* Buffs & Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Bônus de Dano</span>
              <span className="text-amber-400 font-bold text-sm">+{pet.bonusDanoPct}%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Bônus Crítico</span>
              <span className="text-rose-400 font-bold text-sm">+{pet.bonusCriticoPct}%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">XP do Pet</span>
              <span className="text-purple-300 font-bold text-sm">{pet.xp} / {pet.nivel * 100}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Status do Bônus</span>
              <span className={alimentado ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {alimentado ? '● Ativo' : '○ Inativo'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              onClick={onFeedPet}
              className="flex-1 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>Alimentar por 12h (#pet alimentar - 100g)</span>
            </button>

            <button
              onClick={onTrainPet}
              disabled={cdTreino > 0 || activeProfile.energia < 5}
              className={`w-full sm:w-auto py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                cdTreino <= 0 && activeProfile.energia >= 5
                  ? 'bg-purple-600 hover:bg-purple-500 text-slate-100 shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>
                {cdTreino > 0
                  ? `Treino em ${formatTimeRemaining(cdTreino)}`
                  : 'Treinar Pet (#pet treinar - 5⚡)'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs font-mono text-amber-300">
          Você ainda não possui um mascote adotado. Escolha um companheiro no catálogo abaixo!
        </div>
      )}

      {/* Catalog Cards */}
      <div className="space-y-3">
        <h4 className="font-serif font-bold text-sm text-slate-300 uppercase tracking-wider">
          Animais Disponíveis para Adoção
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(PET_CATALOG).map(([tipo, p]) => {
            const isCurrent = pet?.tipo === tipo;
            const canAfford = activeProfile.moedas >= p.preco;

            return (
              <div
                key={tipo}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-600/40 transition flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{p.icone}</span>
                    <span className="font-mono text-xs text-amber-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      💰 {p.preco.toLocaleString()}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-slate-100 font-serif">
                    {p.nome}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Concede +{p.bonusDanoPct}% de Dano e +{p.bonusCriticoPct}% de Chance de Crítico quando alimentado.
                  </p>
                </div>

                <button
                  disabled={isCurrent || !canAfford}
                  onClick={() => onAdoptPet(tipo as any)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    isCurrent
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default'
                      : canAfford
                      ? 'bg-purple-600 hover:bg-purple-500 text-slate-100 shadow cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {isCurrent ? 'Adotado' : canAfford ? 'Adotar Mascote (#pet comprar)' : 'Moedas Insuficientes'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

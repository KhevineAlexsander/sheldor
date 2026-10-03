import React, { useState } from 'react';
import { PlayerProfile } from '../types/rpgBot';
import { calculateTotalAttack, calculateTotalDefense } from '../engine/rpgEngine';
import { Swords, UserCheck, UserPlus, Trophy, Skull, Shield, Coins, Heart, Zap } from 'lucide-react';

interface ProfilesPvPViewProps {
  profiles: PlayerProfile[];
  activeProfileId: string;
  onDuelProfile: (targetName: string) => void;
  onSwitchProfile: (profileId: string) => void;
  onCreateProfile: (name: string) => void;
}

export const ProfilesPvPView: React.FC<ProfilesPvPViewProps> = ({
  profiles,
  activeProfileId,
  onDuelProfile,
  onSwitchProfile,
  onCreateProfile
}) => {
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    onCreateProfile(newProfileName.trim());
    setNewProfileName('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-400" />
            <h3 className="font-serif font-bold text-lg text-slate-100">
              Perfis de Jogadores & Duelo PvP (#duelorpg)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Alterne entre seus perfis ou desafie qualquer guerreiro do servidor para um combate direto com recompensas em moedas e EXP.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Criar Novo Guerreiro</span>
        </button>
      </div>

      {/* Inline Create Profile Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Nome do guerreiro (ex: Nunesjj, Valkyrie, Rex, MagoNegro)..."
              className="w-full sm:flex-1 bg-slate-950 text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!newProfileName.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-40"
            >
              Forjar Perfil
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs sm:text-sm cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((p) => {
          const isActive = p.id.toLowerCase() === activeProfileId.toLowerCase();
          const totalAtk = calculateTotalAttack(p);
          const totalDef = calculateTotalDefense(p);

          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-[#00a884] ring-1 ring-[#00a884]/40 shadow-xl'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Profile Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                      {p.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-100 text-base font-serif">
                          @{p.nome}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          Nv.{p.nivel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span className="text-rose-400 font-bold">HP: {p.hp}/{p.hpMax}</span>
                        <span>•</span>
                        <span className="text-amber-400">💰 {p.moedas}</span>
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Ativo
                    </span>
                  ) : null}
                </div>

                {/* Combat Attributes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono mb-3">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">Ataque</span>
                    <span className="text-red-400 font-bold text-sm">⚔️ {totalAtk}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">Defesa</span>
                    <span className="text-blue-400 font-bold text-sm">🛡️ {totalDef}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">Vitórias</span>
                    <span className="text-emerald-400 font-bold text-sm">🏆 {p.vitoriasPvP}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">Derrotas</span>
                    <span className="text-rose-400 font-bold text-sm">💀 {p.derrotasPvP}</span>
                  </div>
                </div>

                {/* Equipped Gear Preview */}
                <div className="text-[11px] text-slate-400 font-mono bg-slate-900/50 p-2 rounded-lg border border-slate-800/60 mb-3 space-y-0.5">
                  <div className="truncate">
                    🗡️ Arma: <span className="text-slate-200">{p.equipamentos.arma?.nome || 'Nenhuma'}</span>
                  </div>
                  <div className="truncate">
                    🥋 Armadura: <span className="text-slate-200">{p.equipamentos.armadura?.nome || 'Nenhuma'}</span>
                  </div>
                  <div className="truncate">
                    🎩 Elmo: <span className="text-slate-200">{p.equipamentos.elmo?.nome || 'Nenhum'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                {!isActive ? (
                  <>
                    <button
                      onClick={() => onDuelProfile(p.nome)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Duelar (#duelorpg)</span>
                    </button>
                    <button
                      onClick={() => onSwitchProfile(p.id)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer border border-slate-700"
                    >
                      Jogar Com Ele
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-1 text-xs font-mono text-[#00a884] font-semibold">
                    Este é o seu guerreiro atual. Escolha outro perfil para duelar!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

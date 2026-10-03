import React, { useState } from 'react';
import { DUNGEONS_CATALOG } from '../engine/gameData';
import { DungeonParty, PlayerProfile } from '../types/rpgBot';
import { Castle, Users, Skull, Trophy, Sparkles, Swords, Plus, Play, Lock, CheckCircle2 } from 'lucide-react';

interface DungeonsViewProps {
  activeProfile: PlayerProfile;
  activeParty: DungeonParty | null;
  profiles: PlayerProfile[];
  onCreateParty: (tipo: string) => void;
  onJoinParty: (partyId: string) => void;
  onStartDungeon: () => void;
}

export const DungeonsView: React.FC<DungeonsViewProps> = ({
  activeProfile,
  activeParty,
  profiles,
  onCreateParty,
  onJoinParty,
  onStartDungeon
}) => {
  const [joinIdInput, setJoinIdInput] = useState('');

  const currentDungeon = activeParty
    ? DUNGEONS_CATALOG.find((d) => d.id === activeParty.dungeonId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Castle className="w-5 h-5 text-purple-400" />
            <h3 className="font-serif font-bold text-lg text-slate-100">
              Dungeons Cooperativas & Chefões (#dungeon)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Forme grupos de jogadores, enfrente hordas de monstros e derrote os Bosses lendários para obter grandes fortunas e experiência.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={joinIdInput}
            onChange={(e) => setJoinIdInput(e.target.value)}
            placeholder="ID da Party..."
            className="flex-1 sm:w-36 bg-slate-950 text-slate-100 text-xs px-3 py-2.5 rounded-xl border border-slate-700 outline-none font-mono"
          />
          <button
            onClick={() => {
              if (joinIdInput.trim()) {
                onJoinParty(joinIdInput.trim());
                setJoinIdInput('');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-100 font-bold text-xs cursor-pointer shrink-0"
          >
            Entrar (#join)
          </button>
        </div>
      </div>

      {/* Active Party Banner (If exists) */}
      {activeParty && currentDungeon && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-2 border-purple-500/50 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/40 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentDungeon.icone}</span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700">
                  PARTY ATIVA
                </span>
                <h4 className="font-serif text-lg font-black text-slate-100 mt-0.5">
                  {currentDungeon.nome}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-purple-700/50 text-purple-300 font-bold">
                🆔 ID: {activeParty.id}
              </span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                👥 Membros: {activeParty.membrosIds.length}/{currentDungeon.jogadoresMax}
              </span>
            </div>
          </div>

          {/* Members preview */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              Membros no Grupo:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeParty.membrosIds.map((mId) => {
                const member = profiles.find((p) => p.id.toLowerCase() === mId.toLowerCase());
                return (
                  <div
                    key={mId}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono"
                  >
                    <span>{member?.avatar || '👤'}</span>
                    <span className="font-bold text-slate-200">@{member?.nome || mId}</span>
                    <span className="text-slate-500">Nv.{member?.nivel || 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boss info & Start raid */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Skull className="w-4 h-4 text-red-400" />
              <span>Boss: <strong className="text-red-300">{currentDungeon.boss.icone} {currentDungeon.boss.nome}</strong> ({currentDungeon.boss.hpMax} HP)</span>
            </div>

            <button
              onClick={onStartDungeon}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Incursão (#dungeon iniciar)</span>
            </button>
          </div>
        </div>
      )}

      {/* Dungeons Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DUNGEONS_CATALOG.map((dung) => {
          const unlocked = activeProfile.nivel >= dung.nivelMin;

          return (
            <div
              key={dung.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                unlocked
                  ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50 shadow-lg'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{dung.icone}</span>
                    <div>
                      <h4 className="font-serif font-bold text-base text-slate-100 flex items-center gap-1.5">
                        <span>{dung.nome}</span>
                        {unlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500" />
                        )}
                      </h4>
                      <p className="text-[11px] font-mono text-purple-300">
                        Nível Mínimo: {dung.nivelMin}+ | Até {dung.jogadoresMax} jogadores
                      </p>
                    </div>
                  </div>

                  <span className="bg-slate-950 px-2 py-0.5 rounded text-[11px] font-mono text-amber-300 border border-slate-800 font-bold shrink-0">
                    💰 {dung.recompensaMoedas.toLocaleString()}
                  </span>
                </div>

                {/* Boss Details */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5 my-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Boss da Dungeon:</span>
                    <span className="font-bold text-rose-300">
                      {dung.boss.icone} {dung.boss.nome}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Atributos do Boss:</span>
                    <span className="text-slate-400">
                      ❤️ {dung.boss.hpMax} HP | ⚔️ {dung.boss.ataque} | 🛡️ {dung.boss.defesa}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Recompensa EXP:</span>
                    <span className="text-purple-300 font-bold">✨ +{dung.recompensaXp} XP</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Loot Potencial:</span>
                    <span className="text-amber-400 truncate max-w-[180px]">
                      {dung.dropLoot.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  disabled={!unlocked}
                  onClick={() => onCreateParty(dung.id)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
                    unlocked
                      ? 'bg-purple-600 hover:bg-purple-500 text-slate-100 shadow cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {unlocked
                      ? `Criar Grupo (#dungeon criar ${dung.id})`
                      : `Bloqueado (Requer Nv.${dung.nivelMin})`}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ClanData, PlayerProfile } from '../types/rpgBot';
import { Castle, Shield, Users, Coins, Plus, Trophy } from 'lucide-react';

interface ClansViewProps {
  activeProfile: PlayerProfile;
  clans: ClanData[];
  profiles: PlayerProfile[];
  onCreateClan: (nome: string) => void;
  onDonateClan: (valor: number) => void;
}

export const ClansView: React.FC<ClansViewProps> = ({
  activeProfile,
  clans,
  profiles,
  onCreateClan,
  onDonateClan
}) => {
  const [novoClanNome, setNovoClanNome] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [doarValor, setDoarValor] = useState(100);

  const activeClan = clans.find((c) => c.id === activeProfile.claId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClanNome.trim()) return;
    onCreateClan(novoClanNome.trim());
    setNovoClanNome('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Castle className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-bold text-lg text-slate-100">
              Clãs & Guildas de Batalha (#cla)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reúna aliados sob o mesmo estandarte, fortaleça o cofre da guilda e dispute as glórias do reino.
          </p>
        </div>

        {!activeClan && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Fundar Novo Clã (2.000g)</span>
          </button>
        )}
      </div>

      {/* Create Clan Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/50 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={novoClanNome}
              onChange={(e) => setNovoClanNome(e.target.value)}
              placeholder="Nome do clã (ex: Cavaleiros de Ferro, Guardiões do Vazio)..."
              className="w-full sm:flex-1 bg-slate-950 text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!novoClanNome.trim() || activeProfile.moedas < 2000}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-40"
            >
              Fundar Clã
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

      {/* Active Clan Banner */}
      {activeClan && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border-2 border-indigo-500/50 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-indigo-700/50">
                🛡️
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700">
                  SEU CLÃ ATIVO
                </span>
                <h4 className="font-serif text-lg font-bold text-slate-100 mt-0.5">
                  [{activeClan.tag}] {activeClan.nome} (Nível {activeClan.nivel})
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-300 font-bold">
                💰 Cofre: {activeClan.moedasBanco.toLocaleString()}g
              </span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-emerald-400 font-bold">
                🏆 Guerras: {activeClan.vitoriasGuerra}
              </span>
            </div>
          </div>

          {/* Members list */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              Membros do Clã ({activeClan.membrosIds.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {activeClan.membrosIds.map((mId) => {
                const member = profiles.find((p) => p.id.toLowerCase() === mId.toLowerCase());
                return (
                  <div
                    key={mId}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                  >
                    <span>{member?.avatar || '👤'}</span>
                    <span className="font-bold text-slate-200">@{member?.nome || mId}</span>
                    {mId === activeClan.liderId && <span className="text-amber-400 text-[10px]">👑 Líder</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donation box */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-indigo-800/40">
            <span className="text-xs font-mono text-slate-300 shrink-0 w-full sm:w-auto">Doar para o cofre:</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                min="10"
                max={activeProfile.moedas}
                value={doarValor}
                onChange={(e) => setDoarValor(parseInt(e.target.value, 10) || 10)}
                className="flex-1 sm:w-28 bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 font-mono outline-none"
              />
              <button
                onClick={() => onDonateClan(doarValor)}
                disabled={activeProfile.moedas < doarValor}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-40 shrink-0"
              >
                Doar (#cla doar)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Clans list */}
      <div className="space-y-3">
        <h4 className="font-serif font-bold text-sm text-slate-300 uppercase tracking-wider">
          Clãs Registrados no Reino
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clans.map((clan) => (
            <div
              key={clan.id}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-2.5 shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏰</span>
                  <h5 className="font-bold text-base text-slate-100 font-serif">
                    [{clan.tag}] {clan.nome}
                  </h5>
                </div>
                <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-indigo-300 font-bold">
                  Nv.{clan.nivel}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Líder</span>
                  <span className="text-amber-400 font-bold">@{clan.liderId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Membros</span>
                  <span className="text-slate-200 font-bold">{clan.membrosIds.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Cofre</span>
                  <span className="text-emerald-400 font-bold">{clan.moedasBanco}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Swords, ShieldAlert, Heart, Shield, Zap, Skull } from 'lucide-react';
import { CombatState } from '../types/game';

interface CombatCardProps {
  combat: CombatState;
}

export const CombatCard: React.FC<CombatCardProps> = ({ combat }) => {
  if (!combat.emCombate || !combat.inimigo) return null;

  const enemy = combat.inimigo;
  const enemyHpPercent = Math.max(0, Math.min(100, Math.round((enemy.hpAtual / enemy.hpMax) * 100)));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900/90 to-purple-950/70 border-2 border-red-600/40 p-4 shadow-2xl shadow-red-950/40 mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Background glow accents */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Combat Header & Round */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-inner">
            <Swords className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/90 text-red-400 border border-red-800/80">
                COMBATE POR TURNOS
              </span>
              <span className="text-xs font-mono text-slate-400">
                Rodada #{combat.rodada || 1}
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
              <span>{enemy.nome}</span>
            </h3>
          </div>
        </div>

        {/* Center: Enemy HP bar & Stats */}
        <div className="flex-1 max-w-md bg-slate-950/70 p-3 rounded-xl border border-red-900/40">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-red-300">
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              Vitalidade do Inimigo
            </span>
            <span className="font-mono text-slate-300 text-xs">
              {enemy.hpAtual} / {enemy.hpMax} HP
            </span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500"
              style={{ width: `${enemyHpPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-red-400 font-bold">Ataque:</span>
              <span className="bg-red-950/80 px-2 py-0.5 rounded border border-red-800/40">{enemy.ataque}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-blue-400 font-bold">Defesa:</span>
              <span className="bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/40">{enemy.defesa}</span>
            </div>
            <div className="text-[11px] text-slate-400 italic">
              Dano = Ataque - Defesa
            </div>
          </div>
        </div>

        {/* Right: Initiative indicator */}
        <div className="flex flex-col items-center justify-center bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-center min-w-[140px]">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Iniciativa
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              combat.iniciativaJogador >= combat.iniciativaInimigo
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-slate-900 text-slate-400'
            }`}>
              Você: {combat.iniciativaJogador}
            </span>
            <span className="text-xs text-slate-600">vs</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              combat.iniciativaInimigo > combat.iniciativaJogador
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'bg-slate-900 text-slate-400'
            }`}>
              Inimigo: {combat.iniciativaInimigo}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1">
            {combat.vezDoJogador ? '⚡ Sua Vez de Agir' : '⚠️ Vez do Inimigo'}
          </span>
        </div>
      </div>
    </div>
  );
};

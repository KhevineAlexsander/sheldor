import React from 'react';
import { Heart, Zap, Shield, Sparkles, Coins, Package, Award } from 'lucide-react';
import { Character } from '../types/game';

interface StatusHeaderProps {
  character: Character;
  onOpenInventory: () => void;
  onOpenLevelUp?: () => void;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  character,
  onOpenInventory,
  onOpenLevelUp
}) => {
  const hpPercent = Math.max(0, Math.min(100, Math.round((character.hpAtual / character.hpMax) * 100)));
  const manaPercent = Math.max(0, Math.min(100, Math.round((character.manaAtual / character.manaMax) * 100)));
  const xpPercent = Math.max(0, Math.min(100, Math.round((character.xpAtual / character.xpProximo) * 100)));

  // Color for HP bar based on percentage
  const hpColorClass =
    hpPercent > 50
      ? 'from-emerald-500 to-green-600'
      : hpPercent > 25
      ? 'from-amber-500 to-orange-600'
      : 'from-rose-600 to-red-700 animate-pulse';

  const hasLevelUpPoints = (character.pontosDisponiveis || 0) > 0 || character.xpAtual >= character.xpProximo;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 shadow-xl px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Character Info & Level */}
        <div className="flex items-center gap-3.5 min-w-[240px]">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-indigo-500/30 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
              {character.avatarIcon || '⚔️'}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full border border-amber-300 shadow">
              Nv.{character.nivel}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-base truncate font-serif">
                {character.nome}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                {character.classe}
              </span>
            </div>

            {/* XP progress */}
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-purple-300 font-medium shrink-0">
                XP {character.xpAtual}/{character.xpProximo}
              </span>

              {hasLevelUpPoints && (
                <button
                  onClick={onOpenLevelUp}
                  className="animate-bounce flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black shadow-md cursor-pointer hover:brightness-110"
                >
                  <Award className="w-3 h-3" />
                  +3 PONTOS
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center: HP & Mana Bars */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          {/* HP Bar */}
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1 font-semibold text-rose-300">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                Vida (HP)
              </span>
              <span className="font-mono text-slate-300 text-[11px]">
                {character.hpAtual} / {character.hpMax}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${hpColorClass} transition-all duration-500`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Mana / Energy Bar */}
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1 font-semibold text-cyan-300">
                <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                Mana / Energia
              </span>
              <span className="font-mono text-slate-300 text-[11px]">
                {character.manaAtual} / {character.manaMax}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                style={{ width: `${manaPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Attributes Badges, Purse & Inventory Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stats Chips */}
          <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono">
            <span className="text-red-400 font-bold" title="Força: Dano e poder físico">
              FOR:{character.atributos.forca}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold" title="Agilidade: Velocidade e iniciativa">
              AGI:{character.atributos.agilidade}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold" title="Vitalidade: Vida e resistência">
              VIT:{character.atributos.vitalidade}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold" title="Inteligência: Mana e magias">
              INT:{character.atributos.inteligencia}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-purple-400 font-bold" title="Percepção: Investigação e pontaria">
              PER:{character.atributos.percepcao}
            </span>
          </div>

          {/* Status Condition */}
          <div
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
              character.statusEspecial && character.statusEspecial.toLowerCase() !== 'normal' && character.statusEspecial.toLowerCase() !== 'nenhum'
                ? 'bg-rose-950/60 text-rose-300 border-rose-800/60 animate-pulse'
                : 'bg-slate-950/60 text-slate-400 border-slate-800'
            }`}
            title="Condição Especial do Personagem"
          >
            {character.statusEspecial || 'Normal'}
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono font-semibold">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{character.moedas}</span>
          </div>

          {/* Inventory Button */}
          <button
            onClick={onOpenInventory}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-700/40 text-xs font-medium cursor-pointer transition hover:border-indigo-500"
            title="Abrir Mochila de Inventário"
          >
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>Itens ({character.inventario.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

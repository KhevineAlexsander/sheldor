import React from 'react';
import { Package, X, Heart, Zap, Trash2, Sparkles, Coins } from 'lucide-react';
import { Character } from '../types/game';
import { playHealSound } from '../utils/audio';

interface InventoryModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onUseItem: (index: number, itemName: string) => void;
  onDropItem: (index: number) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  character,
  isOpen,
  onClose,
  onUseItem,
  onDropItem
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-bold text-base text-slate-100">
              Mochila de Inventário
            </h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {character.inventario.length} / 12 slots
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency summary */}
        <div className="px-4 py-2.5 bg-amber-950/20 border-b border-amber-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Fundos do Aventureiro:</span>
          </div>
          <span className="font-mono font-bold text-amber-300 text-sm">
            {character.moedas} Moedas / Créditos
          </span>
        </div>

        {/* Item List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {character.inventario.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs font-mono">
              Sua mochila está vazia. Derrote inimigos ou investigue locais para obter itens!
            </div>
          ) : (
            character.inventario.map((item, index) => {
              const isConsumable = /poção|bálsamo|elixir|ração|medikit|isotônica|curativ|estimulante/i.test(item);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0">
                      {isConsumable ? '🧪' : '⚔️'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                        {item}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {isConsumable ? 'Consumível / Cura' : 'Equipamento / Utilidade'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isConsumable && (
                      <button
                        onClick={() => onUseItem(index, item)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs font-medium cursor-pointer transition flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3" />
                        <span>Usar</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDropItem(index)}
                      title="Descartar Item"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 text-center font-mono">
          Consumíveis restauram Pontos de Vida (HP) ou Energia instantaneamente.
        </div>
      </div>
    </div>
  );
};

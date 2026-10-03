import React from 'react';
import { EQUIPMENT_CATALOG, CATALOGO_EQUIPAMENTOS } from '../engine/gameData';
import { EquipSlot, InstanciaEquip, ItemInventario, PlayerProfile } from '../types/rpgBot';
import { Shield, Swords, ShoppingBag, Check, X, Coins, Sparkles, Wand2 } from 'lucide-react';
import { bonusEfetivo } from '../engine/itemSystemV3';

interface ShopEquipViewProps {
  activeProfile: PlayerProfile;
  onEquipItem: (itemId: string) => void;
  onUnequipSlot: (slot: EquipSlot) => void;
  onBuyItem: (itemId: string) => void;
  onEnchantSlot: (slot: EquipSlot) => void;
}

export const ShopEquipView: React.FC<ShopEquipViewProps> = ({
  activeProfile,
  onEquipItem,
  onUnequipSlot,
  onBuyItem,
  onEnchantSlot
}) => {
  const eq = activeProfile.equipamentos;
  const gemasQtd =
    activeProfile.inventario.find(
      (i): i is Extract<ItemInventario, { tipo: 'material' | 'consumivel' }> =>
        (i.tipo === 'material' || i.tipo === 'consumivel') && i.itemId === 'gema_bruta'
    )?.quantidade || 0;

  const slots: { slot: EquipSlot; label: string; icon: string; item: InstanciaEquip | null }[] = [
    { slot: 'elmo', label: 'Elmo', icon: '🎩', item: eq.elmo },
    { slot: 'armadura', label: 'Peitoral', icon: '🥋', item: eq.armadura },
    { slot: 'calca', label: 'Calças', icon: '👖', item: eq.calca },
    { slot: 'botas', label: 'Botas', icon: '🥾', item: eq.botas },
    { slot: 'arma', label: 'Arma', icon: '🗡️', item: eq.arma },
    { slot: 'escudo', label: 'Escudo', icon: '🛡️', item: eq.escudo }
  ];

  return (
    <div className="space-y-6">
      {/* Current Equipment Slots (Paperdoll) */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="font-serif font-bold text-lg text-slate-100">
              Equipamentos do Guerreiro (@{activeProfile.nome})
            </h3>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-amber-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              💰 Saldo: {activeProfile.moedas.toLocaleString()}g
            </span>
            <span className="text-purple-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              💎 Gemas: {gemasQtd}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {slots.map(({ slot, label, icon, item }) => {
            const atkBonus = item ? Math.round(bonusEfetivo(item, 'atk')) : 0;
            const defBonus = item ? Math.round(bonusEfetivo(item, 'def')) : 0;

            return (
              <div
                key={slot}
                className={`p-3 rounded-xl border flex flex-col justify-between text-center relative ${
                  item
                    ? 'bg-slate-950/80 border-slate-700'
                    : 'bg-slate-950/40 border-dashed border-slate-800'
                }`}
              >
                <div>
                  <div className="text-2xl mb-1">{item ? item.icone : icon}</div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">
                    {label}
                  </span>
                  <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                    {item ? item.nome : 'Vazio'}
                  </p>
                  {item && (
                    <div className="text-[10px] font-mono text-cyan-400 mt-1 space-y-0.5">
                      {item.encantamento > 0 && (
                        <span className="text-amber-400 font-bold block">+{item.encantamento}</span>
                      )}
                      {defBonus > 0 && <span>🛡️ +{defBonus} </span>}
                      {atkBonus > 0 && <span>⚔️ +{atkBonus}</span>}
                      <div className="text-[9px] text-slate-400">
                        🔧 {item.durabilidade}/{item.durabilidadeMax}
                      </div>
                    </div>
                  )}
                </div>

                {item && (
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => onEnchantSlot(slot)}
                      className="w-full text-[10px] text-purple-300 hover:text-purple-200 py-1 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Encantar (+1)</span>
                    </button>
                    <button
                      onClick={() => onUnequipSlot(slot)}
                      className="w-full text-[10px] text-rose-400 hover:text-rose-300 py-0.5 rounded bg-rose-950/40 hover:bg-rose-950 border border-rose-900 transition cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shop Catalog */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif font-bold text-lg text-slate-100">
            Mercado da Armaria (#loja & #comprar)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(EQUIPMENT_CATALOG).map((item) => {
            const canAfford = activeProfile.moedas >= item.preco;
            const slotKey = item.slot as EquipSlot;
            const isEquipped = activeProfile.equipamentos[slotKey]?.itemId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                    {item.icone}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100 truncate">
                        {item.nome}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-purple-300 block">
                      #{item.id} • Slot: {item.slot}
                    </span>
                    <div className="text-xs font-mono text-cyan-300 mt-1">
                      {item.bonusDefesa > 0 ? `🛡️ Defesa +${item.bonusDefesa} ` : ''}
                      {item.bonusAtaque > 0 ? `⚔️ Ataque +${item.bonusAtaque}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    💰 {item.preco.toLocaleString()} moedas
                  </span>

                  {isEquipped ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Equipado
                    </span>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => onBuyItem(item.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Comprar & Guardar' : 'Sem Moedas'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

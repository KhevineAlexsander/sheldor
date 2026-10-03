import React from 'react';
import { ItemInventario, PlayerProfile } from '../types/rpgBot';
import { Calendar, CheckCircle2, Flame, Gift, Sparkles, Zap, Heart } from 'lucide-react';

interface QuestsDailyViewProps {
  activeProfile: PlayerProfile;
  onClaimDaily: () => void;
  onUsePotion: (tipo: 'pocao_hp' | 'pocao_energia') => void;
}

export const QuestsDailyView: React.FC<QuestsDailyViewProps> = ({
  activeProfile,
  onClaimDaily,
  onUsePotion
}) => {
  const diario = activeProfile.diario;
  const countMine = activeProfile.contadores24h.mine.length;
  const countTrab = activeProfile.contadores24h.trabalhar.length;
  const countDuelo = Object.values(activeProfile.contadores24h.duelosPorOponente).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  const dateStr = new Date().toISOString().slice(0, 10);
  const q1Done = diario.questsConcluidas.includes(`quest_mine_${dateStr}`) || countMine >= 5;
  const q2Done = diario.questsConcluidas.includes(`quest_trabalhar_${dateStr}`) || countTrab >= 2;
  const q3Done = diario.questsConcluidas.includes(`quest_duelo_${dateStr}`) || countDuelo >= 1;

  const pocaoHpQtd =
    activeProfile.inventario.find(
      (i): i is Extract<ItemInventario, { tipo: 'material' | 'consumivel' }> =>
        (i.tipo === 'material' || i.tipo === 'consumivel') &&
        (i.itemId === 'pocao_hp' || i.itemId.startsWith('pocao_cura'))
    )?.quantidade || 0;

  const pocaoEnergiaQtd =
    activeProfile.inventario.find(
      (i): i is Extract<ItemInventario, { tipo: 'material' | 'consumivel' }> =>
        (i.tipo === 'material' || i.tipo === 'consumivel') && i.itemId === 'pocao_energia'
    )?.quantidade || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h3 className="font-serif font-bold text-lg text-slate-100">
            Jornada Diária & Sequência de Login (#diario & #quest)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Faça check-in todos os dias para acumular streaks de recompensas crescentes e cumpra tarefas para encher seus bolsos de ouro e gemas arcanas.
        </p>
      </div>

      {/* Daily Streak Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-2xl shadow">
              🔥
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-300">
                SEQUÊNCIA DE LOGIN DIÁRIO
              </span>
              <h4 className="font-serif text-lg font-bold text-slate-100">
                Dia {diario.streak} Consecutivo
              </h4>
            </div>
          </div>

          <button
            onClick={onClaimDaily}
            disabled={diario.coletadoHoje}
            className={`py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
              !diario.coletadoHoje
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/50 animate-bounce'
                : 'bg-slate-800 text-slate-500 cursor-default'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{diario.coletadoHoje ? 'Coletado Hoje ✓' : 'Resgatar Recompensa (#diario)'}</span>
          </button>
        </div>

        {/* 7 Days Preview Track */}
        <div className="flex sm:grid sm:grid-cols-7 gap-2 pt-2 overflow-x-auto pb-1 no-scrollbar">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const isCompleted = d < diario.streak || (d === diario.streak && diario.coletadoHoje);
            const isToday = d === diario.streak && !diario.coletadoHoje;

            return (
              <div
                key={d}
                className={`min-w-[70px] sm:min-w-0 flex-1 p-2 rounded-xl text-center border text-xs font-mono transition shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : isToday
                    ? 'bg-amber-950/80 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[10px] block opacity-70">Dia {d}</span>
                <span className="font-bold text-sm block mt-0.5">{d * 150}g</span>
                {d === 7 && <span className="text-[9px] text-amber-400 block">+1⚡ Poção</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Quests List */}
      <div className="space-y-3">
        <h4 className="font-serif font-bold text-sm text-slate-300 uppercase tracking-wider">
          Missões do Dia (#quest)
        </h4>

        <div className="space-y-3">
          {/* Quest 1 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">⛏️ Mineração Diária</span>
                {q1Done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Minere pelo menos 5 vezes nas jazidas do reino.</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 max-w-xs h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, (countMine / 5) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400">{Math.min(5, countMine)}/5</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-xs text-amber-300 font-bold block">+350 moedas</span>
              <span className="font-mono text-[10px] text-purple-300 block">+80 XP</span>
            </div>
          </div>

          {/* Quest 2 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">💼 Trabalhador Incansável</span>
                {q2Done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Realize 2 turnos de serviço urbano na guilda.</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 max-w-xs h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, (countTrab / 2) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400">{Math.min(2, countTrab)}/2</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-xs text-amber-300 font-bold block">+300 moedas</span>
              <span className="font-mono text-[10px] text-purple-300 block">+60 XP</span>
            </div>
          </div>

          {/* Quest 3 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">⚔️ Provador de Glória</span>
                {q3Done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Participe de 1 duelo PvP contra outro guerreiro.</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 max-w-xs h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, (countDuelo / 1) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400">{Math.min(1, countDuelo)}/1</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-xs text-amber-300 font-bold block">+400 moedas</span>
              <span className="font-mono text-[10px] text-purple-300 block">+100 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Potion Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm text-slate-200">Consumíveis Rápidos</h4>
          <p className="text-xs text-slate-400">Restaure HP ou Energia instantaneamente em emergências.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUsePotion('pocao_hp')}
            disabled={pocaoHpQtd <= 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-mono font-bold transition disabled:opacity-40 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Usar Poção HP ({pocaoHpQtd})</span>
          </button>

          <button
            onClick={() => onUsePotion('pocao_energia')}
            disabled={pocaoEnergiaQtd <= 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold transition disabled:opacity-40 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-cyan-400" />
            <span>Usar Energia +30 ({pocaoEnergiaQtd})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

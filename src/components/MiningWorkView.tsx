import React from 'react';
import { PlayerProfile } from '../types/rpgBot';
import { Pickaxe, Briefcase, Wrench, Coins, Sparkles, Package } from 'lucide-react';

interface MiningWorkViewProps {
  activeProfile: PlayerProfile;
  onMine: () => void;
  onWork: () => void;
  onRepairPickaxe: () => void;
}

export const MiningWorkView: React.FC<MiningWorkViewProps> = ({
  activeProfile,
  onMine,
  onWork,
  onRepairPickaxe
}) => {
  const pic = activeProfile.ferramenta || (activeProfile.picareta ? {
    nome: `Picareta de ${activeProfile.picareta.tipo}`,
    tipo: activeProfile.picareta.tipo,
    durabilidade: activeProfile.picareta.durabilidade,
    durabilidadeMax: activeProfile.picareta.durabilidadeMax
  } : null);

  const durab = pic ? pic.durabilidade : 0;
  const durabMax = pic ? pic.durabilidadeMax : 1;
  const duraPercent = Math.max(0, Math.min(100, Math.round((durab / durabMax) * 100)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Pickaxe className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif font-bold text-lg text-slate-100">
            Minas & Trabalho (#mine / #trabalhar)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Obtenha moedas, pedras rústicas, ferro e ouro minerando cavernas subterrâneas ou faça turnos de trabalho na cidade para juntar recursos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mining Station Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
                  ⛏️
                </span>
                <div>
                  <h4 className="font-serif font-bold text-base text-slate-100">
                    Estação de Mineração
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {pic ? pic.nome : 'Nenhuma picareta equipada'}
                  </span>
                </div>
              </div>

              {pic && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                  🛠️ {durab} / {durabMax}
                </span>
              )}
            </div>

            {/* Durability Bar */}
            {pic ? (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Integridade da Picareta</span>
                  <span className={duraPercent < 25 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                    {duraPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      duraPercent > 50
                        ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                        : duraPercent > 20
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${duraPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-400 font-mono">
                ⚠️ Compre uma picareta na loja (#loja) e equipe com #equipar para começar a minerar.
              </p>
            )}

            <p className="text-xs text-slate-400 leading-relaxed">
              Cada golpe nas rochas consome 1 ponto de durabilidade e pode render moedas bônus, pedras, ferro e ouro.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              onClick={onMine}
              disabled={!pic || durab <= 0}
              className="flex-1 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-md transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Pickaxe className="w-4 h-4" />
              <span>{pic ? 'Minerar Agora (#mine)' : 'Equipe uma Picareta'}</span>
            </button>

            {pic && durab < durabMax && (
              <button
                onClick={onRepairPickaxe}
                className="w-full sm:w-auto py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                title="Consertar Picareta (#consertar picareta)"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Reparar Picareta</span>
              </button>
            )}
          </div>
        </div>

        {/* Work Station Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/30 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xl">
                💼
              </span>
              <div>
                <h4 className="font-serif font-bold text-base text-slate-100">
                  Trabalho Urbano
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  Contratos e Serviços da Guilda
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Realize tarefas para os mercadores locais e guardas da cidade. Rende moedas seguras e pontos de experiência a cada expediente.
            </p>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Ganhos Médios:</span>
                <span className="text-amber-300 font-bold">200 ~ 350 Moedas</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">EXP Garantido:</span>
                <span className="text-purple-300 font-bold">+25 ~ 45 XP</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onWork}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Trabalhar Turno (#trabalhar)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

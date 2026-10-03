import React, { useState } from 'react';
import { PlayerProfile } from '../types/rpgBot';
import { formatTimeRemaining } from '../engine/rpgEngine';
import { Coins, Sparkles, AlertCircle, CircleDot } from 'lucide-react';

interface CasinoRouletteViewProps {
  activeProfile: PlayerProfile;
  onSpin: (valor: number, aposta: string) => void;
}

export const CasinoRouletteView: React.FC<CasinoRouletteViewProps> = ({ activeProfile, onSpin }) => {
  const [valor, setValor] = useState<number>(50);
  const [escolha, setEscolha] = useState<'vermelho' | 'preto' | 'numero'>('vermelho');
  const [numeroAlvo, setNumeroAlvo] = useState<number>(7);

  const agora = Date.now();
  const cdRestante = activeProfile.cooldowns.roleta > agora ? activeProfile.cooldowns.roleta - agora : 0;
  const apostasHoje = activeProfile.contadores24h.roletaContador || 0;
  const maxAposta = Math.max(50, Math.floor(activeProfile.moedas * 0.1));

  const handleBet = () => {
    const alvo = escolha === 'numero' ? numeroAlvo.toString() : escolha;
    onSpin(valor, alvo);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎰</span>
          <h3 className="font-serif font-bold text-lg text-slate-100">
            Roleta da Taberna (#roleta)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Aposte suas moedas na roleta tradicional de 37 casas (0 a 36). Vermelho e Preto pagam 2x o valor, enquanto acertar o número exato paga 14x! Aposta máxima limitada a 10% do seu saldo.
        </p>
      </div>

      <div className="max-w-xl mx-auto p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950/20 border border-slate-800 space-y-5 shadow-2xl">
        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Seu Saldo: <strong className="text-amber-300">{activeProfile.moedas.toLocaleString()}g</strong></span>
          </div>

          <div className="text-slate-400">
            Apostas hoje: <strong className={apostasHoje >= 20 ? 'text-rose-400' : 'text-slate-200'}>{apostasHoje}/20</strong>
          </div>
        </div>

        {/* Bet Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold text-slate-300 uppercase">
            1. Escolha onde apostar
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => setEscolha('vermelho')}
              className={`py-3 rounded-xl font-bold text-xs sm:text-sm border transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                escolha === 'vermelho'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/40 ring-1 ring-rose-400'
                  : 'bg-rose-950/40 text-rose-300 border-rose-900/50 hover:bg-rose-900/40'
              }`}
            >
              <span>🔴 Vermelho</span>
              <span className="text-[10px] font-mono opacity-80">Paga 2x</span>
            </button>

            <button
              onClick={() => setEscolha('preto')}
              className={`py-3 rounded-xl font-bold text-xs sm:text-sm border transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                escolha === 'preto'
                  ? 'bg-slate-800 text-white border-slate-500 shadow-lg ring-1 ring-slate-400'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <span>⚫ Preto</span>
              <span className="text-[10px] font-mono opacity-80">Paga 2x</span>
            </button>

            <button
              onClick={() => setEscolha('numero')}
              className={`py-3 rounded-xl font-bold text-xs sm:text-sm border transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                escolha === 'numero'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg ring-1 ring-amber-300'
                  : 'bg-amber-950/40 text-amber-300 border-amber-900/50 hover:bg-amber-900/40'
              }`}
            >
              <span>🎯 Número</span>
              <span className="text-[10px] font-mono opacity-80">Paga 14x</span>
            </button>
          </div>

          {escolha === 'numero' && (
            <div className="space-y-1.5 pt-2 animate-in fade-in duration-200">
              <label className="text-[11px] font-mono text-slate-400">
                Selecione o número (0 a 36):
              </label>
              <input
                type="number"
                min="0"
                max="36"
                value={numeroAlvo}
                onChange={(e) => setNumeroAlvo(Math.max(0, Math.min(36, parseInt(e.target.value, 10) || 0)))}
                className="w-full bg-slate-950 text-slate-100 text-sm px-3.5 py-2 rounded-xl border border-slate-700 outline-none font-mono"
              />
            </div>
          )}
        </div>

        {/* Bet Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase">2. Valor da Aposta:</span>
            <span className="text-amber-400 font-bold">{valor} moedas</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[20, 50, 100, 200, maxAposta].map((v) => (
              <button
                key={v}
                onClick={() => setValor(Math.min(v, maxAposta))}
                className={`py-2 px-1 rounded-lg text-[11px] sm:text-xs font-mono border transition cursor-pointer text-center truncate ${
                  valor === v
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {v === maxAposta ? 'Máx (10%)' : `${v}g`}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="10"
            max={Math.max(50, maxAposta)}
            value={valor}
            onChange={(e) => setValor(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Spin Action */}
        <button
          disabled={cdRestante > 0 || apostasHoje >= 20 || activeProfile.moedas < valor}
          onClick={handleBet}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
            cdRestante <= 0 && apostasHoje < 20 && activeProfile.moedas >= valor
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-900/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <CircleDot className="w-4 h-4" />
          <span>
            {cdRestante > 0
              ? `Roleta em resfriamento (${formatTimeRemaining(cdRestante)})`
              : apostasHoje >= 20
              ? 'Limite de 20 apostas diárias atingido'
              : activeProfile.moedas < valor
              ? 'Saldo insuficiente'
              : `Girar a Roleta (#roleta ${valor} ${escolha === 'numero' ? numeroAlvo : escolha})`}
          </span>
        </button>
      </div>
    </div>
  );
};

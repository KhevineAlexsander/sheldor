import React from 'react';
import { Skull, RotateCcw, BookmarkCheck, Heart } from 'lucide-react';
import { Character } from '../types/game';

interface GameOverModalProps {
  character: Character;
  isOpen: boolean;
  onRestoreCheckpoint: () => void;
  onRestartAdventure: () => void;
  temCheckpoint: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  character,
  isOpen,
  onRestoreCheckpoint,
  onRestartAdventure,
  temCheckpoint
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-gradient-to-b from-red-950/80 via-slate-900 to-slate-950 border-2 border-red-600/60 rounded-2xl shadow-2xl p-6 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-xl shadow-red-900/40">
          <Skull className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-red-400">
            Fim de Jogo
          </span>
          <h3 className="font-serif text-3xl font-black text-slate-100">
            Seu Destino Encontrou o Fim
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Os ferimentos de <span className="font-bold text-red-300">{character.nome}</span> foram severos demais. Suas forças se esvaíram e a escuridão cobriu o campo de batalha.
          </p>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-red-900/30 text-xs text-slate-400 font-mono">
          Nenhum herói perece em vão. Restaure o ponto de controle anterior ou forje uma nova história em outro mundo.
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRestoreCheckpoint}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-900/40 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Restaurar Checkpoint Seguro (Recuperar HP)</span>
          </button>

          <button
            onClick={onRestartAdventure}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Novo Personagem / Reiniciar Aventura</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Volume2, VolumeX, BookOpen, Dices, RotateCcw, Shield, Sparkles, BookmarkCheck } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playSuccessSound } from '../utils/audio';

interface HeaderProps {
  universoTitulo: string;
  onOpenRules: () => void;
  onOpenDiceRoller: () => void;
  onOpenSaveCheckpoint: () => void;
  onRestartGame: () => void;
  soundActive: boolean;
  setSoundActive: (active: boolean) => void;
  temCheckpointSalvo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  universoTitulo,
  onOpenRules,
  onOpenDiceRoller,
  onOpenSaveCheckpoint,
  onRestartGame,
  soundActive,
  setSoundActive,
  temCheckpointSalvo
}) => {
  const toggleSound = () => {
    const newState = !soundActive;
    setSoundEnabled(newState);
    setSoundActive(newState);
    if (newState) {
      playSuccessSound();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-900/30 px-4 py-3 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Universe Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-purple-600 to-indigo-600 p-[2px] shadow-lg shadow-purple-900/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-purple-300 bg-clip-text text-transparent">
                MESTRE RPG
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                Crônicas Vivas
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {universoTitulo}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundActive ? 'Desativar Sons' : 'Ativar Sons'}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 transition"
          >
            {soundActive ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Dice Sandbox */}
          <button
            onClick={onOpenDiceRoller}
            title="Rolar Dados Manuais (d20 / d6)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-xs font-medium transition"
          >
            <Dices className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Rolar d20</span>
          </button>

          {/* Checkpoint Save */}
          <button
            onClick={onOpenSaveCheckpoint}
            title="Salvar / Restaurar Checkpoint"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 text-xs font-medium transition"
          >
            <BookmarkCheck className={`w-4 h-4 ${temCheckpointSalvo ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Checkpoint</span>
          </button>

          {/* Rules Book */}
          <button
            onClick={onOpenRules}
            title="Regras & Guia do Sistema"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-xs font-medium transition"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Regras</span>
          </button>

          {/* New Game */}
          <button
            onClick={onRestartGame}
            title="Reiniciar Nova Aventura"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Novo Jogo</span>
          </button>
        </div>
      </div>
    </header>
  );
};

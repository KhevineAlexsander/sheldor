import React from 'react';
import { BookmarkCheck, X, RotateCcw, Save, Trash2, Check } from 'lucide-react';
import { Character, CombatState } from '../types/game';
import { playSuccessSound } from '../utils/audio';

interface CheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  combat: CombatState | null;
  onSaveCheckpoint: () => void;
  onRestoreCheckpoint: () => void;
  temCheckpoint: boolean;
  checkpointTimestamp?: string;
}

export const CheckpointModal: React.FC<CheckpointModalProps> = ({
  isOpen,
  onClose,
  character,
  combat,
  onSaveCheckpoint,
  onRestoreCheckpoint,
  temCheckpoint,
  checkpointTimestamp
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif font-bold text-base text-slate-100">
              Checkpoint & Memória da Jornada
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Salve seu progresso seguro a qualquer momento. Se seu herói cair em combate, você poderá restaurar este ponto exato com sua vida e inventário preservados.
        </p>

        {/* Current status info */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-300">
            <span>Personagem:</span>
            <span className="text-amber-300 font-bold">{character.nome} (Nv.{character.nivel})</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Vida Atual:</span>
            <span className="text-rose-400 font-bold">{character.hpAtual} / {character.hpMax} HP</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Status do Checkpoint:</span>
            <span className={temCheckpoint ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {temCheckpoint ? `Salvo (${checkpointTimestamp || 'Recente'})` : 'Nenhum ponto salvo'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onSaveCheckpoint();
              playSuccessSound();
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-900/30 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Gravar Checkpoint Agora</span>
          </button>

          {temCheckpoint && (
            <button
              onClick={() => {
                onRestoreCheckpoint();
                playSuccessSound();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Restaurar Último Checkpoint</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

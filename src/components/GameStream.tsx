import React, { useEffect, useRef } from 'react';
import { GameLogMessage } from '../types/game';
import { DiceRollAnimation } from './DiceRollAnimation';
import { User, Shield, Terminal, Sparkles } from 'lucide-react';

interface GameStreamProps {
  messages: GameLogMessage[];
  loading: boolean;
}

export const GameStream: React.FC<GameStreamProps> = ({ messages, loading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Format GM message: render status block, narrative, and dice roll nicely
  const renderMessageContent = (msg: GameLogMessage) => {
    if (msg.remetente === 'jogador') {
      return (
        <div className="flex items-start gap-3 justify-end">
          <div className="max-w-2xl bg-amber-500/10 border border-amber-500/30 rounded-2xl rounded-tr-none px-4 py-3 shadow-md">
            <div className="text-[10px] uppercase font-bold text-amber-400 mb-1 flex items-center gap-1 justify-end">
              <User className="w-3 h-3" />
              Sua Ação
            </div>
            <p className="text-sm md:text-base text-amber-100 font-medium leading-relaxed">
              {msg.conteudo}
            </p>
          </div>
        </div>
      );
    }

    if (msg.remetente === 'sistema') {
      return (
        <div className="flex justify-center my-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>{msg.conteudo}</span>
          </div>
        </div>
      );
    }

    // Master narrative
    return (
      <div className="space-y-4">
        {/* Render dice roll card if this message triggered one */}
        {msg.rolagem && <DiceRollAnimation roll={msg.rolagem} />}

        {/* Narrative Box */}
        <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 md:p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Game Master</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {msg.timestamp}
            </span>
          </div>

          {/* Formatted narrative prose */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm md:text-base leading-relaxed space-y-3 font-sans">
            {msg.conteudo.split('\n\n').map((paragraph, idx) => {
              // Highlight status blocks if in text
              if (paragraph.includes('[STATUS DO PERSONAGEM]')) {
                return (
                  <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 my-2 whitespace-pre-wrap">
                    {paragraph}
                  </div>
                );
              }
              if (paragraph.includes('[TESTE DE DADO]') || paragraph.includes('[Teste de ')) {
                return (
                  <div key={idx} className="bg-purple-950/40 p-2.5 rounded-lg border border-purple-800/50 text-xs font-mono text-purple-200 my-1">
                    {paragraph}
                  </div>
                );
              }
              if (paragraph.includes('[OPÇÕES DE AÇÃO]')) {
                return null; // Will be displayed in interactive action controls
              }
              return (
                <p key={idx} className="text-slate-200 leading-relaxed font-normal">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl mx-auto w-full">
      {messages.map((msg) => (
        <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderMessageContent(msg)}
        </div>
      ))}

      {/* Loading state indicator */}
      {loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse max-w-sm">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-mono text-amber-300">
            O Game Master está calculando o destino e os dados...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

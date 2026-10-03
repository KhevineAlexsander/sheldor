import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Terminal, CornerDownLeft, HelpCircle, Swords, Castle, Pickaxe, Briefcase, Shield, RefreshCw } from 'lucide-react';
import { BotChatMessage, PlayerProfile } from '../types/rpgBot';

interface WhatsAppChatProps {
  messages: BotChatMessage[];
  onSendCommand: (cmd: string) => void;
  activeProfile: PlayerProfile;
  botName?: string;
  isProcessing?: boolean;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  messages,
  onSendCommand,
  activeProfile,
  botName = 'SHELDORBOT',
  isProcessing = false
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendCommand(inputText.trim());
    setInputText('');
  };

  const quickCommands = [
    { label: '#menu', cmd: '#menu', icon: '📜' },
    { label: '#mine', cmd: '#mine', icon: '⛏️' },
    { label: '#trabalhar', cmd: '#trabalhar', icon: '💼' },
    { label: '#duelorpg @ALEXBOT', cmd: '#duelorpg @ALEXBOT', icon: '⚔️' },
    { label: '#dungeon', cmd: '#dungeon', icon: '🏰' },
    { label: '#arena 1', cmd: '#arena 1', icon: '🏟️' },
    { label: '#roleta 50 vermelho', cmd: '#roleta 50 vermelho', icon: '🎰' },
    { label: '#pet', cmd: '#pet', icon: '🐾' },
    { label: '#diario', cmd: '#diario', icon: '📅' },
    { label: '#perfil', cmd: '#perfil', icon: '👤' },
    { label: '#loja', cmd: '#loja', icon: '🏪' },
    { label: '#curar', cmd: '#curar', icon: '✨' },
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-175px)] min-h-[480px] sm:h-[650px] bg-[#0c1317] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* WhatsApp Chat Header */}
      <div className="bg-[#202c33] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-slate-700/60 z-10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow">
              🤖
            </div>
            <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-[#202c33] absolute bottom-0 right-0 ${
              isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
            }`}></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-xs sm:text-base text-slate-100 flex items-center gap-1 truncate">
                <span>{botName}</span>
                <span className="text-[9px] sm:text-[10px] bg-slate-700 text-slate-300 px-1 py-0.2 rounded font-mono">RPG BOT</span>
              </h3>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono flex items-center gap-1 truncate">
              {isProcessing ? (
                <span className="text-emerald-400 font-bold animate-pulse flex items-center gap-1">
                  <span>digitando</span>
                  <span className="inline-flex gap-0.5">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:0.2s]">.</span>
                    <span className="animate-bounce [animation-delay:0.4s]">.</span>
                  </span>
                </span>
              ) : (
                <>
                  <span className="text-emerald-400">● online</span>
                  <span className="text-slate-400 hidden xs:inline">•</span>
                  <span className="text-slate-400 hidden xs:inline">Jogador:</span>
                  <strong className="text-amber-300 truncate">@{activeProfile.nome}</strong>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-slate-400 shrink-0">
          <span className="bg-slate-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-700 text-amber-300">
            Nv.{activeProfile.nivel} | 💰 {activeProfile.moedas}
          </span>
        </div>
      </div>

      {/* Quick Commands Carousel */}
      <div className="bg-[#111b21] px-2.5 sm:px-3 py-1.5 sm:py-2 border-b border-slate-800 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono uppercase font-bold shrink-0">Atalhos:</span>
        {quickCommands.map((q, idx) => (
          <button
            key={idx}
            disabled={isProcessing}
            onClick={() => onSendCommand(q.cmd)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#202c33] hover:bg-[#2a3942] active:scale-95 text-slate-200 text-[11px] sm:text-xs font-mono whitespace-nowrap border border-slate-700/60 transition cursor-pointer hover:border-amber-500/50 disabled:opacity-50 touch-manipulation"
          >
            <span>{q.icon}</span>
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area with WhatsApp Background Pattern */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 relative bg-[#0b141a]/95 overscroll-contain">
        {/* Subtle WhatsApp doodles overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#25d366_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {messages.map((msg) => {
          const isUser = msg.remetente === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} relative z-10 animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[94%] sm:max-w-[78%] rounded-2xl p-2.5 sm:p-3.5 shadow-md relative ${
                  isUser
                    ? 'bg-[#005c4b] text-slate-100 rounded-tr-none'
                    : 'bg-[#202c33] text-slate-200 rounded-tl-none border border-slate-700/40'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-cyan-400 mb-1 border-b border-slate-700/50 pb-0.5">
                    <span className="font-bold flex items-center gap-1">
                      <span>🤖 {botName}</span>
                    </span>
                    <span className="text-[9px] text-slate-400">Oficial</span>
                  </div>
                )}

                {/* Message body with fixed whitespace */}
                <div className="text-[11px] sm:text-[13px] font-mono leading-relaxed whitespace-pre-wrap select-text break-words overflow-x-auto">
                  {msg.texto}
                </div>

                {/* WhatsApp Timestamp & Blue Double Checkmarks */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] sm:text-[10px] text-slate-400 font-mono">
                  <span>{msg.timestamp}</span>
                  {isUser && (
                    <span className="text-[#53bdeb] text-[11px] sm:text-[12px] font-bold tracking-tighter" title="Lida">
                      ✓✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {isProcessing && (
          <div className="flex flex-col items-start relative z-10 animate-in fade-in duration-200">
            <div className="bg-[#202c33] text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-slate-700/40 flex items-center gap-2.5">
              <span className="text-xs font-mono text-emerald-400 font-medium">
                {botName} está calculando
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSubmit} className="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-slate-700/60 z-10">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            disabled={isProcessing}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isProcessing ? 'Aguarde o bot processar...' : 'Digite um comando (ex: #mine, #duelorpg @ALEXBOT, #dungeon, #menu)...'}
            className="w-full bg-[#2a3942] text-slate-100 placeholder-slate-400 text-base sm:text-sm rounded-xl py-2.5 pl-4 pr-10 outline-none font-mono focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow cursor-pointer ${
            inputText.trim() && !isProcessing
              ? 'bg-[#00a884] hover:bg-[#029070] text-slate-950 shadow-emerald-950/40'
              : 'bg-slate-700 text-slate-400 opacity-40 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};

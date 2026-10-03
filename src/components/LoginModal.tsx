import React, { useState } from 'react';
import { signInWithPopup, User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { saveUserAccount } from '../firebase/firestoreService';
import { Shield, Sparkles, LogIn, CheckCircle2, Lock, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await saveUserAccount(user);
      onLoginSuccess(user);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMsg(err.message || 'Falha ao autenticar com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#111b21] via-[#0b141a] to-slate-950 border border-emerald-500/40 rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl text-center relative">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-600 p-0.5 shadow-xl flex items-center justify-center text-3xl">
          🤖
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            AUTENTICAÇÃO & CLOUD SAVES
          </span>
          <h2 className="font-serif text-2xl font-black text-slate-100 tracking-wide">
            Sheldor RPG
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Faça login com sua conta Google para salvar seu personagem em nuvem no Firebase, sincronizar Duelos PvP, Clãs e Dungeons em tempo real.
          </p>
        </div>

        {/* Benefits list */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 text-left space-y-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Perfil persistido 100% no Firestore</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Duelos PvP e moedas sincronizados</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Proteção anti-abuso e saves em tempo real</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 font-mono">
            {errorMsg}
          </div>
        )}

        {/* Login Button */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-xl transition cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com Conta Google</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition cursor-pointer"
            >
              Continuar no Modo Convidado (Local)
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-500 font-mono">
          Autenticação direta e segura via Firebase Google Auth
        </p>
      </div>
    </div>
  );
};

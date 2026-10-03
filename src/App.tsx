import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, testFirestoreConnection } from './firebase/config';
import {
  savePlayerProfile,
  saveClanRecord,
  saveDungeonParty,
  deleteDungeonParty,
  subscribeProfiles,
  subscribeClans,
  saveUserAccount
} from './firebase/firestoreService';
import { WhatsAppChat } from './components/WhatsAppChat';
import { ProfilesPvPView } from './components/ProfilesPvPView';
import { DungeonsView } from './components/DungeonsView';
import { ArenaView } from './components/ArenaView';
import { MiningWorkView } from './components/MiningWorkView';
import { ShopEquipView } from './components/ShopEquipView';
import { PetsView } from './components/PetsView';
import { CasinoRouletteView } from './components/CasinoRouletteView';
import { QuestsDailyView } from './components/QuestsDailyView';
import { ClansView } from './components/ClansView';
import { LoginModal } from './components/LoginModal';
import { INITIAL_CLANS, INITIAL_PROFILES } from './engine/gameData';
import { processRpgCommand, regenerarEnergia } from './engine/rpgEngine';
import { BotChatMessage, ClanData, DungeonParty, EquipSlot, PlayerProfile } from './types/rpgBot';
import {
  playDiceRollSound,
  playSwordSlashSound,
  playHitDamageSound,
  playSuccessSound,
  playLevelUpSound,
  playHealSound,
  playCriticalFumbleSound,
  setSoundEnabled
} from './utils/audio';
import {
  MessageSquare,
  Users,
  Castle,
  Trophy,
  Pickaxe,
  Shield,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Zap,
  LogIn,
  LogOut,
  CheckCircle2,
  Cloud
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'chat' | 'perfis' | 'dungeons' | 'arena' | 'minas' | 'loja' | 'pets' | 'roleta' | 'diario' | 'clans'
  >('chat');

  const [profiles, setProfiles] = useState<PlayerProfile[]>(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>(INITIAL_PROFILES[0].id);
  const [activeParty, setActiveParty] = useState<DungeonParty | null>(null);
  const [clans, setClans] = useState<ClanData[]>(INITIAL_CLANS);
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // WhatsApp Messages
  const [messages, setMessages] = useState<BotChatMessage[]>([
    {
      id: 'msg-init-1',
      remetente: 'bot',
      texto: `⚔️ Bem-vindo ao Sheldor RPG v2.0!
Conectado ao Firebase Cloud Firestore com autenticação Google.
Digite #menu para listar os comandos ou clique nos atalhos rápidos!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      comandoOrigem: '#menu'
    }
  ]);

  // Test Firestore on boot and listen to Auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthChecked(true);

      if (user) {
        await saveUserAccount(user);
      } else {
        setIsLoginModalOpen(true);
      }
    });

    return () => unsubAuth();
  }, []);

  // Realtime Sync with Firestore for Profiles & Clans
  useEffect(() => {
    if (!authChecked) return;

    const unsubProfiles = subscribeProfiles((remoteProfiles) => {
      if (remoteProfiles.length > 0) {
        setProfiles(remoteProfiles);
        // If current activeProfile not in remote, select user's profile or first
        setActiveProfileId((prev) => {
          const exists = remoteProfiles.find((p) => p.id === prev);
          if (exists) return prev;
          if (currentUser) {
            const myProfile = remoteProfiles.find((p) => p.donoId === currentUser.uid);
            if (myProfile) return myProfile.id;
          }
          return remoteProfiles[0].id;
        });
      }
    }, currentUser);

    const unsubClans = subscribeClans((remoteClans) => {
      if (remoteClans.length > 0) {
        setClans(remoteClans);
      }
    });

    return () => {
      unsubProfiles();
      unsubClans();
    };
  }, [currentUser, authChecked]);

  // Lazy energy regen tick
  useEffect(() => {
    const timer = setInterval(() => {
      setProfiles((prev) =>
        prev.map((p) => {
          const clone = { ...p };
          regenerarEnergia(clone);
          return clone;
        })
      );
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCommand, setProcessingCommand] = useState<string | null>(null);

  // Core Command Dispatcher with realistic simulated processing
  const handleExecuteCommand = async (commandString: string) => {
    if (isProcessing) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Audio cue
    if (/mine|minerar/i.test(commandString)) {
      playDiceRollSound();
    } else if (/duelo|arena|atacar/i.test(commandString)) {
      playSwordSlashSound();
    }

    // Immediately post user message
    const userMsg: BotChatMessage = {
      id: `usr-${Date.now()}`,
      remetente: 'user',
      texto: commandString,
      timestamp: timeNow,
      comandoOrigem: commandString
    };
    setMessages((prev) => [...prev, userMsg]);

    // Set processing state
    setIsProcessing(true);
    setProcessingCommand(commandString);

    // Natural simulated processing delay (650ms)
    await new Promise((resolve) => setTimeout(resolve, 650));

    const result = processRpgCommand(
      commandString,
      profiles,
      activeProfileId,
      activeParty,
      clans,
      currentUser?.uid
    );

    // Audio feedback
    if (result.soundType === 'success') playSuccessSound();
    else if (result.soundType === 'hit') playHitDamageSound();
    else if (result.soundType === 'fumble') playCriticalFumbleSound();
    else if (result.soundType === 'levelup') playLevelUpSound();
    else if (result.soundType === 'heal') playHealSound();
    else if (result.soundType === 'dice') playDiceRollSound();

    const botMsg: BotChatMessage = {
      id: `bot-${Date.now() + 1}`,
      remetente: 'bot',
      texto: result.messageText,
      timestamp: timeNow,
      comandoOrigem: commandString
    };

    setMessages((prev) => [...prev, botMsg]);
    setProfiles(result.updatedProfiles);
    setActiveProfileId(result.activeProfileId);
    setActiveParty(result.activeParty);
    if (result.updatedClans) setClans(result.updatedClans);

    setIsProcessing(false);
    setProcessingCommand(null);

    // Persist to Cloud Firestore if logged in!
    if (currentUser) {
      for (const p of result.updatedProfiles) {
        savePlayerProfile(p).catch((e) => console.warn('Cloud save warning:', e));
      }
      if (result.updatedClans) {
        for (const c of result.updatedClans) {
          saveClanRecord(c).catch((e) => console.warn('Clan save warning:', e));
        }
      }
      if (result.activeParty) {
        saveDungeonParty(result.activeParty).catch((e) => console.warn('Party save warning:', e));
      } else if (activeParty && !result.activeParty) {
        deleteDungeonParty(activeParty.id).catch((e) => console.warn('Party delete warning:', e));
      }
    }
  };

  const handleToggleSound = () => {
    const n = !soundActive;
    setSoundEnabled(n);
    setSoundActive(n);
    if (n) playSuccessSound();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsLoginModalOpen(true);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const energiaPercent = activeProfile
    ? Math.max(0, Math.min(100, Math.round((activeProfile.energia / activeProfile.energiaMax) * 100)))
    : 100;

  return (
    <div className="min-h-screen bg-[#090e11] text-slate-100 flex flex-col font-sans selection:bg-[#00a884]/30 selection:text-emerald-200">
      {/* Unified Sticky Top Header & Tabs */}
      <header className="sticky top-0 z-40 bg-[#111b21] border-b border-slate-800 shadow-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          {/* Top Row: Brand & Google User / Sound */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 p-0.5 shadow-md flex items-center justify-center text-lg sm:text-xl shrink-0">
                🤖
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-sm sm:text-lg text-slate-100 font-mono tracking-tight truncate">
                    Sheldor RPG
                  </h1>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono flex items-center gap-1 shrink-0">
                    <Cloud className="w-2.5 h-2.5" />
                    <span>Cloud</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate hidden sm:block">
                  Saves em Nuvem, PvP Real, Dungeons & Economia 100% Sincronizados
                </p>
              </div>
            </div>

            {/* Mobile Header Quick Actions */}
            <div className="flex items-center gap-1.5 sm:hidden shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-1.5 bg-[#202c33] px-2 py-1 rounded-xl border border-slate-700 text-xs">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-4 h-4 rounded-full" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] text-white">G</div>
                  )}
                  <button onClick={handleLogout} title="Sair" className="text-slate-400 hover:text-rose-400 p-0.5">
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-slate-900 font-bold text-[11px] shadow cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Login</span>
                </button>
              )}
              <button
                onClick={handleToggleSound}
                className="p-1.5 rounded-xl bg-[#202c33] text-slate-300 border border-slate-700 cursor-pointer active:scale-95"
              >
                {soundActive ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Player Stats & Energy Bar Row */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Live Energy Widget */}
            {activeProfile && (
              <div className="bg-[#202c33] px-2.5 py-1 sm:py-1.5 rounded-xl border border-slate-700 flex flex-col flex-1 sm:flex-initial sm:min-w-[125px]">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono mb-0.5 sm:mb-1">
                  <span className="flex items-center gap-1 text-cyan-300 font-bold">
                    <Zap className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                    Energia
                  </span>
                  <span className="text-slate-300">
                    {activeProfile.energia}/{activeProfile.energiaMax}
                  </span>
                </div>
                <div className="w-full h-1 sm:h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${energiaPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Profile badge */}
            {activeProfile && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-[#202c33] px-2.5 py-1 sm:py-1.5 rounded-xl border border-slate-700 text-[11px] sm:text-xs font-mono shrink-0">
                <span>{activeProfile.avatar}</span>
                <span className="font-bold text-amber-300 truncate max-w-[70px] sm:max-w-[85px]">
                  @{activeProfile.nome}
                </span>
                <span className="text-slate-400 text-[10px] sm:text-xs">Nv.{activeProfile.nivel}</span>
                <span className="text-emerald-400 font-bold">💰 {activeProfile.moedas}</span>
              </div>
            )}

            {/* Desktop User Info & Sound */}
            <div className="hidden sm:flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-[#202c33] px-2.5 py-1.5 rounded-xl border border-slate-700">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white">G</div>
                  )}
                  <span className="text-xs font-mono text-slate-200 truncate max-w-[90px]">
                    {currentUser.displayName?.split(' ')[0] || 'Jogador'}
                  </span>
                  <button onClick={handleLogout} title="Desconectar do Google" className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login Google</span>
                </button>
              )}

              <button
                onClick={handleToggleSound}
                title={soundActive ? 'Desativar Sons' : 'Ativar Sons'}
                className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-slate-300 hover:text-amber-300 border border-slate-700 transition cursor-pointer"
              >
                {soundActive ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar inside sticky container */}
        <div className="bg-[#0b141a]/95 backdrop-blur border-t border-slate-800/80 px-2 sm:px-4 py-1.5 sm:py-2">
          <div className="max-w-6xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x">
            {[
              { id: 'chat', label: '💬 Chat' },
              { id: 'perfis', label: '👥 Duelos' },
              { id: 'dungeons', label: '🏰 Dungeons' },
              { id: 'arena', label: '🏟️ Arena' },
              { id: 'minas', label: '⛏️ Minas' },
              { id: 'loja', label: '🛡️ Armaria' },
              { id: 'pets', label: '🐾 Pets' },
              { id: 'roleta', label: '🎰 Roleta' },
              { id: 'diario', label: '📋 Quests' },
              { id: 'clans', label: '🛡️ Clãs' },
            ].map((tab) => {
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                    isCurrent
                      ? 'bg-[#00a884] text-slate-950 font-bold shadow-md'
                      : 'bg-[#111b21] hover:bg-[#202c33] text-slate-300 hover:text-slate-100 border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-3 sm:p-4 pb-20 sm:pb-8">
        {activeTab === 'chat' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sincronizado na Nuvem Firestore
              </span>
              <button
                onClick={() => handleExecuteCommand('#menu')}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                Ver #menu de comandos
              </button>
            </div>
            <WhatsAppChat
              messages={messages}
              onSendCommand={handleExecuteCommand}
              activeProfile={activeProfile}
              botName="SHELDORBOT"
              isProcessing={isProcessing}
            />
          </div>
        )}

        {activeTab === 'perfis' && (
          <ProfilesPvPView
            profiles={profiles}
            activeProfileId={activeProfileId}
            onDuelProfile={(targetName) => {
              handleExecuteCommand(`#duelorpg @${targetName}`);
              setActiveTab('chat');
            }}
            onSwitchProfile={(pId) => {
              const matched = profiles.find((p) => p.id === pId);
              if (matched) {
                handleExecuteCommand(`#trocarperfil ${matched.nome}`);
              }
            }}
            onCreateProfile={(name) => {
              handleExecuteCommand(`#criarperfil ${name}`);
            }}
          />
        )}

        {activeTab === 'dungeons' && (
          <DungeonsView
            activeProfile={activeProfile}
            activeParty={activeParty}
            profiles={profiles}
            onCreateParty={(tipo) => {
              handleExecuteCommand(`#dungeon criar ${tipo}`);
              setActiveTab('chat');
            }}
            onJoinParty={(partyId) => {
              handleExecuteCommand(`#dungeon entrar ${partyId}`);
              setActiveTab('chat');
            }}
            onStartDungeon={() => {
              handleExecuteCommand('#dungeon iniciar');
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'arena' && (
          <ArenaView
            activeProfile={activeProfile}
            onEnterArena={(tierId) => {
              handleExecuteCommand(`#arena ${tierId}`);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'minas' && (
          <MiningWorkView
            activeProfile={activeProfile}
            onMine={() => {
              handleExecuteCommand('#mine');
            }}
            onWork={() => {
              handleExecuteCommand('#trabalhar');
            }}
            onRepairPickaxe={() => {
              handleExecuteCommand('#consertar picareta');
            }}
          />
        )}

        {activeTab === 'loja' && (
          <ShopEquipView
            activeProfile={activeProfile}
            onEquipItem={(itemId) => {
              handleExecuteCommand(`#equipar ${itemId}`);
            }}
            onUnequipSlot={(slot: EquipSlot) => {
              handleExecuteCommand(`#desequipar ${slot}`);
            }}
            onBuyItem={(itemId) => {
              handleExecuteCommand(`#comprar ${itemId}`);
            }}
            onEnchantSlot={(slot: EquipSlot) => {
              handleExecuteCommand(`#encantar ${slot}`);
            }}
          />
        )}

        {activeTab === 'pets' && (
          <PetsView
            activeProfile={activeProfile}
            onAdoptPet={(tipo) => {
              handleExecuteCommand(`#pet comprar ${tipo}`);
            }}
            onFeedPet={() => {
              handleExecuteCommand('#pet alimentar');
            }}
            onTrainPet={() => {
              handleExecuteCommand('#pet treinar');
            }}
          />
        )}

        {activeTab === 'roleta' && (
          <CasinoRouletteView
            activeProfile={activeProfile}
            onSpin={(valor, aposta) => {
              handleExecuteCommand(`#roleta ${valor} ${aposta}`);
            }}
          />
        )}

        {activeTab === 'diario' && (
          <QuestsDailyView
            activeProfile={activeProfile}
            onClaimDaily={() => {
              handleExecuteCommand('#diario');
            }}
            onUsePotion={(tipo) => {
              handleExecuteCommand(`#usar ${tipo}`);
            }}
          />
        )}

        {activeTab === 'clans' && (
          <ClansView
            activeProfile={activeProfile}
            clans={clans}
            profiles={profiles}
            onCreateClan={(nome) => {
              handleExecuteCommand(`#cla criar ${nome}`);
            }}
            onDonateClan={(valor) => {
              handleExecuteCommand(`#cla doar ${valor}`);
            }}
          />
        )}
      </main>

      {/* Floating Processing Status Chip */}
      {isProcessing && (
        <div className="fixed bottom-20 sm:bottom-5 right-4 sm:right-5 z-50 bg-[#202c33]/95 backdrop-blur-md border border-emerald-500/60 text-emerald-300 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom duration-200">
          <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span>
            SHELDORBOT calculando <strong>{processingCommand || 'ação'}</strong>...
          </span>
        </div>
      )}

      {/* Mobile Bottom Quick Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111b21]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {[
          { id: 'chat', label: 'Chat', icon: '💬' },
          { id: 'perfis', label: 'Duelos', icon: '👥' },
          { id: 'minas', label: 'Minas', icon: '⛏️' },
          { id: 'arena', label: 'Arena', icon: '🏟️' },
          { id: 'loja', label: 'Loja', icon: '🛡️' },
          { id: 'dungeons', label: 'Dungeon', icon: '🏰' },
        ].map((tab) => {
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition touch-manipulation cursor-pointer ${
                isCurrent
                  ? 'text-[#00a884] font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px] font-mono mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Google Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
        }}
      />
    </div>
  );
}

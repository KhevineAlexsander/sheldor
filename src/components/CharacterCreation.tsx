import React, { useState } from 'react';
import { UNIVERSES, PRESET_HEROES, PresetHero, calculateInitialCharacter } from '../data/presets';
import { Attributes, Character, UniversePreset } from '../types/game';
import { Sparkles, Shield, User, ArrowRight, Check, Plus, Minus, Info, Flame, Award } from 'lucide-react';
import { playSuccessSound, playLevelUpSound } from '../utils/audio';

interface CharacterCreationProps {
  onCharacterCreated: (character: Character, universe: UniversePreset) => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreated }) => {
  const [selectedUniverse, setSelectedUniverse] = useState<UniversePreset>(UNIVERSES[0]);
  const [customUniverseName, setCustomUniverseName] = useState('');
  const [activeTab, setActiveTab] = useState<'custom' | 'preset'>('custom');

  // Character inputs
  const [nome, setNome] = useState('Rin');
  const [classe, setClasse] = useState('Artista Marcial');
  const [atributos, setAtributos] = useState<Attributes>({
    forca: 4,
    agilidade: 5,
    vitalidade: 4,
    inteligencia: 3,
    percepcao: 4
  });

  // Calculate points spent
  const totalPontosGastos =
    atributos.forca +
    atributos.agilidade +
    atributos.vitalidade +
    atributos.inteligencia +
    atributos.percepcao;

  const pontosRestantes = 20 - totalPontosGastos;

  const handleStatChange = (stat: keyof Attributes, delta: number) => {
    const atual = atributos[stat];
    const novo = atual + delta;
    if (novo < 1) return; // Minimo 1
    if (delta > 0 && pontosRestantes <= 0) return; // Não pode gastar mais de 20
    setAtributos((prev) => ({
      ...prev,
      [stat]: novo
    }));
  };

  const handleSelectPresetHero = (hero: PresetHero) => {
    setNome(hero.nome);
    setClasse(hero.classe);
    setAtributos({ ...hero.atributos });
    playSuccessSound();
  };

  const handleStartGame = () => {
    if (!nome.trim() || !classe.trim()) return;

    let universeFinal = selectedUniverse;
    if (selectedUniverse.id === 'personalizado' && customUniverseName.trim()) {
      universeFinal = {
        ...selectedUniverse,
        titulo: customUniverseName.trim(),
        subtitulo: 'Universo Customizado pelo Jogador'
      };
    }

    const char = calculateInitialCharacter(
      nome,
      classe,
      universeFinal.titulo,
      atributos,
      classe.toLowerCase().includes('mago') ? '🔮' : classe.toLowerCase().includes('tiro') ? '🎯' : '⚔️'
    );

    playLevelUpSound();
    onCharacterCreated(char, universeFinal);
  };

  // Filter preset heroes matching the selected universe (or all if not matched)
  const heroesForUniverse = PRESET_HEROES.filter((h) => h.universoId === selectedUniverse.id);
  const displayPresets = heroesForUniverse.length > 0 ? heroesForUniverse : PRESET_HEROES.slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Intro Banner */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Iniciação do Jogo & Criação de Personagem
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-100 tracking-wide">
          Escolha seu Universo & Forje sua Lenda
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Defina o cenário da sua jornada e distribua seus 20 pontos de atributos base entre Força, Agilidade, Vitalidade, Inteligência e Percepção.
        </p>
      </div>

      {/* Step 1: Universe Selection */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs">1</span>
          Selecione o Universo do Jogo
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {UNIVERSES.map((u) => {
            const isSelected = selectedUniverse.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setSelectedUniverse(u);
                  // Update suggested class if available
                  if (u.classesSugeridas && u.classesSugeridas[0]) {
                    setClasse(u.classesSugeridas[0]);
                  }
                }}
                className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 shadow-xl shadow-amber-900/20 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-2xl">{u.icone}</span>
                    {isSelected && (
                      <span className="bg-amber-500 text-slate-950 p-1 rounded-full text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-sm text-slate-100 leading-tight">
                    {u.titulo}
                  </h3>
                  <p className="text-[11px] text-amber-400/90 font-medium mt-0.5 line-clamp-1">
                    {u.subtitulo}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {u.descricao}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Character Creation Mode Toggle */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs">2</span>
            Definições do Personagem
          </label>

          {/* Preset vs Custom tabs */}
          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === 'custom'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Criar do Zero (20 pts)
            </button>
            <button
              onClick={() => setActiveTab('preset')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === 'preset'
                  ? 'bg-purple-600 text-slate-100 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Heróis Prontos ({displayPresets.length})
            </button>
          </div>
        </div>

        {/* Preset Heroes Selection Drawer */}
        {activeTab === 'preset' && (
          <div className="space-y-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wide">
                Lutadores & Fichas Prontas
              </span>
              <span className="text-[11px] text-slate-400">
                Clique para carregar automaticamente a ficha
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayPresets.map((hero, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPresetHero(hero)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    nome === hero.nome
                      ? 'bg-purple-900/40 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-purple-600/50 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {hero.avatarIcon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-100 truncate font-serif">
                          {hero.nome}
                        </h4>
                        <span className="text-[10px] text-purple-300 font-mono font-bold">
                          {hero.classe}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {hero.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span>FOR: {hero.atributos.forca}</span>
                    <span>AGI: {hero.atributos.agilidade}</span>
                    <span>VIT: {hero.atributos.vitalidade}</span>
                    <span>INT: {hero.atributos.inteligencia}</span>
                    <span>PER: {hero.atributos.percepcao}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Character Form */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nome do Personagem:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Rin Asakusa, Valerius, Kael..."
                  className="w-full bg-slate-950 text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 outline-none transition"
                />
              </div>
            </div>

            {/* Classe / Especialização */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Classe / Especialização:
              </label>
              <input
                type="text"
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
                placeholder="Ex: Artista Marcial, Mago Arcano, Netrunner..."
                className="w-full bg-slate-950 text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-400 outline-none transition"
              />
            </div>
          </div>

          {/* Suggested class pills */}
          {selectedUniverse.classesSugeridas && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-mono mr-1">Sugestões:</span>
              {selectedUniverse.classesSugeridas.map((cls, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setClasse(cls)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    classe === cls
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          )}

          {/* 20 Points Attribute Distribution */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Distribuição de Atributos Iniciais (20 Pontos Base)
                </h4>
                <p className="text-xs text-slate-400">
                  Cada ponto determina seu bônus de teste e capacidade em combate.
                </p>
              </div>

              <div
                className={`px-3 py-1 rounded-xl font-mono text-xs font-bold border flex items-center gap-1.5 ${
                  pontosRestantes === 0
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : pontosRestantes > 0
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                <span>Pontos Restantes:</span>
                <span className="text-sm font-black">{pontosRestantes}</span>
                {pontosRestantes === 0 && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Stat rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { key: 'forca', label: 'Força (FOR)', desc: 'Dano físico & socos', color: 'text-red-400' },
                { key: 'agilidade', label: 'Agilidade (AGI)', desc: 'Iniciativa & esquiva', color: 'text-emerald-400' },
                { key: 'vitalidade', label: 'Vitalidade (VIT)', desc: 'Vida (HP) & resistência', color: 'text-amber-400' },
                { key: 'inteligencia', label: 'Inteligência (INT)', desc: 'Mana & poderes', color: 'text-cyan-400' },
                { key: 'percepcao', label: 'Percepção (PER)', desc: 'Enigmas & mira', color: 'text-purple-400' },
              ].map(({ key, label, desc, color }) => {
                const statKey = key as keyof Attributes;
                const valor = atributos[statKey];
                return (
                  <div key={key} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold font-mono ${color}`}>{label}</span>
                        <span className="text-[10px] font-mono text-slate-500">+{valor} mod</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{desc}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => handleStatChange(statKey, -1)}
                        disabled={valor <= 1}
                        className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-base font-bold font-mono text-slate-100">
                        {valor}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleStatChange(statKey, 1)}
                        disabled={pontosRestantes <= 0}
                        className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 flex items-center justify-center text-amber-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculated stats preview */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Prévia de Recursos Iniciais:</span>
                <span className="font-mono text-rose-300 font-bold">
                  HP Inicial: {15 + atributos.vitalidade * 3}
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  Mana Inicial: {10 + atributos.inteligencia * 2 + atributos.agilidade}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 italic">
                + Modificadores de d20 equivalentes aos valores dos atributos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Adventure Button */}
      <div className="text-center pt-2">
        <button
          onClick={handleStartGame}
          disabled={!nome.trim() || !classe.trim() || pontosRestantes !== 0}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base tracking-wide shadow-xl shadow-amber-500/25 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Iniciar Crônica com o Game Master</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        {pontosRestantes !== 0 && (
          <p className="text-xs text-amber-400/80 font-mono mt-2">
            * Distribua exatamente os 20 pontos de atributos para começar ({pontosRestantes > 0 ? `faltam ${pontosRestantes}` : `ultrapassou ${Math.abs(pontosRestantes)}`}).
          </p>
        )}
      </div>
    </div>
  );
};

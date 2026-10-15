import React from 'react';
import { Play, HelpCircle, Sparkles, Award, Castle, ChevronRight, User, Compass } from 'lucide-react';
import { PicoChaseBackground } from './PicoChaseBackground';

interface HomeViewProps {
  onStartAdventure: () => void;
  onOpenHowToPlay: () => void;
  candidateName: string;
  onCandidateNameChange: (name: string) => void;
  completedQuestions: Set<number>;
  highScore: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartAdventure,
  onOpenHowToPlay,
  candidateName,
  onCandidateNameChange,
  completedQuestions,
  highScore,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 p-4 sm:p-6 md:p-8 font-sans select-none">
      {/* Continuous Moving Platform Game World Canvas (Multi-layer Parallax) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <PicoChaseBackground />
      </div>

      {/* Top Bar: Tagline & High Score */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 text-amber-300 text-xs font-black uppercase tracking-wider shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>Collect coins. Crack product challenges. Reach the castle. Get hired.</span>
        </div>

        {highScore > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 text-yellow-300 text-xs font-black shadow-md">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>BEST SCORE: {highScore} PTS</span>
          </div>
        )}
      </header>

      {/* Main Hero Center Content */}
      <main className="relative z-10 max-w-2xl mx-auto text-center my-auto py-4 sm:py-6">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-amber-400/80 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-widest shadow-xl mb-4 animate-bounce-subtle">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>The Ultimate Product Manager Platform Adventure</span>
        </div>

        {/* Playful, Bold, 3D Game Logo */}
        <div className="relative mb-3 group cursor-default">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white drop-shadow-[0_8px_0_rgba(15,23,42,0.95)] select-none">
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              PRODUCT
            </span>{' '}
            <span className="bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              ODYSSEY
            </span>
          </h1>
          {/* Subtle logo glowing underline */}
          <div className="h-1.5 w-48 sm:w-64 mx-auto mt-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
        </div>

        {/* Master Tagline */}
        <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-wide drop-shadow-sm mb-2 uppercase">
          JUMP. THINK. BUILD. BECOME A PM.
        </p>

        {/* Supporting Line */}
        <p className="text-xs sm:text-sm md:text-base text-slate-800 max-w-lg mx-auto font-bold leading-relaxed mb-6 bg-white/45 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-sm">
          Collect coins. Crack product challenges. Reach the castle. Get hired.
        </p>

        {/* Candidate Name Input */}
        <div className="max-w-sm mx-auto mb-6 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => onCandidateNameChange(e.target.value)}
            placeholder="Candidate Name for Job Offer..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none"
            maxLength={28}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-6">
          <button
            onClick={onStartAdventure}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>START ADVENTURE</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border-2 border-slate-700/80 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>

        {/* Guide Speech Bubble: Pico, the Product Explorer */}
        <div className="inline-flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-5 py-3 rounded-3xl border border-amber-400/60 shadow-xl text-left max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-2xl shrink-0 shadow-md">
            🧑‍💼
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            <strong className="text-amber-400 block font-bold">Pico, the Product Explorer:</strong>
            “Every golden coin hides a PM interview challenge. Jump across magical worlds, think strategically, and unlock your path to the castle!”
          </p>
        </div>
      </main>

      {/* Visual Journey Roadmap Indicator (10 Checkpoints) */}
      <footer className="relative z-10 bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-700/80 p-4 sm:p-5 shadow-2xl max-w-3xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-white">
            <span className="text-emerald-400">LEVEL 1: PRODUCT BASICS</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
            <span className="text-cyan-400">LEVEL 2: PRODUCT STRATEGY</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
            <span className="text-amber-400 flex items-center gap-1">
              <Castle className="w-3.5 h-3.5" /> CASTLE: JOB OFFER
            </span>
          </div>

          <span className="text-[11px] font-bold text-slate-400">
            {completedQuestions.size}/10 Challenges Cleared
          </span>
        </div>

        {/* 10 Golden Coin Icons */}
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
          {Array.from({ length: 10 }).map((_, idx) => {
            const qNum = idx + 1;
            const isDone = completedQuestions.has(qNum);
            return (
              <div
                key={qNum}
                title={`Checkpoint ${qNum}: ${isDone ? 'Completed' : 'Pending'}`}
                className={`py-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isDone
                    ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-950 font-black shadow-[0_0_10px_rgba(251,191,36,0.7)]'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 font-semibold'
                }`}
              >
                <span className="text-[9px] sm:text-[10px]">
                  {isDone ? '★' : `Q${qNum}`}
                </span>
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import { Volume2, VolumeX, Pause, Award, Coins } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HudProps {
  score: number;
  levelId: 1 | 2;
  levelName: string;
  totalCoins: number;
  completedQuestions: Set<number>;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  checkpoint: number;
}

export const Hud: React.FC<HudProps> = ({
  score,
  levelId,
  levelName,
  totalCoins,
  completedQuestions,
  isMuted,
  onToggleMute,
  onPause,
  checkpoint,
}) => {
  // Current level's 5 questions
  const levelQuestions = levelId === 1 ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10];
  const levelClearedCount = levelQuestions.filter(id => completedQuestions.has(id)).length;
  const totalClearedCount = completedQuestions.size;

  return (
    <header className="absolute top-0 left-0 right-0 p-3 md:p-4 flex flex-wrap items-center justify-between pointer-events-none select-none z-30 font-sans">
      {/* Left: Level Info & Checkpoint */}
      <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/60 shadow-lg pointer-events-auto">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-900 font-extrabold shadow-sm">
          {levelId}
        </div>
        <div>
          <h2 className="text-xs md:text-sm font-black tracking-wide text-white uppercase flex items-center gap-1.5">
            {levelName}
          </h2>
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-amber-300 font-medium">
            <span>Checkpoint {checkpoint > 0 ? `#${checkpoint}` : 'Start'}</span>
            <span>•</span>
            <span>Cleared {levelClearedCount}/5 Questions</span>
          </div>
        </div>
      </div>

      {/* Center: Coin Indicators for current level */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/60 shadow-lg pointer-events-auto">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mr-1">
          PM Coins:
        </span>
        <div className="flex items-center gap-2">
          {levelQuestions.map((qId) => {
            const isDone = completedQuestions.has(qId);
            return (
              <div
                key={qId}
                title={`Question ${qId}: ${isDone ? 'Cleared' : 'Pending'}`}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                  isDone
                    ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110'
                    : 'bg-slate-800 text-slate-400 border border-slate-600'
                }`}
              >
                {isDone ? '✓' : `Q${qId}`}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Score, Total Cleared & Controls */}
      <div className="flex items-center gap-2 md:gap-3 pointer-events-auto mt-2 sm:mt-0">
        {/* Score & Coins Badge */}
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/60 shadow-lg text-white">
          <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs md:text-sm">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce-subtle" />
            <span>{totalCoins}</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-yellow-300 font-black text-xs md:text-sm">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>{score} PTS</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-700 hidden xs:block" />
          <div className="hidden xs:block text-[11px] font-bold text-emerald-400">
            {totalClearedCount}/10 Done
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          className="w-9 h-9 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 flex items-center justify-center shadow-md transition-all active:scale-95"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Pause Button */}
        <button
          onClick={onPause}
          aria-label="Pause game"
          className="w-9 h-9 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 flex items-center justify-center shadow-md transition-all active:scale-95"
        >
          <Pause className="w-4 h-4 text-sky-400" />
        </button>
      </div>
    </header>
  );
};

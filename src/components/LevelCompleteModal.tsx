import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';

interface LevelCompleteModalProps {
  score: number;
  onEnterLevel2: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  score,
  onEnterLevel2,
}) => {
  useEffect(() => {
    // Fire festive victory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#fbbf24', '#38bdf8', '#ec4899'],
      });
    } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(34,197,94,0.4)]">
        {/* Glowing Trophy Icon */}
        <div className="w-20 h-20 mx-auto -mt-14 mb-4 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-emerald-400 p-1 shadow-xl flex items-center justify-center animate-bounce-subtle">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-300" />
          </div>
        </div>

        {/* Level Complete Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>5 of 5 Fundamentals Cleared</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 text-glow-gold">
          LEVEL 1 COMPLETE!
        </h2>
        <p className="text-sm font-semibold text-amber-300 mb-6">
          THE PRODUCT APPRENTICE
        </p>

        {/* Score & Achievements Box */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 mb-6 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>Product Fundamentals Validated:</span>
            <span className="font-bold text-emerald-400">5 / 5 Correct</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>Level 1 Completion Bonus:</span>
            <span className="font-bold text-yellow-400">+200 PTS</span>
          </div>
          <div className="border-t border-slate-700/80 pt-2 flex justify-between items-center text-sm font-black text-white">
            <span>Current Total Score:</span>
            <span className="text-amber-400 text-base">{score} PTS</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Pico has proved mastery in user empathy, MVP scoping, customer discovery, and prioritization. The gates to the futuristic strategy mountains are now open!
        </p>

        {/* Enter Level 2 Action Button */}
        <button
          onClick={onEnterLevel2}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2.5 transition-all transform active:scale-95"
        >
          <span>ENTER LEVEL 2: THE PRODUCT CHAMPION</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

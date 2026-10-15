import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, CheckCircle2, RotateCcw, Home, FileText, Sparkles, Star, Download, Printer } from 'lucide-react';
import { QUESTIONS } from '../data/questions';

interface CastleVictoryScreenProps {
  score: number;
  totalCoins: number;
  candidateName: string;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const CastleVictoryScreen: React.FC<CastleVictoryScreenProps> = ({
  score,
  totalCoins,
  candidateName,
  onPlayAgain,
  onReturnHome,
}) => {
  const [activeTab, setActiveTab] = useState<'offer' | 'report'>('offer');

  useEffect(() => {
    // Grand celebratory fireworks confetti
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbbf24', '#38bdf8', '#ec4899', '#22c55e', '#a855f7'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#38bdf8', '#ec4899', '#22c55e', '#a855f7'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const displayName = candidateName.trim() || 'Pico the Product Prodigy';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 p-4 sm:p-6 flex flex-col items-center justify-start min-h-screen">
      {/* Background Ambience / Lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-3xl my-auto animate-in zoom-in-95 duration-500">
        {/* Recruiter & Pico Welcome Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-400/20 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-widest shadow-md mb-3">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>Castle Throne Room & APM Coronation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 text-glow-gold">
            CONGRATULATIONS!
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-emerald-400 mb-3">
            YOU ARE NOW A PRODUCT MANAGER!
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto italic font-medium">
            “Your ability to think about users, prioritize features, and make product decisions has earned you a place on the team.”
          </p>
        </div>

        {/* Quick Tabs: Offer Letter vs PM Report */}
        <div className="flex justify-center gap-3 mb-5">
          <button
            onClick={() => setActiveTab('offer')}
            className={`px-5 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'offer'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-105'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>OFFICIAL PM JOB OFFER</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-5 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'report'
                ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.5)] scale-105'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>INTERVIEW PERFORMANCE REPORT</span>
          </button>
        </div>

        {/* TAB 1: THE FORMAL / PLAYFUL JOB OFFER LETTER */}
        {activeTab === 'offer' && (
          <div className="relative bg-gradient-to-b from-amber-50 to-orange-50 text-slate-900 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(251,191,36,0.35)] border-4 border-amber-300">
            {/* Watermark / Seal */}
            <div className="absolute right-6 top-6 sm:right-10 sm:top-10 w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-dashed border-amber-500/40 flex flex-col items-center justify-center rotate-12 pointer-events-none select-none">
              <span className="text-[9px] sm:text-[11px] font-black uppercase text-amber-700 tracking-widest text-center">
                OFFICIAL
                <br />
                APM OFFER
              </span>
              <Star className="w-4 h-4 text-amber-600 fill-amber-500 my-0.5" />
              <span className="text-[8px] font-bold text-amber-800">PRODUCT ODYSSEY</span>
            </div>

            {/* Letterhead */}
            <div className="border-b-2 border-amber-200/80 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md">
                  🚀
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    HORIZON PRODUCT LABS & CASTLE STUDIOS
                  </h3>
                  <p className="text-xs font-semibold text-amber-800 tracking-wide">
                    OFFICE OF THE CHIEF PRODUCT OFFICER • UNICORN TOWER
                  </p>
                </div>
              </div>
            </div>

            {/* Offer Body */}
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 font-sans">
              <p>
                <strong>Date:</strong> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p>
                <strong>To:</strong> <span className="text-amber-900 font-bold underline decoration-amber-400 decoration-2">{displayName}</span>
              </p>
              <p>
                Dear <strong>{displayName}</strong>,
              </p>
              <p>
                Following your outstanding demonstration across all 10 rigorous Product Management checkpoints in <strong>The Product Apprentice</strong> and <strong>The Product Champion</strong> arenas, we are overjoyed to officially extend this offer for the position of:
              </p>

              <div className="bg-amber-100/80 border-2 border-amber-300 rounded-2xl p-4 text-center my-3">
                <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest block">
                  POSITION OFFERED
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                  Associate Product Manager (APM)
                </h4>
                <p className="text-xs text-amber-900 font-semibold mt-1">
                  Core Responsibilities: User Problem Discovery, MVP Delivery, Roadmap Strategy, and Team Alignment
                </p>
              </div>

              {/* Offer Package Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Empathy Bonus</span>
                  <span className="text-sm font-black text-emerald-600">Infinite User Love</span>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Compensation</span>
                  <span className="text-sm font-black text-amber-700">{score} Product Odyssey Points</span>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Questions Cleared</span>
                  <span className="text-sm font-black text-blue-600">10 of 10 (100%)</span>
                </div>
              </div>

              <p>
                We were particularly impressed by your clarity on North Star metrics, customer problem validation, and balancing impact against effort. Your instincts represent the gold standard of product leadership.
              </p>

              {/* Signatures */}
              <div className="pt-4 border-t border-amber-200/80 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="font-serif italic text-lg sm:text-xl text-amber-900 mb-1">
                    Alex Mercer, VP of Product
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">
                    Chief Product Recruiter, Horizon Labs
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 italic">
                    Accepted with Empathy & Focus:
                  </div>
                  <div className="text-sm font-black text-slate-900 underline decoration-amber-400">
                    {displayName}
                  </div>
                </div>
              </div>

              {/* Fictional Disclaimer */}
              <div className="mt-4 pt-3 border-t border-amber-200/60 text-center">
                <p className="text-[10px] text-amber-800/80 italic font-medium">
                  * Notice: This is an in-game celebratory achievement certificate for the PRODUCT ODYSSEY educational simulation game.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERVIEW PERFORMANCE REPORT */}
        {activeTab === 'report' && (
          <div className="bg-slate-900 border-2 border-cyan-400/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(56,189,248,0.3)]">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>CANDIDATE SCORECARD & MASTERY</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Candidate: <strong className="text-white">{displayName}</strong> • Status: <span className="text-emerald-400 font-bold">HIRED (10/10)</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">FINAL SCORE</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">{score} PTS</span>
              </div>
            </div>

            {/* Scorecard grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Questions Solved</span>
                <div className="text-lg font-black text-emerald-400 mt-1">10 / 10</div>
              </div>
              <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Level 1 Cleared</span>
                <div className="text-lg font-black text-yellow-400 mt-1">5 / 5 ✓</div>
              </div>
              <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Level 2 Cleared</span>
                <div className="text-lg font-black text-cyan-400 mt-1">5 / 5 ✓</div>
              </div>
              <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Coins Collected</span>
                <div className="text-lg font-black text-amber-400 mt-1">{totalCoins} Coins</div>
              </div>
            </div>

            {/* Detailed questions list */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {QUESTIONS.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block">
                        Q{q.id} — {q.category}
                      </span>
                      <p className="text-slate-300 font-medium">{q.question}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[10px] whitespace-nowrap shrink-0">
                    +100 PTS
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6">
          <button
            onClick={onPlayAgain}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/50 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE OFFER</span>
          </button>

          <button
            onClick={onReturnHome}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>RETURN HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};

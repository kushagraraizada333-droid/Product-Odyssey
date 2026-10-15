import React from 'react';
import { X, ArrowRight, Gamepad2, Sparkles, Award, ShieldAlert } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(251,191,36,0.3)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Gamepad2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight text-glow-gold">
              HOW TO PLAY PRODUCT ODYSSEY
            </h2>
            <p className="text-xs text-amber-300 font-extrabold uppercase tracking-wide">
              JUMP. THINK. BUILD. BECOME A PM.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-200">
          {/* Controls Card */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <h3 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Game Controls</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                <span className="font-extrabold text-white block mb-1">🖥️ Desktop / Laptop</span>
                <ul className="space-y-1 text-slate-300">
                  <li><strong>A / Left Arrow:</strong> Move Left</li>
                  <li><strong>D / Right Arrow:</strong> Move Right</li>
                  <li><strong>Space / W / Up:</strong> Jump / High Jump</li>
                  <li><strong>Esc:</strong> Pause / Resume Menu</li>
                  <li><strong>A, B, C, D:</strong> Answer Question in Modal</li>
                </ul>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                <span className="font-extrabold text-white block mb-1">📱 Mobile & Touch</span>
                <p className="text-slate-300 leading-relaxed">
                  Touch on-screen <strong>LEFT</strong> and <strong>RIGHT</strong> directional buttons to run, and the <strong>JUMP</strong> button to leap across platforms!
                </p>
              </div>
            </div>
          </div>

          {/* Gameplay Loop */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>The Journey & Scoring</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs mb-3">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Standard Coin</span>
                <strong className="text-amber-400 text-sm">+10 PTS</strong>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Correct PM Answer</span>
                <strong className="text-emerald-400 text-sm">+100 PTS</strong>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Level Clear Bonus</span>
                <strong className="text-cyan-400 text-sm">+200 PTS</strong>
              </div>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>• <strong>Level 1 (The Product Apprentice):</strong> Collect 5 Golden Coins testing PM Fundamentals, Customer Discovery, MVP Scoping, Prioritization, and PMF.</li>
              <li>• <strong>Level 2 (The Product Champion):</strong> Collect 5 Golden Coins testing North Star Metrics, Retention, RICE, Guardrails, and Strategy.</li>
              <li>• <strong>Final Castle:</strong> Answer all 10 questions to swing open the castle gates and receive your official APM Job Offer!</li>
            </ul>
          </div>

          {/* Platforming Tips */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <h3 className="font-bold text-cyan-400 mb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Pro Explorer Tips</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Touch red bouncy mushrooms for a super jump! If you fall below a platform, you will respawn at your latest checkpoint without losing your completed questions.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95"
          >
            LET'S PLAY!
          </button>
        </div>
      </div>
    </div>
  );
};

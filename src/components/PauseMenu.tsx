import React, { useState } from 'react';
import { Play, RotateCcw, RotateCw, HelpCircle, Volume2, VolumeX, Home, AlertTriangle } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestartLevel: () => void;
  onRestartGame: () => void;
  onOpenHowToPlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onReturnHome: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestartLevel,
  onRestartGame,
  onOpenHowToPlay,
  isMuted,
  onToggleMute,
  onReturnHome,
}) => {
  const [showRestartGameConfirm, setShowRestartGameConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(251,191,36,0.3)]">
        {/* Header */}
        <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-400/40 mb-2">
          PRODUCT ODYSSEY
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 text-glow-gold">
          GAME PAUSED
        </h2>
        <p className="text-xs text-amber-300 font-extrabold tracking-wider mb-6">
          JUMP. THINK. BUILD. BECOME A PM.
        </p>

        {!showRestartGameConfirm ? (
          <div className="space-y-3">
            {/* Resume Button */}
            <button
              onClick={onResume}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(251,191,36,0.5)] flex items-center justify-center gap-2.5 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>RESUME ADVENTURE</span>
            </button>

            {/* Restart Level */}
            <button
              onClick={onRestartLevel}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCw className="w-4 h-4 text-cyan-400" />
              <span>RESTART CURRENT LEVEL</span>
            </button>

            {/* Restart Game */}
            <button
              onClick={() => setShowRestartGameConfirm(true)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>RESTART WHOLE GAME</span>
            </button>

            {/* How to Play */}
            <button
              onClick={onOpenHowToPlay}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>HOW TO PLAY & CONTROLS</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleMute}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>UNMUTE SOUND (OFF)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>MUTE SOUND (ON)</span>
                </>
              )}
            </button>

            {/* Return Home */}
            <button
              onClick={onReturnHome}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>RETURN TO MAIN MENU</span>
            </button>
          </div>
        ) : (
          /* Restart Game Confirmation Dialog */
          <div className="bg-rose-950/40 border border-rose-500/60 rounded-2xl p-5 text-left animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Restart Game?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              This will reset all your answered questions, checkpoint progress, and score back to zero. Are you sure you want to start over?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setShowRestartGameConfirm(false);
                  onRestartGame();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all active:scale-95"
              >
                YES, RESET
              </button>
              <button
                onClick={() => setShowRestartGameConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs transition-all active:scale-95"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

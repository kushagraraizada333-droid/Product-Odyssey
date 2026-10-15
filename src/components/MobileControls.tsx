import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface MobileControlsProps {
  onLeftChange: (active: boolean) => void;
  onRightChange: (active: boolean) => void;
  onJumpChange: (active: boolean) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeftChange,
  onRightChange,
  onJumpChange,
}) => {
  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 px-4 flex items-center justify-between pointer-events-none z-30 select-none">
      {/* D-Pad: Left & Right */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); onLeftChange(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onLeftChange(false); }}
          onMouseDown={() => onLeftChange(true)}
          onMouseUp={() => onLeftChange(false)}
          aria-label="Move Left"
          className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-amber-500 active:text-slate-950 border-2 border-slate-600/80 text-white flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); onRightChange(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onRightChange(false); }}
          onMouseDown={() => onRightChange(true)}
          onMouseUp={() => onRightChange(false)}
          aria-label="Move Right"
          className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-amber-500 active:text-slate-950 border-2 border-slate-600/80 text-white flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Action Button: Jump */}
      <div className="pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); onJumpChange(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onJumpChange(false); }}
          onMouseDown={() => onJumpChange(true)}
          onMouseUp={() => onJumpChange(false)}
          aria-label="Jump"
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 active:from-yellow-300 active:to-amber-400 border-2 border-yellow-200 text-slate-950 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.6)] backdrop-blur-md transition-all active:scale-90 font-black text-xs"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
          <span>JUMP</span>
        </button>
      </div>
    </div>
  );
};

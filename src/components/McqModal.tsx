import React, { useState, useEffect } from 'react';
import { Question } from '../data/questions';
import { sounds } from '../utils/audio';
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight, RotateCcw, Award } from 'lucide-react';

interface McqModalProps {
  question: Question;
  questionNumberInLevel: number;
  onCorrectSubmit: () => void;
  onClose: () => void;
}

export const McqModal: React.FC<McqModalProps> = ({
  question,
  questionNumberInLevel,
  onCorrectSubmit,
  onClose,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Keyboard navigation (A, B, C, D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (!isAnswered) {
        if (key === 'A' || key === 'B' || key === 'C' || key === 'D') {
          handleSelect(key as "A" | "B" | "C" | "D");
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          if (isCorrect) {
            handleContinue();
          } else {
            handleRetry();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isCorrect, selectedKey]);

  const handleSelect = (key: "A" | "B" | "C" | "D") => {
    if (isAnswered) return;
    setSelectedKey(key);
    setIsAnswered(true);

    const correct = key === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleContinue = () => {
    onCorrectSubmit();
  };

  const handleRetry = () => {
    setSelectedKey(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(251,191,36,0.3)] transition-all duration-300 ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        } ${
          isAnswered && isCorrect
            ? 'border-emerald-400 shadow-[0_0_50px_rgba(34,197,94,0.4)]'
            : isAnswered && !isCorrect
            ? 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.3)]'
            : 'border-amber-400/70'
        }`}
      >
        {/* Top Header Card */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Sparkles className="w-5 h-5 text-slate-900 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-black tracking-wider text-amber-400 uppercase">
                LEVEL {question.level} — QUESTION {questionNumberInLevel} OF 5
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{question.category}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {question.badgeName}
                </span>
              </h3>
            </div>
          </div>

          {/* Level progress indicators */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  num < questionNumberInLevel
                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]'
                    : num === questionNumberInLevel
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] scale-125'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-5">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white leading-snug tracking-tight">
            "{question.question}"
          </h2>
        </div>

        {/* 4 Interactive Answer Option Tiles */}
        <div className="space-y-2.5 mb-5">
          {question.options.map((opt) => {
            const isSelected = selectedKey === opt.key;
            const isThisCorrect = opt.key === question.correctAnswer;

            let tileClasses = "border-slate-700/80 bg-slate-800/80 text-slate-200 hover:border-amber-400 hover:bg-slate-800 hover:scale-[1.01]";

            if (isAnswered) {
              if (isSelected && isCorrect) {
                // Correct answer selected!
                tileClasses = "border-emerald-400 bg-emerald-950/80 text-emerald-100 shadow-[0_0_15px_rgba(34,197,94,0.4)]";
              } else if (isSelected && !isCorrect) {
                // Wrong answer selected!
                tileClasses = "border-rose-500 bg-rose-950/80 text-rose-100";
              } else if (!isSelected && isThisCorrect && !isCorrect) {
                // Reveal correct option on mistake
                tileClasses = "border-emerald-400/60 bg-emerald-950/40 text-emerald-200";
              } else {
                tileClasses = "border-slate-800 bg-slate-900/50 text-slate-500 opacity-60";
              }
            }

            return (
              <button
                key={opt.key}
                disabled={isAnswered}
                onClick={() => handleSelect(opt.key)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${tileClasses}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center transition-all ${
                      isSelected && isCorrect
                        ? 'bg-emerald-400 text-slate-950'
                        : isSelected && !isCorrect
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-700 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950'
                    }`}
                  >
                    {opt.key}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold">{opt.text}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isSelected && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {isSelected && !isCorrect && (
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    )}
                    {!isSelected && isThisCorrect && !isCorrect && (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-md">
                        Correct Answer
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Reaction & Explanation Panel */}
        {isAnswered && (
          <div
            className={`p-4 rounded-2xl border mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              isCorrect
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-100'
                : 'bg-amber-950/60 border-amber-500/60 text-amber-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {isCorrect ? (
                <>
                  <Award className="w-5 h-5 text-emerald-400 animate-bounce" />
                  <span className="text-xs sm:text-sm font-black tracking-wide text-emerald-300 uppercase">
                    CORRECT! PRODUCT THINKING UNLOCKED!
                  </span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                  <span className="text-xs sm:text-sm font-black tracking-wide text-amber-300 uppercase">
                    NOT QUITE! EVEN PMs NEED ITERATION.
                  </span>
                </>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400 font-medium">
            {!isAnswered
              ? "Press A, B, C, or D on your keyboard or tap an option"
              : isCorrect
              ? "Press Enter to continue"
              : "Learn from the insight and try again"}
          </span>

          {isAnswered && (
            <div>
              {isCorrect ? (
                <button
                  onClick={handleContinue}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(34,197,94,0.5)] flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>CONTINUE ADVENTURE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>TRY AGAIN</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

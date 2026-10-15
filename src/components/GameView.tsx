import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { QUESTIONS, Question } from '../data/questions';
import { Hud } from './Hud';
import { McqModal } from './McqModal';
import { LevelCompleteModal } from './LevelCompleteModal';
import { CastleVictoryScreen } from './CastleVictoryScreen';
import { PauseMenu } from './PauseMenu';
import { HowToPlayModal } from './HowToPlayModal';
import { MobileControls } from './MobileControls';
import { sounds } from '../utils/audio';

interface GameViewProps {
  initialLevel?: 1 | 2;
  candidateName: string;
  onReturnHome: () => void;
  onScoreSave?: (score: number) => void;
}

export const GameView: React.FC<GameViewProps> = ({
  initialLevel = 1,
  candidateName,
  onReturnHome,
  onScoreSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React state reflecting game engine state
  const [levelId, setLevelId] = useState<1 | 2>(initialLevel);
  const [score, setScore] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [checkpoint, setCheckpoint] = useState<number>(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());

  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [showLevel1Complete, setShowLevel1Complete] = useState<boolean>(false);
  const [showCastleVictory, setShowCastleVictory] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [levelIntro, setLevelIntro] = useState<{ show: boolean; level: 1 | 2 }>({ show: true, level: initialLevel });

  // Auto-hide level intro banner after 2.6 seconds
  useEffect(() => {
    setLevelIntro({ show: true, level: levelId });
    const timer = setTimeout(() => {
      setLevelIntro((prev) => ({ ...prev, show: false }));
    }, 2600);
    return () => clearTimeout(timer);
  }, [levelId]);

  // Initialize or re-attach engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      {
        onScoreUpdate: (newScore) => {
          setScore(newScore);
          if (onScoreSave) onScoreSave(newScore);
        },
        onCoinCollected: (coins) => {
          setTotalCoins(coins);
        },
        onTriggerQuestion: (questionId) => {
          const q = QUESTIONS.find((item) => item.id === questionId);
          if (q) {
            setActiveQuestion(q);
          }
        },
        onLevelComplete: (lvl) => {
          if (lvl === 1) {
            setShowLevel1Complete(true);
          }
        },
        onReachCastle: () => {
          setShowCastleVictory(true);
        },
        onCheckpointReached: (cpIndex) => {
          setCheckpoint(cpIndex);
        },
      },
      initialLevel
    );

    engineRef.current = engine;
    engine.start();

    // Start background music
    sounds.startBgm();

    // Window resize handler
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
      sounds.stopBgm();
    };
  }, [initialLevel]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pause shortcut
      if (e.key === 'Escape') {
        if (!activeQuestion && !showCastleVictory && !showLevel1Complete) {
          handleTogglePause();
        }
        return;
      }

      if (!engineRef.current) return;

      // Only pass movement keys if question and pause are closed
      if (engineRef.current.isQuestionOpen || engineRef.current.isPaused) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.setKey('left', true);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.setKey('right', true);
      } else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        engineRef.current.setKey('jump', true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.setKey('left', false);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.setKey('right', false);
      } else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        engineRef.current.setKey('jump', false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeQuestion, showCastleVictory, showLevel1Complete, isPaused]);

  // Toggle Pause
  const handleTogglePause = () => {
    if (!engineRef.current) return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    engineRef.current.isPaused = nextPaused;
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Correct answer submitted in MCQ Modal
  const handleQuestionCorrect = () => {
    if (!activeQuestion || !engineRef.current) return;

    engineRef.current.markQuestionCompleted(activeQuestion.id);

    // Update React completed set
    setCompletedQuestions(new Set(engineRef.current.completedQuestions));

    // Close question modal and unfreeze game
    engineRef.current.isQuestionOpen = false;
    setActiveQuestion(null);
  };

  // Transition to Level 2
  const handleEnterLevel2 = () => {
    setShowLevel1Complete(false);
    setLevelId(2);
    if (engineRef.current) {
      engineRef.current.setLevel(2);
    }
  };

  // Restart current level
  const handleRestartLevel = () => {
    if (!engineRef.current) return;
    setIsPaused(false);
    engineRef.current.isPaused = false;
    engineRef.current.resetPlayerToStart();
  };

  // Restart entire game
  const handleRestartGame = () => {
    if (!engineRef.current) return;
    setIsPaused(false);
    setLevelId(1);
    setScore(0);
    setTotalCoins(0);
    setCheckpoint(0);
    setCompletedQuestions(new Set());
    setShowLevel1Complete(false);
    setShowCastleVictory(false);
    setActiveQuestion(null);

    engineRef.current.completedQuestions.clear();
    engineRef.current.score = 0;
    engineRef.current.totalCoinsCollected = 0;
    engineRef.current.setLevel(1);
  };

  const levelName = levelId === 1 ? "LEVEL 1: THE PRODUCT APPRENTICE" : "LEVEL 2: THE PRODUCT CHAMPION";

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col justify-center items-center select-none font-sans">
      {/* 2D Platformer Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-default"
        tabIndex={0}
      />

      {/* Persistent HUD */}
      <Hud
        score={score}
        levelId={levelId}
        levelName={levelName}
        totalCoins={totalCoins}
        completedQuestions={completedQuestions}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onPause={handleTogglePause}
        checkpoint={checkpoint}
      />

      {/* Mobile Touch Controls */}
      <MobileControls
        onLeftChange={(active) => engineRef.current?.setKey('left', active)}
        onRightChange={(active) => engineRef.current?.setKey('right', active)}
        onJumpChange={(active) => engineRef.current?.setKey('jump', active)}
      />

      {/* Cinematic Level Introduction Banner */}
      {levelIntro.show && (
        <div className="absolute top-24 z-40 pointer-events-none flex flex-col items-center justify-center animate-in fade-in zoom-in-90 slide-in-from-top-4 duration-500">
          <div className="bg-slate-900/90 backdrop-blur-md border-2 border-amber-400 px-6 py-3.5 rounded-3xl shadow-[0_0_40px_rgba(251,191,36,0.5)] text-center max-w-md mx-4">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block mb-1">
              PRODUCT ODYSSEY • JUMP. THINK. BUILD. BECOME A PM.
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight text-glow-gold">
              {levelId === 1 ? "LEVEL 1: THE PRODUCT APPRENTICE" : "LEVEL 2: THE PRODUCT CHAMPION"}
            </h1>
            <p className="text-xs font-semibold text-emerald-300 mt-1 italic">
              {levelId === 1
                ? "“Before you build the product, understand the problem.”"
                : "“Think strategically. Choose wisely. Claim your offer.”"}
            </p>
          </div>
        </div>
      )}

      {/* MCQ Question Modal */}
      {activeQuestion && (
        <McqModal
          question={activeQuestion}
          questionNumberInLevel={
            activeQuestion.level === 1 ? activeQuestion.id : activeQuestion.id - 5
          }
          onCorrectSubmit={handleQuestionCorrect}
          onClose={() => {
            if (engineRef.current) engineRef.current.isQuestionOpen = false;
            setActiveQuestion(null);
          }}
        />
      )}

      {/* Level 1 Complete Celebration Banner */}
      {showLevel1Complete && (
        <LevelCompleteModal
          score={score}
          onEnterLevel2={handleEnterLevel2}
        />
      )}

      {/* Final Castle & APM Job Offer Screen */}
      {showCastleVictory && (
        <CastleVictoryScreen
          score={score}
          totalCoins={totalCoins}
          candidateName={candidateName}
          onPlayAgain={handleRestartGame}
          onReturnHome={onReturnHome}
        />
      )}

      {/* Pause Menu */}
      {isPaused && (
        <PauseMenu
          onResume={() => {
            setIsPaused(false);
            if (engineRef.current) engineRef.current.isPaused = false;
          }}
          onRestartLevel={handleRestartLevel}
          onRestartGame={handleRestartGame}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onReturnHome={onReturnHome}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { HomeView } from '@/components/HomeView';
import { GameView } from '@/components/GameView';
import { HowToPlayModal } from '@/components/HowToPlayModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'game'>('home');
  const [candidateName, setCandidateName] = useState<string>('Pico the Product Prodigy');
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());

  // Load saved high score from localStorage
  useEffect(() => {
    try {
      const savedScore = localStorage.getItem('product_odyssey_high_score');
      if (savedScore) setHighScore(parseInt(savedScore, 10));

      const savedName = localStorage.getItem('product_odyssey_candidate_name');
      if (savedName) setCandidateName(savedName);
    } catch {}
  }, []);

  const handleNameChange = (name: string) => {
    setCandidateName(name);
    try {
      localStorage.setItem('product_odyssey_candidate_name', name);
    } catch {}
  };

  const handleSaveScore = (score: number) => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('product_odyssey_high_score', score.toString());
      } catch {}
    }
  };

  return (
    <main className="w-full min-h-screen relative overflow-hidden bg-slate-950 font-sans">
      {currentView === 'home' ? (
        <>
          <HomeView
            onStartAdventure={() => setCurrentView('game')}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            candidateName={candidateName}
            onCandidateNameChange={handleNameChange}
            completedQuestions={completedQuestions}
            highScore={highScore}
          />
          {showHowToPlay && (
            <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
          )}
        </>
      ) : (
        <GameView
          initialLevel={1}
          candidateName={candidateName}
          onReturnHome={() => setCurrentView('home')}
          onScoreSave={handleSaveScore}
        />
      )}
    </main>
  );
}

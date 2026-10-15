import { QUESTIONS } from '../data/questions';

export interface GameSession {
  id: string;
  playerId: string;
  nickname: string;
  currentLevel: 1 | 2;
  score: number;
  totalCoins: number;
  completedQuestions: number[]; // question IDs
  gameStatus: 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  attempts: {
    questionId: number;
    selectedOptionKey: string;
    isCorrect: boolean;
    attemptedAt: string;
  }[];
}

// In-memory persistent session storage across requests
const sessionsMap = new Map<string, GameSession>();

export function createSession(nickname: string = 'Pico'): GameSession {
  const sessionId = 'session_' + Math.random().toString(36).substring(2, 10);
  const playerId = 'player_' + Math.random().toString(36).substring(2, 10);

  const session: GameSession = {
    id: sessionId,
    playerId,
    nickname,
    currentLevel: 1,
    score: 0,
    totalCoins: 0,
    completedQuestions: [],
    gameStatus: 'in_progress',
    startedAt: new Date().toISOString(),
    attempts: [],
  };

  sessionsMap.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): GameSession | null {
  return sessionsMap.get(sessionId) || null;
}

export function submitAnswer(
  sessionId: string,
  questionId: number,
  selectedOptionKey: "A" | "B" | "C" | "D"
): {
  success: boolean;
  isCorrect: boolean;
  score: number;
  explanation: string;
  alreadyCompleted: boolean;
} {
  const session = sessionsMap.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  const isCorrect = selectedOptionKey === question.correctAnswer;
  const alreadyCompleted = session.completedQuestions.includes(questionId);

  // Record attempt
  session.attempts.push({
    questionId,
    selectedOptionKey,
    isCorrect,
    attemptedAt: new Date().toISOString(),
  });

  if (isCorrect && !alreadyCompleted) {
    session.completedQuestions.push(questionId);
    session.score += 100;
  }

  return {
    success: true,
    isCorrect,
    score: session.score,
    explanation: question.explanation,
    alreadyCompleted,
  };
}

export function completeLevel(sessionId: string, levelId: 1 | 2): GameSession {
  const session = sessionsMap.get(sessionId);
  if (!session) throw new Error('Session not found');

  if (levelId === 1) {
    // Validate all 5 L1 questions are done
    const l1Done = [1, 2, 3, 4, 5].every((id) => session.completedQuestions.includes(id));
    if (l1Done && session.currentLevel === 1) {
      session.currentLevel = 2;
      session.score += 200; // level 1 bonus
    }
  } else if (levelId === 2) {
    // Validate all 10 questions done
    const allDone = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((id) =>
      session.completedQuestions.includes(id)
    );
    if (allDone) {
      session.gameStatus = 'completed';
      session.score += 500; // L2 bonus (200) + Game completion bonus (300)
      session.completedAt = new Date().toISOString();
    }
  }

  return session;
}

export function generateSessionReport(sessionId: string) {
  const session = sessionsMap.get(sessionId);
  if (!session) throw new Error('Session not found');

  return {
    sessionId: session.id,
    nickname: session.nickname,
    finalScore: session.score,
    questionsCompleted: session.completedQuestions.length,
    totalQuestions: 10,
    gameStatus: session.gameStatus,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    attemptsCount: session.attempts.length,
    details: session.completedQuestions.map((qId) => {
      const q = QUESTIONS.find((item) => item.id === qId);
      return {
        questionId: qId,
        category: q?.category,
        title: q?.title,
      };
    }),
  };
}

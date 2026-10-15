export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'ground' | 'floating' | 'moving' | 'spring';
  moveRange?: { minX: number; maxX: number; speed: number };
  theme?: 'green' | 'futuristic';
}

export interface CoinObject {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  value: number; // 10
}

export interface InterviewCoinObject {
  questionId: number;
  x: number;
  y: number;
  completed: boolean;
}

export interface LevelConfig {
  id: 1 | 2;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  platforms: Platform[];
  standardCoins: CoinObject[];
  interviewCoins: InterviewCoinObject[];
  finishX: number;
  checkpoints: { x: number; y: number; id: number }[];
}

export const LEVEL_1_CONFIG: LevelConfig = {
  id: 1,
  name: "LEVEL 1: THE PRODUCT APPRENTICE",
  subtitle: "Before you build the product, understand the problem.",
  width: 3700,
  height: 600,
  playerStart: { x: 80, y: 380 },
  finishX: 3550,
  checkpoints: [
    { id: 0, x: 80, y: 380 },
    { id: 1, x: 520, y: 340 },
    { id: 2, x: 1120, y: 320 },
    { id: 3, x: 1780, y: 300 },
    { id: 4, x: 2420, y: 280 },
    { id: 5, x: 3100, y: 300 },
  ],
  platforms: [
    // Ground sections with small fun gaps
    { x: 0, y: 480, w: 750, h: 120, type: 'ground' },
    { x: 850, y: 480, w: 700, h: 120, type: 'ground' },
    { x: 1650, y: 480, w: 650, h: 120, type: 'ground' },
    { x: 2400, y: 480, w: 650, h: 120, type: 'ground' },
    { x: 3150, y: 480, w: 600, h: 120, type: 'ground' },

    // Floating challenge & stepping platforms
    // Checkpoint 1 area
    { x: 260, y: 380, w: 140, h: 28, type: 'floating' },
    { x: 450, y: 340, w: 180, h: 28, type: 'floating' },

    // Moving cloud platform across gap 1
    {
      x: 750, y: 420, w: 100, h: 24, type: 'moving',
      moveRange: { minX: 740, maxX: 840, speed: 1.2 }
    },

    // Checkpoint 2 area
    { x: 920, y: 390, w: 130, h: 28, type: 'floating' },
    { x: 1100, y: 330, w: 180, h: 28, type: 'floating' },
    { x: 1330, y: 280, w: 130, h: 28, type: 'floating' },

    // Bouncy spring mushroom
    { x: 1540, y: 455, w: 50, h: 25, type: 'spring' },

    // Checkpoint 3 area
    { x: 1700, y: 360, w: 140, h: 28, type: 'floating' },
    { x: 1900, y: 300, w: 170, h: 28, type: 'floating' },
    { x: 2130, y: 370, w: 130, h: 28, type: 'floating' },

    // Moving platform across gap 3
    {
      x: 2280, y: 410, w: 110, h: 24, type: 'moving',
      moveRange: { minX: 2280, maxX: 2390, speed: 1.5 }
    },

    // Checkpoint 4 area
    { x: 2460, y: 380, w: 130, h: 28, type: 'floating' },
    { x: 2640, y: 310, w: 180, h: 28, type: 'floating' },
    { x: 2870, y: 360, w: 130, h: 28, type: 'floating' },

    // Checkpoint 5 area (grand apprentice dais)
    { x: 3050, y: 400, w: 120, h: 28, type: 'floating' },
    { x: 3220, y: 330, w: 200, h: 28, type: 'floating' },
    { x: 3460, y: 420, w: 180, h: 28, type: 'floating' },
  ],
  interviewCoins: [
    { questionId: 1, x: 530, y: 270, completed: false },
    { questionId: 2, x: 1180, y: 260, completed: false },
    { questionId: 3, x: 1980, y: 230, completed: false },
    { questionId: 4, x: 2720, y: 240, completed: false },
    { questionId: 5, x: 3310, y: 260, completed: false },
  ],
  standardCoins: [
    // Intro trail
    { id: 'c1', x: 180, y: 440, collected: false, value: 10 },
    { id: 'c2', x: 210, y: 440, collected: false, value: 10 },
    { id: 'c3', x: 310, y: 340, collected: false, value: 10 },
    { id: 'c4', x: 350, y: 340, collected: false, value: 10 },
    { id: 'c5', x: 670, y: 440, collected: false, value: 10 },
    { id: 'c6', x: 700, y: 440, collected: false, value: 10 },
    // Area 2
    { id: 'c7', x: 960, y: 350, collected: false, value: 10 },
    { id: 'c8', x: 1000, y: 350, collected: false, value: 10 },
    { id: 'c9', x: 1380, y: 240, collected: false, value: 10 },
    { id: 'c10', x: 1420, y: 240, collected: false, value: 10 },
    // Area 3
    { id: 'c11', x: 1750, y: 320, collected: false, value: 10 },
    { id: 'c12', x: 2180, y: 330, collected: false, value: 10 },
    // Area 4
    { id: 'c13', x: 2510, y: 340, collected: false, value: 10 },
    { id: 'c14', x: 2920, y: 320, collected: false, value: 10 },
    { id: 'c15', x: 2960, y: 320, collected: false, value: 10 },
    // Area 5
    { id: 'c16', x: 3100, y: 360, collected: false, value: 10 },
    { id: 'c17', x: 3500, y: 380, collected: false, value: 10 },
    { id: 'c18', x: 3540, y: 380, collected: false, value: 10 },
  ],
};

export const LEVEL_2_CONFIG: LevelConfig = {
  id: 2,
  name: "LEVEL 2: THE PRODUCT CHAMPION",
  subtitle: "Think strategically. Choose wisely. Claim your offer.",
  width: 3800,
  height: 600,
  playerStart: { x: 80, y: 380 },
  finishX: 3600,
  checkpoints: [
    { id: 0, x: 80, y: 380 },
    { id: 6, x: 550, y: 320 },
    { id: 7, x: 1220, y: 300 },
    { id: 8, x: 1950, y: 280 },
    { id: 9, x: 2650, y: 290 },
    { id: 10, x: 3300, y: 300 },
  ],
  platforms: [
    // Ground neon/cyber mountain ledges
    { x: 0, y: 480, w: 700, h: 120, type: 'ground', theme: 'futuristic' },
    { x: 820, y: 480, w: 680, h: 120, type: 'ground', theme: 'futuristic' },
    { x: 1620, y: 480, w: 700, h: 120, type: 'ground', theme: 'futuristic' },
    { x: 2420, y: 480, w: 680, h: 120, type: 'ground', theme: 'futuristic' },
    { x: 3200, y: 480, w: 650, h: 120, type: 'ground', theme: 'futuristic' },

    // Stepping holographic roadmaps
    { x: 280, y: 380, w: 140, h: 26, type: 'floating', theme: 'futuristic' },
    { x: 470, y: 320, w: 180, h: 26, type: 'floating', theme: 'futuristic' },

    // Moving analytical graph platform
    {
      x: 710, y: 400, w: 110, h: 24, type: 'moving', theme: 'futuristic',
      moveRange: { minX: 700, maxX: 810, speed: 1.6 }
    },

    // Checkpoint 7 area
    { x: 950, y: 370, w: 140, h: 26, type: 'floating', theme: 'futuristic' },
    { x: 1150, y: 300, w: 180, h: 26, type: 'floating', theme: 'futuristic' },
    { x: 1380, y: 250, w: 120, h: 26, type: 'floating', theme: 'futuristic' },

    // Spring mushroom
    { x: 1520, y: 455, w: 50, h: 25, type: 'spring' },

    // Checkpoint 8 area (RICE prioritization matrix)
    { x: 1720, y: 370, w: 140, h: 26, type: 'floating', theme: 'futuristic' },
    { x: 1900, y: 290, w: 180, h: 26, type: 'floating', theme: 'futuristic' },
    { x: 2140, y: 350, w: 130, h: 26, type: 'floating', theme: 'futuristic' },

    // Moving platform
    {
      x: 2310, y: 400, w: 110, h: 24, type: 'moving', theme: 'futuristic',
      moveRange: { minX: 2310, maxX: 2410, speed: 1.8 }
    },

    // Checkpoint 9 area
    { x: 2480, y: 370, w: 140, h: 26, type: 'floating', theme: 'futuristic' },
    { x: 2670, y: 290, w: 180, h: 26, type: 'floating', theme: 'futuristic' },
    { x: 2910, y: 350, w: 130, h: 26, type: 'floating', theme: 'futuristic' },

    // Checkpoint 10 area (Road to Castle Gate)
    { x: 3100, y: 390, w: 130, h: 26, type: 'floating', theme: 'futuristic' },
    { x: 3260, y: 310, w: 200, h: 26, type: 'floating', theme: 'futuristic' },
    { x: 3500, y: 420, w: 200, h: 26, type: 'floating', theme: 'futuristic' },
  ],
  interviewCoins: [
    { questionId: 6, x: 550, y: 250, completed: false },
    { questionId: 7, x: 1230, y: 230, completed: false },
    { questionId: 8, x: 1980, y: 220, completed: false },
    { questionId: 9, x: 2750, y: 220, completed: false },
    { questionId: 10, x: 3350, y: 240, completed: false },
  ],
  standardCoins: [
    { id: 'c201', x: 200, y: 440, collected: false, value: 10 },
    { id: 'c202', x: 230, y: 440, collected: false, value: 10 },
    { id: 'c203', x: 330, y: 340, collected: false, value: 10 },
    { id: 'c204', x: 370, y: 340, collected: false, value: 10 },
    // Area 2
    { id: 'c205', x: 1000, y: 330, collected: false, value: 10 },
    { id: 'c206', x: 1420, y: 210, collected: false, value: 10 },
    // Area 3
    { id: 'c207', x: 1780, y: 330, collected: false, value: 10 },
    { id: 'c208', x: 2190, y: 310, collected: false, value: 10 },
    // Area 4
    { id: 'c209', x: 2530, y: 330, collected: false, value: 10 },
    { id: 'c210', x: 2960, y: 310, collected: false, value: 10 },
    // Area 5
    { id: 'c211', x: 3150, y: 350, collected: false, value: 10 },
    { id: 'c212', x: 3550, y: 380, collected: false, value: 10 },
    { id: 'c213', x: 3590, y: 380, collected: false, value: 10 },
  ],
};

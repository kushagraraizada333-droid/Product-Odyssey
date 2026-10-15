import { LevelConfig, LEVEL_1_CONFIG, LEVEL_2_CONFIG, Platform, CoinObject, InterviewCoinObject } from './levels';
import { drawPico, PicoState } from './PicoRenderer';
import { sounds } from '../utils/audio';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onCoinCollected: (totalCoins: number) => void;
  onTriggerQuestion: (questionId: number) => void;
  onLevelComplete: (levelId: 1 | 2) => void;
  onReachCastle: () => void;
  onCheckpointReached: (checkpointIndex: number) => void;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'star' | 'dust';
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Level & state
  public currentLevel: LevelConfig;
  public isPaused: boolean = false;
  public isQuestionOpen: boolean = false;
  public isTransitioning: boolean = false;
  public isVictorySequence: boolean = false;

  // Player physics state
  public player = {
    x: 80,
    y: 380,
    prevX: 80,
    prevY: 380,
    vx: 0,
    vy: 0,
    w: 38,
    h: 56,
    isGrounded: false,
    facing: 'right' as 'left' | 'right',
    state: 'idle' as PicoState,
    animTime: 0,
    currentCheckpoint: 0,
  };

  // Input states
  public keys = {
    left: false,
    right: false,
    jump: false,
  };

  // Gameplay tracking
  public score: number = 0;
  public totalCoinsCollected: number = 0;
  public completedQuestions: Set<number> = new Set();

  // Camera
  public cameraX: number = 0;
  public viewportWidth: number = 960;
  public viewportHeight: number = 540;

  // Effects & runtime
  private particles: Particle[] = [];
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private castleGateOpenProgress: number = 0; // 0 to 1

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks, initialLevel: 1 | 2 = 1) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Could not get 2D canvas context");
    this.ctx = context;
    this.callbacks = callbacks;
    this.currentLevel = initialLevel === 1 ? { ...LEVEL_1_CONFIG } : { ...LEVEL_2_CONFIG };
    this.deepCloneLevel();
    this.resize();
    this.resetPlayerToStart();
  }

  private deepCloneLevel() {
    // Deep clone platforms and coins so collection state is fresh per run
    const base = this.currentLevel.id === 1 ? LEVEL_1_CONFIG : LEVEL_2_CONFIG;
    this.currentLevel = {
      ...base,
      platforms: base.platforms.map(p => ({ ...p, moveRange: p.moveRange ? { ...p.moveRange } : undefined })),
      standardCoins: base.standardCoins.map(c => ({ ...c })),
      interviewCoins: base.interviewCoins.map(ic => ({
        ...ic,
        completed: this.completedQuestions.has(ic.questionId),
      })),
      checkpoints: base.checkpoints.map(cp => ({ ...cp })),
    };
  }

  public resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.viewportWidth = rect.width || 960;
    this.viewportHeight = rect.height || 540;

    this.canvas.width = this.viewportWidth * dpr;
    this.canvas.height = this.viewportHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  public setLevel(levelId: 1 | 2) {
    this.currentLevel = levelId === 1 ? { ...LEVEL_1_CONFIG } : { ...LEVEL_2_CONFIG };
    this.deepCloneLevel();
    this.resetPlayerToStart();
    this.isTransitioning = false;
    this.isVictorySequence = false;
    this.castleGateOpenProgress = 0;
  }

  public resetPlayerToStart() {
    this.player.x = this.currentLevel.playerStart.x;
    this.player.y = this.currentLevel.playerStart.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = false;
    this.player.facing = 'right';
    this.player.state = 'idle';
    this.player.animTime = 0;
    this.player.currentCheckpoint = 0;
    this.cameraX = 0;
  }

  public markQuestionCompleted(questionId: number) {
    this.completedQuestions.add(questionId);
    // Find interview coin in current level and mark completed
    const coin = this.currentLevel.interviewCoins.find(c => c.questionId === questionId);
    if (coin) {
      coin.completed = true;
    }

    // Award +100 points
    this.score += 100;
    this.callbacks.onScoreUpdate(this.score);

    // Burst celebration particles around player!
    this.createConfettiParticles(this.player.x + 20, this.player.y + 20, 30);
    this.player.state = 'celebrate';

    // Check if Level 1 completed (all 5 questions 1-5 done)
    if (this.currentLevel.id === 1) {
      const allL1Done = [1, 2, 3, 4, 5].every(id => this.completedQuestions.has(id));
      if (allL1Done) {
        this.score += 200; // Level 1 completion bonus
        this.callbacks.onScoreUpdate(this.score);
        sounds.playLevelComplete();
        setTimeout(() => {
          this.callbacks.onLevelComplete(1);
        }, 1200);
      }
    }

    // Check if Level 2 completed (all 5 questions 6-10 done)
    if (this.currentLevel.id === 2) {
      const allL2Done = [6, 7, 8, 9, 10].every(id => this.completedQuestions.has(id));
      if (allL2Done) {
        this.score += 200; // Level 2 completion bonus
        this.callbacks.onScoreUpdate(this.score);
        sounds.playCastleGate();
        this.isVictorySequence = true;
      }
    }
  }

  public start() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      if (!this.isPaused && !this.isQuestionOpen) {
        this.update(dt);
      }
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // Handle Controls
  public setKey(key: 'left' | 'right' | 'jump', active: boolean) {
    this.keys[key] = active;
    if (key === 'jump' && active && this.player.isGrounded && !this.isPaused && !this.isQuestionOpen) {
      this.player.vy = -12.5; // Jump velocity
      this.player.isGrounded = false;
      this.player.state = 'jump';
      sounds.playJump();
      this.createDustPuff(this.player.x + this.player.w / 2, this.player.y + this.player.h);
    }
  }

  private update(dt: number) {
    this.player.animTime += dt;
    this.player.prevX = this.player.x;
    this.player.prevY = this.player.y;

    // Victory sequence cutscene: Pico automatically runs triumphantly toward the castle
    if (this.isVictorySequence) {
      this.player.state = 'run';
      this.player.facing = 'right';
      this.player.vx = 4.5;
      this.castleGateOpenProgress = Math.min(1, this.castleGateOpenProgress + dt * 0.8);

      // When Pico reaches finish
      if (this.player.x >= this.currentLevel.finishX - 40) {
        this.player.vx = 0;
        this.player.state = 'celebrate';
        if (!this.isTransitioning) {
          this.isTransitioning = true;
          this.score += 300; // Game complete bonus
          this.callbacks.onScoreUpdate(this.score);
          sounds.playVictoryFanfare();
          setTimeout(() => {
            this.callbacks.onReachCastle();
          }, 1500);
        }
      }
    } else {
      // Normal Player Movement
      const ACCEL = 0.9;
      const FRICTION = 0.82;
      const MAX_SPEED = 5.2;

      if (this.keys.left) {
        this.player.vx = Math.max(-MAX_SPEED, this.player.vx - ACCEL);
        this.player.facing = 'left';
      } else if (this.keys.right) {
        this.player.vx = Math.min(MAX_SPEED, this.player.vx + ACCEL);
        this.player.facing = 'right';
      } else {
        this.player.vx *= FRICTION;
        if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
      }
    }

    // Apply gravity
    const GRAVITY = 0.48;
    this.player.vy = Math.min(13, this.player.vy + GRAVITY);

    // Update moving platforms
    for (const plat of this.currentLevel.platforms) {
      if (plat.type === 'moving' && plat.moveRange) {
        const mr = plat.moveRange;
        plat.x += mr.speed;
        if (plat.x > mr.maxX) {
          plat.x = mr.maxX;
          mr.speed = -Math.abs(mr.speed);
        } else if (plat.x < mr.minX) {
          plat.x = mr.minX;
          mr.speed = Math.abs(mr.speed);
        }
      }
    }

    // Move player horizontally
    this.player.x += this.player.vx;

    // Boundary horizontal clamping
    if (this.player.x < 10) this.player.x = 10;
    if (this.player.x > this.currentLevel.width - this.player.w - 10) {
      this.player.x = this.currentLevel.width - this.player.w - 10;
    }

    // Move player vertically & collision detection
    this.player.y += this.player.vy;
    this.player.isGrounded = false;

    // Platform collisions
    for (const plat of this.currentLevel.platforms) {
      // Check collision with platform
      const pLeft = this.player.x + 4;
      const pRight = this.player.x + this.player.w - 4;
      const pTop = this.player.y;
      const pBottom = this.player.y + this.player.h;

      const platLeft = plat.x;
      const platRight = plat.x + plat.w;
      const platTop = plat.y;
      const platBottom = plat.y + plat.h;

      // Check horizontal overlap
      if (pRight > platLeft && pLeft < platRight) {
        // Landing on top of platform (moving downward and was previously above or at platform top)
        if (this.player.vy >= 0 && this.player.prevY + this.player.h <= platTop + 8 && pBottom >= platTop) {
          // Spring mushroom!
          if (plat.type === 'spring') {
            this.player.vy = -16.5; // High bounce!
            this.player.y = platTop - this.player.h;
            sounds.playJump();
            this.createDustPuff(this.player.x + this.player.w / 2, platTop, '#f43f5e');
          } else {
            this.player.y = platTop - this.player.h;
            this.player.vy = 0;
            this.player.isGrounded = true;

            // If on a moving platform, carry player along
            if (plat.type === 'moving' && plat.moveRange) {
              this.player.x += plat.moveRange.speed;
            }
          }
        }
      }
    }

    // Pit respawn check (fallen down)
    if (this.player.y > 590) {
      this.respawnAtCheckpoint();
    }

    // Determine animation state
    if (!this.isVictorySequence) {
      if (!this.player.isGrounded) {
        this.player.state = 'jump';
      } else if (Math.abs(this.player.vx) > 0.4) {
        this.player.state = 'run';
      } else {
        if (this.player.state !== 'celebrate') {
          this.player.state = 'idle';
        }
      }
    }

    // Collect standard coins
    for (const coin of this.currentLevel.standardCoins) {
      if (!coin.collected) {
        const cx = coin.x + 10;
        const cy = coin.y + 10;
        const px = this.player.x + this.player.w / 2;
        const py = this.player.y + this.player.h / 2;
        const dist = Math.hypot(cx - px, cy - py);
        if (dist < 28) {
          coin.collected = true;
          this.score += coin.value;
          this.totalCoinsCollected++;
          sounds.playCoin();
          this.callbacks.onScoreUpdate(this.score);
          this.callbacks.onCoinCollected(this.totalCoinsCollected);
          this.createSparkleParticles(coin.x + 10, coin.y + 10, 8, '#fbbf24');
        }
      }
    }

    // Interview coins collision
    for (let i = 0; i < this.currentLevel.interviewCoins.length; i++) {
      const icoin = this.currentLevel.interviewCoins[i];
      if (!icoin.completed) {
        const icx = icoin.x + 18;
        const icy = icoin.y + 18;
        const px = this.player.x + this.player.w / 2;
        const py = this.player.y + this.player.h / 2;
        const dist = Math.hypot(icx - px, icy - py);

        if (dist < 36) {
          // Trigger interview question!
          this.isQuestionOpen = true;
          sounds.playSpecialCoin();
          this.createSparkleParticles(icoin.x + 18, icoin.y + 18, 25, '#f59e0b', 'star');
          this.player.vx = 0;
          this.player.state = 'puzzled';

          // Set active checkpoint
          this.player.currentCheckpoint = i + 1;
          this.callbacks.onCheckpointReached(this.player.currentCheckpoint);
          this.callbacks.onTriggerQuestion(icoin.questionId);
          break;
        }
      }
    }

    // Smooth camera tracking
    const targetCamX = this.player.x - this.viewportWidth * 0.35;
    this.cameraX += (targetCamX - this.cameraX) * 0.08;
    if (this.cameraX < 0) this.cameraX = 0;
    const maxCamX = this.currentLevel.width - this.viewportWidth;
    if (this.cameraX > maxCamX) this.cameraX = maxCamX;

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life += dt;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private respawnAtCheckpoint() {
    const cp = this.currentLevel.checkpoints[this.player.currentCheckpoint] || this.currentLevel.checkpoints[0];
    this.player.x = cp.x;
    this.player.y = cp.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = false;
    this.player.state = 'idle';
    sounds.playIncorrect();
    this.createDustPuff(cp.x + 20, cp.y + 30, '#38bdf8');
  }

  // Particle helpers
  public createSparkleParticles(x: number, y: number, count: number, color: string, shape: 'circle' | 'star' = 'circle') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
        shape,
      });
    }
  }

  public createConfettiParticles(x: number, y: number, count: number) {
    const colors = ['#f59e0b', '#ec4899', '#38bdf8', '#22c55e', '#a855f7', '#fbbf24'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 1.2) + Math.random() * (Math.PI * 0.6);
      const speed = 3 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
        vy: -Math.abs(Math.sin(angle) * speed) - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 5,
        alpha: 1,
        life: 0,
        maxLife: 1.0 + Math.random() * 0.6,
        shape: 'star',
      });
    }
  }

  public createDustPuff(x: number, y: number, color = 'rgba(255, 255, 255, 0.7)') {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y - 2,
        vx: (Math.random() - 0.5) * 2,
        vy: -0.8 - Math.random() * 1.5,
        color,
        size: 4 + Math.random() * 4,
        alpha: 0.8,
        life: 0,
        maxLife: 0.35,
        shape: 'dust',
      });
    }
  }

  // ===================== RENDERING =====================
  public render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    // 1. Parallax Background
    this.renderParallaxBackground(ctx);

    // 2. World Elements (translated by cameraX)
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Render Platforms
    this.renderPlatforms(ctx);

    // Render Coins (Standard & Interview)
    this.renderCoins(ctx);

    // Render Castle / Gate at end of level
    this.renderFinishStructure(ctx);

    // Render Pico!
    drawPico(ctx, {
      x: this.player.x,
      y: this.player.y,
      width: this.player.w,
      height: this.player.h,
      state: this.player.state,
      facing: this.player.facing,
      animTime: this.player.animTime,
      isGrounded: this.player.isGrounded,
    });

    // Render Particles in world space
    this.renderParticles(ctx);

    ctx.restore();
  }

  private renderParallaxBackground(ctx: CanvasRenderingContext2D) {
    const isL2 = this.currentLevel.id === 2;
    const w = this.viewportWidth;
    const h = this.viewportHeight;

    if (!isL2) {
      // LEVEL 1: Lush sky-blue, bright fluffy clouds, emerald hills, rainbow, distant castle
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#38bdf8'); // sky blue
      skyGrad.addColorStop(0.55, '#7dd3fc');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Smiling Sun
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(w - 90, 80, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.beginPath();
      ctx.arc(w - 90, 80, 60, 0, Math.PI * 2);
      ctx.fill();

      // Rainbow arc in distance
      ctx.save();
      ctx.globalAlpha = 0.35;
      const rainbowColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc'];
      rainbowColors.forEach((color, idx) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(w * 0.45, h * 0.9, 320 + idx * 5, Math.PI, 0);
        ctx.stroke();
      });
      ctx.restore();

      // Distant Animated Fluffy Clouds (Parallax factor 0.1)
      const cloudOffset = (this.cameraX * 0.1) % (w + 400);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      this.drawCloud(ctx, 120 - cloudOffset, 70, 70);
      this.drawCloud(ctx, 420 - cloudOffset, 110, 90);
      this.drawCloud(ctx, 800 - cloudOffset, 65, 80);
      this.drawCloud(ctx, 1150 - cloudOffset, 95, 100);

      // Distant Emerald Hills (Parallax factor 0.25)
      const hillOffset = this.cameraX * 0.25;
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 100; x += 120) {
        const hillX = x - (hillOffset % 120);
        const hillH = Math.sin((x + hillOffset * 0.5) * 0.008) * 45 + 170;
        ctx.lineTo(hillX, h - hillH);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Midground Hills with cute trees (Parallax factor 0.45)
      const midOffset = this.cameraX * 0.45;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 100; x += 90) {
        const hX = x - (midOffset % 90);
        const hY = Math.sin((x + midOffset * 0.8) * 0.012) * 35 + 120;
        ctx.lineTo(hX, h - hY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Distant Castle silhouette on furthest hill
      const castleX = 750 - (this.cameraX * 0.2);
      this.drawDistantCastle(ctx, castleX, h - 220, 0.7);

    } else {
      // LEVEL 2: Futuristic twilight violet/indigo, cosmic stars, holographic aurora, illuminated castle
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0f172a'); // deep navy
      skyGrad.addColorStop(0.4, '#312e81'); // indigo
      skyGrad.addColorStop(0.8, '#581c87'); // purple
      skyGrad.addColorStop(1, '#831843'); // twilight magenta
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Twinkling Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5) % w);
        const sy = ((i * 73.1) % (h * 0.65));
        const sSize = (i % 3 === 0) ? 2 : 1;
        const twinkle = Math.sin(this.player.animTime * 3 + i) * 0.4 + 0.6;
        ctx.globalAlpha = twinkle;
        ctx.fillRect(sx, sy, sSize, sSize);
      }
      ctx.globalAlpha = 1;

      // Holographic Aurora Borealis Ribbon
      ctx.save();
      ctx.globalAlpha = 0.3;
      const auroraGrad = ctx.createLinearGradient(0, 40, w, 180);
      auroraGrad.addColorStop(0, '#06b6d4');
      auroraGrad.addColorStop(0.5, '#a855f7');
      auroraGrad.addColorStop(1, '#ec4899');
      ctx.fillStyle = auroraGrad;
      ctx.beginPath();
      ctx.moveTo(0, 100);
      for (let x = 0; x <= w; x += 40) {
        const y = Math.sin((x + this.player.animTime * 40) * 0.015) * 30 + 100;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, 220);
      ctx.lineTo(0, 220);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Cyber Mountain Silhouettes (Parallax factor 0.25)
      const hillOffset = this.cameraX * 0.25;
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 120; x += 100) {
        const hX = x - (hillOffset % 100);
        const hY = Math.sin((x + hillOffset * 0.5) * 0.009) * 55 + 180;
        ctx.lineTo(hX, h - hY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Midground Neon Ridge (Parallax factor 0.45)
      const midOffset = this.cameraX * 0.45;
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 90; x += 80) {
        const hX = x - (midOffset % 80);
        const hY = Math.sin((x + midOffset * 0.8) * 0.014) * 40 + 130;
        ctx.lineTo(hX, h - hY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Distant Futuristic Grand Castle
      const castleX = 720 - (this.cameraX * 0.2);
      this.drawDistantCastle(ctx, castleX, h - 240, 0.9, true);
    }
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
    ctx.arc(x + r * 0.35, y - r * 0.2, r * 0.5, 0, Math.PI * 2);
    ctx.arc(x + r * 0.75, y, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawDistantCastle(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, futuristic = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = futuristic ? '#6366f1' : '#f8fafc';
    // Main tower
    ctx.fillRect(-25, -60, 50, 60);
    // Spire
    ctx.beginPath();
    ctx.moveTo(-30, -60);
    ctx.lineTo(0, -100);
    ctx.lineTo(30, -60);
    ctx.closePath();
    ctx.fillStyle = futuristic ? '#f43f5e' : '#38bdf8';
    ctx.fill();

    // Side towers
    ctx.fillStyle = futuristic ? '#4f46e5' : '#e2e8f0';
    ctx.fillRect(-55, -45, 25, 45);
    ctx.fillRect(30, -45, 25, 45);

    // Side spires
    ctx.beginPath();
    ctx.moveTo(-58, -45);
    ctx.lineTo(-42, -75);
    ctx.lineTo(-27, -45);
    ctx.closePath();
    ctx.fillStyle = futuristic ? '#fbbf24' : '#f59e0b';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(27, -45);
    ctx.lineTo(42, -75);
    ctx.lineTo(58, -45);
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-8, -40, 16, 22);

    ctx.restore();
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    const isL2 = this.currentLevel.id === 2;

    for (const p of this.currentLevel.platforms) {
      // Don't render spring mushroom as normal platform
      if (p.type === 'spring') {
        this.renderSpringMushroom(ctx, p.x, p.y);
        continue;
      }

      if (!isL2) {
        // LEVEL 1: Lush green grass top with rich brown earthen stone
        if (p.type === 'ground') {
          // Top grass layer
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.w, 18, [8, 8, 0, 0]);
          ctx.fill();

          // Lush grass blades fringe
          ctx.fillStyle = '#16a34a';
          for (let gx = p.x; gx < p.x + p.w - 10; gx += 16) {
            ctx.beginPath();
            ctx.moveTo(gx, p.y + 16);
            ctx.lineTo(gx + 6, p.y + 24);
            ctx.lineTo(gx + 12, p.y + 16);
            ctx.fill();
          }

          // Earth body
          ctx.fillStyle = '#78350f';
          ctx.fillRect(p.x, p.y + 18, p.w, p.h - 18);

          // Stone block details
          ctx.fillStyle = '#92400e';
          for (let sx = p.x + 20; sx < p.x + p.w - 30; sx += 60) {
            ctx.fillRect(sx, p.y + 35, 30, 15);
            ctx.fillRect(sx + 30, p.y + 65, 26, 14);
          }
        } else {
          // Floating magical campus platform (shaped like wooden desk/floating island)
          ctx.fillStyle = '#15803d'; // Green hedge top
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.w, 10, [6]);
          ctx.fill();

          ctx.fillStyle = '#b45309'; // Warm timber shelf
          ctx.beginPath();
          ctx.roundRect(p.x + 2, p.y + 8, p.w - 4, p.h - 8, [0, 0, 6, 6]);
          ctx.fill();

          // Gold rim
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(p.x + 6, p.y + p.h - 4, p.w - 12, 3);
        }
      } else {
        // LEVEL 2: Futuristic holographic cyber platforms with neon cyan/magenta trim & glowing grids
        ctx.save();
        if (p.type === 'ground') {
          // Deep slate ground
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.w, p.h, [8, 8, 0, 0]);
          ctx.fill();

          // Cyber neon cyan top line
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + 2);
          ctx.lineTo(p.x + p.w, p.y + 2);
          ctx.stroke();

          // Cyber grid lines
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.lineWidth = 1.5;
          for (let gx = p.x; gx < p.x + p.w; gx += 40) {
            ctx.beginPath();
            ctx.moveTo(gx, p.y);
            ctx.lineTo(gx, p.y + p.h);
            ctx.stroke();
          }
        } else {
          // Floating Hologram Roadmap / Matrix Plate
          ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.w, p.h, [8]);
          ctx.fill();

          // Neon pink / purple glowing edge
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Hologram bars / mini roadmap icons
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(p.x + 12, p.y + 8, p.w * 0.25, 4);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(p.x + p.w * 0.35, p.y + 8, p.w * 0.25, 4);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(p.x + p.w * 0.68, p.y + 8, p.w * 0.2, 4);
        }
        ctx.restore();
      }
    }
  }

  private renderSpringMushroom(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Cute bouncy red & white mushroom
    ctx.save();
    // Stem
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(x + 15, y + 10, 20, 15, [4]);
    ctx.fill();

    // Red bouncy cap
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + 25, y + 12, 22, Math.PI, 0);
    ctx.fill();

    // White polka dots
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 25, y + 2, 4, 0, Math.PI * 2);
    ctx.arc(x + 13, y + 8, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 37, y + 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderCoins(ctx: CanvasRenderingContext2D) {
    const t = this.player.animTime;

    // 1. Standard Collectible Coins
    for (const c of this.currentLevel.standardCoins) {
      if (c.collected) continue;
      const spinScale = Math.sin(t * 7 + c.x * 0.05);

      ctx.save();
      ctx.translate(c.x + 10, c.y + 10);
      ctx.scale(spinScale, 1);

      // Gold coin body
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight ring
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Dollar / Coin icon
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-1.5, -4, 3, 8);
      ctx.restore();
    }

    // 2. Golden Interview Coins (Special Checkpoint Coins!)
    for (const icoin of this.currentLevel.interviewCoins) {
      const hoverY = Math.sin(t * 3 + icoin.questionId) * 5;
      const cx = icoin.x + 18;
      const cy = icoin.y + 18 + hoverY;

      ctx.save();
      ctx.translate(cx, cy);

      if (icoin.completed) {
        // COMPLETED STATE: Glowing golden completed medal with green checkmark!
        ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Checkmark
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-2, 4);
        ctx.lineTo(6, -4);
        ctx.stroke();

        // Question number tag
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Q${icoin.questionId} ✓`, 0, -22);

      } else {
        // ACTIVE INCOMPLETE INTERVIEW COIN: Radiating magical golden beacon!
        const pulse = Math.sin(t * 5) * 4;

        // Glowing outer aura
        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 24 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Rotating rays
        ctx.save();
        ctx.rotate(t * 1.5);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          ctx.rotate((Math.PI * 2) / 8);
          ctx.beginPath();
          ctx.moveTo(18, 0);
          ctx.lineTo(26, 0);
          ctx.stroke();
        }
        ctx.restore();

        // Golden Coin Base
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // Shiny inner surface
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        // Question mark symbol '?' or PM Badge
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);

        // Header label above coin
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(`Q${icoin.questionId}`, 0, -24);
      }
      ctx.restore();
    }
  }

  private renderFinishStructure(ctx: CanvasRenderingContext2D) {
    const isL2 = this.currentLevel.id === 2;
    const fx = this.currentLevel.finishX;

    if (!isL2) {
      // LEVEL 1: Majestic Golden Gate archway leading to Level 2
      const allDone = [1, 2, 3, 4, 5].every(id => this.completedQuestions.has(id));

      ctx.save();
      ctx.translate(fx - 80, 280);

      // Gate pillars
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, 24, 200);
      ctx.fillRect(96, 0, 24, 200);

      // Gold capital trims
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-4, -8, 32, 14);
      ctx.fillRect(92, -8, 32, 14);

      // Arch banner
      ctx.fillStyle = allDone ? '#22c55e' : '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(-8, -48, 136, 42, [10]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(allDone ? 'LEVEL 2 UNLOCKED' : 'PRODUCT GATE', 60, -24);

      // Gate energy field / bars
      if (!allDone) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.fillRect(24, 10, 72, 190);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(24, 10, 72, 190);
      } else {
        // Glowing portal open!
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.fillRect(24, 10, 72, 190);
        // Portal sparkles
        const t = this.player.animTime;
        for (let i = 0; i < 4; i++) {
          const sy = (t * 80 + i * 45) % 180;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(60 + Math.sin(t * 3 + i) * 20, 190 - sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

    } else {
      // LEVEL 2: The Magnificent Final Castle Gate & Bridge!
      const allDone = [6, 7, 8, 9, 10].every(id => this.completedQuestions.has(id));

      ctx.save();
      ctx.translate(fx - 120, 220);

      // Castle Wall & Towers
      ctx.fillStyle = '#312e81'; // Royal indigo stone
      ctx.fillRect(-20, 40, 40, 220);
      ctx.fillRect(160, 40, 40, 220);

      // Spires
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.moveTo(-25, 40);
      ctx.lineTo(0, -20);
      ctx.lineTo(25, 40);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(155, 40);
      ctx.lineTo(180, -20);
      ctx.lineTo(205, 40);
      ctx.fill();

      // Grand Arch
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(90, 110, 65, Math.PI, 0);
      ctx.rect(25, 110, 130, 150);
      ctx.fill();

      // Royal Golden Gate
      if (!allDone) {
        // Closed gate with golden bars and lock
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        for (let bx = 35; bx <= 145; bx += 18) {
          ctx.beginPath();
          ctx.moveTo(bx, 80);
          ctx.lineTo(bx, 260);
          ctx.stroke();
        }
        // Big Padlock
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(90, 160, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('10/10', 90, 164);
      } else {
        // Glowing portal into the Job Offer throne room!
        const gateProgress = this.castleGateOpenProgress;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 30 * gateProgress;
        ctx.fillRect(25 + 65 * (1 - gateProgress), 80, 130 * gateProgress, 180);
        ctx.shadowBlur = 0;

        // "ENTER CASTLE" banner
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OFFER CASTLE', 90, 50);
      }

      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        ctx.translate(p.x, p.y);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const px = Math.cos(a) * p.size;
          const py = Math.sin(a) * p.size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          const aInner = a + Math.PI / 5;
          ctx.lineTo(Math.cos(aInner) * (p.size * 0.45), Math.sin(aInner) * (p.size * 0.45));
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'dust') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

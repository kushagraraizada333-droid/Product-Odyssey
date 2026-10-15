'use client';

import React, { useRef, useEffect } from 'react';
import { drawPico, PicoState } from '../game/PicoRenderer';

export type ProductType = 'customer_card' | 'roadmap' | 'analytics' | 'feature_card' | 'mvp' | 'rocket';

interface ProductItem {
  id: number;
  type: ProductType;
  x: number;
  y: number;
  baseY: number;
  floatOffset: number;
  rotation: number;
  scale: number;
  isCollected: boolean;
  collectAnimTime: number; // 0 to 1
  label: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'star' | 'circle' | 'dust';
}

interface FloatingText {
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
}

interface GroundProp {
  type: 'flower' | 'pebble' | 'bush';
  x: number;
  subType?: number;
  color?: string;
}

export const PicoChaseBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // World Speeds (in pixels per second)
    const SPEED_GROUND = 210;       // Ground, flowers, pebbles, products
    const SPEED_MIDGROUND = 85;     // Rolling green hills & trees
    const SPEED_BACKGROUND = 28;    // Distant castle & mountain ridges
    const SPEED_CLOUDS = 14;        // Soft drifting clouds

    // Scroll Offsets (monotonically increasing)
    let groundScrollX = 0;
    let midScrollX = 0;
    let bgScrollX = 0;
    let cloudScrollX = 0;

    // Ground Y position (fixed height across the landscape)
    const getGroundY = () => {
      return height * (width < 640 ? 0.74 : 0.76);
    };

    // Pico state anchored horizontally on the screen
    const pico = {
      xRatio: 0.22, // 22% from left edge
      y: 0,
      w: 44,
      h: 62,
      state: 'run' as PicoState,
      facing: 'right' as 'right' | 'left',
      animTime: 0,
      jumpVy: 0,
      jumpY: 0,
      isLeaping: false,
    };

    // Product types pool
    const PRODUCT_TYPES: { type: ProductType; label: string }[] = [
      { type: 'customer_card', label: '+Customer Insight!' },
      { type: 'roadmap', label: '+Roadmap Aligned!' },
      { type: 'analytics', label: '+Metrics Rocketing!' },
      { type: 'feature_card', label: '+Feature Shipped!' },
      { type: 'mvp', label: '+MVP Validated!' },
      { type: 'rocket', label: '+Product Launched!' },
    ];

    let nextTypeIndex = 0;
    let nextId = 1;

    // Active product targets traveling with the scrolling world toward Pico
    const products: ProductItem[] = [];

    const spawnProductAhead = (startX: number) => {
      const info = PRODUCT_TYPES[nextTypeIndex % PRODUCT_TYPES.length];
      nextTypeIndex++;

      const groundY = getGroundY();
      // Float at chest/head level (45 to 65px above ground)
      const floatY = groundY - 48 - (Math.random() * 20);

      products.push({
        id: nextId++,
        type: info.type,
        x: startX,
        y: floatY,
        baseY: floatY,
        floatOffset: Math.random() * Math.PI * 2,
        rotation: 0,
        scale: 1,
        isCollected: false,
        collectAnimTime: 0,
        label: info.label,
      });
    };

    // Initialize initial product wave ahead of Pico
    spawnProductAhead(width * 0.45);
    spawnProductAhead(width * 0.78);
    spawnProductAhead(width * 1.12);

    // Ground decorative props (flowers, bushes, pebbles) that scroll with ground
    const groundProps: GroundProp[] = [];
    const flowerColors = ['#f43f5e', '#a855f7', '#fbbf24', '#38bdf8', '#ec4899'];
    for (let i = 0; i < 35; i++) {
      const pX = (i * 70) + (Math.random() * 30);
      const randType = Math.random();
      if (randType < 0.5) {
        groundProps.push({
          type: 'flower',
          x: pX,
          color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        });
      } else if (randType < 0.8) {
        groundProps.push({
          type: 'pebble',
          x: pX,
          subType: Math.floor(Math.random() * 3),
        });
      } else {
        groundProps.push({
          type: 'bush',
          x: pX,
          subType: Math.floor(Math.random() * 2),
        });
      }
    }

    const particles: Particle[] = [];
    const floatingTexts: FloatingText[] = [];

    let lastTime = performance.now();
    let dustTimer = 0;

    const spawnStarBurst = (x: number, y: number) => {
      const colors = ['#facc15', '#38bdf8', '#ec4899', '#4ade80', '#fb923c', '#ffffff'];
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3.5 + Math.random() * 4.5,
          alpha: 1,
          life: 0,
          maxLife: 0.65 + Math.random() * 0.35,
          shape: 'star',
        });
      }
    };

    const spawnDustPuff = (x: number, y: number) => {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: x - 6 + Math.random() * 6,
          y: y - 2,
          vx: -2.5 - Math.random() * 2, // Dust blows backward as world moves left
          vy: -0.5 - Math.random() * 1.2,
          color: 'rgba(255, 255, 255, 0.75)',
          size: 3.5 + Math.random() * 3,
          alpha: 0.8,
          life: 0,
          maxLife: 0.4,
          shape: 'dust',
        });
      }
    };

    // ================= MAIN RENDER & SCROLL LOOP =================
    const renderLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      pico.animTime += dt;
      dustTimer += dt;

      // Update Scroll Offsets
      groundScrollX += SPEED_GROUND * dt;
      midScrollX += SPEED_MIDGROUND * dt;
      bgScrollX += SPEED_BACKGROUND * dt;
      cloudScrollX += SPEED_CLOUDS * dt;

      ctx.clearRect(0, 0, width, height);

      // 1. SKY & SUN LAYER (Fixed atmosphere with sunbeam pulse)
      drawSkyAndSun(ctx, width, height, pico.animTime);

      // 2. CLOUDS LAYER (Drifting slowly from right to left)
      drawDriftingClouds(ctx, width, height, cloudScrollX);

      // 3. BACKGROUND: DISTANT MOUNTAINS & MAGNIFICENT CASTLE (Scrolling slowly)
      drawDistantCastleAndMountains(ctx, width, height, bgScrollX, pico.animTime);

      // 4. MIDGROUND: ROLLING EMERALD HILLS & TREES (Medium scroll speed)
      drawMidgroundHillsAndTrees(ctx, width, height, midScrollX);

      // 5. GROUND LAYER: SCROLLING GRASS, EARTH STRATA & FLORA (Fast ground speed)
      const groundY = getGroundY();
      drawSeamlessGround(ctx, width, height, groundY, groundScrollX, groundProps);

      // 6. SCROLLING PRODUCT OBJECTS TRAVELING TOWARD PICO
      const picoX = Math.max(70, width * pico.xRatio);
      pico.y = groundY - pico.h + pico.jumpY;

      for (let i = products.length - 1; i >= 0; i--) {
        const prod = products[i];

        // Move with the ground speed from right to left!
        prod.x -= SPEED_GROUND * dt;

        // Bob up and down on sine wave
        const bob = Math.sin(pico.animTime * 3.8 + prod.floatOffset) * 6;
        prod.y = prod.baseY + bob;
        prod.rotation = Math.sin(pico.animTime * 2.2 + prod.floatOffset) * 0.08;

        // Collision check with Pico
        const picoCenterX = picoX + pico.w / 2;
        const picoCenterY = pico.y + pico.h / 2;
        const dist = Math.hypot(prod.x - picoCenterX, prod.y - picoCenterY);

        if (!prod.isCollected && dist < 52) {
          prod.isCollected = true;
          prod.collectAnimTime = 0;

          // Pico performs an excited joyful leap!
          if (!pico.isLeaping) {
            pico.isLeaping = true;
            pico.jumpVy = -6.8;
          }

          // Trigger sparkling particle burst
          spawnStarBurst(prod.x, prod.y);

          // Add floating EXP reward text
          floatingTexts.push({
            text: prod.label,
            x: picoX + 20,
            y: prod.y - 18,
            alpha: 1,
            color: '#facc15',
          });
        }

        // Draw Product
        if (prod.isCollected) {
          prod.collectAnimTime += dt * 3.8;
          const popScale = 1 + prod.collectAnimTime * 0.6;
          const popAlpha = Math.max(0, 1 - prod.collectAnimTime);

          ctx.save();
          ctx.globalAlpha = popAlpha;
          ctx.translate(prod.x, prod.y);
          ctx.scale(popScale, popScale);
          drawProductObject(ctx, prod.type, pico.animTime);
          ctx.restore();

          if (prod.collectAnimTime >= 1) {
            products.splice(i, 1);
            // Spawn new product beyond right edge
            const furthestX = products.reduce((max, p) => Math.max(max, p.x), width);
            spawnProductAhead(furthestX + 280 + Math.random() * 140);
          }
        } else {
          ctx.save();
          ctx.translate(prod.x, prod.y);
          ctx.rotate(prod.rotation);
          drawProductObject(ctx, prod.type, pico.animTime);
          ctx.restore();

          // If passed Pico and exited left edge of screen, recycle beyond right edge
          if (prod.x < -100) {
            products.splice(i, 1);
            const furthestX = products.reduce((max, p) => Math.max(max, p.x), width);
            spawnProductAhead(furthestX + 260 + Math.random() * 120);
          }
        }
      }

      // Keep minimum 3 products incoming from the right
      while (products.length < 3) {
        const furthestX = products.reduce((max, p) => Math.max(max, p.x), width * 0.6);
        spawnProductAhead(furthestX + 300);
      }

      // 7. PICO RUNNING ON GROUND SYNCHRONIZED WITH GROUND MOVEMENT
      if (pico.isLeaping) {
        pico.jumpVy += 34 * dt; // gravity
        pico.jumpY += pico.jumpVy;
        pico.state = 'jump';

        if (pico.jumpY >= 0) {
          pico.jumpY = 0;
          pico.jumpVy = 0;
          pico.isLeaping = false;
          pico.state = 'run';
          spawnDustPuff(picoX + pico.w / 2, groundY);
        }
      } else {
        pico.state = 'run';
        // Occasional spontaneous little hop over bumps
        if (Math.random() < 0.003) {
          pico.isLeaping = true;
          pico.jumpVy = -6.0;
        }
      }

      // Dust puffs under running feet
      if (!pico.isLeaping && dustTimer > 0.16) {
        dustTimer = 0;
        spawnDustPuff(picoX + 8, groundY);
      }

      // Draw Pico with animated legs, arms, and backpack
      drawPico(ctx, {
        x: picoX,
        y: pico.y,
        width: pico.w,
        height: pico.h,
        state: pico.state,
        facing: pico.facing,
        animTime: pico.animTime,
        isGrounded: !pico.isLeaping,
        hoodieColor: '#0d9488', // Teal hoodie
        backpackColor: '#facc15', // Yellow adventure backpack
        badgeType: 'roadmap', // Product roadmap badge
      });

      // 8. PARTICLES (Stars & Dust)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += dt;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          ctx.translate(p.x, p.y);
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            const a = (s * Math.PI * 2) / 5 - Math.PI / 2;
            const sx = Math.cos(a) * p.size;
            const sy = Math.sin(a) * p.size;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
            const aInner = a + Math.PI / 5;
            ctx.lineTo(Math.cos(aInner) * (p.size * 0.45), Math.sin(aInner) * (p.size * 0.45));
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 9. FLOATING EXP TEXT POPUPS
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 38 * dt;
        ft.alpha -= 0.85 * dt;

        if (ft.alpha <= 0) {
          floatingTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#0f172a';
        ctx.shadowBlur = 6;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

// =================== PARALLAX WORLD RENDERERS ===================

// 1. SKY GRADIENT & SUN
function drawSkyAndSun(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#38bdf8'); // Sky blue
  skyGrad.addColorStop(0.5, '#7dd3fc');
  skyGrad.addColorStop(0.85, '#bae6fd');
  skyGrad.addColorStop(1, '#86efac');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Radiant smiling sun with pulsating halo
  const sunX = width - 110;
  const sunY = 90;
  const haloPulse = Math.sin(time * 2) * 5;

  ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 52 + haloPulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
  ctx.fill();

  // Gentle sun smile
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(sunX, sunY + 4, 12, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Sun eyes
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(sunX - 10, sunY - 4, 2.5, 0, Math.PI * 2);
  ctx.arc(sunX + 10, sunY - 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// 2. DRIFTING CLOUDS (PARALLAX LAYER 0)
function drawDriftingClouds(ctx: CanvasRenderingContext2D, width: number, height: number, scrollX: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';

  // Reusable clouds spanning across screen with wrap
  const cloudPositions = [
    { x: 120, y: 70, r: 65 },
    { x: 420, y: 120, r: 85 },
    { x: 780, y: 65, r: 75 },
    { x: 1150, y: 105, r: 90 },
    { x: 1540, y: 80, r: 70 },
  ];

  const totalSpan = 1800;
  cloudPositions.forEach((cp) => {
    // Modular wrap for seamless continuous drifting
    let drawX = (cp.x - scrollX) % totalSpan;
    if (drawX < -200) drawX += totalSpan;

    ctx.beginPath();
    ctx.arc(drawX, cp.y, cp.r * 0.4, 0, Math.PI * 2);
    ctx.arc(drawX + cp.r * 0.35, cp.y - cp.r * 0.2, cp.r * 0.5, 0, Math.PI * 2);
    ctx.arc(drawX + cp.r * 0.75, cp.y, cp.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// 3. DISTANT MOUNTAINS & CASTLE WITH WAVING FLAGS (PARALLAX LAYER 1)
function drawDistantCastleAndMountains(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scrollX: number,
  time: number
) {
  const horizonY = height * 0.75;

  // Furthest Mountain Ridges (soft pastel indigo/teal)
  ctx.fillStyle = '#99f6e4';
  ctx.beginPath();
  ctx.moveTo(0, height);
  const mountainPeriod = 240;
  const offset = scrollX % mountainPeriod;
  for (let x = -mountainPeriod; x <= width + mountainPeriod; x += mountainPeriod) {
    const rx = x - offset;
    ctx.lineTo(rx, horizonY - 180);
    ctx.lineTo(rx + 120, horizonY - 240);
    ctx.lineTo(rx + 240, horizonY - 180);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // MAGICAL CASTLE with waving flags & glowing windows!
  // Cycles across background horizon every 1900px
  const castleCycle = 1900;
  let castleX = (1100 - scrollX) % castleCycle;
  if (castleX < -250) castleX += castleCycle;

  ctx.save();
  ctx.translate(castleX, horizonY - 40);

  // Main Keep Tower
  ctx.fillStyle = '#312e81'; // Royal indigo
  ctx.fillRect(-28, -120, 56, 120);

  // Main Keep Spire
  ctx.fillStyle = '#f59e0b'; // Gold Spire
  ctx.beginPath();
  ctx.moveTo(-34, -120);
  ctx.lineTo(0, -180);
  ctx.lineTo(34, -120);
  ctx.closePath();
  ctx.fill();

  // Waving Golden Flag on Main Spire!
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(0, -180);
  const flagWave1 = Math.sin(time * 6) * 5;
  const flagWave2 = Math.cos(time * 6) * 4;
  ctx.lineTo(24, -180 + flagWave1);
  ctx.lineTo(0, -168 + flagWave2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -180);
  ctx.lineTo(0, -165);
  ctx.stroke();

  // Left Tower
  ctx.fillStyle = '#3730a3';
  ctx.fillRect(-65, -95, 30, 95);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(-70, -95);
  ctx.lineTo(-50, -145);
  ctx.lineTo(-30, -95);
  ctx.closePath();
  ctx.fill();
  // Left Flag
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(-50, -145);
  ctx.lineTo(-32, -145 + Math.sin(time * 6 + 1) * 4);
  ctx.lineTo(-50, -135);
  ctx.fill();

  // Right Tower
  ctx.fillStyle = '#3730a3';
  ctx.fillRect(35, -95, 30, 95);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(30, -95);
  ctx.lineTo(50, -145);
  ctx.lineTo(70, -95);
  ctx.closePath();
  ctx.fill();
  // Right Flag
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(50, -145);
  ctx.lineTo(68, -145 + Math.sin(time * 6 + 2) * 4);
  ctx.lineTo(50, -135);
  ctx.fill();

  // Glowing Stained-Glass Castle Windows
  const windowGlow = Math.sin(time * 3) * 0.2 + 0.8;
  ctx.globalAlpha = windowGlow;
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-10, -85, 20, 32);
  ctx.fillRect(-55, -60, 10, 18);
  ctx.fillRect(45, -60, 10, 18);
  ctx.globalAlpha = 1;

  ctx.restore();
}

// 4. MIDGROUND: ROLLING EMERALD HILLS & TREES (PARALLAX LAYER 2)
function drawMidgroundHillsAndTrees(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scrollX: number
) {
  const groundY = height * (width < 640 ? 0.74 : 0.76);

  // Midground emerald hills curve
  ctx.fillStyle = '#4ade80'; // Emerald green
  ctx.beginPath();
  ctx.moveTo(0, height);

  const hillStep = 60;
  for (let x = 0; x <= width + hillStep; x += hillStep) {
    const worldX = x + scrollX;
    const hillHeight = Math.sin(worldX * 0.005) * 40 + Math.cos(worldX * 0.002) * 20 + 80;
    ctx.lineTo(x, groundY - hillHeight);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Midground Trees scrolling with the hills
  const treeSpacing = 280;
  const startIdx = Math.floor(scrollX / treeSpacing);
  const endIdx = startIdx + Math.ceil(width / treeSpacing) + 1;

  for (let i = startIdx; i <= endIdx; i++) {
    const treeWorldX = i * treeSpacing + 70;
    const screenX = treeWorldX - scrollX;
    const hillHeight = Math.sin(treeWorldX * 0.005) * 40 + Math.cos(treeWorldX * 0.002) * 20 + 80;
    const treeY = groundY - hillHeight;

    // Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(screenX - 4, treeY - 24, 8, 24);

    // Green Foliage canopy
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(screenX, treeY - 36, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(screenX - 4, treeY - 40, 13, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 5. CONTINUOUS SEAMLESS GROUND (GROUND LAYER - SYNCHRONIZED WITH PICO)
function drawSeamlessGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  scrollX: number,
  props: GroundProp[]
) {
  // Rich Earthen Soil Body
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, groundY + 18, width, height - groundY);

  // Stone Strata Blocks embedded in soil (scrolling left with ground)
  const stoneTileW = 90;
  const stoneOffset = scrollX % stoneTileW;
  ctx.fillStyle = '#92400e';
  for (let x = -stoneTileW; x <= width + stoneTileW; x += stoneTileW) {
    const sx = x - stoneOffset;
    ctx.fillRect(sx + 10, groundY + 36, 36, 14);
    ctx.fillRect(sx + 52, groundY + 68, 30, 12);
    ctx.fillRect(sx + 20, groundY + 98, 42, 16);
  }

  // Top Vibrant Grass Layer
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(0, groundY, width, 18, [0]);
  ctx.fill();

  // Lush Grass Blades Fringe (moving with scrollX)
  const bladeSpacing = 14;
  const bladeOffset = scrollX % bladeSpacing;
  ctx.fillStyle = '#16a34a';
  for (let x = -bladeSpacing; x <= width + bladeSpacing; x += bladeSpacing) {
    const bx = x - bladeOffset;
    ctx.beginPath();
    ctx.moveTo(bx, groundY + 16);
    ctx.lineTo(bx + 5, groundY + 24);
    ctx.lineTo(bx + 10, groundY + 16);
    ctx.fill();
  }

  // Decorative Flora (Flowers, Bushes, Pebbles) on Ground
  const totalPropSpan = 2450;
  props.forEach((prop) => {
    let px = (prop.x - scrollX) % totalPropSpan;
    if (px < -60) px += totalPropSpan;

    if (px >= -50 && px <= width + 50) {
      if (prop.type === 'flower') {
        // Green stem
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, groundY + 2);
        ctx.lineTo(px, groundY - 10);
        ctx.stroke();
        // Blossom petals
        ctx.fillStyle = prop.color || '#ec4899';
        ctx.beginPath();
        ctx.arc(px, groundY - 12, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(px, groundY - 12, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (prop.type === 'pebble') {
        // Smooth rounded cobblestone
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.ellipse(px, groundY + 4, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (prop.type === 'bush') {
        // Cute green grass shrub
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(px, groundY + 2, 8, Math.PI, 0);
        ctx.arc(px + 7, groundY + 2, 6, Math.PI, 0);
        ctx.fill();
      }
    }
  });
}

// =================== PROCEDURAL PRODUCT GRAPHICS ===================
function drawProductObject(ctx: CanvasRenderingContext2D, type: ProductType, time: number) {
  // Radial golden shimmer glow behind each object
  const glowPulse = Math.sin(time * 4) * 3;
  ctx.save();
  ctx.fillStyle = 'rgba(251, 191, 36, 0.32)';
  ctx.beginPath();
  ctx.arc(0, 0, 24 + glowPulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  switch (type) {
    case 'customer_card':
      drawCustomerProfileCard(ctx);
      break;
    case 'roadmap':
      drawRoadmapBoard(ctx);
      break;
    case 'analytics':
      drawAnalyticsCharts(ctx);
      break;
    case 'feature_card':
      drawFeatureCard(ctx);
      break;
    case 'mvp':
      drawMvpPackage(ctx, time);
      break;
    case 'rocket':
      drawLaunchRocket(ctx, time);
      break;
  }
}

// 1. CUSTOMER PROFILE CARD
function drawCustomerProfileCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-24, -18, 48, 36, [6]);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Header bar
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.roundRect(-24, -18, 48, 10, [6, 6, 0, 0]);
  ctx.fill();

  // Avatar circle
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(-14, 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(-14, 2, 2.5, 0, Math.PI);
  ctx.stroke();

  // Persona text bullet lines
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-4, -2, 22, 2.5);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-4, 3, 18, 2);
  ctx.fillRect(-4, 7, 14, 2);

  // Empathy heart badge
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(15, -12, 2.8, 0, Math.PI * 2);
  ctx.fill();
}

// 2. PRODUCT ROADMAP BOARD
function drawRoadmapBoard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.roundRect(-25, -18, 50, 36, [6]);
  ctx.fill();
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Columns: NOW / NEXT / LATER
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(-21, -12, 11, 24, [3]);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-19, -8, 7, 2);
  ctx.fillRect(-19, -3, 7, 6);

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.roundRect(-6, -12, 11, 24, [3]);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-4, -8, 7, 2);
  ctx.fillRect(-4, -3, 7, 10);

  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.roundRect(9, -12, 11, 24, [3]);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(11, -8, 7, 2);
  ctx.fillRect(11, -3, 7, 5);
}

// 3. FLOATING ANALYTICS CHARTS
function drawAnalyticsCharts(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.beginPath();
  ctx.roundRect(-22, -18, 44, 36, [6]);
  ctx.fill();
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Rising metric bars
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-16, 2, 5, 10);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-8, -4, 5, 16);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(0, -9, 5, 21);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(8, -14, 5, 26);

  // Upward trend line
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, 1);
  ctx.lineTo(-6, -5);
  ctx.lineTo(2, -10);
  ctx.lineTo(11, -15);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(11, -15, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// 4. AGILE FEATURE CARD
function drawFeatureCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.roundRect(-22, -18, 44, 36, [4]);
  ctx.fill();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // P0 Priority tag
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(-18, -14, 16, 7, [3]);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-15, -11, 10, 1.5);

  // Checkbox
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-18, -3, 6, 6);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(-16, -1, 2, 2);

  // Story text lines
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-9, -2, 22, 2);
  ctx.fillRect(-18, 6, 31, 2);
  ctx.fillRect(-18, 10, 20, 2);
}

// 5. GLOWING MVP PACKAGE
function drawMvpPackage(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(-16, -12, 32, 26, [5]);
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ribbon
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-16, -2, 32, 6);
  ctx.fillRect(-3, -12, 6, 26);

  ctx.beginPath();
  ctx.arc(-5, -14, 5, 0, Math.PI * 2);
  ctx.arc(5, -14, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-13, -7, 26, 15, [3]);
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MVP', 0, 1);
}

// 6. PRODUCT LAUNCH ROCKET
function drawLaunchRocket(ctx: CanvasRenderingContext2D, time: number) {
  ctx.save();
  ctx.rotate(0.55);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.bezierCurveTo(9, -12, 9, 8, 8, 14);
  ctx.lineTo(-8, 14);
  ctx.bezierCurveTo(-9, 8, -9, -12, 0, -22);
  ctx.fill();

  // Nosecone
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.bezierCurveTo(6, -14, 6, -10, 6, -8);
  ctx.lineTo(-6, -8);
  ctx.bezierCurveTo(-6, -10, -6, -14, 0, -22);
  ctx.fill();

  // Fins
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.lineTo(-16, 17);
  ctx.lineTo(-8, 14);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, 8);
  ctx.lineTo(16, 17);
  ctx.lineTo(8, 14);
  ctx.fill();

  // Window
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(0, -2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Animated exhaust flame
  const flameLength = 12 + Math.sin(time * 25) * 4;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(-5, 14);
  ctx.lineTo(0, 14 + flameLength);
  ctx.lineTo(5, 14);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(-3, 14);
  ctx.lineTo(0, 14 + flameLength * 0.6);
  ctx.lineTo(3, 14);
  ctx.fill();

  ctx.restore();
}

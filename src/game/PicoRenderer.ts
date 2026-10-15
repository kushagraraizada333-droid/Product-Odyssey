export type PicoState = 'idle' | 'run' | 'jump' | 'celebrate' | 'puzzled';

export interface PicoRenderOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  state: PicoState;
  facing: 'left' | 'right';
  animTime: number; // in seconds or frame count
  isGrounded?: boolean;
  hoodieColor?: string;
  backpackColor?: string;
  badgeType?: 'rocket' | 'roadmap';
}

export function drawPico(ctx: CanvasRenderingContext2D, opts: PicoRenderOptions) {
  const { x, y, width, height, state, facing, animTime } = opts;

  ctx.save();
  ctx.translate(x + width / 2, y + height);

  // Flip horizontally if facing left
  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  // Animation variables
  let breatheY = 0;
  let legSwing = 0;
  let armSwing = 0;
  let eyeScaleY = 1;
  let headTilt = 0;

  const t = animTime * 8; // speed multiplier

  if (state === 'idle') {
    breatheY = Math.sin(t * 0.4) * 2;
    // Periodic blink
    const blinkCycle = animTime % 3.5;
    if (blinkCycle > 3.3) {
      eyeScaleY = 0.1;
    }
  } else if (state === 'run') {
    breatheY = Math.abs(Math.sin(t)) * 3;
    legSwing = Math.sin(t) * 12;
    armSwing = -Math.sin(t) * 14;
  } else if (state === 'jump') {
    breatheY = -4;
    legSwing = -6; // tucked up
    armSwing = 22; // raised high
  } else if (state === 'celebrate') {
    breatheY = Math.abs(Math.sin(t * 1.5)) * 6;
    armSwing = 24 + Math.sin(t * 2) * 4;
  } else if (state === 'puzzled') {
    breatheY = Math.sin(t * 0.3) * 1.5;
    headTilt = 0.15;
    armSwing = 10;
  }

  // Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.beginPath();
  const shadowW = width * 0.45 * (state === 'jump' ? 0.7 : 1);
  ctx.ellipse(0, -2, shadowW, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, -breatheY);

  const hoodieColor = opts.hoodieColor || '#0d9488'; // Vibrant teal hoodie
  const backpackColor = opts.backpackColor || '#facc15'; // Bright yellow backpack
  const badgeType = opts.badgeType || 'roadmap';

  // 1. BACKPACK (drawn behind body - yellow adventure backpack with pocket)
  ctx.fillStyle = backpackColor;
  ctx.beginPath();
  ctx.roundRect(-22, -38, 14, 20, [4]);
  ctx.fill();
  ctx.fillStyle = '#ca8a04'; // Buckle and zipper trim
  ctx.fillRect(-22, -34, 14, 3);
  ctx.fillRect(-17, -28, 7, 7); // Pocket
  // Roll on top of backpack
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.roundRect(-23, -42, 16, 6, [3]);
  ctx.fill();

  // 2. LEGS & SHOES
  // Left leg (back)
  ctx.fillStyle = '#1e293b'; // Navy shorts
  ctx.fillRect(-10, -18, 7, 10);
  ctx.save();
  ctx.translate(-7, -8);
  ctx.rotate((-legSwing * Math.PI) / 180);
  ctx.fillStyle = '#f59e0b'; // Skin leg
  ctx.fillRect(-3, 0, 6, 8);
  // Shoe (back)
  ctx.fillStyle = '#e11d48'; // Red sneaker
  ctx.beginPath();
  ctx.roundRect(-4, 6, 12, 6, [2, 4, 2, 2]);
  ctx.fill();
  ctx.fillStyle = '#ffffff'; // White sole
  ctx.fillRect(-4, 10, 12, 2);
  ctx.restore();

  // Right leg (front)
  ctx.fillStyle = '#0f172a'; // Navy shorts
  ctx.fillRect(3, -18, 7, 10);
  ctx.save();
  ctx.translate(6, -8);
  ctx.rotate((legSwing * Math.PI) / 180);
  ctx.fillStyle = '#fed7aa'; // Skin leg
  ctx.fillRect(-3, 0, 6, 8);
  // Shoe (front)
  ctx.fillStyle = '#e11d48'; // Red sneaker
  ctx.beginPath();
  ctx.roundRect(-4, 6, 12, 6, [2, 4, 2, 2]);
  ctx.fill();
  ctx.fillStyle = '#ffffff'; // White sole
  ctx.fillRect(-4, 10, 12, 2);
  ctx.restore();

  // 3. TORSO & HOODIE
  // Inner shirt
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(-10, -36, 20, 20, [4]);
  ctx.fill();

  // Teal Hoodie / Explorer Vest
  ctx.fillStyle = hoodieColor;
  ctx.beginPath();
  ctx.roundRect(-12, -36, 8, 19, [4, 0, 0, 3]);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(4, -36, 8, 19, [0, 4, 3, 0]);
  ctx.fill();
  // Hoodie pocket trim
  ctx.fillStyle = '#115e59';
  ctx.fillRect(-4, -24, 8, 4);

  // PRODUCT ROADMAP BADGE on chest!
  if (badgeType === 'roadmap') {
    ctx.fillStyle = '#1e293b'; // Badge backplate
    ctx.beginPath();
    ctx.roundRect(3, -33, 9, 8, [2]);
    ctx.fill();
    // 3 mini roadmap bars: green, yellow, cyan
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(4, -32, 4, 1.5);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(4, -29.5, 6, 1.5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(4, -27, 7, 1.5);
  } else {
    // PM Rocket pin
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(7, -30, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(7, -30, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. ARMS
  // Back arm
  ctx.save();
  ctx.translate(-10, -32);
  ctx.rotate((-armSwing * Math.PI) / 180);
  ctx.fillStyle = hoodieColor;
  ctx.beginPath();
  ctx.roundRect(-3, 0, 6, 12, [3]);
  ctx.fill();
  // Hand
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, 13, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. HEAD & FACE
  ctx.save();
  ctx.translate(0, -36);
  ctx.rotate(headTilt);

  // Neck
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(-4, -4, 8, 6);

  // Head base
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -14, 13, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
  ctx.beginPath();
  ctx.arc(-7, -11, 3.2, 0, Math.PI * 2);
  ctx.arc(7, -11, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // EYES
  ctx.save();
  ctx.translate(0, -14);
  ctx.scale(1, eyeScaleY);

  if (state === 'celebrate') {
    // Joyful curved closed eyes (^ ^)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-5, 0, 3, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, 0, 3, Math.PI, 0);
    ctx.stroke();
  } else if (state === 'puzzled') {
    // One wide, one squished
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 0, 3.2, 2.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Expressive cartoon eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(5, 0, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris & Pupil (looking forward)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(-4, 0, 2.4, 0, Math.PI * 2);
    ctx.arc(6, 0, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-3.8, 0, 1.4, 0, Math.PI * 2);
    ctx.arc(6.2, 0, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4.6, -1.2, 1, 0, Math.PI * 2);
    ctx.arc(5.4, -1.2, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // MOUTH
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  if (state === 'jump' || state === 'celebrate') {
    // Open joyful mouth with tongue
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -8, 4.5, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
    // Tongue
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(0, -6.5, 2.8, 0, Math.PI);
    ctx.fill();
  } else if (state === 'puzzled') {
    ctx.beginPath();
    ctx.moveTo(-3, -7);
    ctx.lineTo(3, -9);
    ctx.stroke();
  } else {
    // Friendly PM smile
    ctx.beginPath();
    ctx.arc(0, -8, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

  // HAIR TUFTS
  ctx.fillStyle = '#78350f'; // Chestnut hair
  ctx.beginPath();
  ctx.arc(-10, -18, 4, 0, Math.PI * 2);
  ctx.arc(10, -18, 4, 0, Math.PI * 2);
  ctx.fill();

  // EXPLORER CAP / BERET
  ctx.fillStyle = '#0284c7'; // Vibrant Cyan/Blue Cap
  ctx.beginPath();
  ctx.arc(0, -20, 13.5, Math.PI, 0);
  ctx.fill();

  // Cap Visor / Brim
  ctx.fillStyle = '#0369a1';
  ctx.beginPath();
  ctx.ellipse(3, -20, 15, 3.5, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Golden Cap PM Badge (agile loop / diamond star)
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, -24, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-1.5, -24.5, 3, 1);

  ctx.restore(); // end head

  // 6. FRONT ARM
  ctx.save();
  ctx.translate(8, -32);
  ctx.rotate((armSwing * Math.PI) / 180);
  ctx.fillStyle = hoodieColor;
  ctx.beginPath();
  ctx.roundRect(-3, 0, 6, 12, [3]);
  ctx.fill();
  // Hand
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, 13, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Extra celebration sparkles around Pico!
  if (state === 'celebrate') {
    const starAngle = animTime * 4;
    for (let i = 0; i < 3; i++) {
      const a = starAngle + (i * Math.PI * 2) / 3;
      const sx = Math.cos(a) * 26;
      const sy = -35 + Math.sin(a) * 16;
      drawStar(ctx, sx, sy, 4.5, '#fbbf24');
    }
  }

  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    const aInner = a + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(aInner) * (r * 0.45), cy + Math.sin(aInner) * (r * 0.45));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * The Main Character splash intro, drawn on a canvas: a spotlight beam sweeps
 * onto a dark stage and a silhouette walks into the pool of light. A port of
 * the handoff's `class Component` (design_handoff_splash/, local only) with
 * its production defaults baked in: the "distance" entrance and no walk cycle.
 * Colours, timings and geometry are final from the design; keep them exact.
 */

/** Seconds from the start of the intro. */
export const TIMELINE = {
  beamOn: 0.4,
  sweepStart: 0.9,
  sweepEnd: 2.4,
  figStart: 2.8,
  figEnd: 4.6,
  pageStart: 4.9,
  typeStart: 5.7,
  end: 9.6,
} as const;

/** Smoothstep of t across [a, b], clamped. */
function sm(t: number, a: number, b: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

type Mote = { u: number; v: number; s: number; r: number; ph: number };

/** Stick silhouette standing on (0, 0), `fh` tall. */
function figure(ctx: CanvasRenderingContext2D, fh: number) {
  const r = fh * 0.072;
  ctx.beginPath();
  ctx.arc(0, -fh * 0.9, r, 0, 6.2832);
  ctx.fill();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = fh * 0.05;
  ctx.beginPath();
  ctx.moveTo(0, -fh * 0.84);
  ctx.lineTo(0, -fh * 0.78);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-fh * 0.105, -fh * 0.77);
  ctx.quadraticCurveTo(0, -fh * 0.8, fh * 0.105, -fh * 0.77);
  ctx.lineTo(fh * 0.09, -fh * 0.5);
  ctx.lineTo(fh * 0.105, -fh * 0.4);
  ctx.lineTo(-fh * 0.105, -fh * 0.4);
  ctx.lineTo(-fh * 0.09, -fh * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = fh * 0.03;
  ctx.stroke();
  ctx.lineWidth = fh * 0.045;
  ctx.beginPath();
  ctx.moveTo(-fh * 0.088, -fh * 0.765);
  ctx.lineTo(-fh * 0.175, -fh * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(fh * 0.088, -fh * 0.765);
  ctx.lineTo(fh * 0.175, -fh * 0.45);
  ctx.stroke();
  ctx.lineWidth = fh * 0.075;
  ctx.beginPath();
  ctx.moveTo(-fh * 0.055, -fh * 0.4);
  ctx.lineTo(-fh * 0.07, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(fh * 0.055, -fh * 0.4);
  ctx.lineTo(fh * 0.07, 0);
  ctx.stroke();
}

export function createStage(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  /* Each figure pass is drawn opaque here, then blitted once at its alpha, so
     overlapping limbs never double up. */
  const off = document.createElement('canvas');
  let W = 0;
  let H = 0;
  let dpr = 1;
  const dust: Mote[] = Array.from({ length: 80 }, () => ({
    u: Math.random(),
    v: Math.random() * 2 - 1,
    s: 0.012 + Math.random() * 0.02,
    r: 0.6 + Math.random() * 1.3,
    ph: Math.random() * 6.28,
  }));

  function resize(width: number, height: number) {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = width;
    H = height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  function layer(
    alpha: number,
    color: string,
    drawFn: (c: CanvasRenderingContext2D) => void,
  ) {
    if (!ctx || alpha <= 0) return;
    const cw = canvas.width;
    const ch = canvas.height;
    if (off.width !== cw || off.height !== ch) {
      off.width = cw;
      off.height = ch;
    }
    const c = off.getContext('2d');
    if (!c) return;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, cw, ch);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = c.strokeStyle = color;
    drawFn(c);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = alpha;
    ctx.drawImage(off, 0, 0);
    ctx.restore();
  }

  /** Paints the scene at intro time `t`; `dt` advances the dust. */
  function draw(t: number, dt: number) {
    if (!ctx || !W) return;
    const T = TIMELINE;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#100d0b';
    ctx.fillRect(0, 0, W, H);
    const floorY = H * 0.7;
    ctx.fillStyle = '#15110e';
    ctx.fillRect(0, floorY, W, H - floorY);

    const wP = Math.min(300, Math.max(100, W * 0.15));
    const S = { x: W + 80, y: -80 };
    const pxFinal = Math.max(wP * 1.1 + 12, W * 0.19);
    const sweep = sm(t, T.sweepStart, T.sweepEnd);
    const poolY = floorY + (H - floorY) * 0.275;
    const P = { x: W * 0.78 + (pxFinal - W * 0.78) * sweep, y: poolY };
    const I = sm(t, T.beamOn, T.beamOn + 0.8);
    const L = sm(t, T.beamOn, T.sweepStart + 0.3);
    const poolI = I * sm(t, T.sweepStart, T.sweepStart + 0.7);
    if (I <= 0) return;

    const dx = P.x - S.x;
    const dy = P.y - S.y;
    const len = Math.hypot(dx, dy);
    const n = { x: -dy / len, y: dx / len };
    const F = { x: S.x + dx * L * 1.12, y: S.y + dy * L * 1.12 };

    ctx.globalCompositeOperation = 'lighter';
    // haze around the source
    const hz = ctx.createRadialGradient(S.x, S.y, 0, S.x, S.y, Math.min(W, H) * 0.5);
    hz.addColorStop(0, `rgba(240,200,140,${0.28 * I})`);
    hz.addColorStop(1, 'rgba(240,200,140,0)');
    ctx.fillStyle = hz;
    ctx.fillRect(0, 0, W, H);

    // beam: stacked wedges, soft across, fading along
    const N = 9;
    const base = 0.055 * I;
    const wedge = (k: number) => {
      const fw = wP * 1.12 * (k / N);
      ctx.beginPath();
      ctx.moveTo(S.x - n.x * 10, S.y - n.y * 10);
      ctx.lineTo(S.x + n.x * 10, S.y + n.y * 10);
      ctx.lineTo(F.x + n.x * (fw + wP * 0.18), F.y + n.y * (fw + wP * 0.18));
      ctx.lineTo(F.x + n.x * (fw - wP * 0.18), F.y + n.y * (fw - wP * 0.18));
      ctx.closePath();
    };
    // runs all the way to the pool, fading past the horizon so it dissolves
    // into the pool glow with no edge
    const uH = len > 0 ? Math.max(0, Math.min(1, (floorY - S.y) / (P.y - S.y))) / 1.12 : 1;
    for (let k = -N; k <= N; k++) {
      const a = base * Math.pow(1 - (k / N) * (k / N), 1.6);
      const gg = ctx.createLinearGradient(S.x, S.y, F.x, F.y);
      gg.addColorStop(0, `rgba(245,210,150,${a})`);
      gg.addColorStop(0.4, `rgba(217,158,91,${a * 0.7})`);
      gg.addColorStop(Math.min(0.99, uH), `rgba(217,158,91,${a * 0.35})`);
      gg.addColorStop(1, 'rgba(217,158,91,0)');
      ctx.fillStyle = gg;
      wedge(k);
      ctx.fill();
    }

    // pool on the floor, lit only by radial glows: no straight edges
    if (poolI > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, floorY, W, H - floorY);
      ctx.clip();
      ctx.translate(P.x, poolY);
      ctx.scale(1, 0.34);
      const pg = ctx.createRadialGradient(wP * 0.15, 0, 0, 0, 0, wP * 1.25);
      pg.addColorStop(0, `rgba(255,228,185,${0.95 * poolI})`);
      pg.addColorStop(0.45, `rgba(217,158,91,${0.55 * poolI})`);
      pg.addColorStop(1, 'rgba(217,158,91,0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(0, 0, wP * 1.25, 0, 6.2832);
      ctx.fill();
      ctx.restore();
      const sp = ctx.createRadialGradient(P.x, poolY, 0, P.x, poolY, wP * 2.6);
      sp.addColorStop(0, `rgba(217,158,91,${0.16 * poolI})`);
      sp.addColorStop(1, 'rgba(217,158,91,0)');
      ctx.fillStyle = sp;
      ctx.fillRect(0, floorY, W, H - floorY);
    }

    // figure walking from the horizon down into the light, at an even pace
    const s = sm(t, T.figStart, T.figEnd);
    if (s > 0) {
      const fhFull = Math.min(380, Math.max(160, H * 0.36));
      const fh = fhFull * (0.78 + 0.22 * s);
      const fx = P.x - wP * 0.12 + wP * 0.12 * (1 - s);
      const feetY = floorY + (H - floorY) * 0.275 * s;
      // transparent until the feet are 20px past the horizon, then fades in
      // over the next ~50px of walking
      const alpha = sm(feetY - floorY, 20, 70) * poolI;
      ctx.globalCompositeOperation = 'source-over';
      // shadow thrown away from the source
      layer(0.55 * alpha, '#040302', (c) => {
        c.translate(fx - 13, feetY + 12);
        c.transform(1, 0, 1.15, -0.22, 0, 0);
        figure(c, fh);
      });
      layer(0.45 * alpha * alpha * alpha, '#f5cd96', (c) => {
        c.translate(fx + fh * 0.012, feetY - fh * 0.008);
        figure(c, fh);
      });
      layer(alpha, '#0a0806', (c) => {
        c.translate(fx, feetY);
        figure(c, fh);
      });
    }

    // dust in the beam
    ctx.globalCompositeOperation = 'lighter';
    for (const p of dust) {
      p.u += p.s * dt;
      p.ph += dt * 0.8;
      if (p.u > 1) {
        p.u = 0.05;
        p.v = Math.random() * 2 - 1;
      }
      if (p.u > L) continue;
      const wl = 10 + (wP * 1.1 - 10) * p.u;
      const vv = p.v + Math.sin(p.ph) * 0.04;
      const x = S.x + dx * p.u + n.x * vv * wl;
      const y = S.y + dy * p.u + n.y * vv * wl;
      if (y > poolY) continue;
      const a = I * (1 - vv * vv) * (0.25 + 0.25 * Math.sin(p.ph * 2.3)) * (1 - p.u * 0.5);
      ctx.fillStyle = `rgba(255,225,175,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  return { resize, draw };
}

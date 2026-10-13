/**
 * The Main Character splash intro, drawn on a canvas: a spotlight beam sweeps
 * onto a dark stage and a silhouette walks into the pool of light. A port of
 * the handoff's `class Component` (design_handoff_splash/, local only) with
 * its production defaults baked in: the "distance" entrance and no walk cycle.
 * Colours, timings and geometry are final from the design; keep them exact.
 * The interludes lower on the page reuse it with other subjects, a quicker
 * timeline and, on alternate rows, the scene mirrored.
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
  end: 7.8,
} as const;

/** The beats a stage itself draws; the hero's page and typing are DOM. */
export type StageTimeline = Record<
  'beamOn' | 'sweepStart' | 'sweepEnd' | 'figStart' | 'figEnd',
  number
>;

/** A quicker run of the same beats for the interludes lower on the page. */
export const INTERLUDE_TIMELINE = {
  beamOn: 0.2,
  sweepStart: 0.6,
  sweepEnd: 1.9,
  figStart: 2.1,
  figEnd: 3.6,
} as const;

/** What walks into the light: a shape standing on (0, 0), `h` tall. */
export type Subject = {
  draw: (c: CanvasRenderingContext2D, h: number) => void;
  /** Full height on a stage `H` tall. */
  height: (H: number) => number;
  /** Where the shadow starts, in px from the base: back (away from the
      light) and down. The figure's feet hide a gap that a wide or round
      base shows, so objects tuck theirs up under the base, where the body
      drawn over it hides the overlap. Defaults to the figure's. */
  shadowOffset?: { back: number; down: number };
  /** A soft contact shadow on the floor under the base, in units of the
      height: centre `x` and width `w`. Grounds objects whose base is too
      thin to cast a visible shadow of its own (a keyboard, a curved body). */
  contact?: { x: number; w: number };
  /** A faint second pass over the silhouette, such as a lit screen. */
  detail?: {
    color: string;
    alpha: number;
    draw: (c: CanvasRenderingContext2D, h: number) => void;
  };
};

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

/** Runs `fn` in unit space: (0, 0) on the floor, 1 tall, up is negative y. */
function unit(c: CanvasRenderingContext2D, h: number, fn: () => void) {
  c.save();
  c.scale(h, h);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  fn();
  c.restore();
}

function fillRound(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}

export const PERSON: Subject = {
  draw: figure,
  height: (H) => Math.min(380, Math.max(160, H * 0.36)),
};

/** A cat sitting side-on, tail swept out along the floor and curling up. */
export const CAT: Subject = {
  shadowOffset: { back: 0, down: -2 },
  contact: { x: 0.14, w: 0.95 },
  height: (H) => H * 0.27,
  draw: (c, h) =>
    unit(c, h, () => {
      // body: floor forward to a rounded front paw, up the full chest, over
      // the back and round the haunch
      c.beginPath();
      c.moveTo(0.26, 0);
      c.lineTo(-0.14, 0);
      c.bezierCurveTo(-0.22, 0.004, -0.31, 0, -0.31, -0.04);
      c.bezierCurveTo(-0.31, -0.085, -0.27, -0.095, -0.23, -0.085);
      c.bezierCurveTo(-0.19, -0.17, -0.2, -0.27, -0.24, -0.36);
      c.bezierCurveTo(-0.29, -0.47, -0.25, -0.6, -0.17, -0.64);
      c.lineTo(0, -0.66);
      c.bezierCurveTo(0.1, -0.52, 0.42, -0.42, 0.39, -0.15);
      c.bezierCurveTo(0.38, -0.05, 0.33, 0, 0.26, 0);
      c.closePath();
      c.fill();
      // head, with a little muzzle and two broad ears
      c.beginPath();
      c.ellipse(-0.1, -0.74, 0.16, 0.135, 0, 0, 6.2832);
      c.fill();
      c.beginPath();
      c.ellipse(-0.22, -0.7, 0.07, 0.055, 0, 0, 6.2832);
      c.fill();
      c.beginPath();
      c.moveTo(-0.25, -0.77);
      c.lineTo(-0.23, -0.99);
      c.lineTo(-0.1, -0.86);
      c.closePath();
      c.moveTo(-0.07, -0.86);
      c.lineTo(0.03, -0.99);
      c.lineTo(0.05, -0.78);
      c.closePath();
      c.fill();
      // tail out from under the haunch, along the floor, tip curling up
      c.lineWidth = 0.06;
      c.beginPath();
      c.moveTo(0.26, -0.06);
      c.bezierCurveTo(0.4, -0.01, 0.58, -0.02, 0.66, -0.09);
      c.bezierCurveTo(0.72, -0.15, 0.68, -0.23, 0.61, -0.22);
      c.stroke();
    }),
};

/** An acoustic guitar stood on its end, leaning a little. */
export const GUITAR: Subject = {
  shadowOffset: { back: 0, down: -2 },
  contact: { x: 0, w: 0.42 },
  height: (H) => H * 0.48,
  draw: (c, h) =>
    unit(c, h, () => {
      c.rotate(-0.1);
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(0.26, 0, 0.27, -0.3, 0.13, -0.34);
      c.bezierCurveTo(0.22, -0.4, 0.2, -0.6, 0, -0.6);
      c.bezierCurveTo(-0.2, -0.6, -0.22, -0.4, -0.13, -0.34);
      c.bezierCurveTo(-0.27, -0.3, -0.26, 0, 0, 0);
      c.fill();
      c.fillRect(-0.034, -0.91, 0.068, 0.33);
      c.beginPath();
      c.moveTo(-0.045, -0.9);
      c.lineTo(-0.055, -0.99);
      c.quadraticCurveTo(0, -1.02, 0.055, -0.99);
      c.lineTo(0.045, -0.9);
      c.closePath();
      c.fill();
      for (const y of [-0.92, -0.95, -0.98]) {
        c.fillRect(-0.08, y - 0.007, 0.03, 0.014);
        c.fillRect(0.05, y - 0.007, 0.03, 0.014);
      }
    }),
};

/** A desktop monitor on its stand, keyboard in front. */
export const COMPUTER: Subject = {
  shadowOffset: { back: 0, down: -2 },
  contact: { x: 0, w: 1.05 },
  height: (H) => H * 0.33,
  draw: (c, h) =>
    unit(c, h, () => {
      fillRound(c, -0.5, -1, 1, 0.66, 0.04);
      c.fillRect(-0.06, -0.36, 0.12, 0.28);
      c.beginPath();
      c.ellipse(0, -0.07, 0.24, 0.04, 0, 0, 6.2832);
      c.fill();
      fillRound(c, -0.34, -0.06, 0.68, 0.06, 0.02);
    }),
  /* The screen, faintly lit. */
  detail: {
    color: '#d99e5b',
    alpha: 0.14,
    draw: (c, h) => unit(c, h, () => fillRound(c, -0.45, -0.95, 0.9, 0.56, 0.02)),
  },
};

type StageOptions = {
  subject?: Subject;
  timeline?: StageTimeline;
  /** Flips the scene so the beam comes in from the left. */
  mirror?: boolean;
  /** Where the pool settles, as a fraction of the width from the far side. */
  poolX?: number;
  /** Scales the beam and pool width. */
  beamScale?: number;
};

export function createStage(
  canvas: HTMLCanvasElement,
  {
    subject = PERSON,
    timeline = TIMELINE,
    mirror = false,
    poolX = 0.19,
    beamScale = 1,
  }: StageOptions = {},
) {
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

  /** Device-pixel transform, flipped when the beam comes from the left. */
  function toDevice(c: CanvasRenderingContext2D) {
    c.setTransform(mirror ? -dpr : dpr, 0, 0, dpr, mirror ? W * dpr : 0, 0);
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
    toDevice(c);
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
    const T = timeline;
    toDevice(ctx);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#100d0b';
    ctx.fillRect(0, 0, W, H);
    const floorY = H * 0.7;
    ctx.fillStyle = '#15110e';
    ctx.fillRect(0, floorY, W, H - floorY);

    const wP = Math.min(300, Math.max(100, W * 0.15)) * beamScale;
    const S = { x: W + 80, y: -80 };
    const pxFinal = Math.max(wP * 1.1 + 12, W * poolX);
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
      const fhFull = subject.height(H);
      const fh = fhFull * (0.78 + 0.22 * s);
      const fx = P.x - wP * 0.12 + wP * 0.12 * (1 - s);
      const walk = (H - floorY) * 0.275;
      const feetY = floorY + walk * s;
      // transparent until the feet are 20px past the horizon, then fades in
      // over the next ~50px of walking; capped by the walk itself so the
      // figure always lands fully opaque on short stages
      const fadeEnd = Math.min(70, walk);
      const alpha = sm(feetY - floorY, Math.min(20, fadeEnd / 2), fadeEnd) * poolI;
      ctx.globalCompositeOperation = 'source-over';
      // shadow thrown away from the source
      const { back, down } = subject.shadowOffset ?? { back: 13, down: 12 };
      layer(0.55 * alpha, '#040302', (c) => {
        c.translate(fx - back, feetY + down);
        c.transform(1, 0, 1.15, -0.22, 0, 0);
        subject.draw(c, fh);
      });
      const { contact } = subject;
      if (contact) {
        const r = (contact.w * fh) / 2;
        ctx.save();
        ctx.translate(fx + contact.x * fh, feetY);
        ctx.scale(1, 0.1);
        const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        cg.addColorStop(0, `rgba(38,20,6,${0.75 * alpha})`);
        cg.addColorStop(0.6, `rgba(38,20,6,${0.35 * alpha})`);
        cg.addColorStop(1, 'rgba(38,20,6,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 6.2832);
        ctx.fill();
        ctx.restore();
      }
      layer(0.45 * alpha * alpha * alpha, '#f5cd96', (c) => {
        c.translate(fx + fh * 0.012, feetY - fh * 0.008);
        subject.draw(c, fh);
      });
      layer(alpha, '#17130e', (c) => {
        c.translate(fx, feetY);
        subject.draw(c, fh);
      });
      const { detail } = subject;
      if (detail) {
        layer(detail.alpha * alpha, detail.color, (c) => {
          c.translate(fx, feetY);
          detail.draw(c, fh);
        });
      }
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

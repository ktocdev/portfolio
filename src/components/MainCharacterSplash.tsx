'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MC_SPLASH } from '@/content/mainCharacter';
import {
  CAT,
  COMPUTER,
  createStage,
  GUITAR,
  INTERLUDE_TIMELINE,
  type Subject,
  TIMELINE,
} from '@/lib/mainCharacterStage';
import { prefersReducedMotion } from '@/lib/motion';

import styles from './MainCharacterSplash.module.css';

const { hero, about, features, how, demo, start } = MC_SPLASH;

/* Typing cadence, in seconds per character. */
const PER_CHAR = 0.075;

type View = {
  typed: string;
  caret: boolean;
  pageOn: boolean;
  done: boolean;
};

/** Everything the DOM shows, derived from the intro clock. */
function viewAt(t: number): View {
  const T = TIMELINE;
  const n = Math.min(hero.title.length, Math.max(0, Math.floor((t - T.typeStart) / PER_CHAR)));
  return {
    typed: hero.title.slice(0, n),
    caret: t >= T.pageStart && t < T.end,
    pageOn: t >= T.pageStart,
    done: t >= T.end,
  };
}

function sameView(a: View, b: View) {
  return (
    a.typed === b.typed &&
    a.caret === b.caret &&
    a.pageOn === b.pageOn &&
    a.done === b.done
  );
}

const blockScroll = (e: Event) => e.preventDefault();

/* Counts as fully in view: a hair under 1 so subpixel layout still fires. */
const FULL = 0.98;

/**
 * A short stage between the lower sections: the same beam and pool as the
 * intro, with another subject walking in. It waits in the dark until the
 * whole row is on screen, then plays once. The hero's beam comes from the
 * right, so the rows alternate starting from the left.
 */
function Interlude({ subject, from }: { subject: Subject; from: 'left' | 'right' }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const canvas = canvasRef.current;
    if (!row || !canvas) return;

    const stage = createStage(canvas, {
      subject,
      timeline: INTERLUDE_TIMELINE,
      mirror: from === 'left',
      poolX: 0.24,
      beamScale: 0.75,
    });
    const ro = new ResizeObserver(() => {
      const r = row.getBoundingClientRect();
      stage.resize(r.width, r.height);
    });
    ro.observe(row);

    /* Reduced motion starts at the end state, but still waits to be seen. */
    const reduced = prefersReducedMotion();
    let start: number | null = null;
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = start === null ? -1 : reduced ? INTERLUDE_TIMELINE.figEnd + 1 : (now - start) / 1000;
      stage.draw(t, dt);
    };

    /* Paint only while on screen. A row taller than the viewport counts as
       fully in view once it fills it. */
    const io = new IntersectionObserver(
      ([entry]) => {
        const fills =
          entry.rootBounds !== null &&
          entry.intersectionRect.height >= entry.rootBounds.height * FULL;
        if (start === null && (entry.intersectionRatio >= FULL || fills)) {
          start = performance.now();
        }
        if (entry.isIntersecting && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: [0, 0.5, FULL, 1] },
    );
    io.observe(row);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [subject, from]);

  return (
    <div ref={rowRef} className={styles.interlude} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

/**
 * The Main Character landing page: a cinematic canvas intro (spotlight,
 * silhouette, typed title card) over a short "how it works" section. The
 * intro holds the page at the top until it ends or is skipped; reduced
 * motion, or arriving on an anchor like #demo, skips it outright.
 */
export default function MainCharacterSplash() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skipped = useRef(false);
  const locked = useRef(false);
  const [view, setView] = useState<View>(() => viewAt(-1));

  const unlock = useCallback(() => {
    if (!locked.current) return;
    locked.current = false;
    removeEventListener('wheel', blockScroll);
    removeEventListener('touchmove', blockScroll);
  }, []);

  const skip = useCallback(() => {
    skipped.current = true;
    unlock();
  }, [unlock]);

  useEffect(() => {
    const heroEl = heroRef.current;
    const canvas = canvasRef.current;
    if (!heroEl || !canvas) return;

    const stage = createStage(canvas);
    const ro = new ResizeObserver(() => {
      const r = heroEl.getBoundingClientRect();
      stage.resize(r.width, r.height);
    });
    ro.observe(heroEl);

    /* Once the page is scrolled past the stage, stop painting it. */
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(heroEl);

    if (prefersReducedMotion() || location.hash) {
      skipped.current = true;
    } else {
      locked.current = true;
      window.scrollTo(0, 0);
      addEventListener('wheel', blockScroll, { passive: false });
      addEventListener('touchmove', blockScroll, { passive: false });
    }

    const t0 = performance.now();
    let last = t0;
    let raf = requestAnimationFrame(function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = skipped.current ? TIMELINE.end + 1 : (now - t0) / 1000;
      const next = viewAt(t);
      if (next.done) unlock();
      setView((prev) => (sameView(prev, next) ? prev : next));
      if (onScreen) stage.draw(t, dt);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      unlock();
    };
  }, [unlock]);

  return (
    <div className={styles.splash} data-mc-splash="">
      <section ref={heroRef} className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        <div className={styles.overlay}>
          <div className={styles.card} data-on={view.pageOn || undefined} data-mc-card="">
            <p className={styles.cardEyebrow}>{hero.eyebrow}</p>
            {/* The full text is there for assistive tech and search from the
                start; the typed copy is decoration over it. */}
            <h1 className={styles.title}>
              <img src="/main-character/mc-circle.svg" className={styles.titleMark} alt="" />
              <span className="visuallyHidden" data-mc-full="">
                {hero.title}
              </span>
              <span aria-hidden="true" data-mc-typed="">
                {view.typed}
                {view.caret && <span className={styles.caret}>▍</span>}
              </span>
            </h1>
            <nav className={styles.cardNav} aria-label="Main Character">
              {hero.nav.map((item, i) => (
                <a key={item.href} href={item.href} className={styles.cardLink}>
                  {item.label}
                  <span className={styles.cardLeader} aria-hidden="true" />
                  <span className={styles.cardNum}>{i + 1}</span>
                </a>
              ))}
            </nav>
            <p className={styles.folio} aria-hidden="true">
              {hero.folio}
            </p>
          </div>
        </div>

        <div className={styles.hint} data-on={view.done || undefined} aria-hidden="true">
          {hero.scrollHint}
        </div>
      </section>

      {!view.done && (
        <button type="button" className={styles.skip} onClick={skip} data-mc-skip="">
          {hero.skip}
        </button>
      )}

      <section id="what" className={styles.about}>
        <div className={styles.aboutInner}>
          <div className={styles.block}>
            <h2 className={styles.eyebrow}>{about.eyebrow}</h2>
            <p className={styles.lead}>{about.lead}</p>
            <p className={styles.body}>{about.body}</p>
          </div>

          <div className={styles.features}>
            {features.map((f) => (
              <div key={f.title} className={styles.feature}>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        <Interlude subject={CAT} from="left" />

        <div className={styles.aboutInner}>
          <div id="how" className={styles.block}>
            <h2 className={styles.eyebrow}>{how.eyebrow}</h2>
            <ol className={styles.steps}>
              {how.steps.map((step, i) => (
                <li key={step.title} className={styles.step}>
                  <span className={styles.stepNum} aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className={styles.feature}>
                    <h3 className={styles.featureTitle}>{step.title}</h3>
                    <p className={styles.featureBody}>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className={styles.body}>{how.note}</p>
            <p className={styles.body}>
              <a href={how.link.href} className={styles.textLink}>
                {how.link.label} <span aria-hidden="true">→</span>
              </a>
            </p>
          </div>
        </div>

        <Interlude subject={GUITAR} from="right" />

        <div className={styles.aboutInner}>
          <div id="demo" className={`${styles.block} ${styles.demoCard}`}>
            <h2 className={styles.eyebrow}>{demo.eyebrow}</h2>
            <p className={styles.lead}>{demo.body}</p>
            <ul className={styles.demoFacts}>
              {demo.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            {/* Things to try, not a sequence to learn: a grid of actions,
                each tagged with the control it uses. */}
            <ol className={styles.demoSteps}>
              {demo.steps.map((step) => (
                <li key={step.title} className={styles.demoStep}>
                  <span className={styles.demoUi}>{step.ui}</span>
                  <h3 className={styles.demoStepTitle}>{step.title}</h3>
                  <p className={styles.featureBody}>{step.body}</p>
                </li>
              ))}
            </ol>
            <div>
              {/* The demo is a separate static app, not a Next route, so a
                  plain link (full page load) rather than next/link. */}
              <a href={demo.cta.href} className={styles.secondary}>
                {demo.cta.label}
              </a>
            </div>
          </div>
        </div>

        <Interlude subject={COMPUTER} from="left" />

        <div className={styles.aboutInner}>
          <div id="start" className={styles.block}>
            <h2 className={styles.eyebrow}>{start.eyebrow}</h2>
            <p className={styles.body}>{start.body}</p>
            <div>
              <a href={start.cta.href} className={styles.primary}>
                {start.cta.label}
              </a>
            </div>
          </div>

          <footer className={styles.footer}>
            <img src="/main-character/mc-circle-128.png" width={28} height={28} alt="" />
            <span className={styles.wordmark}>{MC_SPLASH.wordmark}</span>
          </footer>
        </div>
      </section>
    </div>
  );
}

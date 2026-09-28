'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MC_SPLASH } from '@/content/mainCharacter';
import { createStage, TIMELINE } from '@/lib/mainCharacterStage';
import { prefersReducedMotion } from '@/lib/motion';

import styles from './MainCharacterSplash.module.css';

const { hero, about, features, how, demo, start } = MC_SPLASH;

/* Typing cadence, in seconds per character, and the pause between lines. */
const PER_CHAR_1 = 0.075;
const PER_CHAR_2 = 0.06;
const LINE_GAP = 0.4;

type View = {
  line1: string;
  line2: string;
  /** Which line the caret sits on; 0 hides it. */
  caret: 0 | 1 | 2;
  pageOn: boolean;
  done: boolean;
};

/** Everything the DOM shows, derived from the intro clock. */
function viewAt(t: number): View {
  const T = TIMELINE;
  const n1 = Math.min(hero.title.length, Math.max(0, Math.floor((t - T.typeStart) / PER_CHAR_1)));
  const t2 = T.typeStart + hero.title.length * PER_CHAR_1 + LINE_GAP;
  const n2 = Math.min(hero.subtitle.length, Math.max(0, Math.floor((t - t2) / PER_CHAR_2)));
  const caretOn = t >= T.pageStart && t < T.end;
  return {
    line1: hero.title.slice(0, n1),
    line2: hero.subtitle.slice(0, n2),
    caret: caretOn ? (n2 === 0 && t < t2 ? 1 : 2) : 0,
    pageOn: t >= T.pageStart,
    done: t >= T.end,
  };
}

function sameView(a: View, b: View) {
  return (
    a.line1 === b.line1 &&
    a.line2 === b.line2 &&
    a.caret === b.caret &&
    a.pageOn === b.pageOn &&
    a.done === b.done
  );
}

const blockScroll = (e: Event) => e.preventDefault();

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

  const caret = <span className={styles.caret}>▍</span>;

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
              <span className="visuallyHidden" data-mc-full="">
                {hero.title}
              </span>
              <span aria-hidden="true" data-mc-typed="">
                {view.line1}
                {view.caret === 1 && caret}
              </span>
            </h1>
            <p className={styles.subtitle}>
              <span className="visuallyHidden" data-mc-full="">
                {hero.subtitle}
              </span>
              <span aria-hidden="true" data-mc-typed="">
                {view.line2}
                {view.caret === 2 && caret}
              </span>
            </p>
            <nav className={styles.cardNav} aria-label="Main Character">
              {hero.nav.map((item, i) => (
                <a key={item.href} href={item.href} className={styles.cardLink}>
                  <span className={styles.cardNum}>{i + 1}</span>
                  {item.label}
                </a>
              ))}
            </nav>
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

          <div id="demo" className={styles.block}>
            <h2 className={styles.eyebrow}>{demo.eyebrow}</h2>
            <p className={styles.body}>{demo.body}</p>
            <div>
              {/* The demo is a separate static app, not a Next route, so a
                  plain link (full page load) rather than next/link. */}
              <a href={demo.cta.href} className={styles.secondary}>
                {demo.cta.label}
              </a>
            </div>
          </div>

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

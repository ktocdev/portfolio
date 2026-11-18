'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

import { PILE_DEAL, PILE_SETTLE, prefersReducedMotion } from '@/lib/motion';
import type { PhotoPileControl } from '@/lib/photoPile';
import styles from './PhotoPile.module.css';

export type PilePhoto = { src: string; alt: string; width: number; height: number };

type PhotoPileProps = {
  photos: PilePhoto[];
  /** The photo at the bottom of the pile — the homepage's headshot. */
  children: React.ReactNode;
};

/* Where each print comes to rest over the one below: an offset in px from the
   pile's centre and a tilt in degrees. No two in a row lean or drift the same
   way, so every print leaves an edge showing past the next. Past six the
   pattern repeats, which still reads as a pile. */
const SPOTS = [
  { x: 16, y: -8, r: 4 },
  { x: -18, y: 10, r: -5 },
  { x: 8, y: 14, r: 2 },
  { x: -12, y: -12, r: -3 },
  { x: 20, y: 6, r: 6 },
  { x: -6, y: -4, r: -6.5 },
];

/* Phone shots stand taller than the headshot and panoramas run wider; past
   these the print crops. The cap sits under the headshot's 1.6, so even a
   wide print leaves the headshot's ends showing. */
const ASPECT = { min: 0.7, max: 1.45 };

/* Wheel travel that counts as a flip, in px (line-mode wheels are scaled to
   match), and how long the wheel must rest before the next flip may start.
   The rest is what makes a trackpad swipe one flip: its inertia keeps
   sending events long after the finger lifts. A mouse's notches come further
   apart than this, so each one flips. */
const FLIP_TRAVEL = 30;
const WHEEL_REST_MS = 160;
const LINE_PX = 16;

/**
 * Prints dropped one by one onto the headshot, each landing a little
 * differently, then flipped through with the mouse wheel. enterPage() starts
 * the deal (PILE_DEAL) once the headshot is tossed in; the first wheel turn
 * ends it and takes over (photoPile.ts). Without motion only the headshot
 * shows, and the pile is a button: each click (or wheel turn) lays the next
 * photo on top, no animation.
 *
 * The wheel flips over the pile, and anywhere else once the pile is fully in
 * view and the page can't scroll any further that way — everywhere, on a
 * homepage that fits the screen as it is meant to. A page that does scroll (a
 * short window, the cookie banner's clearance) scrolls first.
 *
 * Each photo is two boxes: the holder keeps where it rests and its place in
 * the stack, the photo inside is what GSAP throws, so a toss can clear its
 * own styles without losing either.
 */
export default function PhotoPile({ photos, children }: PhotoPileProps) {
  const pile = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = pile.current;
    if (!element || !photos.length) return;
    const cards = [...element.children].map((holder) => ({
      holder: holder as HTMLElement,
      photo: holder.firstElementChild as HTMLElement,
    }));

    let disposed = false;
    let control: PhotoPileControl | null = null;
    const motion = !prefersReducedMotion();
    /* Loaded on mount: the entrance has usually fetched GSAP by now. */
    const ready = import('@/lib/photoPile').then(({ photoPile }) => {
      if (disposed) return null;
      control = photoPile(cards, { motion });
      return control;
    });

    /* Bottom photo to the top: after the prints, the headshot comes round. */
    const next = () => control?.step(-1);
    const onClick = () => next();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      next();
    };
    if (!motion) {
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
      element.setAttribute('aria-label', 'Show another photo');
      element.addEventListener('click', onClick);
      element.addEventListener('keydown', onKey);
    }

    let wheeled = false;
    let travel = 0;
    let lastWheel = 0;
    let busyUntil = 0;

    /* Hidden in the event's own frame, so no print shows at rest before
       its toss even if the module is still on its way. */
    const onDeal = () => {
      if (wheeled) return;
      cards.slice(1).forEach(({ photo }) => (photo.style.visibility = 'hidden'));
      ready.then((pileControl) => {
        if (!wheeled) pileControl?.deal();
        else cards.forEach(({ photo }) => photo.style.removeProperty('visibility'));
      });
    };

    /* The entrance was skipped or cut short (enterPage in motion.ts): every
       print down, no deal. Queued after any deal still waiting on the module. */
    const onSettle = () => {
      if (!motion) return;
      cards.slice(1).forEach(({ photo }) => photo.style.removeProperty('visibility'));
      ready.then((pileControl) => pileControl?.settle());
    };

    const pageCanScroll = (down: boolean) => {
      const page = document.scrollingElement ?? document.documentElement;
      return down ? page.scrollTop + page.clientHeight < page.scrollHeight - 1 : page.scrollTop > 0;
    };
    const pileInView = () => {
      const { top, bottom } = element.getBoundingClientRect();
      return top >= 0 && bottom <= window.innerHeight;
    };

    const onWheel = (event: WheelEvent) => {
      /* ctrl+wheel is zoom (and a trackpad pinch); sideways is not a flip. */
      if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      const overPile = element.contains(event.target as Node);
      if (!overPile && (!pileInView() || pageCanScroll(event.deltaY > 0))) return;
      event.preventDefault();
      if (!control) return;

      const now = performance.now();
      const resting = now - lastWheel > WHEEL_REST_MS;
      lastWheel = now;
      if (resting) travel = 0;
      if (travel === Infinity || now < busyUntil) return;

      travel += event.deltaY * (event.deltaMode === 1 ? LINE_PX : 1);
      if (Math.abs(travel) < FLIP_TRAVEL) return;

      wheeled = true;
      busyUntil = now + control.step(travel > 0 ? 1 : -1);
      /* Spent until the wheel rests. */
      travel = Infinity;
    };

    element.addEventListener(PILE_DEAL, onDeal);
    element.addEventListener(PILE_SETTLE, onSettle);
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      disposed = true;
      element.removeEventListener(PILE_DEAL, onDeal);
      element.removeEventListener(PILE_SETTLE, onSettle);
      window.removeEventListener('wheel', onWheel);
      element.removeEventListener('click', onClick);
      element.removeEventListener('keydown', onKey);
      control?.destroy();
    };
  }, [photos]);

  return (
    <div ref={pile} className={styles.pile} data-photo-pile="">
      <div className={`${styles.card} ${styles.base}`}>{children}</div>
      {photos.map((photo, i) => {
        const spot = SPOTS[i % SPOTS.length];
        const aspect = Math.min(ASPECT.max, Math.max(ASPECT.min, photo.width / photo.height));
        return (
          <div
            key={photo.src}
            className={`${styles.card} ${styles.spot}`}
            style={
              {
                '--x': `${spot.x}px`,
                '--y': `${spot.y}px`,
                '--r': `${spot.r}deg`,
                aspectRatio: aspect,
              } as React.CSSProperties
            }
          >
            <figure className={styles.print}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading="eager"
                sizes="(max-width: 48rem) 90vw, 36rem"
                className={styles.image}
              />
            </figure>
          </div>
        );
      })}
    </div>
  );
}

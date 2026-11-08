'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

import type { Story } from '@/content/projects';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './PhotoTable.module.css';

gsap.registerPlugin(Flip);

type PhotoTableProps = {
  stories: Story[];
  note?: string;
};

/* Where each photo lies on the table, as the centre of the card in percent of
   the table's width and height, and its tilt in degrees. A loose cluster in
   three rows, never a grid: no two neighbours share a tilt direction. Earlier
   photos lie on top (see the inline z-index), so a caption overlaps the
   empty upper part of the print below it, never the figure at its foot. Past
   eight stories the layout repeats, shifted, which still reads as a pile. */
const SPOTS = [
  { x: 19, y: 16, r: -6 },
  { x: 50, y: 13, r: 3 },
  { x: 81, y: 18, r: 7 },
  { x: 17, y: 50, r: 4 },
  { x: 49, y: 47, r: -3 },
  { x: 82, y: 52, r: -5 },
  { x: 33, y: 84, r: -2 },
  { x: 66, y: 86, r: 5 },
];

/* Matches the @container query in PhotoTable.module.css: at and above this the
   photos are scattered on a table; below it they stack. */
const TABLE_MIN_PX = 34 * 16;

/* How far a hovered photo shoves its neighbours, and an open one shoves the
   rest, in px at point-blank range. Further cards move less. */
const NUDGE = 30;
const SHOVE = 64;
/* The table's side margin in PhotoTable.module.css (1.25rem): how far a
   shoved photo may hang past the table's edge. */
const EDGE = 20;

function spot(i: number) {
  const base = SPOTS[i % SPOTS.length];
  const lap = Math.floor(i / SPOTS.length);
  return { x: base.x + lap * 4, y: base.y + lap * 3, r: base.r };
}

/** A card's resting centre in the table's coordinates. offsetLeft/Top ignore
 * transforms, so this is where it lies, not where a push has moved it. */
function centre(card: HTMLElement) {
  return { x: card.offsetLeft + card.offsetWidth / 2, y: card.offsetTop + card.offsetHeight / 2 };
}

/**
 * The case study's stories as instant photos on a table. Hovering one lifts it
 * toward the viewer and nudges its neighbours aside; clicking picks it up,
 * straightened and enlarged to read, while the rest are pushed out of its
 * way. Narrow tables stack the photos instead, and each opens in place.
 *
 * Every photo is a disclosure (a button with aria-expanded over a region), so
 * the table is only a presentation: keyboard and screen-reader users get the
 * same stories in source order.
 */
export default function PhotoTable({ stories, note }: PhotoTableProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLUListElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const faces = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [scattered, setScattered] = useState(false);
  /* The last photo touched stays on top of the pile, as a real one would. */
  const topZ = useRef(stories.length);
  /* Captured just before an open or close commits; played after it. */
  const flipState = useRef<Flip.FlipState | null>(null);
  const closing = useRef<number | null>(null);

  const motion = () => !prefersReducedMotion();
  const allCards = () => cards.current.filter((card): card is HTMLLIElement => !!card);

  /* Layout effect so the mode is known before the first paint, which the toss
     below depends on. */
  useLayoutEffect(() => {
    /* The query container, not the list: the list's own margins would put
       the two thresholds a few pixels apart. */
    const element = wrap.current;
    if (!element) return;
    const measure = () => setScattered(element.clientWidth >= TABLE_MIN_PX);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /* Entering the table, the photos are tossed down one after another. Leaving
     it (the table narrowed to a stack), GSAP hands every transform back to the
     CSS. */
  useLayoutEffect(() => {
    const list = allCards();
    if (!scattered) {
      gsap.set(list, { clearProps: 'transform,--lift' });
      list.forEach((card, i) => gsap.set(card, { zIndex: stories.length - i }));
      return;
    }
    list.forEach((card, i) => gsap.set(card, { rotation: spot(i).r }));
    if (!motion()) return;
    const toss = gsap.from(list, {
      x: 40,
      y: -90,
      rotation: '+=10',
      scale: 1.15,
      autoAlpha: 0,
      '--lift': 1,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.07,
    });
    return () => {
      toss.progress(1).kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scattered]);

  function raise(card: HTMLElement) {
    topZ.current += 1;
    gsap.set(card, { zIndex: topZ.current });
  }

  /** Everything back to where it lies, except the open photo. */
  function settle() {
    allCards().forEach((card, i) => {
      if (i === open) return;
      gsap.to(card, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: spot(i).r,
        '--lift': 0,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
  }

  /** Lifts photo i toward the viewer and nudges the others away from it. */
  function lift(i: number) {
    if (!scattered || !motion()) return;
    const list = allCards();
    const card = list[i];
    if (!card) return;

    if (open !== null) {
      /* Only the edges of the others show past the open photo; a small rise
         says they can still be picked up. */
      if (i !== open) gsap.to(card, { scale: 0.96, '--lift': 0.3, duration: 0.3, overwrite: 'auto' });
      return;
    }

    raise(card);
    gsap.to(card, {
      x: 0,
      y: -8,
      scale: 1.14,
      rotation: spot(i).r * 0.25,
      '--lift': 0.7,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });

    const from = centre(card);
    const reach = (table.current?.clientWidth ?? 600) * 0.75;
    list.forEach((other, j) => {
      if (j === i) return;
      const to = centre(other);
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.hypot(dx, dy) || 1;
      const push = NUDGE * Math.max(0.2, 1 - distance / reach);
      gsap.to(other, {
        x: (dx / distance) * push,
        y: (dy / distance) * push,
        scale: 1,
        /* Knocked a little further round the way it already leans. */
        rotation: spot(j).r * 1.2,
        '--lift': 0,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
  }

  /** While held, the photo leans after the pointer, as if under a fingertip. */
  function lean(i: number, event: React.PointerEvent) {
    if (!scattered || open !== null || event.pointerType !== 'mouse' || !motion()) return;
    const card = cards.current[i];
    if (!card) return;
    const box = card.getBoundingClientRect();
    const nx = ((event.clientX - box.left) / box.width) * 2 - 1;
    const ny = ((event.clientY - box.top) / box.height) * 2 - 1;
    gsap.to(card, {
      x: nx * 6,
      y: ny * 6 - 8,
      rotation: spot(i).r * 0.25 + nx * 2,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }

  function toggle(i: number) {
    const next = open === i ? null : i;
    if (motion()) {
      /* Scattered, only the photos changing hands need the Flip — the rest
         are shoved by hand. Stacked, opening one moves every card below it. */
      const targets = scattered
        ? [i, open].flatMap((k) => (k === null ? [] : [cards.current[k]]))
        : allCards();
      flipState.current = Flip.getState(targets, { props: '--lift' });
    }
    closing.current = open;
    setOpen(next);
  }

  /* The open photo grows to fit its text, and on a scattered table it may be
     taller than the table, which then grows to hold it. */
  useLayoutEffect(() => {
    const element = table.current;
    const state = flipState.current;
    flipState.current = null;
    const was = closing.current;
    closing.current = null;
    if (!element) return;

    const card = open === null ? null : cards.current[open];
    const wasCard = was === null ? null : cards.current[was];

    /* The table's height once this settles; positions are worked out
       against it, since a growing table carries the photos down with it. */
    let height = element.offsetHeight;
    if (scattered) {
      const before = element.offsetHeight;
      element.style.removeProperty('height');
      const base = element.offsetHeight;
      const target = card ? Math.max(base, card.offsetHeight + 24) : base;
      height = target;
      if (motion() && state) {
        gsap.fromTo(
          element,
          { height: before },
          {
            height: target,
            duration: 0.65,
            ease: 'power3.inOut',
            onComplete: () => {
              if (target === base) element.style.removeProperty('height');
            },
          },
        );
      } else if (target !== base) {
        element.style.height = `${target}px`;
      }
    }

    if (!state || !motion()) {
      if (scattered) {
        if (card) gsap.set(card, { x: 0, y: 0, scale: 1, rotation: 0, zIndex: 1000 });
        if (wasCard && was !== null) gsap.set(wasCard, { rotation: spot(was).r, zIndex: topZ.current });
      }
      return;
    }

    if (scattered) {
      /* Flip plays from the captured state to whatever is set now, so set
         the end of each move first: the open photo square to the table, the
         closing one back at its tilt. */
      if (wasCard && was !== null) {
        raise(wasCard);
        gsap.set(wasCard, { x: 0, y: 0, scale: 1, rotation: spot(was).r, '--lift': 0 });
      }
      if (card) gsap.set(card, { x: 0, y: 0, scale: 1, rotation: 0, zIndex: 1000, '--lift': 0.9 });

      const flip = Flip.from(state, {
        duration: 0.65,
        ease: 'power3.inOut',
        /* Width and height, not scale, so the caption is never squashed. */
        scale: false,
      });

      /* The rest are pushed out from under the open photo, or come back.
         None is pushed past the table's foot, onto the note below it, or
         far over its head, onto the hint. */
      const others = allCards().filter((other) => other !== card && other !== wasCard);
      if (card) {
        const from = { x: centre(card).x, y: card.offsetHeight / 2 };
        others.forEach((other) => {
          const index = cards.current.indexOf(other);
          const to = { x: centre(other).x, y: (spot(index).y / 100) * height };
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const distance = Math.hypot(dx, dy) || 1;
          const room = Math.max(0, height - to.y - other.offsetHeight / 2);
          const headroom = -Math.max(0, to.y - other.offsetHeight / 2 + EDGE);
          /* Sideways, no further than the table's own margin. */
          const half = other.offsetWidth / 2;
          const left = -Math.max(0, to.x - half + EDGE);
          const right = Math.max(0, element.clientWidth + EDGE - to.x - half);
          gsap.to(other, {
            x: gsap.utils.clamp(left, right, (dx / distance) * SHOVE),
            y: gsap.utils.clamp(headroom, room, (dy / distance) * SHOVE),
            scale: 0.92,
            rotation: spot(index).r * 1.4,
            '--lift': 0,
            duration: 0.65,
            ease: 'power3.inOut',
            overwrite: 'auto',
          });
        });
      } else {
        settle();
      }

      return () => {
        flip.progress(1).kill();
      };
    }

    /* GSAP cached each card's transform when the state was taken; cleared, it
       reads the end of the move from the new CSS instead of the old tilt. */
    gsap.set(allCards(), { clearProps: 'transform' });
    const flip = Flip.from(state, { duration: 0.5, ease: 'power2.inOut', scale: false });
    return () => {
      flip.progress(1).kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* The open photo's text fades up once it is in hand. */
  useEffect(() => {
    if (open === null || !motion()) return;
    const body = cards.current[open]?.querySelector(`.${styles.body}`);
    if (!body) return;
    const tween = gsap.from(body, { autoAlpha: 0, y: 8, duration: 0.35, delay: 0.3, ease: 'power2.out' });
    return () => {
      tween.progress(1).kill();
    };
  }, [open]);

  /* Escape puts the open photo back and returns focus to it. */
  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const face = faces.current[open];
      toggle(open);
      face?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={wrap} className={styles.wrap}>
      <p className={styles.hint} aria-hidden="true">
        {scattered ? 'Hover a photo to lift it. Click to read it.' : 'Tap a photo to read it.'}
      </p>

      <ul
        ref={table}
        role="list"
        aria-label="Case study stories"
        className={styles.table}
        data-has-open={open !== null || undefined}
        onPointerLeave={() => {
          if (scattered && open === null && motion()) settle();
        }}
        onPointerDown={(event) => {
          /* A click on the bare table puts the open photo down. */
          if (event.target === table.current && open !== null) toggle(open);
        }}
        onBlur={(event) => {
          if (open === null && !table.current?.contains(event.relatedTarget as Node | null)) {
            if (scattered && motion()) settle();
          }
        }}
      >
        {stories.map((story, i) => {
          const { x, y, r } = spot(i);
          const isOpen = open === i;
          const bodyId = `story-${i}-body`;

          return (
            <li
              key={story.title}
              ref={(el) => {
                cards.current[i] = el;
              }}
              className={styles.card}
              data-open={isOpen || undefined}
              style={
                {
                  '--x': `${x}%`,
                  '--y': `${y}%`,
                  '--r': `${r}deg`,
                  zIndex: stories.length - i,
                } as React.CSSProperties
              }
              onPointerEnter={() => lift(i)}
              onPointerMove={(event) => lean(i, event)}
              onPointerLeave={(event) => {
                if (scattered && open !== null && !isOpen && motion()) {
                  gsap.to(event.currentTarget, { scale: 0.92, '--lift': 0, duration: 0.3, overwrite: 'auto' });
                }
              }}
            >
              <button
                type="button"
                ref={(el) => {
                  faces.current[i] = el;
                }}
                className={styles.face}
                aria-expanded={isOpen}
                aria-controls={bodyId}
                onClick={() => toggle(i)}
                onFocus={() => lift(i)}
              >
                <span className={styles.print}>
                  <span className={styles.figure}>{story.figure}</span>
                  <span className={styles.figureLabel}>{story.figureLabel}</span>
                </span>
                <span className={styles.caption}>
                  <span className={styles.group}>{story.group}</span>
                  <span className={styles.title}>{story.title}</span>
                </span>
              </button>

              <div id={bodyId} className={styles.body} hidden={!isOpen}>
                <ul className={styles.points}>
                  {story.points.map((point) => (
                    <li key={point.text}>
                      {point.text}
                      {point.link ? (
                        <>
                          {' '}
                          <a href={point.link.href} target="_blank" rel="noopener" className={styles.link}>
                            {point.link.label} <span aria-hidden="true">↗</span>
                            <span className="visuallyHidden"> (opens in a new tab)</span>
                          </a>
                        </>
                      ) : null}
                      {point.subs?.length ? (
                        <ul className={styles.subs}>
                          {point.subs.map((sub) => (
                            <li key={sub}>{sub}</li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={styles.putBack}
                  onClick={() => {
                    toggle(i);
                    /* This button is about to be hidden; focus goes back to
                       the photo it closed. */
                    faces.current[i]?.focus();
                  }}
                >
                  Put it back
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}

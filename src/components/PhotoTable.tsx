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

/* Each photo's lean in the narrow stack, in degrees (the CSS takes a third of
   it). No two neighbours lean the same way. */
const TILTS = [-6, 3, 7, 4, -3, -5, -2, 5];

/* Matches the @container query in PhotoTable.module.css: at and above this the
   photos lie on a grid; below it they stack. */
const GRID_MIN_PX = 34 * 16;

/** Stories in rows by their group, in order of first appearance, each keeping
 * its index in `stories`. */
function rows(stories: Story[]) {
  const byGroup = new Map<string, { story: Story; index: number }[]>();
  stories.forEach((story, index) => {
    const row = byGroup.get(story.group) ?? [];
    row.push({ story, index });
    byGroup.set(story.group, row);
  });
  return [...byGroup];
}

/**
 * The case study's stories as instant photos, a row per group under the
 * group's name. Hovering one lifts it toward the viewer; clicking opens it
 * across its row, enlarged to read, and the rest of the row moves down out of
 * its way. Narrow tables stack each row's photos instead, and each opens in
 * place.
 *
 * Every photo is a disclosure (a button with aria-expanded over a region), so
 * the layout is only a presentation: keyboard and screen-reader users get the
 * same stories in source order.
 */
export default function PhotoTable({ stories, note }: PhotoTableProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const faces = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(() => {
    const index = stories.findIndex((story) => story.open);
    return index === -1 ? null : index;
  });
  const [gridded, setGridded] = useState(false);
  /* The last photo touched stays on top, as a real one would. */
  const topZ = useRef(stories.length);
  /* Captured just before an open or close commits; played after it. */
  const flipState = useRef<Flip.FlipState | null>(null);

  const motion = () => !prefersReducedMotion();
  const allCards = () => cards.current.filter((card): card is HTMLLIElement => !!card);

  /* Layout effect so the mode is known before the first paint, which the toss
     below depends on. */
  useLayoutEffect(() => {
    const element = wrap.current;
    if (!element) return;
    const measure = () => setGridded(element.clientWidth >= GRID_MIN_PX);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /* Entering the grid, the photos are tossed down one after another. Leaving
     it (the table narrowed to a stack), GSAP hands every transform back to the
     CSS. */
  useLayoutEffect(() => {
    const list = allCards();
    gsap.set(list, { clearProps: 'transform,--lift' });
    list.forEach((card, i) => gsap.set(card, { zIndex: stories.length - i }));
    if (!gridded || !motion()) return;
    const toss = gsap.from(list, {
      x: 40,
      y: -90,
      rotation: 10,
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
  }, [gridded]);

  /** Lifts photo i toward the viewer. */
  function lift(i: number) {
    if (!gridded || i === open || !motion()) return;
    const card = cards.current[i];
    if (!card) return;
    topZ.current += 1;
    gsap.set(card, { zIndex: topZ.current });
    gsap.to(card, {
      x: 0,
      y: -6,
      scale: 1.06,
      rotation: 0,
      '--lift': 0.6,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }

  /** Back down flat in its cell. */
  function drop(i: number) {
    if (!gridded || i === open || !motion()) return;
    const card = cards.current[i];
    if (!card) return;
    gsap.to(card, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      '--lift': 0,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }

  /** While held, the photo leans after the pointer, as if under a fingertip. */
  function lean(i: number, event: React.PointerEvent) {
    if (!gridded || i === open || event.pointerType !== 'mouse' || !motion()) return;
    const card = cards.current[i];
    if (!card) return;
    const box = card.getBoundingClientRect();
    const nx = ((event.clientX - box.left) / box.width) * 2 - 1;
    const ny = ((event.clientY - box.top) / box.height) * 2 - 1;
    gsap.to(card, {
      x: nx * 4,
      y: ny * 4 - 6,
      rotation: nx * 1.5,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }

  /* Opening one reflows the cards after it in both layouts, so every card
     takes part in the Flip. */
  function toggle(i: number) {
    if (motion()) flipState.current = Flip.getState(allCards(), { props: '--lift' });
    setOpen(open === i ? null : i);
  }

  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    if (!state || !motion()) return;
    /* GSAP cached each card's transform when the state was taken; cleared, it
       reads the end of the move from the new CSS instead of the lift or tilt. */
    gsap.set(allCards(), { clearProps: 'transform,--lift' });
    const flip = Flip.from(state, {
      duration: gridded ? 0.6 : 0.5,
      ease: gridded ? 'power3.inOut' : 'power2.inOut',
      /* Width and height, not scale, so the caption is never squashed. */
      scale: false,
    });
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

  const grouped = rows(stories);
  /* The longest row sets the column count, so every row shares its grid. */
  const columns = Math.max(...grouped.map(([, row]) => row.length));

  return (
    <div
      ref={wrap}
      className={styles.wrap}
      style={{ '--columns': columns } as React.CSSProperties}
    >
      <p className={styles.hint} aria-hidden="true">
        {gridded ? 'Hover a photo to lift it. Click to read it.' : 'Tap a photo to read it.'}
      </p>

      {grouped.map(([group, row], r) => {
        const headId = `stories-row-${r}`;

        return (
          <section key={group} className={styles.row} aria-labelledby={headId}>
            <h3 id={headId} className={styles.rowHead}>
              {group}
            </h3>

            <ul
              role="list"
              className={styles.table}
              onPointerDown={(event) => {
                /* A click on the bare table puts the open photo down. */
                if (event.target === event.currentTarget && open !== null) toggle(open);
              }}
            >
              {row.map(({ story, index: i }) => {
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
                        '--r': `${TILTS[i % TILTS.length]}deg`,
                        zIndex: stories.length - i,
                      } as React.CSSProperties
                    }
                    onPointerEnter={() => lift(i)}
                    onPointerMove={(event) => lean(i, event)}
                    onPointerLeave={() => drop(i)}
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
                      onBlur={() => drop(i)}
                    >
                      {/* The title on a strip of tape stuck across the print's
                          corner; the paper's foot is left blank. */}
                      <span className={styles.print}>
                        <span className={styles.title}>{story.title}</span>
                        <span className={styles.stat}>
                          <span className={styles.figure}>{story.figure}</span>
                          <span className={styles.figureLabel}>{story.figureLabel}</span>
                        </span>
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
                                <a
                                  href={point.link.href}
                                  target="_blank"
                                  rel="noopener"
                                  className={styles.link}
                                >
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
                      {story.shots?.length ? (
                        <div className={styles.shots}>
                          {story.shots.map((shot) => (
                            <figure key={shot.src} className={styles.shot}>
                              {/* Full size in a new tab, for the small print. */}
                              <a href={shot.src} target="_blank" rel="noopener">
                                <img
                                  src={shot.src}
                                  alt={shot.alt}
                                  width={shot.width}
                                  height={shot.height}
                                  loading="lazy"
                                />
                                <span className="visuallyHidden"> (opens full size in a new tab)</span>
                              </a>
                              {shot.caption ? <figcaption>{shot.caption}</figcaption> : null}
                            </figure>
                          ))}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className={styles.putBack}
                        onClick={() => {
                          toggle(i);
                          /* This button is about to be hidden; focus goes back
                             to the photo it closed. */
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
          </section>
        );
      })}

      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}

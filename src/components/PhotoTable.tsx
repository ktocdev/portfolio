'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

import type { GroupIntro, Story } from '@/content/projects';
import { prefersReducedMotion } from '@/lib/motion';
import StoryIcon from './StoryIcon';
import styles from './PhotoTable.module.css';

gsap.registerPlugin(Flip);

type PhotoTableProps = {
  stories: Story[];
  /** A line under a group's heading, by group name. */
  intros?: Record<string, GroupIntro>;
  note?: string;
};

/* Each photo's lean in the narrow stack, in degrees (the CSS takes a third of
   it). No two neighbours lean the same way. */
const TILTS = [-6, 3, 7, 4, -3, -5, -2, 5];

/* Matches the @container query in PhotoTable.module.css: at and above this the
   photos lie on a grid; below it they stack. */
const GRID_MIN_PX = 34 * 16;

/* A wide table always lays out four columns, however short or long its rows:
   fewer and cards grow from section to section, more and their tape titles
   wrap into towers. A longer row wraps onto a second line. */
const COLUMNS = 4;

/** Stories in rows by their group, in order of first appearance, each keeping
 * its index in `stories`. Stories without a group share one unheaded row. */
function rows(stories: Story[]) {
  const byGroup = new Map<string, { story: Story; index: number }[]>();
  stories.forEach((story, index) => {
    const group = story.group ?? '';
    const row = byGroup.get(group) ?? [];
    row.push({ story, index });
    byGroup.set(group, row);
  });
  return [...byGroup];
}

/** The row with its open card, if any, moved to the front. */
function leading<T extends { index: number }>(row: T[], open: number | null) {
  const at = row.findIndex(({ index }) => index === open);
  return at <= 0 ? row : [row[at], ...row.slice(0, at), ...row.slice(at + 1)];
}

/**
 * A case-study section's stories as paper cards, a row per group under the
 * group's name. Hovering one lifts it toward the viewer; clicking opens it
 * across its row, enlarged to read, and the rest of the row moves down out of
 * its way. Narrow tables stack each row's photos instead, and each opens in
 * place.
 *
 * Every photo is a disclosure (a button with aria-expanded over a region), so
 * the layout is only a presentation: keyboard and screen-reader users get the
 * same stories in source order.
 */
export default function PhotoTable({ stories, intros, note }: PhotoTableProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const faces = useRef<(HTMLButtonElement | null)[]>([]);
  /* The one photo picked up by a click. Pinned stories (`open` in the
     content) aren't part of it: they lie open for good, with no control. */
  const [open, setOpen] = useState<number | null>(null);
  const pinned = (i: number) => !!stories[i]?.open;
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
    if (!gridded || i === open || pinned(i) || !motion()) return;
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
    if (!gridded || i === open || pinned(i) || !motion()) return;
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
    if (!gridded || i === open || pinned(i) || event.pointerType !== 'mouse' || !motion()) return;
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

  /* Where every card stood before a toggle, and which ones change size. */
  const before = useRef(new Map<HTMLLIElement, DOMRect>());
  const resizing = useRef<number[]>([]);

  function toggle(i: number) {
    if (motion()) {
      const list = allCards();
      /* Hover lift and lean off first: captured in the start state, they ride
         through the whole move and snap away at its end. */
      gsap.killTweensOf(list);
      gsap.set(list, { clearProps: 'transform,--lift' });
      flipState.current = Flip.getState(list);
      before.current = new Map(list.map((card) => [card, card.getBoundingClientRect()]));
      resizing.current = open === null || open === i ? [i] : [i, open];
    }
    setOpen(open === i ? null : i);
  }

  /* The photo being opened or put back changes size; its words are hidden
     while it does, so they don't rewrap on every frame, and fade in once it
     has its new shape. In the grid the rest of the cards don't travel (a
     card sliding from the end of the row to under the open one reads as
     something flying in): any that moved fade in where they now stand. In
     the stack they slide, a short way down, as the open one makes room. */
  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    if (!state || !motion()) return;
    const list = allCards();
    gsap.set(list, { clearProps: 'transform,--lift' });

    const sized = resizing.current
      .map((index) => cards.current[index])
      .filter((card): card is HTMLLIElement => !!card);
    const others = list.filter((card) => !sized.includes(card));
    const moved = others.filter((card) => {
      const was = before.current.get(card);
      const now = card.getBoundingClientRect();
      return was && (Math.abs(was.top - now.top) > 2 || Math.abs(was.left - now.left) > 2);
    });

    const duration = gridded ? 0.6 : 0.5;
    const words = sized.flatMap((card) => [
      ...card.querySelectorAll<HTMLElement>(`.${styles.print}, .${styles.body}`),
    ]);
    gsap.set(words, { autoAlpha: 0 });
    /* Skeleton lines stand in for the words while the paper changes shape
       (the ::after in the CSS). */
    sized.forEach((card) => card.setAttribute('data-resizing', ''));
    const unskeleton = () => sized.forEach((card) => card.removeAttribute('data-resizing'));

    const flip = Flip.from(state, {
      targets: gridded ? sized : [...sized, ...moved],
      duration,
      ease: gridded ? 'power3.inOut' : 'power2.inOut',
      /* Width and height, not scale, so nothing is squashed. */
      scale: false,
    });
    const reveal = gsap.to(words, {
      autoAlpha: 1,
      duration: 0.3,
      delay: duration - 0.05,
      ease: 'power1.out',
      clearProps: 'opacity,visibility',
      onStart: unskeleton,
    });
    const settle = gridded
      ? gsap.fromTo(
          moved,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, delay: duration - 0.05, clearProps: 'opacity,visibility' },
        )
      : null;
    return () => {
      flip.progress(1).kill();
      reveal.progress(1).kill();
      unskeleton();
      settle?.progress(1).kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  /* Several tables share the page, so ids are scoped to this one. */
  const rowId = `stories-${useId().replace(/:/g, '')}`;
  return (
    <div
      ref={wrap}
      className={styles.wrap}
      style={{ '--columns': COLUMNS } as React.CSSProperties}
    >
      {grouped.map(([group, row], r) => {
        const headId = `${rowId}-${r}`;

        return (
          <section
            key={group}
            className={styles.row}
            aria-labelledby={group ? headId : undefined}
          >
            {group ? (
              <h4 id={headId} className={styles.rowHead}>
                {group}
              </h4>
            ) : null}
            {group && intros?.[group] ? <RowIntro intro={intros[group]} /> : null}

            <ul
              role="list"
              className={styles.table}
              /* The rest of the row steps back while one of its cards is open. */
              data-has-open={row.some(({ index }) => index === open) || undefined}
              onPointerDown={(event) => {
                /* A click on the bare table puts the open photo down. */
                if (event.target === event.currentTarget && open !== null) toggle(open);
              }}
            >
              {/* In the grid the open card leads its row, in the source as
                  well as on screen, so the tab order matches what's seen.
                  The stack opens each card where it lies. */}
              {(gridded ? leading(row, open) : row).map(({ story, index: i }) => {
                const isPinned = pinned(i);
                const isOpen = isPinned || open === i;
                const bodyId = `${rowId}-story-${i}`;
                /* The title on a strip of tape across the card's top edge;
                   the figure and its label below. */
                const print = (
                  <span className={styles.print}>
                    <span className={styles.title}>{story.title}</span>
                    {story.icon ? <StoryIcon name={story.icon} className={styles.icon} /> : null}
                    <span className={styles.stat}>
                      <span className={styles.figure}>{story.figure}</span>
                      <span className={styles.figureLabel}>{story.figureLabel}</span>
                    </span>
                  </span>
                );

                return (
                  <li
                    key={story.title}
                    ref={(el) => {
                      cards.current[i] = el;
                    }}
                    className={styles.card}
                    data-open={isOpen || undefined}
                    data-pinned={isPinned || undefined}
                    data-featured={story.featured || undefined}
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
                    {/* A pinned photo has nothing to toggle, so its face is
                        plain paper rather than a button that does nothing. */}
                    {isPinned ? (
                      <div className={styles.face}>{print}</div>
                    ) : (
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
                        {print}
                      </button>
                    )}

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
                            <figure
                              key={shot.src}
                              className={styles.shot}
                              data-wide={shot.wide || undefined}
                              data-phone={shot.phone || undefined}
                            >
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
                      {isPinned ? null : (
                        <button
                          type="button"
                          className={styles.putBack}
                          onClick={() => {
                            toggle(i);
                            /* This button is about to be hidden; focus goes
                               back to the photo it closed. */
                            faces.current[i]?.focus();
                          }}
                        >
                          {/* A strip of tape outlined rather than filled:
                              the edge shape with a paper-coloured one inset
                              over it. Chevrons point in at the words, the
                              box about to close around them. */}
                          <span className={styles.putBackEdge} aria-hidden="true" />
                          <span className={styles.putBackFill} aria-hidden="true" />
                          <Chevron className={styles.putBackIn} />
                          <span className={styles.putBackLabel}>Shrink box</span>
                          <Chevron className={`${styles.putBackIn} ${styles.putBackInEnd}`} />
                        </button>
                      )}
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

function RowIntro({ intro }: { intro: GroupIntro }) {
  return (
    <p className={styles.rowIntro}>
      {intro.text}
      {intro.link ? (
        <>
          {' '}
          <a href={intro.link.href} target="_blank" rel="noopener" className={styles.link}>
            {intro.link.label} <span aria-hidden="true">↗</span>
            <span className="visuallyHidden"> (opens in a new tab)</span>
          </a>
        </>
      ) : null}
    </p>
  );
}

/** A chevron pointing right, in the site's line-icon stroke; the closing one
 * is mirrored by CSS. Decorative: the button's words say what it does. */
function Chevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

'use client';

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import Carousel from './Carousel';
import FactsGrid from './FactsGrid';
import PhotoTable from './PhotoTable';
import type { Note, Project } from '@/content/projects';
import { COPY } from '@/content/site';
import { flipHeading } from '@/lib/flipHeading';
import { PANE_ENTER, prefersReducedMotion, staggerZones } from '@/lib/motion';
import styles from './ProjectsBrowser.module.css';

type ProjectsBrowserProps = {
  projects: Project[];
};

/* How long the drawer waits once the pointer has left it (or the deck) before
   tucking the cards away, so crossing the gap between the two never closes it. */
const DISMISS_MS = 280;

/* After a project is picked: long enough to see its card pull out of the
   stack (the row's 250ms transition) before the stack leaves. */
const PICKED_MS = 220;

const pad = (n: number) => String(n).padStart(2, '0');

export default function ProjectsBrowser({ projects }: ProjectsBrowserProps) {
  /* Selection is local UI state mirrored into the URL hash (/projects/#gps3),
     so a project can be linked to directly and back/forward restore it. The
     case study is open by default, and prerendered that way. */
  const [selected, setSelected] = useState(0);
  /* The project list lives in a drawer off the left edge, so the project
     itself gets the whole column. */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const detail = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const deck = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const dismissTimer = useRef<number | undefined>(undefined);
  /* Set when the drawer is opened by click or key, which hands focus to the
     selected card; opening on hover leaves focus alone. */
  const focusOnOpen = useRef(false);
  const drawerMounted = useRef(false);
  /* Set by a user-driven switch (click, keys, back/forward). The hash read on
     mount leaves it false: the page-level enter already covers first paint. */
  const animateSwitch = useRef(false);
  const project = projects[selected];
  const paras = project.paras ?? [project.description];

  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const index = projects.findIndex((item) => item.slug === slug);
      setSelected(index === -1 ? 0 : index);
    };
    const onPopState = () => {
      animateSwitch.current = true;
      fromHash();
    };
    fromHash();
    /* Back/forward between hashes fires popstate, not hashchange, once
       pushState is involved. */
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [projects]);

  /* Switching projects flips the new name in, as the home heading enters,
     while the rest of the column rises — faster than the page's rise, since
     it answers a click. */
  useLayoutEffect(() => {
    if (!animateSwitch.current) return;
    animateSwitch.current = false;
    const heading = title.current;
    if (!detail.current || !heading || prefersReducedMotion()) return;
    const cancelFlip = flipHeading(heading, () => {});
    const cancelRise = staggerZones(
      [...detail.current.children].filter((zone) => zone !== heading),
      PANE_ENTER,
    );
    return () => {
      cancelFlip();
      cancelRise();
    };
  }, [project.slug]);

  /* The drawer's cards are tossed in from the edge one after another, with
     the toss's ease (tossPhoto.ts), and swept back out last-first. The scrim
     and the drawer's label fade with them. Reduced motion skips straight to
     the CSS states. */
  useLayoutEffect(() => {
    if (!drawerMounted.current) {
      drawerMounted.current = true;
      return;
    }
    const panel = drawer.current;
    const shade = scrim.current;
    if (!panel || !shade || prefersReducedMotion()) return;
    const cards = panel.querySelectorAll('[role="presentation"]');
    const chrome = panel.querySelectorAll('[data-drawer-chrome]');

    if (drawerOpen) {
      const timeline = gsap.timeline();
      timeline
        .fromTo(shade, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none' }, 0)
        .fromTo(
          chrome,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power2.out' },
          0.05,
        )
        .fromTo(
          cards,
          /* Opacity, not autoAlpha: a card hidden by visibility can't take the
             focus a keyboard opening hands it. */
          { x: '-115%', rotation: -9, opacity: 0 },
          { x: 0, rotation: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.07 },
          0.05,
        );
      return () => {
        timeline.progress(1).kill();
      };
    }

    /* data-open is already gone, which hides both in CSS; held visible
       inline until the cards are off. */
    gsap.set([panel, shade], { visibility: 'visible' });
    const timeline = gsap.timeline({
      onComplete: () => gsap.set([panel, shade, ...cards, ...chrome], { clearProps: 'all' }),
    });
    timeline
      .to(
        cards,
        {
          x: '-115%',
          rotation: -6,
          opacity: 0,
          duration: 0.32,
          ease: 'power2.in',
          stagger: { each: 0.04, from: 'end' },
        },
        0,
      )
      .to(chrome, { autoAlpha: 0, duration: 0.2 }, 0)
      .to(shade, { autoAlpha: 0, duration: 0.3, ease: 'none' }, 0.1);
    return () => {
      timeline.progress(1).kill();
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (focusOnOpen.current) {
      focusOnOpen.current = false;
      tabs.current[selected]?.focus();
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const inside = drawer.current?.contains(document.activeElement);
      dismiss();
      if (inside) deck.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  useEffect(() => () => window.clearTimeout(dismissTimer.current), []);

  function summon() {
    window.clearTimeout(dismissTimer.current);
    setDrawerOpen(true);
  }

  function dismiss() {
    window.clearTimeout(dismissTimer.current);
    setDrawerOpen(false);
  }

  function dismissSoon() {
    window.clearTimeout(dismissTimer.current);
    dismissTimer.current = window.setTimeout(() => setDrawerOpen(false), DISMISS_MS);
  }

  /* A mouse has already summoned the drawer by hovering, so its click only
     hands focus over; touch and keyboard toggle. */
  function onDeckClick(event: React.MouseEvent) {
    const pointer = (event.nativeEvent as PointerEvent).pointerType;
    if (pointer === 'mouse' || !drawerOpen) {
      if (drawerOpen) tabs.current[selected]?.focus();
      else focusOnOpen.current = true;
      summon();
    } else {
      dismiss();
    }
  }

  /* No element carries the bare slug as its id (tabs and panels are prefixed),
     so the browser never scroll-jumps on the hash. */
  function select(index: number) {
    if (index !== selected) animateSwitch.current = true;
    setSelected(index);
    const hash = `#${projects[index].slug}`;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  }

  /* Picking a card puts the stack away and starts the new project from its
     top, with focus on it. */
  function pick(index: number) {
    select(index);
    window.clearTimeout(dismissTimer.current);
    dismissTimer.current = window.setTimeout(() => {
      setDrawerOpen(false);
      detail.current?.focus({ preventScroll: true });
      const top = detail.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    }, PICKED_MS);
  }

  /* Arrow keys move and select together (automatic activation); focus is moved by hand since only the selected tab is in the tab order. */
  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const last = projects.length - 1;
    let next: number;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = index === last ? 0 : index + 1;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = index === 0 ? last : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }

    /* Stops the arrow keys from scrolling the list out from under the cursor. */
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  const mouse = (event: React.PointerEvent) => event.pointerType === 'mouse';

  return (
    <section className={styles.projects}>
      {/* The edges of a few index cards peeking in from the screen's left
          edge: the project list, put away. Hover pulls the stack out. */}
      <button
        ref={deck}
        type="button"
        className={styles.deck}
        aria-expanded={drawerOpen}
        aria-controls="project-drawer"
        onPointerEnter={(event) => mouse(event) && summon()}
        onPointerLeave={(event) => mouse(event) && dismissSoon()}
        onClick={onDeckClick}
      >
        <span aria-hidden="true" className={styles.deckCard} />
        <span aria-hidden="true" className={styles.deckCard} />
        <span aria-hidden="true" className={styles.deckCard} />
        <span className={styles.deckLabel}>
          All projects
          <span aria-hidden="true" className={styles.deckCount}>
            {pad(selected + 1)}/{pad(projects.length)}
          </span>
        </span>
      </button>

      <div
        ref={scrim}
        aria-hidden="true"
        className={styles.scrim}
        data-open={drawerOpen || undefined}
        onClick={dismiss}
      />

      <div
        ref={drawer}
        id="project-drawer"
        className={styles.drawer}
        data-open={drawerOpen || undefined}
        /* Closed, its cards are out of the tab order and the a11y tree. */
        inert={!drawerOpen}
        onPointerEnter={(event) => mouse(event) && summon()}
        onPointerLeave={(event) => mouse(event) && dismissSoon()}
        onBlur={(event) => {
          const next = event.relatedTarget as Node | null;
          if (next && !drawer.current?.contains(next) && next !== deck.current) dismiss();
        }}
      >
        <p data-drawer-chrome="" className={styles.drawerLabel}>
          All projects
        </p>
        <p data-drawer-chrome="" className={styles.intro}>
          {COPY.projects.intro}
        </p>

        {/* A tablist rather than a list of toggle buttons: exactly one project
            is open at a time, and aria-controls is what tells a screen reader
            that the panel is the thing each card opens. The li elements are
            presentational so the tablist sees only its tabs. */}
        <ol
          role="tablist"
          aria-label="Project list"
          aria-orientation="vertical"
          className={styles.list}
        >
          {projects.map((item, i) => (
            <li key={item.slug} role="presentation">
              <button
                type="button"
                role="tab"
                id={`tab-${item.slug}`}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                onClick={() => pick(i)}
                onKeyDown={(event) => onKeyDown(event, i)}
                aria-selected={i === selected}
                /* Only the selected panel is rendered, so only the selected
                   tab may point at one — a dangling id is an ARIA error. */
                aria-controls={i === selected ? `panel-${item.slug}` : undefined}
                tabIndex={i === selected ? 0 : -1}
                className={styles.row}
                data-selected={i === selected || undefined}
              >
                {/* The index card's number, left of its margin rule. Decorative:
                    the list already announces position (1 of 3). */}
                <span aria-hidden="true" className={styles.number}>
                  {pad(i + 1)}
                </span>
                <span className={styles.rowBody}>
                  <span className={styles.name}>
                    {item.name}
                    {item.caseStudy ? (
                      /* Decorative only — the tagline and detail panel already
                         say this is a case study. */
                      <span aria-hidden="true" className={styles.badge}>
                        Case Study
                      </span>
                    ) : null}
                  </span>
                  <span className={styles.tagline}>{item.tagline}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.pageHead}>
        <h1 className={styles.heading}>Projects</h1>
        <span aria-hidden="true" className={styles.count}>
          {pad(selected + 1)} / {pad(projects.length)}
        </span>
      </div>

      {/* Named by its own title, which is always on screen (the tabs sit in
          the drawer, inert while it is closed). No live region: the tab
          relationship lets a screen reader move here deliberately, where
          announcing the swap would read the carousel, the prose, the facts
          and the notes on every keystroke. */}
      <article
        ref={detail}
        role="tabpanel"
        id={`panel-${project.slug}`}
        aria-labelledby={`title-${project.slug}`}
        tabIndex={0}
        className={styles.detail}
      >
        {/* Words in their own boxes for the flip; see flipHeading.ts. */}
        <h2 ref={title} id={`title-${project.slug}`} className={styles.title}>
          {project.name.split(' ').map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              {i > 0 ? ' ' : null}
              <span className={styles.word}>{word}</span>
            </Fragment>
          ))}
        </h2>
        <p className={styles.meta}>
          <span className={styles.metaTagline}>{project.tagline}</span>
          <span className={styles.metaStack}>{project.meta}</span>
        </p>

        {project.slides?.length ? (
          /* Keyed so switching projects remounts: index resets, videos unmount. */
          <Carousel key={project.slug} slides={project.slides} projectName={project.name} />
        ) : null}

        {project.status ? <p className={styles.status}>{project.status}</p> : null}

        {project.links.length ? (
          <div className={styles.links}>
            {project.links.map((link, i) => {
              /* describedby, not link text: a badge in the link text would be
                 underlined and clickable, and screen readers strip links from
                 their surrounding context (e.g. tabbing, links list). */
              const badgeId = link.badge ? `${project.slug}-link-${i}-badge` : undefined;

              return (
                <span key={link.href} className={styles.linkItem}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener"
                    aria-describedby={badgeId}
                    className={styles.link}
                  >
                    {link.label} <span aria-hidden="true">↗</span>
                    <span className="visuallyHidden"> (opens in a new tab)</span>
                  </a>
                  {link.badge ? (
                    <span id={badgeId} className={styles.linkBadge}>
                      {link.badge}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        ) : null}

        {paras.length ? (
          <div className={styles.paras}>
            {paras.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        ) : null}

        {project.facts?.length ? <FactsGrid facts={project.facts} /> : null}

        {project.notes?.length ? (
          <ul role="list" aria-label="Case study notes" className={styles.notes}>
            {project.notes.map((note, i) => (
              <NoteItem key={`${note.kind}-${i}`} note={note} />
            ))}
          </ul>
        ) : null}

        {project.stories?.length ? (
          <PhotoTable key={project.slug} stories={project.stories} note={project.storiesNote} />
        ) : null}
      </article>
    </section>
  );
}

/**
 * Five item types share one list. Everything except `text` hangs back to the
 * left margin and drops its marker, so headings and `para` read as structure
 * or prose rather than as bullets.
 */
function NoteItem({ note }: { note: Note }) {
  if (note.kind === 'heading') {
    return <li className={styles.noteHeading}>{note.text}</li>;
  }

  if (note.kind === 'subheading') {
    return <li className={styles.noteSubheading}>{note.text}</li>;
  }

  if (note.kind === 'disclosure') {
    return <li className={styles.noteDisclosure}>{note.text}</li>;
  }

  if (note.kind === 'para') {
    return <li className={styles.notePara}>{note.text}</li>;
  }

  return (
    <li className={styles.noteText}>
      {note.text}
      {note.link ? (
        <>
          {' '}
          <a href={note.link.href} target="_blank" rel="noopener" className={styles.noteLink}>
            {note.link.label}
            {' '}
            <span aria-hidden="true">↗</span>
            <span className="visuallyHidden"> (opens in a new tab)</span>
          </a>
        </>
      ) : null}
      {note.subs?.length ? (
        <ul className={styles.noteSubs}>
          {note.subs.map((sub) => (
            <li key={sub}>{sub}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

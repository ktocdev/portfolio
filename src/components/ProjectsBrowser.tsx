'use client';

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import Carousel from './Carousel';
import FactsGrid from './FactsGrid';
import PhotoTable from './PhotoTable';
import type { LeadShot, Note, Project, SpecGroup } from '@/content/projects';
import { COPY } from '@/content/site';
import { flipHeading } from '@/lib/flipHeading';
import { PANE_ENTER, prefersReducedMotion, staggerZones, zonesOf } from '@/lib/motion';
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

const LINKS_TITLE = 'Links';
const SPECS_TITLE = 'Technical Specs';
const ABOUT_TITLE = 'About';

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
  const drawerWasOpen = useRef(false);
  /* Set by a user-driven switch (click, keys, back/forward). The hash read on
     mount leaves it false: the page-level enter already covers first paint. */
  const animateSwitch = useRef(false);
  const project = projects[selected];
  const paras = project.paras ?? [project.description];
  /* A logo stands in for the company's name at the start of the title. */
  const logo = project.logo && project.name.startsWith(project.logo.alt) ? project.logo : undefined;
  const titleWords = (logo ? project.name.slice(logo.alt.length) : project.name)
    .split(' ')
    .filter(Boolean);

  const prose =
    paras.length || project.notes?.length ? (
      <div className={styles.prose} data-zones="">
        {paras.length ? (
          <div className={styles.paras}>
            {paras.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        ) : null}

        {project.notes?.length ? (
          <ul role="list" aria-label="Case study notes" className={styles.notes}>
            {project.notes.map((note, i) => (
              <NoteItem key={`${note.kind}-${i}`} note={note} />
            ))}
          </ul>
        ) : null}
      </div>
    ) : null;

  const linksList = project.links.length ? (
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
  ) : null;

  /* Projects with specs are laid out in titled parts (specs, about, links)
     rather than links and story straight under the carousel. With several
     parts, links down to each so the later ones aren't lost. Scripted, not
     plain #fragments: the hash names the selected project, and a fragment
     would switch it. */
  const parted = Boolean(project.specs?.length);
  const linksId = `${project.slug}-links`;
  const specsId = `${project.slug}-specs`;
  const aboutId = `${project.slug}-about`;
  const jumpTargets = [
    ...(parted
      ? [
          { id: specsId, title: SPECS_TITLE },
          ...(prose ? [{ id: aboutId, title: ABOUT_TITLE }] : []),
          ...(project.links.length ? [{ id: linksId, title: LINKS_TITLE }] : []),
        ]
      : []),
    ...(project.sections ?? []).map((section, s) => ({
      id: `${project.slug}-section-${s}`,
      title: section.title,
    })),
  ];
  const jump =
    jumpTargets.length > 1 ? (
      <nav aria-label={project.jumpLabel ?? 'On this page'} className={styles.jump}>
        {project.jumpLabel ? (
          <span aria-hidden="true" className={styles.jumpLabel}>
            {project.jumpLabel}
          </span>
        ) : null}
        {jumpTargets.map((target) => (
          <a
            key={target.id}
            href={`#${project.slug}`}
            className={styles.jumpLink}
            onClick={(event) => {
              event.preventDefault();
              const heading = document.getElementById(target.id);
              heading?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
              heading?.focus({ preventScroll: true });
            }}
          >
            {target.title} <span aria-hidden="true">↓</span>
          </a>
        ))}
      </nav>
    ) : null;

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
      zonesOf(detail.current).filter((zone) => zone !== heading),
      PANE_ENTER,
    );
    return () => {
      cancelFlip();
      cancelRise();
    };
  }, [project.slug]);

  /* Section headings flip in the first time each scrolls into view. GSAP
     loads with the first one, as the page's own entrance loads it. */
  useEffect(() => {
    const root = detail.current;
    if (!root || prefersReducedMotion()) return;
    const cancels: (() => void)[] = [];
    let live = true;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          import('@/lib/flipHeading').then(({ flipHeading }) => {
            if (live) cancels.push(flipHeading(entry.target as HTMLElement, () => {}));
          });
        }
      },
      /* Starts just as the heading's top edge comes up into the view. */
      { rootMargin: '0px 0px -8% 0px' },
    );
    root.querySelectorAll('[data-flip-on-view]').forEach((heading) => observer.observe(heading));
    return () => {
      live = false;
      observer.disconnect();
      cancels.forEach((cancel) => cancel());
    };
  }, [project.slug]);

  /* The drawer's cards are tossed in from the edge one after another, with
     the toss's ease (tossPhoto.ts), and swept back out last-first. The scrim
     and the drawer's label fade with them. Reduced motion skips straight to
     the CSS states. */
  useLayoutEffect(() => {
    /* Only a change animates. Comparing against the last state, not a
       first-run flag: StrictMode runs this twice on mount, and a flag would
       let the second run play the closing sweep over the page's entrance. */
    if (drawerWasOpen.current === drawerOpen) return;
    drawerWasOpen.current = drawerOpen;
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
    /* data-enter-stagger: the page's entrance flips the title while the
       detail's zones (data-zones, below) rise one after another. */
    <section className={styles.projects} data-enter-stagger="">
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
        <span className={styles.deckLabel}>Projects</span>
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
          Projects
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
                <span className={styles.rowBody}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.tagline}>{item.tagline}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* The page's heading for screen readers; on screen the project's own
          title leads (the deck shows the position in the list). */}
      <h1 className="visuallyHidden">Projects</h1>

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
        data-zones=""
      >
        {/* Words in their own boxes for the flip; see flipHeading.ts. */}
        <h2
          ref={title}
          id={`title-${project.slug}`}
          className={styles.title}
          data-flip-heading=""
          data-logo={logo ? '' : undefined}
          data-logo-only={logo && titleWords.length === 0 ? '' : undefined}
        >
          {logo ? (
            /* Both themes' artwork, one hidden by CSS, so the right one shows
               on first paint with no script. Its alt text reads as the words
               it stands in for. */
            <span className={`${styles.word} ${styles.logo}`}>
              {(['light', 'dark'] as const).map((theme) => (
                <img
                  key={theme}
                  src={logo[theme]}
                  alt={theme === 'light' ? logo.alt : ''}
                  width={logo.width}
                  height={logo.height}
                  data-theme-art={theme}
                />
              ))}
            </span>
          ) : null}
          {titleWords.map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              {i > 0 || logo ? ' ' : null}
              <span className={styles.word}>{word}</span>
            </Fragment>
          ))}
        </h2>

        {project.role ? <p className={styles.role}>{project.role}</p> : null}

        {project.slides?.length ? (
          /* Keyed so switching projects remounts: index resets, videos unmount. */
          <Carousel key={project.slug} slides={project.slides} projectName={project.name} />
        ) : null}

        {project.status ? <p className={styles.status}>{project.status}</p> : null}

        {parted ? (
          <>
            {jump}
            <Part key={specsId} id={specsId} title={SPECS_TITLE}>
              {/* The same shaded panel as a case-study part's specs. */}
              <div className={styles.sectionSpecs}>
                <SpecList specs={project.specs ?? []} />
              </div>
            </Part>
            {prose ? (
              <Part key={aboutId} id={aboutId} title={ABOUT_TITLE}>
                {prose}
              </Part>
            ) : null}
            {linksList ? (
              <Part key={linksId} id={linksId} title={LINKS_TITLE}>
                {linksList}
              </Part>
            ) : null}
          </>
        ) : (
          <>
            {linksList}
            {prose}
            {jump}
          </>
        )}

        {/* A case study's parts, each under its own heading: its screenshot
            and facts side by side, then its cards. Each part's children rise
            in turn on entry (data-zones). */}
        {project.sections?.map((section, s) => (
          <Part key={`${project.slug}-${section.title}`} id={`${project.slug}-section-${s}`} title={section.title}>
            {section.intro ? <p className={styles.sectionIntro}>{section.intro}</p> : null}
            {section.leadShot || section.facts?.length ? (
              <div className={styles.lead} data-zones="">
                {section.leadShot ? <LeadShotFigure shot={section.leadShot} /> : null}
                {section.facts?.length ? <FactsGrid facts={section.facts} /> : null}
              </div>
            ) : null}
            <PhotoTable
              stories={section.stories}
              intros={section.groupIntros}
              note={section.note}
            />
            {section.specs?.length ? (
              <div className={styles.sectionSpecs}>
                <h4 className={styles.specsSubtitle}>{SPECS_TITLE}</h4>
                <SpecList specs={section.specs} />
              </div>
            ) : null}
          </Part>
        ))}
      </article>
    </section>
  );
}

/** One titled part of the page. Its heading flips in like the title as it
 * scrolls into view (words in their own boxes for the flip), and is where a
 * jump link lands. */
function Part({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className={styles.caseSection} aria-labelledby={id} data-zones="">
      <h3 id={id} className={styles.sectionTitle} tabIndex={-1} data-flip-on-view="">
        {title.split(' ').map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            {i > 0 ? ' ' : null}
            <span className={styles.word}>{word}</span>
          </Fragment>
        ))}
      </h3>
      {children}
    </section>
  );
}

/** What the work was built with: one row per layer, its label beside its items. */
function SpecList({ specs }: { specs: SpecGroup[] }) {
  return (
    <dl className={styles.specs}>
      {specs.map((group) => (
        <div key={group.label} className={styles.specGroup}>
          <dt className={styles.specLabel}>{group.label}</dt>
          <dd>
            <ul role="list" className={styles.specItems}>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A screenshot of the work, with its phone view overlapping the corner. */
function LeadShotFigure({ shot }: { shot: LeadShot }) {
  return (
    <figure className={styles.shot} data-rise="photo">
      <span className={styles.shotFrame}>
        <img
          className={styles.shotMain}
          src={shot.main.src}
          alt={shot.main.alt}
          width={shot.main.width}
          height={shot.main.height}
        />
        {shot.inset ? (
          <img
            className={styles.shotInset}
            src={shot.inset.src}
            alt={shot.inset.alt}
            width={shot.inset.width}
            height={shot.inset.height}
          />
        ) : null}
      </span>
      <figcaption className={styles.shotCaption}>{shot.caption}</figcaption>
    </figure>
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

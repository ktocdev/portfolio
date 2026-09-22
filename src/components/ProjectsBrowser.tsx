'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import Carousel from './Carousel';
import FactsGrid from './FactsGrid';
import type { Note, Project } from '@/content/projects';
import { COPY } from '@/content/site';
import { PANE_ENTER, prefersReducedMotion, staggerZones } from '@/lib/motion';
import styles from './ProjectsBrowser.module.css';

type ProjectsBrowserProps = {
  projects: Project[];
};

export default function ProjectsBrowser({ projects }: ProjectsBrowserProps) {
  /* Selection is local UI state mirrored into the URL hash (/projects/#gps3),
     so a project can be linked to directly and back/forward restore it. The
     case study is open by default, and prerendered that way. */
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const detail = useRef<HTMLElement>(null);
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

  /* Switching projects re-runs the rise on the detail column only — faster
     than the page's, since it answers a click. The list, header and footer
     stay put. */
  useLayoutEffect(() => {
    if (!animateSwitch.current) return;
    animateSwitch.current = false;
    if (!detail.current || prefersReducedMotion()) return;
    return staggerZones([...detail.current.children], PANE_ENTER);
  }, [project.slug]);

  /* No element carries the bare slug as its id (tabs and panels are prefixed),
     so the browser never scroll-jumps on the hash. */
  function select(index: number) {
    if (index !== selected) animateSwitch.current = true;
    setSelected(index);
    const hash = `#${projects[index].slug}`;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
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

  return (
    <section className={styles.projects}>
      <div className={styles.selector}>
        <h1 className={styles.heading}>Projects</h1>
        <p className={styles.intro}>{COPY.projects.intro}</p>

        {/* A tablist rather than a list of toggle buttons: exactly one project
            is open at a time, and aria-controls is what tells a screen reader
            that the panel beside the list is the thing each row opens. The li
            elements are presentational so the tablist sees only its tabs. */}
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
                onClick={() => select(i)}
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

      {/* Named by its own tab, so the panel announces which project it belongs
          to on arrival. No live region: the tab relationship lets a screen
          reader move here deliberately, where announcing the swap would read
          the carousel, the prose, the facts and the notes on every keystroke. */}
      <article
        ref={detail}
        role="tabpanel"
        id={`panel-${project.slug}`}
        aria-labelledby={`tab-${project.slug}`}
        tabIndex={0}
        className={styles.detail}
      >
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

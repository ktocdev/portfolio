'use client';

import { useRef, useState } from 'react';

import Carousel from './Carousel';
import FactsGrid from './FactsGrid';
import type { Note, Project } from '@/content/projects';
import { COPY } from '@/content/site';
import styles from './ProjectsBrowser.module.css';

type ProjectsBrowserProps = {
  projects: Project[];
};

export default function ProjectsBrowser({ projects }: ProjectsBrowserProps) {
  /* Selection is local UI state, not a route — the case study is open on load. */
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const project = projects[selected];

  /* Arrow keys move between tabs and select as they go. Automatic activation is
     the right trade here: the panels are already rendered client-side, so there
     is nothing to wait for and no reason to make the user confirm. Focus has to
     be moved by hand because only the selected tab is in the tab order. */
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
    setSelected(next);
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
                onClick={() => setSelected(i)}
                onKeyDown={(event) => onKeyDown(event, i)}
                aria-selected={i === selected}
                aria-controls={`panel-${item.slug}`}
                tabIndex={i === selected ? 0 : -1}
                className={styles.row}
                data-selected={i === selected || undefined}
              >
                <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
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

        <div className={styles.paras}>
          {(project.paras ?? [project.description]).map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>

        {project.facts?.length ? <FactsGrid facts={project.facts} /> : null}

        {project.notes?.length ? (
          <ul role="list" aria-label="Case study notes" className={styles.notes}>
            {project.notes.map((note, i) => (
              <NoteItem key={`${note.kind}-${i}`} note={note} />
            ))}
          </ul>
        ) : null}

        {project.links.length ? (
          <div className={styles.links}>
            {project.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener" className={styles.link}>
                {link.label}
                {' '}
                <span aria-hidden="true">↗</span>
                <span className="visuallyHidden"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}

/**
 * Four item types share one list. Everything except `text` hangs back to the
 * left margin and drops its marker, so headings read as structure rather than
 * as bullets.
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

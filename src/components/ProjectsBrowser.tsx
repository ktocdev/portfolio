'use client';

import { useState } from 'react';

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
  const project = projects[selected];

  return (
    <section className={styles.projects}>
      <div className={styles.selector}>
        <h1 className={styles.heading}>Projects</h1>
        <p className={styles.intro}>{COPY.projects.intro}</p>

        <ol aria-label="Project list" className={styles.list}>
          {projects.map((item, i) => (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={i === selected}
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

      <article aria-live="polite" className={styles.detail}>
        {project.slides?.length ? (
          /* Keyed so switching projects remounts: index resets, videos unmount. */
          <Carousel key={project.slug} slides={project.slides} />
        ) : null}

        {project.status ? <p className={styles.status}>{project.status}</p> : null}

        <div className={styles.paras}>
          {(project.paras ?? [project.description]).map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>

        {project.facts?.length ? <FactsGrid facts={project.facts} /> : null}

        {project.notes?.length ? (
          <ul aria-label="Case study notes" className={styles.notes}>
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
                {' '}
                <span aria-hidden="true">↗</span>
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
            {' '}
            <span aria-hidden="true">↗</span>
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

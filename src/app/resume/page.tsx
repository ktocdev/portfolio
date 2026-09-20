import type { Metadata } from 'next';
import { Fragment } from 'react';

import ButtonLink from '@/components/ButtonLink';
import {
  EARLIER_ROLES,
  EDUCATION,
  EXPERIENCE,
  RESUME_CONTACT,
  RESUME_PROJECTS,
  RESUME_SKILLS,
  RESUME_SUMMARY,
  RESUME_TITLES,
  type Entry,
} from '@/content/resume';
import { SITE } from '@/content/site';
import { keepTogether } from '@/lib/nowrap';
import styles from './page.module.css';

export const metadata: Metadata = {
  /* Absolute rather than templated: when this page is printed to PDF the
     browser copies document.title into the file's Title field, and this is
     the title the PDF should carry. */
  title: { absolute: `${SITE.name} - Resume` },
  description: RESUME_SUMMARY,
};

/* Decorative separator between header items; hidden from assistive tech. */
function Divider() {
  return (
    <span aria-hidden="true" className={styles.divider}>
      ∷
    </span>
  );
}

/* Role on the left, dates on the right, employer/location beneath. */
function EntryHeader({ entry }: { entry: Entry }) {
  const meta = [entry.org, entry.location].filter(Boolean).join(' · ');

  return (
    <div className={styles.entryHeader}>
      <h3 className={styles.role}>{entry.role}</h3>
      <span className={styles.years}>{entry.years}</span>
      {meta ? <p className={styles.org}>{meta}</p> : null}
    </div>
  );
}

/**
 * The resume as one reading column. This is the only page meant to scroll,
 * and it doubles as the print source for the PDF: globals.css strips the
 * site chrome under `@media print` wherever `.printDocument` is present.
 */
export default function ResumePage() {
  return (
    <article className={`${styles.document} printDocument`} aria-labelledby="resume-name">
      <div className={styles.top}>
        {/* Screen only: page label and the PDF button. Print drops the row. */}
        <p className={styles.tools}>
          <span>Resume</span>
          <ButtonLink href="/Katie-OConnor-Resume.pdf" download="Katie-OConnor-Resume.pdf" glyph="↓">
            Download PDF
          </ButtonLink>
        </p>

        <header className={styles.header}>
          <h1 id="resume-name" className={styles.name}>
            {SITE.name}
          </h1>

          {/* The lockup shrink-wraps to its wider row, and each row is a
              nowrap flex line with space-between, so the narrower row spreads
              its items and dividers out to the same width. The tagline is
              bracketed by dividers; the contact line is not. */}
          <div className={styles.lockup}>
            <p className={styles.tagline}>
              <Divider />
              {RESUME_TITLES.map((title) => (
                <Fragment key={title}>
                  <span>{title}</span>
                  <Divider />
                </Fragment>
              ))}
            </p>
            <address className={styles.contact}>
              {RESUME_CONTACT.map((row, i) => (
                <Fragment key={row.text}>
                  {i > 0 ? <Divider /> : null}
                  {row.href ? (
                    <a href={row.href} className={styles.contactLink}>
                      {row.text}
                    </a>
                  ) : (
                    <span>{row.text}</span>
                  )}
                </Fragment>
              ))}
            </address>
          </div>
        </header>
      </div>

      <section className={styles.section} aria-labelledby="resume-summary">
        <h2 id="resume-summary" className={styles.sectionHeading}>
          Summary
        </h2>
        <p className={styles.summary}>{RESUME_SUMMARY}</p>
      </section>

      <section className={styles.section} aria-labelledby="resume-experience">
        <h2 id="resume-experience" className={styles.sectionHeading}>
          Experience
        </h2>
        <div className={styles.entries}>
          {EXPERIENCE.map((entry) => (
            <div key={`${entry.years}-${entry.role}`} className={styles.entry}>
              <EntryHeader entry={entry} />
              {entry.groups?.map((group) => (
                <div key={group.label} className={styles.group}>
                  <h4 className={styles.groupLabel}>{group.label}</h4>
                  <ul className={styles.bullets}>
                    {group.items.map((item) => (
                      <li key={item}>{keepTogether(item)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="resume-skills">
        <h2 id="resume-skills" className={styles.sectionHeading}>
          Skills
        </h2>
        {/* dt/dd are direct grid children so the columns line up and each row
            draws its own rule — the same construction as the Home table. */}
        <dl className={styles.skills}>
          {RESUME_SKILLS.map((skill) => (
            <Fragment key={skill.label}>
              <dt className={styles.skillLabel}>{skill.label}</dt>
              <dd className={styles.skillItems}>{skill.items}</dd>
            </Fragment>
          ))}
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="resume-projects">
        <h2 id="resume-projects" className={styles.sectionHeading}>
          Projects
        </h2>
        <div className={styles.entries}>
          {RESUME_PROJECTS.map((project) => (
            <div key={project.title} className={styles.entry}>
              <div className={styles.entryHeader}>
                <h3 className={styles.role}>{project.title}</h3>
                <p className={styles.org}>{project.stack}</p>
              </div>
              <ul className={styles.bullets}>
                {project.items.map((item) => (
                  <li key={item}>{keepTogether(item)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="resume-earlier">
        <h2 id="resume-earlier" className={styles.sectionHeading}>
          Earlier Experience
        </h2>
        <div className={styles.entry}>
          <EntryHeader entry={EARLIER_ROLES} />
          <p className={styles.note}>{EARLIER_ROLES.note}</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="resume-education">
        <h2 id="resume-education" className={styles.sectionHeading}>
          Education
        </h2>
        <div className={styles.entry}>
          <EntryHeader entry={EDUCATION} />
        </div>
      </section>
    </article>
  );
}

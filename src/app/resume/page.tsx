import type { Metadata } from 'next';

import { EXPERIENCE, RESUME_SUMMARY } from '@/content/resume';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Resume',
  description: RESUME_SUMMARY,
};

export default function ResumePage() {
  return (
    <section className={styles.resume}>
      <div className={styles.left}>
        <h1 className={styles.heading}>Resume</h1>
        <p className={styles.summary}>{RESUME_SUMMARY}</p>
        <div className={styles.actions}>
          {/* The only filled button in the system. */}
          <a
            href="/Katie-OConnor-Resume.pdf"
            download="Katie-OConnor-Resume.pdf"
            className={styles.button}
          >
            Download PDF{' '}
            <span aria-hidden="true" className={styles.buttonGlyph}>
              ↓
            </span>
          </a>
        </div>
      </div>

      <ol role="list" aria-label="Experience" className={styles.list}>
        {EXPERIENCE.map((entry, i) => (
          <li
            key={`${entry.years}-${entry.role}`}
            className={styles.entry}
            data-last={i === EXPERIENCE.length - 1 || undefined}
          >
            <span className={styles.years}>{entry.years}</span>
            <div className={styles.bodyCell}>
              <h2 className={styles.role}>{entry.role}</h2>
              <p className={styles.org}>{entry.org}</p>

              {entry.groups ? (
                <div className={styles.groups}>
                  {entry.groups.map((group) => (
                    <div key={group.label} className={styles.group}>
                      <h3 className={styles.groupLabel}>{group.label}</h3>
                      <ul className={styles.bullets}>
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}

              {entry.note ? <p className={styles.note}>{entry.note}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

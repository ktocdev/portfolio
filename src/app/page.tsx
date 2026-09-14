import Link from 'next/link';
import { Fragment } from 'react';

import Figure from '@/components/Figure';
import { COPY, IMAGES, SITE, SKILLS } from '@/content/site';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <section className={styles.home}>
      {/* space-between pins the skills table to the bottom of the viewport. */}
      <div className={styles.left}>
        <div className={styles.stack}>
          <div className={styles.eyebrow}>
            <p className={styles.role}>{SITE.role}</p>
            {/* Separators are CSS pseudo-elements so the list announces
                three items, not five. */}
            <ul role="list" aria-label="Specialties" className={styles.specialties}>
              {SITE.specialties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <h1 className={styles.heading}>
            Systems that work end to end, designed
            {' '}
            <em className={styles.emphasis}>with love</em>.
          </h1>

          <p className={styles.lead}>{COPY.home.lead}</p>

          <Link href="/projects" className={styles.cta}>
            {COPY.home.cta}
            {' '}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* dt/dd are direct grid children so the two columns line up and each
            row rule is drawn by the cells themselves. */}
        <dl aria-label="Technical skills" className={styles.skills}>
          {SKILLS.map((skill) => (
            <Fragment key={skill.label}>
              <dt className={styles.skillLabel}>{skill.label}</dt>
              <dd className={styles.skillItems}>{skill.items}</dd>
            </Fragment>
          ))}
        </dl>
      </div>

      <Figure src={IMAGES.heroHome.src} alt={IMAGES.heroHome.alt} variant="hero" priority />
    </section>
  );
}

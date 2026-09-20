import type { Metadata } from 'next';
import { Fragment } from 'react';

import Figure from '@/components/Figure';
import { COPY, IMAGES } from '@/content/site';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About',
  description:
    "Katie O'Connor lives in Avondale, Chicago, with two cats and a guinea pig, and builds AI-native side projects.",
};

export default function AboutPage() {
  return (
    <section className={styles.about}>
      <Figure src={IMAGES.zinnias.src} alt={IMAGES.zinnias.alt} variant="about" priority />

      <div className={styles.right}>
        <h1 className={styles.heading}>About</h1>
        <p className={styles.body}>{COPY.about.body}</p>
        <p className={styles.caption}>{COPY.about.caption}</p>

        <dl className={styles.facts}>
          {COPY.about.facts.map((fact) => (
            <Fragment key={fact.label}>
              <dt className={styles.factLabel}>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
    </section>
  );
}

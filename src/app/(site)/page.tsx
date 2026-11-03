import { Fragment } from 'react';
import type { Metadata } from 'next';

import ButtonLink from '@/components/ButtonLink';
import Figure from '@/components/Figure';
import { COPY, IMAGES } from '@/content/site';
import styles from './page.module.css';

/* Title and description come from the root layout's defaults. */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <section className={styles.home}>
      <div className={styles.left}>
        <h1 className={styles.heading} data-flip-heading="">
          {COPY.home.heading.split(' ').map((word, i) => (
            <Fragment key={word}>
              {i > 0 ? ' ' : null}
              <span className={styles.word}>{word}</span>
            </Fragment>
          ))}
        </h1>

        <p className={styles.lead}>{COPY.home.lead}</p>

        <ButtonLink href="/projects" glyph="→" className={styles.cta} shimmer>
          {COPY.home.cta}
        </ButtonLink>
      </div>

      <Figure src={IMAGES.headshot.src} alt={IMAGES.headshot.alt} variant="portrait" priority />
    </section>
  );
}

import ButtonLink from '@/components/ButtonLink';
import Figure from '@/components/Figure';
import { COPY, IMAGES } from '@/content/site';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <section className={styles.home}>
      <Figure src={IMAGES.headshot.src} alt={IMAGES.headshot.alt} variant="portrait" priority />

      <div className={styles.right}>
        <h1 className={styles.heading}>{COPY.home.heading}</h1>

        <p className={styles.lead}>{COPY.home.lead}</p>

        <ButtonLink href="/projects" glyph="→" className={styles.cta}>
          {COPY.home.cta}
        </ButtonLink>
      </div>
    </section>
  );
}

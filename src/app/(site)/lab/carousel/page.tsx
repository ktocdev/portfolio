import type { Metadata } from 'next';

import { PROJECTS } from '@/content/projects';
import CarouselConcepts from './CarouselConcepts';
import styles from './page.module.css';

/* Carousel control concepts, to pick one for the projects page. Sandbox:
   unlinked, out of the sitemap and search results. */
export const metadata: Metadata = {
  title: 'Lab · Carousel',
  robots: { index: false, follow: false },
};

export default function CarouselLabPage() {
  const slides = PROJECTS.find((project) => project.slug === 'gps3')?.slides ?? [];
  return (
    <section className={styles.page}>
      <h1 className={styles.label}>Lab · carousel controls</h1>
      <CarouselConcepts slides={slides} />
    </section>
  );
}

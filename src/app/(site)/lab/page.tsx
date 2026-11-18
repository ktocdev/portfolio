import type { Metadata } from 'next';

import TalkingHead from '@/components/TalkingHead';
import styles from './page.module.css';

/* A sandbox, linked only from the footer's © and left out of the sitemap and
   search results. */
export const metadata: Metadata = {
  title: 'Lab',
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.label}>Lab · 001</h1>
      <TalkingHead />
    </section>
  );
}

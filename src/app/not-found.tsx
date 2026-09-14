import type { Metadata } from 'next';
import Link from 'next/link';

import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page not found',
};

/* Replaces Next's default 404, which ignores the theme tokens and offers no
   way back. Rendered inside the root layout, so header and footer remain. */
export default function NotFound() {
  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>404</p>
      <h1 className={styles.heading}>Page not found.</h1>
      <p className={styles.body}>
        That address doesn&apos;t exist here, or it moved. Try the navigation above, or head
        back to the start.
      </p>
      <Link href="/" className={styles.link}>
        Go to the home page <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

import type { Metadata } from 'next';

import CookieSettings from '@/components/CookieSettings';
import { COPY } from '@/content/site';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Cookie settings',
  description: 'Choose whether this site uses analytics cookies.',
};

export default function CookiesPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.heading}>{COPY.cookies.heading}</h1>
      <p className={styles.body}>{COPY.cookies.intro}</p>
      <CookieSettings />
    </section>
  );
}

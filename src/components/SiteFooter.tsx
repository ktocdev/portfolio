import Link from 'next/link';

import { SITE } from '@/content/site';
import ThemeToggle from './ThemeToggle';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span>{SITE.copyright}</span>
      <div className={styles.right}>
        <Link href="/cookies" className={styles.link}>
          Cookies
        </Link>
        <a href={`mailto:${SITE.email}`} className={styles.link}>
          {SITE.email}
        </a>
        <ThemeToggle />
      </div>
    </footer>
  );
}

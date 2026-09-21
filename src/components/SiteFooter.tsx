import Link from 'next/link';

import { SITE } from '@/content/site';
import ThemeToggle from './ThemeToggle';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span>{SITE.copyright}</span>
      <div className={styles.right}>
        {/* No prefetch: this footer link rides on every page, so the router would
            preload the cookies page CSS site-wide for a destination almost nobody
            visits — Chrome then logs an unused-preload warning on every load. The
            page is small, so the fetch on an actual click is imperceptible. */}
        <Link href="/cookies" prefetch={false} className={styles.link}>
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

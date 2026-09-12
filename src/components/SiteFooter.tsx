import { SITE } from '@/content/site';
import ThemeToggle from './ThemeToggle';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span>{SITE.copyright}</span>
      <div className={styles.right}>
        <a href={`mailto:${SITE.email}`} className={styles.email}>
          {SITE.email}
        </a>
        <ThemeToggle />
      </div>
    </footer>
  );
}

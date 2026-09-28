import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageTransition from '@/components/PageTransition';

import styles from './SiteShell.module.css';

/**
 * The portfolio's chrome: skip link, header, main, footer, and the page
 * loader inside PageTransition. Lives outside the root layout so a page can
 * opt out of it (the Main Character splash is full-bleed and brings its own).
 * Used by the (site) route group's layout and by not-found, which Next renders
 * straight into the root layout.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <SiteHeader />
      {/* tabIndex makes the skip link actually move focus, not just scroll. */}
      <main id="main" tabIndex={-1} className={styles.main}>
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
    </div>
  );
}

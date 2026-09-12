'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV, SITE } from '@/content/site';
import styles from './SiteHeader.module.css';

export default function SiteHeader() {
  const pathname = usePathname();

  /* trailingSlash:true means pathname arrives as "/projects/" — normalise
     before comparing so the active item resolves in dev and in the export. */
  const current = pathname.replace(/\/+$/, '') || '/';

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>
        {SITE.name}
      </Link>
      <nav aria-label="Primary" className={styles.nav}>
        {NAV.map((item) => {
          const isActive = current === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={styles.navLink}
              data-active={isActive || undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

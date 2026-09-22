'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV, SITE } from '@/content/site';
import styles from './SiteHeader.module.css';

type IndicatorBox = { left: number; width: number; top: number; shown: boolean };

const INDICATOR_HEIGHT = 1.5;

export default function SiteHeader() {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<IndicatorBox | null>(null);

  /* trailingSlash:true means pathname arrives as "/projects/" — normalise
     before comparing so the active item resolves in dev and in the export. */
  const current = pathname.replace(/\/+$/, '') || '/';

  /* One underline that slides to the current item, measured off the link
     itself. Re-measured on route change and whenever the nav resizes — it
     wraps at narrow widths, which is why top is measured too. */
  useEffect(() => {
    const el = nav.current;
    if (!el) return;

    const measure = () => {
      const link = el.querySelector<HTMLElement>('a[aria-current="page"]');
      /* No current item (cookies, 404): fade out in place rather than
         sliding back to the start of the nav. */
      setIndicator((prev) =>
        link
          ? {
              left: link.offsetLeft,
              width: link.offsetWidth,
              top: link.offsetTop + link.offsetHeight - INDICATOR_HEIGHT,
              shown: true,
            }
          : prev && { ...prev, shown: false },
      );
    };

    measure();
    /* Link widths shift when the webfont swaps in without resizing the nav. */
    document.fonts.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [current]);

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>
        {SITE.name}
      </Link>
      <nav ref={nav} aria-label="Primary" className={styles.nav}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={item.prefetch}
            aria-current={current === item.href ? 'page' : undefined}
            className={styles.navLink}
          >
            {item.label}
          </Link>
        ))}
        {/* Hidden until measured, so it never paints at left: 0 first. */}
        <span
          aria-hidden="true"
          className={styles.indicator}
          style={
            indicator
              ? {
                  left: indicator.left,
                  width: indicator.width,
                  top: indicator.top,
                  opacity: indicator.shown ? 1 : 0,
                }
              : undefined
          }
        />
      </nav>
    </header>
  );
}

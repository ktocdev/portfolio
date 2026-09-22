'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { EASE, PAGE_ENTER, PAGE_EXIT_MS, prefersReducedMotion, staggerZones, zonesOf } from '@/lib/motion';
import styles from './PageTransition.module.css';

/* trailingSlash:true means paths arrive as "/projects/" — compare without it. */
const normalise = (path: string) => path.replace(/\/+$/, '') || '/';

/* A same-origin path ending in an extension is a file (the resume PDF), not a route. */
const isFile = (path: string) => /\.[a-z0-9]+$/i.test(path);

/**
 * The route an event's link would navigate to, or null when the transition
 * should leave it alone: modified clicks, new tabs, downloads, other origins,
 * files, and links to the page already showing.
 */
function routeTarget(event: MouseEvent): URL | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

  const link = (event.target as Element | null)?.closest?.('a[href]');
  if (!(link instanceof HTMLAnchorElement)) return null;
  if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return null;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin || isFile(url.pathname)) return null;
  /* Same page (including hash-only links like the skip link): no transition. */
  if (normalise(url.pathname) === normalise(window.location.pathname)) return null;
  return url;
}

/**
 * The page container inside <main>. On an internal link click the current
 * page fades out (150ms) before the route commits; once the new page is in,
 * its section's zones rise one after another. Back/forward skip the fade and
 * only rise. Reduced motion skips both.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const page = useRef<HTMLDivElement>(null);
  const shownPath = useRef(pathname);
  const cancelExit = useRef<(() => void) | null>(null);

  useEffect(() => {
    /* The screen is blank from the start of the fade until the next page
       renders, so fetch it on press rather than after the fade: the request
       then overlaps the fade instead of following it. Matters most for
       Projects, which opts out of viewport prefetching. A no-op for a route
       already in the router cache. */
    function onPointerDown(event: PointerEvent) {
      const url = routeTarget(event);
      if (url) router.prefetch(url.pathname);
    }

    function onClick(event: MouseEvent) {
      const url = routeTarget(event);
      if (!url || prefersReducedMotion() || !page.current) return;
      /* Covers keyboard activation, which has no pointerdown. */
      router.prefetch(url.pathname);

      /* Runs in the capture phase on window, ahead of next/link's handler,
         which bails on a prevented event — so the route waits for the fade. */
      event.preventDefault();

      /* A fast second click replaces the exit in flight rather than stacking. */
      cancelExit.current?.();

      const animation = page.current.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: PAGE_EXIT_MS,
        easing: EASE,
        /* Hold at 0 until the new page replaces this one. */
        fill: 'forwards',
      });

      /* onfinish can silently never fire (backgrounded tab, dropped frame), so a
         timeout commits too; the flag makes whichever lands second a no-op. */
      let done = false;
      const commit = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        router.push(url.pathname + url.search + url.hash);
      };
      const timer = setTimeout(commit, PAGE_EXIT_MS + 60);
      animation.onfinish = commit;

      cancelExit.current = () => {
        done = true;
        clearTimeout(timer);
        animation.cancel();
      };
    }

    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('click', onClick, true);
    };
  }, [router]);

  /* Layout effect so the zones are hidden before the new page first paints. */
  useLayoutEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;

    /* Drops the exit's held opacity: 0. The zones below start hidden themselves. */
    cancelExit.current?.();
    cancelExit.current = null;

    const section = page.current?.firstElementChild;
    if (!section || prefersReducedMotion()) return;
    return staggerZones(zonesOf(section), PAGE_ENTER);
  }, [pathname]);

  return (
    <div ref={page} className={styles.page}>
      {children}
    </div>
  );
}

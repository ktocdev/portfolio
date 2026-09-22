'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { EASE, PAGE_ENTER, PAGE_EXIT_MS, prefersReducedMotion, staggerZones, zonesOf } from '@/lib/motion';
import { useHydrated } from '@/lib/useHydrated';
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

/* When the loader turns into the slow message, and the cap that reveals the
   page regardless. Its 400ms grace period is CSS ([data-loader] in globals.css). */
const SLOW_AFTER_MS = 8000;
const READY_CAP_MS = 15000;

/**
 * Resolves once the page's fonts and images are in. Only images that will
 * actually load count: a display:none carousel slide, or a lazy image far
 * below the fold, never fires load and would hold the loader to its cap.
 */
function whenReady(page: HTMLElement): Promise<unknown> {
  const pending = [...page.querySelectorAll('img')].filter((img) => {
    if (img.complete) return false;
    const rects = img.getClientRects();
    if (rects.length === 0) return false;
    return !(img.loading === 'lazy' && rects[0].top > window.innerHeight * 1.5);
  });

  return Promise.all([
    document.fonts.ready,
    ...pending.map(
      (img) =>
        new Promise((resolve) => {
          /* error counts too: a broken image must not hold the page hostage. */
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        }),
    ),
  ]);
}

/**
 * The page container inside <main>. On an internal link click the current
 * page fades out (150ms) before the route commits; once the new page is in,
 * its section's zones rise one after another. Back/forward skip the fade and
 * only rise. Reduced motion skips both.
 *
 * It also owns the page loader, which covers the page while its fonts and
 * images load — on first load and after every route change. It sits in the
 * same grid cell as the page, so it covers without shifting layout, and it
 * stays invisible for its first 400ms so a fast load never flashes it.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const page = useRef<HTMLDivElement>(null);
  const shownPath = useRef(pathname);
  const cancelExit = useRef<(() => void) | null>(null);
  const cancelEnter = useRef<(() => void) | null>(null);
  /* The path whose page has finished loading. Ready is derived from it, so a
     route change is "not ready" in the same render that brings the new page
     in — the loader never misses a frame. Null on the server, so the
     loader is in the first HTML and covers a slow first load before any
     script runs. */
  const [readyPath, setReadyPath] = useState<string | null>(null);
  const ready = readyPath === pathname;
  const readyToken = useRef(0);

  /* The page a navigation left from, while its fetch is in flight. On a slow
     connection most of the wait is here — before the new route commits —
     so the loader covers it too. Keyed to the origin page, so any route
     change (including back/forward) ends it without an effect. */
  const [leaving, setLeaving] = useState<string | null>(null);
  const navigating = leaving !== null && leaving === normalise(pathname);
  const loading = !ready || navigating;
  const hydrated = useHydrated();

  const rise = useCallback(() => {
    cancelEnter.current?.();
    cancelEnter.current = null;
    const section = page.current?.firstElementChild;
    if (!section || prefersReducedMotion()) return;
    cancelEnter.current = staggerZones(zonesOf(section), PAGE_ENTER);
  }, []);

  /* A token guards each check, so a slow check left over from the previous
     page can't clear the loader for this one. setTimeout rather than rAF:
     rAF never fires in a hidden tab, which would leave the loader up. */
  const checkReady = useCallback(
    (path: string, afterRouteChange: boolean) => {
      const token = ++readyToken.current;

      let settled = false;
      const done = () => {
        if (settled || token !== readyToken.current) return;
        settled = true;
        setReadyPath(path);

        /* The new page was held hidden until now, so this is its first
           visible frame: rise from here. */
        if (afterRouteChange) rise();

        /* Focus follows the route change only once there is a page to land on. */
        if (afterRouteChange) {
          const main = page.current?.parentElement;
          main?.focus({ preventScroll: true });
        }
      };

      /* The cap starts now, outside the deferred check, so nothing can skip it. */
      setTimeout(done, READY_CAP_MS);
      setTimeout(() => {
        if (token !== readyToken.current || !page.current) return;
        whenReady(page.current).then(done);
      }, 0);
    },
    [rise],
  );

  /* First load: the server-rendered loader clears once the page is ready. */
  const firstPath = useRef(pathname);
  useEffect(() => {
    checkReady(firstPath.current, false);
  }, [checkReady]);

  /* aria-busy lives on <main>, which the server layout renders. */
  useEffect(() => {
    page.current?.parentElement?.setAttribute('aria-busy', String(loading));
  }, [loading]);

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
        /* Mounted as the fade ends, so its 400ms grace starts here: a fetch
           that lands within it never shows the loader. */
        const from = normalise(window.location.pathname);
        setLeaving(from);
        /* Same 15s cap as the ready check, should the route never commit. */
        setTimeout(() => setLeaving((current) => (current === from ? null : current)), READY_CAP_MS);
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

  /* Layout effect so the exit's hold is dropped in the same frame the new
     page arrives (hidden, see data-waiting below). */
  useLayoutEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;

    cancelExit.current?.();
    cancelExit.current = null;

    checkReady(pathname, true);
  }, [pathname, rise, checkReady]);

  return (
    <>
      {/* Inert while covered, so Tab can't land on the page under the loader.
          Client only: before hydration nothing would ever lift it.
          data-waiting hides a new route's page until it is ready. Otherwise
          its text rises during the loader's 400ms grace and the loader then
          covers it — a flash of content before the loader. Not on first load,
          which must show before the app's script arrives (readyPath is null
          until then). */}
      <div
        ref={page}
        className={styles.page}
        inert={loading && hydrated}
        data-waiting={loading && readyPath !== null ? '' : undefined}
      >
        {children}
      </div>
      {/* One element across "fetching" and "loading assets", so its fade-in
          and slow timer don't restart when the route commits underneath it. */}
      {loading ? <PageLoader firstLoad={readyPath === null} /> : null}
    </>
  );
}

/**
 * Three stepped squares and a visible "Loading" label, swapped in place for
 * the slow message at 8s. The status role announces both. Its own timer
 * drives the switch, so unmounting on ready is what clears it. The 400ms
 * grace is the CSS delay on [data-loader], as with the video spinner.
 */
function PageLoader({ firstLoad }: { firstLoad: boolean }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    /* On first load the wait began at navigation, not at hydration, which on
       a slow connection can be seconds later. */
    const elapsed = firstLoad ? performance.now() : 0;
    const timer = setTimeout(() => setSlow(true), Math.max(0, SLOW_AFTER_MS - elapsed));
    return () => clearTimeout(timer);
  }, [firstLoad]);

  return (
    <div
      role="status"
      data-loader=""
      data-page-loader=""
      /* See [data-first-load] in globals.css and firstLoadScript in layout.tsx. */
      data-first-load={firstLoad ? '' : undefined}
      className={styles.loader}
    >
      <div className={styles.loaderBox}>
        {slow ? (
          <div className={styles.slow}>
            <p className={styles.slowHeading}>Still loading…</p>
            <p className={styles.slowBody}>This is taking longer than usual. Think happy thoughts!</p>
          </div>
        ) : (
          <div className={styles.loading}>
            <div aria-hidden="true" className={styles.squares}>
              <span data-loader-square="" />
              <span data-loader-square="" />
              <span data-loader-square="" />
            </div>
            <span className={styles.label}>Loading</span>
          </div>
        )}
      </div>
    </div>
  );
}


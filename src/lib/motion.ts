/**
 * The site's motion recipe: a zone-by-zone rise, imperative WAAPI rather than
 * CSS classes because the content it animates is freshly mounted on every
 * route or project change. A page with a [data-flip-heading] flips that in
 * first (GSAP, see flipHeading.ts), and a [data-toss] photo on it is tossed
 * in rather than risen (tossPhoto.ts), and a [data-photo-pile] around it is
 * told to deal its prints on top (PhotoPile.tsx). Everything here is a no-op under
 * prefers-reduced-motion — callers check `prefersReducedMotion()` first.
 */

/* Same curve as --ease in globals.css. */
export const EASE = 'cubic-bezier(.2, .6, .2, 1)';

/* Page level: 150ms fade out, 380/55 rise in. The project detail pane runs the
   same rise faster (320/45) because it fires on every list click. */
export const PAGE_EXIT_MS = 150;
export const PAGE_ENTER = { duration: 380, step: 55 };
export const PANE_ENTER = { duration: 320, step: 45 };

/* Delay cap, so a long list never trails a second behind its first item. */
const MAX_STEP_INDEX = 7;

const RISE: Keyframe[] = [
  { opacity: 0, transform: 'translateY(10px)' },
  { opacity: 1, transform: 'none' },
];

/* A [data-rise="photo"] zone: a screenshot set down on the page, so it comes
   from further, settles from a touch larger, and takes longer about it. */
const PHOTO_RISE: Keyframe[] = [
  { opacity: 0, transform: 'translateY(28px) scale(0.975)' },
  { opacity: 1, transform: 'none' },
];
const PHOTO_RISE_SCALE = 2;

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Zones are the container's direct children. With fewer than three, descend
 * one level for finer zones — but never into a wrapper holding imagery, so a
 * figure (image, crop, overlay) always rises as one unit.
 */
export function zonesOf(container: Element): Element[] {
  let zones = expandZones([...container.children]);
  if (zones.length < 3) {
    zones = zones.flatMap((zone) => (zone.querySelector('img') ? [zone] : [...zone.children]));
  }
  return zones;
}

/* A [data-zones] wrapper is not a zone itself: its children are, all the way
   down, so a page can mark the parts that should rise one after another. */
function expandZones(elements: Element[]): Element[] {
  return elements.flatMap((el) =>
    el.hasAttribute('data-zones') ? expandZones([...el.children]) : [el],
  );
}

/**
 * The image a zone should wait for, if any. Skips images that aren't
 * displayed (an inactive carousel slide, which is lazy and would never load)
 * and anything inside [data-own-loader], which shows its own spinner and
 * must be visible for it to be seen.
 */
function gatingImage(zone: HTMLElement): HTMLImageElement | null {
  const images = zone instanceof HTMLImageElement ? [zone] : [...zone.querySelectorAll('img')];
  return (
    images.find((img) => {
      if (img.complete || img.closest('[data-own-loader]')) return false;
      const rects = img.getClientRects();
      if (rects.length === 0) return false;
      /* A lazy image well below the fold loads only once it's scrolled near,
         and would hold its whole zone invisible until then. */
      return !(img.loading === 'lazy' && rects[0].top > window.innerHeight * 1.5);
    }) ?? null
  );
}

/**
 * Rises each zone in DOM order. A zone whose image has not loaded yet is held
 * at opacity 0 and starts on the image's load (or error — a broken image must
 * still end up visible), so a photo never pops in mid-animation.
 *
 * Returns a cancel function that stops any running rise and releases any
 * zone still waiting on its image.
 */
export function staggerZones(
  zones: Element[],
  { duration, step }: { duration: number; step: number },
): () => void {
  const animations: Animation[] = [];
  const pending: (() => void)[] = [];

  zones.forEach((zone, i) => {
    if (!(zone instanceof HTMLElement)) return;
    const photo = zone.dataset.rise === 'photo';
    const keyframes = photo ? PHOTO_RISE : RISE;
    const options: KeyframeAnimationOptions = {
      duration: photo ? duration * PHOTO_RISE_SCALE : duration,
      delay: Math.min(i, MAX_STEP_INDEX) * step,
      easing: EASE,
      /* A zone waiting on its delay stays invisible instead of flashing. */
      fill: 'backwards',
    };

    const img = gatingImage(zone);
    if (img) {
      zone.style.opacity = '0';
      const start = () => {
        release();
        animations.push(zone.animate(keyframes, options));
      };
      const release = () => {
        img.removeEventListener('load', start);
        img.removeEventListener('error', start);
        zone.style.removeProperty('opacity');
      };
      img.addEventListener('load', start, { once: true });
      img.addEventListener('error', start, { once: true });
      pending.push(release);
      return;
    }

    animations.push(zone.animate(keyframes, options));
  });

  return () => {
    pending.forEach((release) => release());
    animations.forEach((animation) => animation.cancel());
  };
}

const FLIP_HEADING = '[data-flip-heading]';
const TOSS = '[data-toss]';
const PHOTO_PILE = '[data-photo-pile]';
/** Sent to a page's [data-photo-pile] the moment its headshot is tossed. */
export const PILE_DEAL = 'pile:deal';
/* Set by firstLoadScript in layout.tsx; hides the section in globals.css. */
const ENTRANCE_HOLD = 'data-entrance-hold';

/* One load for both, so the page loader covers the whole entrance's code. */
const loadEntrance = () =>
  Promise.all([import('./flipHeading'), import('./tossPhoto')]).then(([flip, toss]) => ({
    ...flip,
    ...toss,
  }));

/* The band is 40% of the button's width (ButtonLink.module.css), so 250% of its
   own width takes it from just off the left edge to just off the right. */
const SHIMMER: Keyframe[] = [{ transform: 'translateX(-100%)' }, { transform: 'translateX(250%)' }];
const SHIMMER_MS = 900;

/**
 * Fetches GSAP for a page that will flip, so the page loader covers the wait.
 * Never rejects: enterPage() falls back to a plain rise if the chunk failed.
 */
export function preloadEntrance(page: Element): Promise<unknown> | null {
  if (!page.querySelector(FLIP_HEADING) || prefersReducedMotion()) return null;
  return loadEntrance().catch(() => null);
}

/**
 * True when a first load's flip can still play. Other pages have no first-load
 * entrance, and once the hold has timed out the page is already on screen.
 */
export function entranceHeld(section: Element | null | undefined): boolean {
  return (
    document.documentElement.hasAttribute(ENTRANCE_HOLD) && !!section?.querySelector(FLIP_HEADING)
  );
}

/**
 * Sweeps the light band across the page's [data-shimmer] button, if it has
 * one, after `delay`: long enough to wait out the rise, so the band crosses
 * the button at full strength.
 */
function sweepShimmer(section: Element, delay: number): Animation | undefined {
  return section.querySelector('[data-shimmer]')?.animate(SHIMMER, {
    pseudoElement: '::after',
    duration: SHIMMER_MS,
    delay,
    easing: 'ease-in-out',
  });
}

/**
 * Enters a page: its heading's flip when it has one, then its other zones rise
 * together while its [data-toss] photo, if any, is tossed in and its photo
 * pile starts dealing. Without a
 * flip, just the staggered rise. Returns a cancel function.
 */
export function enterPage(
  section: Element,
  timing: { duration: number; step: number },
): () => void {
  const zones = zonesOf(section);
  const heading = section.querySelector<HTMLElement>(FLIP_HEADING);
  if (!heading) {
    const cancelRise = staggerZones(zones, timing);
    const shimmer = sweepShimmer(section, timing.duration);
    return () => {
      cancelRise();
      shimmer?.cancel();
    };
  }

  const rest = zones.filter((zone) => zone !== heading);
  const held = [heading, ...rest] as HTMLElement[];
  const show = () => held.forEach((zone) => zone.style.removeProperty('opacity'));

  /* Inline holds take over in this same frame, ahead of the first-load one. */
  held.forEach((zone) => {
    zone.style.opacity = '0';
  });
  document.documentElement.removeAttribute(ENTRANCE_HOLD);

  let cancelled = false;
  let cancelRunning: (() => void) | null = null;
  /* Home's few zones wait for the heading and then rise as one. A long page
     marked data-enter-stagger (projects) rises alongside the flip, top to
     bottom, the way it does when switching projects. */
  const staggered = section.hasAttribute('data-enter-stagger');

  loadEntrance()
    .then(({ flipHeading, tossPhoto }) => {
      if (cancelled) return;
      let cancelRest: (() => void) | null = null;
      const enterRest = () => {
        show();
        /* Same frame as show(), so the photo never paints at rest first. */
        const photo = section.querySelector<HTMLElement>(TOSS);
        const cancelToss = photo ? tossPhoto(photo) : null;
        /* The pile runs its own deal, so the wheel can take it over. */
        section.querySelector(PHOTO_PILE)?.dispatchEvent(new Event(PILE_DEAL));
        /* The photo may be a zone itself or sit in one with its pile. */
        const cancelRise = staggerZones(
          rest.filter((zone) => !photo || !zone.contains(photo)),
          { duration: timing.duration, step: staggered ? timing.step : 0 },
        );
        const shimmer = sweepShimmer(section, timing.duration);
        cancelRest = () => {
          cancelRise();
          cancelToss?.();
          shimmer?.cancel();
        };
      };
      const cancelFlip = flipHeading(heading, () => {
        if (!staggered) enterRest();
      });
      if (staggered) enterRest();
      cancelRunning = () => {
        cancelFlip();
        cancelRest?.();
      };
      heading.style.removeProperty('opacity');
    })
    .catch(() => {
      if (cancelled) return;
      show();
      cancelRunning = staggerZones(zones, timing);
    });

  return () => {
    cancelled = true;
    cancelRunning?.();
    show();
  };
}

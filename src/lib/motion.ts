/**
 * The site's one motion recipe: a zone-by-zone rise, imperative WAAPI rather
 * than CSS classes because the content it animates is freshly mounted on
 * every route or project change. Everything here is a no-op under
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

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Zones are the container's direct children. With fewer than three, descend
 * one level for finer zones — but never into a wrapper holding imagery, so a
 * figure (image, crop, overlay) always rises as one unit.
 */
export function zonesOf(container: Element): Element[] {
  let zones = [...container.children];
  if (zones.length < 3) {
    zones = zones.flatMap((zone) => (zone.querySelector('img') ? [zone] : [...zone.children]));
  }
  return zones;
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
    images.find(
      (img) => !img.complete && img.getClientRects().length > 0 && !img.closest('[data-own-loader]'),
    ) ?? null
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
    const options: KeyframeAnimationOptions = {
      duration,
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
        animations.push(zone.animate(RISE, options));
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

    animations.push(zone.animate(RISE, options));
  });

  return () => {
    pending.forEach((release) => release());
    animations.forEach((animation) => animation.cancel());
  };
}

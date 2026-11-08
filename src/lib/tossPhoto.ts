import gsap from 'gsap';

/* Where the photo starts: up and to the right, nearer the viewer (scale), and
   turned further than it lands. Rotations are degrees past the frame's
   resting tilt, so 0 is at rest. */
const AIRBORNE = { x: 90, y: -140, scale: 1.22, rotation: 9, '--lift': 1 };

/* Where it touches down: a little short of rest, still carrying the throw's
   drift, which the slide then spends. */
const TOUCHDOWN = { x: 12, y: -5, scale: 1, rotation: 1.5, '--lift': 0 };

/**
 * Tosses a photo onto the page as if the screen were a table: it falls toward
 * the surface, its shadow tightening as it nears, touches down with a soft
 * hop, and slides to rest at its resting tilt. Loaded alongside flipHeading,
 * so it shares that chunk's GSAP. Returns a cancel function that leaves the
 * photo at rest.
 */
export function tossPhoto(photo: HTMLElement): () => void {
  /* The resting tilt is the CSS `rotate` in Figure.module.css. GSAP folds that
     into its own transform (setting rotate: none inline), so its rotations
     are absolute and must end on the tilt, or the photo lands square and
     snaps to the tilt when clearProps hands it back to the CSS. Read before
     the first set, while the CSS still applies. */
  const rest = parseFloat(getComputedStyle(photo).rotate) || 0;

  gsap.set(photo, { ...AIRBORNE, rotation: rest + AIRBORNE.rotation, autoAlpha: 0 });

  const timeline = gsap.timeline({ onComplete: () => gsap.set(photo, { clearProps: 'all' }) });
  timeline
    .to(photo, { autoAlpha: 1, duration: 0.15, ease: 'none' }, 0)
    /* In, not out: it gathers speed as it drops. */
    .to(
      photo,
      { ...TOUCHDOWN, rotation: rest + TOUCHDOWN.rotation, duration: 0.7, ease: 'power1.in' },
      0,
    )
    .addLabel('down')
    .to(photo, { x: 0, y: 0, rotation: rest, duration: 0.6, ease: 'power3.out' }, 'down')
    /* Paper is light: it lifts a hair off the table once before it settles. */
    .to(
      photo,
      { scale: 1.012, '--lift': 0.06, duration: 0.13, ease: 'sine.out', yoyo: true, repeat: 1 },
      'down',
    );

  return () => {
    timeline.kill();
    gsap.set(photo, { clearProps: 'all' });
  };
}

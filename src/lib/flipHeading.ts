import gsap from 'gsap';

/* Timed like speech, one cue per word: "Hi," (beat) "I'm Katie." Seconds; hold
   is the silence between the last word landing and this one starting, and a
   negative hold starts this one before the last has landed. */
const CUES = [
  { hold: 0, duration: 0.7 },
  { hold: -0.09, duration: 0.45 },
  { hold: -0.25, duration: 0.6 },
];

/* Decelerates with no overshoot; out, so a word shows from the start of its cue. */
const EASE = 'power2.out';

/* The flip starts as the app hydrates, and a long frame there would skip most
   of the first word. Any gap over 50ms counts as one 16ms frame instead. */
gsap.ticker.lagSmoothing(50, 16);

/**
 * Flips a heading's words in on the horizontal axis, on CUES. Loaded on
 * demand by enterPage() in motion.ts, so GSAP stays out of every other page's
 * bundle. Returns a cancel function that leaves the words at rest.
 */
export function flipHeading(heading: HTMLElement, onComplete: () => void): () => void {
  const words = [...heading.children];

  /* Set up front: the caller unhides the heading as soon as this returns, and
     a later word must stay hidden until its cue. */
  gsap.set(words, { rotationX: -90, autoAlpha: 0, transformPerspective: 600 });

  const timeline = gsap.timeline({ onComplete });
  words.forEach((word, i) => {
    /* A word added to the heading takes the last cue rather than staying hidden. */
    const { hold, duration } = CUES[i] ?? CUES[CUES.length - 1];
    timeline.to(
      word,
      { rotationX: 0, autoAlpha: 1, duration, ease: EASE, clearProps: 'all' },
      timeline.duration() + hold,
    );
  });

  return () => {
    timeline.kill();
    gsap.set(words, { clearProps: 'all' });
  };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Slide } from '@/content/projects';
import styles from './Carousel.module.css';

type CarouselProps = {
  slides: Slide[];
  projectName: string;
};

/**
 * Stepping carousel with wraparound.
 *
 * The parent mounts this with `key={project.slug}`, so selecting a different
 * project remounts it: the index resets to 0 and every video unmounts, which
 * is both simpler and safer than reconciling an index against a new, possibly
 * shorter, slide list.
 */
export default function Carousel({ slides, projectName }: CarouselProps) {
  const [index, setIndex] = useState(0);
  /* Sticky across steps on purpose: someone reading descriptions wants the
     next one too, without re-pressing every slide. */
  const [showInfo, setShowInfo] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  /* Slides are all mounted and toggled with `display`, so navigating away from
     a playing video has to stop it explicitly. display:none also drops hidden
     slides from the tab order and the accessibility tree. */
  const pauseVideos = useCallback(() => {
    stageRef.current?.querySelectorAll('video').forEach((video) => {
      video.pause();
    });
  }, []);

  const total = slides.length;

  const step = useCallback(
    (delta: number) => {
      pauseVideos();
      setIndex((current) => (current + delta + total) % total);
    },
    [pauseVideos, total],
  );

  if (total === 0) return null;

  /* Fallback alt text for slides without real copy: silent video needs a text alternative too, and gets no accessible name from the element itself. */
  const describe = (slide: Slide) =>
    slide.alt ??
    `${slide.label} — ${slide.type === 'video' ? 'screen recording' : 'screenshot'} from ${projectName}`;

  /* Info control only appears when `alt` is real copy — the generated
     fallback stays on the media itself, not surfaced here. */
  const description = slides[index].alt;

  return (
    <div className={styles.carousel}>
      <div ref={stageRef} className={styles.stage}>
        {slides.map((slide, i) => (
          <div key={slide.src} className={styles.slide} data-active={i === index || undefined}>
            {slide.type === 'video' ? (
              <VideoSlide src={slide.src} label={describe(slide)} active={i === index} />
            ) : (
              /* Only stills are linked — a video click belongs to its own controls.
                 Alt stays on the img so the link inherits it as its name. */
              <a href={slide.src} target="_blank" rel="noopener" className={styles.mediaLink}>
                <img className={styles.media} src={slide.src} alt={describe(slide)} loading="lazy" />
                <span className="visuallyHidden"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        ))}

        {description ? (
          <>
            {/* No aria-label: the visible word "Info" is the accessible name
                (2.5.3). State lives in aria-expanded instead. */}
            <button
              type="button"
              onClick={() => setShowInfo((open) => !open)}
              aria-expanded={showInfo}
              className={styles.infoButton}
            >
              Info
            </button>
            {/* Hidden from assistive tech: it's the same string the media's
                alt already carries, so screen readers have heard it already. */}
            <p aria-hidden="true" className={styles.info} data-open={showInfo || undefined}>
              {description}
            </p>
          </>
        ) : null}
      </div>

      <div className={styles.controls}>
        <div role="group" aria-label="Carousel controls" className={styles.buttons}>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous slide"
            className={styles.stepButton}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next slide"
            className={styles.stepButton}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* role="status" announces each step, since the label/counter change alone reaches no screen reader. */}
        <div role="status" className={styles.status}>
          <span className={styles.slideLabel}>{slides[index].label}</span>
          <span className={styles.counter}>
            <span aria-hidden="true">
              {index + 1} / {total}
            </span>
            {/* The slash is read as punctuation, or skipped. Same fact, said. */}
            <span className="visuallyHidden">
              Slide {index + 1} of {total}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* Videos that have reached metadata at least once, by src. Module-level so it
   outlives the carousel's remount on project change: coming back to a video
   that already loaded doesn't flash the spinner. */
const readyVideos = new Set<string>();

type VideoSlideProps = {
  src: string;
  label: string;
  active: boolean;
};

/**
 * A video slide with its buffering spinner. The spinner shows only on the
 * current slide, while the video has no data yet or has stalled mid-play.
 * metadata counts as ready on purpose: with preload="metadata", Safari fires
 * nothing further until play is pressed, so waiting for canplay would spin
 * forever over a playable video.
 */
function VideoSlide({ src, label, active }: VideoSlideProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [buffering, setBuffering] = useState(() => !readyVideos.has(src));

  /* Bound once per element with addEventListener. */
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const onReady = () => {
      readyVideos.add(src);
      setBuffering(false);
    };
    const onWaiting = () => setBuffering(true);
    /* A broken file hides the spinner rather than spinning forever. */
    const onError = () => setBuffering(false);

    const ready = ['loadedmetadata', 'canplay', 'playing'];
    ready.forEach((type) => video.addEventListener(type, onReady));
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('error', onError);

    /* The metadata may have arrived before the listeners did. */
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onReady();

    return () => {
      ready.forEach((type) => video.removeEventListener(type, onReady));
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('error', onError);
    };
  }, [src]);

  return (
    <>
      <video
        ref={ref}
        className={styles.media}
        src={src}
        aria-label={label}
        controls
        muted
        playsInline
        /* Every slide is mounted, so only the visible one may fetch
           ahead — otherwise nine videos hit the network on selection. */
        preload={active ? 'metadata' : 'none'}
      />
      {active && buffering ? (
        /* pointer-events:none in the CSS keeps the native controls usable
           underneath. */
        <div role="status" data-loader="" className={styles.buffering}>
          <span aria-hidden="true" className={styles.ring} />
          <span className={styles.bufferingLabel}>Buffering video</span>
        </div>
      ) : null}
    </>
  );
}

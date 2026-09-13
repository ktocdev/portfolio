'use client';

import { useCallback, useRef, useState } from 'react';

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

  return (
    <div className={styles.carousel}>
      <div ref={stageRef} className={styles.stage}>
        {slides.map((slide, i) => (
          <div key={slide.src} className={styles.slide} data-active={i === index || undefined}>
            {slide.type === 'video' ? (
              <video
                className={styles.media}
                src={slide.src}
                aria-label={describe(slide)}
                controls
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img className={styles.media} src={slide.src} alt={describe(slide)} loading="lazy" />
            )}
          </div>
        ))}
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

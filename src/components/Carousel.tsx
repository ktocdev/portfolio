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

  /* Videos here are silent screen recordings — video-only content, which needs
     a text alternative just as much as a still does, and gets no accessible
     name at all from the element itself. Until a slide is given real `alt`
     copy, this at least says what kind of media it is and where it is from,
     rather than announcing the one-word chip twice or nothing whatsoever. */
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

        {/* Stepping is otherwise silent: the label and counter change on screen
            and nothing reaches a screen reader at all. role="status" is polite
            and atomic, so each press announces the whole thing once. */}
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

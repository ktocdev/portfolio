'use client';

import { useCallback, useRef, useState } from 'react';

import type { Slide } from '@/content/projects';
import styles from './Carousel.module.css';

type CarouselProps = {
  slides: Slide[];
};

/**
 * Stepping carousel with wraparound.
 *
 * The parent mounts this with `key={project.slug}`, so selecting a different
 * project remounts it: the index resets to 0 and every video unmounts, which
 * is both simpler and safer than reconciling an index against a new, possibly
 * shorter, slide list.
 */
export default function Carousel({ slides }: CarouselProps) {
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

  return (
    <div className={styles.carousel}>
      <div ref={stageRef} className={styles.stage}>
        {slides.map((slide, i) => (
          <div key={slide.src} className={styles.slide} data-active={i === index || undefined}>
            {slide.type === 'video' ? (
              <video
                className={styles.media}
                src={slide.src}
                controls
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img className={styles.media} src={slide.src} alt={slide.label} loading="lazy" />
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

        <div className={styles.status}>
          <span className={styles.slideLabel}>{slides[index].label}</span>
          <span className={styles.counter}>
            {index + 1} / {total}
          </span>
        </div>
      </div>
    </div>
  );
}

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
              <video
                className={styles.media}
                src={slide.src}
                aria-label={describe(slide)}
                controls
                muted
                playsInline
                /* Every slide is mounted, so only the visible one may fetch
                   ahead — otherwise nine videos hit the network on selection. */
                preload={i === index ? 'metadata' : 'none'}
              />
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

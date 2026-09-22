'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Slide } from '@/content/projects';
import { useHydrated } from '@/lib/useHydrated';
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
    /* data-own-loader: the rise in lib/motion.ts doesn't hold this at
       opacity 0 for its images, or the spinner would load unseen. */
    <div className={styles.carousel} data-own-loader="">
      <div ref={stageRef} className={styles.stage}>
        {slides.map((slide, i) => (
          <div key={slide.src} className={styles.slide} data-active={i === index || undefined}>
            {slide.type === 'video' ? (
              <VideoSlide src={slide.src} label={describe(slide)} active={i === index} />
            ) : (
              <ImageSlide src={slide.src} alt={describe(slide)} active={i === index} />
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

/**
 * The ring over the current slide while its media loads. Only after
 * hydration: in the server HTML nothing could take it down before the app's
 * script arrives. Faded in after the shared 400ms grace ([data-loader] in
 * globals.css). pointer-events:none keeps a video's native controls usable.
 */
function MediaSpinner() {
  return (
    <div role="status" data-loader="" className={styles.spinner}>
      <span aria-hidden="true" className={styles.ring} />
      <span className="visuallyHidden">Loading</span>
    </div>
  );
}

type SlideProps = {
  src: string;
  active: boolean;
};

/* Only stills are linked — a video click belongs to its own controls. Alt
   stays on the img so the link inherits it as its name. The spinner covers
   the current slide until its image loads; lazy, so a slide's image only
   starts loading once it is stepped to. */
function ImageSlide({ src, alt, active }: SlideProps & { alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const hydrated = useHydrated();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    /* error counts as done: a broken image must not spin forever. */
    const onDone = () => setLoaded(true);
    img.addEventListener('load', onDone);
    img.addEventListener('error', onDone);
    /* It may have finished (or come from cache) before the listeners did. */
    if (img.complete) onDone();
    return () => {
      img.removeEventListener('load', onDone);
      img.removeEventListener('error', onDone);
    };
  }, [src]);

  return (
    <>
      <a href={src} target="_blank" rel="noopener" className={styles.mediaLink}>
        <img ref={ref} className={styles.media} src={src} alt={alt} loading="lazy" />
        <span className="visuallyHidden"> (opens in a new tab)</span>
      </a>
      {active && hydrated && !loaded ? <MediaSpinner /> : null}
    </>
  );
}

/* Videos that have shown a frame (or been played) at least once, by src.
   Module-level so it outlives the carousel's remount on project change:
   coming back to a video that already loaded doesn't flash the spinner. */
const readyVideos = new Set<string>();

/* If a browser stops at metadata and never decodes a first frame (Safari
   can, under preload="metadata"), stop spinning over a video that is
   playable anyway. */
const FIRST_FRAME_CAP_MS = 6000;

/**
 * A video slide with its loading spinner. The spinner covers only the wait
 * before the video first shows: until the first frame is decoded
 * (loadeddata), or until play is pressed, whichever comes first.
 *
 * The native controls are withheld for that same wait. The browser's own
 * loading spinner lives inside its controls and can't be styled away (in
 * Chrome it is an internal element author CSS can't reach), so leaving the
 * controls off is the only way to keep it from stacking on ours. Once the
 * first frame is in, ours goes and the controls come back, and from then on
 * buffering belongs to them.
 */
function VideoSlide({ src, label, active }: SlideProps & { label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const hydrated = useHydrated();
  const [loading, setLoading] = useState(() => !readyVideos.has(src));

  /* Bound once per element with addEventListener. */
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    let cap: ReturnType<typeof setTimeout> | undefined;
    const onReady = () => {
      clearTimeout(cap);
      readyVideos.add(src);
      setLoading(false);
    };
    /* A broken file hides the spinner rather than spinning forever. */
    const onError = () => {
      clearTimeout(cap);
      setLoading(false);
    };
    const onMetadata = () => {
      clearTimeout(cap);
      cap = setTimeout(onReady, FIRST_FRAME_CAP_MS);
    };

    const ready = ['loadeddata', 'play', 'playing'];
    ready.forEach((type) => video.addEventListener(type, onReady));
    video.addEventListener('loadedmetadata', onMetadata);
    video.addEventListener('error', onError);

    /* The first frame may have arrived before the listeners did. */
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onReady();
    else if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMetadata();

    return () => {
      clearTimeout(cap);
      ready.forEach((type) => video.removeEventListener(type, onReady));
      video.removeEventListener('loadedmetadata', onMetadata);
      video.removeEventListener('error', onError);
    };
  }, [src]);

  return (
    <>
      <video
        ref={ref}
        className={styles.media}
        /* The media fragment makes Safari decode and show the first frame
           under preload="metadata"; other browsers already do. */
        src={`${src}#t=0.001`}
        aria-label={label}
        /* On until hydration, so the server HTML is playable without script;
           see the note above for why they are off while loading. */
        controls={!hydrated || !loading}
        muted
        playsInline
        /* Every slide is mounted, so only the visible one may fetch
           ahead — otherwise nine videos hit the network on selection. */
        preload={active ? 'metadata' : 'none'}
      />
      {active && hydrated && loading ? <MediaSpinner /> : null}
    </>
  );
}

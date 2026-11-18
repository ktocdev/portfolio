'use client';

import { useState } from 'react';

import type { Slide } from '@/content/projects';
import styles from './page.module.css';

type Variant = 'sheet' | 'tabs' | 'stack';

/**
 * Lab prototypes for the project carousel's controls: the same widescreen
 * stage, three ways of dressing it in the paper language. Not production
 * code — no spinner, no video pausing, no keyboard polish beyond buttons.
 */
export default function CarouselConcepts({ slides }: { slides: Slide[] }) {
  return (
    <div className={styles.concepts}>
      <Concept
        variant="sheet"
        name="A · Sheet"
        blurb="The stage mounted on a paper sheet. Round paper step buttons, the slide's title in the display face, a dot row for position. Info opens a caption drawer under the image instead of covering it."
        slides={slides}
      />
      <Concept
        variant="tabs"
        name="B · Index tabs"
        blurb="Slide labels as paper index tabs along the stage's foot — click one to jump. Arrows float over the image's sides as paper discs. The description is always shown as a caption; no Info button."
        slides={slides}
      />
      <Concept
        variant="stack"
        name="C · Stack & tape"
        blurb="Sheets peeking out behind the stage say there's more. Title and count on a strip of tape across the top edge, like the case-study cards. Paper pill arrows on the lower corners; Info pins a sticky note over the corner."
        slides={slides}
      />
    </div>
  );
}

function Concept({
  variant,
  name,
  blurb,
  slides,
}: {
  variant: Variant;
  name: string;
  blurb: string;
  slides: Slide[];
}) {
  const [index, setIndex] = useState(0);
  const [info, setInfo] = useState(false);
  const total = slides.length;
  const slide = slides[index];
  const step = (delta: number) => setIndex((i) => (i + delta + total) % total);

  const media =
    slide.type === 'video' ? (
      <video key={slide.src} className={styles.media} src={slide.src} muted loop autoPlay playsInline />
    ) : (
      <img key={slide.src} className={styles.media} src={slide.src} alt={slide.alt ?? slide.label} />
    );

  return (
    <section className={styles.concept} aria-label={name}>
      <header className={styles.conceptHead}>
        <h2 className={styles.conceptName}>{name}</h2>
        <p className={styles.conceptBlurb}>{blurb}</p>
      </header>

      {variant === 'sheet' ? (
        <div className={styles.sheet}>
          <div className={styles.stage}>{media}</div>
          <div className={styles.sheetDrawer} data-open={info || undefined}>
            <p>{slide.alt}</p>
          </div>
          <div className={styles.sheetBar}>
            <div className={styles.sheetSteps}>
              <PaperButton round label="Previous slide" onClick={() => step(-1)}>
                ←
              </PaperButton>
              <PaperButton round label="Next slide" onClick={() => step(1)}>
                →
              </PaperButton>
            </div>
            <div className={styles.sheetTitle}>
              <span className={styles.slideName}>{slide.label}</span>
              <span className={styles.count}>
                {index + 1} of {total}
              </span>
            </div>
            <button
              type="button"
              className={styles.textButton}
              aria-expanded={info}
              onClick={() => setInfo((v) => !v)}
            >
              {info ? 'Hide note' : 'About this screen'}
            </button>
          </div>
          <div className={styles.dots} aria-hidden="true">
            {slides.map((s, i) => (
              <span key={s.src} data-on={i === index || undefined} />
            ))}
          </div>
        </div>
      ) : null}

      {variant === 'tabs' ? (
        <div className={styles.tabsWrap}>
          <div className={`${styles.stage} ${styles.tabsStage}`}>
            {media}
            <PaperButton round label="Previous slide" onClick={() => step(-1)} className={styles.edgeLeft}>
              ←
            </PaperButton>
            <PaperButton round label="Next slide" onClick={() => step(1)} className={styles.edgeRight}>
              →
            </PaperButton>
          </div>
          <div className={styles.tabs} role="tablist" aria-label="Screens">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={styles.tab}
                onClick={() => setIndex(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className={styles.caption}>{slide.alt}</p>
        </div>
      ) : null}

      {variant === 'stack' ? (
        <div className={styles.stackWrap}>
          <span aria-hidden="true" className={styles.stackSheet} />
          <span aria-hidden="true" className={styles.stackSheet} />
          <div className={styles.stackFront}>
            <div className={styles.tape}>
              <span className={styles.slideName}>{slide.label}</span>
              <span className={styles.count}>
                {index + 1}/{total}
              </span>
            </div>
            <div className={styles.stage}>{media}</div>
            <div className={styles.stackBar}>
              <PaperButton label="Previous slide" onClick={() => step(-1)}>
                ← Prev
              </PaperButton>
              <button
                type="button"
                className={styles.textButton}
                aria-expanded={info}
                onClick={() => setInfo((v) => !v)}
              >
                {info ? 'Unpin note' : 'Pin a note'}
              </button>
              <PaperButton label="Next slide" onClick={() => step(1)}>
                Next →
              </PaperButton>
            </div>
            {info ? <p className={styles.sticky}>{slide.alt}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PaperButton({
  children,
  label,
  onClick,
  round,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  round?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[styles.paperButton, round ? styles.round : '', className ?? ''].join(' ')}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

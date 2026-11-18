'use client';

import { useState } from 'react';

import { IMAGES } from '@/content/site';
import styles from './TalkingHead.module.css';

/* Everything is drawn in the headshot's own pixels (1600×900), so each shape
   below is traced straight off the photo. */
const PHOTO = { width: 1600, height: 900 };

/* The eye openings, corner to corner along each lid. */
const EYES = [
  'M764 221 Q797 198 826 224 Q797 233 764 221 Z',
  'M894 225 Q927 198 960 229 Q927 236 894 225 Z',
];

/* The cut-out jaw: along the bottom of the top teeth, down from the mouth's
   corners, round the bottom edge of the chin, just above its shadow. It drops
   on its own like a paper puppet's, and behind it the same shape is painted
   as the inside of the mouth. */
const JAW =
  'M789 339 Q856 380 924 342 L936 360 C952 402 908 433 853 433 C800 433 760 402 777 358 Z';

/* The bubble's tail runs from its body to just off the right corner of the
   mouth. */
const BUBBLE = { cx: 1150, cy: 228, rx: 135, ry: 82 };
const TAIL = 'M1050 262 L945 345 L1085 290 Z';
const WORD = [
  { letter: 'A', x: 1078 },
  { letter: 'P', x: 1150 },
  { letter: 'P', x: 1222 },
];

/**
 * The headshot, possessed: a second in, the eyes go blank white, a speech
 * bubble pops open and the jaw flaps out "APP" a letter at a time. All CSS
 * (TalkingHead.module.css); "Again" replays it by remounting the drawing.
 */
export default function TalkingHead() {
  const [take, setTake] = useState(0);

  return (
    <div className={styles.stage}>
      <svg
        key={take}
        className={styles.frame}
        viewBox="520 0 960 640"
        role="img"
        aria-label="Katie's headshot: her eyes turn white and her jaw flaps open to say “APP”."
      >
        <defs>
          <clipPath id="jaw-cut">
            <path d={JAW} />
          </clipPath>
          <radialGradient id="eye-white" cx="50%" cy="60%" r="60%">
            <stop offset="55%" stopColor="#fff" />
            <stop offset="100%" stopColor="#d9d4cf" />
          </radialGradient>
        </defs>

        <image href={IMAGES.headshot.src} width={PHOTO.width} height={PHOTO.height} />

        <g className={styles.eyes}>
          {EYES.map((d) => (
            <path key={d} d={d} fill="url(#eye-white)" />
          ))}
        </g>

        <path d={JAW} className={styles.mouth} />
        <g className={styles.jaw}>
          <image
            href={IMAGES.headshot.src}
            width={PHOTO.width}
            height={PHOTO.height}
            clipPath="url(#jaw-cut)"
          />
        </g>

        <g className={styles.bubble}>
          <path d={TAIL} className={styles.ink} />
          <ellipse {...BUBBLE} className={styles.ink} />
          {/* The tail again, unstroked, to rub out the ellipse's outline where
              the two join. */}
          <path d={TAIL} className={styles.paper} />
          {WORD.map(({ letter, x }, i) => (
            <text
              key={i}
              x={x}
              y={BUBBLE.cy + 38}
              className={styles.letter}
              style={{ '--i': i } as React.CSSProperties}
            >
              {letter}
            </text>
          ))}
        </g>
      </svg>

      <button type="button" className={styles.again} onClick={() => setTake((n) => n + 1)}>
        Again
      </button>
    </div>
  );
}

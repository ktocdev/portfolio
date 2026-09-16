import { Fragment, type ReactNode } from 'react';

/* Hyphenated names the browser would otherwise split at a line end, which
   reads as two words in a printed resume. */
const TERMS = ['nebula-nuxt'];
const PATTERN = new RegExp(`(${TERMS.join('|')})`, 'g');

/**
 * Wraps each known term in a no-wrap span so it stays on one line. Plain
 * text passes through untouched, so this is safe on every bullet.
 */
export function keepTogether(text: string): ReactNode {
  const parts = text.split(PATTERN);
  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    TERMS.includes(part) ? (
      <span key={i} className="nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

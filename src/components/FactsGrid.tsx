'use client';

import { useEffect, useRef, useState } from 'react';

import Figure from './Figure';
import type { Fact } from '@/content/projects';
import { IMAGES } from '@/content/site';
import styles from './FactsGrid.module.css';

type FactsGridProps = {
  facts: Fact[];
};

/**
 * Six facts in an auto-fit grid, so the column count changes with width and
 * the last row is often short. Rather than leave a ragged hole, a photograph
 * is dropped in spanning exactly the leftover columns.
 *
 * The count has to be measured rather than computed: `auto-fit` resolves
 * against the container, which no media query here knows the width of.
 */
export default function FactsGrid({ facts }: FactsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    const measure = () => {
      /* Resolved grid-template-columns is a list of used pixel values, so its
         length is the rendered column count. */
      const resolved = getComputedStyle(element).gridTemplateColumns;
      const count = resolved.split(' ').filter(Boolean).length || 1;
      setColumns(count);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();

    return () => observer.disconnect();
  }, []);

  const remainder = facts.length % columns;
  const fillerSpan = remainder === 0 ? 0 : columns - remainder;

  return (
    <div ref={gridRef} className={styles.grid}>
      {facts.map((fact) => (
        /* One <dl> per cell (filler photo needs to be a grid item, and <figure> can't sit in a <dl>); dt=value here since labels read as the sentence's back half. */
        <dl key={fact.label} className={styles.cell}>
          <dt className={styles.value}>{fact.value}</dt>
          <dd className={styles.label}>{fact.label}</dd>
        </dl>
      ))}

      {fillerSpan > 0 ? (
        <Figure
          src={IMAGES.zinnias.src}
          alt={IMAGES.zinnias.alt}
          variant="facts"
          className={styles.filler}
          // Inline because the span is a measured runtime value.
          style={{ gridColumn: `span ${fillerSpan}` }}
        />
      ) : null}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

import {
  CATEGORIES,
  currentConsent,
  subscribeConsent,
  writeConsent,
  type CategoryInfo,
  type ConsentChoice,
  type ConsentState,
} from '@/lib/consent';
import styles from './CookieSettings.module.css';

const STATUS: Record<CategoryInfo['id'], Record<ConsentChoice | 'undecided', string>> = {
  analytics: {
    granted: 'Analytics are on. Thank you — this helps me see how the site is used.',
    denied: 'Analytics are off. No Google Analytics cookies will be set.',
    undecided: "You haven't chosen yet, so analytics are off by default.",
  },
  recording: {
    granted: 'Session recording is on. Thank you — this shows me where the site is confusing.',
    denied: 'Session recording is off. No Clarity cookies will be set.',
    undecided: "You haven't chosen yet, so session recording is off by default.",
  },
};

/**
 * The controls on the /cookies page, one per configured category. Reflects
 * the stored choices and lets the visitor change them; writing through the
 * shared helper updates the banner and the analytics tags live, without a
 * reload.
 *
 * Native radios keep each group fully keyboard- and screen-reader-operable for
 * free (arrow keys, roving focus, group semantics from the fieldset).
 */
export default function CookieSettings() {
  /* null until the stored choice loads: neither radio is checked, so there's
     no flash of the wrong state before the effect runs. */
  const [state, setState] = useState<ConsentState | null>(null);

  useEffect(() => {
    const sync = () => setState(currentConsent());
    sync();
    /* Reflect changes made elsewhere — the banner, or another tab. */
    return subscribeConsent(sync);
  }, []);

  return (
    <div className={styles.groups}>
      {CATEGORIES.map((category) => (
        <CategoryControl
          key={category.id}
          category={category}
          choice={state ? (state[category.id] ?? 'undecided') : null}
          onChoose={(choice) => {
            setState((s) => ({ ...s, [category.id]: choice }));
            writeConsent({ [category.id]: choice });
          }}
        />
      ))}
    </div>
  );
}

function CategoryControl({
  category,
  choice,
  onChoose,
}: {
  category: CategoryInfo;
  choice: ConsentChoice | 'undecided' | null;
  onChoose: (choice: ConsentChoice) => void;
}) {
  const name = `consent-${category.id}`;
  const descId = `${name}-desc`;

  return (
    <fieldset className={styles.fieldset} aria-describedby={descId}>
      <legend className={styles.legend}>
        {category.label} <span className={styles.vendor}>· {category.vendor}</span>
      </legend>
      <p id={descId} className={styles.description}>
        {category.description}
      </p>

      <div className={styles.options}>
        <label className={styles.option}>
          <input
            type="radio"
            name={name}
            className={styles.input}
            checked={choice === 'granted'}
            onChange={() => onChoose('granted')}
          />
          <span>On</span>
        </label>

        <label className={styles.option}>
          <input
            type="radio"
            name={name}
            className={styles.input}
            checked={choice === 'denied'}
            onChange={() => onChoose('denied')}
          />
          <span>Off</span>
        </label>
      </div>

      {/* Announced on change without moving focus. */}
      <p role="status" aria-live="polite" className={styles.status}>
        {choice === null ? '' : STATUS[category.id][choice]}
      </p>
    </fieldset>
  );
}

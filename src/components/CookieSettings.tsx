'use client';

import { useEffect, useState } from 'react';

import {
  CONSENT_EVENT,
  VENDOR_LIST,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from '@/lib/consent';
import styles from './CookieSettings.module.css';

type State = 'loading' | 'undecided' | ConsentChoice;

/**
 * The control on the /cookies page. Reflects the stored choice and lets the
 * visitor change it; writing through the shared helper updates the banner and
 * the analytics tags live, without a reload.
 *
 * Native radios keep the group fully keyboard- and screen-reader-operable for
 * free (arrow keys, roving focus, group semantics from the fieldset).
 */
export default function CookieSettings() {
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    const sync = () => setState(readConsent() ?? 'undecided');
    sync();
    /* Reflect changes made elsewhere — the banner, or another tab. */
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  function choose(choice: ConsentChoice) {
    setState(choice);
    writeConsent(choice);
  }

  const status =
    state === 'granted'
      ? 'Analytics are on. Thank you — this helps me see how the site is used.'
      : state === 'denied'
        ? 'Analytics are off. No analytics cookies will be set.'
        : "You haven't chosen yet, so analytics are off by default.";

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{VENDOR_LIST}</legend>

      <div className={styles.options}>
        <label className={styles.option}>
          <input
            type="radio"
            name="consent"
            className={styles.input}
            checked={state === 'granted'}
            /* Until the stored choice loads, neither is checked — avoids a flash
               of the wrong state before the effect runs. */
            onChange={() => choose('granted')}
          />
          <span>On</span>
        </label>

        <label className={styles.option}>
          <input
            type="radio"
            name="consent"
            className={styles.input}
            checked={state === 'denied'}
            onChange={() => choose('denied')}
          />
          <span>Off</span>
        </label>
      </div>

      {/* Announced on change without moving focus. */}
      <p role="status" aria-live="polite" className={styles.status}>
        {state === 'loading' ? '' : status}
      </p>
    </fieldset>
  );
}

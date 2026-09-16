'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import {
  ANALYTICS_CONFIGURED,
  CONSENT_EVENT,
  VENDOR_LIST,
  readConsent,
  writeConsent,
} from '@/lib/consent';
import ClarityAnalytics from './ClarityAnalytics';
import GoogleAnalytics from './GoogleAnalytics';
import styles from './CookieConsent.module.css';

/* 'loading' until the stored choice is read on mount, so the server render and
   the first client render agree (no hydration flash of the banner). */
type Consent = 'loading' | 'undecided' | 'granted' | 'denied';

/**
 * A one-time consent gate for the analytics tags. They only mount after the
 * visitor accepts, so no analytics cookies are set until then. The choice is
 * remembered, and the banner never reappears once made.
 *
 * Stays in sync with the settings page: a change there (or in another tab)
 * updates this component live, mounting or unmounting the tags to match.
 *
 * Renders nothing when no analytics IDs are configured — there is nothing to
 * consent to, so there is no banner.
 */
export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent>('loading');
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ANALYTICS_CONFIGURED) return;

    const sync = () => setConsent(readConsent() ?? 'undecided');
    sync();

    /* Live updates: our own event for same-tab changes (settings page),
       'storage' for changes made in another tab. */
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  /* Move focus to the banner when it appears so keyboard and screen-reader
     users meet the choice immediately, rather than tabbing past the whole page
     to reach it. Non-modal: the page stays usable if they'd rather ignore it. */
  useEffect(() => {
    if (consent === 'undecided') dialog.current?.focus();
  }, [consent]);

  /* The banner is fixed, so it would sit over whatever ends at the bottom of
     the page: the footer, and on a phone the last rows of content too. While
     it is up, publish the space it occupies from the viewport's bottom edge
     (height plus bottom offset) as --consent-inset; the shell (.root in
     layout.module.css) pads its bottom by that much. On a page that fits one
     viewport the shell's flexible middle row absorbs the padding, so the page
     still fits and the footer simply sits above the banner; on a taller page
     the end of the content scrolls clear of it. Re-measured when the banner
     changes size; cleared when it goes. */
  useEffect(() => {
    const el = dialog.current;
    const root = document.documentElement;
    if (consent !== 'undecided' || !el) {
      root.style.removeProperty('--consent-inset');
      return;
    }
    const update = () => {
      const offset = parseFloat(getComputedStyle(el).bottom) || 0;
      root.style.setProperty('--consent-inset', `${el.offsetHeight + offset}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--consent-inset');
    };
  }, [consent]);

  if (!ANALYTICS_CONFIGURED) return null;

  return (
    <>
      {/* Each tag no-ops on its own if its ID is unset, so one switch here
          covers however many are configured. */}
      {consent === 'granted' && (
        <>
          <ClarityAnalytics />
          <GoogleAnalytics />
        </>
      )}

      {consent === 'undecided' && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-desc"
          tabIndex={-1}
          className={styles.banner}
        >
          <div>
            <p id="cookie-title" className={styles.title}>
              Cookies
            </p>
            <p id="cookie-desc" className={styles.message}>
              This site uses {VENDOR_LIST} to understand how visitors use it, including
              anonymized session recordings. Analytics cookies are set only if you accept, and
              you can change your choice on the <Link href="/cookies">Cookies page</Link>.
            </p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => writeConsent('granted')}
              className={`${styles.button} ${styles.accept}`}
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => writeConsent('denied')}
              className={`${styles.button} ${styles.decline}`}
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}

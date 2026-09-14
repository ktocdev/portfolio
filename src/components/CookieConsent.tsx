'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { SITE } from '@/content/site';
import { CONSENT_EVENT, readConsent, writeConsent } from '@/lib/consent';
import ClarityAnalytics from './ClarityAnalytics';
import styles from './CookieConsent.module.css';

/* 'loading' until the stored choice is read on mount, so the server render and
   the first client render agree (no hydration flash of the banner). */
type Consent = 'loading' | 'undecided' | 'granted' | 'denied';

/**
 * A one-time consent gate for Microsoft Clarity. The analytics tag only mounts
 * after the visitor accepts, so no analytics cookies are set until then. The
 * choice is remembered, and the banner never reappears once made.
 *
 * Stays in sync with the settings page: a change there (or in another tab)
 * updates this component live, mounting or unmounting the tag to match.
 *
 * Renders nothing when no Clarity ID is configured — there is nothing to
 * consent to, so there is no banner.
 */
export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent>('loading');
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE.clarityId) return;

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

  if (!SITE.clarityId) return null;

  return (
    <>
      {consent === 'granted' && <ClarityAnalytics />}

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
              This site uses Microsoft Clarity to understand how visitors use it, including
              anonymized session recordings. It sets analytics cookies only if you accept, and
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

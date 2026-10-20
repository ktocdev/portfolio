'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { SITE } from '@/content/site';
import { applyConsent } from '@/lib/analytics';
import {
  ANALYTICS_CONFIGURED,
  CATEGORIES,
  VENDOR_LIST,
  allCategories,
  currentConsent,
  isDecided,
  subscribeConsent,
  trackingSuppressed,
  writeConsent,
  type Category,
  type ConsentState,
} from '@/lib/consent';
import styles from './CookieConsent.module.css';

/**
 * The consent gate for the analytics tags. Nothing loads until the visitor
 * accepts a category, and each category loads only its own tool (see
 * applyConsent). The banner stays until every configured category has a
 * choice, then never reappears.
 *
 * Stays in sync with the settings page: a change there (or in another tab)
 * is applied here live, loading or stopping the tags to match.
 *
 * Renders nothing when no analytics IDs are configured — there is nothing to
 * consent to, so there is no banner.
 */
export default function CookieConsent() {
  /* null until the stored choice is read on mount, so the server render and
     the first client render agree (no hydration flash of the banner). */
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [picks, setPicks] = useState<Record<Category, boolean>>({
    analytics: false,
    recording: false,
  });
  const dialog = useRef<HTMLDivElement>(null);
  /* Where focus was before the banner took it, to hand it back on close. */
  const returnFocus = useRef<HTMLElement | null>(null);
  const panelId = useId();
  const chooseButton = useRef<HTMLButtonElement>(null);
  const firstSwitch = useRef<HTMLInputElement>(null);
  /* Skips the focus move on first render; only an open or close moves it. */
  const choosingChanged = useRef(false);

  useEffect(() => {
    if (!ANALYTICS_CONFIGURED) return;

    /* Apply straight from the event, not from a render, so a tag stops the
       moment its category is switched off. Never on localhost or an
       opted-out device (see trackingSuppressed). */
    const sync = () => {
      const state = currentConsent();
      applyConsent(state, {
        gaId: SITE.gaId,
        clarityId: SITE.clarityId,
        suppressed: trackingSuppressed(),
      });
      setConsent(state);
    };
    sync();
    return subscribeConsent(sync);
  }, []);

  const open = consent !== null && !isDecided(consent);

  /* Move focus to the banner when it appears so keyboard and screen-reader
     users meet the choice immediately, rather than tabbing past the whole page
     to reach it. Non-modal: the page stays usable if they'd rather ignore it.
     When it goes, focus returns to where it was, or to <main>, rather than
     falling back to <body> along with the removed button. */
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    returnFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
    dialog.current?.focus();
    return () => {
      const target = returnFocus.current;
      if (target?.isConnected) target.focus();
      else document.getElementById('main')?.focus();
    };
  }, [open]);

  /* The banner is fixed, so it would sit over whatever ends at the bottom of
     the page: the footer, and on a phone the last rows of content too. While
     it is up, publish the space it occupies from the viewport's bottom edge
     (height plus bottom offset) as --consent-inset; the shell (.root in
     SiteShell.module.css) pads its bottom by that much. On a page that fits one
     viewport the shell's flexible middle row absorbs the padding, so the page
     still fits and the footer simply sits above the banner; on a taller page
     the end of the content scrolls clear of it. Re-measured when the banner
     changes size; cleared when it goes. */
  useEffect(() => {
    const el = dialog.current;
    const root = document.documentElement;
    if (!open || !el) {
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
  }, [open]);

  /* The Choose… button hides while the panel is open, and the panel's close
     button goes with it on close, so focus is handed over each way rather than
     dropped: into the first switch on open, back to Choose… on close. */
  useEffect(() => {
    if (!choosingChanged.current) {
      choosingChanged.current = true;
      return;
    }
    if (choosing) firstSwitch.current?.focus();
    else chooseButton.current?.focus();
  }, [choosing]);

  if (!open) return null;

  /* Choosing per category only means something with more than one. */
  const canChoose = CATEGORIES.length > 1;

  function saveChoices() {
    writeConsent(
      Object.fromEntries(CATEGORIES.map((c) => [c.id, picks[c.id] ? 'granted' : 'denied'])),
    );
  }

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      tabIndex={-1}
      className={styles.banner}
      data-choosing={choosing || undefined}
    >
      <div>
        <p id="cookie-title" className={styles.title}>
          Cookies
        </p>
        <p id="cookie-desc" className={styles.message}>
          This site uses {VENDOR_LIST} to understand how visitors use it
          {SITE.clarityId ? ', including anonymized session recordings' : ''}. Analytics cookies
          are set only if you accept, and you can change your choice on the{' '}
          <Link href="/cookies">Cookies page</Link>.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => writeConsent(allCategories('granted'))}
          className={`${styles.button} ${styles.accept}`}
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => writeConsent(allCategories('denied'))}
          className={`${styles.button} ${styles.decline}`}
        >
          Decline all
        </button>
        {canChoose && !choosing && (
          <button
            ref={chooseButton}
            type="button"
            aria-expanded={false}
            onClick={() => setChoosing(true)}
            className={`${styles.button} ${styles.decline}`}
          >
            Choose…
          </button>
        )}
      </div>

      {/* After its Choose… trigger, so the disclosure reads in order. A group
          named by its heading rather than a fieldset: a legend can't share a
          row with the close button, and the button inside it would end up in
          the group's name. */}
      {canChoose && choosing && (
        <>
          <hr className={styles.rule} />
          <div
            id={panelId}
            role="group"
            aria-labelledby={`${panelId}-title`}
            className={styles.choices}
          >
            <div className={styles.choicesHead}>
              <p id={`${panelId}-title`} className={styles.legend}>
                Choose what to allow
              </p>
              <button
                type="button"
                aria-label="Close choices"
                onClick={() => setChoosing(false)}
                className={styles.close}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            {CATEGORIES.map((c, i) => (
              /* The label names the switch ("Analytics (Google Analytics)");
                 the hint describes it, so the name stays short when read out. */
              <div key={c.id} className={styles.choice}>
                <input
                  ref={i === 0 ? firstSwitch : undefined}
                  id={`${panelId}-${c.id}`}
                  type="checkbox"
                  role="switch"
                  aria-describedby={`${panelId}-${c.id}-hint`}
                  className={styles.switch}
                  checked={picks[c.id]}
                  onChange={(e) => setPicks((p) => ({ ...p, [c.id]: e.target.checked }))}
                />
                <div>
                  <label htmlFor={`${panelId}-${c.id}`} className={styles.choiceLabel}>
                    {c.label} <span className={styles.vendor}>({c.vendor})</span>
                  </label>
                  <p id={`${panelId}-${c.id}-hint`} className={styles.choiceHint}>
                    {c.description}
                  </p>
                </div>
              </div>
            ))}
            <div className={styles.actions}>
              <button
                type="button"
                onClick={saveChoices}
                className={`${styles.button} ${styles.accept}`}
              >
                Save choices
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

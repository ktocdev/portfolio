/**
 * Shared analytics-consent state. One key, one event, so the banner
 * (CookieConsent) and the settings page (CookieSettings) never drift apart:
 * writing a choice anywhere notifies everyone listening in the same tab.
 */

export const CONSENT_KEY = 'portfolio-consent';
/* Same-tab storage writes don't fire the native 'storage' event, so we raise
   our own for live in-tab updates; 'storage' still covers other tabs. */
export const CONSENT_EVENT = 'portfolio-consent-change';

export type ConsentChoice = 'granted' | 'denied';

/** The stored choice, or null when the visitor hasn't decided (or storage is blocked). */
export function readConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Persist a choice and notify listeners in this tab. */
export function writeConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* Blocked storage: the choice won't persist, but the event below still
       lets the current session react. */
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
  } catch {
    /* No window (shouldn't happen in a client component); nothing to notify. */
  }
}

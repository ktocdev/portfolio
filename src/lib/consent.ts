import { SITE } from '@/content/site';

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

/* Per-device opt-out for the owner's own browsers. Visit any page with
   ?notrack=1 once on a device to stop it being counted; ?notrack=0 undoes it. */
const NOTRACK_KEY = 'notrack';

/**
 * True when this visit should never load the tags, whatever the consent choice:
 * a local or dev host, or a device opted out with ?notrack=1. Also applies the
 * ?notrack param, so call it once on mount. The banner still works here, so
 * local dev can exercise it; only the tags stay unmounted.
 */
export function trackingSuppressed(): boolean {
  const host = location.hostname;
  const isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host.endsWith('.local') ||
    host.endsWith('.test');

  try {
    const param = new URLSearchParams(location.search).get(NOTRACK_KEY);
    if (param === '1') localStorage.setItem(NOTRACK_KEY, '1');
    if (param === '0') localStorage.removeItem(NOTRACK_KEY);
  } catch {
    /* Blocked storage: the opt-out can't persist, nothing else to do. */
  }

  let optedOut = false;
  try {
    optedOut = localStorage.getItem(NOTRACK_KEY) === '1';
  } catch {
    /* Blocked storage reads as not opted out. */
  }

  return isLocal || optedOut;
}

/**
 * The analytics tools that are actually configured, named for the consent copy.
 * Drop an ID in site.ts and the banner, the settings legend, and the tags
 * themselves all follow — there is one source of truth for "what is running".
 */
export const VENDORS: readonly string[] = [
  ...(SITE.clarityId ? ['Microsoft Clarity'] : []),
  ...(SITE.gaId ? ['Google Analytics'] : []),
];

/** The vendors as a sentence fragment: "A", or "A and B". */
export const VENDOR_LIST = VENDORS.join(' and ');

/** False when nothing is configured — then there is nothing to consent to. */
export const ANALYTICS_CONFIGURED = VENDORS.length > 0;

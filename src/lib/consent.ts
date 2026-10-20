import { SITE } from '@/content/site';

/**
 * Shared analytics-consent state. One key, one event, so the banner
 * (CookieConsent) and the settings page (CookieSettings) never drift apart:
 * writing a choice anywhere notifies everyone listening in the same tab, and
 * the native 'storage' event carries it to other tabs.
 *
 * Consent is per category, so a visitor can allow Google Analytics without
 * allowing Clarity's session recordings.
 */

export const CONSENT_KEY = 'portfolio-consent';
/* Same-tab storage writes don't fire the native 'storage' event, so we raise
   our own for live in-tab updates; 'storage' still covers other tabs. */
export const CONSENT_EVENT = 'portfolio-consent-change';

export type ConsentChoice = 'granted' | 'denied';
export type Category = 'analytics' | 'recording';

/** A choice per category; a missing category hasn't been decided yet. */
export type ConsentState = Partial<Record<Category, ConsentChoice>>;

/* Stored as JSON with a version, so the shape can change again later. The
   original format was the bare string 'granted' or 'denied', covering every
   tool at once; parseConsent carries that choice over to each category. */
type StoredConsent = { v: 2 } & ConsentState;

function isChoice(value: unknown): value is ConsentChoice {
  return value === 'granted' || value === 'denied';
}

/**
 * Reads a stored value of either shape. `legacy` is true for the original
 * single-choice string, so the caller can rewrite it in the current shape.
 * Anything unreadable counts as undecided.
 */
export function parseConsent(raw: string | null): { state: ConsentState; legacy: boolean } {
  if (isChoice(raw)) return { state: { analytics: raw, recording: raw }, legacy: true };
  if (!raw) return { state: {}, legacy: false };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { state: {}, legacy: false };
    const { analytics, recording } = parsed as Record<string, unknown>;
    const state: ConsentState = {};
    if (isChoice(analytics)) state.analytics = analytics;
    if (isChoice(recording)) state.recording = recording;
    return { state, legacy: false };
  } catch {
    return { state: {}, legacy: false };
  }
}

/** The current shape, as written to storage. */
export function serializeConsent(state: ConsentState): string {
  const stored: StoredConsent = { v: 2, ...state };
  return JSON.stringify(stored);
}

/**
 * The stored choices; empty when the visitor hasn't decided (or storage is
 * blocked). A value in the original format is migrated in place on first read.
 */
export function readConsent(): ConsentState {
  try {
    const { state, legacy } = parseConsent(localStorage.getItem(CONSENT_KEY));
    /* No event: the choice itself hasn't changed. Other tabs get a 'storage'
       event and read the same choice back in the new shape. */
    if (legacy) localStorage.setItem(CONSENT_KEY, serializeConsent(state));
    return state;
  } catch {
    return {};
  }
}

/** Merge choices into the stored state and notify listeners in this tab. */
export function writeConsent(update: ConsentState): void {
  const next = { ...currentConsent(), ...update };
  try {
    localStorage.setItem(CONSENT_KEY, serializeConsent(next));
  } catch {
    /* Blocked storage: the choice won't persist, but the event below still
       lets the current session react. */
    sessionChoice = next;
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
  } catch {
    /* No window (shouldn't happen in a client component); nothing to notify. */
  }
}

/* With storage blocked, readConsent can't see what was just chosen; this
   holds it for the rest of the page session so the event still means something. */
let sessionChoice: ConsentState | null = null;

/** The stored choices, or the in-memory fallback when storage is blocked. */
export function currentConsent(): ConsentState {
  const stored = readConsent();
  return sessionChoice ? { ...sessionChoice, ...stored } : stored;
}

/**
 * Calls `onChange` whenever consent may have changed: a write in this tab, or
 * a write (or a ?notrack change, or a site-data clear) in another. Returns the
 * unsubscribe function, so it drops straight into a useEffect.
 */
export function subscribeConsent(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    /* key is null when another tab clears all storage. */
    if (event.key === null || event.key === CONSENT_KEY || event.key === NOTRACK_KEY) onChange();
  };
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/* Per-device opt-out for the owner's own browsers. Visit any page with
   ?notrack=1 once on a device to stop it being counted; ?notrack=0 undoes it. */
const NOTRACK_KEY = 'notrack';

/**
 * True when this visit should never load the tags, whatever the consent choice:
 * a local or dev host, or a device opted out with ?notrack=1. Also applies the
 * ?notrack param, so call it once on mount. The banner still works here, so
 * local dev can exercise it; only the tags stay unloaded.
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

export type CategoryInfo = {
  id: Category;
  /** The control's name, on the banner and the settings page. */
  label: string;
  vendor: string;
  /** One line on what turning it on allows. */
  description: string;
};

/**
 * The consent categories for the tools that are actually configured. Drop an
 * ID in site.ts and the banner, the settings page, and the tags themselves all
 * follow — there is one source of truth for "what is running".
 */
export function categoriesFor(ids: { gaId: string; clarityId: string }): readonly CategoryInfo[] {
  return [
    ...(ids.gaId
      ? [
          {
            id: 'analytics',
            label: 'Analytics',
            vendor: 'Google Analytics',
            description: 'Which pages get read, roughly how long, and where visitors arrive from.',
          } as const,
        ]
      : []),
    ...(ids.clarityId
      ? [
          {
            id: 'recording',
            label: 'Session recording',
            vendor: 'Microsoft Clarity',
            description: 'Anonymized recordings and heatmaps of where people click and scroll.',
          } as const,
        ]
      : []),
  ];
}

export const CATEGORIES = categoriesFor(SITE);

/** The vendors as a sentence fragment: "A", or "A and B". */
export const VENDOR_LIST = CATEGORIES.map((c) => c.vendor).join(' and ');

/** False when nothing is configured — then there is nothing to consent to. */
export const ANALYTICS_CONFIGURED = CATEGORIES.length > 0;

/** True once every configured category has a choice — the banner's cue to go. */
export function isDecided(state: ConsentState, categories = CATEGORIES): boolean {
  return categories.every((c) => isChoice(state[c.id]));
}

/** The same choice for every configured category: Accept all / Decline all. */
export function allCategories(choice: ConsentChoice, categories = CATEGORIES): ConsentState {
  return Object.fromEntries(categories.map((c) => [c.id, choice]));
}

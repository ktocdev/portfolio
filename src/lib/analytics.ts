import type { ConsentState } from './consent';

/**
 * Loads and stops the analytics tags to match the visitor's consent, live.
 *
 * Strict blocking: neither tag is injected until its category is granted, so
 * nothing downloads and no cookie is set before then. Once a tag is running,
 * switching its category off stops it for the rest of the page session and
 * deletes the cookies it set — the script itself stays in memory, but it no
 * longer sends anything.
 *
 * Imperative rather than <Script> components on purpose: next/script can add
 * a tag but never take one back, and both tools need calls made into them on
 * the way out, so the whole lifecycle lives here, idempotent, in one place.
 */

type Gtag = (...args: unknown[]) => void;
type Clarity = ((...args: unknown[]) => void) & { q?: unknown[] };

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Gtag;
  clarity?: Clarity;
} & Record<`ga-disable-${string}`, boolean | undefined>;

/* 'off': never loaded this page session. 'on': loaded and running.
   'stopped': loaded, then switched off — the script is still in memory. */
type Status = 'off' | 'on' | 'stopped';

let gaStatus: Status = 'off';
let clarityStatus: Status = 'off';

function win(): AnalyticsWindow {
  return window as unknown as AnalyticsWindow;
}

function injectScript(src: string): void {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/* ---------- Cookies ---------- */

/**
 * Every domain a cookie for `host` could have been set on: host-only (no
 * domain attribute), the host itself, and each parent domain short of the TLD,
 * each with and without the leading dot. A cookie set on .ktoc.dev only
 * clears with a matching domain attribute, and document.cookie never says
 * which one it was set with, so every variant is tried.
 */
export function cookieDomains(host: string): (string | undefined)[] {
  const domains: (string | undefined)[] = [undefined];
  /* IP addresses and single-label hosts only take host-only cookies. */
  if (!host.includes('.') || /^[\d.]+$/.test(host) || host.startsWith('[')) return domains;
  const parts = host.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    const domain = parts.slice(i).join('.');
    domains.push(domain, `.${domain}`);
  }
  return domains;
}

/** Deletes every cookie whose name passes `match`, on every domain variant, at path /. */
export function clearCookies(match: (name: string) => boolean): void {
  const names = document.cookie
    .split(';')
    .map((pair) => pair.split('=')[0].trim())
    .filter((name) => name && match(name));
  for (const name of new Set(names)) {
    for (const domain of cookieDomains(location.hostname)) {
      document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/` +
        (domain ? `; domain=${domain}` : '');
    }
  }
}

/* GA4 sets _ga and _ga_<container>; _gid and _gat* are Universal Analytics
   leftovers a returning visitor may still carry. */
export const isGaCookie = (name: string) =>
  name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat');

/* Clarity's first-party cookies. Its others (MUID, CLID, ANONCHK, MR, SM) live
   on clarity.ms and bing.com, out of this page's reach. */
export const isClarityCookie = (name: string) => name === '_clck' || name === '_clsk';

/* ---------- Google Analytics ---------- */

const DENIED_ALL = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
} as const;

function enableGa(id: string): void {
  const w = win();
  w[`ga-disable-${id}`] = false;

  if (gaStatus === 'stopped') {
    w.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    gaStatus = 'on';
    return;
  }
  if (gaStatus === 'on') return;

  w.dataLayer = w.dataLayer || [];
  /* gtag.js reads its queue as Arguments objects, not arrays: this has to be
     a plain function pushing `arguments`, exactly as Google's snippet does. */
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  /* Consent Mode alongside strict blocking: the default must precede config,
     and everything starts denied. Analytics is then granted straight away,
     since the tag only loads once the visitor has said yes; the ad signals
     stay denied for good, as the site runs no ads. */
  w.gtag('consent', 'default', DENIED_ALL);
  w.gtag('consent', 'update', { analytics_storage: 'granted' });
  w.gtag('js', new Date());
  w.gtag('config', id);
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${id}`);
  gaStatus = 'on';
}

function disableGa(id: string): void {
  const w = win();
  if (gaStatus === 'on') {
    /* ga-disable is checked before every hit and every cookie write, so it
       holds for the rest of the page session; the consent update is the
       matching signal for anything already queued. */
    w[`ga-disable-${id}`] = true;
    w.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    gaStatus = 'stopped';
  }
  clearCookies(isGaCookie);
}

/* ---------- Microsoft Clarity ---------- */

function clarity(...args: unknown[]): void {
  const w = win();
  /* Clarity's own stub: queue calls until the tag arrives and replays them. */
  w.clarity =
    w.clarity ||
    function () {
      // eslint-disable-next-line prefer-rest-params
      (w.clarity!.q = w.clarity!.q || []).push(arguments);
    };
  w.clarity(...args);
}

const CLARITY_GRANTED = { ad_Storage: 'denied', analytics_Storage: 'granted' } as const;
const CLARITY_DENIED = { ad_Storage: 'denied', analytics_Storage: 'denied' } as const;

function enableClarity(id: string): void {
  if (clarityStatus === 'on') return;
  /* An explicit consent signal rather than relying on the tag's presence. Ad
     storage stays denied: the site runs no ads. */
  clarity('consentv2', CLARITY_GRANTED);
  if (clarityStatus === 'stopped') {
    /* Switched back on in the same page session: the tag is still loaded and
       keeps its project config, so 'start' resumes it in place, no reload.
       Like 'stop' below, it's exported by clarity-js but not in the
       published API table. */
    clarity('start');
    clarityStatus = 'on';
    return;
  }
  injectScript(`https://www.clarity.ms/tag/${id}`);
  clarityStatus = 'on';
}

function disableClarity(): void {
  if (clarityStatus === 'on') {
    /* Denied consent alone doesn't stop Clarity: it deletes its cookies but
       keeps recording in "no-consent mode", with a fresh ID per page view.
       'stop' ends the recording. It isn't in Clarity's published API table,
       but it is exported by clarity-js and the tag dispatches any command
       name straight to it (clarity[method]). */
    clarity('consentv2', CLARITY_DENIED);
    clarity('stop');
    clarityStatus = 'stopped';
  }
  clearCookies(isClarityCookie);
}

/* ---------- Applying consent ---------- */

export type AnalyticsConfig = {
  gaId: string;
  clarityId: string;
  /** localhost or a ?notrack device: never load anything, whatever the choice. */
  suppressed: boolean;
};

/**
 * Brings both tags in line with `state`: loads what's newly granted, stops
 * what's been switched off, and clears the cookies of anything not allowed.
 * Safe to call on every change; each step is idempotent.
 */
export function applyConsent(state: ConsentState, config: AnalyticsConfig): void {
  if (config.gaId) {
    if (!config.suppressed && state.analytics === 'granted') enableGa(config.gaId);
    else disableGa(config.gaId);
  }
  if (config.clarityId) {
    if (!config.suppressed && state.recording === 'granted') enableClarity(config.clarityId);
    else disableClarity();
  }
}

/**
 * A named event, sent to whichever tools are running: a GA event with its
 * params, and a Clarity custom event (name only — Clarity takes no params),
 * which also makes the matching recordings filterable. Does nothing for a
 * tool that is off, stopped, or never loaded, so callers needn't check.
 */
export function trackEvent(name: string, params?: Record<string, string>): void {
  if (gaStatus === 'on') win().gtag?.('event', name, params ?? {});
  if (clarityStatus === 'on') clarity('event', name);
}

/** Test hook: forget what this page session has loaded. */
export function resetAnalyticsForTests(): void {
  gaStatus = 'off';
  clarityStatus = 'off';
}

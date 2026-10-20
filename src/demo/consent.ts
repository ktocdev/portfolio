/**
 * Consent banner, analytics, and recording masks for the Main Character demo.
 *
 * The demo is rag-journal's static build, mirrored wholesale into
 * public/main-character/demo/ by the refresh-demo skill, so nothing can live
 * there. This file is bundled by scripts/demo-consent.mjs after next build and
 * stamped into the demo's pages in out/ instead. It shares the site's consent
 * key, state, and loader (src/lib/consent.ts, src/lib/analytics.ts), so one
 * choice covers the site and the demo, and the tags behave identically:
 * nothing loads before consent, opting out stops a tool live and clears its
 * cookies, and a change in any tab reaches every other.
 *
 * Plain DOM rather than React: the demo has no React, and this has to stay a
 * small, self-contained script. Its markup and behaviour mirror
 * CookieConsent.tsx; its look is the demo's own (consent.css, on the demo's
 * tokens), as is the splash's banner.
 */

import { SITE } from '@/content/site';
import { applyConsent, trackEvent } from '@/lib/analytics';
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
} from '@/lib/consent';

/* ---------- Recording masks ---------- */

/**
 * Where a visitor's own words can reach the page as text. While the script
 * runs, whatever they type is swapped for the next scripted message, but
 * past its end a send goes through as typed (write and look-up both), an
 * uploaded life summary is shown, search echoes its query, category names
 * are typed, and a closed chapter carries its messages into history.
 * Clarity already masks what's typed into inputs; these cover text on the
 * page. scripts/demo-consent.mjs fails the build if a demo refresh renames
 * any of them, so a mask can't silently stop applying.
 */
export const MASKED = [
  '#write-log',
  '#chat-log',
  '#tab-seed',
  '#tab-search',
  '#tab-categories',
  '#tab-history',
];

function applyMasks(): void {
  for (const selector of MASKED) {
    document.querySelector(selector)?.setAttribute('data-clarity-mask', 'true');
  }
}

/* ---------- Events ---------- */

/**
 * How far visitors get, as named events. All from signals the demo already
 * raises for its own script (demo-script.js), so nothing in the mirrored
 * build has to change: a turn on write or look-up, a closed chapter, and
 * which tab is showing.
 */
function trackDemo(): void {
  document.addEventListener('mc:turn', (e) => {
    const tab = (e as CustomEvent<{ tab?: string }>).detail?.tab;
    trackEvent(tab === 'ask' ? 'demo_lookup' : 'demo_write');
  });
  document.addEventListener('mc:closed', () => trackEvent('demo_close_chapter'));

  /* A tab is a <section class="tab"> holding .active; the demo never changes
     the URL, so this stands in for page views between tabs. Compared with
     the last tab seen rather than read off each mutation: showTab rewrites
     every tab's class on a switch, so one switch is several records. */
  const activeTab = () => document.querySelector('section.tab.active')?.id.replace(/^tab-/, '');
  let lastTab = activeTab();
  const observer = new MutationObserver(() => {
    const tab = activeTab();
    if (tab && tab !== lastTab) trackEvent('demo_tab', { tab });
    lastTab = tab;
  });
  document
    .querySelectorAll('section.tab')
    .forEach((tab) => observer.observe(tab, { attributes: true, attributeFilter: ['class'] }));
}

/* ---------- Banner ---------- */

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

const CLOSE_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

/** A modal (the demo's opening notice) makes everything behind it inert. */
const modalOpen = () => document.querySelector('dialog[open]') !== null;

let banner: HTMLElement | null = null;
/* Where focus was before the banner took it, to hand it back on close. */
let returnFocus: HTMLElement | null = null;

function openBanner(): void {
  if (banner) return;
  const picks: Record<Category, boolean> = { analytics: false, recording: false };
  const canChoose = CATEGORIES.length > 1;

  const accept = el('button', { type: 'button', class: 'mc-consent-btn mc-consent-primary' }, 'accept all');
  accept.addEventListener('click', () => writeConsent(allCategories('granted')));
  const decline = el('button', { type: 'button', class: 'mc-consent-btn' }, 'decline all');
  decline.addEventListener('click', () => writeConsent(allCategories('denied')));
  const choose = el(
    'button',
    { type: 'button', class: 'mc-consent-btn', 'aria-expanded': 'false' },
    'choose…',
  );
  const actions = el('div', { class: 'mc-consent-actions' }, accept, decline);
  if (canChoose) actions.append(choose);

  /* The per-category panel: hidden until Choose…, which then hides itself;
     the panel's close button brings it back. Focus is handed over each way
     rather than dropped with the button that disappears. */
  const rule = el('hr', { class: 'mc-consent-rule' });
  const panel = el('div', {
    id: 'mc-consent-panel',
    role: 'group',
    'aria-labelledby': 'mc-consent-panel-title',
    class: 'mc-consent-panel',
  });
  const close = el('button', {
    type: 'button',
    class: 'mc-consent-close',
    'aria-label': 'Close choices',
  });
  close.innerHTML = CLOSE_ICON;
  panel.append(
    el(
      'div',
      { class: 'mc-consent-panel-head' },
      el('p', { id: 'mc-consent-panel-title', class: 'mc-consent-panel-title' }, 'Choose what to allow'),
      close,
    ),
  );
  const switches: HTMLInputElement[] = [];
  for (const c of CATEGORIES) {
    const id = `mc-consent-${c.id}`;
    const input = el('input', {
      id,
      type: 'checkbox',
      role: 'switch',
      'aria-describedby': `${id}-hint`,
    });
    input.addEventListener('change', () => (picks[c.id] = input.checked));
    switches.push(input);
    panel.append(
      el(
        'div',
        { class: 'mc-consent-choice' },
        input,
        el(
          'div',
          {},
          el('label', { for: id }, c.label, ' ', el('span', { class: 'mc-consent-vendor' }, `(${c.vendor})`)),
          el('p', { id: `${id}-hint`, class: 'mc-consent-hint' }, c.description),
        ),
      ),
    );
  }
  const save = el('button', { type: 'button', class: 'mc-consent-btn mc-consent-primary' }, 'save choices');
  save.addEventListener('click', () =>
    writeConsent(
      Object.fromEntries(CATEGORIES.map((c) => [c.id, picks[c.id] ? 'granted' : 'denied'])),
    ),
  );
  panel.append(el('div', { class: 'mc-consent-actions' }, save));
  rule.hidden = true;
  panel.hidden = true;

  choose.addEventListener('click', () => {
    choose.hidden = true;
    rule.hidden = false;
    panel.hidden = false;
    switches[0]?.focus();
  });
  close.addEventListener('click', () => {
    rule.hidden = true;
    panel.hidden = true;
    choose.hidden = false;
    choose.focus();
  });

  const link = el('a', { href: '/cookies/' }, 'cookies page');
  banner = el(
    'section',
    {
      id: 'mc-consent',
      role: 'dialog',
      'aria-modal': 'false',
      'aria-labelledby': 'mc-consent-title',
      'aria-describedby': 'mc-consent-desc',
      tabindex: '-1',
    },
    el(
      'div',
      { class: 'mc-consent-inner' },
      el('p', { id: 'mc-consent-title', class: 'mc-consent-eyebrow' }, 'cookies'),
      el(
        'p',
        { id: 'mc-consent-desc', class: 'mc-consent-message' },
        `This demo uses ${VENDOR_LIST} to understand how visitors use it` +
          (SITE.clarityId ? ', including anonymized session recordings' : '') +
          '. Analytics cookies are set only if you accept, and you can change your choice on the ',
        link,
        '.',
      ),
      actions,
      rule,
      panel,
    ),
  );

  /* The app is a one-screen flex column with the write box at the bottom; a
     fixed banner would sit over it. Docked in the flow instead, the app's
     main area gives up the room. A scrolling page (the design system's) gets
     the floating card. */
  const body = getComputedStyle(document.body);
  banner.dataset.dock = body.overflow === 'hidden' && body.display === 'flex' ? 'flow' : 'float';
  document.body.append(banner);

  takeFocus();
}

/* Move focus to the banner when it appears, as the site's does. The demo
   opens with a modal notice (#demo-notice, demo-script.js) once its script
   has loaded, which may be before or after this runs; a modal makes the page
   inert, and closing it sends focus to the write box. So the banner takes
   focus now if it can, and again once that notice closes, after the
   notice's own handler has run. Only that notice: closing any later dialog
   leaves focus where the demo puts it. */
function takeFocus(): void {
  if (!modalOpen()) focusBanner();
  const onClose = (e: Event) => {
    if ((e.target as Element | null)?.id !== 'demo-notice') return;
    document.removeEventListener('close', onClose, true);
    setTimeout(() => {
      if (!modalOpen()) focusBanner();
    }, 0);
  };
  document.addEventListener('close', onClose, true);
}

function focusBanner(): void {
  if (!banner) return;
  const active = document.activeElement;
  returnFocus = active instanceof HTMLElement && active !== document.body ? active : null;
  banner.focus();
}

function closeBanner(): void {
  if (!banner) return;
  const hadFocus = banner.contains(document.activeElement);
  banner.remove();
  banner = null;
  if (hadFocus) {
    if (returnFocus?.isConnected) returnFocus.focus();
    else document.getElementById('entry-text')?.focus();
  }
  returnFocus = null;
}

/* ---------- Wiring ---------- */

function sync(): void {
  const state = currentConsent();
  applyConsent(state, {
    gaId: SITE.gaId,
    clarityId: SITE.clarityId,
    suppressed: trackingSuppressed(),
  });
  if (isDecided(state)) closeBanner();
  else openBanner();
}

if (ANALYTICS_CONFIGURED) {
  /* Masks go on before any tag can load. */
  applyMasks();
  trackDemo();
  sync();
  subscribeConsent(sync);
}

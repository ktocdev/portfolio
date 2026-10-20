import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';

import {
  applyConsent,
  cookieDomains,
  resetAnalyticsForTests,
  trackEvent,
  type AnalyticsConfig,
} from '@/lib/analytics';
import { calls, installBrowser, type FakeBrowser } from './fakeBrowser';

const GA_ID = 'G-TEST123';
const CLARITY_ID = 'clar1ty';
const GTAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
const CLARITY_SRC = `https://www.clarity.ms/tag/${CLARITY_ID}`;
const config: AnalyticsConfig = { gaId: GA_ID, clarityId: CLARITY_ID, suppressed: false };

let browser: FakeBrowser;
beforeEach(() => {
  browser = installBrowser('https://www.ktoc.dev/');
  resetAnalyticsForTests();
});

const srcs = () => browser.scripts.map((s) => s.src);
const dataLayer = () => calls(browser.win.dataLayer);
const clarityQueue = () => calls((browser.win.clarity as { q?: unknown } | undefined)?.q);

/* The cookies each tool really sets, on the domains it really uses, plus a
   host-only copy and one of the site's own that must survive. */
function seedCookies() {
  browser.jar.set('_ga=GA1.1.123; domain=.ktoc.dev; path=/');
  browser.jar.set(`_ga_TEST123=GS1.1.1; domain=.ktoc.dev; path=/`);
  browser.jar.set('_ga=stale; path=/');
  browser.jar.set('_clck=abc; domain=.ktoc.dev; path=/');
  browser.jar.set('_clsk=def; domain=ktoc.dev; path=/');
  browser.jar.set('_clck=host; path=/');
  browser.jar.set('keep=me; path=/');
}

describe('loading only what is granted', () => {
  test('undecided, denied, and suppressed load nothing', () => {
    applyConsent({}, config);
    applyConsent({ analytics: 'denied', recording: 'denied' }, config);
    applyConsent({ analytics: 'granted', recording: 'granted' }, { ...config, suppressed: true });
    assert.deepEqual(srcs(), []);
    assert.equal(browser.win.dataLayer, undefined);
    assert.equal(browser.win.clarity, undefined);
  });

  test('analytics only: GA loads, Clarity does not', () => {
    applyConsent({ analytics: 'granted', recording: 'denied' }, config);
    assert.deepEqual(srcs(), [GTAG_SRC]);
    assert.equal(browser.win.clarity, undefined);
  });

  test('recording only: Clarity loads, GA does not', () => {
    applyConsent({ analytics: 'denied', recording: 'granted' }, config);
    assert.deepEqual(srcs(), [CLARITY_SRC]);
    assert.equal(browser.win.dataLayer, undefined);
  });

  test('a tool with no ID never loads, whatever the choice', () => {
    applyConsent({ analytics: 'granted', recording: 'granted' }, { ...config, gaId: '' });
    assert.deepEqual(srcs(), [CLARITY_SRC]);
  });

  test('applying again loads nothing twice', () => {
    const both = { analytics: 'granted', recording: 'granted' } as const;
    applyConsent(both, config);
    applyConsent(both, config);
    assert.deepEqual(srcs(), [GTAG_SRC, CLARITY_SRC]);
    assert.equal(dataLayer().filter((c) => c[0] === 'config').length, 1);
  });
});

describe('consent signals', () => {
  test('GA: default all denied, then analytics granted, before js and config', () => {
    applyConsent({ analytics: 'granted' }, config);
    assert.deepEqual(dataLayer().slice(0, 4).map((c) => c.slice(0, 2)), [
      ['consent', 'default'],
      ['consent', 'update'],
      ['js', dataLayer()[2][1]],
      ['config', GA_ID],
    ]);
    assert.deepEqual(dataLayer()[0][2], {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    /* The ad signals are never granted. */
    assert.deepEqual(dataLayer()[1][2], { analytics_storage: 'granted' });
  });

  test('Clarity: an explicit consentv2 grant, ad storage denied', () => {
    applyConsent({ recording: 'granted' }, config);
    assert.deepEqual(clarityQueue(), [
      ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }],
    ]);
  });
});

describe('opting out', () => {
  test('GA off: disabled for the session, consent denied, its cookies gone on every domain', () => {
    const both = { analytics: 'granted', recording: 'granted' } as const;
    applyConsent(both, config);
    seedCookies();
    applyConsent({ ...both, analytics: 'denied' }, config);

    assert.equal(browser.win[`ga-disable-${GA_ID}`], true);
    assert.deepEqual(dataLayer().at(-1), ['consent', 'update', { analytics_storage: 'denied' }]);
    assert.deepEqual(browser.jar.names(), ['_clck@.ktoc.dev', '_clck@www.ktoc.dev', '_clsk@.ktoc.dev', 'keep@www.ktoc.dev']);
  });

  test('Clarity off: consent denied, stopped, its cookies gone on every domain', () => {
    const both = { analytics: 'granted', recording: 'granted' } as const;
    applyConsent(both, config);
    seedCookies();
    applyConsent({ ...both, recording: 'denied' }, config);

    assert.deepEqual(clarityQueue().slice(1), [
      ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }],
      ['stop'],
    ]);
    assert.deepEqual(browser.jar.names(), ['_ga@.ktoc.dev', '_ga@www.ktoc.dev', '_ga_TEST123@.ktoc.dev', 'keep@www.ktoc.dev']);
  });

  test('cookies left from an earlier visit are cleared even if nothing loaded', () => {
    seedCookies();
    applyConsent({ analytics: 'denied', recording: 'denied' }, config);
    assert.deepEqual(browser.jar.names(), ['keep@www.ktoc.dev']);
    assert.deepEqual(srcs(), []);
  });

  test('switching back on resumes in place, without loading anything again', () => {
    const on = { analytics: 'granted', recording: 'granted' } as const;
    const off = { analytics: 'denied', recording: 'denied' } as const;
    applyConsent(on, config);
    applyConsent(off, config);
    applyConsent(on, config);

    assert.deepEqual(srcs(), [GTAG_SRC, CLARITY_SRC]);
    assert.equal(browser.win[`ga-disable-${GA_ID}`], false);
    assert.deepEqual(dataLayer().at(-1), ['consent', 'update', { analytics_storage: 'granted' }]);
    assert.deepEqual(clarityQueue().slice(-2), [
      ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }],
      ['start'],
    ]);
  });
});

describe('events', () => {
  test('nothing is sent while no tool is running', () => {
    trackEvent('demo_write');
    applyConsent({ analytics: 'denied', recording: 'denied' }, config);
    trackEvent('demo_write');
    assert.equal(browser.win.dataLayer, undefined);
    assert.equal(browser.win.clarity, undefined);
  });

  test('each running tool gets the event: GA with params, Clarity by name', () => {
    applyConsent({ analytics: 'granted', recording: 'granted' }, config);
    trackEvent('demo_tab', { tab: 'entities' });
    assert.deepEqual(dataLayer().at(-1), ['event', 'demo_tab', { tab: 'entities' }]);
    assert.deepEqual(clarityQueue().at(-1), ['event', 'demo_tab']);
  });

  test('a tool switched off stops getting events; the other carries on', () => {
    applyConsent({ analytics: 'granted', recording: 'granted' }, config);
    applyConsent({ analytics: 'granted', recording: 'denied' }, config);
    const clarityBefore = clarityQueue().length;
    trackEvent('demo_close_chapter');
    assert.deepEqual(dataLayer().at(-1), ['event', 'demo_close_chapter', {}]);
    assert.equal(clarityQueue().length, clarityBefore);
  });
});

describe('cookie domains', () => {
  test('every parent domain short of the TLD, with and without the dot', () => {
    assert.deepEqual(cookieDomains('www.ktoc.dev'), [
      undefined,
      'www.ktoc.dev',
      '.www.ktoc.dev',
      'ktoc.dev',
      '.ktoc.dev',
    ]);
    assert.deepEqual(cookieDomains('ktoc.dev'), [undefined, 'ktoc.dev', '.ktoc.dev']);
  });

  test('IPs and single-label hosts are host-only', () => {
    assert.deepEqual(cookieDomains('localhost'), [undefined]);
    assert.deepEqual(cookieDomains('127.0.0.1'), [undefined]);
    assert.deepEqual(cookieDomains('[::1]'), [undefined]);
  });

  test('on the bare domain too, a dotted cookie is cleared', () => {
    browser = installBrowser('https://ktoc.dev/');
    browser.jar.set('_ga=1; domain=.ktoc.dev; path=/');
    browser.jar.set('_ga=2; path=/');
    applyConsent({ analytics: 'denied' }, config);
    assert.deepEqual(browser.jar.names(), []);
  });
});

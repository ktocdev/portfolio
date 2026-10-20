import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';

import { applyConsent, resetAnalyticsForTests } from '@/lib/analytics';
import {
  CONSENT_EVENT,
  CONSENT_KEY,
  allCategories,
  categoriesFor,
  currentConsent,
  isDecided,
  parseConsent,
  readConsent,
  serializeConsent,
  subscribeConsent,
  trackingSuppressed,
  writeConsent,
} from '@/lib/consent';
import { installBrowser, storageEvent, type FakeBrowser } from './fakeBrowser';

let browser: FakeBrowser;
beforeEach(() => {
  browser = installBrowser();
  resetAnalyticsForTests();
});

describe('stored shape', () => {
  test('the current shape round-trips', () => {
    const state = { analytics: 'granted', recording: 'denied' } as const;
    assert.equal(serializeConsent(state), '{"v":2,"analytics":"granted","recording":"denied"}');
    assert.deepEqual(parseConsent(serializeConsent(state)), { state, legacy: false });
  });

  test('a missing category stays undecided', () => {
    assert.deepEqual(parseConsent('{"v":2,"analytics":"denied"}').state, { analytics: 'denied' });
  });

  test('nothing stored, garbage, and unknown values all read as undecided', () => {
    for (const raw of [null, '', 'yes', '{', '[]', 'null', '{"analytics":"maybe","recording":1}']) {
      assert.deepEqual(parseConsent(raw).state, {}, String(raw));
    }
  });
});

describe('migration from the single-choice value', () => {
  for (const legacy of ['granted', 'denied'] as const) {
    test(`'${legacy}' applies to both categories and is rewritten in place`, () => {
      browser.store.set(CONSENT_KEY, legacy);
      assert.deepEqual(readConsent(), { analytics: legacy, recording: legacy });
      assert.equal(
        browser.store.get(CONSENT_KEY),
        `{"v":2,"analytics":"${legacy}","recording":"${legacy}"}`,
      );
    });
  }

  test('migration raises no change event (the choice itself is unchanged)', () => {
    browser.store.set(CONSENT_KEY, 'granted');
    let fired = 0;
    browser.win.addEventListener(CONSENT_EVENT, () => fired++);
    readConsent();
    assert.equal(fired, 0);
  });
});

describe('writing', () => {
  test('merges into what is stored and notifies this tab', () => {
    let fired = 0;
    browser.win.addEventListener(CONSENT_EVENT, () => fired++);
    writeConsent(allCategories('granted'));
    writeConsent({ recording: 'denied' });
    assert.deepEqual(readConsent(), { analytics: 'granted', recording: 'denied' });
    assert.equal(fired, 2);
  });

  test('with storage blocked, the choice still holds for the page session', () => {
    (globalThis as unknown as { localStorage: unknown }).localStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    writeConsent({ analytics: 'denied' });
    assert.deepEqual(currentConsent(), { analytics: 'denied' });
  });
});

describe('categories', () => {
  test('follow the configured IDs', () => {
    assert.deepEqual(
      categoriesFor({ gaId: 'G-1', clarityId: 'c1' }).map((c) => c.id),
      ['analytics', 'recording'],
    );
    assert.deepEqual(categoriesFor({ gaId: 'G-1', clarityId: '' }).map((c) => c.id), ['analytics']);
    assert.deepEqual(categoriesFor({ gaId: '', clarityId: 'c1' }).map((c) => c.id), ['recording']);
    assert.deepEqual(categoriesFor({ gaId: '', clarityId: '' }), []);
  });

  test('decided only once every configured category has a choice', () => {
    const both = categoriesFor({ gaId: 'G-1', clarityId: 'c1' });
    const gaOnly = categoriesFor({ gaId: 'G-1', clarityId: '' });
    assert.equal(isDecided({}, both), false);
    assert.equal(isDecided({ analytics: 'granted' }, both), false);
    assert.equal(isDecided({ analytics: 'granted' }, gaOnly), true);
    assert.equal(isDecided({ analytics: 'denied', recording: 'granted' }, both), true);
  });

  test('accept all / decline all cover only configured categories', () => {
    assert.deepEqual(allCategories('denied', categoriesFor({ gaId: 'G-1', clarityId: '' })), {
      analytics: 'denied',
    });
  });
});

describe('cross-tab sync', () => {
  test('reacts to its own event and to other tabs writing the consent key', () => {
    let calls = 0;
    const off = subscribeConsent(() => calls++);
    browser.win.dispatchEvent(new CustomEvent(CONSENT_EVENT));
    browser.win.dispatchEvent(storageEvent(CONSENT_KEY));
    browser.win.dispatchEvent(storageEvent('notrack'));
    browser.win.dispatchEvent(storageEvent(null)); // another tab cleared storage
    browser.win.dispatchEvent(storageEvent('portfolio-theme'));
    assert.equal(calls, 4);
    off();
    browser.win.dispatchEvent(storageEvent(CONSENT_KEY));
    assert.equal(calls, 4);
  });

  test("another tab's opt-out stops the tag here and clears its cookies", () => {
    const config = { gaId: 'G-TEST123', clarityId: 'clar1ty', suppressed: false };
    const sync = () => applyConsent(currentConsent(), config);
    subscribeConsent(sync);

    /* This tab: both on. */
    writeConsent(allCategories('granted'));
    browser.jar.set('_ga=GA1.1.1; domain=.ktoc.dev; path=/');
    browser.jar.set('_clck=x; domain=.ktoc.dev; path=/');

    /* Another tab switches recording off: same storage, a 'storage' event here. */
    browser.store.set(CONSENT_KEY, serializeConsent({ analytics: 'granted', recording: 'denied' }));
    browser.win.dispatchEvent(storageEvent(CONSENT_KEY));

    assert.deepEqual(browser.jar.names(), ['_ga@.ktoc.dev']);
    const queue = (browser.win.clarity as { q: ArrayLike<unknown>[] }).q.map((a) => Array.from(a));
    assert.deepEqual(queue.at(-1), ['stop']);
    assert.equal(browser.win['ga-disable-G-TEST123'], false);
  });

  test('an old-shape value written by a tab still on old code is migrated on arrival', () => {
    /* An old tab writes the bare string; this tab migrates it on read. */
    browser.store.set(CONSENT_KEY, 'denied');
    let seen: unknown;
    subscribeConsent(() => (seen = readConsent()));
    browser.win.dispatchEvent(storageEvent(CONSENT_KEY));
    assert.deepEqual(seen, { analytics: 'denied', recording: 'denied' });
  });
});

describe('tracking suppression', () => {
  test('local hosts are suppressed, the real site is not', () => {
    for (const host of ['localhost', '127.0.0.1', 'portfolio.local', 'portfolio.test']) {
      installBrowser(`http://${host}/`);
      assert.equal(trackingSuppressed(), true, host);
    }
    installBrowser('https://ktoc.dev/');
    assert.equal(trackingSuppressed(), false);
  });

  test('?notrack=1 sticks to the device, ?notrack=0 undoes it', () => {
    const { store } = installBrowser('https://ktoc.dev/?notrack=1');
    assert.equal(trackingSuppressed(), true);
    (globalThis as unknown as { location: { search: string } }).location.search = '';
    assert.equal(trackingSuppressed(), true);
    (globalThis as unknown as { location: { search: string } }).location.search = '?notrack=0';
    assert.equal(trackingSuppressed(), false);
    assert.equal(store.has('notrack'), false);
  });
});

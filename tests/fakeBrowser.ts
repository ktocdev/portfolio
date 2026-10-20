/**
 * Just enough browser for the consent modules: localStorage, location, a
 * window that is an EventTarget, and a document with a cookie jar that keeps
 * domains the way a browser does — a cookie set on .ktoc.dev only goes away
 * when deleted with a matching domain attribute.
 */

type Cookie = { name: string; value: string; domain: string; hostOnly: boolean; path: string };

export class CookieJar {
  cookies: Cookie[] = [];
  /* A plain field, not a parameter property: Node's type stripping only
     handles erasable syntax. */
  private host: () => string;
  constructor(host: () => string) {
    this.host = host;
  }

  get header(): string {
    return this.cookies.map((c) => `${c.name}=${c.value}`).join('; ');
  }

  set(raw: string): void {
    const [pair, ...attrs] = raw.split(';').map((s) => s.trim());
    const eq = pair.indexOf('=');
    const name = pair.slice(0, eq);
    const value = pair.slice(eq + 1);
    const host = this.host();
    let domain = host;
    let hostOnly = true;
    let path = '/';
    let expired = false;
    for (const attr of attrs) {
      const [key, val = ''] = attr.split('=');
      const k = key.toLowerCase();
      if (k === 'domain') {
        domain = val.replace(/^\./, '').toLowerCase();
        hostOnly = false;
      } else if (k === 'path') path = val;
      else if (k === 'max-age' && Number(val) <= 0) expired = true;
      else if (k === 'expires' && new Date(val).getTime() < Date.now()) expired = true;
    }
    /* Browsers reject a domain the host isn't inside, and bare TLDs. */
    if (!hostOnly && (!domain.includes('.') || !(host === domain || host.endsWith(`.${domain}`)))) return;
    const same = (c: Cookie) =>
      c.name === name && c.domain === domain && c.hostOnly === hostOnly && c.path === path;
    this.cookies = this.cookies.filter((c) => !same(c));
    if (!expired) this.cookies.push({ name, value, domain, hostOnly, path });
  }

  names(): string[] {
    return this.cookies.map((c) => `${c.name}@${c.hostOnly ? '' : '.'}${c.domain}`).sort();
  }
}

export type FakeScript = { src: string; async: boolean };

export type FakeBrowser = {
  jar: CookieJar;
  scripts: FakeScript[];
  store: Map<string, string>;
  win: EventTarget & Record<string, unknown>;
};

const g = globalThis as unknown as Record<string, unknown>;

/** Installs a fresh fake browser on globalThis for `url`. */
export function installBrowser(url = 'https://www.ktoc.dev/'): FakeBrowser {
  const parsed = new URL(url);
  const location = { hostname: parsed.hostname, search: parsed.search };
  const jar = new CookieJar(() => location.hostname);
  const scripts: FakeScript[] = [];
  const store = new Map<string, string>();

  g.location = location;
  g.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  g.document = {
    get cookie() {
      return jar.header;
    },
    set cookie(raw: string) {
      jar.set(raw);
    },
    createElement: () => ({ src: '', async: false }),
    head: { appendChild: (el: FakeScript) => void scripts.push(el) },
  };
  const win = new EventTarget() as EventTarget & Record<string, unknown>;
  g.window = win;
  return { jar, scripts, store, win };
}

/** A 'storage' event as another tab's write would raise it here. */
export function storageEvent(key: string | null): Event {
  return Object.assign(new Event('storage'), { key });
}

/** dataLayer / clarity.q entries are Arguments objects; compare them as arrays. */
export function calls(queue: unknown): unknown[][] {
  return ((queue as ArrayLike<unknown>[] | undefined) ?? []).map((args) => Array.from(args));
}

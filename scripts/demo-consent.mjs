/**
 * Gives the Main Character demo the site's cookie banner and analytics.
 *
 * The demo is rag-journal's static build, mirrored wholesale into
 * public/main-character/demo/ by the refresh-demo skill, so anything added
 * there by hand would be wiped on the next refresh. As with demo-canonicals,
 * this works on the copies in out/ instead, after next build:
 *
 *   1. bundles src/demo/consent.ts (with the site's own consent and loader
 *      modules) and copies src/demo/consent.css, into out/.../site-consent/;
 *   2. links both from every demo page;
 *   3. fails the build if a Clarity mask target or an event hook is missing
 *      from the demo's markup, so a refresh that renames one can't quietly
 *      leave visitors' text unmasked in recordings.
 *
 * With --check it only runs step 3, against public/main-character/demo/, so
 * the refresh-demo skill can catch a rename right after copying a new build,
 * without running next build.
 */
import { build } from 'esbuild';
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'out';
const DEMO_DIR = 'main-character/demo';
const ASSET_DIR = 'site-consent';
const URL_BASE = `/${DEMO_DIR}/${ASSET_DIR}`;

const CHECK_ONLY = process.argv.includes('--check');
const root = join(CHECK_ONLY ? 'public' : OUT_DIR, DEMO_DIR);
if (!existsSync(root)) {
  console.error(`demo-consent: no ${root}/ directory${CHECK_ONLY ? '' : ' — run next build first'}.`);
  process.exit(1);
}

/* 3 first, so a broken page set fails before anything is built or stamped.
   The mask targets are read from the TS source rather than duplicated here. */
const source = await readFile('src/demo/consent.ts', 'utf8');
const maskBlock = source.match(/export const MASKED = \[([\s\S]*?)\];/)?.[1];
const maskIds = [...(maskBlock ?? '').matchAll(/'#([\w-]+)'/g)].map((m) => m[1]);
if (!maskIds.length) {
  console.error('demo-consent: no MASKED selectors found in src/demo/consent.ts.');
  process.exit(1);
}
const app = await readFile(join(root, 'index.html'), 'utf8');
const missing = maskIds.filter((id) => !app.includes(`id="${id}"`));
if (!/<section class="tab[ "]/.test(app)) missing.push('section.tab (tab events)');
const appJs = await readdir(join(root, 'js'));
const scripts = await Promise.all(
  appJs.filter((f) => f.endsWith('.js')).map((f) => readFile(join(root, 'js', f), 'utf8')),
);
for (const event of ['mc:turn', 'mc:closed']) {
  if (!scripts.some((s) => s.includes(`'${event}'`))) missing.push(`${event} event`);
}
if (!scripts.some((s) => s.includes("'demo-notice'"))) missing.push('#demo-notice (banner focus)');
if (missing.length) {
  console.error(
    `demo-consent: the demo no longer has ${missing.join(', ')}.\n` +
      '  Update MASKED / the hooks in src/demo/consent.ts to match the refreshed demo.',
  );
  process.exit(1);
}
if (CHECK_ONLY) {
  console.log(`demo-consent: the demo still has all ${maskIds.length} mask target(s) and the event hooks.`);
  process.exit(0);
}

/* 1. The bundle. tsconfig's paths resolve the @/ imports. */
const assets = join(root, ASSET_DIR);
await mkdir(assets, { recursive: true });
await build({
  entryPoints: ['src/demo/consent.ts'],
  outfile: join(assets, 'consent.js'),
  bundle: true,
  format: 'esm',
  target: 'es2022',
  minify: true,
  legalComments: 'none',
  logLevel: 'warning',
});
await copyFile('src/demo/consent.css', join(assets, 'consent.css'));

/* 2. Stamp every demo page. Absolute URLs, so one tag fits pages at any depth. */
const tags =
  `<link rel="stylesheet" href="${URL_BASE}/consent.css">\n` +
  `<script type="module" src="${URL_BASE}/consent.js"></script>\n`;
let stamped = 0;
for (const entry of await readdir(root, { withFileTypes: true, recursive: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const file = join(entry.parentPath, entry.name);
  const html = await readFile(file, 'utf8');
  if (html.includes(`${URL_BASE}/consent.js`)) continue;
  if (!html.includes('</head>')) {
    console.error(`demo-consent: no </head> in ${file}.`);
    process.exit(1);
  }
  await writeFile(file, html.replace('</head>', `${tags}</head>`));
  stamped += 1;
}

console.log(`demo-consent: bundled, ${maskIds.length} mask(s) checked, stamped ${stamped} page(s).`);

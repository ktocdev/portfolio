/**
 * Gives each page of the OnTrack design system its own index.html.
 *
 * The design system is OnTrack's static build, mirrored wholesale into
 * public/ontrack/design-system/ by the refresh-design-system skill. It is a
 * single-page app with browser routes (/ontrack/design-system/components/buttons),
 * but this site's Worker serves 404.html for any path without a file — it is
 * not in single-page-application mode, and must not be. So a reload or a shared
 * link to any page but the overview would 404. This writes a copy of the app's
 * index.html into each route's folder; the copy boots the app, and the router
 * renders that route.
 *
 * The routes come from OnTrack's page registry, so this runs at refresh time,
 * with the OnTrack repo beside this one, and the copies are committed:
 *
 *   node scripts/ontrack-ds-pages.mjs [path/to/ontrack]   (default ../ontrack)
 *
 * The favicon link is made absolute in every copy (the build writes
 * ./favicon.svg, which would resolve inside each route's folder).
 *
 * With --check (run by npm run build, no OnTrack needed) it only verifies the
 * copies: that there are some, and that each matches the overview's index.html.
 * A refresh that skipped this script leaves none — /MIR deletes them — and a
 * copy left from an older build would point at asset files that no longer exist.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const BASE = '/ontrack/design-system/';
const ROOT = join('public', BASE);
const INDEX = join(ROOT, 'index.html');
const NAME = 'ontrack-ds-pages';

function fail(message) {
  console.error(`${NAME}: ${message}`);
  process.exit(1);
}

if (!existsSync(INDEX)) fail(`no ${INDEX} — run the refresh-design-system skill first.`);

if (process.argv.includes('--check')) {
  const index = await readFile(INDEX, 'utf8');
  if (index.includes('href="./')) fail(`${INDEX} still has relative links — run this script without --check.`);
  let copies = 0;
  for (const entry of await readdir(ROOT, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || entry.name !== 'index.html') continue;
    const file = join(entry.parentPath, entry.name);
    if (resolve(file) === resolve(INDEX)) continue;
    if ((await readFile(file, 'utf8')) !== index) {
      fail(`${relative('.', file).split(sep).join('/')} differs from the overview's index.html — rerun this script.`);
    }
    copies += 1;
  }
  if (copies === 0) fail('no route pages — rerun this script after the refresh.');
  console.log(`${NAME}: ${copies} route page(s) match.`);
  process.exit(0);
}

const ontrack = resolve(process.argv[2] ?? '../ontrack');
const registryFile = join(ontrack, 'design-system/src/pages/registry.tsx');
if (!existsSync(registryFile)) fail(`no ${registryFile}.`);

const registry = await readFile(registryFile, 'utf8');
const routes = [...registry.matchAll(/\bpath: '([^']+)'/g)].map((m) => m[1]);
if (!routes.includes('/')) fail(`found no overview route in ${registryFile} — has its format changed?`);
for (const route of routes) {
  if (!/^\/[a-z0-9/-]*$/.test(route)) fail(`unexpected route "${route}" in ${registryFile}.`);
}

let index = await readFile(INDEX, 'utf8');
index = index.replaceAll('href="./', `href="${BASE}`);
if (index.includes('="./')) fail(`${INDEX} has a relative link this script doesn't fix.`);
await writeFile(INDEX, index);

let written = 0;
for (const route of routes) {
  if (route === '/') continue;
  const dir = join(ROOT, route.slice(1));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), index);
  written += 1;
}
console.log(`${NAME}: wrote ${written} route page(s).`);

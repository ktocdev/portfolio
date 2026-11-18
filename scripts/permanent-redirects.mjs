/**
 * Makes Cloudflare's redirects to each page's served URL permanent.
 *
 * Cloudflare serves foo/index.html at /foo/ and foo.html at /foo, and
 * redirects the other forms (/foo, /foo.html) there with a 307: temporary,
 * which tells Google the old URL may come back, so it keeps checking it and
 * Search Console keeps listing it as "Page with redirect". A rule in
 * _redirects takes precedence over that, so this writes out/_redirects with a
 * 301 for each:
 *
 *   /foo, /foo/index.html
 *               -> /foo/      for every foo/index.html (Next pages, the demo,
 *                             the OnTrack design system's routes)
 *   /foo.html   -> /foo       for every other .html file outside _next/
 *
 * Generated from out/ after next build, so a new page gets its rule on the
 * next build. 404.html is skipped: nothing should redirect to it.
 */
import { readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT_DIR = 'out';
const NAME = 'permanent-redirects';
/* Cloudflare's limit is 2,000 static rules; stay well inside it. */
const MAX_RULES = 1500;

if (!existsSync(OUT_DIR)) {
  console.error(`${NAME}: no ${OUT_DIR}/ directory — run next build first.`);
  process.exit(1);
}
if (existsSync(join(OUT_DIR, '_redirects'))) {
  console.error(`${NAME}: ${OUT_DIR}/_redirects already exists (from public/?) — merge it into this script instead.`);
  process.exit(1);
}

const rules = [];
for (const entry of await readdir(OUT_DIR, { withFileTypes: true, recursive: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const path = relative(OUT_DIR, join(entry.parentPath, entry.name)).split(sep).join('/');
  if (path.startsWith('_next/') || path === '404.html' || path === 'index.html') continue;
  if (path.endsWith('/index.html')) {
    const dir = path.slice(0, -'/index.html'.length);
    rules.push(`/${dir} /${dir}/ 301`, `/${dir}/index.html /${dir}/ 301`);
  } else {
    const page = path.slice(0, -'.html'.length);
    rules.push(`/${page}.html /${page} 301`);
  }
}

if (rules.length > MAX_RULES) {
  console.error(`${NAME}: ${rules.length} rules, over the ${MAX_RULES} budget — switch to splat rules.`);
  process.exit(1);
}
rules.sort();
await writeFile(join(OUT_DIR, '_redirects'), `# Written by scripts/permanent-redirects.mjs at build time.\n${rules.join('\n')}\n`);
console.log(`${NAME}: wrote ${rules.length} rule(s).`);

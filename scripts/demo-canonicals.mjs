/**
 * Gives the Main Character demo's pages a <link rel="canonical">.
 *
 * The demo is rag-journal's static build, mirrored wholesale into
 * public/main-character/demo/ by the refresh-demo skill, so a tag added there
 * by hand would be wiped on the next refresh — and the site's URL is this
 * repo's business, not rag-journal's. This stamps the copies in out/ instead,
 * after next build.
 *
 * Each page names the URL Cloudflare actually serves it at: foo/index.html is
 * served at foo/ and foo.html at foo, with the other form 307-redirecting
 * there. Without the tag Google can't tell which form is meant and reports
 * "Duplicate without user-selected canonical".
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT_DIR = 'out';
const DEMO_DIR = 'main-character/demo';

/* SITE.url, read from the TS source rather than duplicated here. */
const siteSource = await readFile('src/content/site.ts', 'utf8');
const SITE_URL = siteSource.match(/^\s*url: '([^']+)'/m)?.[1];
if (!SITE_URL) {
  console.error('demo-canonicals: no SITE.url found in src/content/site.ts.');
  process.exit(1);
}

const root = join(OUT_DIR, DEMO_DIR);
if (!existsSync(root)) {
  console.error(`demo-canonicals: no ${root}/ directory — run next build first.`);
  process.exit(1);
}

let stamped = 0;
for (const entry of await readdir(root, { withFileTypes: true, recursive: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const file = join(entry.parentPath, entry.name);
  const path = relative(OUT_DIR, file).split(sep).join('/');
  const urlPath = path.endsWith('/index.html')
    ? path.slice(0, -'index.html'.length)
    : path.slice(0, -'.html'.length);

  const html = await readFile(file, 'utf8');
  if (/<link rel="canonical"/.test(html)) continue;
  if (!html.includes('</head>')) {
    console.error(`demo-canonicals: no </head> in ${path}.`);
    process.exit(1);
  }
  const tag = `<link rel="canonical" href="${SITE_URL}/${urlPath}">\n`;
  await writeFile(file, html.replace('</head>', `${tag}</head>`));
  stamped += 1;
}

console.log(`demo-canonicals: stamped ${stamped} page(s).`);

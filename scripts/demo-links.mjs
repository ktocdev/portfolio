/**
 * Points the Main Character demo's internal links at the URLs Cloudflare
 * actually serves.
 *
 * Cloudflare serves foo.html at /foo and foo/index.html at /foo/, and
 * redirects the .html forms there. The demo is rag-journal's static build,
 * whose pages link to each other by file name (input.html, ../index.html),
 * because rag-journal's own server serves them that way. Google follows those
 * links, lands on a redirect, and lists every such URL in Search Console as
 * "Page with redirect", which never clears while the links stay.
 *
 * As with demo-canonicals, the demo is mirrored wholesale by the refresh-demo
 * skill, so this rewrites the copies in out/ after next build:
 *
 *   - in every demo .html and .js file, a relative href="….html" attribute
 *     (foo.html -> foo, index.html -> ./, ../index.html -> ../);
 *   - in design/design.js, the nav's page list ('foo.html' -> 'foo') and its
 *     home link, which it builds in script rather than markup. The nav marks
 *     the current page by comparing the list to the URL's last segment, so
 *     with the extensionless names it now matches on the served URLs too.
 *
 * The design.js rewrite expects the code as it is today and fails the build if
 * it changed, rather than shipping half-rewritten links.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT_DIR = 'out';
const DEMO_DIR = 'main-character/demo';
const NAME = 'demo-links';

function fail(message) {
  console.error(`${NAME}: ${message}`);
  process.exit(1);
}

/** The served form of a relative link to an .html file. */
function served(path) {
  if (path === 'index.html') return './';
  if (path.endsWith('/index.html')) return path.slice(0, -'index.html'.length);
  return path.slice(0, -'.html'.length);
}

/* href="x.html" or href="x.html#frag", relative (no scheme, no leading slash). */
const HREF = /href="(?![a-z][a-z0-9+.-]*:|\/)([^"#?]+\.html)((?:#[^"]*)?)"/gi;

const root = join(OUT_DIR, DEMO_DIR);
if (!existsSync(root)) fail(`no ${root}/ directory — run next build first.`);

let files = 0;
let links = 0;
for (const entry of await readdir(root, { withFileTypes: true, recursive: true })) {
  if (!entry.isFile() || !/\.(html|js)$/.test(entry.name)) continue;
  const file = join(entry.parentPath, entry.name);
  const source = await readFile(file, 'utf8');
  let count = 0;
  let text = source.replace(HREF, (_, path, frag) => {
    count += 1;
    return `href="${served(path)}${frag}"`;
  });

  if (relative(root, file).split(sep).join('/') === 'design/design.js') {
    const list = text.match(/export const PAGES = \[[\s\S]*?\];/)?.[0];
    if (!list || !/'[\w-]+\.html'/.test(list)) fail('design/design.js has no PAGES list of .html files — has it changed?');
    const rewritten = list.replace(/'([\w-]+)\.html'/g, (_, page) => {
      count += 1;
      return `'${page}'`;
    });
    text = text.replace(list, rewritten);

    const home = "add('home', 'index.html', here === 'index.html');";
    if (!text.includes(home)) fail("design/design.js has no home link in the form expected — has it changed?");
    text = text.replace(home, "add('home', './', here === '');");
    count += 1;
  }

  if (count === 0) continue;
  await writeFile(file, text);
  files += 1;
  links += count;
}

if (links === 0) fail('found no .html links to rewrite — has the demo changed?');
console.log(`${NAME}: rewrote ${links} link(s) in ${files} file(s).`);

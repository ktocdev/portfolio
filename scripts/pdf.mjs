/**
 * Regenerates public/Katie-OConnor-Resume.pdf from /resume.
 *
 *   npm run pdf              build, print, save over the published PDF
 *   npm run pdf -- --out x   write somewhere else instead (no overwrite)
 *   npm run pdf -- --keep    leave the build in out/ for inspection
 *
 * The page is the print source — globals.css strips the site chrome under
 * `@media print` — so this drives a real Chromium over the exported site and
 * lets that CSS do the work, rather than reimplementing the document.
 *
 * No new dependency: it uses the Chrome or Edge already on the machine and a
 * ~20-line static server for out/. Override the browser with PDF_BROWSER.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { ENV_FILE, loadPrintEnv } from './lib/print-env.mjs';

const DEFAULT_OUT = 'public/Katie-OConnor-Resume.pdf';
const PAGE = '/resume/';

const args = process.argv.slice(2);
const outArg = args.indexOf('--out');
const outFile = resolve(outArg === -1 ? DEFAULT_OUT : args[outArg + 1]);
const keepBuild = args.includes('--keep');

const BROWSERS = [
  process.env.PDF_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

const browser = BROWSERS.find((path) => existsSync(path));
if (!browser) {
  console.error(
    '\nNo Chrome or Edge found. Install one, or point PDF_BROWSER at the\n' +
      'executable:\n\n  PDF_BROWSER="C:/path/to/chrome.exe" npm run pdf\n'
  );
  process.exit(1);
}

/* 1. Build the site with the print-only fields in it. */
const vars = loadPrintEnv();
console.log(`Building with ${Object.keys(vars).join(', ')} from ${ENV_FILE}.`);

const build = spawnSync('npx', ['next', 'build'], {
  stdio: ['inherit', 'ignore', 'inherit'],
  shell: true,
  env: { ...process.env, ...vars },
});
if (build.status !== 0) {
  console.error('\nBuild failed: not printing a stale page.\n');
  process.exit(build.status ?? 1);
}

/* 2. Serve out/ so the page loads over http, as it does in production.
      file:// would break the absolute /_next/... asset paths. */
const root = resolve('out');
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let path = join(root, url);
  if (!path.startsWith(root)) return res.writeHead(403).end();
  if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');

  try {
    const body = await readFile(path);
    const ext = path.slice(path.lastIndexOf('.'));
    res.writeHead(200, { 'content-type': TYPES[ext] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

await new Promise((done) => server.listen(0, '127.0.0.1', done));
const { port } = server.address();
const url = `http://127.0.0.1:${port}${PAGE}`;

/* 3. Print it. A throwaway profile keeps this away from the running browser:
      without it Chrome attaches to the real profile and the print never
      happens. --virtual-time-budget lets fonts and layout settle first. */
const profile = mkdtempSync(join(tmpdir(), 'resume-pdf-'));
console.log(`Printing ${url} with ${browser.split(/[\/]/).pop()}.`);

/* spawn, not spawnSync: the server above lives in this process, so blocking
   the event loop here would leave Chrome waiting on a page that can never be
   served, and the two would deadlock. */
const print = await new Promise((done) => {
  const child = spawn(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${profile}`,
      '--virtual-time-budget=10000',
      '--no-pdf-header-footer',
      `--print-to-pdf=${outFile}`,
      url,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  let stderr = '';
  child.stderr.on('data', (chunk) => (stderr += chunk));

  /* Chrome has been known to sit on a page that never settles; fail with the
     output rather than hanging a terminal indefinitely. */
  const timer = setTimeout(() => {
    child.kill();
    done({ status: 1, stderr: `${stderr}
Timed out after 120s waiting for Chrome.` });
  }, 120_000);

  child.on('exit', (status) => {
    clearTimeout(timer);
    done({ status, stderr });
  });
});

server.close();
rmSync(profile, { recursive: true, force: true });
if (!keepBuild) rmSync(root, { recursive: true, force: true });

if (print.status !== 0 || !existsSync(outFile)) {
  console.error(`\nPrint failed.\n\n${print.stderr?.toString().trim() ?? ''}\n`);
  process.exit(1);
}

const kb = Math.round(statSync(outFile).size / 1024);
console.log(`\nWrote ${outFile} (${kb} KB).`);
console.log('Check the phone number and page breaks, then commit and deploy.');

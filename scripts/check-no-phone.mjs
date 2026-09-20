/**
 * Deploy guard: fails if a phone number reached the exported HTML.
 *
 * `npm run deploy` builds and uploads from this machine, one directory away
 * from .env.print.local, so the cheap insurance is to check the output rather
 * than trust the environment. Shape-based, so it catches any number, not just
 * the one in that file.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'out';
const PHONE = /\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/;

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
  });

const hits = htmlFiles(DIR).filter((path) => PHONE.test(readFileSync(path, 'utf8')));

if (hits.length) {
  console.error(
    `\nRefusing to deploy: a phone number is in the exported HTML.\n\n` +
      hits.map((path) => `  ${path}`).join('\n') +
      `\n\nThe number is meant for the printed PDF only. This is what a build\n` +
      `run with RESUME_PHONE set looks like — rebuild with a plain \`npm run build\`.\n`
  );
  process.exit(1);
}

console.log(`No phone numbers in ${DIR}: safe to deploy.`);

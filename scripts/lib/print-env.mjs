/**
 * Loads the print-only resume fields from .env.print.local.
 *
 * Next does not auto-load this filename — it only reads .env, .env.local and
 * .env.<development|production|test>[.local] — so a plain `next build`, and
 * the one inside `npm run deploy`, never see these values. That is what keeps
 * the phone number out of the deployed HTML while still putting it on the PDF.
 */
import { readFileSync } from 'node:fs';

export const ENV_FILE = '.env.print.local';
const REQUIRED = ['RESUME_PHONE'];

export function loadPrintEnv() {
  let file;
  try {
    file = readFileSync(ENV_FILE, 'utf8');
  } catch {
    fail(
      `${ENV_FILE} is missing. Create it with:\n\n  RESUME_PHONE=555-555-5555\n\n` +
        'It is gitignored, so a fresh clone has to write its own.'
    );
  }

  /* Deliberately minimal: KEY=value lines, no quotes, no interpolation. */
  const vars = Object.fromEntries(
    file
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const at = line.indexOf('=');
        return at === -1 ? null : [line.slice(0, at).trim(), line.slice(at + 1).trim()];
      })
      .filter(Boolean)
  );

  const missing = REQUIRED.filter((key) => !vars[key]);
  if (missing.length) fail(`${ENV_FILE} has no value for: ${missing.join(', ')}`);

  return vars;
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

/**
 * Runs Next with the print-only resume fields loaded.
 *
 *   npm run dev:print     dev server, to eyeball /resume before printing
 *   npm run build:print   static build with the same fields baked in
 *
 * For the PDF itself, prefer `npm run pdf`, which does the build, the print
 * and the save in one step.
 */
import { spawnSync } from 'node:child_process';

import { ENV_FILE, loadPrintEnv } from './lib/print-env.mjs';

const mode = process.argv[2] === 'dev' ? 'dev' : 'build';
const vars = loadPrintEnv();

console.log(`Running next ${mode} with ${Object.keys(vars).join(', ')} from ${ENV_FILE}.`);
if (mode === 'dev') {
  console.log('Stop any plain `npm run dev` first: Next refuses a second dev server here.');
}

const run = spawnSync('npx', ['next', mode], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, ...vars },
});

process.exit(run.status ?? 1);

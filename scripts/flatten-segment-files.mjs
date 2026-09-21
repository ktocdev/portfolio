/**
 * Works around a Next.js static-export bug that only fires on Windows.
 *
 * next/dist/export/index.js collects each page's RSC segment files with
 * path.relative(), which on Windows yields backslash-separated paths
 * ("projects\__PAGE__.segment.rsc"). It then builds the output filename with
 * convertSegmentPathToStaticExportFilename(), whose replace(/\//g, '.') only
 * rewrites FORWARD slashes — so the backslash survives into the filename, and
 * the following path.join() re-reads it as a separator. The result is a
 * directory tree ("projects/__next.projects/__PAGE__.txt") where the client
 * router asks for one flat file ("projects/__next.projects.__PAGE__.txt").
 *
 * Every nested segment prefetch then 404s. Navigation still works — the router
 * falls back to the full index.txt payload — but prefetching is dead and the
 * console fills with errors.
 *
 * This flattens those directories back to the names the client actually
 * requests. On macOS/Linux the build emits flat files already, so no __next*
 * directories exist and this is a no-op.
 *
 * Remove once the upstream export path uses posix separators.
 */
import { readdir, rename, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT_DIR = 'out';

/** Every file beneath `dir`, as paths relative to it, posix-separated. */
async function filesUnder(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) {
      const abs = join(entry.parentPath, entry.name);
      found.push(relative(dir, abs).split(sep).join('/'));
    }
  }
  return found;
}

/** Directories named `__next*` — the mis-split segment trees. Not `_next`. */
async function segmentDirs(root) {
  const found = [];
  for (const entry of await readdir(root, { withFileTypes: true, recursive: true })) {
    if (entry.isDirectory() && entry.name.startsWith('__next')) {
      found.push(join(entry.parentPath, entry.name));
    }
  }
  /* Deepest first, so a nested match is moved before its parent disappears. */
  return found.sort((a, b) => b.length - a.length);
}

if (!existsSync(OUT_DIR)) {
  console.error(`flatten-segment-files: no ${OUT_DIR}/ directory — run next build first.`);
  process.exit(1);
}

let moved = 0;
for (const dir of await segmentDirs(OUT_DIR)) {
  const parent = join(dir, '..');
  const prefix = dir.split(sep).pop();
  for (const file of await filesUnder(dir)) {
    /* "__next.projects" + "__PAGE__.txt" -> "__next.projects.__PAGE__.txt";
       deeper routes join their parts with dots the same way. */
    await rename(join(dir, file), join(parent, `${prefix}.${file.split('/').join('.')}`));
    moved += 1;
  }
  await rm(dir, { recursive: true });
}

console.log(
  moved === 0
    ? 'flatten-segment-files: nothing to do (segment files already flat).'
    : `flatten-segment-files: flattened ${moved} segment file(s).`,
);

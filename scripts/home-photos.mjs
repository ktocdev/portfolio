/**
 * Prepares the homepage photo pile: `npm run home-photos`.
 *
 * Reads every photo in home-images/ (kept out of git: phone originals are
 * large and carry EXIF such as GPS), turns it upright from its EXIF
 * orientation, scales it to fit 1200×800 and writes a metadata-free JPEG to
 * public/media/home/. Then rewrites src/content/home-photos.json, which the
 * homepage reads: one entry per photo in filename order, the first tossed
 * first, so it ends up at the bottom of the pile. Prefix filenames with
 * numbers to set the order.
 *
 * Alt text defaults to the filename in words; edit it in the JSON and a
 * re-run keeps it. Photos removed from home-images/ are dropped from both.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join, parse } from 'node:path';
import sharp from 'sharp';

const SOURCE = process.argv[2] ?? 'home-images';
const OUT_DIR = 'public/media/home';
const MANIFEST = 'src/content/home-photos.json';

/* A print is drawn at most ~320px tall and ~460px wide (Figure.module.css's
   --frame-h, shrunk by PhotoPile.module.css), so this box covers a 2× screen
   for any shape of photo. */
const MAX = { width: 1200, height: 800 };
const INPUTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);

if (!existsSync(SOURCE)) {
  console.error(`No ${SOURCE}/ folder. Put the homepage photos there and run this again.`);
  process.exit(1);
}

const files = readdirSync(SOURCE)
  .filter((name) => INPUTS.has(extname(name).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const skipped = readdirSync(SOURCE).filter(
  (name) => !INPUTS.has(extname(name).toLowerCase()) && !name.startsWith('.'),
);
if (skipped.length) {
  console.warn(`Skipping ${skipped.join(', ')} (HEIC and other formats need converting first).`);
}

const slugOf = (name) =>
  parse(name)
    .name.toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* "03-mochi-on-the-couch" → "Mochi on the couch". */
const altOf = (slug) => {
  const words = slug.replace(/^\d+-/, '').replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : [];
const altBySrc = new Map(previous.map((photo) => [photo.src, photo.alt]));

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const photos = [];
for (const name of files) {
  const slug = slugOf(name);
  const src = `/media/home/${slug}.jpg`;
  const info = await sharp(join(SOURCE, name))
    .rotate()
    .resize({ ...MAX, fit: 'inside', withoutEnlargement: true })
    /* No alpha in a JPEG: a transparent PNG lands on white, like a print. */
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(join(OUT_DIR, `${slug}.jpg`));
  photos.push({ src, width: info.width, height: info.height, alt: altBySrc.get(src) ?? altOf(slug) });
  console.log(`${name} → ${src} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
}

writeFileSync(MANIFEST, `${JSON.stringify(photos, null, 2)}\n`);
console.log(`\n${photos.length} photo${photos.length === 1 ? '' : 's'} in ${MANIFEST}.`);

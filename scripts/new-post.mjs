/**
 * Scaffolds a blog post: `npm run new-post -- "Post title"`.
 *
 * Writes src/content/blog/YYYY-MM-DD-post-title.md as a draft, plus an empty
 * public/blog/post-title/ for its images. Drafts show in `npm run dev` and are
 * left out of production builds, so flip `draft: false` when it's ready and
 * `npm run deploy` publishes it.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new-post -- "Post title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

if (!slug) {
  console.error(`Couldn't make a URL slug from "${title}". Use some letters or numbers.`);
  process.exit(1);
}

/* Local calendar date, not UTC — a post started late in the evening in
   Chicago is still dated today. */
const now = new Date();
const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  .map((n) => String(n).padStart(2, '0'))
  .join('-');

const file = join('src', 'content', 'blog', `${date}-${slug}.md`);
const images = join('public', 'blog', slug);

if (existsSync(file)) {
  console.error(`${file} already exists.`);
  process.exit(1);
}

/* YAML-quote the title so colons, quotes and the like survive. */
const quoted = JSON.stringify(title);

mkdirSync(join('src', 'content', 'blog'), { recursive: true });
mkdirSync(images, { recursive: true });
writeFileSync(
  file,
  `---
title: ${quoted}
date: ${date}
summary: One or two sentences for the blog index and link previews.
tags: []
draft: true
---

Start writing here.

Images go in public/blog/${slug}/ and are referenced as
![Alt text](/blog/${slug}/example.png).
`
);

console.log(`Created ${file}`);
console.log(`Images: public/blog/${slug}/`);
console.log(`Preview: npm run dev, then http://localhost:3000/blog/${slug}/`);

/**
 * Blog posts: markdown files in src/content/blog, read and rendered at build
 * time. The site is a static export, so none of this — the parser, Shiki, its
 * grammars — reaches the browser; posts ship as plain HTML.
 *
 * A post is `YYYY-MM-DD-some-slug.md`. The date prefix only orders files in
 * the folder; the URL is the rest (`/blog/some-slug/`) and the published date
 * comes from front matter. `npm run new-post` scaffolds one.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';

import matter from 'gray-matter';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const DIR = join(process.cwd(), 'src', 'content', 'blog');
const FILENAME = /^\d{4}-\d{2}-\d{2}-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

/* Drafts render in `next dev` so they can be previewed, and are left out of
   the production build entirely: no page, no index entry, no sitemap row. */
const SHOW_DRAFTS = process.env.NODE_ENV !== 'production';

export type PostMeta = {
  slug: string;
  title: string;
  /* ISO date, YYYY-MM-DD. */
  date: string;
  summary: string;
  tags: string[];
  draft: boolean;
  readingMinutes: number;
};

export type Post = PostMeta & { html: string };

type Source = { meta: PostMeta; body: string };

/* A bad post fails the build loudly rather than deploying a broken page. */
function fail(file: string, problem: string): never {
  throw new Error(`src/content/blog/${file}: ${problem}`);
}

/* YAML turns an unquoted 2026-09-27 into a Date at UTC midnight; a quoted one
   stays a string. Either way, keep the calendar date as written. */
function isoDate(value: unknown, file: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  fail(file, '`date` must be YYYY-MM-DD');
}

function read(file: string): Source {
  const match = FILENAME.exec(file);
  if (!match) fail(file, 'name files YYYY-MM-DD-lowercase-slug.md');

  const { data, content } = matter(readFileSync(join(DIR, file), 'utf8'));

  if (typeof data.title !== 'string' || !data.title.trim()) fail(file, '`title` is required');
  if (typeof data.summary !== 'string' || !data.summary.trim()) {
    fail(file, '`summary` is required (it is the index blurb and the share description)');
  }
  if (data.tags !== undefined && !(Array.isArray(data.tags) && data.tags.every((t) => typeof t === 'string'))) {
    fail(file, '`tags` must be a list of strings');
  }

  const words = content.split(/\s+/).filter(Boolean).length;

  return {
    meta: {
      slug: match[1],
      title: data.title.trim(),
      date: isoDate(data.date, file),
      summary: data.summary.trim(),
      tags: data.tags ?? [],
      draft: data.draft === true,
      readingMinutes: Math.max(1, Math.round(words / 230)),
    },
    body: content,
  };
}

function sources(): Source[] {
  let files: string[];
  try {
    files = readdirSync(DIR).filter((name) => name.endsWith('.md'));
  } catch {
    return [];
  }

  const all = files.map(read).filter(({ meta }) => SHOW_DRAFTS || !meta.draft);

  const seen = new Set<string>();
  for (const { meta } of all) {
    if (seen.has(meta.slug)) throw new Error(`src/content/blog: two posts use the slug "${meta.slug}"`);
    seen.add(meta.slug);
  }

  /* Newest first; same-day posts fall back to title so the order is stable. */
  return all.sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.meta.title.localeCompare(b.meta.title));
}

/* Memoised per render: the footer on every page, the sitemap and the index
   all ask, and a post page asks twice (metadata and body) — one read and one
   Shiki pass each, not one per caller. */
export const getAllPosts = cache((): PostMeta[] => sources().map(({ meta }) => meta));

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  /* The heading itself becomes the anchor link: no extra glyph for screen
     readers to announce, and the hash is one click away. */
  .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
  .use(rehypePrettyCode, {
    /* Both themes are emitted as CSS variables per token (--shiki-light /
       --shiki-dark); the post stylesheet picks one with the same selectors
       that drive the site's own light/dark switch. */
    theme: { light: 'github-light', dark: 'github-dark' },
    /* The block background comes from the site's --surface, not the theme. */
    keepBackground: false,
    /* A bare ``` block still gets the monospace block styling. */
    defaultLang: { block: 'plaintext' },
  })
  .use(rehypeStringify);

export const getPost = cache(async (slug: string): Promise<Post | undefined> => {
  const source = sources().find(({ meta }) => meta.slug === slug);
  if (!source) return undefined;
  const html = String(await processor.process(source.body));
  return { ...source.meta, html };
});

/* "September 27, 2026". Formatted in UTC so the build machine's timezone can't
   shift a date written as a calendar day. */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MetadataRoute } from 'next';

import { NAV, SITE } from '@/content/site';
import { getAllPosts } from '@/lib/blog';

/* Static export: emitted once at build time as /sitemap.xml. */
export const dynamic = 'force-static';

/* The primary nav plus the pages linked only from within: the full resume
   (from /resume), cookies (from the footer) and the Main Character splash
   (from /projects). */
const ROUTES = [...NAV.map((item) => item.href), '/cookies', '/main-character'];

/* Not a Next route — a static app dropped into public/ (see next.config.ts) —
   so it needs its own entry rather than joining ROUTES. */
const MAIN_CHARACTER_DEMO = '/main-character/demo';

/* The design system's own pages, read from its nav list (PAGES in
   public/main-character/demo/design/design.js) so a page added upstream joins
   the sitemap on the next refresh. Cloudflare serves each foo.html at /foo and
   307s the .html form there, so the sitemap lists the extensionless URL — a
   redirecting URL can't be indexed. */
const DESIGN_JS = join(process.cwd(), 'public/main-character/demo/design/design.js');

function designSystemPages(): string[] {
  const source = readFileSync(DESIGN_JS, 'utf8');
  const list = source.split('export const PAGES = [')[1]?.split('];')[0] ?? '';
  const pages = [...list.matchAll(/'([\w-]+)\.html'/g)].map((match) => match[1]);
  if (pages.length === 0) throw new Error(`sitemap: no design pages found in ${DESIGN_JS}`);
  return pages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = ROUTES.map((path) => ({
    /* trailingSlash: true — match the URLs the export actually serves. */
    url: path === '/' ? `${SITE.url}/` : `${SITE.url}${path}/`,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));

  pages.push({
    url: `${SITE.url}${MAIN_CHARACTER_DEMO}/`,
    changeFrequency: 'monthly',
    priority: 0.6,
  });

  pages.push({
    url: `${SITE.url}${MAIN_CHARACTER_DEMO}/design/`,
    changeFrequency: 'monthly',
    priority: 0.5,
  });

  for (const page of designSystemPages()) {
    pages.push({
      url: `${SITE.url}${MAIN_CHARACTER_DEMO}/design/${page}`,
      changeFrequency: 'monthly',
      priority: 0.4,
    });
  }

  /* The blog joins once something is published (see SiteFooter). */
  const posts = getAllPosts();
  if (posts.length === 0) return pages;

  return [
    ...pages,
    { url: `${SITE.url}/blog/`, lastModified: posts[0].date, changeFrequency: 'weekly', priority: 0.6 },
    ...posts.map((post) => ({
      url: `${SITE.url}/blog/${post.slug}/`,
      lastModified: post.date,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}

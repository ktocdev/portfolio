import type { MetadataRoute } from 'next';

import { NAV, SITE } from '@/content/site';
import { getAllPosts } from '@/lib/blog';

/* Static export: emitted once at build time as /sitemap.xml. */
export const dynamic = 'force-static';

/* The primary nav plus the two pages linked only from within: the full
   resume (from /resume) and cookies (from the footer). */
const ROUTES = [...NAV.map((item) => item.href), '/cookies'];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = ROUTES.map((path) => ({
    /* trailingSlash: true — match the URLs the export actually serves. */
    url: path === '/' ? `${SITE.url}/` : `${SITE.url}${path}/`,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));

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

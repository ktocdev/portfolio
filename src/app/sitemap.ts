import type { MetadataRoute } from 'next';

import { NAV, SITE } from '@/content/site';

/* Static export: emitted once at build time as /sitemap.xml. */
export const dynamic = 'force-static';

/* The primary nav plus the two pages linked only from within: the full
   resume (from /resume) and cookies (from the footer). */
const ROUTES = [...NAV.map((item) => item.href), '/cookies'];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    /* trailingSlash: true — match the URLs the export actually serves. */
    url: path === '/' ? `${SITE.url}/` : `${SITE.url}${path}/`,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}

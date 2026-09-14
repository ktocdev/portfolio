import type { MetadataRoute } from 'next';

import { SITE } from '@/content/site';

/* Static export: emitted once at build time as /robots.txt. */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

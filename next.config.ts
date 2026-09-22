import type { NextConfig } from 'next';

/* The Main Character demo is a self-contained static app built by rag-journal's
   scripts/build_web_demo.py straight into public/main-character/demo/. It has no
   Next route — Cloudflare's asset handler resolves /main-character/demo/ to that
   folder's index.html. `next dev` does not: it serves public/ by exact path only,
   so the folder URL 404s and trailingSlash redirects the extensionless form into
   that same 404. This rewrite restores the production behaviour locally. It is
   omitted from production builds, where `rewrites` is unsupported alongside
   `output: 'export'` — and unnecessary, since Cloudflare already does this. */
const devOnlyRewrites: Pick<NextConfig, 'rewrites'> =
  process.env.NODE_ENV === 'development'
    ? {
        rewrites: async () => [
          {
            source: '/main-character/demo/:path*/',
            destination: '/main-character/demo/:path*/index.html',
          },
          {
            source: '/main-character/demo/',
            destination: '/main-character/demo/index.html',
          },
        ],
      }
    : {};

const nextConfig: NextConfig = {
  /* Static export — the whole site is prerendered to HTML at build time.
     No server runtime, so it drops straight onto Cloudflare as static assets. */
  output: 'export',
  /* next/image's optimizer needs a server; unoptimized serves the files as-is. */
  images: { unoptimized: true },
  /* Emit /projects/index.html rather than /projects.html so static hosts
     resolve routes identically with or without the trailing slash. */
  trailingSlash: true,
  /* Stop `next dev` regenerating AGENTS.md / CLAUDE.md in the repo root. */
  agentRules: false,
  ...devOnlyRewrites,
};

export default nextConfig;

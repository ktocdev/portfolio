import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Static export — the whole site is prerendered to HTML at build time.
     No server runtime, so it drops straight onto Cloudflare as static assets. */
  output: 'export',
  /* next/image's optimizer needs a server; unoptimized serves the files as-is. */
  images: { unoptimized: true },
  /* Emit /projects/index.html rather than /projects.html so static hosts
     resolve routes identically with or without the trailing slash. */
  trailingSlash: true,
};

export default nextConfig;

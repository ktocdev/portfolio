import type { Metadata } from 'next';
import Link from 'next/link';

import SiteShell from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'Page not found',
};

/* Replaces Next's default 404, which ignores the theme tokens and offers no
   way back. Next renders it straight into the root layout, outside the (site)
   group, so it brings SiteShell itself to keep the header and footer.
   Styles live in globals.css, not a CSS module — see the "Not found" section
   there for why. */
export default function NotFound() {
  return (
    <SiteShell>
      <section className="notFoundPage">
        <p className="notFoundEyebrow">404</p>
        <h1 className="notFoundHeading">Page not found.</h1>
        <p className="notFoundBody">
          That address doesn&apos;t exist here, or it moved. Try the navigation above, or head
          back to the start.
        </p>
        <Link href="/" className="notFoundLink">
          Go to the home page <span aria-hidden="true">→</span>
        </Link>
      </section>
    </SiteShell>
  );
}

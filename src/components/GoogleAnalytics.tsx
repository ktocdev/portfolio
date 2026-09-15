import Script from 'next/script';

import { SITE } from '@/content/site';

/**
 * Loads the GA4 gtag.js tag. Renders nothing until `SITE.gaId` is set, so local
 * dev and preview builds stay untracked unless you opt in.
 *
 * Two scripts by design: the first fetches the library from Google, the second
 * configures it. `afterInteractive` on both lets the page paint first —
 * analytics should never block first render.
 *
 * Client-side route changes need no extra code: GA4's enhanced measurement
 * counts page views from browser history events, which is how the App Router
 * navigates. (Property → Data Streams → Enhanced measurement, on by default.)
 */
export default function GoogleAnalytics() {
  if (!SITE.gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${SITE.gaId}');`}
      </Script>
    </>
  );
}

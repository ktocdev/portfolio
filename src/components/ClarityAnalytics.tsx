import Script from 'next/script';

import { SITE } from '@/content/site';

/**
 * Loads the Microsoft Clarity tag. Renders nothing until `SITE.clarityId` is
 * set, so local dev and preview builds stay untracked unless you opt in.
 *
 * `afterInteractive` lets the page paint first, then loads the tag — analytics
 * should never block first render.
 */
export default function ClarityAnalytics() {
  if (!SITE.clarityId) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${SITE.clarityId}");`}
    </Script>
  );
}

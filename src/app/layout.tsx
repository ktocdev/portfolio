import type { Metadata, Viewport } from 'next';
import { Young_Serif, Atkinson_Hyperlegible_Next, Atkinson_Hyperlegible_Mono } from 'next/font/google';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CookieConsent from '@/components/CookieConsent';
import { IMAGES, SITE } from '@/content/site';

import './globals.css';
import styles from './layout.module.css';

/* Fonts are downloaded and self-hosted at build time — no runtime request to
   Google, and no flash of fallback text. */
const display = Young_Serif({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-young-serif',
});

/* The build warns "Failed to find font override values" for both Atkinson
   faces: next/font has no metrics table for them, so it skips the synthetic
   size-matched fallback. Harmless — the plain fallback stack in globals.css
   applies — and there is no option that silences it. */
const body = Atkinson_Hyperlegible_Next({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-atkinson',
});

const mono = Atkinson_Hyperlegible_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-atkinson-mono',
});

const DESCRIPTION =
  'Senior software engineer and design-systems architect in Chicago. Eleven years at Discovery Education across three generations of a component library.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    /* Kept under ~60 characters so search results don't truncate it; the
       full specialties list lives in the share card title below. */
    default: `${SITE.name} - ${SITE.role}`,
    template: `%s - ${SITE.name}`,
  },
  description: DESCRIPTION,
  openGraph: {
    title: `${SITE.name} - ${SITE.role} / ${SITE.specialties.join(' / ')}`,
    description: DESCRIPTION,
    url: SITE.url,
    siteName: SITE.name,
    type: 'website',
    /* Resolved against metadataBase. */
    images: [
      {
        url: IMAGES.share.src,
        width: IMAGES.share.width,
        height: IMAGES.share.height,
        alt: IMAGES.share.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/favicon-180.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F6FB' },
    { media: '(prefers-color-scheme: dark)', color: '#151824' },
  ],
};

/**
 * Applies the stored theme before first paint. Without this the page renders
 * in the system scheme and then snaps to the saved one. Deliberately tiny and
 * synchronous; `system` intentionally writes nothing so the CSS media query
 * stays in charge.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('portfolio-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className={styles.root}>
          <a href="#main" className={styles.skipLink}>
            Skip to content
          </a>
          <SiteHeader />
          {/* tabIndex makes the skip link actually move focus, not just scroll. */}
          <main id="main" tabIndex={-1} className={styles.main}>
            {children}
          </main>
          <SiteFooter />
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}

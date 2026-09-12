import type { Metadata, Viewport } from 'next';
import { Young_Serif, Atkinson_Hyperlegible_Next, Atkinson_Hyperlegible_Mono } from 'next/font/google';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE } from '@/content/site';

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s — ${SITE.name}`,
  },
  description:
    'Senior software engineer and design-systems architect in Chicago. Eleven years at Discovery Education across three generations of a component library.',
  openGraph: {
    title: `${SITE.name} — ${SITE.role}`,
    description:
      'Senior software engineer and design-systems architect in Chicago. Eleven years at Discovery Education across three generations of a component library.',
    url: SITE.url,
    siteName: SITE.name,
    type: 'website',
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
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className={styles.root}>
          <a href="#main" className={styles.skipLink}>
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className={styles.main}>
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

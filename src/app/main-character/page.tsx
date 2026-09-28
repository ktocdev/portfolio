import type { Metadata, Viewport } from 'next';
import { Old_Standard_TT } from 'next/font/google';
import localFont from 'next/font/local';

import MainCharacterSplash from '@/components/MainCharacterSplash';
import { MC_SPLASH } from '@/content/mainCharacter';
import { IMAGES, SITE } from '@/content/site';

/* The Main Character app's own faces, self-hosted like the site's: the CSP
   allows fonts from 'self' only. */
const oldStandard = Old_Standard_TT({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-old-standard',
});

const cmuSans = localFont({
  src: '../../fonts/cmu-sans-demicondensed.ttf',
  display: 'swap',
  variable: '--font-cmu-sans',
});

const URL_PATH = '/main-character/';

export const metadata: Metadata = {
  title: { absolute: MC_SPLASH.meta.title },
  description: MC_SPLASH.meta.description,
  alternates: { canonical: URL_PATH },
  openGraph: {
    title: MC_SPLASH.meta.title,
    description: MC_SPLASH.meta.description,
    url: URL_PATH,
    siteName: SITE.name,
    type: 'website',
    images: [
      {
        url: IMAGES.share.src,
        width: IMAGES.share.width,
        height: IMAGES.share.height,
        alt: IMAGES.share.alt,
      },
    ],
  },
  icons: {
    icon: [
      { url: '/main-character/mc-circle.svg', type: 'image/svg+xml' },
      { url: '/main-character/mc-circle-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/main-character/mc-circle-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/main-character/mc-circle-180.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#100d0b',
};

/* Without script the intro never runs, so show its end state: the card up,
   the full title text in place of the typed copy, and no skip button. */
const noscriptStyle = `[data-mc-card]{opacity:1;transform:none;visibility:visible}[data-mc-full]{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto;white-space:normal}[data-mc-typed],[data-mc-skip]{display:none}`;

/**
 * The Main Character landing page. Sits outside the (site) route group, so
 * it renders full-bleed without the portfolio header and footer. The demo
 * it links to is the static app in public/main-character/demo/.
 */
export default function MainCharacterPage() {
  return (
    <div className={`${oldStandard.variable} ${cmuSans.variable}`}>
      <noscript dangerouslySetInnerHTML={{ __html: `<style>${noscriptStyle}</style>` }} />
      <MainCharacterSplash />
    </div>
  );
}

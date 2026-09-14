import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/* Next's shared config bundles react-hooks and jsx-a11y, so `npm run lint`
   catches invalid ARIA, missing alt text, and hook misuse before a deploy. */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'node_modules/**', 'design_handoff_portfolio/**']),
  {
    rules: {
      /* Static export runs with images.unoptimized, so next/image adds nothing
         over a plain <img> for the carousel stills. */
      '@next/next/no-img-element': 'off',
    },
  },
]);

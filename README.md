# Katie O'Connor — Portfolio

Personal portfolio site with five pages (Home, Projects, Resume, Contact,
About) plus a Cookie settings page, built from a design handoff. The handoff
bundle lives locally in `design_handoff_portfolio/`, which is git-ignored and
not part of the repo.

**Live:** [ktoc.dev](https://ktoc.dev)

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript, React 19 |
| Styling | Plain CSS: custom properties for tokens, CSS Modules per component |
| Fonts | Young Serif, Atkinson Hyperlegible Next / Mono, self-hosted via `next/font` |
| Output | Static export (`output: 'export'`), no server runtime |
| Host | Cloudflare Workers Assets |

There is no CSS framework or component library. The design is a bespoke token
system, and reproducing it directly in CSS is both smaller and closer to the
handoff than fighting a utility framework's defaults.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm run typecheck
npm run lint
npm run preview    # build, then serve ./out through wrangler dev
```

`npm run preview` reproduces Cloudflare's real asset behaviour (trailing
slashes, the 404 page, `_headers`). It needs wrangler's native `workerd`
binary, whose install script this project does not auto-approve:

```bash
npm approve-scripts workerd esbuild   # one time
```

For a quick look without that, `npm run build && npx serve out` is enough.

## The resume PDF

`public/Katie-OConnor-Resume.pdf` is printed from `/resume`, which carries the
`@media print` rules that strip the site chrome. Regenerate it after any change
to `src/content/resume.ts`:

```bash
npm run pdf                      # build, print, overwrite the PDF in public/
npm run pdf -- --out draft.pdf   # write elsewhere instead
```

The script drives the Chrome or Edge already installed (set `PDF_BROWSER` to
pick one) over a throwaway static server, so there is no extra dependency and
no browser download.

The phone number is the one field that is not in the repo. It lives in
`.env.print.local` (git-ignored) as `RESUME_PHONE`, and only `npm run pdf`,
`npm run dev:print` and `npm run build:print` load it, since Next does not
auto-load that filename. The number reaches the PDF, while a plain
`npm run build` leaves it out of the deployed HTML entirely rather than hiding
it with CSS. As a backstop, `npm run deploy` runs `scripts/check-no-phone.mjs`
over the export and refuses to upload if a phone number shows up there.

## Structure

```
src/
  app/
    layout.tsx           shell: fonts, metadata, skip link, no-flash theme script
    globals.css          the token layer: colour, type, spacing, motion
    page.tsx             Home
    projects/            Projects
    resume/              Resume (the full document; also the print source for the PDF)
    contact/             Contact
    about/               About
    cookies/             Cookie settings (analytics consent)
    not-found.tsx        themed 404
    robots.ts            /robots.txt
    sitemap.ts           /sitemap.xml
  components/
    SiteHeader           wordmark + primary nav with a sliding current-page indicator
    PageTransition       page container: exit fade, page loader, zone-by-zone rise
    SiteFooter           copyright, cookies link, email, theme control
    ThemeToggle          three-state Auto / Light / Dark, persisted
    ButtonLink           the site's one filled button (internal link or download)
    Figure               the site's one imagery treatment (4 variants)
    ProjectsBrowser      project selector + detail panel
    Carousel             stepping media carousel
    FactsGrid            case-study facts + measured filler
    CookieConsent        consent banner; mounts the analytics tags once accepted
    CookieSettings       the On / Off control on the cookies page
    ClarityAnalytics     the Microsoft Clarity tag
    GoogleAnalytics      the GA4 tag
  content/
    site.ts              nav, skills, contacts, per-page copy, image alt text, analytics IDs
    projects.ts          project data, case-study notes, slide manifests
    resume.ts            resume: summary, experience, skills, projects, contact
  lib/
    consent.ts           shared consent storage key + change event
    motion.ts            the rise stagger: timings, zone finding, image load gate
    nowrap.tsx           keeps hyphenated names (nebula-nuxt) on one line
public/
  _headers               Cloudflare response headers (CSP etc.)
  media/                 photography
  projects/              carousel media (slug-named)
  main-character/demo/   built Main Character demo (see below)
  Katie-OConnor-Resume.pdf
scripts/
  flatten-segment-files.mjs   post-build fix for a Windows-only Next export bug
  pdf.mjs, print-env.mjs      resume PDF and phone-number env loading
  check-no-phone.mjs          deploy guard
```

All copy lives in `src/content/` as typed constants, never inline in a
template, so text changes never mean touching markup.

The Main Character demo is a self-contained static app built by the
rag-journal repo straight into `public/main-character/demo/`. It has no Next
route. Cloudflare resolves the folder URL to its `index.html`, and
`next.config.ts` adds a dev-only rewrite so `next dev` does the same.

## Design tokens

`src/app/globals.css` is the single source of styling truth. It implements the
handoff's token table (`theme-tokens.md`, local only) as CSS custom properties
on `:root`, with the dark scheme declared twice: once under
`prefers-color-scheme: dark` (for the Auto setting) and once under
`[data-theme="dark"]` (for the explicit choice).

Type sizes are all `clamp()` values keyed to **both** viewport width and
height, because each page is designed to fit `100dvh`. Substituting fixed
pixel sizes will break the one-viewport layout.

### Theming

There are three states, `system` (default), `light` and `dark`, persisted to
`localStorage` under `portfolio-theme`. `system` removes the `data-theme`
attribute entirely so the media query governs again.

A small synchronous script in `layout.tsx` applies the saved theme before
first paint. Without it the page renders in the system scheme and then snaps.

## Motion

Motion uses imperative WAAPI (`Element.animate`), since the content it moves
is freshly mounted each time.

- **Page change:** clicking an internal link fades the page out (150ms)
  before the route commits. The new page's section then rises zone by zone
  (`opacity 0 → 1`, `translateY(10px) → 0`, 380ms each, 55ms apart, delay
  capped at the 8th zone). Back/forward skip the fade. The commit also fires
  on a timeout in case `onfinish` never does, and a second click cancels an
  exit in flight.
- **Zones** are the section's direct children, or one level down when there
  are fewer than three. The descent never enters anything holding an `img`,
  so a figure (photo, crop, overlay) always moves as one unit. Home's source
  order stays text-then-figure because that is the reveal order.
- **Image gate:** a zone whose image hasn't loaded is held at opacity 0 and
  rises on `load` (or `error`, so a broken image still ends up visible). This
  is invisible on a warm cache, so test with the network throttled.
- **Project switch** re-runs the rise on the detail column only, faster
  (320ms / 45ms). It skips first mount, which the page rise already covers.
- **Nav:** the current item is marked by one indicator that slides between
  links. Hover uses each link's own bottom border.

All of it is skipped under `prefers-reduced-motion: reduce`.

## Loading states

Both loaders mount invisible and fade in only after a 400ms grace period (a
CSS animation delay on `[data-loader]` in `globals.css`), so fast loads never
flash them. Under reduced motion they still appear, but without animation.

- **Page loader** (`PageTransition`): three stepped accent squares and a
  "Loading" label covering `<main>` until fonts and the page's visible images
  are in.
  - On first load it skips the grace period and is up from first paint. It is
    server-rendered, and a small inline script in `layout.tsx` clears it
    without waiting for the app bundle. A `<noscript>` style hides it when
    script is off.
  - On a route change it mounts as soon as the exit fade ends, so it also
    covers the wait for the route's data, which on a slow connection is most
    of the wait. Focus moves to `<main>` once it clears.
  - At 8s it turns into a "Still loading…" message, and at 15s the page is
    revealed regardless. There is deliberately no retry button, because a
    reload restarts a load that may be nearly done.
  - While it is up, `<main>` carries `aria-busy` and the page under it is
    `inert`.
- **Video spinner** (`Carousel`): "Buffering video" over the current slide
  while its video has no metadata yet or stalls mid-play (`waiting`).
  `loadedmetadata` counts as ready, because Safari loads nothing further
  under `preload="metadata"` until play is pressed. It uses
  `pointer-events: none`, so the native controls stay usable.

## Accessibility

Accessibility is part of the spec, not an afterthought:

- Skip link as the first focusable element; one `<h1>` per page
- Landmarks: `header` / `nav[aria-label="Primary"]` / `main#main` / `footer`
- `aria-current="page"` on the active nav item
- Project list is a vertical `tablist` with roving tabindex and arrow-key
  selection; the detail panel is its `tabpanel`, named by the selected tab
- Theme control is a `radiogroup` with roving tabindex; the consent control
  uses native radios inside a `fieldset`
- Carousel step changes are announced through a `role="status"` counter
- 44×44px minimum hit targets, except the documented compact footer toggle
- Every transition sits inside a `prefers-reduced-motion: no-preference` guard
- Descriptive `alt` on all photography and carousel media

## Analytics and consent

Microsoft Clarity and Google Analytics 4 are the only third-party scripts.
Their IDs live in `SITE.clarityId` and `SITE.gaId`. Each tag renders nothing
when its ID is empty, and with both empty the consent banner doesn't render
either. The tags mount only after the visitor accepts, so no analytics cookies
are set before consent. The choice is stored in `localStorage` under
`portfolio-consent` and can be changed on `/cookies`.

## Response headers

`public/_headers` is copied into `out/` and applied by Cloudflare Workers
Assets. It sets a Content-Security-Policy allowing only the site itself,
Clarity and Google Analytics, plus `nosniff`, `X-Frame-Options`,
`Referrer-Policy` and a `Permissions-Policy`. Adding an analytics tool means
adding its origins to the CSP too. `next dev` ignores this file, so verify
with `npm run preview` or in production.

## Deploy

`npm run build` emits a complete static site into `out/`, so any static host
works. Cloudflare config lives in [`wrangler.jsonc`](wrangler.jsonc): an
assets-only Worker serving `./out`, with no `main` script because there is
nothing to run.

From the CLI:

```bash
npm run deploy     # build, phone-number check, then wrangler deploy
```

For the dashboard's Git integration, override the framework preset:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Node version | from `.node-version` (24) |

> [!IMPORTANT]
> Do **not** accept Cloudflare's default Next.js preset, which sets the build
> command to `npx opennextjs-cloudflare build`. OpenNext exists to run
> *server-side* Next.js on Workers and expects `output: 'standalone'`. Against
> this static export it fails with:
>
> ```
> ENOENT: no such file or directory,
> open '.next/standalone/.next/server/pages-manifest.json'
> ```
>
> There is no server build here to find. Use the plain commands above.

`ktoc.dev` is already on Cloudflare, so pointing it at the Worker in the
dashboard creates the DNS records for you.

No `basePath` is configured because the site is served from the domain root.
Deploying to a subpath would require setting `basePath` in `next.config.ts`.

## Notes on the handoff

There are two deliberate departures from `design_handoff_portfolio/`, both
documented at the point of change:

1. **Carousel slide mapping.** The prototype's `slideVideos` / `slideImages`
   maps had indices 3–6 scrambled for Main Character, pairing (for example)
   the "History" label with the Categories recording. The numbered filenames
   make the intended order unambiguous, so slides are now defined as a single
   ordered list where each entry carries its own label and media.

2. **Dark-mode image blend.** The handoff text suggests `screen` for dark, but
   the prototype's `forDark()` only remapped `multiply`, and its actual blend
   was `luminosity`, which passed through unchanged. `screen` over the dark
   surface blows the photographs out to a flat wash, so both schemes use
   `luminosity` and dark differs only in opacity.

Hash routing was a prototype constraint and is replaced by real routes, as the
handoff directs.

# Katie O'Connor — Portfolio

Personal portfolio site. Five pages — Home, Projects, Resume, Contact, About —
plus a Cookie settings page, built from a design handoff. The handoff bundle
lives locally in `design_handoff_portfolio/`, which is git-ignored and not
part of the repo.

**Live:** [ktoc.dev](https://ktoc.dev)

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript, React 19 |
| Styling | Plain CSS — custom properties for tokens, CSS Modules per component |
| Fonts | Young Serif, Atkinson Hyperlegible Next / Mono, self-hosted via `next/font` |
| Output | Static export (`output: 'export'`) — no server runtime |
| Host | Cloudflare |

No CSS framework and no component library: the design is a bespoke token
system, and reproducing it directly in CSS is both smaller and closer to the
handoff than fighting a utility framework's defaults.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm run typecheck
```

To preview the built output exactly as it deploys:

```bash
npm run build && npx serve out
```

## Structure

```
src/
  app/
    layout.tsx           shell: fonts, metadata, skip link, no-flash theme script
    globals.css          the token layer — colour, type, spacing, motion
    page.tsx             Home
    projects/            Projects
    resume/              Resume
    contact/             Contact
    about/               About
    cookies/             Cookie settings (analytics consent)
    not-found.tsx        themed 404
    robots.ts            /robots.txt
    sitemap.ts           /sitemap.xml
  components/
    SiteHeader           wordmark + primary nav
    SiteFooter           copyright, cookies link, email, theme control
    ThemeToggle          three-state Auto / Light / Dark, persisted
    Figure               the site's one imagery treatment (4 variants)
    ProjectsBrowser      project selector + detail panel
    Carousel             stepping media carousel
    FactsGrid            case-study facts + measured filler
    CookieConsent        consent banner; mounts the Clarity tag once accepted
    CookieSettings       the On / Off control on the cookies page
    ClarityAnalytics     the Microsoft Clarity tag itself
  content/
    site.ts              nav, skills, contacts, per-page copy, image alt text, Clarity ID
    projects.ts          project data, case-study notes, slide manifests
    resume.ts            experience entries
  lib/
    consent.ts           shared consent storage key + change event
public/
  _headers               Cloudflare response headers (CSP etc.)
  media/                 photography
  projects/              carousel media (slug-named)
  Katie-OConnor-Resume.pdf
```

All copy lives in `src/content/` as typed constants, never inline in a
template — so text changes never mean touching markup.

## Design tokens

`src/app/globals.css` is the single source of styling truth. It implements the
handoff's token table (`theme-tokens.md`, local only) as CSS custom properties
on `:root`, with the dark scheme declared twice: once
under `prefers-color-scheme: dark` (for the Auto setting) and once under
`[data-theme="dark"]` (for the explicit choice).

Type sizes are all `clamp()` values keyed to **both** viewport width and
height, because each page is designed to fit `100dvh`. Substituting fixed
pixel sizes will break the one-viewport layout.

### Theming

Three states — `system` (default), `light`, `dark` — persisted to
`localStorage` under `portfolio-theme`. `system` removes the `data-theme`
attribute entirely so the media query governs again.

A small synchronous script in `layout.tsx` applies the saved theme before
first paint; without it the page renders in the system scheme and then snaps.

## Accessibility

Part of the spec, not an afterthought:

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

Microsoft Clarity is the only third-party script. Its project ID lives in
`SITE.clarityId`; leave it empty and neither the tag nor the consent banner
renders. The tag mounts only after the visitor accepts, so no analytics
cookies are set before consent. The choice is stored in `localStorage` under
`portfolio-consent` and can be changed on `/cookies`.

## Response headers

`public/_headers` is copied into `out/` and applied by Cloudflare Workers
Assets: a Content-Security-Policy allowing only the site itself and Clarity,
plus `nosniff`, `X-Frame-Options`, `Referrer-Policy`, and a
`Permissions-Policy`. `next dev` ignores this file — verify with
`npm run preview` or in production.

## Deploy

`npm run build` emits a complete static site into `out/` — no server runtime,
so any static host works.

Cloudflare config lives in [`wrangler.jsonc`](wrangler.jsonc): an assets-only
Worker serving `./out`, with no `main` script because there is nothing to run.

From the CLI:

```bash
npm run deploy     # builds, then wrangler deploy
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

Point `ktoc.dev` at the Worker in the dashboard — since the domain is already
on Cloudflare, DNS records are created for you.

No `basePath` is configured because the site is served from the domain root.
Deploying to a subpath would require setting `basePath` in `next.config.ts`.

### Local preview

`npm run preview` runs `wrangler dev`, which reproduces Cloudflare's real
asset behaviour (trailing slashes, the 404 page). It needs wrangler's native
`workerd` binary, whose install script this project does not auto-approve:

```bash
npm approve-scripts workerd esbuild   # one time
```

For a quick look without that, `npx serve out` is enough.

## Notes on the handoff

Two deliberate departures from `design_handoff_portfolio/`, both documented at
the point of change:

1. **Carousel slide mapping.** The prototype's `slideVideos` / `slideImages`
   maps had indices 3–6 scrambled for Main Character, pairing (for example)
   the "History" label with the Categories recording. The numbered filenames
   make the intended order unambiguous, so slides are now defined as a single
   ordered list where each entry carries its own label and media.

2. **Dark-mode image blend.** The handoff text suggests `screen` for dark, but
   the prototype's `forDark()` only remapped `multiply`, and its actual blend
   was `luminosity` — which passed through unchanged. `screen` over the dark
   surface blows the photographs out to a flat wash, so both schemes use
   `luminosity` and dark differs only in opacity.

Hash routing was a prototype constraint and is replaced by real routes, as the
handoff directs.

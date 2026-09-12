# Handoff: Katie O'Connor — Portfolio Site

## Overview
A five-page personal portfolio for a senior software engineer / design-systems architect: **Home, Projects, Resume, Contact, About**. Single-page app, hash-routed, one viewport tall per page (no scrolling at desktop sizes by design). Light/dark theming with an Auto/Light/Dark control in the footer. Content is real and final — not lorem.

Goal of the site: get a hiring manager from the hero statement to the case study or a GitHub link in as few moves as possible, in a quiet editorial voice (serif display + hyperlegible body/mono) rather than a typical dev-portfolio look.

## About the design files
The files in this bundle are **design references created in HTML** — a working prototype of the intended look, copy, and behavior. They are **not production code to copy directly**. `Katie Portfolio.dc.html` is authored in a proprietary streaming-template runtime (`support.js`, `<x-dc>`, `<sc-for>`, `<sc-if>`, `{{ holes }}`) that has no place in a real codebase.

**The task is to recreate this design in the target codebase's own environment**, using its established patterns and libraries. If there is no codebase yet: given Katie's stack, build it as a **Nuxt 4 (Vue 3 + TypeScript) static site** — that is the natural target and the one the content itself advertises. Astro or plain Vite + Vue are fine alternatives. Deploy target is a static host (GitHub Pages / Netlify).

Read the prototype in two parts:
- **Template** (markup between `<x-dc>` and `</x-dc>`) — the DOM structure and every inline style. Inline `style="…"` values are literal CSS; `style-hover`/`style-focus` are `:hover`/`:focus-visible` blocks.
- **Logic** (the `<script type="text/x-dc">` block at the bottom) — the `PROJECTS` constant plus `renderVals()`, which holds **all site content**: skills table, project data, resume experience bullets, contact rows. Treat those arrays as the content source of truth; port them into typed data files (e.g. `content/projects.ts`, `content/resume.ts`) rather than hardcoding copy in templates.

To view the prototype: serve the folder over HTTP (`npx serve .`) and open `Katie Portfolio.dc.html`. Requires network access for Google Fonts. `Theme Specimen.dc.html` is a token/specimen page for the same system.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, layout, interaction, and copy. Recreate pixel-for-pixel using the codebase's own component and styling conventions. Every value needed is in `theme-tokens.md` (the authoritative token table) and in the inline styles of the prototype.

One deliberate exception, which is *not* finished design:
1. **Resume "Download PDF"** points at `#`. Wire it to `uploads/Katie_OConnor_Resume.pdf` (included).

Note on the photography: in the prototype the Home hero, Contact hero, and About headshot are drop slots (`<image-slot>`), so their sources are not in the prototype markup. The real images are exported into `media/` in this bundle — implement them as plain `<img>` with the documented filter/blend treatment.

---

## Design tokens

`theme-tokens.md` in this folder is the full table (color light + dark, type scale, spacing, radius, borders, motion, layout, imagery treatment, z-index). Implement as CSS custom properties on `:root` and `html[data-theme="dark"]`, exactly as the prototype does. Summary of the parts you will touch constantly:

**Color — light:** bg `#F7F6FB` · surface `#EFEDF7` · surface-strong `#D9D6EE` · text `#1F2333` · muted `#555B70` · text-faint `#9A9FB2` · accent `#3E43B8` · accent-hover `#2F3396` · accent-selected `#C9C6F2` · hero-em `#686BAA` · border `#CDCBDD` · border-subtle `#E3E1EE` · media-bg `#1F2333`

**Color — dark:** bg `#151824` · surface `#1D2030` · surface-strong `#2A2D45` · text `#E8E7F2` · muted `#A7A9C0` · text-faint `#7C819A` · accent `#A5A8F5` · accent-hover `#C0C2FA` · accent-selected `#3A3F7A` · hero-em `#A5A8F5` · border `#363A52` · border-subtle `#262A3E` · media-bg `#0F111A`

Image overlay gradients: light `rgba(62,67,184,.22)` tint / `rgba(31,35,51,.18)` shade; dark `rgba(165,168,245,.20)` / `rgba(0,0,0,.30)`. Each gradient fades to the same color at `alpha 0`.

**Type** (Google Fonts, all free):
- Display — **Young Serif** 400, fallback `Georgia, serif`. Headings, project names, fact values, wordmark. `letter-spacing: -.012em` (display) / `-.01em` (h1).
- Body — **Atkinson Hyperlegible Next** 400/500/700, fallback `Atkinson Hyperlegible, system-ui, sans-serif`. `line-height: 1.5`.
- Mono — **Atkinson Hyperlegible Mono** 400/500, fallback `ui-monospace, monospace`. Nav, labels, meta, captions, buttons-with-arrows. Uppercase labels get `letter-spacing: .06em`.

Every size is a `clamp()` — see the type scale in `theme-tokens.md`. Do not substitute fixed px; the whole layout depends on viewport-*and*-height-aware scaling so each page fits `100dvh`. Key ones:
- `type.display` `clamp(2.5rem, 1.6vw + 2.4vh + .9rem, 5.25rem)` — Home H1, Contact H1
- `type.h1` `clamp(2rem, 1.2vw + 1.8vh + .8rem, 3.75rem)` — section H1s
- `type.lead` `clamp(1.0625rem, .82rem + .42vw + .2vh, 1.375rem)` — intro paragraphs
- `type.h3` `clamp(1.0625rem, .9rem + .4vw, 1.375rem)` — list titles, roles, project names
- `type.mono.sm` `clamp(.75rem, .68rem + .22vw, .875rem)` — labels, footer, years

**Spacing:** 4px base (4/8/12/16/24/32/48/64) plus fluid layout tokens — page padding `clamp(1.25rem,2.4vw,3rem)` vertical / `clamp(1.25rem,3.4vw,4.5rem)` horizontal; column gap `clamp(1.5rem,3.5vw,5rem)`; section gap `clamp(1rem,2.4vh,2.25rem)`; row padding `clamp(.7rem,1.6vh,1.1rem)`.

**Radius:** 0 rules/rows · 2px buttons, badges, focus ring · 4px image panels and carousel. No `border-radius: 9999px` anywhere.

**Elevation:** none. Flat system — **no drop shadows at all**. Depth comes only from surface fills and blended imagery.

**Motion:** 150ms `cubic-bezier(.2,.6,.2,1)` on `a, button` for color/background/border/text-decoration-color. 250ms same easing with 60ms delay for tooltips (opacity + 6px rise). Everything sits inside `@media (prefers-reduced-motion: no-preference)`.

**Focus:** `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px }`. `::selection` uses `--selection`. Skip link is the first DOM node: mono, inverse colors, `transform: translateY(-300%)` until focused, then `transform: none`.

---

## Shell (present on every page)

Root: `min-height: 100dvh`, `display: grid`, `grid-template-rows: auto minmax(min-content, 1fr) auto` (header / main / footer), page padding as above, `gap` = section gap, `overflow: auto` as the small-viewport escape hatch.

**Header** — flex row, `justify-content: space-between`, `align-items: baseline`, wraps, gap `.75rem 2rem`, `padding-bottom: clamp(.75rem,1.4vh,1.25rem)`, `border-bottom: 1px solid var(--border)`.
- Wordmark: "Katie O'Connor", Young Serif, `clamp(1.125rem, 1rem + .5vw, 1.5rem)`, `color: var(--text)`, no underline, links to Home.
- Nav: flex, wraps, gap `clamp(1rem,2.2vw,2.5rem)`. Items **HOME · PROJECTS · RESUME · CONTACT · ABOUT**, mono uppercase `clamp(.8125rem,.72rem+.28vw,.9375rem)`, `letter-spacing: .06em`, `color: var(--text)`. Every item is always underlined at `1.5px` with `text-underline-offset: .45em`; the underline is `transparent` except on the active page, where `text-decoration-color: var(--accent)`. Hover: text and underline both `var(--accent)`. Active item carries `aria-current="page"`. `<nav aria-label="Primary">`.

**Footer** — flex row, space-between, wraps, gap `.5rem 2rem`, `padding-top: clamp(.75rem,1.4vh,1.25rem)`, `border-top: 1px solid var(--border)`, mono `clamp(.75rem,.68rem+.22vw,.875rem)`, `letter-spacing: .04em`, `color: var(--muted)`.
- Left: `© 2026 Katie O'Connor`
- Right: email link (`katie.oconnor13@gmail.com`, `color: var(--muted)`) then the theme control.
- **Theme control:** `role="group" aria-label="Color scheme"`, three segments in a 1px-gap row over `background: var(--border)` with a `1px solid var(--border)` frame and `2px` outer radius (so the gaps read as hairline dividers). Segments: text "Auto", a sun glyph, a moon glyph. Each `.25rem .6rem` padding, `min-height: 1.8rem` (a deliberate compact exception to the 44px target — it is a low-frequency preference control), mono `.7rem` uppercase. Selected: `background: var(--accent-selected)`, `color: var(--text)`; unselected `background: var(--bg)`, `color: var(--muted)`, hover `var(--accent)`. Each has `aria-pressed` and an `aria-label` ("Follow system setting" / "Light mode" / "Dark mode"), plus a hover/focus-within tooltip repeating that label: absolutely positioned `bottom: calc(100% + 8px)`, centered, `background: var(--surface-strong)`, `1px solid var(--border)`, `2px` radius, mono `.6875rem`, `white-space: nowrap`, with a rotated 8px square as the arrow; fades in over 250ms with a 6px rise after 60ms. The sun/moon icons are 1.5px-stroke line icons (sun ~17px, moon ~15px) using `currentColor`.

---

## Screens

### 1. Home (`#/home`, default route)
**Purpose:** state who she is and what she does; push to Projects.

Two columns: `repeat(auto-fit, minmax(min(100%, 27rem), 1fr))`, column gap `clamp(1.5rem,3.5vw,5rem)`. Left column is a flex column with `justify-content: space-between` so the skills table pins to the bottom of the viewport.

Left, top to bottom:
1. Mono eyebrow stack, `letter-spacing: .04em`, gap `.45rem`:
   - `Senior Software Engineer` — `clamp(.875rem,.76rem+.32vw,1.0625rem)`, `var(--text)`
   - Specialty list (`<ul aria-label="Specialties">`, flex, gap `.35rem 1.25rem`, `var(--muted)`, `clamp(.8125rem,.72rem+.28vw,.9375rem)`): `Design Engineer / Full-Stack Engineer / Design System Architect`, with `/` separators colored `var(--border)` and `aria-hidden`.
2. **H1** (`type.display`, Young Serif 400, `line-height: 1.04`, `text-wrap: balance`): *"Systems that work end to end, designed with love."* — "with love" is an `<em>`: italic, `color: var(--hero-em)`, preceded by a non-breaking space.
3. Lead paragraph, `max-width: 34ch`, `type.lead`: *"I architect design systems and build AI-native applications. Eleven years at Discovery Education, across three generations of a component library serving products that reach 45M students in 100 countries, most recently as architect and technical lead of nebula-nuxt."*
4. Mono accent link: `See selected projects →` (nbsp before the arrow), `clamp(.875rem,.78rem+.3vw,1rem)`, `letter-spacing: .04em`, → Projects.
5. **Skills table** — a `<dl aria-label="Technical skills">`, `grid-template-columns: max-content 1fr`, column gap `clamp(1rem,2vw,2rem)`, `row-gap: 0`, `border-top: 1px solid var(--border)`, each `dt`/`dd` padded `clamp(.45rem,1vh,.75rem) 0` with `border-bottom: 1px solid var(--border-subtle)`. `dt` = mono uppercase `type.mono.sm` muted; `dd` = `clamp(.9375rem,.8rem+.3vw,1.125rem)` text, `text-wrap: pretty`. Four rows: **AI engineering**, **Front-end**, **Back-end**, **Other** (exact contents in the `skills` array in the logic block).

Right: `<figure>`, `min-height: min(46vh, 22rem)`, `background: var(--surface-strong)`, `4px` radius, `overflow: hidden`, `isolation: isolate`. Image absolutely fills it with `filter: grayscale(1) contrast(1.08) brightness(1.04)` and `mix-blend-mode: luminosity` (light) → `screen`/`luminosity` in dark; on top, an `aria-hidden` overlay `linear-gradient(165deg, tint 0%, tint-0 55%), linear-gradient(15deg, shade 0%, shade-0 45%)` with `mix-blend-mode: soft-light`. Subject: botanical/painterly, low detail, soft focus.

### 2. Projects (`#/projects`)
**Purpose:** browse three projects; read the case study; reach GitHub/live links.

Two columns, same `auto-fit` rule but `minmax(min(100%, 22rem), 1fr)`, `grid-auto-rows: min-content`, `align-content: start`.

**Left — selector.** H1 "Projects" (`type.h1`). Intro, `max-width: 36ch`, muted `clamp(.9375rem,.8rem+.3vw,1.125rem)`: *"Personal work on GitHub plus one design-system case study. Select a project for screens, notes, and links."* Then `<ol aria-label="Project list">`, `border-top: 1px solid var(--border)`, each row `border-bottom: 1px solid var(--border-subtle)`.

Each row is a full-width `<button>` (reset appearance/background/border, `font: inherit`, `cursor: pointer`) laid out `grid-template-columns: 2.5rem 1fr`, `align-items: baseline`, padding `clamp(.6rem,1.3vh,1rem) .25rem` with `padding-left: .85rem`, and a `border-left: 2px solid` that is `transparent` normally and `var(--accent)` when selected; selected row also gets `background: var(--surface)`. Hover: `color: var(--accent)`. Carries `aria-pressed`.
- Left cell: zero-padded index (`01`, `02`, `03`), mono `type.mono.sm`, muted.
- Right cell: project name in Young Serif `type.h3`; below it the tagline at `clamp(.875rem,.78rem+.25vw,1rem)` muted. The case-study project appends the word `Case Study` at `margin-left: .6em` in `var(--text-faint)` — decorative only, never the sole signal.

Rows, in order:
1. **Discovery Education Design Systems** — "Comet · Nebula · nebula-nuxt" — case study
2. **Main Character** — "AI personal knowledge & retrieval system"
3. **GPS3** — "Guinea Pig Simulator 3"

**Right — detail panel.** `<article aria-live="polite">`, flex column, gap `clamp(.9rem,2vh,1.5rem)`. Sections, in order, each rendered only when the selected project has that data:

- **Media carousel** (projects 2 and 3 only). Stage: `height: clamp(14rem, 40vh, 28rem)`, `background: var(--media-bg)`, `4px` radius, `overflow: hidden`, `isolation: isolate`. All slides are mounted absolutely inset-0 and toggled with `display`; only the active one shows. Video slides: `<video controls muted playsinline preload="metadata">`, `object-fit: contain`, media-bg background. Image slides: `object-fit: contain`.
  Controls row below: space-between, wraps. Left — a `role="group" aria-label="Carousel controls"` pair of `←` / `→` buttons, each `min-width/min-height: 2.75rem` (the 44px target), `display: grid; place-items: center`, `background: var(--bg)`, `1px solid var(--border)`, `2px` radius, mono `1rem`; hover sets border and text to accent; `aria-label` "Previous slide" / "Next slide". Right — the current slide label (mono `.8125rem` muted, ellipsized) and a counter chip `N / total` (mono `.8125rem`, `letter-spacing: .06em`, `.35rem .6rem` padding, `background: var(--bg)`, `1px solid var(--border)`, `2px` radius). Navigation wraps around and **pauses all videos on change**.
  Slide labels — *Main Character:* Write, Search, Entities, History, Categories, Patterns, Dreams, Triage, Settings. *GPS3:* Title, Adoption, Feeding, Poop, Shelter, Interacting, Shopping, Inventory, Tokens, Design Elements. Which of those are video vs. still, and their files, are in the `slideVideos` / `slideImages` maps in the logic block; the media itself is in `uploads/`.
- **Status note** (Main Character only): `padding: .5rem .75rem`, `border-left: 2px solid var(--accent)`, `background: var(--surface)`, mono `clamp(.8125rem,.74rem+.22vw,.9375rem)`, `line-height: 1.45`. Text: *"Work in progress. Full demo journal will be available online soon."*
- **Long-form paragraphs:** flex column, gap `.7rem`, `max-width: 62ch`, `clamp(.9375rem,.8rem+.3vw,1.0625rem)`, `line-height: 1.55`, `text-wrap: pretty`. Exact copy in the `paras` arrays — this is first-person narrative voice and should be ported verbatim.
- **Facts grid** (case study only): `repeat(auto-fit, minmax(min(100%, 11rem), 1fr))` with `gap: 1px` over `background: var(--border)` and a `1px solid var(--border)` frame, `4px` radius, `overflow: hidden` — the 1px gaps become the cell dividers. Each cell: `background: var(--surface)`, padding `clamp(.85rem,1.8vh,1.25rem) 1rem`, gap `.3rem`; value in Young Serif `type.fact` `clamp(1.375rem,1rem+1vw+.5vh,2.25rem)` colored `var(--hero-em)`, label in mono `type.mono.sm` muted. Six facts: **45M** students/4.5M educators in 100 countries · **6** dimensions of UI rigor · **3** generations of the library · **124** components and utilities · **12** consuming product teams · **$3.05** end-to-end cost to ship a component.
  *Detail worth preserving:* the prototype measures the rendered column count with a `ResizeObserver` and, when six facts don't fill the last row, inserts the `media/zinnias-monarch.jpg` figure spanning exactly the leftover columns (`min-height: 7rem`, `object-position: 50% 58%`, same grayscale filter + blend + a `200deg` soft-light tint gradient). Reimplement or simplify — but never leave a ragged empty cell.
- **Case-study notes** (case study only): a single `<ul aria-label="Case study notes">` at `padding-left: 1.1rem`, gap `.45rem`, `max-width: 60ch`, mixing four item types that all hang back to the left margin with `margin-left: -1.1rem; list-style: none` except plain text items:
  - `heading` — mono `.8125rem` uppercase, `letter-spacing: .06em`, `color: var(--accent)`, `margin-top: .4rem` (e.g. "nebula-nuxt", "Nebula Components", "AI Tooling")
  - `subheading` — mono `.75rem`, `letter-spacing: .05em`, `text-transform: capitalize`, muted, `margin-top: .3rem` (e.g. "Proposal Stage", "Doc Site Designer", "Claude Skills")
  - `disclosure` — mono `type.mono.sm` muted (e.g. "Note: nebula-nuxt is internal; not publicly viewable.")
  - `text` — normal bulleted body, optionally followed by an inline mono accent link `Label ↗` (`.875rem`, `letter-spacing: .04em`, `target="_blank" rel="noopener"`) and/or a nested `<ul>` at `padding-left: 1.1rem`, gap `.3rem`.
- **Links row:** flex, wraps, gap `.5rem 1.5rem`, `padding-top: .25rem`; mono accent links `clamp(.875rem,.78rem+.3vw,1rem)`, `letter-spacing: .04em`, label + nbsp + `↗`, `target="_blank" rel="noopener"`. Main Character → GitHub. GPS3 → GitHub, Play, Design System. The case study has none (internal work).

### 3. Resume (`#/resume`)
**Purpose:** full experience detail plus the PDF.

Asymmetric two columns: `minmax(min(100%, 22rem), 1fr) minmax(min(100%, 26rem), 1.4fr)`, `align-content: start`.

Left: H1 "Resume"; summary paragraph `max-width: 36ch` at `clamp(1rem,.82rem+.38vw,1.25rem)`; then the **primary button** — the only filled button in the system: `background: var(--accent)`, `color: var(--bg)`, `min-height: 2.75rem`, padding `.65rem 1.1rem`, `2px` radius, `font-weight: 500`, `clamp(.9375rem,.82rem+.3vw,1.0625rem)`, label `Download PDF` + a mono `↓` glyph, hover `background: var(--accent-hover)`. `download="Katie-OConnor-Resume.pdf"` → `uploads/Katie_OConnor_Resume.pdf`.

Right: `<ol aria-label="Experience">`, `border-top: 1px solid var(--border)`, `align-self: start`. Each entry is a grid `minmax(6.5rem, max-content) 1fr`, gap `.25rem clamp(1rem,2vw,2rem)`, padding `clamp(.7rem,1.6vh,1.1rem) 0`, `border-bottom: 1px solid var(--border-subtle)` (none on the last).
- Year cell: mono `type.mono.sm` muted, `padding-top: .25em`.
- Body cell: role in Young Serif `type.h3` `line-height: 1.2`; org line at `clamp(.875rem,.78rem+.25vw,1rem)` muted; then either a plain note paragraph or **grouped bullet sets** — each group is a mono uppercase accent label (`type.mono.sm`, `letter-spacing: .06em`) over a `<ul>` at `padding-left: 1.1rem`, gap `.4rem`, `clamp(.9375rem,.8rem+.3vw,1.0625rem)`, groups separated by `clamp(.7rem,1.6vh,1.15rem)`.

Entries: **2015 — 2026 Senior Software Engineer, Discovery Education · Chicago, IL** with three bullet groups (Design Systems Architecture & Leadership; AI-Augmented Engineering & Prompt Strategy; Cross-Team Product Engineering & Adaptability) — 5 bullets each, verbatim in the `experience` array. **2008 — 2015 Front-end & Production Roles, Chicago, IL** with a one-line employer list. **2009 BA, Interactive Art and Media, Columbia College Chicago.**

### 4. Contact (`#/contact`)
Two columns, `minmax(min(100%, 27rem), 1fr)`. Left is a flex column with `space-between` so the contact list pins to the bottom, mirroring Home.
- H1 "Say hello." (`type.h1`, `text-wrap: balance`); lead `max-width: 34ch`: *"Based in Chicago. Open to senior and staff roles, design-system architecture, and conversations about AI-augmented engineering."*
- `<ul aria-label="Contact methods">`, `border-top: 1px solid var(--border)`; each row a grid `minmax(5.5rem, max-content) 1fr`, `align-items: baseline`, padding `clamp(.7rem,1.6vh,1.1rem) 0`, `border-bottom: 1px solid var(--border-subtle)`. Label: mono uppercase `type.mono.sm` muted. Value: accent link at `type.contact` `clamp(1rem,.85rem+.4vw,1.3125rem)`, `overflow-wrap: anywhere`. Rows: **Email** `katie.oconnor13@gmail.com` (mailto) · **LinkedIn** `linkedin.com/in/katieoconnor13` · **GitHub** `github.com/ktocdev`.
- Right: second botanical figure, identical treatment to Home but a single `200deg` tint gradient.

### 5. About (`#/about`)
Two columns, `minmax(min(100%, 22rem), 1fr)`, `align-items: start`. **Image first** (left), text right — the only page that leads with the figure.
- Figure: `width: min(100%, 34rem)`, `aspect-ratio: 4 / 5`, `max-height: min(64vh, 40rem)`, `surface-strong` base, `4px` radius. Headshot fills it; overlay is `linear-gradient(180deg, tint-0 60%, tint 100%)` at `mix-blend-mode: multiply` — a soft tint at the bottom edge only. The headshot is *not* grayscaled.
- Right column `max-width: 56ch`: H1 "About"; body at `type.body.lg` `clamp(1rem,.82rem+.38vw+.15vh,1.3125rem)`, `line-height: 1.55` (personal paragraph — Avondale, cats Mitty and Ralphie, guinea pig Betty Boop as the GPS3 muse, karaoke, trivia, plants); a caption line at `type.caption` muted: *"Photos throughout this site are my own."*; then a `<dl>` with `grid-template-columns: max-content 1fr`, gap `.4rem clamp(1rem,2vw,2rem)`, `border-top: 1px solid var(--border)`, `padding-top: .9rem` — **NOW**: "Building AI-native side projects; open to new roles"; **EDUCATION**: "Columbia College Chicago, BA in Interactive Art and Media, 2009".

---

## Interactions & behavior

**Routing.** Hash-based: `#/home`, `#/projects`, `#/resume`, `#/contact`, `#/about`. Unknown or empty hash → Home. The prototype listens on `hashchange` and resets the carousel to slide 0 on every route change. In a Nuxt/Vue rebuild use real paths (`/`, `/projects`, …) with the router instead — hash routing was a prototype constraint, not a design decision.

**Project selection.** Client-side state only; no navigation. Selecting a project sets the accent left rule + surface fill on its row, swaps the entire right panel, and resets the carousel to slide 0. Project 1 (the case study) is selected on load.

**Carousel.** `←`/`→` step with wraparound. Every change pauses all `<video>` elements on the page so a backgrounded video can't keep playing. Videos are `muted` + `playsinline` with native `controls`; nothing autoplays. Counter and label update together.

**Theme.** Three-state: `system` (default) / `light` / `dark`. `system` removes `data-theme` from `<html>` so `prefers-color-scheme` governs; the others set `data-theme="light"|"dark"`. Persisted to `localStorage` under key **`portfolio-theme`**, read on mount (wrapped in try/catch for privacy-mode failures). `color-scheme` is declared in both branches so form controls and scrollbars follow.
> Dark-mode imagery rule: keep `grayscale(1) contrast(1.08)` but switch `mix-blend-mode` from `multiply` to `screen`/`luminosity` so images lift off `surface-strong` instead of sinking into it; cap opacity at 0.85. The prototype does this with a `forDark()` mapping — port the rule, not the helper.

**Hover/focus.** Links and buttons transition color, background, border, and underline color over 150ms. Nav underline appears on hover. Theme-toggle tooltips fade + rise over 250ms after a 60ms delay. Focus-visible ring as specified. All of it inside the reduced-motion guard.

**Responsive.** Every multi-column grid uses `minmax(min(100%, Nrem), 1fr)` so columns collapse to one at narrow widths with no media queries — keep that technique. Header, footer, nav, controls, and link rows all wrap. The layout targets "fits one viewport" at desktop; `overflow: auto` on the root plus `min-height` (not `height`) on `100dvh` keeps very short viewports scrollable rather than clipped. `scrollbar-gutter: stable` on `<html>` prevents layout shift, with an `overflow-y: scroll` fallback.

**No loading or error states.** All content is static and compiled in; there is no fetching, no forms, and no validation anywhere in the design.

## State
Four pieces of UI state, all local: `page` (route), `project` (selected index, default 0), `slide` (carousel index, default 0), `theme` (`'system' | 'light' | 'dark'`, hydrated from localStorage). Plus one derived measurement (facts-grid column count) if you keep the zinnia-fill behavior. No data fetching, no server state.

## Accessibility (part of the spec, not a nice-to-have — she is the accessibility SME)
Skip link to `#main` as the first focusable element · single `<h1>` per page · landmark structure (`header` / `nav[aria-label="Primary"]` / `main#main` / `footer`) · `aria-current="page"` on the active nav item · `aria-pressed` on project rows and theme segments · `aria-label` on all icon-only buttons and every unlabeled list · `aria-live="polite"` on the project detail panel · `aria-hidden` on decorative separators, overlays, and glyph arrows · descriptive `alt` on real photography, decorative images empty-`alt` · 44×44px minimum hit targets except the documented footer toggle · full `prefers-reduced-motion` support · all text pairs meet WCAG 2.2 AA (most AAA); `--text-faint` is AA-large only and is used exclusively for the redundant "Case Study" badge.

## Assets
In this bundle:
- `media/zinnias-monarch.jpg` — monarch on magenta zinnias, the facts-grid filler image. Alt text: *"A monarch butterfly resting on magenta zinnias."* Katie's own photo.
- `uploads/*.mp4`, `uploads/*.png` — project carousel media for Main Character and GPS3 (screen recordings and stills). Filenames map to slide labels; see `slideVideos` / `slideImages` in the logic block. Rename to slugs (`gps3-adoption.mp4`) when importing — the current names contain spaces and cache-busting hashes.
- `uploads/Katie_OConnor_Resume.pdf` — resume download target.
- `media/hero-home.png` — Home hero. Zinnias with a black swallowtail, full color. Rendered grayscale + luminosity-blended per the imagery treatment. Alt: *"A black swallowtail butterfly on pink and orange zinnias in a backyard garden."*
- `media/hero-contact.png` — Contact hero, same treatment.
- `media/headshot.png` — About headshot (4:5 crop, full color, **not** grayscaled — only the bottom-edge tint overlay applies). Alt: *"Katie O'Connor in front of a graffiti mural."*
- All three are Katie's own photos, exported from the prototype's image slots. Re-export from originals at higher resolution if she has them.
- Fonts: Young Serif + Atkinson Hyperlegible Next + Atkinson Hyperlegible Mono, all Google Fonts. Prototype loads them via `<link>` with `preconnect`; self-host them (e.g. `@nuxtjs/fontaine` / `unfonts`) in production.
- Icons: two inline SVG line icons (sun, moon) at 1.5px stroke using `currentColor`. Any matching 1.5px line-icon set is fine.

## Files in this bundle
| File | What it is |
|---|---|
| `Katie Portfolio.dc.html` | The full prototype — markup + inline styles + all content data. Primary reference. |
| `Theme Specimen.dc.html` | Token/specimen page: color ramps, type scale, spacing in rendered form. |
| `theme-tokens.md` | **Authoritative token table.** Start here when setting up the theme layer. |
| `support.js`, `image-slot.js` | Prototype runtime only. **Do not port.** Needed just to open the `.dc.html` files locally. |
| `media/`, `uploads/` | Assets described above. |

## Suggested build order
1. Theme layer from `theme-tokens.md` — CSS custom properties, both schemes, `data-theme` switch, font loading, base resets, link/focus/selection styles.
2. Shell — header, nav, footer, theme toggle, skip link, root grid.
3. Content data files ported from the logic block (projects, skills, resume, contacts) as typed constants.
4. Pages in order: Home, Contact (they share the two-column + bottom-pinned-table pattern), About, Resume, then Projects last — the carousel and facts grid are the only real components.
5. Accessibility pass against the checklist above, then a dark-mode imagery pass.

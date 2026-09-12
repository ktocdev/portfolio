# Katie O'Connor — Theme Tokens

Site defaults to the OS color scheme (`prefers-color-scheme`), with an Auto / Light / Dark control in the footer that sets `data-theme` on `<html>` and persists to `localStorage` (`portfolio-theme`). Tokens are implemented as CSS custom properties on `:root` / `html[data-theme="dark"]`. Light is designed; dark is derived from this table. All text/background pairs meet WCAG 2.2 AA (≥4.5:1 body, ≥3:1 large/UI); most meet AAA.

## Color — Light

| Token | Hex | Role | Contrast vs `bg` |
|---|---|---|---|
| `color.bg` | `#F7F6FB` | Page background (lavender-tinted white) | — |
| `color.surface` | `#EFEDF7` | Selected row, subtle fills | — |
| `color.surface.strong` | `#D9D6EE` | Image panels (blend base) | — |
| `color.text` | `#1F2333` | Primary text (slate) | 15.2:1 |
| `color.text.muted` | `#555B70` | Secondary text, labels, footer | 6.6:1 |
| `color.accent` | `#3E43B8` | Links, active nav rule, primary button bg | 7.3:1 |
| `color.accent.hover` | `#2F3396` | Hover/active state of accent | 9.8:1 |
| `color.on-accent` | `#F7F6FB` | Text on accent button | 7.3:1 vs accent |
| `color.accent.hero-em` | `#686BAA` | "with love" emphasis in Home H1, case-study fact values | — |
| `color.border` | `#CDCBDD` | Header/footer rules, button borders | — |
| `color.border.subtle` | `#E3E1EE` | Row dividers | — |
| `color.focus` | `#3E43B8` | 2px focus ring, 3px offset | 3.0:1+ vs all bgs |
| `color.selection` | `#C9C6F2` | ::selection background | — |
| `color.media.bg` | `#1F2333` | Carousel letterbox (dark: `#0F111A`) | — |
| `color.inverse.bg` | `#1F2333` | Skip-link, tooltips | — |
| `color.inverse.text` | `#F7F6FB` | Text on inverse | 15.2:1 |
| `color.image.tint` | `rgba(62,67,184,0.22)` | Soft-light gradient over botanical imagery | — |
| `color.image.shade` | `rgba(31,35,51,0.18)` | Secondary soft-light gradient | — |
| `color.text.faint` | `#9A9FB2` | "Case Study" badge label (decorative, next to visible text) | 3.1:1 — decorative use only, not sole conveyor of meaning |

## Color — Dark

| Token | Hex | Role | Contrast vs `bg` |
|---|---|---|---|
| `color.bg` | `#151824` | Page background (deep slate) | — |
| `color.surface` | `#1D2030` | Selected row, subtle fills | — |
| `color.surface.strong` | `#2A2D45` | Image panels (blend base) | — |
| `color.text` | `#E8E7F2` | Primary text | 14.6:1 |
| `color.text.muted` | `#A7A9C0` | Secondary text | 7.6:1 |
| `color.accent` | `#A5A8F5` | Links, active nav, primary button bg | 8.4:1 |
| `color.accent.hover` | `#C0C2FA` | Hover/active accent | 11.0:1 |
| `color.on-accent` | `#151824` | Text on accent button | 8.4:1 vs accent |
| `color.border` | `#363A52` | Header/footer rules | — |
| `color.border.subtle` | `#262A3E` | Row dividers | — |
| `color.focus` | `#A5A8F5` | Focus ring | — |
| `color.selection` | `#3A3F7A` | ::selection background | — |
| `color.accent.hero-em` | `#A5A8F5` | "with love" emphasis in Home H1, case-study fact values | — |
| `color.inverse.bg` | `#E8E7F2` | Skip-link | — |
| `color.inverse.text` | `#151824` | Text on inverse | — |
| `color.image.tint` | `rgba(165,168,245,0.20)` | Soft-light gradient over imagery | — |
| `color.image.shade` | `rgba(0,0,0,0.30)` | Secondary gradient | — |
| `color.text.faint` | `#7C819A` | "Case Study" badge label | decorative only |
| `color.media.bg` | `#0F111A` | Carousel letterbox (light: `#1F2333`) | — |

Dark-mode imagery: keep `grayscale(1) contrast(1.08)`, switch `mix-blend-mode` from `multiply` to `screen` (or `luminosity`) so the image lifts out of `surface.strong` instead of sinking into it; cap opacity at 0.85.

## Typography

Fonts (Google Fonts, free): 
- `font.display` — **Young Serif** 400. Headings, project names, wordmark.
- `font.body` — **Atkinson Hyperlegible Next** 400 / 500 / 700 (fallback Atkinson Hyperlegible, system-ui). Body, buttons.
- `font.mono` — **Atkinson Hyperlegible Mono** 400 / 500 (fallback ui-monospace). Nav, labels, meta, captions.

Fluid scale (`clamp(min, preferred, max)`; scales with viewport width and height so pages fit without scrolling):

| Token | Value | Use |
|---|---|---|
| `type.display` | `clamp(2.5rem, 1.6vw + 2.4vh + .9rem, 5.25rem)` | Home / Contact H1 |
| `type.h1` | `clamp(2rem, 1.2vw + 1.8vh + .8rem, 3.75rem)` | Section page H1 |
| `type.h2` | `clamp(1.5rem, 1rem + 1vw + .6vh, 2.5rem)` | Reserved — no current usage |
| `type.h3` | `clamp(1.0625rem, .9rem + .4vw, 1.375rem)` | List item titles, project names |
| `type.wordmark` | `clamp(1.125rem, 1rem + .5vw, 1.5rem)` | Header wordmark |
| `type.fact` | `clamp(1.375rem, 1rem + 1vw + .5vh, 2.25rem)` | Case-study fact values |
| `type.lead` | `clamp(1.0625rem, .82rem + .42vw + .2vh, 1.375rem)` | Intro paragraphs |
| `type.body` | `clamp(1rem, .82rem + .38vw, 1.25rem)` | Paragraphs |
| `type.body.lg` | `clamp(1rem, .82rem + .38vw + .15vh, 1.3125rem)` | About body copy (height-aware variant of `type.body`) |
| `type.body.md` | `clamp(.9375rem, .8rem + .3vw, 1.0625rem)` | Project long-form, case-study notes, resume bullets |
| `type.body.sm` | `clamp(.9375rem, .8rem + .3vw, 1.125rem)` | Skills, notes |
| `type.contact` | `clamp(1rem, .85rem + .4vw, 1.3125rem)` | Contact links |
| `type.meta` | `clamp(.875rem, .78rem + .25vw, 1rem)` | Taglines, org lines |
| `type.caption` | `clamp(.8125rem, .74rem + .13vw, .9375rem)` | Photo credit, fine print |
| `type.ui` | `clamp(.9375rem, .82rem + .3vw, 1.0625rem)` | Buttons |
| `type.role` | `clamp(.875rem, .76rem + .32vw, 1.0625rem)` | Home role line (mono) |
| `type.mono` | `clamp(.8125rem, .72rem + .28vw, .9375rem)` | Nav, roles |
| `type.mono.note` | `clamp(.8125rem, .74rem + .22vw, .9375rem)` | Status note |
| `type.mono.sm` | `clamp(.75rem, .68rem + .22vw, .875rem)` | Labels, meta, footer |
| `type.mono.xs` | `.7rem` | Theme-toggle labels |

Minimum rendered body size 16px; minimum any text 12px (captions only).

| Token | Value |
|---|---|
| `leading.tight` | 1.04 (display) · 1.08 (h1) · 1.1 (h2) · 1.2 (h3) |
| `leading.body` | 1.5 · 1.55 (long-form) |
| `tracking.display` | -0.012em |
| `tracking.h1` | -0.01em |
| `tracking.mono` | 0.04em · 0.06em (uppercase labels) |
| `measure` | 34ch (lead) · 36ch (page intros) · 56ch (About body) · 60ch (case-study notes) · 62ch (project long-form) |
| `font.weight` | 400 regular · 500 medium (buttons) · 700 bold |

## Spacing (4px base, fluid where layout-critical)

| Token | Value |
|---|---|
| `space.1` | 4px |
| `space.2` | 8px |
| `space.3` | 12px |
| `space.4` | 16px |
| `space.5` | 24px |
| `space.6` | 32px |
| `space.7` | 48px |
| `space.8` | 64px |
| `space.page.y` | `clamp(1.25rem, 2.4vw, 3rem)` |
| `space.page.x` | `clamp(1.25rem, 3.4vw, 4.5rem)` |
| `space.section.gap` | `clamp(1rem, 2.4vh, 2.25rem)` |
| `space.column.gap` | `clamp(1.5rem, 3.5vw, 5rem)` |
| `space.stack` | `clamp(1rem, 2.4vh, 2rem)` |
| `space.row.y` | `clamp(.7rem, 1.6vh, 1.1rem)` |
| `space.nav.gap` | `clamp(1rem, 2.2vw, 2.5rem)` |

## Radius

| Token | Value | Use |
|---|---|---|
| `radius.none` | 0 | Rules, list rows |
| `radius.sm` | 2px | Buttons, badges, focus ring |
| `radius.md` | 4px | Image panels, carousel |
| `radius.full` | 9999px | Reserved (not used) |

## Borders & lines

| Token | Value |
|---|---|
| `border.hairline` | 1px solid `color.border` |
| `border.subtle` | 1px solid `color.border.subtle` |
| `border.active` | 2px solid `color.accent` (left rule on selected project) |
| `underline.thickness` | 1px (links) · 1.5px (nav) |
| `underline.offset` | 0.18em (links) · 0.45em (nav) |

## Elevation

Flat system — no drop shadows. Depth comes from `surface` fills and blended imagery only. `shadow.none: none`.

## Motion

| Token | Value |
|---|---|
| `motion.duration.base` | 150ms — color, border, background and underline on `a, button` |
| `motion.duration.relaxed` | 250ms — elements that appear rather than change state: tooltip opacity + 6px rise, after a 60ms hover delay |
| `motion.ease` | `cubic-bezier(.2,.6,.2,1)` — used by both durations |
| `motion.reduced` | All transitions and animations disabled under `prefers-reduced-motion: reduce` — every transition in the system lives inside the `no-preference` guard |

## Layout

| Token | Value |
|---|---|
| `layout.root.height` | `100dvh` (grid rows `auto minmax(min-content, 1fr) auto`; `overflow:auto` fallback for very small viewports) |
| `layout.column.min` | `27rem` (Home/Contact) · `22rem` (Projects/About) — collapse via `repeat(auto-fit, minmax(min(100%, N), 1fr))`. Resume is asymmetric: `minmax(min(100%, 22rem), 1fr) minmax(min(100%, 26rem), 1.4fr)` |
| `layout.panel.min-height` | `min(46vh, 22rem)` (Home/Contact figures) |
| `layout.portrait` | `aspect-ratio: 4 / 5`; `width: min(100%, 34rem)`; `max-height: min(64vh, 40rem)` (About headshot) |
| `layout.carousel.height` | `clamp(14rem, 40vh, 28rem)` |
| `layout.hit-target.min` | 44 × 44px (2.75rem) — carousel and icon controls; the footer theme toggle is a compact exception at 1.8rem tall |

## Imagery treatment

`surface.strong` base → image `filter: grayscale(1) contrast(1.08) brightness(1.04)` + `mix-blend-mode: multiply` (light) / `screen` (dark) → overlay gradient of `color.image.tint` + `color.image.shade` with `mix-blend-mode: soft-light` → mono caption `type.mono.sm`, opacity 0.7. Subject: botanical or painterly stock, low detail, soft focus.

## Z-index

`z.base` 0 · `z.overlay` 1 (panel gradients) · `z.tooltip` 5 · `z.skip` 10

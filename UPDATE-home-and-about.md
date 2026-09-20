# Update — Home and About pages

**Date:** 2026-09-19 · **Supersedes:** the "1. Home" and "5. About" screen sections of `README.md`
**New reference prototype:** `Katie Portfolio v3.dc.html` (the original `Katie Portfolio.dc.html` is now the *old* design — keep it only for the four unchanged pages)

Everything in `README.md` and `theme-tokens.md` still applies except where this file says otherwise. No tokens changed. No new colors, fonts, or spacing values were introduced.

---

## TL;DR

The Home page was rewritten from a dense "hero + credentials + skills table" layout into a **portrait-led introduction**: headshot on the left, three short things on the right (name, one paragraph, one filled button). The skills table and the botanical hero image are **gone from Home**.

Because the headshot moved to Home, the **About page figure** now uses the monarch/zinnias photo with the standard hero image treatment instead of the headshot.

Projects, Resume, and Contact did not change — their markup is byte-identical to the previous handoff.

---

## 1. Home — new layout

```
┌──────────────────────────────────────────────────────┐
│  header                                              │
├──────────────────────┬───────────────────────────────┤
│                      │                               │
│     [ headshot ]     │   Hi, I'm Katie.              │
│       4:5 portrait   │                               │
│                      │   one intro paragraph         │
│                      │                               │
│                      │   [ See what I've been making →│
│                      │                               │
├──────────────────────┴───────────────────────────────┤
│  footer                                              │
└──────────────────────────────────────────────────────┘
```

**Section grid** (replaces the old two-column hero grid):

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
gap: clamp(2.5rem, 6vw, 8rem);
align-items: center;                      /* both columns vertically centered */
padding: clamp(1.5rem, 5vh, 4.5rem) 0;    /* breathing room inside the page grid row */
min-height: 0;
```

Changes from the old Home grid: column min `27rem → 22rem`, gap `clamp(1.5rem,3.5vw,5rem) → clamp(2.5rem,6vw,8rem)`, `align-items: center` added, vertical padding added. The left column is no longer `justify-content: space-between` — nothing pins to the bottom of the viewport anymore.

**Source order is image first.** At the single-column breakpoint the portrait stacks above the text, which is intended.

### Left — portrait figure

Same treatment the About headshot used to have, at a smaller size:

```css
margin: 0;
position: relative;
width: min(100%, 26rem);
aspect-ratio: 4 / 5;
max-height: min(64vh, 34rem);
justify-self: center;
background: var(--surface-strong);
border-radius: 4px;
overflow: hidden;
isolation: isolate;
```

- Image: `media/headshot.png`, absolutely `inset: 0`, `width/height: 100%`, `object-fit: cover`.
  **No grayscale, no `mix-blend-mode`** — full color, same as the old About headshot. Identical in light and dark.
- Overlay (`aria-hidden="true"`, `pointer-events: none`, absolute inset 0):
  `linear-gradient(180deg, var(--img-tint-0) 60%, var(--img-tint) 100%)` with `mix-blend-mode: multiply` — a soft weight at the bottom edge only.
- Alt text: *"Katie O'Connor in front of a graffiti mural."*

(In the prototype this is an `<image-slot id="headshot">` drop target, so no `src` appears in the markup. Ship it as a plain `<img>`.)

### Right — text column

```css
display: flex;
flex-direction: column;
gap: clamp(1.75rem, 4.5vh, 3.25rem);
max-width: 40ch;
min-width: 0;
```

1. **H1** — Young Serif 400, `clamp(2.5rem, 1.5vw + 2.2vh + .9rem, 4.75rem)`, `line-height: 1.06`, `letter-spacing: -.012em`, `text-wrap: balance`, `color: var(--text)`.
   Copy: **Hi, I'm Katie.**
   (Note: this is a *new* size ramp, slightly smaller than `type.display` at the top end — 4.75rem vs 5.25rem — because the line is short. Keep the literal clamp.)
2. **Intro paragraph** — `clamp(1.0625rem, .82rem + .42vw + .2vh, 1.375rem)` (= `type.lead`), `line-height: 1.6`, `text-wrap: pretty`, `color: var(--text)`, no `max-width` of its own (the 40ch column governs).
   Copy, verbatim:
   > I'm a senior software engineer in Chicago. I've architected three generations of a component library, and now I build AI-native apps end to end. I'm endlessly curious about how things work, and driven to learn more.
3. **Primary CTA** — an `<a href="/projects">`, styled as the filled button:

```css
display: inline-flex;
align-items: center;
gap: .6rem;
min-height: 2.75rem;
padding: .65rem 1.1rem;
background: var(--accent);
color: var(--bg);               /* = --on-accent */
text-decoration: none;
border-radius: 2px;
font-weight: 500;
font-size: clamp(.9375rem, .82rem + .3vw, 1.0625rem);
align-self: flex-start;
margin-top: .5rem;
/* hover */
background: var(--accent-hover);
```

Label: **See what I've been making** followed by a mono `→` in an `aria-hidden="true"` span (`font-family: 'Atkinson Hyperlegible Mono', ui-monospace, monospace`).

This is now the **second** filled button in the system (the other is Resume's "Download PDF"). Same recipe — worth extracting as one shared `Button` / `ButtonLink` component with a `primary` variant.

### Removed from Home

Delete these; they exist nowhere else on the site now:

| Removed | Was |
|---|---|
| Mono eyebrow stack | "Senior Software Engineer" + `Design Engineer / Full-Stack Engineer / Design System Architect` specialty list |
| Old H1 | "Systems that work end to end, designed *with love*." — **the `--hero-em` italic emphasis no longer appears on Home**; the token is still used by the case-study fact values, so keep it |
| Old lead paragraph | The 45M-students / nebula-nuxt paragraph |
| Text link | "See selected projects →" — replaced by the filled CTA |
| **Skills table** | The `<dl aria-label="Technical skills">` with rows AI engineering / Front-end / Back-end / Other |
| Botanical hero figure | The grayscale + multiply + dual-gradient panel (`media/hero-home.png`) |

⚠️ **Open item — the skills content.** The `skills` array is still present in the prototype's logic block but is no longer rendered anywhere. Don't silently drop it: either keep it as data for a future placement, or ask Katie where it should go (Resume and About are the obvious candidates). Do not re-add it to Home.

---

## 2. About — headshot replaced with the zinnias/monarch photo

The About section's layout, copy, `<dl>`, and caption are **unchanged**. Only the image inside the existing figure changed, because the headshot moved to Home.

Figure box is unchanged (`width: min(100%, 34rem)`, `aspect-ratio: 4/5`, `max-height: min(64vh, 40rem)`, `surface-strong`, 4px radius, `isolation: isolate`).

New contents — the standard **hero image treatment** (see `HERO-IMAGE-TREATMENT.md`), not the old headshot treatment:

```html
<img src="/media/zinnias-monarch.jpg"
     alt="A monarch butterfly resting on magenta zinnias"
     style="position:absolute; inset:0; width:100%; height:100%;
            object-fit:cover; object-position:50% 58%;
            filter:grayscale(1) contrast(1.08) brightness(1.04);
            mix-blend-mode:multiply;">            <!-- screen / luminosity in dark -->
<div aria-hidden="true" style="position:absolute; inset:0; pointer-events:none;
     background:
       linear-gradient(165deg, var(--img-tint)  0%, var(--img-tint-0)  55%),
       linear-gradient( 15deg, var(--img-shade) 0%, var(--img-shade-0) 45%);
     mix-blend-mode:soft-light;"></div>
```

`object-position: 50% 58%` matters — it keeps the butterfly in frame in a 4:5 crop.

Dark mode: same rule as the other blended images — swap `multiply → screen` (or `luminosity`). In CSS, drive it off `[data-theme]` + the `prefers-color-scheme` fallback. (The prototype routes this through a prop named `blendModeHome`, which is now a misnomer — it feeds the About image. Ignore the name.)

`media/zinnias-monarch.jpg` now serves **two** places: this figure and the case-study facts-grid filler. Same file, different crop/treatment parameters.

---

## 3. Projects, Resume, Contact — no change

Build them per `README.md` §§2–4 as written. One thing to watch: Contact is now the **only** page using a botanical hero, so don't let the image-treatment CSS get deleted when Home's hero panel goes away.

---

## 4. Asset ledger after this update

| Asset | Status |
|---|---|
| `media/headshot.png` | **Now on Home** (was About). Full color, bottom-edge tint only. |
| `media/zinnias-monarch.jpg` | **Now on About** (hero treatment) *and* still the facts-grid filler. |
| `media/hero-contact.png` | Unchanged — Contact figure. |
| `media/hero-home.png` | **Orphaned.** No longer referenced. Keep it out of the build; don't delete the original. |

---

## 5. Suggested order of work

1. Extract the filled-button styles from Resume into a shared primary button/link component, then build the new Home CTA with it.
2. Rebuild Home: grid, portrait figure (headshot treatment), text column, CTA. Delete the skills table markup and the Home hero panel.
3. Swap the About figure to `zinnias-monarch.jpg` with the hero treatment + `object-position: 50% 58%`.
4. Park the `skills` data in its content file with a `TODO` until Katie decides where it lands.
5. Re-check: dark mode on the new About image, single-column stacking on Home (portrait above text), focus ring on the CTA, and that the Home page still fits `100dvh` with the new vertical padding.

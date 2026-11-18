---
name: refresh-design-system
description: Remake the OnTrack design system docs in portfolio (public/ontrack/design-system/, served at ktoc.dev/ontrack/design-system/) from what's currently in the OnTrack repo. Use when asked to update, refresh, rebuild or sync the design system, the OnTrack design system, or the OnTrack docs. Stops before portfolio's own build.
---

# Refresh design system — rebuild the OnTrack design system from OnTrack

The docs at `public/ontrack/design-system/` are a static single-page app built
by the OnTrack repo (`c:\apps\ontrack`, folder `design-system/`). They have no
Next route and nothing in them is edited by hand here: they're always replaced
wholesale from a fresh build, then given one index.html per page.

## 1. Build it in OnTrack

The build renders the app's own components and CSS (`app/src/components`,
`app/src/styles/tokens.css`, `app/src/index.css`), so it needs both packages'
dependencies installed.

- It builds from OnTrack's **working tree**, not a commit. Before building,
  run `git -C c:\apps\ontrack status --short` and `git -C c:\apps\ontrack branch --show-current`.
  If `design-system/` or `app/src/` has uncommitted changes, or the branch
  isn't `main`, tell the user what would go in (they may well want it; don't
  stop to ask unless they said to).
- If `app/node_modules` or `design-system/node_modules` is missing, or either
  `package-lock.json` is newer than its `node_modules`, run `npm ci` in that
  folder first.

Then, from `c:\apps\ontrack\design-system`:

```
npm run build
```

Success ends with `✓ built in …`. If `tsc` or Vite fails, report the error and
stop. The site lands in `dist/ontrack/design-system/`; the `index.html`,
`_headers` and `_redirects` at `dist/`'s top level are for OnTrack's own
Worker and are not copied.

## 2. Replace it in portfolio

From the portfolio root, in PowerShell, mirror the build so files removed
upstream (old hashed assets) are removed here too:

```
robocopy c:\apps\ontrack\design-system\dist\ontrack\design-system public\ontrack\design-system /MIR /NFL /NDL /NJH /NP; if ($LASTEXITCODE -lt 8) { exit 0 } else { exit $LASTEXITCODE }
```

robocopy exits 1 when it copied files; the `if` maps 0–7 (success) to 0. 8 and
above are real failures — report and stop.

## 3. Write the page copies

`/MIR` just deleted the per-page index.html copies. Remake them from the
registry, then check them:

```
node scripts/ontrack-ds-pages.mjs c:\apps\ontrack
node scripts/ontrack-ds-pages.mjs --check
```

Without these, a reload or a shared link to any page but the overview 404s
(this site's Worker serves 404.html, not the app, for unknown paths). The
build runs `--check` too and fails if they're missing or stale. If the script
says it found no overview route, OnTrack's `src/pages/registry.tsx` changed
shape: read it and update the regex in the script.

## 4. Review what changed

```
git status --short public/ontrack/design-system
git diff --ignore-cr-at-eol --stat public/ontrack/design-system
```

Expect a new `assets/index-*.js` / `index-*.css` pair (and the old pair
deleted) whenever anything changed, the page copies modified alongside, and
new route folders for any page OnTrack added. Files modified in `git status`
but missing from the `--ignore-cr-at-eol` stat differ only in line endings;
mention it, don't act on it.

If the design system's own CSP changed (in OnTrack's `vite.config.ts`, the
`workerFiles` plugin), copy it into the `/ontrack/design-system/*` block of
`public/_headers` — that block is the one that applies here.

## Stop here

Don't run `npm run build`, `npm run deploy`, or commit. Hand back the change
summary and let the user check `/ontrack/design-system/` under `npm run dev`
and decide what's next.

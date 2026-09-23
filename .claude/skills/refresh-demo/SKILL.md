---
name: refresh-demo
description: Remake the Main Character demo journal in portfolio (public/main-character/demo/) from what's currently in the rag-journal repo. Use when asked to update, refresh, rebuild or sync the demo, the main-character demo, or the demo journal. Stops before portfolio's own build.
---

# Refresh demo — rebuild the Main Character demo from rag-journal

The demo at `public/main-character/demo/` is a static app built by the
rag-journal repo (`c:\apps\rag-journal`). It has no Next route and nothing in
it is edited by hand here: it's always replaced wholesale from a fresh build.

## 1. Build the demo in rag-journal

Run this from the rag-journal root:

```
.venv\Scripts\python.exe scripts\build_web_demo.py
```

That rebuilds `dist/web-demo/` from the current `static/` files and the
recorded demo in `mock_fixtures/demo_close/`, so it will pick up the changes.

- Use the venv's interpreter. Plain `python` on this machine is the Microsoft
  Store alias and fails.
- It builds from rag-journal's **working tree**, not a commit. Before running,
  check `git status` and `git branch` there; if `static/` or `mock_fixtures/`
  has uncommitted changes, or the branch isn't `main`, tell the user before
  building.
- Success ends with `web demo -> ...\dist\web-demo (N MB)`. If it fails, report
  the error and stop.

## 2. Replace the demo in portfolio

From the portfolio root, swap the old demo for the new build. Mirror the
folder so files removed upstream are removed here too:

```
robocopy c:\apps\rag-journal\dist\web-demo public\main-character\demo /MIR /NFL /NDL /NJH /NP; if ($LASTEXITCODE -lt 8) { exit 0 } else { exit $LASTEXITCODE }
```

Run it in PowerShell. robocopy exits 1 when it copied files, which the shell
reads as failure; the `if` maps its 0–7 (success) to 0. 8 and above are real
failures — report and stop.

Then review what changed:

```
git status --short public/main-character/demo
git diff --ignore-cr-at-eol --stat public/main-character/demo
```

Files that show as modified in `git status` but are missing from the
`--ignore-cr-at-eol` stat differ only in line endings. Git normalizes them to
LF on commit, so they'll drop out; mention it, don't act on it.

## Stop here

Don't run `npm run build`, `npm run deploy`, or commit. Hand back the change
summary and let the user check `/main-character/demo/` under `npm run dev`
and decide what's next.

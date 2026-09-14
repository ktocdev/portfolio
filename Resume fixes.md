# Resume fixes

Changes made to the site's resume copy in `src/content/resume.ts` and
`src/content/site.ts` on 2026-09-13, to port back into
`public/Katie-OConnor-Resume.pdf` so the two stay in step. Where the PDF
doesn't contain the same sentence, skip that item.

## Wording changes (done on the site)

| Where | Before | After | Why |
|---|---|---|---|
| Discovery Education · AI-Augmented Engineering, bullet 1 | "**Uses** Claude daily for spec-driven development…" | "**Used** Claude daily…" | Role is dated 2015–2026 and every other bullet is past tense. |
| Discovery Education · AI-Augmented Engineering, bullet 5 | "**Co-hosts** company's AI Office Hours…" | "**Co-hosted the** company's AI Office Hours…" | Same tense fix. |
| Date ranges | "2015 — 2026", "2008 — 2015" (spaced em dash) | "2015–2026", "2008–2015" (en dash, no spaces) | Matches the case-study meta ("2016–2026") and standard resume style. |
| Skills · Front-end | "…Tailwind CSS, **Vite**, accessibility" | "…Tailwind CSS, accessibility" | "Vite" was listed twice in the row. |
| Skills · Other | "**Github**", "**THREE.js**" | "**GitHub**", "**Three.js**" | Official capitalisation. |

## Things to check in the PDF (not verifiable from here)

- [ ] **No phone number or street address.** The PDF is downloadable by anyone
      who visits `/resume`. Email and LinkedIn are enough; drop a phone number or
      home address if either is on there.
- [ ] **Component counts agree with the site.** The resume says "personally
      built 25 of the 26 components delivered"; the Projects case study says
      "Migrated 25 of 46 legacy components… the rest had not yet been started",
      then "Teammates also contributed… new components." Both can be true, but
      a reader comparing them will pause. Suggested single phrasing for both:
      "Personally built 25 of the 26 components delivered against a 46-component
      migration roadmap."
- [ ] **Present-tense verbs elsewhere.** If the PDF has other bullets in
      present tense ("Uses", "Co-hosts", "Serves"), switch them to past tense to
      match, unless the role is still current, in which case change the site's
      end year instead.
- [ ] **PDF metadata.** Set Title to "Katie O'Connor — Resume" and Author to
      your name; strip anything else the export tool added (e.g. a template name).
- [ ] **Filename.** The site serves `Katie-OConnor-Resume.pdf` (hyphens). The
      repo-root duplicate `Katie_OConnor_Resume.pdf` (underscores) has been
      removed; export the new PDF straight to `public/Katie-OConnor-Resume.pdf`.

## After updating the PDF

1. Replace `public/Katie-OConnor-Resume.pdf`.
2. `npm run build` and open `out/resume/index.html` to confirm the download
   link still resolves.
3. Delete this file.

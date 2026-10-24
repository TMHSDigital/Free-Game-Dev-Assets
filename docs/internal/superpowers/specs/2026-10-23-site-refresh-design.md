# Site refresh: show the assets, keep the identity

Date: 2026-10-23. Status: approved direction (A + B blend chosen in brainstorming; image storage and remaining calls delegated to the builder by the maintainer: "Your call. Do it").

## Intent

The GitHub Pages site scores 100/100/100 on accessibility, best practices and SEO and 83 on performance, but it looks dated and plain, and nothing on it shows the assets it catalogs. A catalog of visual things should be visual. This refresh keeps the current identity (palette, type, copy, page structure, the "every licence read at source" promise) and makes the assets themselves carry the page, while fixing the performance and layout items from the 2026-10-23 technical audit.

## Goals

1. Every entry that can legally show its publisher's preview image does, on the homepage, category pages, entry page and stack pages.
2. The first screen of the homepage shows real assets, not only a QA ledger.
3. The homepage loads fast on a phone: no render-blocking third-party fonts, no 631 KB pre-rendered HTML.
4. The entry page has one obvious primary action and readable facts.
5. Everything stays zero-npm-dependency, static, and works without JavaScript.

## Non-goals

- A redesign. No new palette, type, logo, or copy voice. "Refinement preserves."
- A new client-side framework or bundler.
- Fetching images at page view time. Visitors never hit publisher servers for thumbnails.
- Rendering font specimens or audio waveforms from the actual asset files (a later project).

## Anti-goals (would make this a failure even if it works)

- Showing a preview for an entry whose licence does not permit redistributing it.
- Publisher logos or GitHub social cards passing as asset previews.
- Hotlinking that leaks visitor requests to itch.io, Kenney and others.
- Breaking no-JS reading, search engines, or the 100 accessibility score.
- A homepage that still needs 66,000 px of scroll to reach the footer.

## Constraints

- Node 22+, no npm dependencies. System tools (ffmpeg, ImageMagick) may be used by the thumbnail script only, and only when present; the build never needs them.
- `site/build.mjs` marker substitution stays; tests in `site/checks.test.mjs` and `site/lib/lib.test.mjs` keep passing; `npm run check` is the gate.
- Impeccable craft floor applies to UI edits; run the detector once after.
- Work happens on branch `site-refresh`, lands as one PR that closes #75 and #87.

## Decided: the look (from the brainstorm mockups)

**Hero.** Two-line headline ("416 free game assets. Every licence read at the source." with the count live from the build), one-line subtitle naming the categories and the commercial/attribution promise, the search box, and the category chips. The verification ledger copy shrinks to one line ("414 re-checked in the last 180 days") and the full ledger stays on the freshness page. Counts in the hero and in the Catalog heading come from the same number.

**Filmstrip.** Under the hero, a single row of square thumbnails (9 on desktop, scrolling or 5 on phones) chosen deterministically at build time: entries from card-default categories that have a thumbnail, most recently verified first, at most one per publisher. Each links to its entry.

**Category sections with two views.** Each category section has a Cards / List toggle at its heading.
- Cards (the A mockup): a responsive grid, three columns at the 920 px max width, image on top at 16:10, then name, publisher and short descriptor, then a bottom line with the licence pill left and up to three formats right in the mono face.
- List (the B mockup): the existing dense row with a 56 px square thumbnail at the left, name, one metadata line, pills at the right.
- Default view is Cards for `3d`, `2d`, `characters`, `environment`, `animation`, `shaders-vfx`; List for `tools`, `audio`, `fonts`, `video`. The visitor's toggle is remembered in localStorage per category group kind (visual / non-visual), not per category.
- Each section shows 6 entries (Cards) or 8 (List), then a "Show all N in <category>" link to a new static category page. With JavaScript, the chips and search render the full filtered set in place from data.js, in the active view; search results always use the List form.

**Category pages.** New static pages at `category/<id>/` listing every entry in that category, both views available, no JavaScript needed to see everything. These carry the full pre-render that the homepage used to.

**Typographic tile.** Entries with no permitted image get a tile: striped background from the surface and line tokens, the entry name in the display weight, and a small mono caption. Motif per category: a waveform for audio, "Aa" for fonts, a grid for tools, nothing special for the rest. Tiles are pure CSS and HTML so dark mode follows the tokens.

**Entry page.** The thumbnail becomes a header strip above the title (object-fit contain on the tile background, max 360 px tall). One primary button, "Go to source". "View the file on GitHub", "Report a problem" and "Add to shortlist" become secondary text links in a row. "At a glance" becomes a definition list in the body face; the "What this stack owes" box on stack pages gets the same treatment. Copy buttons meet 44 px. A one-line credit under the strip: "Preview image from <publisher>, shown under <licence>."

**Stack pages.** The entries in a stack render as Cards.

**Audit fixes carried in this work.** Self-hosted fonts with preload (closes #87). Group heading text no longer reads "3D77" to screen readers and text extraction (count in its own labelled element). Side-tab 3 px borders removed in favour of the existing edge variable treatment. Mobile header collapses to brand plus a menu row; nav links meet 44 px. The floating "↑ Search" button moves to the bottom-left and hides while a card's actions are focused. Lazy loading and explicit width/height on every thumbnail so CLS stays near zero.

## Decided: thumbnail pipeline (builder's call, now fixed)

**Storage.** Thumbnails are committed to the repo under `site/public/thumbs/<id>.webp`, 640 px wide at most, WebP quality about 78, target under 40 KB each, with a manifest `site/thumbs.json` recording for each id: source page URL, image URL, fetched date, content hash, width, height, and the licence value at fetch time. A full run for the current catalog is expected to add roughly 150 to 250 files and under 8 MB.

**Fetch script.** `site/thumbs.mjs` (plus `site/lib/thumbs.mjs` for the testable pure parts). For each eligible entry it fetches the entry URL, reads `og:image` (fallback `twitter:image`), downloads it, converts with ffmpeg if on PATH, else ImageMagick, else skips that entry and reports it. Animated GIFs take the first frame. It is incremental: entries already in the manifest with the same licence and a fetch date under 180 days old are skipped unless `--force`. It never edits catalog entries. Exit code is non-zero only on script errors, not on individual fetch failures, which are listed in a summary.

**Licence gate.** An entry is eligible when its `license` maps to a vocabulary family that permits redistribution of modified copies: CC0, public-domain, Unlicense, CC-BY (3.0, 4.0, unversioned), CC-BY-SA, MIT, ISC, BSD (all variants), Apache-2.0, MPL-2.0, SIL OFL, GPL and LGPL (all variants), CDLA-Permissive-2.0. Ineligible: `custom`, `varies`, `unknown`, any ND or NC variant, ODbL, CPL-1.0, and anything not in the list. The gate is implemented as an explicit allowlist in `site/lib/thumbs.mjs` with a test, not by string prefix.

**Host and duplicate rules.** `github.com` pages are skipped (their `og:image` is a social card, not a preview). `fonts.google.com` is skipped (logo). Any image whose content hash is shared by three or more entries is treated as a publisher logo and dropped for all of them. Quaternius pages are allowed but will mostly hit the duplicate rule; a later pass can add per-pack images by override.

**Overrides.** New optional frontmatter field `preview`: either an absolute image URL the maintainer has checked is covered by the entry's licence, or the literal `none` to opt out. The validator accepts the field and rejects any other value. CONTRIBUTING gains a short section: how previews are chosen, and that a publisher can ask for removal, which is done by setting `preview: none`.

**Workflow.** `.github/workflows/thumbs.yml`: monthly schedule plus manual dispatch, runs the script on `ubuntu-latest` (ffmpeg is present on the runner image; the workflow installs it with apt if missing). The repository does not allow Actions to open pull requests, and a `GITHUB_TOKEN` pull request would not run CI, so the workflow follows the `reverify.yml` pattern instead: it pushes the changed files to a `thumbs/<date>` branch and opens or updates one issue with the compare link and the script's summary. The maintainer opens the pull request from that link so CI runs on it. Permissions: `contents: write`, `issues: write`. No third-party actions beyond the pinned checkout and setup-node already in use.

**First batch.** The launch pull request ships the pipeline and the first full batch of thumbnails, generated locally with ffmpeg, so the site never goes live with an empty filmstrip and the performance targets are measured on the real page. The validator's allowed binary prefixes gain `site/public/thumbs/` and `site/public/fonts/`.

**Status gate.** Only entries with `status: active` get a thumbnail or a place in the filmstrip. `needs-review` and `deprecated` entries get the tile, since their licence facts are not trusted yet or the source is gone.

**Publisher credit when `publisher` is absent.** Only about 170 entries set `publisher`. The credit line uses it when present ("Preview image from Kenney, shown under CC0") and otherwise reads "Preview image from the source page, shown under <licence>". The filmstrip's one-per-publisher rule groups by `publisher` when set, else by the source hostname; that is a diversity rule, not an attribution, so hostname grouping is acceptable there.

**Build.** `build.mjs` reads the manifest. For an entry with a thumbnail it emits `<img src="thumbs/<id>.webp" width height loading="lazy" decoding="async" alt="">` (decorative; the adjacent name is the accessible text). Otherwise it emits the tile. `data.js` gains a `thumb` field (relative path or null) so the client renders the same thing.

**Credit.** Each thumbnail's publisher and licence are already on the entry; the entry page states them under the strip, and the site footer gains one line: "Preview images belong to their publishers and are shown under each entry's licence."

## Decided: performance

- Fonts: Public Sans 400/500/600/700 (500 is used by the current stylesheet) and IBM Plex Mono 400/500 as latin-subset WOFF2 under `site/public/fonts/` with the OFL licence file, `font-display: swap`, preload for the two body weights. Google Fonts `<link>`s removed from every page template. The `<head>` template is shared by index, entry, stack, category and freshness pages (the second half of #87).
- Homepage HTML pre-renders only the per-section cut-offs. `data.js` stays, loaded with `defer`, and is the single full copy of the catalog (closes #75). Category pages carry the full static lists.
- Target after the change: Lighthouse performance 90 or better on the homepage mobile run, CLS under 0.05, accessibility still 100.

## Left to the builder

- Exact CSS for cards, rows, tiles, strip and toggle, within the existing tokens; breakpoints; whether the filmstrip scrolls or truncates on phones.
- How app.js reproduces Cards and List on hydrate without duplicating templates badly (shared string templates in `site/lib/` are preferred).
- Category page layout details and whether they include the search box (a filtered link back to the homepage is acceptable).
- The precise filmstrip picking order beyond the rules above.
- Test coverage: gate allowlist, duplicate-hash rule, manifest incremental skip, override validation, build output for both branches (image / tile), heading text, and a page check that no page references Google Fonts.

## Out of scope, noted for later

- Font specimen tiles rendered from the font files (fonts category).
- Audio waveform tiles rendered from sample files.
- Per-pack images for Quaternius and other single-page publishers.
- Search over Notes and Evidence (#92).

# Review ledger

Newest section at the top. One section per review run. This is the record of what a
run measured, what it changed, what it deliberately did not change, and what the next
run should not spend time re-deciding.

## 2026-09-26 (open issues sweep: #36 to #47)

The ten issues left open after the review, on the `issues-sweep` branch.

- **Tags (#36):** tags no longer restate the licence, the credit requirement or the
  entry's own publisher. 124 entries lost such a tag (`cc0` 40 more after #49, `ofl` 20,
  `open-source` 19, `kenney`/`quaternius`/`kaykit`/`blender-studio` and others). Licence
  tags are retired in `site/value-aliases.json` (V19); V21 rejects a tag equal to the
  entry's publisher. Search now weights `publisher` like a tag. Decided: a `varies`
  entry lists its licence mix in the body, not in tags.
- **Formats (#37):** `site/format-vocabulary.json` is the closed list (117 values in
  use); V20 rejects anything else. Its `groups` drive the Format filter. Kept: `model`
  (piper-plus, whose page names no container) and `various` (three aggregators).
- **Filters (#45):** Licence (families in `license-vocabulary.json`, every value in
  exactly one) and Format selects, in the URL as `?licence=` and `?format=`.
- **Shortlist (#47):** a star on cards and entry pages (`localStorage`
  `fgda:shortlist`), a panel with CREDITS.md / CREDITS.txt download. `owes()` moved to
  `site/lib/owes.mjs` (no imports, copied to `dist/owes.js`) so the stack pages and the
  shortlist share it; it gained a `notices` bucket for MIT/OFL-type licences.
- **Maintenance (#42):** optional `maintenance: archived | inactive` (V22), a badge and
  an entry-page row. Set from the GitHub API on 11 sources: archived glitch-archive,
  meta-animated-drawings, microsoft-movebox; inactive (no push in 3 years)
  dcss-tiles, sparklin-superpowers, instant-meshes, quadriflow, creature-2d-runtimes,
  gdquest-3d-mannequin, microsoft-rocketbox, godot-psx-style-demo. `check-links.mjs`
  reports a GitHub source whose state disagrees with the field (the first local run
  found godot-psx-style-demo, 3.01 years).
- **Categories (#38):** the rule is written in `catalog/README.md` (by main content;
  single-purpose creation tools sit with their content; mixed libraries by main kind).
  So the character creators and capture tools stay put, HDRI publishers stay in
  environment and BlendKit in 3d. Moved: nasa-3d-resources to 3d,
  nasa-image-video-library to video.
- **Re-verified (#40):** all ten July needs-review entries re-read. Now active:
  fab-megascans-standard, fmod-studio (credit line and splash logo required). Facts
  changed: opengameart commercial true, freesound commercial varies. Still open, with
  the question in Notes: lospec (per-palette terms), convology-xt (terms behind the
  download form), godot-shaders and opengameart (credit per upload), freesound (credit
  per sound), material-maker-gallery (per-item licence script-rendered), wwise (game
  EULA not public), charmorph (AGPL reach into exported meshes).
- **Added (#43):** 15 sources (Godot Engine, TrenchBroom, Ogmo Editor, func_godot,
  BeepBox, Bosca Ceoil Blue, Furnace, OpenMPT, Synfig, OpenToonz, Pencil2D, Kenney
  Animated Characters, Kenney Fonts, Monogram, Dareful); `GPL-2.0-only` added for
  Pencil2D. Skipped, do not re-research without news: DragonBones (site unreachable),
  Life of Vids (unreachable), Mazwai (redirects to Freepik). Music and animation editors
  follow the tools/ precedent (LMMS, Krita), not animation/. A "Request an asset /
  report a gap" issue form (label `gap`) now feeds the stack Gaps sections.
- **Left:** #41 (the remaining 2D fields need someone to open the files) and #3 (branch
  protection, deferred by the maintainer).

## 2026-09-26 (repo review and issue fixes)

A full review of code, site, catalog data and docs filed issues #1 to #47; this run fixed
most of them on the `review-fixes` branch, one commit per issue or per interlocked group.

- **CI:** no push path filters (stacks-only pushes were neither validated nor deployed),
  Node 24 from `.nvmrc`, current action majors, Dependabot for actions, Pages calls
  `ci.yml` instead of repeating it, and a weekly link check (`links.yml`,
  `site/check-links.mjs`) that opens one `correction` issue. First run: 317 checked, none
  dead, moved or stale; 7 to 8 sites refuse robots.
- **Build and checks:** one frontmatter parser (`site/lib/frontmatter.mjs`) for build
  and validate, which had drifted; summaries keep literal `_` and `#` (five changed); the
  build fails on an unreadable entry instead of dropping it. New checks: V16 url scheme,
  V17 category sets (folders, config, issue form), V18 heading anchors, V19 retired
  spellings (`site/value-aliases.json`); real calendar dates (the shared `isRealDate` is
  from a contributor's PR, #48, merged first); Evidence dates inside URLs
  no longer count; a day of time-zone slack. Renderer: parens in link hrefs, misnested
  emphasis, unique heading ids.
- **Tooling:** `package.json` scripts (`npm run check`), `site/new-entry.mjs`,
  `site/sync-counts.mjs` (every restated count in one command).
- **Site:** word-start search with name and tag hits first, rows toggled rather than
  rebuilt, focus kept after removing a filter, `h4` card titles, contrast and touch
  targets, URL params validated, deferred scripts, a visible per-file note on Commercial
  OK, a folding filter panel on phones, back-to-results breadcrumb, 404 suggestions,
  sitemap link.
- **Catalog (metadata only):** removed the leaked `r04` tag (15 entries); merged
  subcategory synonyms (`tiles`, `pixel-art`, `ir`, `gui`, `base-mesh`, `public-domain`
  as a subcategory); one spelling for duplicate tags and formats; publisher on six
  entries; three URLs moved to durable pages.
- **Catalog (licence facts, re-read live 2026-09-26):** material-symbols,
  ms-building-footprints and microsoft-rocketbox no longer ask for on-screen credit;
  their licences (Apache-2.0, CDLA-Permissive-2.0, MIT) need the licence text kept, and
  none of the publishers asks for more. Two 2D fields set where the page says so
  (bondoki-rotating-gems 52x52, lpc-revised-basics 3/4 view).
- **Deliberately not changed:** `charge-materials` and `blender-ellie-poses` keep a bare
  `CC-BY`: Blender's card says only "CC-BY", and guessing a version would be a licence
  claim. Fonts are not self-hosted: that would commit third-party binaries. No check yet
  for notice-only licences marked credit-required: `nasa-3d-resources` would need its
  credit wording re-read first.
- **Still open for a person:** #3 (branch protection), #36 (licence and publisher tags),
  #37 (a canonical format list), #38 (category moves), #40 (re-verify needs-review
  entries), #41 (the rest of the 2D fields: the sources do not state them), #42, #43,
  #45, #47.
- **Search engines (2026-09-26):** the site is a verified URL-prefix property in Google
  Search Console (HTML file `site/public/google55e16d8bc56aeb36.html`; keep it) and was
  imported into Bing Webmaster Tools, where the sitemap read Success with 324 URLs.
  Submit the sitemap by its full URL: `/sitemap.xml` resolves to the host root and 404s.
- Also merged: #48 (a contributor's impossible-date fix, merged first) and closed #50
  (the same publisher change as #49). The link-check workflow ran once on GitHub: clean.
- Next highest-value action: the third full review on or after 2026-10-17. Check the
  Search Console sitemap row reads Success, and look at the ten open issues.

## 2026-09-25 (outreach)

Sub-project E, the items that reach outside the repo, each approved by the maintainer
first.

- **Repository description** set with `gh repo edit`, without the em dash: "Curated
  catalog of free, commercially usable game assets, libraries and tools. Each licence
  recorded from its source with the date it was read. Links only, nothing rehosted."
- **Pull requests opened**, one line each, placed alphabetically, disclosing that the
  maintainer runs the catalog: ellisonleao/magictools#418 (Graphics > Assets/
  Placeholders, +1), Kavex/GameDev-Resources#81 (Multiple Graphic Collections, +1),
  Calinou/awesome-gamedev#98 (Assorted Assets with reference 459, +4). The last list
  accepts only freedom-respecting material; the PR says the catalog links to sources
  under various licences and that its own metadata is CC0, and may be declined.
- **Still for the maintainer:** upload `docs/images/readme/og-card.png` as the social
  preview (Settings > General > Social preview); GitHub has no API for it.
- Also fixed: the entry pages spec now names `site/lib/lib.test.mjs` as the home of its
  renderer tests (`c9c2bb2`).
- Next highest-value action: **the third full review on or after 2026-10-17**. Check
  the three pull requests for maintainer comments before then.

## 2026-09-25 (README first screen)

Sub-project D from the site brainstorm, one commit (`d76ec59`), a bounded change agreed
in conversation (no spec).

- The top of the README now leads with one line on what the catalog is and what each
  entry records, then the routes: the site ("Browse 319 sources", still checked by the
  validator), the five starter stacks, the licence freshness page, the master index and
  the licence guide, and a dated "Recent" line. The image showcase moved below "Start
  here", unchanged.
- No counts or ages that go stale were added: the freshness figures stay on the site,
  which rebuilds weekly. The "Recent" line is updated by hand with each release.
- A claim was narrowed before commit: "each with its licence quoted from the source"
  holds only for `active` entries, so the line says every entry records the licence and
  the date it was read, and active entries quote the source.
- Measured on github.com at 1280x800 with the README scrolled to its top: the Browse
  link, all five stack links, the freshness link and the Recent line sit within the
  first 350px.
- Next highest-value action: **the third full review on or after 2026-10-17**. Sub-project
  E (social preview image, repo description, awesome-list submissions) needs the
  maintainer's own clicks; the text can be prepared on request.

## 2026-09-25 (licence freshness)

Sub-project C from the site brainstorm, built from
`docs/superpowers/specs/2026-09-25-licence-freshness-design.md` in five commits
(`241af04`..`749860a`). No catalog entry changed and no `verified` moved.

- **What shipped.** A line under the homepage hero, "Checked within 180 days: 317 of
  317. Older than a year: 0. Oldest check: 2026-07-19 (68 days). As of 2026-09-25",
  and `/freshness/`: the same line, the 76 entries checked on the build day or in the
  30 days before it, and every entry oldest first. A "Licence freshness" footer link on
  every page, a sitemap entry (324 URLs) and a line in `llms.txt`. The buckets are the
  cards' own; deprecated entries are not counted.
- **Weekly rebuild.** `pages.yml` also runs Mondays at 06:17 UTC, so the ages move when
  nothing is pushed. GitHub pauses schedules in a public repository after 60 days
  without activity; a manual run from the Actions tab restarts them.
- **Final review.** Two fixes in `749860a`: the homepage cards now age by the build time,
  like the prerender and the line (with the visitor's clock 60 days ahead a card read
  "128d ago" beside a line saying 68 days; now both say 68), and the recent-checks
  wording counts the build day. Three minors deferred: the "read at its source"
  sentence still prints if an entry lacks a date (the validator prevents that);
  `cancel-in-progress` lets a scheduled run and a push run cancel each other (the newer
  run publishes); an undated row has no chip style.
- **Measured.** Locally: the line's link opens the page; no sideways scroll at 375px and
  every table cell keeps its label; no text below AA in either scheme at 1280 and 375;
  the page is complete without JavaScript (76 recent, 317 rows); zero console errors.
  Live: `/freshness/` 200 with 317 rows, sitemap 324, the homepage line and the llms
  line present, the schedule on `main`.
- Next highest-value action: **the third full review on or after 2026-10-17**, when the
  61 entries checked on 2026-07-19 pass 90 days; rechecking them moves the freshness
  line. Then sub-project D, the README first screen.

## 2026-09-25 (recheck and deferred fixes)

Four commits (`849af07`..`b63e3c3`): the Smithsonian recheck, then the deferred minors
from the entry pages and starter stacks reviews, each fix with a test that failed first.

- **Smithsonian Open Access (`849af07`).** The Open Access pages load again in a
  browser; scripted requests now get 403. The Terms of Use CC0 and commercial-use
  quotes are unchanged, the FAQ's CC0 sentence is added, and `verified` moves to
  2026-09-25 on that reading.
- **Renderer and links (`ba8bf6e`).** Deprecation banners start the reason with a
  capital (freepd, purple-planet). Bare URLs stop at bold markers and code spans, keep
  a balancing paren, and `<url>` autolinks render. A malformed escape in a body link is
  a named error; a `?query` on a relative link is kept. A page diff against the previous
  build changed only the two banners.
- **Stack checks (`1b677aa`).** The licence check also catches OFL, GPL, CC BY, any-case
  cc0, public-domain and royalty free as whole words, and skips link targets. A BOM or
  trailing spaces no longer break the frontmatter. Build and validator read one list of
  stack files; a stack in a subfolder fails both. `llms-full.txt` gives credit lines.
- **Homepage and Copy (`b63e3c3`).** A malformed `#entry-` link no longer stops the
  homepage script; starter-table links save the scroll position (Back: 745 to 745);
  a refused clipboard makes Copy all select only the credit lines.
- Still open from the reviews: the card's verified-date tooltip sits under the stretched
  link; a broken link in a stack's why sentence or gap names no line; the entry pages
  spec's Testing section names `checks.test.mjs` for tests that live in `lib.test.mjs`.
- Next highest-value action: **sub-project C, visible trust**, per the brainstorm. Then
  the third full review on or after 2026-10-17.

## 2026-09-25 (starter stacks)

Sub-project A from the site brainstorm, built from
`docs/superpowers/specs/2026-09-24-starter-stacks-design.md` in seven commits
(`10151a9`..`3724fbb`). No catalog entry changed and no `verified` moved.

- **What shipped.** Five stacks in `stacks/`, one per task test: 2D pixel platformer,
  2D top-down pixel game, 3D low-poly arena in Godot, first-person destruction, mobile
  puzzle. Each has a page at `/stack/<id>/` with one pick per need and a "What this
  stack owes" panel computed from the picked entries. The homepage has a Starter stacks
  section, each picked entry's page lists "Used in", and the sitemap (323 URLs) and both
  llms files carry the stacks. Only the platformer stack owes a credit line (Eric
  Skiff), so only its page has Copy buttons.
- **Gates.** V15 (`site/checks.mjs`) runs in the validator and the build. It fails a
  pick that is missing, deprecated or malformed, and any title, task, lead, gap or why
  sentence that names a licence: a stack states no licence facts of its own. Proved by
  pointing a pick at `freepd`: both exit 1 naming `stacks/2d-pixel-platformer.md:18`.
- **Writing the stacks.** Every why sentence was checked against its entry; three were
  cut to the entry's own words (Bondoki's GIFs, VT323's uses, Tiled's "ortho"). The
  top-down stack's one gap restates task B's finding: no straight-down character set
  that turns in four directions (0 `top_down` entries tagged `4-directional`).
- **Final review.** Two findings fixed in `3724fbb`: the licence check now covers every
  line of prose in a stack, and four statements the entries do not record were removed
  (the platformer lead's credit claim and "drawn for a side view", which the UI pack is
  not; "works in any engine" twice; "match and combo effects"). Seven minors deferred:
  short licence names such as "OFL" pass the check; link targets inside a why sentence
  are scanned; a BOM on the frontmatter line gives a misleading error; the Copy all
  fallback selects labels as well as credit lines; the validator walks `stacks/`
  recursively while the build reads the top level; a broken link in a why sentence
  names no line; `llms-full.txt` lists credits by entry name without the line.
- **Measured.** Locally: five homepage links 200, Copy passes the credit line to the
  clipboard, pages complete without JavaScript, no sideways scroll at 375px, no text
  below AA in either scheme, zero console errors. Live: five stack pages 200, sitemap
  323 URLs, `## Starter stacks` in `llms.txt`, three "Used in" links on Kenney UI Pack,
  homepage link to the platformer page and its Copy button work.
- Next highest-value action: **sub-project C, visible trust** (freshness panel,
  recently added and re-verified lists), per the brainstorm. The Smithsonian recheck
  and the third full review on or after 2026-10-17 still stand.

## 2026-09-24 (entry pages)

Sub-project B from the site brainstorm, built from
`docs/superpowers/specs/2026-09-24-entry-pages-design.md` in eleven commits
(`fee59c1`..`a5403a4`). No catalog entry changed and no `verified` moved.

- **What shipped.** Every entry has a page at `/entry/<id>/` with its full body, a facts
  panel, the credit line with a Copy button, and links to the source, the file on GitHub
  and a prefilled correction issue. Deprecated entries get a banner and `noindex`. The
  sitemap lists 318 real pages. `llms.txt` and `llms-full.txt` index the 317 visible
  entries. Homepage cards are now whole-card links; the entry dialog is gone and old
  `#entry-<id>` links redirect to the page.
- **Gates.** The build fails, naming the file and line, on markdown the renderer does not
  support or on a relative link to a missing file. It also checks every generated page
  for leaked markdown, one `h1`, a canonical link and links that resolve. Tests:
  `site/lib/lib.test.mjs`, 101 assertions, run in both workflows.
- **Measured locally.** Card corner click and touch tap open the page. Back restores the
  filter and scroll position (difference 0), and a fresh visit starts at the top. No
  sideways scroll at 375px. No text below AA contrast in either scheme. Zero console
  errors. Pages work without JavaScript.
- **Final review.** Four findings fixed in `a5403a4`, each with a test that failed first:
  escaped quotes showed as `\"` on four evidence pages; the ccmixter credit line copied
  with backslashes (a frontmatter parsing bug that predates this work); `llms-full.txt`
  had repo-relative links and cut summaries; the scroll position came back on an
  ordinary link to the homepage. Seven minor findings are deferred: bare-URL edge
  cases no entry uses yet; a malformed `%` stops the homepage script (in an `#entry-`
  link) or crashes the build without a file name (in a body link); the freepd banner's
  reason starts in lower case; starter-table links do not save the scroll position; the
  card's verified-date tooltip sits under the stretched link; the spec's Testing section
  names `checks.test.mjs` where the renderer tests live in `lib.test.mjs`.
- **Measured live.** `/entry/kenney-ui-pack/` 200 with its Notes; sitemap 318 URLs;
  both llms files 200, `llms-full.txt` with 0 relative links; the old-link redirect,
  card click and touch tap all work on the deployed site.
- Next highest-value action: **sub-project A, starter stacks**, from the same brainstorm.
  The Smithsonian recheck and the third full review from the previous section still
  stand.

## 2026-09-24 (three more batches)

The previous section's next action, then two chosen on the maintainer's "your call".

- **E, Google Fonts (`4af52bf`).** Each family's `OFL.txt` in `google/fonts` names "The
  <family> Project Authors", never Google Fonts. `publisher` removed from six fonts; each
  entry now quotes its exact copyright line (the notice OFL requires you to ship) and the
  designer from Google's `METADATA.pb`. `material-symbols` became `Google` (its README:
  "official icon sets from Google"). V7 now treats Google Fonts as a distributor.
- **F, link sweep (no catalog change).** All 319 URLs fetched: 305 return 200, none
  redirect to another domain. The 14 others are the known bot blocks plus Pexels and
  Pixabay video; all load in a browser except one. **Smithsonian Open Access returns a
  server error (500)** on `/openaccess` and `/openaccess/faq` while `si.edu` itself is
  up: a section outage, not a dead link. Entry unchanged; recheck next run. Results in
  `_scratch/reviews/linkcheck-2026-09-24.json`.
- **G, relative dates (`e21d7be`).** 78 notes in 62 entries said "this session", "this
  run" or "this pass". Each now carries the author date of the commit that wrote it,
  taken with `git blame` in the author's timezone; that matched every date already in
  the same lines. A first pass used UTC and was off by a day for evening commits, caught
  before writing. No quotation changed and no `verified` moved.
- Pre-existing em dashes remain in many older entries. They predate the review passes and
  the style rule's threshold treats them as reported, not defects; a mechanical sweep
  would rewrite prose in over a hundred files and is left to the maintainer.
- Next highest-value action: **recheck Smithsonian Open Access**; if `/openaccess` still
  errors at the next run, note it in the entry and look for the current URL. Then the
  third MODE=full review on or after 2026-10-17.

## 2026-09-24 (four batches)

The previous section's next action, then three more. One commit per batch.

- **A, older OpenGameArt downloads (`4c8e212`).** The four OGA entries added before
  2026-09-23 had their downloads opened. No licence file contradicted a page, but two
  entries were wrong:
  - `congusbongus-footsteps-surfaces`: the credit line named only congusbongus, while the
    pack's own `license.txt` files credit six CC BY 3.0 Freesound authors; `formats` said
    WAV (it is 78 OGG files); the surface list claimed snow, which is not in the pack.
  - `lpc-revised-basics`: all 39 items in the bundled Credits files are OGA-BY, so the
    no-share-alike option covers everything; `commercial` was `varies` though all three
    offered licences allow commercial use. Now `true`, with the page's seven authors in
    the credit line.
- **B, OpenGameArt as publisher (`bf54aa2`).** CONTRIBUTING said "never the host" and
  listed OpenGameArt as a publisher group in the same paragraph. Removed from four
  entries; V7 now rejects it as a generic host, and skips the one-publisher-per-domain
  rule on opengameart.org and archive.org, where each upload has its own rights holder.
- **C, Envato's Acceptable Use and Fair Use policies (`0c13437`).** The last unread
  documents behind the Mixkit entries. Relevant to games: no AI training on assets; no
  content promoting the supply of weapons or gambling; assets depicting "sensitive
  topics" only for educational, informational, journalistic or advocacy use; and a
  "looks or feels like" catch-all. Games are not named. `mixkit-stock-video` unchanged.
- **D, re-audit (`a7712f7`).** Everything since the second full run passes the audit
  script. One real finding: V13 never checked `tags`, and seven singular/plural clash
  groups had built up (one from yesterday's own work). Fixed on 7 entries; V13 now covers
  `tags`; site search lets a plural query match a singular tag so nothing is lost.
- **Recorded, not changed:** `publisher: Google Fonts` on seven fonts. Google Fonts
  distributes fonts whose copyright usually sits with the designers, which reads like the
  "distributor that does not hold the rights" CONTRIBUTING rules out; but Google
  commissions some families. Deciding needs each font's copyright line, not a blanket
  rule.
- Next highest-value action: ~~**read the copyright line of each Google Fonts entry**~~
  Done as batch E in the section above. And
  set `publisher` to the holder it names, or unset it where the holder is a project of
  many authors. Then the third MODE=full review on or after 2026-10-17.

## 2026-09-23 (parallax and gems)

The previous section's next action: a layered parallax source, then match-3 gems. One
commit, `5bd86a1`. Entry count 315 to 319 (2D 54). **Both new task tests now pass.**

- Added, each archive downloaded to measure it and to read any bundled licence:
  `ansimuz-industrial-parallax` and `gustavo-saraiva-city-parallax` (publisher-stated
  parallax layers, both CC0), `bondoki-rotating-gems` and `sylly-gem-match-3` (match-3
  gems, both CC0). The two parallax sets carry `camera_perspective: side_scroller`.
- **New lesson, from a rejected candidate:** GrumpyDiamond's Parallax Mountain Background
  shows CC0 on its OpenGameArt page, but the licence file inside its download says
  "cc-BY-3.0" and asks for credit. Not added. The OGA licence field is the uploader's
  claim; a bundled licence file can contradict it, and only opening the archive shows
  that. Every OGA entry added in this session had its download opened (Bondoki ships loose
  GIFs with no licence file, which the entry says); older OGA entries
  were not, and are worth the same check.
- Also rejected: CraftPix's OGA parallax sets (OGA-BY 3.0, credit required, and listed as
  teasers for paid packs) and "3 Parallax Backgrounds" (GPL 3.0, which is a poor fit for
  art in a closed game).
- `publisher` left unset on the four OGA entries: two existing opengameart.org entries
  carry `publisher: OpenGameArt`, and V7 requires one publisher per domain.
- Next highest-value action: ~~**open the archives of the older OpenGameArt entries**~~
  Done as batch A of the 2026-09-24 section above. And
  compare any bundled licence file with the licence field, following the GrumpyDiamond
  finding. The OGA entries added before today were checked against the page only. Then
  the third MODE=full review on or after 2026-10-17.

## 2026-09-23 (new task tests)

The previous section's suggestion: walk tasks the catalog had not been tested against.
One commit, `6990bea`. Entry count 310 to 315 (2D 50, Audio 30).

- **Task D, a 2D pixel platformer: passes, with two soft spots.** Seven side-scroller
  packs, animated characters and enemies, Tiled and LDtk, pixel fonts, SFX generators.
  Leave points: no chiptune music ("chiptune" found only the SFX generators), and no
  source whose publisher states it includes parallax background layers.
- **Task E, a mobile puzzle game: failed on the core art.** UI, UI sounds, particles and
  fonts were covered, but "puzzle", "casual", "gem" and "dice" returned nothing relevant
  and "card" returned nothing card-game related.
- Added, each licence read at source and each archive downloaded to the scratchpad to
  measure its contents (nothing but metadata committed): `kenney-puzzle-pack-2`,
  `kenney-playing-cards-pack`, `kenney-boardgame-pack` (all CC0),
  `subspaceaudio-5-chiptunes` (CC0, confirmed by the author's own `INFO.txt` as well as
  the OGA field) and `eric-skiff-resistor-anthems` (CC-BY 4.0, games named, credit line
  stored). Every gap search now returns a real source.
- **Stated limits:** Puzzle Pack 2 is brick-breaker and pipe art, not match-3 gems; the
  entry says so. The Kenney `puzzle-pack` URL is a 404; "Puzzle Pack 1" exists and was not
  added.
- **Parallax is still open.** Sunny Land's comments say its backgrounds suit parallax, but
  its own feature list does not mention backgrounds, so no tag was added. Commenters are
  not evidence.
- Caught before commit: "the kind that fill mobile stores" (marketing voice), "title
  themes, level tracks and slower pieces" for an album not listened to, and "smooth
  vector style" inferred from an SVG folder. All removed or reduced to what was measured.
- Next highest-value action: ~~**a layered parallax background source**~~ Done in the
  parallax and gems section above, with match-3 gems. The one leave
  point left from task D. Look for a publisher-stated CC0 or CC-BY set of separate
  background layers; if none states it, record the gap rather than tagging a pack on a
  commenter's word. After that, match-3 gem art for task E.

## 2026-09-23 (binding documents)

The previous section's next action: read the full Pixabay Content License and the Mixkit
User Terms. One commit, `71a5abc`, four entries.

- **Pixabay:** the full licence is section 5 of the Terms of Service (the old
  `/service/license/` URL now redirects to the summary). The grant is irrevocable,
  worldwide and royalty-free, to "download, use, copy, modify or adapt". Games are never
  named. What carries a game is the Standalone definition: content combined with other
  media into "a 'new' creative work" is not standalone. The entries and the guide now
  state that as the basis rather than asking the reader to confirm it.
- **New Pixabay facts:** content published before 9 January 2019 is CC0 (section 4); the
  prohibited uses include political contexts and portraying people as ill, which matters
  for stock faces in horror or hospital scenes. `pixabay-audio` verified moved to today
  with three dated quotes.
- **Mixkit User Terms:** 18 or over only; no mass downloading or scraping; nothing "on a
  stock or inventory basis"; copies sold only after alteration and combination. **Nothing
  about games**, so `mixkit-stock-video` stays `needs-review`: the terms neither add the
  word nor exclude games.
- Still unread: Mixkit's Acceptable Use Policy, which the User Terms bind items to.
- Next highest-value action: **none that needs doing now.** The one unread document is
  Mixkit's Acceptable Use Policy, a conduct policy unlikely to move either Mixkit entry.
  The next substantive run is a **third MODE=full review on or after 2026-10-17**, when
  the 73 entries verified in July cross 90 days and the age distribution first changes.
  Until then, new sources are the best use of a pass: pick a task the catalog has not
  been tested against (a 2D platformer, or a mobile puzzle game) and walk it the way the
  first run walked its three.

## 2026-09-23 (video sources)

The previous section's next action: `video`, one entry. One commit, `8f3955b`. Entry
count 305 to 310; `video` 1 to 6.

- Added, each licence read at source in a browser today: `pexels-videos`,
  `pixabay-videos`, `coverr` (all `active`), `mixkit-stock-video` and
  `prelinger-archives` (both `needs-review`).
- **No video source names games.** The three `active` ones are general grants (use,
  copy, modify, commercially, no credit) whose exclusions do not touch shipping inside a
  game; each entry says that is the basis, rather than claiming a games sentence exists.
  Pexels at least names apps.
- **Mixkit is the catalog's clearest game-versus-video case.** On one licence page, the
  Sound Effects Free License lists "Video games" and the Stock Video Free License does
  not. Stock video stays `needs-review` on that omission alone; the guide now cites the
  pair instead of the stale "Mixkit is video-first" line.
- **Prelinger:** the archive's own FAQ says "DO NOT ASSUME" its films are public domain.
  Only films carrying the Creative Commons public-domain dedication are free; 28 of the
  30 most-downloaded carry it (Internet Archive search API). Credit is "delighted if",
  neither required nor waived, so `attribution_required` is `unknown`.
- Caught before commit: Coverr was first described as "smaller than Pexels" and "skewing
  towards lifestyle", then as the only source with an AI rule; Pexels "provides no
  releases"; Pexels "the largest library". None was read at a source, and Pexels' terms
  ban scraping for machine learning too. All removed or reworded.
- Not read, and named in the entries: the Mixkit User Terms (cited by both Mixkit
  licences as holding "important limits"), and the full Pixabay Content License (the page
  rendered no licence body; the entries quote the summary).
- Next highest-value action: ~~**read the two binding documents the entries could not:**~~
  Done in the binding documents section above.
  the Mixkit User Terms and the full Pixabay Content License. Both licences point to them
  for limits, and between them they govern four entries (`mixkit-sfx`,
  `mixkit-stock-video`, `pixabay-audio`, `pixabay-videos`). Either could settle Mixkit
  video's games question, or add a restriction to the three entries now marked `active`.

## 2026-09-23 (maintainer decisions)

The maintainer took the recommended default on all three open decisions. One commit,
`13a67e3`. **Nothing is parked any more.**

- **`og:image`:** `docs/images/readme/og-card.png`, a 1200x630 screenshot of the site's
  first screen (57 KB), taken from the live page with the scrollbar hidden and only whole
  table rows showing. `build.mjs` copies it into `dist` and emits `og:image` (with size
  and alt), `twitter:card` `summary_large_image` and `twitter:image`; without the file it
  falls back to the old summary card. Retake it when the hero changes (noted in
  `site/README.md`).
- **`data.json`:** kept and documented in `site/README.md` as the public JSON: top-level
  keys, entry fields, regeneration on every push, and the caveat that licence facts are
  as current as each `verified` date.
- **`camera_perspective` / `grid_dimensions`:** 2D and UI only, stated in TEMPLATE and
  CONTRIBUTING. All 52 entries that set either field are in `2d`, so no data changed.
- Next highest-value action: ~~**`video`, the one category that fails any task test.**~~
  Done in the video sources section above. It
  has a single entry (`destockd`, a deliberate seed per the first run). A developer
  wanting free stock footage for a trailer, a menu background or an in-game screen has
  to leave the catalog. Source 3 to 5 candidates, opened and quoted, with the
  game-versus-video distinction from `docs/game-vs-video-licensing.md` in mind: a clip
  licensed for YouTube is not automatically licensed to ship inside a game.

## 2026-09-23 (formats cleanup)

The previous section's next action: `formats` values that are not formats. One commit,
`40a6010`, 20 entries.

- Removed where real formats were already listed: `many`, `runtime`, `shaders`,
  `spreadsheet`, `Kinect`, `model` (beside `ONNX`), `config`, `examples`, `binary`.
- Software with no file format of its own now names a **delivery type**: `desktop-app`
  (5 entries), `mobile-app`, `cli` (2); `JS API` became the `JavaScript` target.
- Moved to `tags`: `windows`, `macos`, `ios`, `heightfield`, and `variable` as
  `variable-font` on 5 fonts (Inter's existing `variable` tag renamed to match).
- CONTRIBUTING now defines four kinds of `formats` value (file formats, engine or
  language targets, delivery types, `various` for aggregators) and no longer claims every
  extension is upper case, which `gdshader`, `tmx` and `ktx2` already contradicted.
- Nothing invented: Gaea and Piper name no output format in their entries, so they get a
  delivery type rather than a guessed file type.
- Not enforced by a check. The delivery-type list is short and could become a V13-style
  vocabulary later if it drifts.
- **The review queue is now empty of work that does not need the maintainer.** What is
  left is three decisions, carried since the first run.
- Next highest-value action: ~~**the three maintainer decisions**~~ Taken in the section
  above, all at the recommended default. With a recommended
  default for each so a yes is enough:
  - `og:image`: a first-party 1200x630 PNG of the site under `docs/images/readme/`, the
    path the validator already allows for first-party stills. Hard rule 3 covers
    third-party binaries, not the project's own screenshot.
  - `data.json` (297 KB, unused by the page): keep it and document it in `site/README.md`
    as the catalog's public JSON endpoint. Removing it breaks anyone already using it.
  - `camera_perspective`: keep it 2D-only, and say so in TEMPLATE. `characters` and `3d`
    have no perspective in the 2D sense, and the View filter already explains itself.

## 2026-09-23 (plural subcategories)

The previous section's next action: the five singular/plural subcategory pairs. One
commit, `48d3d4d`, because the stricter check fails without the data fix.

- Kept the more common form of each, changing 15 entries: `characters` (9 over 7),
  `environment` (32 over 4), `interior` (7 over 1), `tileset` (8 over 2), `vectors` (2
  over 1). The `characters`/`character` split was close; it is recorded in CONTRIBUTING
  so the next contributor does not reopen it.
- **V13 now folds a trailing "s".** Checked first against every `formats` and
  `subcategories` value in the catalog: the only hits were these five pairs, so no false
  positives today. One fixture added (52 assertions); a mutation on a real entry
  (`kaykit-character-animations` back to `character`) fails the validator.
- Process note: the mutation test was reverted with `git checkout`, which also reverted
  the uncommitted fix in that file. Caught by re-reading the file before commit. Revert a
  mutation with the inverse edit, not a checkout, while other changes are uncommitted.
- Next highest-value action: ~~**the `formats` values that are not formats**~~ Done in
  the formats cleanup section above. (`examples`,
  `many`, `runtime`, `windows`, `macOS`, `iOS`, `library`, `binary` and similar). Move
  each to `tags` where it carries meaning, delete it where it does not, and say in
  CONTRIBUTING that platforms are tags. Small, but they show up in the search haystack and
  on entry pages as if they were file types.

## 2026-09-23 (Search button)

The previous section's next action: make the floating button land where it focuses. One
commit, `4c4a111`.

- The button said "Top", scrolled to the page header, then focused the search box about
  1,600px lower. It is now **"Search"**: it scrolls to the catalog section and focuses the
  box with `preventScroll`, so there is one scroll and the focus is on screen.
- Checked at 1280x900 with and without reduced motion, 375x800 and 800x400: search box on
  screen and focused every time, and typing filters immediately ("kenney", 54 of 305).
- Not changed: the button stays visible while the search box is on screen, because it
  shows by scroll depth (600px) and the catalog starts below that. Cosmetic.
- Next highest-value action: ~~**settle the five plural subcategory pairs**~~ Done in
  the plural subcategories section above.
  (character/characters, environment/environments, interior/interiors, tileset/tilesets,
  vector/vectors) by majority use, then let V13 fold a trailing "s" so a new variant
  cannot return. Check the check against the whole catalog before trusting it: plural
  folding is where false positives would come from.

## 2026-09-23 (after the second full run)

The second full run's next action: the sticky filter panel on phones. One commit
(`0585922`, labelled batch E in the log; it is a site fix, not the prompt's additions batch).

- **Fixed.** On screens up to 640px wide or 600px tall the panel scrolls away with the
  page instead of pinning. Measured in touch emulation: at 375x800 the entries went from
  about 270px of screen to all 800px; at 800x400 (a phone on its side) they get all 400px
  (the old figure there was not measured). Desktop is unchanged: sticky, 228px.
- The panel's height also fed `--sticky-h`, which reserves space above permalink and
  category-jump targets. On phones that reserved 527px of empty space above the target.
  `app.js` now publishes 0 when the panel is not sticky: `#entry-` permalinks land 16px
  from the top on both small layouts.
- The Top button is now how a phone user gets the filters back. Checked: it returns with
  the search box visible and focused.
- **Found, not fixed (pre-existing, same on the live site):** on desktop, Top scrolls to
  the page header but focuses the search box about 1,600px further down, off screen. A
  keyboard user who then types is typing into a field they cannot see.
- Next highest-value action: ~~**make Top land where it focuses.**~~ Done in the Search
  button section above. Either scroll to the
  catalog controls rather than the page top, or stop moving focus. A few lines in
  `app.js`, and it is the last interaction defect on record. After that, the plural
  subcategory convention (five pairs) from the second full run.

## 2026-09-23 (second full run)

The fifteenth pass's next action: a fresh MODE=full run, measured from zero. Findings in
`_scratch/reviews/2026-09-23-findings.md`; thresholds were written there before any
script ran.

- Measured: 305 entries (275 active, 28 needs-review, 2 deprecated); commercial true 274,
  unknown 20, varies 9, false 2; 22 licence values, all in the vocabulary. Required fields
  305/305. `license_spdx` 239, `publisher` 135. Every `verified:` under 90 days (the 73
  July dates cross 90 on 2026-10-17). Every entry reaches `data.json` with no field
  dropped, and every entry has a listing row. Validator, build and tests exit 0.
- **No licence defects found.** 26 "commercial but mentions non-commercial" keyword hits
  were read by hand; all were "commercial and non-commercial" phrasing.
- Contrast measured on the live site in both schemes: 2,968 text nodes each, none below
  AA. Dialog focus trap, Escape and focus return pass. No horizontal scroll at 375px.
- Executed, one commit each, in the order A, C, B, D so B's checks ran clean:
  - **A** (`a1b0ccb`): 4 `formats` case clashes (6 entries) and 4 `subcategories` pairs
    (4 entries) normalised; CONTRIBUTING now states a spelling convention for both
    fields, which had none; em dashes removed from 2 entry lines added by review passes
    and from the site tagline, hero and footer.
  - **C** (`e420bdc`): `godotsteam` custom to **MIT** and active, read on Codeberg in a
    browser; the Steamworks SDK is stated as Valve's separate agreement. `vroid-studio`
    attribution unknown to false, from Article 13 of pixiv's VRoid Studio terms.
  - **B** (`766e6b7`): **V13** rejects `formats`/`subcategories` values that differ only
    by case or punctuation; **V14** rejects `unknown` licence, commercial or attribution
    on an `active` entry. 51 assertions across 14 checks; both also proved by mutating
    real entries.
  - **D** (`ff120aa`): nav and entry title links 20px to 44px on touch screens, via inline
    padding, so the layout does not move.
- **Correction to the audit:** it listed "active entries may lack Evidence" as a
  validator gap. `validate.mjs` already enforces that; only the `unknown` half was real.
- **New defects found while executing, deferred by the no-scope-growth rule:**
  - **The sticky filter panel covers two thirds of a phone screen**: 527px of an 800px
    viewport, pinned while scrolling, leaving about 270px for entries. Desktop: 228px.
  - Five plural subcategory pairs (character/characters, environment/environments,
    interior/interiors, tileset/tilesets, vector/vectors). A convention call.
  - `formats` values that are not formats (`examples`, `many`, `runtime`, `windows`,
    `macOS`, `iOS`, `library`, `binary`).
- Still needs the maintainer: `og:image` hosting, whether `data.json` (297 KB, unused by
  the page) is a public endpoint, the two `camera_perspective` scope questions.
- Next highest-value action: ~~**fix the sticky filter panel on phones.**~~ Done in the
  section above. It is the one
  finding that makes the live site worse to use for everyone on a phone, and the fix is
  contained: collapse the panel on small screens or stop it sticking there.

## 2026-09-23 (fifteenth pass, same session)

The fourteenth pass's next action: clear the bot-blocked backlog with a real browser
(Playwright). Batch U, one commit.

- **All 12 first-pass URLs load in a browser.** None is dead. `cloudcompare` still
  answers 403 first and then serves the page after a challenge; the rest return 200.
  The 403/454 results in the first pass were bot blocks, as recorded.
- **`tenacity` resolved: `GPL-2.0-or-later`.** `LICENSE.txt` says "GNU GPL Version 2"
  with no election; the project README says "either version 2 of the License, or (at
  your option) any later version". A project-authored README sentence is exactly the
  evidence the second pass's parked rule accepts. The last unconfirmed GPL value is gone.
- **`musopen` resolved to `varies`, and the Wayback 404 is explained:** the licence URLs
  no longer exist. Licences are per recording. On Chopin's Op. 9 page, five recordings
  link the Public Domain Mark and one links CC BY-NC-SA 3.0. The site Terms of Use also
  carry a boilerplate "personal, non-commercial" clause for site materials; the entry
  reports it rather than resolving it. Stays `needs-review`.
- **`vroid-studio` promoted to `active`, `commercial: true`.** pixiv's guidelines allow
  commercial use including "games", state the base content "is not CC0", and bar
  building a character creator from VRoid output. The Terms article they cite was not
  found on pixiv's policies page, so `attribution_required` stays `unknown`.
- **`scan-the-world` is now `commercial: false`.** MyMiniFactory's Terms allow downloads
  "solely for your own non-commercial use" absent an agreement with the design's owner.
  No per-object licence rendered, so `license` stays `unknown`, `needs-review`.
- **Mixkit's licence was readable without accepting cookies.** The text is in the page
  behind the consent dialog. The twelfth pass's "accepting cookies is the owner's call"
  turned out not to be needed. The licence names video games, bans standalone
  redistribution "in a tool or template", and bans registering sounds with a rights
  management service. The audio README's "unchecked" Content ID line now quotes it.
- `verified:` moved on five entries, each with a dated Evidence quote from a page read
  today. `godot-shaders` and the other loading URLs kept their dates: they loaded, but
  their licence text was not re-read.
- Tooling note: a leftover `serve` process from the fourteenth pass locked `site/dist`
  and broke the build with EPERM. Stop preview servers by process, not only the task.
- Still open, and needing a person rather than a browser: the two `camera_perspective`
  scope questions, `og:image` hosting, and whether `site/dist/data.json` is a public
  endpoint. Smaller: VRoid's credit terms, Musopen's ToS clause, Scan the World's
  per-object licences.
- Next highest-value action: ~~**a fresh MODE=full run of the review prompt.**~~ Done in
  the second full run above. Fifteen
  passes have run against measurements taken on 2026-09-22 at 294 entries. The catalog is
  now 305 entries with new checks, guides and a changed site; re-measuring from zero is
  how the next pass avoids optimising against stale numbers.

## 2026-09-23 (fourteenth pass, same session)

The thirteenth pass's next action: re-run the first pass's task test. Same three tasks,
walked from the site search and the category guides, recording each point where a
stranger would leave.

- **Task A, 3D low-poly arena with rigged characters and impact SFX in Godot 4: no leave
  point.** Arena, characters, clips, first-person arms, weapons, impact SFX, UI, prompts,
  font, music and Godot add-ons are all `active`, and all but Mixamo and Sonniss are
  CC0/OFL/MIT. Friction, not a gap: the arms are FBX and `.blend` only, so they go through
  Blender before Godot, and the entry says so.
- **Task B, 2D top-down pixel game with UI, prompts and a terminal font: passes, but the
  View filter misled.** Both 4-directional CC0 character sets (`ninja-adventure`,
  `armm1998-zelda-like`) are `isometric_3_4`, so a stranger choosing View "Top-down" saw
  tiles and vehicles and no character that turns. Labels now say "Top-down, straight
  down" and "3/4 top-down, walls visible".
- **Task C, first-person destruction with debris materials, industrial props and
  ambience: passes by the fracture route.** Arms, fracture tools, industrial kits and
  ambience are found. **Leave point found and fixed:** searching "concrete" returned
  nothing, because no texture library named a material. Five libraries whose own pages
  list concrete, metal and brick now carry those tags; ShareTextures gets `metal` only,
  the one of the three its page shows. Texture Ninja and TextureCan were not tagged: one
  page showed none of the words, the other refused the request (406).
- **The biggest leave point was the site, not the catalog.** Search matched the query as
  one exact substring, so "first person", "top down" and "low poly" all returned zero
  while `first-person`, `top-down` and `low-poly` tags existed. Every task hit it. Now
  words match independently, hyphens read as spaces, and the perspective is searchable.
  Checked in a browser against the built site: "first person" 3, "top down" 14, "low
  poly" 15, "concrete" 5, no console errors. Bag-of-words matching is looser: "first
  person" also returns ccMixter, whose summary has both words. Accepted.
- Stale cross-reference fixed: the Toon Shooter entry still called itself the closest
  thing to first-person arms. It and the guns pack now link the arms entry.
- Batch T, one commit. `verified:` untouched throughout: tags and search are not licence
  facts.
- Deferred, unchanged: `tenacity`'s licence, the two `camera_perspective` questions,
  Mixkit's licence text, and the first pass's 12 bot-blocked URLs.
- Next highest-value action: ~~**clear the bot-blocked backlog with a real browser.**~~
  Done in the fifteenth pass above.
  `tenacity` (Codeberg 403), Mixkit (cookie wall; whether to accept cookies to read it
  is still the owner's call), and the 12 URLs that returned 403/454 in the first pass have all
  waited on "a browser-based check". This session has one.

## 2026-09-23 (thirteenth pass, same session)

The twelfth pass's next action: the two task-test gaps. **Both now have entries.**

- **Batch S, first-person arms:** `characters/oga-fps-arms-rigged` (CC0, OpenGameArt,
  2015). Measured from the FBX: clavicle to hand on both sides, three-segment fingers and
  thumbs, `hand.L.control` / `hand.R.control` IK handles. No animations beyond a rig test,
  FBX and `.blend` only. Weak art, but it is the only rigged first-person arms source that
  checked out. **Rejected:** OGA "Low Poly FPS Rifle and Hands" (CC0, 2022) has one joint
  and static hands; a CC-BY 4.0 arms pack was not opened and is not listed.
- **Batch S, debris:** no free pre-fractured rubble pack turned up (Poly Haven has none),
  and fracturing your own meshes is the normal route, so the catalog lists the tools:
  `blender-cell-fracture` (GPL-3.0-or-later, from the extension manifest),
  `godot-destruction-plugin`, `voronoishatter`, `godot-voxel-destruction` (all MIT). The
  Godot 4 add-ons table gained three maintenance rows and a paragraph on the two routes.
- **Stated as inference, not fact:** VoronoiShatter's README names no Godot version; "4.4+"
  comes from the `.uid` files it ships. Voxel Destruction's optional Rust setup "will use
  prebuilt binaries" that are in neither the repository nor the release, so the entry says
  to find where they come from first.
- **Caught before commit:** a Notes line claimed the Cell Fracture page shows a bare
  "GPL-3.0"; the page says "v3.0 or later". Removed. The Jummit README's CC0 header was
  first read as a README-only licence; the README actually splits the repository, code MIT
  and all other files CC0. Rewritten to say so.
- Not added: `ZachAR3/Destructibles-CSharp` (MIT, needs Godot .NET, no releases). The
  Cell Fracture entry cites its 5 to 50 piece guidance.
- Deferred, unchanged: `tenacity`'s licence, the two `camera_perspective` questions,
  Mixkit's licence text.
- Next highest-value action: ~~**re-run the first pass's task test end to end.**~~ Done in
  the fourteenth pass above. Every gap it
  found now has an entry or a guide; re-running it is the check that those answers hold
  up, and whatever still fails becomes the next batch.

## 2026-09-23 (twelfth pass, same session)

The eleventh pass's next action: `audio/sfx`. **Every cluster measured in the seventh pass
now has decision support.**

- **Batch R: "Choosing sound effects"** in `catalog/audio/README.md` (14 SFX sources, 4
  impulse-response packs), sorted by job, with the restrictions beyond credit that
  actually differ: Sonniss is media-production-only and bans AI training; Zapsplat's free
  tier is MP3 only; BigSoundBank's CC0 covers only files marked "Free and Royalty Free".
- **The open question is answered: Content ID does reach sound effects, indirectly.**
  Freesound's FAQ explains it: musicians register songs containing raw sounds from free
  libraries, so later videos using the same raw sound get matched, and processing a sound
  makes a match less likely. Zapsplat's licence acknowledges mistaken automated claims.
  The mechanism works on any widely downloaded sound, CC0 included.
- **Impulse responses:** shipping changes what you owe. Runtime convolution ships the IR
  file; Adventure Kid asks for credit when its IRs are redistributed "in software".
- **Two claims caught before commit.** The table attributed a no-redistribution term to
  Mixkit that is not on record. And Fesliyan's music policy (no YouTube monetisation, no
  livestreaming) was nearly attributed to its sound effects; that page is the music policy,
  and the separate SFX policy has none of those restrictions. **Lesson:** on a site that
  sells two things, find the policy for the thing you are cataloguing.
- **Unchecked, stated as unchecked:** Mixkit's licence text would not load behind a cookie
  consent dialog, and accepting cookies to get past it is not a review pass's decision.
  The README says "unchecked", not "not addressed".
- README "Start here" now links ten guides, including both audio ones.
- Deferred, unchanged: `tenacity`'s licence, the two `camera_perspective` questions,
  Mixkit's licence text.
- Next highest-value action: ~~**the two task-test gaps still unsourced since the first
  pass: rigged first-person arms, and rubble / pre-fractured debris geometry.**~~ Done in
  the thirteenth pass above. The
  decision-support work is done; the catalog still cannot answer those two requests at
  all, and they came from the task test tied to the owner's own work.

## 2026-09-23 (eleventh pass, same session)

The tenth pass's next action: music. Two commits, one of them fixing a regression of my
own.

- **Batch Q: "Choosing game music"** in `catalog/audio/README.md`, sorted by the two
  questions that decide it: is a credit owed, and will videos of the game be claimed.
- **The finding: Content ID lands on your players, not on you.** Only one of twelve music
  entries mentioned Content ID. Checked at each source: Incompetech's own page says claims
  follow when "the credit was placed in the video itself" rather than in the description
  text, so an in-game credit satisfies the licence but not YouTube, and every streamer
  needs the description credit. Pixabay's own guide says "many music composers, including
  those that share their work on Pixabay, have their content digitally fingerprinted",
  flaggable but not always flagged. ENDE forbids anyone registering its tracks. Soundimage,
  Tallbeard and Kenney say nothing; the table says "not addressed", which is not the same
  as safe. Notes added to three entries; no `verified` dates moved (not licence text).
- Pixabay blocks scripts, so its pages were read in a real browser. Worth remembering for
  other 403 sources: a browser read is still a primary-source read.
- Index fixes: the heading "Music (attribution usually required)" was false (four of six
  active sources owe nothing), and Zapsplat's † footnote sat under the wrong table.
- **Regression fixed: V11 had been checking only the first listing table in each category
  README since batch K.** Audio has three, tools has seven, so six tools sections and two
  audio sections were unchecked. Proved by reverting the mod-loader row to MIT, which
  validated clean. V11 now reads every `| ID |` table, with a fixture that puts drift in a
  second table. The widened check found no drift in the tables it had been skipping.
  **Lesson:** batch K proved V11 against single-table READMEs only. When a check changes
  how it finds its input, test it on the unusual shapes, not the common one.
- Deferred, unchanged: `tenacity`'s licence, the two `camera_perspective` questions.
- Remaining measured cluster: `audio/sfx` (14).
- Next highest-value action: ~~**`audio/sfx`**~~: done in the twelfth pass above, which
  also answered whether Content ID reaches sound effects (it does, indirectly).

## 2026-09-23 (tenth pass, same session)

The ninth pass's next action (`tools/godot`), plus a maintainer-requested README rewrite.

- **Batch P: a Godot 4 add-on maintenance table** in `catalog/tools/README.md`, read from
  each repository: licence, last commit, latest release, archived flag, Godot version.
- **Licence reversal on `godot-mod-loader`, MIT to CC0.** The entry linked
  `Godot-Modding/loader`, recorded MIT, and said that older drafts claiming CC0 "are
  wrong". The drafts were right. That repository is a placeholder: a one-line README, a
  LICENSE and a docs folder, no code. The project is `GodotModding/godot-mod-loader`,
  confirmed by both Godot Asset Library listings and its own CC0 LICENSE. `verified`
  moved with three dated Evidence lines. **Lesson worth keeping:** an earlier pass
  "corrected" a true claim by verifying the wrong repository. A licence has to belong to
  the thing people actually download, so confirm the canonical source before reading its
  licence.
- Also found: GodotSteam's GitHub repo is archived (moved to Codeberg, still active);
  Creature 2D Runtimes is a Godot 3 runtime last touched in 2020, listed under a
  "Godot 4 add-ons" heading (now labelled); Waterways' default branch and only release
  are Godot 3, with Godot 4 on branches. Notes only on all three.
- Checked and left alone: Sky3D, scatter2d and gdquest-godot-shaders show `NOASSERTION`
  on GitHub, but their licence files are ordinary MIT and, for GDQuest, a documented
  MIT-code / CC-BY-NC-SA-art split that its entry already handles correctly.
- **README rewritten** around what a visitor is trying to do: a task-to-guide table
  linking the eight comparison guides, which the front page had never linked; an
  accurate field reference; a licence-guide table including `fonts.md` and `geodata.md`;
  and a section on what the validator actually enforces. Kept every badge and the three
  patterns check V6 validates. Rendered through GitHub's markdown API in README mode
  before commit, which caught four false claims.
- **Style debt paid.** The brief forbids em dashes in anything written into the repo, and
  this session had added them to 29 lines. Measured from the diff since the session began,
  so only this session's text was touched; 27 fixed, 2 left because they sit in
  pre-existing sentences.
- **CONTRIBUTING corrected.** It called listing an entry in its category README
  "optional", which the validator has always rejected, and told contributors to use any
  licence name, which check V1 has rejected since batch B. Both now match the validator.
- Deferred, unchanged: `tenacity`'s licence, the two `camera_perspective` questions.
- Remaining measured clusters: `audio/sfx` (14), `audio/music` (11).
- Next highest-value action: ~~**the audio clusters**, starting with music~~: music done
  in the eleventh pass above; `audio/sfx` remains.

## 2026-09-23 (ninth pass, same session)

Both of the eighth pass's next actions. Two commits.

- **`poly-pizza` updated.** The licence-label finding was re-checked before being written
  down: the first reading took the first licence string anywhere on each page, which can
  come from a related-model card. Read properly from each model's structured `Licence`
  field, with the creator confirmed as Quaternius on all eight, it holds: one model is
  `CC-BY 3.0`, seven are `CC0 1.0`, and the author's own site says CC0. The entry now
  says the licence is per file, not per author, and warns about the same page-reading
  trap. `verified` moved to 2026-09-23 because the entry's claim (licences vary per model)
  was read live today, with two dated Evidence lines, so V8 holds. Still `needs-review`.
- **Batch O: `catalog/characters/README.md` gained "Choosing a rigged character
  source"**, sorted by licence first and then by engine-readiness.
- **The finding: three sources, three skeletons.** KayKit uses 41 joints with its own
  short names, weapon hand-slots and no finger bones; the Quaternius model uses a 53-joint
  Rigify rig with fingers; GDQuest's mannequin uses 45 joints with Unreal-mannequin-style
  names. Animations need retargeting between publishers, and finger animation retargeted
  onto KayKit is lost.
- `microsoft-rocketbox` gained notes from its README: four LODs, 417 animations, facial
  blendshapes (the only ones in the catalog), Unity-first tooling. Notes only.
- **Caught before commit:** a draft said every Blender Studio rig needs a login and
  Blender 5.0. The entries record that only for the Singularity rigs; Rain is a direct
  download. The Quaternius skeleton figures are also scoped to the model actually
  measured, not to the Universal Base Characters pack, which was not opened.
- Deferred, unchanged: `tenacity`'s licence, the two `camera_perspective` schema and
  scope questions.
- Remaining measured clusters: `audio/sfx` (14), `tools/godot` (12), `audio/music` (11).
- Next highest-value action: ~~**`tools/godot`**~~: done in the tenth pass above, which
  also found the mod-loader licence reversal.

## 2026-09-23 (eighth pass, same session)

Took the seventh pass's next action. Batch N. The 3D kit question, which earlier passes
held back as a matter of art style, turned out to be mostly measurable.

- Executed: parsed the glTF/GLB of every model in Kenney's Modular Dungeon and Nature
  kits (368), every model in KayKit's Dungeon Remastered and Adventurers packs (235), and
  eight Quaternius models, then wrote **Choosing between Kenney, KayKit and Quaternius**
  into `catalog/3d/README.md`. Triangles, texturing, rigs, animation counts, height, file
  size and delivery, each from the files rather than the store pages.
- **The finding that matters most is scale.** Kenney Nature Kit trees are 1.33 m and rocks
  0.32 m; Kenney's own Modular Dungeon walls are 4.2 m; Quaternius trees are 7 to 10 m.
  The Nature Kit is authored at a miniature scale and needs about 5x before it sits beside
  anything else. KayKit and Kenney dungeon walls agree within 5% (4.0 m, 4.2 m).
- **Correction:** `kenney-nature-kit` advised pairing it with the Quaternius Stylized
  Nature MegaKit "for denser stylized forests". Measured, that puts 1.3 m trees beside
  7-10 m trees at a twentyfold density gap. Rewritten. Notes only; `verified` unchanged.
- **New finding, logged rather than acted on, per the rule on scope:** Poly Pizza labels
  the same author's work inconsistently. Of eight Quaternius models checked, seven showed
  "Public Domain" and one (Animated Base Character) showed "Creative Commons
  Attribution", while Quaternius itself releases the packs as CC0. That is direct evidence
  for the `poly-pizza` entry's `needs-review` status and belongs in its notes next run: an
  aggregator's per-file licence label cannot be trusted over the author's own statement.
- **Method limits, stated in the README as well.** Quaternius packs are served through
  itch, whose free-download flow would not issue a file outside a browser session (the
  signed key was rejected every time without browser cookies). The Quaternius figures come
  from eight models on Poly Pizza, so they are indicative, not pack-wide. KayKit ships
  official GitHub repos (`KayKit-Game-Assets/*`), which is why its sample is complete.
- Deferred, unchanged: `tenacity`'s licence, the `camera_perspective` scope question for
  `characters` and `3d`, the single-valued `camera_perspective` schema question.
- Remaining measured clusters: `characters/rigged` (14), `audio/sfx` (14), `tools/godot`
  (12), `audio/music` (11). The KayKit and Quaternius rig numbers from this pass already
  cover most of `characters/rigged`.
- Next highest-value action: ~~**add the Poly Pizza finding**, then
  **`characters/rigged`**~~: both done in the ninth pass above.

## 2026-09-23 (site navigation, same session)

Maintainer-requested navigation and usability work, not a review pass. Batches L and M.
Recorded here because it changes what the site promises and fixes a defect.

- **Defect fixed:** below 640px, `.topnav a:nth-child(-n + 3) { display: none }` hid
  Catalog, Starters and Guides, so the mobile primary nav contained only "GitHub". It
  predates this session. All four links now fit at 375px.
- **L:** the catalog is grouped under category headings with counts (default sort and
  no category filter only; other sorts render flat because grouping would hide the order
  asked for). Category chips show faceted counts under the other active filters. The
  chip for the section in view gets a separate "you are here" marker with `aria-current`;
  chips stay pure filters. Back-to-top, `/` to focus search, `Esc` to clear. Without JS
  the chips are prerendered as jump links to the group headings. Anchored targets clear
  the sticky filter bar via a measured `--sticky-h` and `scroll-margin-top`.
- **M:** previous/next inside the entry dialog, in on-screen order across group
  boundaries and within filters, with arrow keys, a "4 of 23" position, and focus
  returning to the entry you ended on. An entry opened from a permalink that the current
  filters exclude gets no pager, because there is no honest "next" for it.
- Both batches verified in a browser at 1200px and 375px in both colour schemes: every
  control at least 44px, WCAG AA on all new text, no overflow, no console errors.
- **Parked, do not re-litigate:** chips filter, they do not jump. Making one control
  both filter and navigate was considered and rejected in design. Grouping is
  deliberately conditional on the default sort.
- Next highest-value action for the catalog is unchanged from the seventh pass below:
  the 3D kit question (Kenney vs Quaternius vs KayKit).

## 2026-09-22 (seventh pass, same session)

Took the sixth pass's next action. Batch K. **Re-measured before starting, and the
ledger's own figure was wrong.**

- The "eight uncovered clusters" carried forward since the second pass was stale: the
  tools comparison table from batch E already covers seven of the original ten. Counting
  clusters properly, by entries sharing a subcategory inside a category, found much
  larger ones nobody had looked at. Lesson for future passes: **re-measure the deferred
  item before working it**, because a count written three passes ago describes a
  catalog that no longer exists.
- Executed: three comparison tables, chosen by cluster size and by how little the
  licence column helps.
  - `catalog/2d/README.md`: **Choosing a pixel tileset** (10 sources). Sorted by grid
    size and projection, the two things that actually decide it.
  - `catalog/3d/README.md`: **Choosing a PBR texture source** (8 sources). Sorted by
    licence first: six are genuine CC0, `sharetextures` and `freepbr` are custom grants
    that permit shipping a game but restrict passing the textures on.
  - `catalog/fonts/README.md`: **Choosing a pixel font** (9 sources). Sorted by kind of
    retro, and by CJK coverage, which three have and the licence column cannot show.
- **The 2D tileset table is one this session owed.** Batch H added six pixel tile packs
  to a category that already had four, leaving ten CC0 sources that look
  interchangeable. Adding sources without adding a way to choose between them is a debt,
  and it is worth noticing that the same pass that closes a coverage gap can open a
  decision-support one.
- **V11 reworked.** The 3D table leads with the entry link, which made it structurally
  identical to a catalog listing row, and V11 produced seven false positives. It now
  finds the listing by its `| ID |` header rather than by row shape. To stop that from
  becoming a check that measures nothing if the header ever changes, a category README
  with entries and no such table is now itself an error. Both behaviours are fixtured
  and were re-proved by mutating the real catalog.
- Deferred, unchanged: `tenacity`'s licence (Codeberg 403s automated requests), the
  `camera_perspective` scope question for `characters` and `3d`, and the single-valued
  `camera_perspective` schema question from the sixth pass.
- Remaining clusters, now measured rather than guessed, largest first: `3d/environment`
  (32), `3d/props` (26), `3d/modular` (17), `characters/rigged` (14), `audio/sfx` (14),
  `tools/godot` (12), `audio/music` (11), `characters/animated` (10). The 3D ones are
  really one question, **Kenney vs Quaternius vs KayKit**: three publishers holding 80
  entries, and answering it well needs a view on art style and topology, not metadata.
- Next highest-value action: **that 3D kit question**. It is the largest cluster in the
  catalog, `catalog/3d/README.md` had no guidance at all until this pass, and a
  developer starting a 3D project hits it immediately.

## 2026-09-22 (sixth pass, same session)

Took the fifth pass's next action. Batch J. The 2D taxonomy is now as complete as it
can honestly be.

- Executed: opened all three packs.
  - `kenney-tiny-dungeon` -> **`isometric_3_4`**. Walls carry a lit front face below
    the top surface and figures face the viewer.
  - `ox72-dungeon-tileset` -> **`isometric_3_4`**. Vertical brick wall face behind a
    floor plane, front-facing creatures. Matches its already-classified sibling.
  - `kenney-1-bit-pack` -> **stays absent, and now says why.**
  `camera_perspective` 28 -> 36 of 300.
- **A real limit of the field, found by opening the archive.** The 1-bit pack ships
  four official Kenney sample scenes: fantasy overworld, interior, urban and
  *platformer*. The fantasy sample is 3/4 with building facades; the platformer sample
  is a side-scroller built from the same tiles. The pack genuinely serves both, so no
  single value is correct. This is not missing data, it is a single-valued field meeting
  a multi-perspective tileset.
- **Open schema question, deliberately not answered here.** Should
  `camera_perspective` accept a list, or a `multi` value? Widening it changes what the
  View filter means for all 300 entries (does a `side_scroller` filter return a pack
  that merely *can* be used that way?), so it is the maintainer's call, not a detail to
  settle inside a tagging pass. For now the field stays absent on such packs, the reason
  is in the entry, and a `multi-perspective` tag makes it findable by search.
- Every 2D entry that can carry a single honest value now does. What remains absent is
  absent for a stated reason, which was not true before this pass.
- Deferred, unchanged: `tenacity`'s licence (Codeberg 403s automated requests), the
  eight decision-support clusters without comparison lines, and the `camera_perspective`
  scope question for `characters` and `3d`.
- Next highest-value action: ~~**the eight decision-support clusters**~~: worked in
  the seventh pass above, where the count turned out to be stale. Three much larger
  clusters were covered instead.

## 2026-09-22 (fifth pass, same session)

Took the fourth pass's next action. Batch I. **The original task-test gap is now
closed**, four passes after it was first measured.

- Executed: downloaded and opened the three character sheets, and recorded what each
  actually ships rather than what its description implies.
  - `ninja-adventure`: **4-directional**. 64x112 per character on a 16px grid: four
    columns for down, up and both sides, seven rows of frames.
  - `armm1998-zelda-like`: **4-directional**. 272x256 sheet of 16x32 frames, four
    facings, four-frame walk plus a sword set in each direction.
  - `kenney-roguelike-characters`: **front-facing only**. 918x203 on a 16px tile with
    1px spacing: bodies, hair, clothing, armour, shields and weapons, every frame the
    front view. No side or back facings, no animation frames anywhere in the pack.
  Tagged `4-directional` and `front-facing` so site search reaches them.
- **Correction to the fourth pass.** The `kenney-roguelike-characters` note claimed
  variants were "separate sprites rather than a layered paper doll". The sheet shows
  the opposite: it is a layered parts kit meant to be composited. What it lacks is
  turning, not layering. Fixed. The lesson is the same one the fourth pass recorded
  about perspective: the sheet answers questions the store page does not.
- `verified:` deliberately unchanged on all three. Frame layout is not licence text,
  and the findings sit in Notes rather than Evidence because an Evidence line in this
  repo means proof of licence and commercial stance.
- Sources opened: `kenney_roguelike-characters.zip` from the Kenney asset page,
  `gfx_3.zip` attached to the OpenGameArt submission, and `content/character/*/sprite.png`
  in [pixel-boy/NinjaAdventure](https://github.com/pixel-boy/NinjaAdventure), the
  author's own game repo built from the itch pack. **The itch download itself is behind
  a form**, so the Ninja Adventure layout is verified from that repo rather than from
  the pack archive; a future run with a browser could confirm against the itch zip.
- Deferred, unchanged: `tenacity`'s licence (Codeberg 403s automated requests), the
  eight decision-support clusters without comparison lines, the three deliberately
  untagged tile packs, and the `camera_perspective` scope question for `characters`
  and `3d`.
- Next highest-value action: ~~**the three untagged tile packs**~~: done in the sixth
  pass above. Two resolved to `isometric_3_4`; the 1-bit pack is genuinely
  multi-perspective and stays absent with a stated reason.

## 2026-09-22 (fourth pass, same session)

Sourcing, against the gap the View filter exposed. Batch H.

- Executed: **6 new 2D entries**, all CC0 and all `active`. Entry count 294 -> 300.
  `kenney-micro-roguelike` (8x8, `top_down`), `kenney-tiny-battle` (16x16, `top_down`),
  `kenney-tiny-town`, `kenney-roguelike-rpg-pack`, `kenney-roguelike-characters` and
  `armm1998-zelda-like` (all `isometric_3_4`). `top_down` 1 -> 3, and two of the three
  are now `active` CC0 rather than a lone `needs-review` aggregator.
- Method worth repeating: **perspective was decided by opening each pack's sample
  image**, because no Kenney asset page states a projection in text. That is how the
  split was found. Micro Roguelike and Tiny Battle are genuinely orthographic; Tiny
  Town and the Roguelike/RPG pack draw facades above an overhead ground plane and are
  3/4. Filing all of them as top-down because they are overhead RPG tiles would have
  been wrong, and reading only the descriptions would have produced exactly that error.
- **The character half of the gap is still open.** It was stated as "CC0 4-directional
  top-down character sprites" and nothing added here claims four-direction walk cycles.
  Kenney Roguelike Characters is front-facing 3/4 sprites with variants; the ArMM1998
  submission says "Character with sword animation and character tamplet" without
  enumerating directions. Both entries say so in their notes. Confirming directional
  coverage means downloading and opening the sheets, which no pass has done.
- Deferred, unchanged: `tenacity`'s licence (Codeberg 403s automated requests), the
  eight decision-support clusters without comparison lines, the three deliberately
  untagged tile packs, and the scope question about `camera_perspective` on
  `characters` and `3d`.
- Next highest-value action: ~~**open the character sheets**~~: done in the fifth
  pass above. Two of the three turn; the Kenney set does not.

## 2026-09-22 (third pass, same session)

Took the "next highest-value action" the first two passes both named. Batch G.

- Executed: **the 2D taxonomy is populated and exposed.** `camera_perspective`
  11 -> 28, `grid_dimensions` 6 -> 11. Site gained a View filter with URL state
  (`?view=side_scroller`), the grid and perspective on every row, both fields in the
  entry dialog, and an active-filter chip. New check **V12** enforces the documented
  vocabulary for all three optional fields, which `TEMPLATE.md` described and nothing
  had ever checked.
- Also fixed, found by reading the deployed payload rather than by any check:
  **`license_spdx` was 0/294 in the built site.** `build.mjs` never copied the field
  onto the entry object, so every SPDX identifier the catalog has recorded existed only
  in frontmatter and had never reached `data.json`, `data.js` or the page. Now 227/294
  live. Worth noting the shape of this bug: `validate.mjs` measures frontmatter,
  `build.mjs` decides what ships, and nothing compares the two. Other fields could be
  dropped the same way and no check would notice.
- Method, and the constraint worth keeping: fields were populated **only where the
  entry's own body already states the fact**, so this restates what the catalog knows
  and no `verified:` date moved. A first attempt used regex over the bodies and was
  discarded: it read "0x72" in an author's name as a grid size and the word
  "platformer" in unrelated prose as a side-scroller. The bodies were read instead.
- Deferred, and now visible rather than hidden:
  - **`top_down` returns exactly one entry** (`dcss-tiles`, which is `needs-review`).
    That is the coverage gap the task test found in the first pass, now legible in the
    UI. It is a sourcing problem, not a tagging one.
  - **Three tile packs are deliberately untagged**: `kenney-1-bit-pack` and
    `kenney-tiny-dungeon` read as top-down roguelike tiles, and `ox72-dungeon-tileset`
    is the sibling of an entry already classified `isometric_3_4`, but none of the
    three states its perspective in its own body. Confirming them means looking at the
    packs, which is a sourcing task for a future run. Do not infer them.
  - The rest of `2d` beyond these, and every other category, still has no
    `camera_perspective`. That is correct for `tools`, `fonts` and `audio`; it is an
    open question for `characters` and parts of `3d`, where the field is arguably not
    applicable at all. Decide the scope before populating further.
- Next highest-value action: ~~**source a CC0 4-directional top-down character set and a
  top-down tileset with a stated perspective**~~: tilesets done in the fourth pass
  above; the character half remains open.

## 2026-09-22 (second pass, same session)

Picked up the two items the first pass deferred. Batches F and E.

- Executed:
  - **F, GPL version precision.** Read each of the 15 bare-GPL projects' own licensing
    statements at source. 8 had an explicit election and were corrected:
    cloudcompare, lmms and tiled to `GPL-2.0-or-later`; goxel, gimp, espeak-ng and
    sollumz to `GPL-3.0-or-later`; and **inkscape from `GPL-2.0` to `GPL-3.0-or-later`**,
    which is a correction rather than precision, because its own COPYING says the
    complete binaries are GPLv3-or-later while its licensing page still shows the GPLv2
    title. `license_spdx` coverage 219 -> 227 (77.2%). `verified` moved to 2026-09-22 on
    these 8 only, each with a dated Evidence line quoting what was read.
  - Added check **V11**: a category README row may not contradict its entry's
    frontmatter. It found two real drifts (tiled's row said GPL-3.0 against frontmatter
    GPL-2.0; jsfxr's still said public-domain after batch B corrected it to Unlicense).
  - **E, documentation and decision support.** `docs/fonts.md` and `docs/geodata.md`,
    both registered in `site/config.json` and linked from `catalog/README.md`.
    Comparison tables for the icon cluster in `catalog/2d/README.md` and the tool
    near-duplicates in `catalog/tools/README.md`.
- Deferred, still open:
  - **7 entries keep a bare GPL value on purpose** and now say why in their notes.
    krita and meshlab have per-file `GPL-2.0-or-later` headers but ship the GPLv3 text,
    so the distribution is GPLv3 with no single election. audacity says "GPLv3" while
    most files are GPLv2-or-later and VST3 code constrains the combination. blockbench,
    libresprite and materialize ship stock licence text with no election. **tenacity
    could not be read at all**: Codeberg returned 403 to automated requests, so its
    value is unchanged and unconfirmed, and it is the one worth a manual look.
  - Eight of the ten decision-support clusters still have no comparison line: the four
    colourblindness tools are described in prose but the remaining clusters (Godot
    scatter, dungeon tilesets, and the rest) are untouched.
  - Everything in the first-pass list below that is not struck through here.
- Parked, do not re-litigate:
  - **A stock GPL licence file proves nothing about the project's election.** Its own
    "How to Apply These Terms" appendix contains the words "any later version". A pass
    in this session nearly recorded eight wrong answers by pattern-matching that phrase
    in 35KB LICENSE files. Only a project-authored statement counts: a source-file
    header, a README sentence, or a short project-written licence note.
  - **krita and meshlab are not defects.** Their bare `GPL-3.0` is the honest value.
    Checked 2026-09-22 against two sources each.
  - **Annotated cells in category README tables are deliberate.** `CC0*`, `CC-BY?`,
    `varies (SA)` and `varies (CC0/MIT/GPL)` carry footnote warnings the plain value
    cannot. V11 strips a trailing marker or parenthetical before comparing; do not
    "normalise" these away. An earlier attempt in this session stripped 10 of them and
    was reverted.
  - **V11 only inspects rows whose first cell is the entry link.** Category READMEs may
    also hold comparison tables that link entries from prose cells; those are not
    listings. Matching any row produced 22 false positives.
- Next highest-value action: unchanged from the first pass below. Populate
  `camera_perspective` and `grid_dimensions`.

## 2026-09-22

- Measured: 294 entries (263 active, 29 needs-review, 2 deprecated); 262 commercial
  true, 23 unknown, 8 varies, 1 false; 20 distinct `license` values; `license_spdx`
  209/294, `publisher` 128/294. Stale share 0 percent: every `verified` date is under
  90 days old because the repo is 65 days old. Required fields 294/294, zero misses.
  Link sweep of all 294 urls: 282 returned 2xx, 12 returned 403/454 bot blocks, and
  **zero were dead**.
- Integrity check that mattered most: of the 292 entries with a dated `## Evidence`
  section, **zero** had a `verified` date newer than their newest evidence date. No
  date in this catalog has been carried forward without evidence behind it.
- Executed: batches A, B, C, D, one commit each, validator and build green after each.
  - A: `spdx-allowed.json` +7 identifiers; `license_spdx` backfilled on 10 entries
    (209 -> 219); `publisher` rule in CONTRIBUTING clarified.
  - B: 10 new checks in `site/checks.mjs` behind `site/license-vocabulary.json`, with
    `site/checks.test.mjs` (28 assertions) wired into both workflows; 6 entries edited
    so the checks could ship.
  - C: 3 `url` fields repointed after publisher domain moves.
  - D: prerendering, the deprecated-filter fix, verified age in the UI, permalinks,
    URL state, sort, clipboard, legend, dark scheme, sitemap/robots/404.
- Deferred:
  - ~~**Batch E** (docs and decision support)~~: done in the second pass above.
  - ~~**15 entries carrying `license: GPL-2.0` or `GPL-3.0`**~~: 8 resolved in the
    second pass above; 7 remain bare on purpose, with reasons recorded in their notes.
  - **12 urls returned 403 or 454** (fab, smithsonian, scan-the-world, sonniss,
    pixabay-audio, zapsplat, musopen, inkscape, tenacity, cloudcompare, vroid-studio,
    godot-shaders). Bot blocks, inconclusive, not defects. No `verified` was moved.
    They need a browser-based check whenever one of them next needs re-verifying.
  - **`og:image`** is omitted rather than faked. It needs a real image file and the
    binary-asset rule keeps one out of the repo; decide where it should live.
  - **`site/dist/data.json`** is deployed but unused by the page. It may be a
    deliberate JSON endpoint. If it is, say so in `site/README.md`; if not, drop it.
- Parked, do not re-litigate:
  - **One entry equals one pack.** Kenney 44, Quaternius 23 and KayKit 13 entries look
    like redundancy and are not; `provenance.md` settles it. Three publishers holding
    27 percent of the catalog is a consequence of that rule, not a defect.
  - **Aggregators with `commercial: varies` appear under the Commercial OK filter**,
    labeled per-file review. CONTRIBUTING states this is deliberate so they are neither
    silently excluded nor silently treated as a blanket grant.
  - **`publisher` on a single-entry publisher is allowed.** This run first read the
    CONTRIBUTING rule as a gate and proposed deleting the field from Tiny Speck,
    Screaming Brain Studios and Sparklin. That was the wrong reading: the rule's real
    prohibition is generic hosts, and deleting accurate rights-holder data to satisfy a
    formatting rule loses information. The wording was clarified instead.
  - **`blender.md` carries no `publisher` while the Blender Studio asset bundles do.**
    Not an inconsistency. The Blender Foundation ships the application; Blender Studio
    holds the asset rights. Check V7 is written to allow exactly this.
  - **OFL font entries set `attribution_required: false`.** Correct. OFL obliges a
    notice carried with the font files, not a credits-screen line. The vocabulary
    records this as attribution class `notice` so V4 does not fire on them.
  - **No virtualization, pagination or search debounce.** Measured at 294 entries and
    below the threshold where they pay for themselves. Measure again before proposing.
- Next highest-value action: ~~**populate `camera_perspective` and `grid_dimensions`**~~
  (done in the third pass above).
  The task-based coverage test failed hardest not on missing sources but on missing
  taxonomy: a developer cannot filter for a top-down 2D source, because
  `camera_perspective` is set on 11 of 294 entries and `grid_dimensions` on 6, and the
  site does not expose either. The schema already solved this problem and nothing
  filled it in. After that, the three concrete source gaps the task test found:
  rigged first-person arms, CC0 4-directional top-down character sprites, and
  rubble/pre-fractured debris geometry.

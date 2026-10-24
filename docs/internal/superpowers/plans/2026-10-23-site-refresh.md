# Site Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the catalog site show the assets it lists (licence-gated publisher thumbnails on cards, rows, entry and stack pages), cut the homepage to per-category previews with static category pages behind them, self-host the fonts, and fix the audit's layout items, without changing the site's identity.

**Architecture:** A new `site/thumbs.mjs` script fetches each eligible entry's `og:image`, resizes it with ffmpeg, and commits `site/public/thumbs/<id>.webp` plus a manifest `site/thumbs.json`; the validator refuses a thumbnail the gate no longer allows. The build reads the manifest, attaches `thumb` to each entry, and renders every entry through one browser-safe template module `site/lib/cards.mjs` that the homepage, category pages, stack pages and `app.js` all share; Cards vs List is a `data-view` attribute flipped by CSS, not a second template. Fonts become WOFF2 files under `site/public/fonts/` with `@font-face` rules, and every page's `<head>` comes from the shared helper.

**Tech Stack:** Node 22+ ESM, no npm dependencies; plain CSS and ES modules in the browser; ffmpeg (optional, for the thumbnail script only); GitHub Actions with the already-pinned checkout and setup-node.

**Spec:** `docs/superpowers/specs/2026-10-23-site-refresh-design.md`

## Global Constraints

- No npm dependencies; `package.json` keeps `"description": "Catalog checks and static site build. No dependencies."` true.
- `npm run check` (tests, validate, build) is the gate for every task; `site/checks.test.mjs` ends with `checks.test ok: N assertions across M checks` and `site/lib/lib.test.mjs` with `lib.test ok: N assertions`.
- Every page must be complete without JavaScript; the build's `checkPages` must pass on every generated page.
- Refinement preserves: existing tokens in `site/public/styles.css` (`--bg`, `--ink`, `--muted`, `--line`, `--surface`, `--accent`, `--warn`, `--danger`, `--font`, `--mono`, `--max`), the copy voice, and the "every licence read at the source" promise. No new colours outside the token set.
- Thumbnails only for entries with `status: active` and a licence in the allowlist; never for `custom`, `varies`, `unknown`, `github.com` or `fonts.google.com` sources without an explicit `preview:` URL.
- Before any UI edit (Tasks 4 to 7 and 9), read `C:\Users\16mat\.claude\skills\impeccable\reference\craft-floor.md`. After Task 9's build, run the detector once: `sh C:/Users/16mat/.claude/skills/impeccable/scripts/impeccable detect --json site/public/styles.css site/public/index.html site/lib/cards.mjs site/lib/entry-page.mjs site/lib/stack-page.mjs site/lib/category-page.mjs`.
- Commit after each task on branch `site-refresh`; commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

1. **An entry's licence changes from CC0 to custom after its thumbnail was committed.** The next `npm run validate` must fail naming that entry; the next `node site/thumbs.mjs` run must delete the file and record. (Task 2, `checkThumbManifest` test "rejects a thumbnail whose entry is no longer eligible".)
2. **A publisher's `og:image` is their logo, shared by every pack page.** Three or more entries with the same image hash must all lose the image and get the tile. (Task 1, `sharedImageIds` test.)
3. **A page with no `og:image`, a 404, a timeout, or an image over 15 MB.** The script records the failure in its report and moves on; exit code stays 0. (Task 2, `--dry-run` fixture run and the "no converter" path.)
4. **JavaScript off, or `data.js` fails to load.** Homepage shows 6 or 8 entries per category and a working "Show all" link to a category page that lists everything; the view toggle is simply absent. (Task 6 page check; Task 5 no-JS screenshot in Task 9.)
5. **Category with zero thumbnails (Tools, Fonts) in Cards view, and a visitor who switched it to Cards.** Tiles must render with real names, not blank boxes; the grid must not be taller than the list it replaced by more than the image height. (Task 4 `tileHtml` tests; Task 9 screenshot of Tools in Cards.)

---

### Task 1: Thumbnail rules library (pure)

**Files:**
- Create: `site/lib/thumbs.mjs`
- Test: `site/lib/lib.test.mjs` (append a section `// Site refresh: thumbnail rules.` before the report block)

**Interfaces:**
- Consumes: nothing from the repo except `hostname` parsing via `URL`.
- Produces (all exported from `site/lib/thumbs.mjs`):
  - `PREVIEW_LICENSES: Set<string>` = `CC0, Unlicense, public-domain, CC-BY, CC-BY-3.0, CC-BY-4.0, CC-BY-SA, CC-BY-SA-3.0, CC-BY-SA-4.0, MIT, ISC, BSD, BSD-2-Clause, BSD-3-Clause, BSD-3-Clause-Clear, Apache-2.0, MPL-2.0, SIL OFL, GPL-2.0, GPL-2.0-only, GPL-2.0-or-later, GPL-3.0, GPL-3.0-only, GPL-3.0-or-later, LGPL-3.0, CDLA-Permissive-2.0`
  - `SKIP_HOSTS: Set<string>` = `github.com, www.github.com, fonts.google.com`
  - `previewEligibility(entry) -> { ok: boolean, reason: string | null }` where `entry` has `license, status, url, preview?`. Reasons, exact strings: `"status is needs-review"` / `"status is deprecated"`, `"licence CUSTOM is not in the preview allowlist"` (with the real value in place of CUSTOM), `"preview: none"`, `"host github.com is skipped"` (host in place). A `preview` that is an `https://` URL overrides only the host rule. Order of checks: preview none, status, licence, host.
  - `imageUrlFromHtml(html, pageUrl) -> string | null`: `og:image` first (`property` before or after `content`), then `twitter:image`; relative values resolved against `pageUrl`; `&amp;` in the value decoded; returns null when absent or not `http(s)`.
  - `sharedImageIds(records: Record<string, {hash: string, pinned?: boolean}>) -> Set<string>`: ids whose `hash` appears on 3 or more records; `pinned` records (from a `preview:` URL) never count and are never returned.
  - `needsFetch(record | undefined, { license, today, force = false, maxAgeDays = 180 }) -> boolean`: true when no record, `force`, `record.license !== license`, or `record.fetched` older than `maxAgeDays` days before `today` (ISO dates).
  - `webpSize(buf: Buffer) -> { width, height } | null` for VP8, VP8L and VP8X containers; null when not `RIFF....WEBP`.
  - `publisherKey(entry) -> string`: `entry.publisher` if set, else the hostname of `entry.url` without `www.`.
  - `previewCredit(entry) -> string`: `Preview image from Kenney, shown under CC0` or `Preview image from the source page, shown under CC-BY-4.0`.
  - `filmstripPick(entries, { count = 9, cardCategories }) -> entry[]`: entries with `status === "active"`, `thumb` set, `category` in `cardCategories`; sorted by `verified` descending then `name`; at most one per `publisherKey`; first `count`.
  - `thumbRelPath(id) -> string` = `thumbs/<id>.webp`.

- [ ] **Step 1: Write the failing tests** in `site/lib/lib.test.mjs` using the file's `eq`/`has` helpers:

```js
import { filmstripPick, imageUrlFromHtml, needsFetch, previewCredit, previewEligibility, publisherKey, sharedImageIds, webpSize } from "./thumbs.mjs";
eq("thumbs: CC0 active itch page is eligible", previewEligibility({ license: "CC0", status: "active", url: "https://kaylousberg.itch.io/block-bits" }).ok, true);
eq("thumbs: custom licence refused", previewEligibility({ license: "custom", status: "active", url: "https://x.itch.io/a" }).reason, "licence custom is not in the preview allowlist");
eq("thumbs: needs-review refused before licence", previewEligibility({ license: "custom", status: "needs-review", url: "https://x.itch.io/a" }).reason, "status is needs-review");
eq("thumbs: github host skipped", previewEligibility({ license: "MIT", status: "active", url: "https://github.com/a/b" }).reason, "host github.com is skipped");
eq("thumbs: preview url overrides host only", previewEligibility({ license: "MIT", status: "active", url: "https://github.com/a/b", preview: "https://a.b/c.png" }).ok, true);
eq("thumbs: preview url cannot override licence", previewEligibility({ license: "custom", status: "active", url: "https://a.b/", preview: "https://a.b/c.png" }).ok, false);
eq("thumbs: preview none", previewEligibility({ license: "CC0", status: "active", url: "https://a.b/", preview: "none" }).reason, "preview: none");
eq("thumbs: og:image property-first", imageUrlFromHtml('<meta property="og:image" content="https://i.x/a.png?w=1&amp;h=2">', "https://x/"), "https://i.x/a.png?w=1&h=2");
eq("thumbs: og:image content-first", imageUrlFromHtml('<meta content="/img/a.jpg" property="og:image">', "https://x.y/p/"), "https://x.y/img/a.jpg");
eq("thumbs: twitter fallback", imageUrlFromHtml('<meta name="twitter:image" content="https://i/t.png">', "https://x/"), "https://i/t.png");
eq("thumbs: no image", imageUrlFromHtml("<html></html>", "https://x/"), null);
eq("thumbs: shared hash dropped at three", [...sharedImageIds({ a: { hash: "h1" }, b: { hash: "h1" }, c: { hash: "h1" }, d: { hash: "h2" }, e: { hash: "h2" } })].sort().join(), "a,b,c");
eq("thumbs: pinned never dropped", [...sharedImageIds({ a: { hash: "h1", pinned: true }, b: { hash: "h1" }, c: { hash: "h1" }, d: { hash: "h1" } })].sort().join(), "b,c,d");
eq("thumbs: needsFetch no record", needsFetch(undefined, { license: "CC0", today: "2026-10-23" }), true);
eq("thumbs: needsFetch fresh same licence", needsFetch({ fetched: "2026-09-01", license: "CC0" }, { license: "CC0", today: "2026-10-23" }), false);
eq("thumbs: needsFetch licence changed", needsFetch({ fetched: "2026-09-01", license: "CC0" }, { license: "CC-BY-4.0", today: "2026-10-23" }), true);
eq("thumbs: needsFetch stale", needsFetch({ fetched: "2026-01-01", license: "CC0" }, { license: "CC0", today: "2026-10-23" }), true);
eq("thumbs: webp VP8X size", webpSize(Buffer.from("52494646 24000000 57454250 56503858 0a000000 10000000 7f020000 8f010000".replaceAll(" ", ""), "hex")).width, 640);
eq("thumbs: not webp", webpSize(Buffer.from("89504e47", "hex")), null);
eq("thumbs: publisherKey falls back to host", publisherKey({ url: "https://www.kenney.nl/assets/x" }), "kenney.nl");
eq("thumbs: credit with publisher", previewCredit({ publisher: "Kenney", license: "CC0" }), "Preview image from Kenney, shown under CC0");
eq("thumbs: credit without publisher", previewCredit({ license: "CC-BY-4.0" }), "Preview image from the source page, shown under CC-BY-4.0");
{
  const t = { path: "thumbs/x.webp", width: 640, height: 400 };
  const pool = [
    { id: "a", name: "A", status: "active", category: "3d", verified: "2026-10-01", publisher: "P1", url: "https://p1/", thumb: t },
    { id: "b", name: "B", status: "active", category: "3d", verified: "2026-10-02", publisher: "P1", url: "https://p1/", thumb: t },
    { id: "c", name: "C", status: "active", category: "tools", verified: "2026-10-03", url: "https://p2/", thumb: t },
    { id: "d", name: "D", status: "needs-review", category: "2d", verified: "2026-10-04", url: "https://p3/", thumb: t },
    { id: "e", name: "E", status: "active", category: "2d", verified: "2026-10-05", url: "https://p4/", thumb: null },
    { id: "f", name: "F", status: "active", category: "2d", verified: "2026-09-01", url: "https://p5/", thumb: t },
  ];
  eq("thumbs: filmstrip picks newest, one per publisher, card categories, active, with thumb", filmstripPick(pool, { count: 9, cardCategories: ["3d", "2d"] }).map((e) => e.id).join(), "b,f");
}
```

For `webpSize`: the VP8X test bytes are a RIFF header, `WEBP`, a `VP8X` chunk of size 10 whose canvas is 24 bits `width-1` = 639 (`7f0200`) and `height-1` = 399 (`8f0100`); add a VP8L case (`VP8L` chunk, signature byte `0x2f`, 14 bits `width-1` then 14 bits `height-1`) and a lossy VP8 case (frame tag, `9d 01 2a`, then 16-bit width and height with the top two bits masked) in the same style.

- [ ] **Step 2: Run the tests to see them fail**

Run: `node site/lib/lib.test.mjs`
Expected: fails to import `./thumbs.mjs`.

- [ ] **Step 3: Implement `site/lib/thumbs.mjs`** with the exports above. `webpSize` reads: VP8X at offset 24 (three little-endian bytes each for width-1 and height-1); VP8L at offset 21 (bits 0 to 13 width-1, bits 14 to 27 height-1 across the 4 bytes after the `0x2f` signature); VP8 at offset 26 (`uint16le & 0x3fff` each). No `node:` imports in this file; it is copied into dist later.

- [ ] **Step 4: Run the tests to see them pass**

Run: `node site/lib/lib.test.mjs`
Expected: `lib.test ok: ` with a count above 553.

- [ ] **Step 5: Commit**

```bash
git add site/lib/thumbs.mjs site/lib/lib.test.mjs
git commit -m "site: thumbnail eligibility, image-url and filmstrip rules"
```

---

### Task 2: Thumbnail script, manifest, validator rules, first batch

**Files:**
- Create: `site/thumbs.mjs` (CLI), `site/thumbs.json` (manifest, written by the CLI), `site/public/thumbs/*.webp` (first batch)
- Modify: `site/validate.mjs:104` (`ALLOWED_BINARY_PREFIXES`), `site/validate.mjs` entry loop (the `preview` field), `site/checks.mjs` (new `checkThumbManifest`), `site/checks.test.mjs`, `package.json` scripts, `CONTRIBUTING.md`, `catalog/TEMPLATE.md` (one commented `preview:` line)
- Test: `site/checks.test.mjs`

**Interfaces:**
- Consumes: Task 1 exports.
- Produces:
  - `site/thumbs.json` shape: `{ "generated": "YYYY-MM-DD", "thumbs": { "<id>": { "source": "<page url>", "image": "<image url>", "fetched": "YYYY-MM-DD", "hash": "<16 hex of sha256 of the downloaded bytes>", "width": N, "height": N, "license": "<license at fetch>", "pinned": true? } } }` sorted by id.
  - `checkThumbManifest(manifest, entriesById: Map<id, entry>, files: string[]) -> string[]` in `site/checks.mjs`; `files` are the basenames under `site/public/thumbs/`.
  - npm script `"thumbs": "node site/thumbs.mjs"`.
  - CLI flags: `--force`, `--only <id,id>`, `--limit <n>`, `--dry-run`, `--report <path>`; environment `GITHUB_OUTPUT` gets `changed=<n>` when set.

- [ ] **Step 1: Write the failing validator tests** in `site/checks.test.mjs`:

```js
import { checkThumbManifest } from "./checks.mjs";
const okEntry = { id: "a", license: "CC0", status: "active", url: "https://a.itch.io/x" };
const manifest = { thumbs: { a: { fetched: "2026-10-01", license: "CC0", hash: "h", width: 640, height: 400, source: "https://a.itch.io/x", image: "https://i/a.png" } } };
accepts("thumbs manifest: file and record agree", checkThumbManifest(manifest, new Map([["a", okEntry]]), ["a.webp"]));
rejects("thumbs manifest: file without record", checkThumbManifest({ thumbs: {} }, new Map([["a", okEntry]]), ["a.webp"]), "site/public/thumbs/a.webp has no record in site/thumbs.json");
rejects("thumbs manifest: record without file", checkThumbManifest(manifest, new Map([["a", okEntry]]), []), 'site/thumbs.json has "a" but site/public/thumbs/a.webp is missing');
rejects("thumbs manifest: record for unknown entry", checkThumbManifest(manifest, new Map(), ["a.webp"]), 'site/thumbs.json has "a" but no catalog entry has that id');
rejects("thumbs manifest: rejects a thumbnail whose entry is no longer eligible", checkThumbManifest(manifest, new Map([["a", { ...okEntry, license: "custom" }]]), ["a.webp"]), 'thumbnail for "a" must be removed: licence custom is not in the preview allowlist (run node site/thumbs.mjs)');
rejects("thumbs manifest: licence drift", checkThumbManifest(manifest, new Map([["a", { ...okEntry, license: "MIT" }]]), ["a.webp"]), 'thumbnail for "a" was fetched under CC0 but the entry now says MIT (run node site/thumbs.mjs)');
```

Also, in the same file, a fixture test for the `preview` field through whatever helper `validate.mjs` exposes for per-entry field checks; if the field checks live inline in `validate.mjs main()`, add `checkPreviewField(file, meta) -> string[]` to `site/checks.mjs` and test: accepts absent, accepts `none`, accepts `https://a/b.png`, rejects `http://a/b.png` with `preview must be "none" or an https:// image URL`, rejects `yes`.

- [ ] **Step 2: Run the tests to see them fail**

Run: `node site/checks.test.mjs`
Expected: import of `checkThumbManifest` is undefined / throws.

- [ ] **Step 3: Implement `checkThumbManifest` and `checkPreviewField` in `site/checks.mjs`**, using `previewEligibility` from `site/lib/thumbs.mjs`. Wire both into `site/validate.mjs`: read `site/thumbs.json` if present (an absent manifest with an empty `site/public/thumbs/` is fine), list `site/public/thumbs/`, and push the errors; add `"site/public/thumbs/"` and `"site/public/fonts/"` to `ALLOWED_BINARY_PREFIXES`. Update the count in the `checks.test ok` line's `across N checks` text if the file prints a fixed number.

- [ ] **Step 4: Run the tests and validate**

Run: `node site/checks.test.mjs && node site/validate.mjs`
Expected: both pass (no manifest yet).

- [ ] **Step 5: Implement `site/thumbs.mjs`.** Reads entries with `listEntryFiles` + `parseFrontmatter` (fields: id, url, license, status, publisher, preview). Converter detection: `ffmpeg -version` via `execFileSync`, else `magick -version`, else none (then every fetch is reported as `skipped: no converter on PATH`). For each entry: `previewEligibility`; `needsFetch` against the current manifest; fetch the page (20 s `AbortSignal.timeout`, `User-Agent: Mozilla/5.0 (compatible; FreeGameDevAssets-thumbs; +https://github.com/TMHSDigital/Free-Game-Dev-Assets)`), `imageUrlFromHtml` (or the `preview` URL directly, which sets `pinned: true`); download (cap 15 MB, else fail); hash; convert to a temp file with

```
ffmpeg -y -loglevel error -i <in> -frames:v 1 -vf "scale='min(640,iw)':-2" -c:v libwebp -quality 78 <out>.webp
```

(ImageMagick: `magick <in>[0] -resize 640x> -quality 78 <out>.webp`); `webpSize` on the result; write `site/public/thumbs/<id>.webp`. After the loop: remove records and files for entries that are now ineligible or gone; `sharedImageIds` over the manifest, delete those files and records, and list them in the report under "Dropped as shared images". Write the manifest sorted by id. Print a summary (`fetched N, kept N, skipped N, failed N, dropped N`), write the markdown report when `--report`, and append `changed=<fetched+removed>` to `$GITHUB_OUTPUT` when set. Exit 0 unless the script itself throws. `--dry-run` does everything but write.

- [ ] **Step 6: Smoke-test the script on two entries**

Run: `node site/thumbs.mjs --only kenney-car-kit,kaykit-block-bits --report "C:\Users\16mat\AppData\Local\Temp\claude\E--Free-Game-Dev-Assets\926d9f61-c4d8-441c-ab73-6503b49d0158\scratchpad\thumbs-smoke.md"`
Expected: two files under `site/public/thumbs/`, each under 60 KB, manifest with two records with width 640, `node site/validate.mjs` passes.

- [ ] **Step 7: Run the first full batch**

Run: `node site/thumbs.mjs --report "C:\Users\16mat\AppData\Local\Temp\claude\E--Free-Game-Dev-Assets\926d9f61-c4d8-441c-ab73-6503b49d0158\scratchpad\thumbs-first-batch.md"` (allow 10 minutes; run in the background and wait for the notification).
Expected: roughly 150 to 250 files, total under 8 MB (`du -sh site/public/thumbs`), validate passes. Note the failures list from the report in the commit body.

- [ ] **Step 8: Add `"thumbs": "node site/thumbs.mjs"` to `package.json`, a commented `# preview: none` line to `catalog/TEMPLATE.md`, and a CONTRIBUTING section "Preview images"** stating: previews are the publisher's own `og:image`, fetched only for active entries whose licence is in the allowlist, resized and committed; a publisher can ask for removal by issue, which is done by setting `preview: none`; a maintainer may set `preview: <https url>` to a specific image they have checked is covered by the entry's licence.

- [ ] **Step 9: Run the full check and commit**

Run: `npm run check`
Expected: all green.

```bash
git add site/thumbs.mjs site/thumbs.json site/public/thumbs site/validate.mjs site/checks.mjs site/checks.test.mjs package.json CONTRIBUTING.md catalog/TEMPLATE.md
git commit -m "site: licence-gated thumbnail pipeline and first batch"
```

---

### Task 3: Self-hosted fonts and one shared head

**Files:**
- Create: `site/public/fonts/public-sans-400.woff2`, `-400-italic`, `-500`, `-600`, `-700`, `site/public/fonts/ibm-plex-mono-400.woff2`, `-500`, `site/public/fonts/OFL.txt`, `site/public/fonts/README.md`
- Modify: `site/public/styles.css` (top: `@font-face` rules), `site/lib/shared.mjs:196` (`baseHeadHtml` gains `root` and emits the stylesheet, icon and font preloads), `site/public/index.html:12-19`, `site/lib/entry-page.mjs:115-119`, `site/lib/stack-page.mjs:121-125`, `site/lib/freshness.mjs:110-113`, `site/build.mjs:324-351` (`notFoundHtml`), `site/lib/page-checks.mjs`
- Test: `site/lib/lib.test.mjs`

**Interfaces:**
- Produces: `baseHeadHtml({ site, title, description, url, type, hasCard, indent, root })` where `root` is `"./"`, `"../"` or `"../../"` and the output now also contains `<link rel="icon" href="<root>favicon.svg" ...>`, `<link rel="preload" href="<root>fonts/public-sans-400.woff2" as="font" type="font/woff2" crossorigin>`, the same for `public-sans-600`, and `<link rel="stylesheet" href="<root>styles.css">`. Callers remove their own icon, font and stylesheet lines.
- `checkPage` adds the error `${file}: references Google Fonts` when the html contains `fonts.googleapis.com` or `fonts.gstatic.com`.

- [ ] **Step 1: Write the failing tests** in `site/lib/lib.test.mjs`:

```js
import { checkPage } from "./page-checks.mjs";
has("head: preloads body font", baseHeadHtml({ site: { siteUrl: "https://s/", title: "T", tagline: "x" }, title: "T", description: "d", url: "https://s/", root: "../../" }), '<link rel="preload" href="../../fonts/public-sans-400.woff2" as="font" type="font/woff2" crossorigin');
has("head: stylesheet from root", baseHeadHtml({ site: { siteUrl: "https://s/", title: "T", tagline: "x" }, title: "T", description: "d", url: "https://s/", root: "./" }), '<link rel="stylesheet" href="./styles.css"');
has("page check: google fonts refused", checkPage('<html><head><title>x</title><link rel="canonical" href="https://s/"><link href="https://fonts.googleapis.com/css2"></head><body><h1>x</h1></body></html>', { file: "p.html", kindOf: () => "file" }).join(), "p.html: references Google Fonts");
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `node site/lib/lib.test.mjs`
Expected: the three new assertions fail.

- [ ] **Step 3: Download the fonts.** Write a throwaway script `C:\Users\16mat\AppData\Local\Temp\claude\E--Free-Game-Dev-Assets\926d9f61-c4d8-441c-ab73-6503b49d0158\scratchpad\fetch-fonts.mjs` (run with `node`, not pasted into Bash) that requests `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap` with a Chrome User-Agent, parses each `@font-face` block whose `unicode-range` is the latin block (starts `U+0000-00FF`), downloads its `url(...)`, and saves to the names above. Write `site/public/fonts/README.md` (source: Google Fonts CSS API, families and weights, date, licence OFL 1.1) and `OFL.txt` (the SIL Open Font License 1.1 text from `https://openfontlicense.org/open-font-license-official-text/`, fetched by the same script).
Expected: seven `.woff2` files, each 10 to 40 KB.

- [ ] **Step 4: Add `@font-face` rules** at the top of `site/public/styles.css`, one per file: `font-family: "Public Sans"` / `"IBM Plex Mono"`, matching `font-weight`/`font-style`, `font-display: swap`, `src: url("fonts/<name>.woff2") format("woff2")`, `unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`. Stylesheet URLs resolve against `styles.css`, so `fonts/` works from every page depth.

- [ ] **Step 5: Implement the `root` parameter in `baseHeadHtml`** and remove the icon, preconnect, Google Fonts and stylesheet lines from `index.html`, `entry-page.mjs`, `stack-page.mjs`, `freshness.mjs` and `notFoundHtml` (that one builds its own head from `base`; give it the same preload and stylesheet lines with absolute `${base}/` paths). The homepage passes `root: "./"` through `headMetaHtml`. Add the Google Fonts check to `checkPage`.

- [ ] **Step 6: Build and check**

Run: `npm run check && grep -rl "fonts.googleapis" site/dist | head`
Expected: check green; grep prints nothing.

- [ ] **Step 7: Commit**

```bash
git add site/public/fonts site/public/styles.css site/lib/shared.mjs site/public/index.html site/lib/entry-page.mjs site/lib/stack-page.mjs site/lib/freshness.mjs site/lib/page-checks.mjs site/build.mjs site/lib/lib.test.mjs
git commit -m "site: self-host Public Sans and IBM Plex Mono, one shared head

Closes #87"
```

---

### Task 4: Shared entry templates with thumbnails, cards and list views

**Files:**
- Create: `site/lib/cards.mjs` (browser-safe; imports only `./shared.mjs`)
- Modify: `site/config.json` (each category gains `"view": "cards" | "list"`), `site/build.mjs:168-240` (`entryRowHtml`, `groupedRowsHtml` replaced by calls into cards.mjs; `loadEntries` attaches `thumb`), `site/build.mjs` main (copy `cards.mjs` and `shared.mjs` into dist with their `.mjs` names), `site/public/app.js:54-110, 222-266, 381-389` (delete the duplicated helpers and `cardHtml`/`headingHtml`; import from `./cards.mjs`), `site/public/styles.css` (`.entry-list` becomes a grid; new `.entry-thumb`, `.entry-tile`, `[data-view]` rules)
- Test: `site/lib/lib.test.mjs`

**Interfaces:**
- Consumes: `thumbRelPath`, `previewCredit` from Task 1; `thumbs.json` from Task 2.
- Produces (exports of `site/lib/cards.mjs`):
  - `CARD_LIMIT = 6`, `LIST_LIMIT = 8`.
  - `thumbHtml(entry, root) -> string`: with `entry.thumb` → `<img class="entry-thumb-img" src="<root>thumbs/<id>.webp" width="W" height="H" alt="" loading="lazy" decoding="async">`; otherwise `tileHtml(entry)`.
  - `tileHtml(entry) -> string`: `<div class="entry-tile" data-cat="<category>" aria-hidden="true"><span class="entry-tile-name">NAME</span><span class="entry-tile-note">CATEGORY-LABEL-OR-ID · LICENCE</span></div>`; the motif is CSS by `data-cat`.
  - `entryCardHtml(entry, { root, repo, now, view, lead = "", trail = "" }) -> string`: the one `<article class="entry-card" data-view="cards|list" ...>` markup with `<div class="entry-thumb">` first, then the existing `.entry-body` (heading link `href="<root>entry/<id>/"`, flags, summary, meta-line, entry-links), `lead` HTML inserted before the heading and `trail` after the meta-line. Keeps `id`, `data-id`, `data-status`, `style="--edge:..."`, `.entry-edge`.
  - `groupHeadingHtml({ cat, label, count, view, root }) -> string`: `<h3 class="group-heading" id="group-<cat>" data-cat="<cat>" data-view="<view>"><span class="group-name">LABEL</span><span class="group-count"><span class="sr-only">, </span>COUNT<span class="sr-only"> entries</span></span><span class="group-tools"></span></h3>` (the toggle is injected into `.group-tools` by app.js, Task 5).
  - `groupMoreHtml({ cat, label, count, root }) -> string`: `<a class="group-more" data-cat="<cat>" href="<root>category/<cat>/">Show all COUNT in LABEL</a>`.
  - `groupedEntriesHtml(entries, categories, { root, repo, now, limit = true }) -> string`: per category in config order: heading, then the first `CARD_LIMIT`/`LIST_LIMIT` entries (by the category's `view`) when `limit`, else all, then `groupMoreHtml` when `limit` and the category has more than the limit.
  - Re-exports `escapeHtml` (alias of `esc`), `commercialLabel`, `verifiedAge`, `edgeVar`, `PERSPECTIVE_LABELS`, `MAINTENANCE_NOTES`, `ENGINE_LOCK_NOTES`, `ENGINE_LOCK_LABELS` so `app.js` drops its copies.
  - `data.js` entries gain `thumb: { path, width, height } | null` (build attaches it from the manifest in `loadEntries`).

- [ ] **Step 1: Write the failing tests** in `site/lib/lib.test.mjs`:

```js
import { entryCardHtml, groupHeadingHtml, groupMoreHtml, groupedEntriesHtml, thumbHtml, tileHtml } from "./cards.mjs";
const base = { id: "x", name: "X Pack", url: "https://x.itch.io/p", category: "3d", license: "CC0", commercial: true, status: "active", formats: ["GLB"], verified: "2026-10-01", path: "catalog/3d/x.md", summary: "S." };
has("cards: img with dimensions and lazy", thumbHtml({ ...base, thumb: { path: "thumbs/x.webp", width: 640, height: 400 } }, "../../"), '<img class="entry-thumb-img" src="../../thumbs/x.webp" width="640" height="400" alt="" loading="lazy" decoding="async">');
has("cards: tile when no thumb", thumbHtml(base, ""), 'class="entry-tile" data-cat="3d"');
has("cards: tile carries name", tileHtml({ ...base, name: "A <b>" }), "A &lt;b&gt;");
has("cards: card view attribute", entryCardHtml(base, { root: "", repo: "https://r", now: Date.parse("2026-10-23"), view: "cards" }), '<article class="entry-card" data-view="cards"');
has("cards: lead and trail slots", entryCardHtml(base, { root: "", repo: "https://r", now: 0, view: "list", lead: "<p class=\"pick-need\">Need</p>", trail: "<p>Why</p>" }), '<p class="pick-need">Need</p>');
has("cards: heading count readable", groupHeadingHtml({ cat: "3d", label: "3D", count: 77, view: "cards", root: "" }), '<span class="group-count"><span class="sr-only">, </span>77<span class="sr-only"> entries</span></span>');
has("cards: show-all link", groupMoreHtml({ cat: "3d", label: "3D", count: 77, root: "" }), '<a class="group-more" data-cat="3d" href="category/3d/">Show all 77 in 3D</a>');
{
  const many = Array.from({ length: 9 }, (_, i) => ({ ...base, id: `e${i}`, name: `E${i}` }));
  const html = groupedEntriesHtml(many, { "3d": { label: "3D", view: "cards" } }, { root: "", repo: "https://r", now: 0 });
  eq("cards: limit six cards", (html.match(/<article /g) || []).length, 6);
  has("cards: more link after limit", html, "Show all 9 in 3D");
  eq("cards: no limit when asked", (groupedEntriesHtml(many, { "3d": { label: "3D", view: "cards" } }, { root: "", repo: "https://r", now: 0, limit: false }).match(/<article /g) || []).length, 9);
  eq("cards: list limit eight", (groupedEntriesHtml(many, { "3d": { label: "3D", view: "list" } }, { root: "", repo: "https://r", now: 0 }).match(/<article /g) || []).length, 8);
}
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `node site/lib/lib.test.mjs`
Expected: import of `./cards.mjs` fails.

- [ ] **Step 3: Read `craft-floor.md`, then implement `site/lib/cards.mjs`** per the Interfaces block. Move `edgeVar` from `build.mjs` into `shared.mjs` (export it) so cards.mjs and build share it.

- [ ] **Step 4: Wire the build.** In `site/config.json` set `view` to `cards` for `3d, environment, 2d, characters, animation, shaders-vfx` and `list` for `audio, video, fonts, tools`. In `build.mjs`: `loadEntries` reads `site/thumbs.json` (if present) and sets `thumb` for ids in it (`{ path: thumbRelPath(id), width, height }`) else `null`; `ENTRY_ROWS` becomes `groupedEntriesHtml(visible, config.categories, { root: "", repo: repoUrl, now })`; delete `entryRowHtml`, `groupedRowsHtml`, `maintenanceFlagHtml`, `engineLockFlagHtml` from build.mjs (they live in cards.mjs now); `copyOut` `lib/cards.mjs` → `cards.mjs` and `lib/shared.mjs` → `shared.mjs`.

- [ ] **Step 5: Wire `app.js`.** Replace its `cardHtml`/`headingHtml` and the duplicated constants with imports from `./cards.mjs` (`entryCardHtml(e, { root: "", repo, now: NOW, view: viewFor(e.category) })` where `viewFor` reads `data.categories[cat].view`). `adoptNodes` must also adopt `.group-more` nodes into a third map `moreNodes` and keep them (the "anything else goes" loop lists `.entry-card, .group-heading, .group-more`). Cut-off behaviour and the toggle are Task 5; for this task `renderGrid` simply hides every `.group-more` node so the JS page shows the full list as today.

- [ ] **Step 6: CSS.** In `styles.css`: `.entry-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }`, two columns under 720px, one under 480px; `.group-heading, .group-more, .entry-card[data-view="list"], .entry-list > h3.sr-only { grid-column: 1 / -1; }`; `.entry-card[data-view="cards"]` stacks `.entry-thumb` (aspect-ratio 16 / 10, `object-fit: cover`, background `var(--line)`) above `.entry-body`; `.entry-card[data-view="list"]` is `display: grid; grid-template-columns: 56px 1fr; gap: 12px` with the thumb square (`aspect-ratio: 1`, border-radius 4px) and the summary paragraph hidden on narrow screens only; `.entry-tile` uses `repeating-linear-gradient(135deg, var(--surface) 0 6px, var(--bg) 6px 12px)`, name in 600 weight, note in `var(--mono)` 11px `var(--muted)`; `[data-cat="audio"]` tile uses a 90deg stripe, `[data-cat="fonts"]` prefixes the name with "Aa " via `::before`, `[data-cat="tools"]` uses a 0deg 8px rule pattern. Dark mode needs no new rules because only tokens are used. Keep the existing `.entry-card` hover, focus and `:target` rules.

- [ ] **Step 7: Build, test, and look**

Run: `npm run check`
Expected: green. Then open `site/dist/index.html` via `npx --yes serve site/dist` in the background and take one desktop screenshot of the 3D section with Playwright (save under `E:\Free-Game-Dev-Assets\.playwright-mcp\t4-cards.jpeg`); confirm images render and tiles show names.

- [ ] **Step 8: Commit**

```bash
git add site/lib/cards.mjs site/lib/shared.mjs site/build.mjs site/public/app.js site/public/styles.css site/config.json site/lib/lib.test.mjs
git commit -m "site: one entry template for build and app.js, thumbnails, cards and list views"
```

---

### Task 5: Homepage: hero, filmstrip, per-category cut-off, view toggle, mobile header

**Files:**
- Modify: `site/public/index.html:36-49` (hero), `:195` (grid), `:230-232` (to-top), `site/build.mjs` main (substitutions `HERO_COUNT`, `FILMSTRIP`, hero copy), `site/lib/freshness.mjs:36-48` (`freshnessLineHtml` shortened), `site/public/app.js` (cut-off, `.group-more` click, view toggle, list form while searching), `site/public/styles.css` (hero, filmstrip, toggle, topbar at ≤640px, to-top, side-tab rule at line ~700)
- Test: `site/lib/lib.test.mjs`

**Interfaces:**
- Consumes: `filmstripPick` (Task 1), `groupedEntriesHtml`, `CARD_LIMIT`, `LIST_LIMIT` (Task 4).
- Produces: `filmstripHtml(entries, { root }) -> string` exported from `site/lib/cards.mjs`: `<ul class="filmstrip" aria-label="A few of the assets inside">` with one `<li><a href="<root>entry/<id>/"><img src="<root>thumbs/<id>.webp" width height alt="NAME" loading="eager" decoding="async"></a></li>` per entry (first three `loading="eager"`, the rest `lazy`). `freshnessLineHtml(stats, stamp, href)` now returns exactly `<strong>${fresh} of ${total}</strong> licences re-read in the last 180 days. <a href="${href}">Every check, oldest first</a>.` app.js localStorage keys: `fgda:view:cards-default` and `fgda:view:list-default`, values `cards` | `list`.

- [ ] **Step 1: Write the failing tests** in `site/lib/lib.test.mjs`:

```js
import { filmstripHtml } from "./cards.mjs";
has("filmstrip: links and alt", filmstripHtml([{ id: "x", name: "X Pack", thumb: { path: "thumbs/x.webp", width: 640, height: 400 } }], { root: "./" }), '<a href="./entry/x/"><img src="./thumbs/x.webp" width="640" height="400" alt="X Pack" loading="eager"');
eq("filmstrip: empty when nothing to show", filmstripHtml([], { root: "" }), "");
eq("freshness line is one sentence", freshnessLineHtml({ fresh: 414, total: 416, aging: 2, stale: 0, unknown: 0, oldest: null, recent: [] }, "2026-10-23", "freshness/"), '<strong>414 of 416</strong> licences re-read in the last 180 days. <a href="freshness/">Every check, oldest first</a>.');
```

Update any existing `freshnessLineHtml` assertions in the file to the new string.

- [ ] **Step 2: Run the tests to see them fail**

Run: `node site/lib/lib.test.mjs`
Expected: the new assertions fail.

- [ ] **Step 3: Implement `filmstripHtml`, shorten `freshnessLineHtml`, and rewrite the hero** in `index.html`:

```html
<section class="hero" aria-labelledby="hero-title">
  <h1 id="hero-title"><!--HERO_COUNT--> free game assets.<br>Every licence read at the source.</h1>
  <p class="hero-lead">2D, 3D, audio, fonts, shaders and tools, with commercial use and attribution spelled out per entry.</p>
  <p class="hero-actions"><a class="btn" href="#catalog">Browse catalog</a> <a class="text-link" href="#starters">Jump to safe starters</a></p>
  <p class="freshness-line"><!--FRESHNESS_LINE--> <!--NEW_LINE--></p>
  <!--FILMSTRIP-->
</section>
```

`HERO_COUNT` = `stats.total`; `FILMSTRIP` = `filmstripHtml(filmstripPick(visible, { count: 9, cardCategories }), { root: "" })` where `cardCategories` are the config categories with `view: "cards"`. The `<h1>` keeps the site name for SEO in `<title>`; the page's `og:title` stays `site.title`. Add to the homepage footer, after the licence paragraph, `<p class="footer-credit">Preview images belong to their publishers and are shown under each entry's licence.</p>`; Tasks 6 and 7 put the same line in the category, entry and stack footers (the test fixture `base` from Task 4's test block is reused there).

- [ ] **Step 4: app.js cut-off and toggle.** In `renderGrid`, when `shouldGroup()` and `state.q` is empty and no other filter differs from `DEFAULTS` (compare with `stateQuery(state, DEFAULTS) === ""`), hide cards past each category's limit (`CARD_LIMIT` or `LIST_LIMIT` by the category's current view) and show that category's `.group-more` with its count; otherwise show every matching card and hide all `.group-more`. A click on `.group-more` sets `state.category` to its `data-cat` and `apply({ push: true })` (preventDefault; the link still works without JS). Inject into each heading's `.group-tools` a `<div class="view-toggle" role="group" aria-label="View"><button type="button" data-view="cards" aria-pressed>Cards</button><button type="button" data-view="list" aria-pressed>List</button></div>`; clicking sets `data-view` on the heading and on every card of that category, and stores the choice under `fgda:view:<default>-default` where `<default>` is the category's config view, so all card-default categories move together and all list-default ones move together; on load, apply stored choices. While `state.q` is non-empty, every card gets `data-view="list"` without touching storage; clearing the query restores. Store reads and writes in try/catch.

- [ ] **Step 5: CSS.** Hero: `h1` at `clamp(1.75rem, 4vw, 2.5rem)`, line-height 1.1, letter-spacing -0.02em; `.filmstrip` is a `display: grid; grid-template-columns: repeat(9, 1fr); gap: 4px` row of square thumbs with `border-radius: 4px; object-fit: cover`, and under 640px `display: flex; overflow-x: auto; scroll-snap-type: x mandatory` with 72px items. `.view-toggle` is a segmented control (`border: 1px solid var(--line)`, pressed state `background: var(--ink); color: var(--bg)`), 32px tall, 44px on `pointer: coarse`. Topbar under 640px: `.topbar` wraps to two rows, `.topnav` becomes `overflow-x: auto; white-space: nowrap` with each link `min-height: 44px; display: inline-flex; align-items: center; padding: 0 12px`. `.to-top` moves to `left: 16px; right: auto`, and `body:has(.entry-links :focus-visible) .to-top { opacity: 0; pointer-events: none }`. Remove the `border-left: 3px solid var(--warn)` rule near line 700 (identify its selector first; if it marks needs-review rows, replace it with `--edge: var(--warn)` on `[data-status="needs-review"]`).

- [ ] **Step 6: Build and look**

Run: `npm run check`, then screenshots with Playwright at 1280 and 390 widths of the homepage top and of the Tools section (`.playwright-mcp/t5-home-desktop.jpeg`, `t5-home-mobile.jpeg`, `t5-tools-cards.jpeg` after clicking the Tools "Cards" toggle). Confirm: nine filmstrip images, six 3D cards then "Show all 78 in 3D", toggle works, no horizontal page scroll at 390px (`document.documentElement.scrollWidth <= 390`).

- [ ] **Step 7: Commit**

```bash
git add site/public/index.html site/build.mjs site/lib/freshness.mjs site/lib/cards.mjs site/public/app.js site/public/styles.css site/lib/lib.test.mjs
git commit -m "site: hero with filmstrip, per-category previews, cards/list toggle, mobile header

Closes #75"
```

---

### Task 6: Static category pages

**Files:**
- Create: `site/lib/category-page.mjs`, `site/public/category.js`
- Modify: `site/build.mjs` (write `category/<cat>/index.html`, include in `checkPages`), `site/lib/exports.mjs:15-27` (`sitemapXml` gains `categories`), `site/lib/entry-page.mjs:138` (breadcrumb to `../../category/<cat>/`), `site/lib/llms.mjs` (one line per category page in `llms.txt`, if the file lists pages)
- Test: `site/lib/lib.test.mjs`

**Interfaces:**
- Produces: `categoryPageHtml({ cat, meta, entries, site, stamp, total, hasCard, now }) -> string`: full page with `root: "../../"`, `<title>` `${meta.label} assets | ${site.title}` clipped by `seoTitle` rules, description `${entries.length} free ${meta.label} sources: ${meta.blurb}. Every licence read at the source.` clipped to 160, breadcrumb `Catalog / LABEL`, `<h1>LABEL</h1>`, a `<p class="section-blurb">` with the count and blurb, a link `Search and filter on the catalog page` to `../../?cat=<cat>#catalog`, and `<div class="entry-list" id="entry-grid">` holding `groupedEntriesHtml(entries, { [cat]: meta }, { root: "../../", repo, now, limit: false })`. Loads `../../category.js` (module) which imports `./cards.mjs` only for the view toggle (same storage keys as Task 5). `sitemapXml({ ..., categories: [{ id, lastmod }] })` adds `<url>` entries at `${base}/category/<id>/`.

- [ ] **Step 1: Write the failing tests**

```js
import { categoryPageHtml } from "./category-page.mjs";
{
  const html = categoryPageHtml({ cat: "3d", meta: { label: "3D", blurb: "Models, scans, PBR textures", view: "cards" }, entries: [base], site: { title: "Free Game Dev Assets", tagline: "t", siteUrl: "https://s/x/", repo: "https://r" }, stamp: "2026-10-23", total: 1, hasCard: false, now: 0 });
  has("category page: title", html, "<title>3D assets | Free Game Dev Assets</title>");
  has("category page: root-relative thumbs or tiles", html, 'href="../../entry/x/"');
  eq("category page: no more link", html.includes("group-more"), false);
  has("category page: footer credit line", html, "Preview images belong to their publishers and are shown under each entry's licence.");
  eq("category page: page checks pass", checkPage(html, { file: "category/3d/index.html", kindOf: () => "file" }).join(), "");
}
has("sitemap: category pages", sitemapXml({ site: { siteUrl: "https://s/" }, entries: [], stacks: [], stamp: "2026-10-23", categories: [{ id: "3d", lastmod: "2026-10-23" }] }), "<loc>https://s/category/3d/</loc>");
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `node site/lib/lib.test.mjs`
Expected: import of `./category-page.mjs` fails.

- [ ] **Step 3: Implement `category-page.mjs`, `category.js`, the sitemap change, and the build step.** In `build.mjs` main, after the entry pages: for each configured category with at least one visible entry, `writeOut(path.join("category", cat, "index.html"), categoryPageHtml(...))` and add those files to the `checkPages` list; pass `categories: Object.keys(config.categories).map((id) => ({ id, lastmod: stamp }))` to `sitemapXml`. Change the entry-page breadcrumb category link to `../../category/${cat}/`. Copy `category.js` through the existing `copyPublic`.

- [ ] **Step 4: Build and verify**

Run: `npm run check && ls site/dist/category`
Expected: ten category folders; `site/dist/index.html` is under 150 KB (`wc -c`).

- [ ] **Step 5: Commit**

```bash
git add site/lib/category-page.mjs site/public/category.js site/build.mjs site/lib/exports.mjs site/lib/entry-page.mjs site/lib/llms.mjs site/lib/lib.test.mjs
git commit -m "site: static category pages behind the homepage previews"
```

---

### Task 7: Entry page and stack page refinements

**Files:**
- Modify: `site/lib/entry-page.mjs:62-172` (strip, credit, actions), `site/lib/stack-page.mjs:79-105` (picks as cards), `site/public/styles.css` (`.entry-strip`, `.facts`, `.page-actions`, `.owes`, `.btn-ghost` sizing, `.pick-list` grid)
- Test: `site/lib/lib.test.mjs`

**Interfaces:**
- Consumes: `thumbHtml`, `entryCardHtml`, `previewCredit`.
- Produces: entry page markup `<figure class="entry-strip">` + `<figcaption class="entry-credit">` only when `entry.thumb` is set; `<p class="page-actions"><a class="btn" ...>Go to source</a></p><p class="page-links"><a>View the file on GitHub</a> · <a>Report a problem with this entry</a> · <button class="link-button shortlist-toggle" ...>Add to shortlist</button></p>`. Stack picks: `<li class="pick">` wraps `entryCardHtml(entry, { root: "../../", repo, now, view: "cards", lead: '<p class="pick-need">NEED</p>', trail: '<p class="pick-why">WHY</p>' })`.

- [ ] **Step 1: Write the failing tests**

```js
{
  const html = entryPageHtml({ entry: { ...base, thumb: { path: "thumbs/x.webp", width: 640, height: 400 }, publisher: "Kenney" }, leadHtml: "<p>l</p>", restHtml: "<p>r</p>", deprecatedReasonHtml: null, prev: null, next: null, site: { title: "T", tagline: "t", siteUrl: "https://s/", repo: "https://r" }, categoryLabel: "3D", stamp: "2026-10-23", total: 1, hasCard: false, now: 0 });
  has("entry page: strip image", html, '<figure class="entry-strip"><img class="entry-thumb-img" src="../../thumbs/x.webp"');
  has("entry page: credit line", html, '<figcaption class="entry-credit">Preview image from Kenney, shown under CC0</figcaption>');
  has("entry page: one primary action", html, '<p class="page-actions"><a class="btn" href="https://x.itch.io/p"');
  eq("entry page: ghost buttons gone from actions", (html.match(/class="btn-ghost"/g) || []).length, 0);
}
eq("entry page: no strip without thumb", entryPageHtml({ entry: base, leadHtml: "", restHtml: "", deprecatedReasonHtml: null, prev: null, next: null, site: { title: "T", tagline: "t", siteUrl: "https://s/", repo: "https://r" }, categoryLabel: "3D", stamp: "2026-10-23", total: 1, hasCard: false, now: 0 }).includes("entry-strip"), false);
```

(The existing `stackPageHtml` tests must still pass; add `has("stack page: pick renders as card", ..., 'class="entry-card" data-view="cards"')` on the existing stack fixture.)

- [ ] **Step 2: Run the tests to see them fail**

Run: `node site/lib/lib.test.mjs`
Expected: the new entry-page assertions fail.

- [ ] **Step 3: Read `craft-floor.md`, then implement.** Entry page: strip after the `<h1>` and before `.entry-lead`, `thumbHtml(entry, "../../")` inside the figure (the figure's CSS: `max-height: 360px; object-fit: contain; background: var(--bg); border: 1px solid var(--line); border-radius: 8px`), credit caption in `var(--mono)` 12px `var(--muted)`. Actions as in Interfaces. `entry.js` and `shortlist.js` select `.shortlist-toggle`, so the moved button keeps working; confirm by grep. Stack page: `rowHtml` returns the card wrapper; `.pick-list` becomes the same 3-column grid as `.entry-list` (reuse the class: give the `<ul>` `class="pick-list entry-list"`).

- [ ] **Step 4: CSS.** `.facts dt, .facts dd { font-family: var(--font) }` with `dt` 12px uppercase `letter-spacing: .04em` `var(--muted)` and `dd` 15px; `.owes` body in `var(--font)`, `.owes .attribution-string` stays `var(--mono)`; `.btn-ghost, .link-button { min-height: 44px }` on `pointer: coarse` and 36px otherwise; `.page-links` is a flex row with 12px gap, wrapping, 44px targets on coarse pointers.

- [ ] **Step 5: Build and look**

Run: `npm run check`; Playwright screenshots of `entry/kenney-car-kit/` and `stack/2d-pixel-platformer/` at 1280 (`.playwright-mcp/t7-entry.jpeg`, `t7-stack.jpeg`).

- [ ] **Step 6: Commit**

```bash
git add site/lib/entry-page.mjs site/lib/stack-page.mjs site/public/styles.css site/lib/lib.test.mjs
git commit -m "site: entry page image strip and one primary action; stack picks as cards"
```

---

### Task 8: Monthly thumbnail workflow and docs

**Files:**
- Create: `.github/workflows/thumbs.yml`
- Modify: `site/README.md` (new files, `npm run thumbs`, manifest, category pages, fonts), `README.md` site section if it lists site features (one line on previews), `docs/superpowers/specs/2026-10-23-site-refresh-design.md` (no change unless a decision moved)

- [ ] **Step 1: Write `.github/workflows/thumbs.yml`** mirroring `reverify.yml`: `on: schedule: cron "0 9 1 * *"` and `workflow_dispatch`; `permissions: contents: write, issues: write`; steps: checkout (same pinned SHA), setup-node (same pinned SHA), `sudo apt-get install -y ffmpeg` guarded by `if ! command -v ffmpeg`, `node site/thumbs.mjs --report thumbs-report.md` with `id: run`, then if `steps.run.outputs.changed != '0'`: configure git user `github-actions[bot]`, `branch=thumbs/$(date -u +%Y-%m)`, `git switch -c "$branch"`, `git add site/thumbs.json site/public/thumbs`, commit `thumbs: monthly refresh`, `git push --force origin "$branch"`, then open or update one issue titled `Thumbnail refresh <month>: <n> changes` with the report body plus a first line `Open the pull request: https://github.com/TMHSDigital/Free-Game-Dev-Assets/compare/main...<branch>?expand=1`, using the same `gh issue list` / `edit` / `create` pattern as reverify (label `site`).

- [ ] **Step 2: Validate the workflow file**

Run: `node -e "const y=require('fs').readFileSync('.github/workflows/thumbs.yml','utf8'); for (const k of ['workflow_dispatch','contents: write','issues: write','thumbs.mjs','compare/main']) if(!y.includes(k)) throw new Error('missing '+k); console.log('ok')"`
Expected: `ok`.

- [ ] **Step 3: Update `site/README.md`** with: `site/thumbs.mjs` and `site/thumbs.json`, `site/public/thumbs/`, `site/public/fonts/`, `site/lib/cards.mjs`, `site/lib/category-page.mjs`, `category/<id>/` pages, the `thumbs` npm script, and the rule that `cards.mjs` and `shared.mjs` must stay free of `node:` imports because they are served to the browser.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/thumbs.yml site/README.md README.md
git commit -m "site: monthly thumbnail refresh workflow and docs"
```

---

### Task 9: Verification pass, detector, Lighthouse, PR

**Files:**
- Modify: whatever the batch of fixes touches (styles.css most likely)

- [ ] **Step 1: Clean build and full check**

Run: `node site/build.mjs --clean && npm run check`
Expected: green; `site/dist/index.html` under 150 KB; `site/dist/data.js` present once.

- [ ] **Step 2: Detector**

Run: `sh C:/Users/16mat/.claude/skills/impeccable/scripts/impeccable detect --json site/public/styles.css site/public/index.html site/lib/cards.mjs site/lib/entry-page.mjs site/lib/stack-page.mjs site/lib/category-page.mjs`
Expected: no findings beyond known false positives; fix real ones.

- [ ] **Step 3: One batched screenshot round** (serve `site/dist` with `npx --yes serve site/dist` in the background): homepage 1280 and 390, dark mode 390, Tools in Cards view, a category page, an entry page with an image, an entry page without, the stack page; plus a no-JS check (`browser_evaluate` after blocking `app.js`, or simply load `index.html` from the file system) confirming six cards and a working "Show all" link. Record horizontal overflow (`scrollWidth`) at 390 for each page. Fix everything the round shows in one batch, confirm with at most one more round.

- [ ] **Step 4: Lighthouse**

Run: `npx --yes lighthouse http://localhost:3000/ --preset=perf --form-factor=mobile --screenEmulation.mobile --output=json --output-path="C:\Users\16mat\AppData\Local\Temp\claude\E--Free-Game-Dev-Assets\926d9f61-c4d8-441c-ab73-6503b49d0158\scratchpad\lh-after.json" --chrome-flags="--headless=new"` and read `categories.performance.score`, `audits["cumulative-layout-shift"].numericValue`, `audits["largest-contentful-paint"].displayValue` with a sandboxed node one-liner.
Expected: performance ≥ 0.90, CLS < 0.05. Also run the default preset once for accessibility = 1.

- [ ] **Step 5: Commit the fixes and open the PR**

```bash
git add -A site docs
git commit -m "site: verification fixes from the screenshot and detector round"
git push -u origin site-refresh
```

Then `gh pr create` with title `Site refresh: thumbnails, cards and list views, self-hosted fonts, category pages` and a body that lists the spec path, the before/after Lighthouse numbers, the thumbnail batch size, the licence gate in one paragraph, `Closes #75` and `Closes #87` on separate lines, and the attribution line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Hand the merge to the maintainer (the classifier blocks `gh pr merge`).

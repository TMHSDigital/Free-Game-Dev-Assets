# Site

Static GitHub Pages UI for this catalog.

## Single source of truth

`site/build.mjs` scans every `catalog/**/*.md` (except `README.md` / `TEMPLATE.md`), reads YAML frontmatter, and writes `site/dist/data.js` + static assets.

| You edit | What updates |
| --- | --- |
| `catalog/<category>/<id>.md` | Catalog list, search, filters, counts |
| `site/config.json` → `featured` | Safe starting points table (`id` + `need`) |
| `site/config.json` → `categories` / `guides` | Labels and guide links |
| `site/public/*` | Page chrome / design |
| `site/config.json` → `categories.<id>.view` | Whether a category previews as cards or as a list |
| `site/thumbs.json` + `site/public/thumbs/` | The preview image on each entry's card, strip and filmstrip (see Thumbnails) |
| An entry's body (Notes, Evidence) | Its page at `entry/<id>/` |
| `stacks/<id>.md` | Its page at `stack/<id>/`, the homepage Starter stacks list, and "Used in" on each picked entry |

## Other exports

Each deploy also publishes
[`catalog.csv`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/catalog.csv) (one row
per entry: id, name, url, category, licence, SPDX, commercial, attribution, formats, tags,
added, verified, status, page; list fields are joined with `; `) and two Atom feeds:
[`feed.xml`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/feed.xml), the 40 newest
entries by `added` (the day each joined the catalog), and
[`reverified.xml`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/reverified.xml), the
40 most recently verified entries by `verified` (the day the licence was last read at the
source). Two feeds, so a re-verification sweep of old entries cannot bury the new ones.

## Public JSON

Every deploy publishes the whole catalog as
[`data.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/data.json), for scripts
and tools that want the metadata without scraping the page. The page itself loads
`data.js`, the same payload assigned to `window.__CATALOG__`.

- Top-level keys: `generatedAt`, `version` (the calendar tag of the day, `vYYYY.MM.DD`),
  `site`, `categories`, `guides`, `featured`, `stats`, `entries`.
- Each entry carries its frontmatter fields (`id`, `name`, `url`, `category`,
  `subcategories`, `license`, `license_spdx` where set, `commercial`,
  `attribution_required`, `attribution_string` where set, `formats`, `tags`, `added`,
  `verified`, `status`, `publisher` where set, and the optional 2D fields), plus `path` (the entry's
  file in this repo), `page` (the entry's page, relative to the site root), `summary` (the first paragraph of its body), `thumb`
  (`{ path, width, height }` of the entry's preview image relative to the site root, or `null`), and two derived sort
  fields, `attributionClass` and `licenseRank`.
- It is regenerated from `catalog/` on every push to `main`. Field names are stable;
  new optional fields may appear. The licence facts are only as current as each entry's
  `verified` date: re-check the source before you ship on one.

## Entry pages

`build.mjs` writes `entry/<id>/index.html` for every entry from its frontmatter and
body, using `site/lib/markdown.mjs`. The renderer supports exactly what entries use:
`#` and `##` headings, paragraphs, bullet lists (nesting allowed), bold, `*italic*`,
inline code, links and bare URLs. Underscores are literal. Anything else (tables,
code fences, blockquotes, images, raw HTML, `###`, numbered lists) fails the build
with the file and line, as does a relative link to a file that does not exist.

The build also writes `llms.txt` (one line per entry) and `llms-full.txt` (with each
entry's Notes) for AI assistants, and checks every generated page before it succeeds.
Tests: `node site/lib/lib.test.mjs`.

## Entry template, cards and list views

Every entry on the homepage, the category pages, the stack pages and in `app.js` renders
through one template, `site/lib/cards.mjs` (`entryCardHtml`), so the prerender and the
hydrated page cannot drift apart. Cards and List are the same markup under a `data-view`
attribute; `styles.css` lays each out. `site/config.json` sets a category's default view;
`site/public/views.js` adds the Cards / List toggle to each heading and remembers the
choice per kind of category in `localStorage`. The homepage shows the first 6 (cards) or
8 (list) entries per category and links "Show all N" to the category page; with `app.js`
the same link opens the category in place. `cards.mjs` and `shared.mjs` are copied into
`dist` as modules the browser imports, so neither may import from `node:`.

## Category pages

`build.mjs` writes `category/<id>/index.html` for every configured category with a
visible entry: the whole category, both views, no JavaScript needed to see everything
(`site/lib/category-page.mjs`, toggle from `category.js`). They are in the sitemap, and
each entry page's breadcrumb links to its category page.

## Thumbnails

`npm run thumbs` (`site/thumbs.mjs`) fetches each eligible entry's `og:image` from its
`url`, resizes it to 640 px WebP with ffmpeg (or ImageMagick) and writes
`site/public/thumbs/<id>.webp` plus a record in `site/thumbs.json` (source, image URL,
fetch date, content hash, size, licence at fetch). Eligible means `status: active` and a
licence in the allowlist in `site/lib/thumbs.mjs`; `custom`, `varies`, `unknown`,
GitHub and Google Fonts pages never qualify, and an image whose bytes three or more
entries share is treated as a logo and dropped. `preview: none` opts an entry out;
`preview: <https url>` pins an image a maintainer has checked. The run is incremental
(a record under 180 days old with the same licence is kept), removes records the gate no
longer allows, and lists failures without failing. `validate.mjs` fails when the files,
the manifest and the gate disagree (`checkThumbManifest`). `build.mjs` attaches `thumb`
to each entry; entries without one get a typographic tile.

`.github/workflows/thumbs.yml` runs the script on the first of each month (and on
demand), pushes changes to a `thumbs/<month>` branch and opens or updates one issue
labelled `enhancement` with the compare link and the report; the maintainer opens the pull
request from the link so CI runs on it.

## Fonts

Public Sans and IBM Plex Mono are served from `site/public/fonts/` (latin WOFF2, OFL,
see the README there). `baseHeadHtml` in `site/lib/shared.mjs` emits every page's icon,
font preloads and stylesheet from a `root` path, and the page checks fail any page that
still references Google Fonts.

## Starter stacks

`build.mjs` writes `stack/<id>/index.html` for each file in `stacks/` (the format is in
`stacks/README.md`). The page's "What this stack owes" panel is computed from the picked
entries: credit lines to ship, picks that need no credit, aggregators to check file by
file, and open questions. A stack never states a licence itself. V15 in `checks.mjs`
fails a stack whose pick is missing, deprecated or malformed, or whose why sentence
names a licence; `validate.mjs` and `build.mjs` both run it.

## Licence freshness

`build.mjs` writes a one-line summary under the homepage hero and `freshness/index.html`
from each entry's `verified` date, using `site/lib/freshness.mjs`. The buckets are the
cards' own (fresh up to 180 days, aging to 365, stale after). Deprecated entries are
not counted. `pages.yml` also runs every Monday at 06:17 UTC so the ages keep moving
when nothing is pushed; GitHub pauses scheduled workflows in a public repository after
60 days without activity, so a long quiet spell needs a manual run from the Actions tab.

## Sitemap

`build.mjs` writes `sitemap.xml` (home, freshness, category pages, stacks and every non-deprecated entry)
and links it from the homepage with `<link rel="sitemap">`. The `Sitemap:` line in
`robots.txt` is written too, but crawlers only read robots.txt at a host's root, so
under `/Free-Game-Dev-Assets/` it is never seen. Submit
`https://tmhsdigital.github.io/Free-Game-Dev-Assets/sitemap.xml` once in Google Search
Console and Bing Webmaster Tools; that is the step that gets it read.

## Link check

`.github/workflows/links.yml` runs `site/check-links.mjs` every Monday at 07:41 UTC (and
on demand from the Actions tab). It fetches each non-deprecated entry's `url` and opens,
or updates, one issue labelled `correction` titled "Link check: N sources need a look",
listing dead links, sources that moved to another domain or GitHub repository, and
entries verified more than a year ago. Sites that refuse the checker (401, 403, 429) are
listed for a manual look but never open the issue on their own. It edits nothing: a
moved source needs its licence re-read before its entry changes. Run it locally with
`npm run links`.

## Releases

The live Pages URL changes on every push, so a tool that bundles the catalog (a plugin,
a notebook, a paper) could not pin a version. `.github/workflows/release.yml` runs on the
first of each month and on demand: it builds, tags `vYYYY.MM.DD` and creates a GitHub
release with `data.json`, `catalog.csv`, `feed.xml`, `reverified.xml` and `llms.txt`
attached, with the newest section of `docs/review-ledger.md` as the notes. Fetch a fixed
version by tag from the Releases page; `data.json` carries the same tag as `version`.

## Re-verify batch

`.github/workflows/reverify.yml` runs `site/reverify-batch.mjs` on the first of each month
(and on demand). It picks the live entries whose licence was read longest ago, more than
150 days, about a tenth of the catalog at a time so every entry comes round in about ten
months, and opens or updates one issue labelled `help wanted` and `good first issue`
titled "Re-verify batch YYYY-MM: N entries due a licence re-read", with a checklist that
names each entry's file, source URL and recorded licence. The selection rule is in
`site/lib/reverify.mjs` and tested. When nothing is due the month is skipped. Preview it
with `node site/reverify-batch.mjs`.

## Social preview

`docs/images/readme/og-card.png` is a 1200x630 screenshot of this site's first screen.
`build.mjs` copies it into `dist` and emits the `og:image` and `twitter:image` tags.
Retake it when the hero changes.

## Commands

```bash
npm run check   # tests, validate, build: what CI runs
npm run serve   # preview site/dist
npm run links   # the link check, printed to the terminal
npm run thumbs  # fetch and resize the previews that are due (needs ffmpeg or magick)
```

Deploy: `.github/workflows/pages.yml` (source = GitHub Actions), which first runs
`ci.yml` as a reusable workflow.

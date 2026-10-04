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
| An entry's body (Notes, Evidence) | Its page at `entry/<id>/` |
| `stacks/<id>.md` | Its page at `stack/<id>/`, the homepage Starter stacks list, and "Used in" on each picked entry |

## Other exports

Each deploy also publishes
[`catalog.csv`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/catalog.csv) (one row
per entry: id, name, url, category, licence, SPDX, commercial, attribution, formats, tags,
verified, status, page; list fields are joined with `; `) and an Atom feed,
[`feed.xml`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/feed.xml), of the 40 most
recently verified entries. Entries carry no "added" date, so the feed is keyed on
`verified`, the day the licence was last read from the source.

## Public JSON

Every deploy publishes the whole catalog as
[`data.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/data.json), for scripts
and tools that want the metadata without scraping the page. The page itself loads
`data.js`, the same payload assigned to `window.__CATALOG__`.

- Top-level keys: `generatedAt`, `site`, `categories`, `guides`, `featured`, `stats`,
  `entries`.
- Each entry carries its frontmatter fields (`id`, `name`, `url`, `category`,
  `subcategories`, `license`, `license_spdx` where set, `commercial`,
  `attribution_required`, `attribution_string` where set, `formats`, `tags`, `verified`,
  `status`, `publisher` where set, and the optional 2D fields), plus `path` (the entry's
  file in this repo), `page` (the entry's page, relative to the site root), `summary` (the first paragraph of its body), and two derived sort
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

`build.mjs` writes `sitemap.xml` (home, freshness, stacks and every non-deprecated entry)
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

## Social preview

`docs/images/readme/og-card.png` is a 1200x630 screenshot of this site's first screen.
`build.mjs` copies it into `dist` and emits the `og:image` and `twitter:image` tags.
Retake it when the hero changes.

## Commands

```bash
npm run check   # tests, validate, build: what CI runs
npm run serve   # preview site/dist
npm run links   # the link check, printed to the terminal
```

Deploy: `.github/workflows/pages.yml` (source = GitHub Actions), which first runs
`ci.yml` as a reusable workflow.

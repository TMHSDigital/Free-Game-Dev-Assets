# Design: one page per catalog entry

Date: 2026-09-24. Status: implemented; see the entry for it in `docs/review-ledger.md`.

## Why

The repo is gaining stars daily. In the 14 days to 2026-09-24: 232 unique visitors,
ChatGPT the second-largest referrer (29 unique, behind github.com at 30), and the most
visited paths after the front page are individual catalog markdown files on GitHub.

The Pages site does not serve those visitors well:

- It is one page. Entry "permalinks" are `#entry-<id>` fragments, which search engines
  and AI crawlers do not index separately, so no entry can be found or cited on its own.
- The entry dialog shows frontmatter and the first paragraph only. The Notes (the
  catches), the dated Evidence quotes and the Related links exist only on GitHub.

Goals, from the maintainer: be useful to visitors, reach more people, look credible.
Converting visitors into contributors is not a goal of this project.

## What success looks like

- Someone arriving from a search engine or an AI assistant lands on the entry they
  asked about and sees its licence, commercial stance and credit requirement at once.
- Every entry has a stable, indexable, shareable URL carrying the full entry.
- The site shows everything the markdown file does, so GitHub is no longer the only
  place to read an entry's catches and evidence.

## Decisions taken

| Question | Decision |
| --- | --- |
| Page content | The full entry: summary, facts, Notes, Evidence, Related |
| Clicking an entry on the homepage | Navigates to its page; the dialog is retired |
| Clickable area | The whole card, via a stretched title link |
| Markdown rendering | A small built-in renderer; no dependencies |
| URL scheme | `/entry/<id>/` (ids are unique catalog-wide, so moving an entry between categories keeps its URL) |
| Deprecated entries | Get a page with a banner, marked `noindex`, left out of the sitemap |
| Out of scope | Pages for category READMEs and `docs/`; homepage visual changes |

## Page anatomy

URL: `<siteUrl>/entry/<id>/`. Title: `<name> (<license>) | Free Game Dev Assets`. Meta
description: the entry summary (first body paragraph, as `summaryFromBody` produces it).

Top to bottom:

1. Site top bar, then a breadcrumb: Catalog, then the category (linking to the homepage
   with `?cat=<category>`), then the entry name.
2. `h1` with the entry name; the summary paragraph.
3. "At a glance" facts:
   - Licence, with `license_spdx` when set
   - Commercial use, using the site's existing labels (commercial OK, non-commercial,
     per-file review, commercial ?)
   - Credit required; when `attribution_string` is set, the string with a Copy button
   - Status, with the legend's one-line meaning
   - Verified date with the existing fresh / aging / stale cue
   - Publisher, formats, and `camera_perspective` / `grid_dimensions` when set
4. Actions: **Go to source** (the entry `url`, primary), **View the file on GitHub**,
   **Report a problem with this entry** (the existing `correction.yml` issue template).
5. The rendered body from the first `##` onwards (Notes, Evidence, Related).
6. Previous and next entry within the same category (same order as the homepage
   grouping), then the site footer.

Deprecated entries additionally show a banner stating the entry is deprecated and why,
taken from its `- Deprecated:` line.

Without JavaScript the page is complete; the only script is the Copy button.

## Build architecture

`site/build.mjs` stays the orchestrator. Two new modules:

- **`site/lib/markdown.mjs`**: `renderEntryBody(markdown, context)` returns HTML.
- **`site/lib/entry-page.mjs`**: `entryPageHtml(entry, bodyHtml, neighbours, site)`
  returns a full HTML document.

`build.mjs` writes `dist/entry/<id>/index.html` for every entry (about 4 MB in total)
and adds `page` (the entry's URL, relative to the site root) to each entry in
`data.json` and `data.js`. `site/README.md` documents the new field.

### Renderer scope

Measured on 2026-09-24 across all 319 entry bodies: paragraphs, `#` and `##` headings,
bullet lists (three entries nest them), bold, italic (`*x*` and `_x_`), inline code,
links (relative in all 319, external in 91), bare URLs (10) and backslash escapes (4).
No tables, code fences, blockquotes, images, raw HTML or `###`.

- Supported blocks: `##` heading (rendered as `h2`), paragraph (consecutive lines
  joined), bullet list with nesting by indentation. The `#` title line is dropped.
- Supported inline: `**bold**`, `*italic*`, `_italic_`, `` `code` ``, markdown links
  (bracketed text followed by a parenthesised URL), bare `http(s)://` URLs, backslash
  escapes.
- All text is HTML-escaped before inline markup is applied. Code spans are not further
  processed.
- Anything else at block level (a line starting with `|`, three backticks, `>`, `![`, a
  raw HTML tag, `###` or deeper) throws an error naming the file and line. The build
  fails; it never renders unsupported syntax silently.

### Link rewriting

Resolved against the entry's own path in the repo:

- Target is another catalog entry (`x.md`, `../<category>/x.md`): relative page URL
  `../x/`, which works under the `/Free-Game-Dev-Assets/` base and in a local preview.
- Target is any other repo file (a category `README.md`, `docs/*.md`): its GitHub blob
  URL, built from `site.repo`.
- Absolute `http(s)` URLs are left as they are.
- A relative target that does not exist fails the build.

## Homepage changes

- Card titles and the Safe starting points table link to `entry/<id>/`, in both the
  prerendered HTML and `app.js`.
- Whole card clickable: the title link's `::after` covers the card; other links in the
  card sit above it with `position: relative` and a higher `z-index`. One named link per
  card remains for screen readers and keyboard users.
- The entry dialog, its pager, `openEntry` and the dialog CSS are removed.
- Filters already live in the query string, so Back returns to the same filtered list.
  Scroll position: on following an entry link, the page stores `scrollY` in
  `sessionStorage` keyed by the full homepage URL, and restores it after the list is
  re-rendered. Storage failures are ignored.
- Old links: a homepage load with `#entry-<id>` for a known id calls
  `location.replace("entry/<id>/")`. Without JavaScript the fragment still scrolls to
  the card, because cards keep their ids.
- `404.html` gains a line pointing to the catalog search.

Unchanged: search, filters, grouping, scroll-spy, the Search button, keyboard
shortcuts, the mobile layout.

## Search engines and AI assistants

Per entry page:

- `<link rel="canonical">` to the page's own URL.
- Open Graph and Twitter tags (title, description, URL, the existing `og-card.png`).
- JSON-LD: a `WebPage` whose `mainEntity` is a `CreativeWork` with `name`, `url` (the
  source), `description`, `publisher` when set, `dateModified` (the `verified` date),
  and `license` as a URL when `license_spdx` is set (`https://spdx.org/licenses/<id>.html`),
  omitted otherwise.
- `noindex` on deprecated entries.

Site-wide:

- `sitemap.xml` lists the homepage and every non-deprecated entry page, with `lastmod`
  from `verified`. The `#entry-` URLs are removed.
- `llms.txt`: what the catalog is, its rules (links and metadata only, licences
  checked at source, what `needs-review` means), then one line per non-deprecated
  entry: name, licence, commercial, credit required, page URL.
- `llms-full.txt`: the same header, then each entry's summary and Notes as plain text.
- Both are generated from the same data as the pages, on every build.

## Testing

Added to `site/lib/lib.test.mjs` (runs in both workflows; the spec first named `site/checks.test.mjs`):

- Renderer fixtures: one accepted case per supported feature, including nested lists
  and escapes; one rejected case per unsupported block type; escaping (an entry
  containing `<script>` renders as text); link rewriting for each target kind,
  including a missing relative target failing.

Added to the build (fails on any violation):

- Across all generated pages: no leaked markdown (a double asterisk, a closing bracket
  followed by an opening parenthesis, a backtick), exactly one
  `h1`, a canonical link, a non-empty title, and every internal link resolving to a
  generated file.

Before shipping, checked in a browser as in earlier QoL passes: contrast in light and
dark, keyboard order, the stretched link, back-navigation scroll restore, the
`#entry-` redirect, and layout at 375x800 and 800x400.

## Risks

- **Page count and build time.** 319 small files; the build is pure string work. Watch
  the Pages artifact size; no action expected.
- **Renderer drift.** A future entry using new syntax fails the build by design, with
  the file and line. The fix is to extend the renderer and its fixtures, or rewrite the
  entry.
- **Link rot on GitHub blob URLs** for docs and READMEs, if files move. The validator
  already checks relative links on the markdown side, so a move breaks there first.
- **Search engines keeping old fragment URLs.** The redirect covers visitors; the new
  sitemap replaces the old URLs for crawlers.

## Follow-ons, not in this project

- Pages for category READMEs (the "choosing" tables) and `docs/` guides.
- Starter stacks by game type (sub-project A), visible trust signals (C), README first
  screen (D), and the maintainer-only items (E), as mapped in the brainstorm.

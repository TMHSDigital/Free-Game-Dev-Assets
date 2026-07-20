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

## Commands

```bash
node site/build.mjs
npx --yes serve site/dist
```

Deploy: `.github/workflows/pages.yml` (source = GitHub Actions).

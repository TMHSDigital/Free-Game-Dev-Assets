# Use the data

The catalog is published as machine-readable files on every deploy. The metadata is CC0: copy it, bundle it or build on it without asking. The assets it links to keep their own licences.

> The licence facts are the catalog's reading of each source on the entry's `verified` date, not legal advice and not a guarantee that the terms are still the same. Re-check the source before you ship on one.

## Files

| File | What it is |
| --- | --- |
| [`data.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/data.json) | The whole catalog: every entry with its licence fields, plus categories, guides and counts |
| [`catalog.csv`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/catalog.csv) | One row per entry, for spreadsheets. Lists are joined with `; ` |
| [`feed.xml`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/feed.xml) | Atom feed of newly added sources |
| [`reverified.xml`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/reverified.xml) | Atom feed of entries whose licence was most recently re-read |
| [`llms.txt`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/llms.txt) | A plain-text summary for language-model tools |

These URLs always serve the latest build. To pin a version, download the same files from a tagged [release](https://github.com/TMHSDigital/Free-Game-Dev-Assets/releases). Releases are tagged `vYYYY.MM.DD`, and the attached `data.json` carries the same string as `version`.

## Fields

Each entry in `data.json` has these fields. `catalog.csv` has the ones marked CSV.

| Field | CSV | Meaning |
| --- | --- | --- |
| `id` | yes | Short kebab-case id, unique across the catalog |
| `name` | yes | Display name |
| `url` | yes | The source's own page |
| `category` | yes | One of the ten category folders, such as `3d`, `audio` or `tools` |
| `subcategories` | yes | Finer grouping within the category |
| `license` | yes | The licence as the catalog reads it. A value from [the vocabulary](../site/license-vocabulary.json), explained in [licenses.md](licenses.md) |
| `license_spdx` | yes | SPDX identifier, where one fits |
| `commercial` | yes | `true`, `false`, `varies` (per file) or `unknown` |
| `attribution_required` | yes | `true`, `false` or `unknown` |
| `attribution_string` | yes | The credit line as the source words it, where it gives one |
| `publisher` | yes | Who publishes the source, where recorded |
| `formats`, `tags` | yes | File formats and search tags |
| `added` | yes | Date the entry joined the catalog |
| `verified` | yes | Date the licence was last read at the source. A read date, not a validity date |
| `status` | yes | `active`, `needs-review` (an open question, read the Notes) or `deprecated` |
| `page` | yes | The entry's page on the site |
| `summary` | | The first paragraph of the entry |
| `path` | | The entry's file in this repository |
| `thumb` | | `{ path, width, height, credit? }` of the preview image, or `null` |
| `licenseFamily` | | Coarse grouping used by the site's filter: `public-domain`, `cc-by`, `permissive`, `copyleft`, `custom` and so on. Labels are in `filters.licenseFamilies` |
| `attributionClass`, `licenseRank` | | Derived sort keys used by the site |
| `engine_lock`, `grid_dimensions`, `camera_perspective` and other optional fields | | Present only where they apply; see [the site README](../site/README.md) |

Top-level keys are `generatedAt`, `version`, `site`, `categories`, `guides`, `featured`, `stats` (counts of total, active, needs-review, deprecated and commercial entries), `filters` and `entries`.

Field names are stable. New optional fields may appear, so ignore keys you do not know rather than failing on them.

## Examples

All CC0 audio that needs no credit, with `jq`:

```sh
curl -s https://tmhsdigital.github.io/Free-Game-Dev-Assets/data.json \
  | jq -r '.entries[] | select(.category=="audio" and .license=="CC0" and .attribution_required==false and .status=="active") | "\(.name)\t\(.url)"'
```

Everything usable commercially, as a table, with pandas:

```python
import pandas as pd
df = pd.read_csv("https://tmhsdigital.github.io/Free-Game-Dev-Assets/catalog.csv")
ok = df[(df.status == "active") & (df.commercial.astype(str).str.lower() == "true")]
print(ok[["name", "license", "attribution_required", "attribution_string", "url"]])
```

Follow new sources in any feed reader by subscribing to `https://tmhsdigital.github.io/Free-Game-Dev-Assets/feed.xml`.

## How to cite

The repository has a [`CITATION.cff`](../CITATION.cff), and GitHub's "Cite this repository" button renders it. In text:

> TMHSDigital. *Free Game Dev Assets: a dated, sourced catalog of free game assets and tools with licence metadata* (version vYYYY.MM.DD) [Data set]. https://github.com/TMHSDigital/Free-Game-Dev-Assets

```bibtex
@misc{free_game_dev_assets,
  author       = {TMHSDigital},
  title        = {Free Game Dev Assets: a dated, sourced catalog of free game assets and tools with licence metadata},
  howpublished = {\url{https://github.com/TMHSDigital/Free-Game-Dev-Assets}},
  note         = {Dataset, version vYYYY.MM.DD},
  license      = {CC0-1.0}
}
```

Replace `vYYYY.MM.DD` with the release you used.

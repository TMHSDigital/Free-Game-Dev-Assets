# Use the data

The catalog is published as machine-readable files on every deploy. The metadata is CC0: copy it, bundle it or build on it without asking. The assets it links to keep their own licences.

> The licence facts are the catalog's reading of each source on the entry's `verified` date, not legal advice and not a guarantee that the terms are still the same. Re-check the source before you ship on one.

## Files

| File | What it is |
| --- | --- |
| [`data.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/data.json) | The whole catalog: every entry with its licence fields, plus categories, guides, stacks and counts |
| [`data.schema.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/data.schema.json) | JSON Schema (draft 2020-12) for `data.json`. The build fails if `data.json` does not match it |
| [`plugin-feed.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/plugin-feed.json) | A slim catalog for editor plugins, with engine fit already worked out. See [Plugin feed](#plugin-feed) |
| [`plugin-feed.schema.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/plugin-feed.schema.json) | JSON Schema for `plugin-feed.json`. The build fails if the feed does not match it |
| [`catalog.csv`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/catalog.csv) | One row per entry, for spreadsheets. Lists are joined with `; ` |
| [`feed.xml`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/feed.xml) | Atom feed of newly added sources |
| [`reverified.xml`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/reverified.xml) | Atom feed of entries whose licence was most recently re-read |
| `category/<id>/feed.xml` | Atom feed of new sources in one category, such as [`category/audio/feed.xml`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/category/audio/feed.xml); each category page links its own |
| [`llms.txt`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/llms.txt) | A plain-text summary for language-model tools |

These URLs always serve the latest build. To pin a version, download the same files from a tagged [release](https://github.com/TMHSDigital/Free-Game-Dev-Assets/releases). Releases are tagged `vYYYY.MM.DD`, and the attached `data.json` carries the same string as `version`.

## Fields

Each entry in `data.json` has these fields. `catalog.csv` has the ones marked CSV. Its column order is fixed and new columns are only ever appended. A CSV cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading `'`, so a spreadsheet does not run it as a formula; strip it if you compare values.

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
| `maintenance`, `engine_lock`, `ue_versions`, `limits`, `grid_dimensions`, `camera_perspective`, `hardware_tags` | | Present only where they apply; see [the site README](../site/README.md) |

Top-level keys are `generatedAt`, `version`, `site`, `categories`, `guides`, `stacks` (id and title of each starter stack), `featured`, `stats` (counts of total, active, needs-review, deprecated, listed (total less deprecated) and commercial entries), `filters` (`licenseFamilies` and `formatGroups`, the labels and groups behind the site's filters) and `entries`.

Field names are stable, and [`data.schema.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/data.schema.json) states them as a JSON Schema the build enforces, so a field cannot be renamed or retyped without the schema changing too. New optional fields may appear, so ignore keys you do not know rather than failing on them (the schema itself rejects unknown keys, which is how the build catches drift).

## Plugin feed

`plugin-feed.json` is for editor plugins, starting with the [Godot plugin](https://github.com/TMHSDigital/free-game-dev-assets-godot). It lists the active and needs-review entries with the fields a plugin shows, filters and credits by. That makes it about a fifth of the size of `data.json` once gzipped.

- **`format`** is a whole number that goes up only on a breaking change: a field removed, renamed or retyped. New fields can appear in any build, so ignore keys you do not know. A plugin that sees a higher `format` than it supports should keep its cached copy and ask the user to update.
- **`version`** is the same `vYYYY.MM.DD` string as `data.json`.
- **Optional fields** (`license_spdx`, `publisher`, `credit_line`, `verified`) are always present, as `null` when unset.
- **`works_in`** lists the engines (`godot`, `unity`, `unreal`) an entry can be used in, based on its licence (`engine_lock`) and formats. **`made_for`** lists the engines it is built for (tagged, native format or locked to it); the site sorts these first when you pick an engine.
- **`credit_line`** is the recorded credit line, with `{…}` fields the user fills in. With `attribution_required` and `attributionClass` (where `notice` means carry the licence text with the files), it is enough to write the same CREDITS file the site's shortlist exports.

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

## From a shell, CI or an assistant

`site/cli/fgda.mjs` queries the same data with the site's search and filters, no install:

```bash
npx github:TMHSDigital/Free-Game-Dev-Assets search "pixel font" --license "SIL OFL" --commercial
npx github:TMHSDigital/Free-Game-Dev-Assets check kenney --engine godot   # exit 1 if it does not fit
npx github:TMHSDigital/Free-Game-Dev-Assets get incompetech --json
```

`check` exits 1 when the entry is not for commercial use, is locked to another engine, varies per file, or is
still `needs-review` (with its open question), so a build can stop on it. In a clone, `node site/cli/fgda.mjs`
does the same and reads `site/dist/data.json` when a build is there; `--data <file or https URL>` picks another copy.

`site/cli/mcp.mjs` is a Model Context Protocol server (stdio, no dependencies) with the tools `search_assets`,
`get_asset`, `check_license` and `list_stacks`. In Claude Desktop, Cursor or another MCP client, from a clone:

```json
{ "mcpServers": { "free-game-dev-assets": { "command": "node", "args": ["/path/to/Free-Game-Dev-Assets/site/cli/mcp.mjs"] } } }
```

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

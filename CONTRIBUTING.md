# Contributing

This repo catalogs **links and metadata** for free (preferably commercially usable) game assets and related tools. It does not host binary asset dumps.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## What belongs here

- Asset libraries, packs, and aggregators with a clear free tier
- Tools useful for creating or processing game assets
- Free engine add-ons / plugins that materially help asset or production pipelines (e.g. Godot Asset Library tools)
- Engines only when they ship substantial free asset libraries

## What does not

- Paid-only marketplaces with no free content worth listing
- Broken, abandoned, or license-unclear sources (use `status: needs-review` or open an issue)
- Redistributed ZIP/GLB/WAV files of third-party work
- Assets that are free only for non-commercial / personal use (unless clearly tagged `commercial: false`)
- GTA V / RDR2 extracts, FiveM MLO leaks, Tebex reuploads, and anonymous `fivem-props` dumps (see [`docs/fivem.md`](docs/fivem.md) and [`docs/high-risk.md`](docs/high-risk.md))

## Adding an entry

The website rebuilds from frontmatter on deploy. Node 22 or newer is all you need; there
are no dependencies to install.

1. Run `node site/new-entry.mjs <category> <id>` (or `npm run new-entry -- <category> <id>`). It copies [`catalog/TEMPLATE.md`](catalog/TEMPLATE.md) to `catalog/<category>/<id>.md` with the id, category and today's date filled in, and refuses an id already used anywhere in the catalog. Use a short kebab-case `id`; a mixed kit already listed in another category is a duplicate, not a second entry.
2. Verify the license on the live source page the day you submit, and fill every frontmatter field from it (rules below). Prefer primary URLs over mirror/aggregator pages.
3. Write the body: a one-paragraph summary, `## Notes`, and `## Evidence` with a dated line quoting the source, such as `- Live page (2026-09-25): "Free for commercial use"`. Every Evidence section needs at least one date, and `verified` may not be newer than the newest one. The scaffold starts at `status: needs-review`; set `active` once the licence, the commercial stance and the credit requirement are all settled.
4. Add a row to the matching category `README.md`. This is required: the validator fails an entry that is not listed there, and the row's licence cell must match your frontmatter.
5. Run `node site/sync-counts.mjs` (`npm run counts`). It updates every place the repo restates the entry count: both category count tables, the README badge and "Browse N sources" line, and `expectedEntryCount` in [`site/config.json`](site/config.json).
6. Run `npm run check`: the check tests, `node site/validate.mjs` and `node site/build.mjs`, all of which must pass. The build renders your entry's page and fails if the body uses markdown the site does not support (tables, code fences, blockquotes, images, raw HTML, `###` headings, numbered lists) or links to a file that does not exist.
7. Optional: add the `id` to `site/config.json` → `featured` to pin it under Safe starting points.

To add a starter stack (one pick per need for a kind of game), follow [`stacks/README.md`](stacks/README.md).

### Frontmatter rules

- `license`: the source's licence, written as one of the values in [`site/license-vocabulary.json`](site/license-vocabulary.json) (e.g. `CC0`, `CC-BY-3.0`, `SIL OFL`, `GPL-3.0-or-later`, `custom`, `varies`). If the source uses a licence the vocabulary lacks, add it there first, with its SPDX mapping and attribution class. For GPL, record `-only` or `-or-later` only when the project itself says which; otherwise use the bare `GPL-2.0` or `GPL-3.0`.
- `license_spdx`: the SPDX identifier the vocabulary maps your `license` to. The validator rejects a missing one when a mapping exists, and an invented one when it does not.
- `commercial`: `true` / `false` / `unknown` / `varies`. Use `varies` for aggregators where some files are commercial-ok and others are not. The site still shows these under Commercial OK, labeled **per-file review**, so they are not silently excluded and not silently treated as a blanket grant.
- `attribution_required`: `true` / `false` / `unknown`. If the licence normally requires credit (CC-BY) but the publisher waives it, set `false` and add a `- Attribution waived:` line in Notes saying so.
- `attribution_string`: the copy-paste credit line. Required when `attribution_required` is `true`; optional otherwise.
- `publisher`: optional. Name the **rights-holding publisher**, never the host. Set it whenever that publisher has more than one catalog entry, so the entries group; setting it on a publisher that currently has only one entry is also fine and saves a backfill later. Do not set it to a generic host or distributor (GitHub, Hugging Face, itch.io, OpenGameArt, the Internet Archive, Google Fonts) or to a distributor that does not hold the rights. Distinguish sibling organisations that are genuinely different rights holders: `blender.md` (the application, Blender Foundation) carries no `publisher`, while the asset bundles under `studio.blender.org` carry `Blender Studio`. Kenney, Quaternius, KayKit, LuizMelo, 0x72, Blender Studio, Material Maker, Alif Type, GGBotNet and 3dmodelscc0 are the largest groups in use today; treat that as illustrative, not as the permitted set.
- `subcategories`: lower-case kebab-case (`base-meshes`, `field-recordings`). Reuse a value already in the catalog before inventing one, and do not add a variant of an existing value that differs only in plural or spelling. Where both forms were in use, the more common one was kept (`characters`, `environment`, `interior`, `tileset`, `vectors`, `pixel`, `impulse-responses`, `base-meshes`). Retired spellings are listed in [`site/value-aliases.json`](site/value-aliases.json), which the validator enforces (V19); add a line there when you merge two values.
- `formats`: what you actually get, in one of four kinds. **File formats**, as commonly written: usually upper case (`PNG`, `FBX`, `JSON`, `VOX`), tool-specific ones as the tool writes them (`gdshader`, `tmx`, `ktx2`). **Engine or language targets**, as the product writes them (`glTF`, `Godot`, `Unity`, `Python`, `React`). **Delivery types** for software with no file format of its own, lower-case kebab-case (`godot-addon`, `blender-extension`, `npm`, `cli`, `library`, `desktop-app`, `mobile-app`, `middleware`, `model`). And `various` for an aggregator whose files come in too many formats to list. Platforms (`windows`, `macos`, `ios`) and descriptions (`heightfield`, `examples`) are `tags`, not formats. The allowed values are the closed list in [`site/format-vocabulary.json`](site/format-vocabulary.json), which the validator enforces (V20): reuse a listed spelling, and add a genuinely new format there in the same change that first uses it. Its `groups` drive the site's Format filter, so a new format that belongs to a group (another glTF or font container) goes into that group too.
- Frontmatter is one `key: value` per line; lists are `[a, b]` or indented `- item` lines. A key given twice is an error. Entry files may not contain emoji.
- `grid_dimensions` / `camera_perspective` / `hardware_tags`: optional metadata for 2D and UI entries. `3d` and `characters` entries leave `camera_perspective` out: it describes a 2D camera, and those entries have none.
- `url`: an `https://` address (`http://` only where the source has no https). Other schemes are rejected.
- `verified`: ISO date (`YYYY-MM-DD`) of your last license check. It must be a real date, no later than tomorrow in UTC, and no newer than the newest date in `## Evidence` (V8): a new `verified` date needs a new dated Evidence line from the same check. Dates inside URLs do not count as Evidence dates.
- `status`: `active` | `needs-review` | `deprecated`. A `deprecated` entry needs a `- Deprecated:` line in its body giving the reason (V9). `active` means the licence, the commercial stance and the credit requirement are all settled: an `unknown` in `license`, `commercial` or `attribution_required` keeps an entry at `needs-review`. The validator enforces this (V14), and rejects `formats`, `subcategories` or `tags` values that differ only by case, punctuation or a trailing "s" from one already in use (V13).

## License verification checklist

- [ ] License text or badge visible on the source
- [ ] Commercial use explicitly allowed (or marked false) — **free download ≠ commercial**
- [ ] Interactive/game use confirmed, not just "commercial use" in the abstract (see [`docs/game-vs-video-licensing.md`](docs/game-vs-video-licensing.md))
- [ ] Attribution / share-alike / NC / ND flags recorded
- [ ] Marketplace EULA checked if Unity/Fab/Unreal/itch
- [ ] Supplier looks reputable (not an anonymous laundering risk — see [`docs/provenance.md`](docs/provenance.md))
- [ ] Not on the [`docs/high-risk.md`](docs/high-risk.md) blocklist (MB-Lab, default Shadertoy, ND music, Unity Companion, GTA/FiveM rips, etc.)
- [ ] Entry does not claim rights we don’t have
- [ ] Tool entries distinguish **software license** from **exported asset** ownership

## Research notes

Local Gemini / deep-research drafts live under `RESEARCH/` as `R0N-<topic>.md` (mostly gitignored; see [`docs/research-index.md`](docs/research-index.md)). Promote durable findings into catalog entries and `docs/` — don’t rely on drafts as the public source of truth.

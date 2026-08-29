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

One new markdown file is enough — the website rebuilds from frontmatter on deploy.

1. Copy [`catalog/TEMPLATE.md`](catalog/TEMPLATE.md).
2. Save it as `catalog/<category>/<id>.md` using a short kebab-case `id`.
3. Fill every frontmatter field. Prefer primary URLs over mirror/aggregator pages.
4. `id` must be unique across the **whole** catalog. A mixed kit already listed in another category is a duplicate, not a second entry.
5. Verify the license on the live source page the day you submit.
6. For `status: active`, include an `## Evidence` line with a short quote from that page.
7. Bump `EXPECTED_COUNT` in [`site/validate.mjs`](site/validate.mjs) by the number of files you added (or lowered if you removed some).
8. Run `node site/validate.mjs` — it must exit 0.
9. Optional 2D/UI fields: `grid_dimensions`, `camera_perspective`, `hardware_tags`, `attribution_string` (see [`TEMPLATE.md`](catalog/TEMPLATE.md)).
10. Optional: add a line to the matching category `README.md` for GitHub browsing (the site does not require this).
11. Optional: add the `id` to `site/config.json` → `featured` to pin it under Safe starting points.

### Frontmatter rules

- `license`: exact short name from the source (e.g. `CC0`, `CC-BY-3.0`, `SIL OFL`, `custom`, `varies`).
- `commercial`: `true` / `false` / `unknown` / `varies`. Use `varies` for aggregators where some files are commercial-ok and others are not. The site still shows these under Commercial OK, labeled **per-file review**, so they are not silently excluded and not silently treated as a blanket grant.
- `attribution_required`: `true` / `false`.
- `attribution_string`: optional copy-paste credit.
- `publisher`: optional. Set when the same rights-holding publisher has more than one catalog entry (Kenney, Quaternius, KayKit, Google Fonts, OpenGameArt, LuizMelo, 0x72, Blender Studio, Material Maker, Tiny Speck, Screaming Brain Studios, Sparklin, Alif Type, GGBotNet, 3dmodelscc0). Do not set this to a generic host (GitHub, Hugging Face).
- `grid_dimensions` / `camera_perspective` / `hardware_tags`: optional 2D/UI metadata.
- `verified`: ISO date (`YYYY-MM-DD`) of your last license check.
- `status`: `active` | `needs-review` | `deprecated`.

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

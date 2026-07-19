# Contributing

This repo catalogs **links and metadata** for free (preferably commercially usable) game assets and related tools. It does not host binary asset dumps.

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

## Adding an entry

1. Copy [`catalog/TEMPLATE.md`](catalog/TEMPLATE.md).
2. Save it as `catalog/<category>/<id>.md` using a short kebab-case `id`.
3. Fill every frontmatter field. Prefer primary URLs over mirror/aggregator pages.
4. Add one line to the matching category `README.md` index.
5. Verify the license on the live source page the day you submit.

### Frontmatter rules

- `license`: exact short name from the source (e.g. `CC0`, `CC-BY-3.0`, `SIL OFL`, `custom`).
- `commercial`: `true` / `false` / `unknown`.
- `attribution_required`: `true` / `false`.
- `verified`: ISO date (`YYYY-MM-DD`) of your last license check.
- `status`: `active` | `needs-review` | `deprecated`.

## License verification checklist

- [ ] License text or badge visible on the source
- [ ] Commercial use explicitly allowed (or marked false)
- [ ] Attribution / share-alike / NC / ND flags recorded
- [ ] Marketplace EULA checked if Unity/Fab/Unreal/itch
- [ ] Supplier looks reputable (not an anonymous laundering risk — see [`docs/provenance.md`](docs/provenance.md))
- [ ] Not on the [`docs/high-risk.md`](docs/high-risk.md) blocklist (MB-Lab, default Shadertoy, ND music, etc.)
- [ ] Entry does not claim rights we don’t have

## Research notes

Local Gemini / deep-research drafts live under `RESEARCH/` as `R0N-<topic>.md` (mostly gitignored; see [`docs/research-index.md`](docs/research-index.md)). Promote durable findings into catalog entries and `docs/` — don’t rely on drafts as the public source of truth.

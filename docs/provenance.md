# Provenance & license hygiene

Free directories are useful — and a common place for **license laundering**: copyrighted AAA/ripped content re-uploaded as “CC0 / free for commercial use.” Downstream users can still be liable even if they acted in good faith.

## Trust signals (prefer these)

- Long-running creators with a public brand (e.g. [Kenney](../catalog/3d/kenney.md), Kay Lousberg / KayKit)
- Official institutional dumps (e.g. Smithsonian Open Access)
- Licenses hosted on the creator’s own site or well-known registries
- Clear version history / changelog for packs

## Red flags

- Anonymous uploads of large, high-fidelity “AAA-looking” bundles labeled CC0
- Licenses that only appear in a forum post, not on the download page
- “Free for commercial use” with no named license text
- Assets that look ripped from a known commercial game or engine sample without provenance

## Paper trail (recommended for production)

For every external pack you ship, keep:

| Field | Example |
| --- | --- |
| Source URL | `https://kenney.nl/assets/industrial-kit` |
| Creator | Kenney |
| License | CC0 1.0 |
| Download date | `2026-07-19` |
| Snapshot | Screenshot or archived copy of the listing page |

This catalog’s frontmatter (`url`, `license`, `verified`, `status`) is the public version of that registry — not a substitute for your project’s internal notices file.

## Practical policy for this repo

1. Prefer reputable suppliers over “biggest free dump.”
2. Aggregators stay `license: varies` / `needs-review` unless a specific pack is verified.
3. When provenance is doubtful, do **not** mark `status: active`.

## One entry equals one pack

This catalog indexes **downloadable packs**, not publishers. Kenney is twenty entries, Quaternius eight, KayKit six, because a solo dev browsing for “nature kit” or “UI audio” should land on the file they will actually ship. A publisher-level page would hide that.

The cost is concentration: a license change at kenney.nl would require editing every Kenney file. The optional `publisher` frontmatter field exists so those files can be found together. Do not collapse them into one card, and do not add publisher grouping to the site UI unless a later session explicitly decides to. Do not set `publisher` to a generic host (GitHub, Hugging Face).

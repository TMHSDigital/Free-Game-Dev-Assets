# License cheat sheet

Quick reference for assets you might list or use. **Always re-check the source page** — licenses change, packs can be dual-licensed, and marketplace “free” tiers often have extra terms.

## Creative Commons & public domain

| License | Commercial use | Attribution | Notes |
| --- | --- | --- | --- |
| **CC0** | Yes | Not required | Safest default for closed-source games. Can embed in DRM builds. |
| **CC-BY** | Yes | Required | Credit the author; keep a notices file. |
| **CC-BY-SA** | Yes | Required | Share-alike applies to **derivatives of the asset**, not your whole game as code. Prefer shipping SA assets in extractable bundles (`.pck`, loose folders) rather than encrypted into the binary. |
| **CC-BY-NC** | No | Required | Fine for prototypes / jam games; **reject for commercial catalogs** unless clearly marked non-commercial. |
| **CC-BY-ND** | Yes | Required | No derivatives — often unusable for games that need rescale/recolor/atlas. Usually reject. |

## Fonts

| License | Commercial use | Notes |
| --- | --- | --- |
| **SIL OFL** | Yes | Preferred for games. Embedding in a binary is OK; redistributing the font files alone as a competing font product is not. |
| Desktop / “personal use” fonts | Often no | Common trap on free-font sites. Require explicit embedding / game use. |

## Custom / marketplace

| License | Commercial use | Notes |
| --- | --- | --- |
| **Sonniss #GameAudioGDC** | Yes | Royalty-free for games; typically no attribution. Standalone resale and AI/ML training usually prohibited — read current terms. |
| **Unity / Fab / Unreal free assets** | Engine-specific | “Free” ≠ redistributable. Often locked to that engine’s EULA; do not rehost. Catalog as engine-store links only. |
| **itch.io free packs** | Varies | Check each pack page. Many are CC0 or custom commercial-ok. |

## Practical rules for this repo

1. Prefer **CC0 / public domain / OFL / clearly commercial-ok custom** licenses.
2. Mark **attribution required** and **share-alike** explicitly on every entry.
3. Never treat “free download” as a license.
4. When unsure, leave `commercial: unknown` and `status: needs-review` — do not guess.

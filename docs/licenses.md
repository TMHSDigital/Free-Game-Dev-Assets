# License cheat sheet

Quick reference for assets you might list or use. **Always re-check the source page** — licenses change, packs can be dual-licensed, and marketplace “free” tiers often have extra terms.

## Creative Commons & public domain

| License | Commercial use | Attribution | Notes |
| --- | --- | --- | --- |
| **CC0** | Yes | Not required | Safest default for closed-source games. Can embed in DRM builds. |
| **CC-BY** | Yes | Required | Credit the author; keep a notices file. |
| **CC-BY-SA** | Yes | Required | Share-alike applies to **derivatives of the asset**, not your whole game as code. Prefer shipping SA assets in extractable bundles (`.pck`, loose folders) rather than encrypted into the binary. |
| **CC-BY-NC** | No | Required | Fine for prototypes / jam games; **reject for commercial catalogs** unless clearly marked non-commercial. |
| **CC-BY-ND** | Yes | Required | No derivatives — **reject for games**. Interactive sync / remix is generally treated as a derivative; ND music and art are unsafe. |
| **ODbL** (OpenStreetMap) | Yes* | Required | Game binary is usually a “Produced Work” (code not copylefted). If you redistribute a modified geodatabase, ODbL share obligations can trigger. Credit OSM. |

## Fonts

| License | Commercial use | Notes |
| --- | --- | --- |
| **SIL OFL** | Yes | Preferred for games. Embedding in a binary is OK; redistributing the font files alone as a competing font product is not. |
| Desktop / “personal use” fonts | Often no | Common trap on free-font sites. Require explicit embedding / game use. |

## Custom / marketplace

| License | Commercial use | Notes |
| --- | --- | --- |
| **Sonniss #GameAudioGDC** | Yes | Royalty-free for games; typically no attribution. Standalone resale and AI/ML training usually prohibited — read current terms. |
| **Unity / Fab / Unreal free assets** | Engine-specific | Commercial use in-engine often OK; **no standalone redistribution**; may be engine-locked. Catalog as outbound links only with `engine-restricted` notes. |
| **itch.io free packs** | Varies | Check each pack page. Many are CC0 or custom commercial-ok. |
| **MakeHuman exports** | Special | App source may be AGPL; **official binary exports** are commonly under a **CC0 exception** — verify the current exception page before shipping. |
| **MB-Lab exports** | AGPL risk | Treat generated meshes as **unsafe** for closed-source games — see [`high-risk.md`](high-risk.md). |
| **FMOD Studio (indie)** | Custom | Often free under revenue/funding caps — verify current thresholds. |
| **Wwise free / evaluation** | Custom | Often asset-count or non-commercial caps — verify before shipping. |

## Provenance (license laundering)

A “CC0” badge on a random upload is not enough. Copyrighted content is sometimes re-uploaded to free directories under fake permissive labels. Prefer trusted suppliers, keep a paper trail, and see [`provenance.md`](provenance.md).

## Practical rules for this repo

1. Prefer **CC0 / public domain / OFL / clearly commercial-ok custom** licenses.
2. Prefer **reputable creators** over anonymous mega-dumps (see provenance guide).
3. Mark **attribution required** and **share-alike** explicitly on every entry.
4. Never treat “free download” as a license.
5. When unsure, leave `commercial: unknown` and `status: needs-review` — do not guess.

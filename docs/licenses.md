# License cheat sheet

> This is the catalog's reading of each licence, not legal advice. Licences change: read the source's own terms before you ship.

Quick reference for assets you might list or use. **Always re-check the source page** — licenses change, packs can be dual-licensed, and marketplace “free” tiers often have extra terms.

## Creative Commons & public domain

| License | Commercial use | Attribution | Notes |
| --- | --- | --- | --- |
| **CC0** | Yes | Not required | Safest default for closed-source games. Can embed in DRM builds. |
| **CC-BY-4.0** | Yes | Required | Credit the author; a credits-screen link to the source usually satisfies. Keep a notices file. |
| **CC-BY-3.0** | Yes | Required | Same commercial grant; some projects expect the **author named** (not only a site URL). Example: Game-Icons.net wants `Icons made by {author}. Available on https://game-icons.net`. |
| **CC-BY-SA** | Yes, **except Unreal** | Required | Share-alike applies to **derivatives of the asset**, not your whole game as code. Prefer shipping SA assets in extractable bundles (`.pck`, loose folders) rather than encrypted into the binary. The Unreal Engine EULA names CC-BY-SA (and GPL/LGPL) as licences you may not combine with the engine; see [unreal.md](unreal.md). |
| **CC-BY-NC** | No | Required | Fine for prototypes / jam games; **reject for commercial catalogs** unless clearly marked non-commercial. |
| **CC-BY-ND** | Yes | Required | No derivatives — **reject for games**. Interactive sync / remix is generally treated as a derivative; ND music and art are unsafe. |
| **CC-BY** (no version) | Yes | Required | The source says CC-BY without a version. Credit as it asks; read the source before relying on terms that differ between 3.0 and 4.0. |
| **ODbL** (OpenStreetMap) ([geodata.md](geodata.md)) | Yes* | Required | Game binary is usually a “Produced Work” (code not copylefted). If you redistribute a modified geodatabase, ODbL share obligations can trigger. Credit OSM. |

## Fonts

Full guidance, including what you still owe when `attribution_required` is false, is in [`fonts.md`](fonts.md).

| License | Commercial use | Notes |
| --- | --- | --- |
| **SIL OFL** | Yes | Preferred for games. Embedding in a binary is OK; redistributing the font files alone as a competing font product is not. |
| Desktop / “personal use” fonts | Often no | Common trap on free-font sites. Require explicit embedding / game use. |

## Custom / marketplace

| License | Commercial use | Notes |
| --- | --- | --- |
| **Sonniss #GameAudioGDC** | Yes | Royalty-free for games; typically no attribution. Standalone resale and AI/ML training usually prohibited — read current terms. |
| **Unity / Fab / Unreal free assets** | Engine-specific | Commercial use in-engine often OK; **no standalone redistribution** of raw `.fbx`/`.png`. Unity **Companion License** / Starter Assets: Unity-only; seat is typically one legal entity — contractors outside the org may need their own seats. On Fab, the **Standard License** is multi-engine unless the listing adds a "UE-Only Content" line (recorded as `engine_lock: unreal`). Fab and Epic content may never go in a public repository in source form. Full detail in [unreal.md](unreal.md). |
| **itch.io free packs** | Varies | Check each pack page. Many are CC0 or custom commercial-ok. **Free ≠ commercial** — e.g. Sprout Lands free tier is non-commercial; paid tier is commercial. |
| **FiveM / Cfx / GTA-format** | Almost never the game files | GTA V extracts are not free assets. Original CC0 meshes may be re-exported if you hold those rights. See [`fivem.md`](fivem.md). |
| **LPC / OGA-BY / CC-BY-SA sprites** | Copyleft art | Commercial OK with attribution + share-alike on **asset derivatives**; keep sheets external/extractable. Not usable in Unreal Engine projects (EULA). |
| **MakeHuman exports** | Special | App source may be AGPL; **official binary exports** are commonly under a **CC0 exception** — verify the current exception page before shipping. |
| **MB-Lab exports** | AGPL risk | Treat generated meshes as **unsafe** for closed-source games — see [`high-risk.md`](high-risk.md). |
| **FMOD Studio (indie)** | Custom | Often free under revenue/funding caps — verify current thresholds. |
| **Wwise free / evaluation** | Custom | Often asset-count or non-commercial caps — verify before shipping. |

## Permissive software licences

Most `tools/` entries and many libraries carry one of these. They all allow commercial use and closed-source games. What they ask for is a copy of the notice, not a credit on screen. The shortlist on the site collects these notices into one `CREDITS` file you can ship.

| License | Commercial use | What you ship | Notes |
| --- | --- | --- | --- |
| **MIT** | Yes | The copyright line and licence text, in a notices file | Applies when you redistribute the code or a build containing it. Using an MIT editor to make assets owes nothing. |
| **ISC** | Yes | Same as MIT | Functionally the MIT licence in fewer words. |
| **BSD-2-Clause** | Yes | Copyright line and licence text | The bare value **BSD** is used where a project says "BSD" without naming the clause count; read its LICENSE before shipping. |
| **BSD-3-Clause** | Yes | Copyright line and licence text | Adds a no-endorsement clause: do not use the authors' names to promote your game. **BSD-3-Clause-Clear** is the same, but states that no patent rights are granted. |
| **Apache-2.0** | Yes | Licence text, plus the project's `NOTICE` file if it has one | Includes a patent grant, which ends if you sue the authors over patents. Modified files must say they were changed. |
| **MPL-2.0** | Yes | Licence text; source of the MPL files you changed | File-level copyleft: changes to MPL files stay MPL and must be offered as source; your own files and the rest of the game do not. |
| **CPL-1.0** | Yes | Licence text; source of the CPL code you changed | An older weak-copyleft licence with a patent clause, close to MPL in effect. |
| **CDLA-Permissive-2.0** | Yes | The licence text or a link to it | A data licence. Results of using the data, such as a trained model or a rendered scene, carry no obligation. |
| **Unlicense** | Yes | Nothing | A public-domain dedication with a fallback licence, treated like CC0. |
| **public-domain** | Yes | Nothing | Used where the source states public domain without a CC0 deed, such as US government works. Check the country: a work public in the US may not be elsewhere. |

## GPL family

| License | Commercial use | Notes |
| --- | --- | --- |
| **GPL-2.0-only**, **GPL-2.0-or-later**, **GPL-3.0-only**, **GPL-3.0-or-later** | Yes | Strong copyleft on the program. Linking GPL code into your game makes the game GPL. Using a GPL editor does not, as the section below explains. The bare **GPL-2.0** and **GPL-3.0** values mean the project did not say "only" or "or later". |
| **LGPL-3.0** | Yes | You may link the library from closed code if users can replace it, which in practice means dynamic linking. Changes to the library itself stay LGPL. The Unreal Engine EULA forbids combining LGPL code with the engine; see [unreal.md](unreal.md). |

## How to read a `custom`, `varies` or `unknown` entry

**custom** means the source wrote its own terms. The entry's `## Evidence` section quotes the sentences that matter, with the date they were read, and `commercial` and `attribution_required` are the catalog's reading of that specific text. Read the quote, and the Notes for limits such as no redistribution, one project per purchase or engine locks, before you rely on the summary fields.

**varies** means the source hosts files under different licences, such as an aggregator or a community upload site. The entry describes the site, not any one file. Check each file's own licence before you use it, and expect `commercial: varies`.

**unknown** means the licence could not be established from the live source. Such entries are never `active`. Treat them as unusable until a dated quote settles the question.

## Copyleft tools vs generated output

GPL/AGPL on an **editor or generator** (Tiled, Blockbench, Pixelorama, etc.) usually does **not** copyleft the PNG/glTF/WAV you export — unless the maintainer says otherwise. Catalog `license` on `tools/` is the **software** license. Keep generated assets under whatever terms you assign; don’t ship the GPL editor source inside the game binary unless you mean to.

## Provenance (license laundering)

A “CC0” badge on a random upload is not enough. Copyrighted content is sometimes re-uploaded to free directories under fake permissive labels. Prefer trusted suppliers, keep a paper trail, and see [`provenance.md`](provenance.md).

## Practical rules for this repo

1. Prefer **CC0 / public domain / OFL / clearly commercial-ok custom** licenses.
2. Prefer **reputable creators** over anonymous mega-dumps (see provenance guide).
3. Mark **attribution required** and **share-alike** explicitly on every entry.
4. Never treat “free download” as a license.
5. When unsure, leave `commercial: unknown` and `status: needs-review` — do not guess.

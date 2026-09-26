---
id: charmorph
name: CharMorph
url: https://github.com/Upliner/CharMorph
category: characters
subcategories: [humanoid, blender]
license: varies
commercial: unknown
attribution_required: unknown
formats: [Blend, glTF, FBX]
tags: [blender, humanoid, mb-lab-derived]
verified: 2026-09-26
status: needs-review
---

# CharMorph

Blender character tool reimplementing MB-Lab-style morphing (no MB-Lab *code*). **Not a safe CC0 default:** bundled `mb_*` character data is **AGPL-3.0**; other characters (e.g. Antonia) are **CC-BY-3.0**. Addon code is **GPL-3**. Prefer [makehuman](makehuman.md) / [mpfb](mpfb.md) for commercial closed-source mesh exports.

## Notes

- Open each character’s `license.txt` in [CharMorph-db](https://github.com/Upliner/CharMorph-db) before exporting
- `mb_female` (and likely other `mb_*`) = full AGPL text — treat like MB-Lab export risk
- Antonia = CC-BY-3.0 (attribution required)
- Reom = CC-BY per its `config.yaml` (`license: CC-BY`, no version stated); it has no `license.txt`
- Do not assume “safer than MB-Lab” without checking the active base
- Still open (re-checked 2026-09-26): every stated licence (GPL-3 code, AGPL-3 MB-Lab data, CC-BY Antonia and Reom) permits commercial use in itself; what is unsettled is how far the AGPL on `mb_*` meshes reaches into an exported character shipped in a closed game, and credit differs per base. That keeps `commercial` and `attribution_required` at `unknown`
- Maintenance: GitHub API on 2026-09-26: CharMorph not archived, last push 2025-05-29; CharMorph-db last push 2024-07-23

## Evidence

- Live CharMorph-db (2026-07-19): `characters/mb_female/license.txt` = **GNU AGPL v3**; `characters/antonia/license.txt` = **CC BY 3.0**
- Live `__init__.py`: GPL-3 license block for the addon
- Live [license.txt](https://github.com/Upliner/CharMorph/blob/master/license.txt) (2026-09-26): "All python files released in the CharMorph package, are released under GNU General Public License 3"; "Each character has its own license stated in select list"; MB-Lab character data "released under GNU Affero General Public License 3"
- Live CharMorph-db (2026-09-26): characters are `antonia`, `mb_female`, `mb_male`, `reom`. `antonia/license.txt`: "licensed under the Creative Commons Attribution 3.0 Unported License"; `reom/config.yaml`: "title: Reom (CC-BY)", "license: CC-BY"

## Related

- [makehuman](makehuman.md)
- [mpfb](mpfb.md)
- [blender-human-base-meshes](blender-human-base-meshes.md)

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
tags: [blender, humanoid, agpl-assets, mb-lab-derived]
verified: 2026-07-19
status: needs-review
---

# CharMorph

Blender character tool reimplementing MB-Lab-style morphing (no MB-Lab *code*). **Not a safe CC0 default:** bundled `mb_*` character data is **AGPL-3.0**; other characters (e.g. Antonia) are **CC-BY-3.0**. Addon code is **GPL-3**. Prefer [makehuman](makehuman.md) / [mpfb](mpfb.md) for commercial closed-source mesh exports.

## Notes

- Open each character’s `license.txt` in [CharMorph-db](https://github.com/Upliner/CharMorph-db) before exporting
- `mb_female` (and likely other `mb_*`) = full AGPL text — treat like MB-Lab export risk
- Antonia = CC-BY-3.0 (attribution required)
- Do not assume “safer than MB-Lab” without checking the active base

## Evidence

- Live CharMorph-db (2026-07-19): `characters/mb_female/license.txt` = **GNU AGPL v3**; `characters/antonia/license.txt` = **CC BY 3.0**
- Live `__init__.py`: GPL-3 license block for the addon

## Related

- [makehuman](makehuman.md)
- [mpfb](mpfb.md)
- [blender-human-base-meshes](blender-human-base-meshes.md)

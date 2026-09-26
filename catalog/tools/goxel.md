---
id: goxel
name: Goxel
url: https://goxel.xyz
category: tools
subcategories: [voxel, editor]
license: GPL-3.0-or-later
license_spdx: GPL-3.0-or-later
commercial: true
attribution_required: false
formats: [VOX, glTF, OBJ, PLY]
tags: [voxel, dcc]
verified: 2026-09-22
status: active
---

# Goxel

Open-source voxel editor (Windows, Mac, Linux, iOS, Android) with sparse unlimited scenes, layers, and export to MagicaVoxel, glTF, OBJ, PLY. This is the GPL alternative to MagicaVoxel's custom freeware. The program is GNU GPL-3. The README offers a separate commercial license if you want to ship Goxel's *code* inside a closed product. Pages fetched on 2026-08-24 do not say "voxels you sculpt are yours" in those words. GPL on an editor does not copyleft exported meshes, but that sentence is inferred, not quoted.

## Notes

- Evidence for the tool license: GitHub `README.md` Licence section plus `COPYING` (GPL v3)
- "If you want to use the code with a commercial project please contact me" is about embedding Goxel, not about selling a game that contains `.vox` / glTF you made
- Export list in README: obj, ply, png, MagicaVoxel, Qubicle. Site also lists glTF2 and Build engine
- MagicaVoxel remains the faster painter for many people. Goxel is the one you can audit and rebuild
- CLA required for contributions, in part so mobile builds can be non-GPL. Irrelevant unless you fork
- Source headers elect "or any later version", so the SPDX identifier is `GPL-3.0-or-later`.

## Evidence

- Live GitHub `src/goxel.c` header (2026-09-22): "either version 3 of the License, or (at your option) any later version"
- Live GitHub `README.md` Licence (2026-08-24): "Goxel is released under the GNU GPL3 licence"
- Live `COPYING` (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"

## Related

- [../3d/magicavoxel](../3d/magicavoxel.md)
- [blockbench](blockbench.md)
- [gimp](gimp.md)
- [libresprite](libresprite.md)

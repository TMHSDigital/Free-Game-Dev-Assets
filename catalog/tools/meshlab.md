---
id: meshlab
name: MeshLab
url: https://www.meshlab.net
category: tools
subcategories: [mesh, pipeline]
license: GPL-3.0
commercial: true
attribution_required: false
formats: [OBJ, PLY, glTF, 3MF]
tags: [mesh, cleanup, scan, gpl]
verified: 2026-08-24
status: active
---

# MeshLab

ISTI-CNR Visual Computing Lab editor for triangle meshes: cleanup, hole fill, simplification, remesh, glTF/3MF I/O. This is the scan-repair step after a photogrammetry dump and before [instant-meshes](instant-meshes.md). The application is GPL-3.0 (`LICENSE.txt`). Homepage calls it "the open source system" but does not name GPL. GitHub is the license evidence. Exported meshes from *your* input are not automatically GPL; that sentence is inferred. Do not ship MeshLab itself inside a closed binary.

## Notes

- Source: [github.com/cnr-isti-vclab/meshlab](https://github.com/cnr-isti-vclab/meshlab). PyMeshLab is a separate repo
- 2025.07 adds ARM64 Linux/macOS and 3mf. Microsoft Store build exists; store ToS is extra if you install from there
- Filters can silently drop UVs or merge materials. Check the export dialog
- Checklist: GPL file visible, commercial use of the *program* under GPL, no NC/ND, Store is optional, CNR lab, not blocklisted, tool vs mesh ownership unquoted

## Evidence

- Live GitHub `LICENSE.txt` (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"
- Live GitHub SPDX (2026-08-24): "GPL-3.0"
- Live homepage (2026-08-24): "the open source system for processing and editing 3D triangular meshes" (not a license name)

## Related

- [instant-meshes](instant-meshes.md)
- [cloudcompare](cloudcompare.md)
- [assimp](assimp.md)
- [meshoptimizer](meshoptimizer.md)
- [../3d/smithsonian-open-access](../3d/smithsonian-open-access.md)

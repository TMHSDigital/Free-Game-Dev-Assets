---
id: meshroom
name: Meshroom
url: https://alicevision.org
category: tools
subcategories: [photogrammetry, pipeline]
license: MPL-2.0
commercial: true
attribution_required: false
formats: [OBJ, ABC, EXR, SFMdata]
tags: [photogrammetry, alicevision, open-source, gpu]
verified: 2026-08-24
status: active
---

# Meshroom

Node-based photogrammetry GUI on the AliceVision library. You point it at a photo set and get a sparse/dense reconstruction and a mesh. That is the gap Instant Meshes and MeshLab do not close: they clean a mesh, they do not build one from photographs. Meshroom and AliceVision are both MPL-2.0. The GUI also ships Qt/PySide6 under LGPL-3.0. Pages fetched this session do not say "the mesh you export is yours." Treat it like other pipeline tools: the code is MPL, your photos keep their own copyright, and a scan of a copyrighted object is still that object's problem.

## Notes

- Product home [alicevision.org](https://alicevision.org) is a thin JS shell this session (title plus "Loading..."). License evidence is GitHub `COPYING.md`, not the marketing page
- AliceVision `COPYING.md` is MPL-2.0 plus a long third-party list. CUDA is required for depth maps. Eigen is built `EIGEN_MPL2_ONLY`
- Meshroom `COPYING.md` adds Qt/PySide6 LGPL-3.0. Shipping the GUI inside a closed installer is an LGPL problem. Running it on your machine to export OBJ is not
- Dense MVS wants a CUDA GPU. CPU-only reconstructions stall at depth map
- Checklist: MPL text visible on GitHub, commercial use of the *software* under MPL, no NC/ND, not a marketplace, AliceVision contributors named, not blocklisted, tool vs export ownership unquoted

## Evidence

- Live Meshroom `COPYING.md` (2026-08-24): "Meshroom is licensed under the MPL2 license"
- Live AliceVision `COPYING.md` (2026-08-24): "AliceVision is licensed under the MPL2 license"
- Live Meshroom `COPYING.md` (2026-08-24): Qt/PySide6 "Distributed under the LGPL V3 license"

## Related

- [colmap](colmap.md)
- [meshlab](meshlab.md)
- [cloudcompare](cloudcompare.md)
- [instant-meshes](instant-meshes.md)
- [quadriflow](quadriflow.md)

---
id: colmap
name: COLMAP
url: https://colmap.github.io
category: tools
subcategories: [photogrammetry, pipeline]
license: BSD-3-Clause
commercial: true
attribution_required: false
formats: [BIN, TXT, PLY, OBJ]
tags: [photogrammetry, sfm, mvs, open-source]
verified: 2026-08-24
status: active
---

# COLMAP

ETH Zurich / UNC Chapel Hill Structure-from-Motion and Multi-View Stereo pipeline with a GUI, CLI, and PyCOLMAP. Same job as Meshroom: photos in, sparse cameras plus dense mesh/point cloud out. The library is the "new BSD" license (BSD-3-Clause). `COPYING.txt` warns that building against COLMAP's dependencies "may affect the resulting COLMAP license." Pages fetched this session do not assign a license to exported reconstructions. Your photos, and whatever they depict, stay outside the BSD grant.

## Notes

- Homepage: [colmap.github.io](https://colmap.github.io). License file: [colmap/colmap `COPYING.txt`](https://github.com/colmap/colmap/blob/main/COPYING.txt)
- Sample datasets on demuc.de are for tutorials. Do not treat them as a CC0 kit
- Incremental SfM wants overlap. Phone bursts of a prop on a turntable work; random holiday folders usually do not
- Learned features (ALIKED, LoMa) need ONNX at build time. Default is SIFT
- Checklist: BSD text visible, commercial redistribution of the *software* permitted with notice, no NC/ND, not a marketplace, ETH/UNC named, not blocklisted, tool vs export ownership unquoted

## Evidence

- Live `COPYING.txt` (2026-08-24): "The COLMAP library is licensed under the new BSD license"
- Same file (2026-08-24): "Redistribution and use in source and binary forms, with or without modification, are permitted"
- Same file (2026-08-24): "Building COLMAP with these dependencies may affect the resulting COLMAP license"

## Related

- [meshroom](meshroom.md)
- [meshlab](meshlab.md)
- [cloudcompare](cloudcompare.md)
- [instant-meshes](instant-meshes.md)
- [assimp](assimp.md)

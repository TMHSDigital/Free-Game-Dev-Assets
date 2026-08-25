---
id: quadriflow
name: QuadriFlow
url: https://github.com/hjwdzh/QuadriFlow
category: tools
subcategories: [remesh, pipeline]
license: BSD-3-Clause
commercial: true
attribution_required: false
formats: [OBJ]
tags: [retopo, remesh, quad, open-source]
verified: 2026-08-24
status: active
---

# QuadriFlow

Huang / Zhou / Niessner / Shewchuk / Guibas quadrangulation (SIGGRAPH 2018). Same production need as Instant Meshes: turn a triangle dump into quads you can UV. The README says MIT. `LICENSE.txt` is a BSD-3-Clause text, not MIT. This entry follows the license file. Eigen's Sparse Cholesky path is LGPL unless you pass `-DBUILD_FREE_LICENSE=ON`. Pages fetched this session do not say the exported mesh is BSD. The remesher is; the input scan is not.

## Notes

- Build from source. No first-party Windows zip on the repo page this session
- `LICENSE.txt` also has a "you are under no obligation to provide Enhancements" paragraph. That is extra BSD language, not a second grant for game assets
- Prefer Instant Meshes if you want a GUI. QuadriFlow is the batch/research CLI sibling
- Checklist: license file visible, commercial redistribution of the *software* permitted with notice, Eigen LGPL trap recorded, not a marketplace, authors named, not blocklisted, tool vs export ownership unquoted

## Evidence

- Live `LICENSE.txt` (2026-08-24): "Redistribution and use in source and binary forms, with or without modification, are permitted"
- Live README Licenses (2026-08-24): "QuadriFlow is released under MIT License" (contradicts `LICENSE.txt`; not used as the catalog license)
- Live README (2026-08-24): enable `BUILD_FREE_LICENSE` to avoid Eigen LGPL Sparse Cholesky

## Related

- [instant-meshes](instant-meshes.md)
- [meshlab](meshlab.md)
- [meshoptimizer](meshoptimizer.md)
- [assimp](assimp.md)

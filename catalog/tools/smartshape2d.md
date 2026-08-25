---
id: smartshape2d
name: SmartShape2D
url: https://github.com/SirRamEsq/SmartShape2D
category: tools
subcategories: [godot, 2d, terrain]
license: MIT
commercial: true
attribution_required: false
formats: [godot-addon]
tags: [godot-4, 2d, terrain, polygons]
verified: 2026-08-24
status: active
---

# SmartShape2D

Godot 4 addon for textured 2D polygons: place points, assign a shape material, get terrain-style edges without building a TileMap for every contour. Closes the 2D-terrain gap next to Scatter2D (foliage placement) and Terrain3D (3D heightmaps). MIT, so it can ship in a closed commercial build if you keep the copyright notice.

## Notes

- Current `master` is Godot 4.x (badge on the README shows 4.3). Godot 3 lives on `Godot3-latest` and is unmaintained
- Addon folder is `addons/rmsmartshape`. Copy that folder; do not assume the Asset Library name matches the GitHub clone root
- README warns that some markdown docs are outdated. Prefer in-engine F1 docs. If SS2D nodes are missing from help, re-save the scripts (Godot issues #72406 / #86577; README says this should be fixed in 4.5)
- Textures are the same kind of edge/fill strips you would feed a 2D tileset, not 3D PBR
- MIT requires the copyright notice in distributions. That is not CC-BY user-facing credit

## Evidence

- Live `LICENSE` (2026-08-24): "MIT License Copyright (c) 2018 Robert Morse"
- Same file (2026-08-24): "Permission is hereby granted, free of charge"
- Live GitHub sidebar (2026-08-24): MIT license badge

## Related

- [scatter2d](scatter2d.md)
- [proton-scatter](proton-scatter.md)
- [terrain3d](terrain3d.md)
- [tiled](tiled.md)

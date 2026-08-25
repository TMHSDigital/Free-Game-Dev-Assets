---
id: terrain3d
name: Terrain3D
url: https://github.com/TokisanGames/Terrain3D
category: tools
subcategories: [godot, terrain]
license: MIT
commercial: true
attribution_required: false
formats: [godot-addon, gdextension, EXR, R16, PNG]
tags: [godot-4, terrain, heightmap, clipmap, gdextension]
verified: 2026-08-24
status: active
---

# Terrain3D

Clipmap terrain system for Godot 4, built as a C++ GDExtension. This is the piece the catalog was missing between raw elevation data and a playable world: it imports 16-bit heightmaps, paints up to 32 texture layers with a detiling and triplanar option, and handles the LOD and collision generation that a MeshInstance-based terrain cannot at scale. Pairs directly with the DEM sources already catalogued.

## Notes

- Imports R16, EXR, and PNG heightmaps; R16 is the format most DEM tools export cleanly, and 16-bit is required to avoid terracing
- Regions are 1024x1024 by default and sparse, so a large world costs memory only where regions actually exist
- Collision is generated for a moving area around the camera rather than the whole terrain; raise the collision radius before doing long-distance raycasts or navmesh baking
- GDExtension binaries are per-platform and per-Godot-version; a Godot minor version bump usually needs a matching Terrain3D release
- Texture arrays require all albedo and normal maps at identical resolution and format, so batch-convert an AmbientCG or Poly Haven set before assigning slots

## Evidence

- `LICENSE.txt` in the repository, `main` branch (2026-08-24): "MIT License Copyright (c) 2023-2026 Cory Petkovsek, Roope Palmroos, and Contributors."
- Same file (2026-08-24): "to deal in the Software without restriction"

## Related

- [proton-scatter](proton-scatter.md)
- [gaea](gaea.md)
- [limboai](limboai.md)
- [../environment/copernicus-dem-glo30](../environment/copernicus-dem-glo30.md)
- [../3d/ambientcg](../3d/ambientcg.md)

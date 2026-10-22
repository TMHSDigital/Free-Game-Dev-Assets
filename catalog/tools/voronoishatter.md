---
id: voronoishatter
name: VoronoiShatter
url: https://github.com/robertvaradan/voronoishatter
category: tools
subcategories: [godot, destruction]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [godot-addon]
tags: [godot, godot-4, destruction, fracture, voronoi, debris, rigidbody]
added: 2026-09-23
verified: 2026-09-23
status: active
---

# VoronoiShatter

Godot add-on that breaks a mesh into Voronoi fragments inside the editor, then builds rigid bodies and collision shapes for the pieces. This is the catalog's answer to "where do my pre-broken debris meshes come from" without leaving Godot: add the node, put a `MeshInstance3D` under it, press "Generate Fracture Meshes", then "Create Rigid Bodies".

## Notes

- **Shatter in the editor, not at runtime.** The README says running it "just in time" in a game is possible but costly, and recommends pre-fragmenting. Bake the pieces, then swap them in when the object breaks
- The core is GDScript (the plugin script is `voronoishatterplugin.gd`); the three C# files are optional adapter classes for C# projects. A GDScript-only project does not need the .NET build
- Pre-1.0: v0.3, released 2026-06-01, and the README still says it "applies to v0.2"
- The README states no Godot version. The addon ships `.uid` sidecar files, which Godot introduced in 4.4, so plan on 4.4 or newer; this is an inference from the files, not a stated requirement
- MIT covers the addon. The fragments it generates from your meshes are yours
- For the Blender route instead, fracture with [blender-cell-fracture](blender-cell-fracture.md) and swap pieces at runtime with [godot-destruction-plugin](godot-destruction-plugin.md)

## Evidence

- Live GitHub `LICENSE.md` (2026-09-23): "MIT License", "Copyright (c) 2025 Robert Varadan"
- Live `addons/voronoishatter/plugin.cfg` (2026-09-23): `version="0.3"`, `script="voronoishatterplugin.gd"`

## Related

- [godot-destruction-plugin](godot-destruction-plugin.md)
- [godot-voxel-destruction](godot-voxel-destruction.md)
- [blender-cell-fracture](blender-cell-fracture.md)
- [../3d/kenney-factory-kit](../3d/kenney-factory-kit.md)

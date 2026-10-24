---
id: godot-destruction-plugin
name: Godot Destruction Plugin (Jummit)
url: https://github.com/Jummit/godot-destruction-plugin
category: tools
subcategories: [godot, destruction]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [godot-addon]
tags: [godot, godot-4, destruction, rigidbody, cell-fracture, gdscript]
added: 2026-09-23
verified: 2026-09-23
status: active
---

# Godot Destruction Plugin (Jummit)

GDScript add-on that replaces an intact mesh with a pre-broken ("segmented") version of it at the moment of destruction, turning each fragment into a rigid body. It does not break meshes itself: you supply the fragments, usually from [blender-cell-fracture](blender-cell-fracture.md). The simplest runtime half of a Blender-to-Godot destruction pipeline.

## Notes

- **Needs pre-broken pieces.** Fracture the mesh in Blender, import both versions, point the plugin at the segmented one
- For Godot 4, install from the GitHub releases rather than the Asset Library, which the README reserves for the Godot 3 version. The README badge reads Godot 4.2
- Last release v7.2, and last commit, both 2024-06-23. Small and finished rather than abandoned, but check it against your engine version before you depend on it
- Pure GDScript, so no .NET build and nothing compiled
- Split licence, REUSE style: the README says "Code licensed under the MIT license" and "All other files licensed under CC0", so the scripts are MIT and the example assets are CC0
- Tested only small: the README says "The plugin is only tested in very small scenes"
- To make the fragments inside Godot instead of Blender, see [voronoishatter](voronoishatter.md)

## Evidence

- Live GitHub `LICENSE` (2026-09-23): "MIT License", "Copyright © 2023-2023 Jummit and contributors"
- Live README (2026-09-23): "For Godot 4 and above, download the addon from the releases"; latest release v7.2 (2024-06-23)

## Related

- [voronoishatter](voronoishatter.md)
- [blender-cell-fracture](blender-cell-fracture.md)
- [godot-voxel-destruction](godot-voxel-destruction.md)

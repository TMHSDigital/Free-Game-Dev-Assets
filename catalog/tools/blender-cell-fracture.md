---
id: blender-cell-fracture
name: Cell Fracture (Blender extension)
url: https://extensions.blender.org/add-ons/cell-fracture/
category: tools
subcategories: [blender-addon, destruction]
license: GPL-3.0-or-later
license_spdx: GPL-3.0-or-later
commercial: true
attribution_required: false
formats: [blender-extension]
tags: [blender, destruction, fracture, debris, cell-fracture]
added: 2026-09-23
verified: 2026-09-23
status: active
---

# Cell Fracture (Blender extension)

Blender's long-standing fracture tool, now distributed as an official extension. Select a mesh, run Cell Fracture, and it splits the object into convex pieces, which is how most pre-broken debris for games is made. Several Godot destruction add-ons, [godot-destruction-plugin](godot-destruction-plugin.md) among them, expect their fragments to come from here.

## Notes

- Install it from Blender's Extensions panel (Blender 4.2 or newer); it is no longer bundled as a built-in add-on
- **The GPL covers the tool, not what you make with it.** Fragments you export from your own meshes are yours, as with any GPL editor (see [`docs/licenses.md`](../../docs/licenses.md))
- Version 0.2.1, maintained by "Community", with copyright held by ideasman42, phymec and Sergey Sharybin
- Keep the piece count low for real-time physics: tens of rigid bodies, not hundreds. The Godot C# add-on Destructibles suggests 5 to 50

## Evidence

- Live extension package `blender_manifest.toml` (2026-09-23): `license = ["SPDX:GPL-3.0-or-later"]`, `blender_version_min = "4.2.0"`, `version = "0.2.1"`
- Live extension page (2026-09-23): "License GNU General Public License v3.0 or later"

## Related

- [blender](blender.md)
- [godot-destruction-plugin](godot-destruction-plugin.md)
- [voronoishatter](voronoishatter.md)

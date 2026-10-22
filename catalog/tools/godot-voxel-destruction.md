---
id: godot-voxel-destruction
name: Godot Voxel Destruction
url: https://github.com/Terabase-Studios/Godot-Voxel-Destruction
category: tools
subcategories: [godot, destruction, voxel]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [godot-addon, VOX]
tags: [godot, godot-4, destruction, voxel, magicavoxel, debris]
added: 2026-09-23
verified: 2026-09-23
status: active
---

# Godot Voxel Destruction

Godot 4.1+ add-on that imports MagicaVoxel `.vox` files and destroys them voxel by voxel, with debris. The voxel alternative to mesh fracture: if your art is already voxels, damage is exact and there are no pre-broken pieces to author.

## Notes

- Ships a custom importer for `.vox`, so pair it with [magicavoxel](../3d/magicavoxel.md) or [goxel](goxel.md)
- **GDScript by default, optional Rust native path.** The add-on runs as GDScript. `rust.md` documents a faster GDExtension, set up from `Project > Tools > Setup Voxel Destruction GDextension`, which "will use prebuilt binaries". Neither the repository tree nor the v1.2.0 release contains those binaries, so find out where the tool downloads them from before running it, or compile the crate yourself
- Latest release v1.2.0 (2026-08-09); `main` already reports `1.3.0-alpha1` in `plugin.cfg`. Install the release unless you want the alpha
- Actively developed: last commit 2026-09-14 at the time of checking

## Evidence

- Live GitHub `LICENSE` (2026-09-23): "MIT License", "Copyright (c) 2025 Terabase Studios"
- Live README (2026-09-23): "A flexible and efficient voxel-based destruction system for Godot 4.1+"

## Related

- [voronoishatter](voronoishatter.md)
- [godot-destruction-plugin](godot-destruction-plugin.md)
- [../3d/magicavoxel](../3d/magicavoxel.md)
- [goxel](goxel.md)

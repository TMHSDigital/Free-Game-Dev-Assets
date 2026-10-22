---
id: godot-mod-loader
name: Godot Mod Loader
url: https://github.com/GodotModding/godot-mod-loader
category: tools
subcategories: [godot, modding]
license: CC0
license_spdx: CC0-1.0
commercial: true
attribution_required: false
formats: [godot-addon]
tags: [godot, godot-4, mods, workshop]
added: 2026-07-19
verified: 2026-09-23
status: active
---

# Godot Mod Loader

Community mod-loading framework for Godot. Wiki: [wiki.godotmodding.com](https://wiki.godotmodding.com/). The loader is released under **CC0 1.0**, so there is no notice to carry and nothing to credit.

**Corrected 2026-09-23.** This entry previously linked `Godot-Modding/loader` and recorded MIT, and it stated that "older research drafts that said CC0 are wrong". The drafts were right. `Godot-Modding/loader` is a placeholder: it contains a README reading only "The Godot Modloader", a LICENSE and a docs folder, and no code. Its MIT file is real but licenses nothing. The project itself lives at `GodotModding/godot-mod-loader`, which both Godot Asset Library listings link and which ships the addon under `addons/mod_loader`.

## Notes

- Latest release checked 2026-09-23: v7.0.1 (2025-06-11), with the Godot 4 line developed on the `4.x-dev` branch and Godot 3 on `3.x-dev`
- CC0 covers the loader code, not third-party mods you load
- Shipping a mod kit or template that redistributes other people's assets is a different license question
- A name-alike repository with a real licence file and no code is a provenance trap worth remembering: the licence you verify has to belong to the thing people actually download

## Evidence

- Live GitHub `GodotModding/godot-mod-loader` LICENSE (2026-09-23): "Creative Commons Legal Code / CC0 1.0 Universal"
- Live Godot Asset Library listings [1938](https://godotengine.org/asset-library/asset/1938) and [4107](https://godotengine.org/asset-library/asset/4107) (2026-09-23): titled "Godot Mod Loader", linking `github.com/GodotModding/godot-mod-loader`, licence shown CC0
- Live GitHub `Godot-Modding/loader` (2026-09-23): top level is `.gitignore`, `LICENSE`, `README.md`, `docs` only; no addon code

## Related

- [dialogic](dialogic.md)
- [godot-input-helper](godot-input-helper.md)

---
id: godotsteam
name: GodotSteam (GDExtension)
url: https://godotengine.org/asset-library/asset/2445
category: tools
subcategories: [godot, steam]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [gdextension]
tags: [godot, godot-4, steamworks, achievements, leaderboards]
added: 2026-07-19
verified: 2026-09-23
status: active
---

# GodotSteam (GDExtension)

GDExtension bindings to Steamworks for Godot 4 (achievements, stats, leaderboards, etc.). Docs/home: [godotsteam.com](https://godotsteam.com/). The add-on itself is MIT. Steamworks is a separate matter: using it at all needs a Steam partner account and Valve's Steamworks SDK agreement, which this catalog cannot read or summarise. Do not treat Asset Library "free" as a shipping clearance for the Steam side.

## Notes

- **Two grants, one checked.** The add-on is MIT, read at source on 2026-09-23. Valve's Steamworks SDK terms sit behind the partner account and are not public; you accept them when you join Steamworks, not by installing this add-on
- MIT asks that the copyright and permission notice ship with the software, so include GodotSteam's licence text with your build's third-party notices
- Godot 4 GDExtension: match the addon build to your engine minor version. A 4.2 build will not load in 4.3 without a rebuild.
- **Source moved to Codeberg.** Checked 2026-09-23: the GitHub repository `GodotSteam/GodotSteam` is archived, and its README reads "This repository has been moved to Codeberg" with a link to `codeberg.org/godotsteam/godotsteam`. It still published v4.22.1 on 2026-09-04 before archiving, so the project is active; only the host changed. The Asset Library URL above still resolves. Codeberg refuses scripted requests, so the licence was read in a browser
- Licence corrected from `custom` to `MIT` on 2026-09-23. The earlier `custom` reflected the unread Steamworks side, which is a precondition for using the add-on rather than its licence

## Evidence

- Live Codeberg `license.md`, branch `godot4` (2026-09-23): "MIT License", "Copyright (c) 2015-Current | GP Garcia, Chris Ridenour, and Contributors"

## Related

- [godot-mod-loader](godot-mod-loader.md)
- [godot-input-helper](godot-input-helper.md)

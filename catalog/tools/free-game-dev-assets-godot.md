---
id: free-game-dev-assets-godot
name: Free Game Dev Assets for Godot
url: https://github.com/TMHSDigital/free-game-dev-assets-godot
category: tools
subcategories: [godot]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [godot-addon]
tags: [godot, godot-4, editor-plugin, asset-browser, credits]
added: 2026-11-10
verified: 2026-11-10
status: active
---

# Free Game Dev Assets for Godot

Editor plugin that puts this catalog in a Godot 4 dock: search and filter the entries by category, licence family, commercial use, credit and whether they work in Godot, with the licence written on every row. Selecting an entry shows its licence, credit and the date it was read, opens its source or its catalog page, and copies the recorded credit line. A project keeps a list of the entries it uses and exports a `CREDITS.md` with the same sections and lines as this site's shortlist export. GDScript only, Godot 4.3 or later.

## Notes

- Made by this catalog's maintainers, so read this entry with that in mind; the licence below is quoted from the plugin's own repository like any other entry
- Reads the catalog's [`plugin-feed.json`](https://tmhsdigital.github.io/Free-Game-Dev-Assets/plugin-feed.json), at most once a day or on Refresh, and works offline from a saved copy; it never downloads or imports assets
- The only files it writes into a project are `free_game_dev_assets.json` (the asset list, meant to be committed) and `CREDITS.md`, and only when you add an entry or export; it replaces only the block between its own markers, so hand-written credits in the file are kept
- An entry the catalog stops listing stays in the exported `CREDITS.md` under "No longer listed" with the details the plugin last saw, rather than being dropped
- Its CI runs the site's own export code and the plugin's on the whole live catalog and fails if the two `CREDITS.md` files differ
- MIT requires the copyright notice to travel with the plugin's files; it is an editor tool and does not ship inside an exported game unless you export the `addons/` folder yourself
- Version 0.1.0 is the first release (2026-11): pre-1.0, so the changelog flags any change to the files it writes

## Evidence

- `LICENSE` in the repository at tag `v0.1.0` (2026-11-10): "MIT License Copyright (c) 2026 TM Hospitality Strategies"
- Same file (2026-11-10): "to deal in the Software without restriction"

## Related

- [beehave](beehave.md)
- [phantom-camera](phantom-camera.md)
- [godot-guide](godot-guide.md)
- [dialogic](dialogic.md)

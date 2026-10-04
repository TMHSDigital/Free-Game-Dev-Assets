---
id: cheetah-texture-packer
name: Cheetah Texture Packer
url: https://github.com/scriptum/Cheetah-Texture-Packer
category: tools
subcategories: [atlas, pipeline]
license: LGPL-3.0
commercial: true
attribution_required: false
formats: [desktop-app, cli, PNG]
tags: [spritesheet, atlas, bin-packing, maxrects]
verified: 2026-10-04
status: needs-review
maintenance: inactive
---

# Cheetah Texture Packer

Qt sprite atlas packer built on an aggressive MaxRects bin-packing heuristic, with a GUI and a command-line mode (crop, merge duplicates, rotate, extrude, square atlases). It writes a PNG atlas plus a plain-text `.atlas` index. The author calls it a research implementation that was never released, so there are no binaries: you build it from source with Qt.

## Notes

- Maintenance: no push to the GitHub repository scriptum/Cheetah-Texture-Packer since 2016-11-05, per the GitHub API on 2026-09-30.
- Licence version open: the repository `LICENSE` is the LGPL version 3 text, recorded as the bare vocabulary value `LGPL-3.0`. No source file header, `.pro` file or README line says "only" or "or later" (re-checked 2026-10-04 across the `.cpp`, `.h` and `.pro` files in `src/`), so LGPL-3.0-only vs LGPL-3.0-or-later cannot be chosen and `license_spdx` is left out. That is the one open question keeping this entry at `needs-review`; commercial stance and credit are not in doubt
- The LGPL covers the packer. Atlases and `.atlas` files you generate from your own sprites are your output, and the LGPL does not claim them. Redistributing a modified packer is the LGPL event, not shipping a game with its atlases
- The `.atlas` index uses the same layout as the author's UBFG bitmap-font generator. You write the loader yourself
- Source only. Expect to fix Qt 5/6 build details

## Evidence

- Live GitHub `LICENSE` (2026-09-30): "GNU LESSER GENERAL PUBLIC LICENSE Version 3, 29 June 2007"
- Live GitHub README (2026-09-30): "This tool was created as research implementation and never been released."
- GitHub API (2026-09-30): `license.spdx_id` "LGPL-3.0", `pushed_at` 2016-11-05, not archived
- Shallow clone of the default branch (2026-10-04): `LICENSE` still opens "GNU LESSER GENERAL PUBLIC LICENSE Version 3, 29 June 2007"; a grep of every `.cpp`, `.h` and `.pro` file in `src/` and the README for "licen", "GPL" and "later version" found no licence header or version statement

## Related

- [free-tex-packer](free-tex-packer.md)
- [gdx-texture-packer-gui](gdx-texture-packer-gui.md)
- [ezspritesheet](ezspritesheet.md)

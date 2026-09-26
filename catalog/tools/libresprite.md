---
id: libresprite
name: LibreSprite
url: https://github.com/LibreSprite/LibreSprite
category: tools
subcategories: [pixel]
license: GPL-2.0
commercial: true
attribution_required: false
formats: [ASE, PNG, GIF]
tags: [pixel-art, editor, aseprite-fork]
verified: 2026-08-24
status: active
---

# LibreSprite

Animated sprite editor forked from the last GPLv2 commit of Aseprite. This is the Aseprite-compatible FOSS path when you want `.ase` workflows without Aseprite's proprietary license. The program is GPL-2.0. The GitHub description and LICENSE.txt do not include an explicit "your sprites are yours" sentence; GPL on an editor does not copyleft PNGs you paint, but imported third-party sheets keep their own licenses.

## Notes

- GitHub: "Fork of the last GPLv2 commit of Aseprite". Feature set is frozen relative to modern Aseprite (no Aseprite 1.3+ extras)
- Project site `libresprite.github.io` returned an empty document on 2026-08-24. License evidence is `LICENSE.txt` in the repo
- Keep GPL-2.0 obligations if you redistribute a modified LibreSprite binary. Shipping sprite sheets you drew is not distributing LibreSprite
- Pixelorama is MIT and Godot-native if you do not need `.ase` compatibility
- Version left as bare `GPL-2.0` deliberately. The repository ships the stock GPLv2 text, whose own "How to Apply" appendix mentions "any later version"; that is boilerplate, not an election by the project. Checked 2026-09-22.

## Evidence

- Live GitHub description (2026-08-24): "Fork of the last GPLv2 commit of Aseprite"
- Live `LICENSE.txt` (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"

## Related

- [pixelorama](pixelorama.md)
- [krita](krita.md)
- [gimp](gimp.md)
- [jsfxr](jsfxr.md)

---
id: snowb-bmf
name: SnowB Bitmap Font
url: https://snowb.org
category: tools
subcategories: [atlas, ui]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [PNG, XML, JSON, TXT, BIN]
tags: [bitmap-font, bmfont, sdf, msdf, browser]
verified: 2026-09-30
status: active
---

# SnowB Bitmap Font

Browser-based bitmap font generator (SnowBamboo BMF). Load a TTF/OTF/WOFF, style the glyphs, and export AngelCode BMFont text, XML, binary or JSON descriptors with PNG atlas pages. SDF and MSDF rendering are built in, and it imports old Littera `.ltr` projects. Source is on GitHub at SilenceLeo/snowb-bmf, and everything runs locally in the page.

## Notes

- MIT covers the web app's code. The glyph atlas you export is a rendering of the font you loaded, so the font's own licence decides whether you may ship it (OFL is fine, many commercial desktop fonts are not). The tool grants nothing on the font
- Output works with engines that read BMFont (Godot, Unity TextMesh Pro, Phaser, PixiJS, Cocos)
- Third-party components are listed in `THIRD_PARTY_LICENSES.md` in the repo
- Repository last pushed 2026-06-30

## Evidence

- Live GitHub `LICENSE` (2026-09-30): "MIT License" / "Permission is hereby granted, free of charge"
- Live GitHub README (2026-09-30): "Bitmap font generator that runs in your browser"
- Same README, File formats (2026-09-30): "AngelCode BMFont Text, XML, Binary, JSON, C Header, PNG atlases"

## Related

- [free-tex-packer](free-tex-packer.md)
- [inkscape](inkscape.md)
- [../fonts/atkinson-hyperlegible](../fonts/atkinson-hyperlegible.md)

---
id: krita
name: Krita
url: https://krita.org
category: tools
subcategories: [painting]
license: GPL-3.0-or-later
license_spdx: GPL-3.0-or-later
commercial: true
attribution_required: false
formats: [KRA, PNG, TIFF, PSD, EXR]
tags: [texture-work, dcc, raster, texturing]
added: 2026-08-24
verified: 2026-08-24
status: active
---

# Krita

Free, cross-platform raster painting application built for illustration, concept art, and texture work. Fills the gap left by paid painting tools: full 16/32-bit float channels, a wrap-around canvas mode for seamless tiling textures, and per-layer color spaces. The tool is GPL-3.0, but the files you paint are yours outright, which is the distinction that matters for a commercial project.

## Notes

- Wrap-around mode (W key) previews tiling textures live, useful for terrain and trim sheets
- Exports OpenEXR and 16-bit-per-channel PNG, so it can author height and roughness maps without banding
- PSD import/export exists but is lossy on adjustment layers and layer styles; keep KRA as the master
- Animation timeline exports PNG sequences, which feed a sprite atlas packer directly
- GPL-3.0 obligations attach only if you redistribute a modified Krita binary, not to shipping your art
- Recorded as `-or-later` (#95): the project's own source headers grant "version 2 of the License, or (at your option) any later version", and the GPLv3 text it ships is a later version, so the distributed program may be used under GPLv3 or any later version. Per-file headers are `GPL-2.0-or-later` (and `LGPL-2.0-or-later` for parts of libs/ui); the bundled COPYING is the GPLv3 text.

## Evidence

- Live FAQ, "Can I use Krita commercially?" (2026-08-24): "What you create with Krita is your sole property."
- Same section (2026-08-24): "Krita's GPL license applies to Krita's source code."
- `COPYING` in the KDE repository (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"

## Related

- [pixelorama](pixelorama.md)
- [inkscape](inkscape.md)
- [material-maker](material-maker.md)
- [free-tex-packer](free-tex-packer.md)

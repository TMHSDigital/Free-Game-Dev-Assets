---
id: gimp
name: GIMP
url: https://www.gimp.org
category: tools
subcategories: [raster, painting, texturing]
license: GPL-3.0
commercial: true
attribution_required: false
formats: [XCF, PNG, TIFF, PSD, EXR]
tags: [painting, texture-work, open-source, dcc]
verified: 2026-08-24
status: active
---

# GIMP

GNU Image Manipulation Program: free raster editor for photo work, compositing, and texture authoring. This was the missing general-purpose raster tool beside Krita (painting-first) and Pixelorama (pixel-art-first). The program is GPL-3.0 or later. The FAQ states that GIMP does not restrict the kind of work you produce with it.

## Notes

- FAQ "Can I use GIMP commercially?": yes, and no restrictions on the kind of work produced. That is the output-ownership statement. GPL copyleft applies if you distribute a modified GIMP binary
- Native format is XCF. Export PNG/TIFF/EXR for engines. PSD import exists and is lossy on Photoshop-only features, same class of caveat as Krita
- Wrap-around / tile preview is weaker than Krita's W-key wrap-around mode. Prefer Krita when the job is seamless trim sheets
- Website images and Wilber are a separate question (many are CC-BY-SA). Do not ship the mascot from gimp.org without reading [linking.html](https://www.gimp.org/about/linking.html)
- Third-party "buy GIMP" stores are legal under GPL if they ship source. Prefer gimp.org downloads

## Evidence

- Live FAQ, "Can I use GIMP commercially?" (2026-08-24): "Yes, you can. GIMP is free software, it doesn't put restrictions on the kind of work you produce with it"
- Same FAQ, license section (2026-08-24): "distributed under terms of General Public License v3 and later"
- Live `/about/COPYING` (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"

## Related

- [krita](krita.md)
- [inkscape](inkscape.md)
- [pixelorama](pixelorama.md)
- [libresprite](libresprite.md)

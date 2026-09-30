---
id: pnggauntlet
name: PNGGauntlet
url: https://pnggauntlet.com
category: tools
subcategories: [compression, pipeline]
license: custom
commercial: unknown
attribution_required: false
formats: [desktop-app, PNG]
tags: [png, lossless, pngout, optipng, windows]
verified: 2026-09-30
status: needs-review
maintenance: inactive
---

# PNGGauntlet

Windows (.NET 4.0) freeware by Benjamin Hollis that runs PNGOUT, OptiPNG and DeflOpt over a batch of images to produce the smallest lossless PNGs, and converts JPG, GIF, TIFF and BMP to PNG. Version 3.1.2 is still downloadable from the official page. It is closed-source freeware, not open source.

## Notes

- Maintenance: the official page says PNGGauntlet "isn't being updated anymore" and still works, read on 2026-09-30. There is no public source repository.
- What the terms grant, as far as the page shows: free redistribution of the installer as long as nobody charges for it, modifies it, or bundles it without permission, plus a liability disclaimer. The full licence is only inside the installer's About dialog and was not read this session
- Ambiguity: the page summary says nothing about commercial *use*. Compressed PNGs are your own images and a lossless optimiser adds no content, but that is inferred, not quoted, hence `commercial: unknown` and `needs-review`
- The bundled PNGOUT is Ken Silverman's own freeware with separate terms
- The page itself points to Squoosh as an alternative. Prefer [squoosh](squoosh.md) or [pngyu](pngyu.md) if you need a licence you can quote

## Evidence

- Live `https://pnggauntlet.com/` (2026-09-30): "permits unlimited distribution as long as nobody charges money for it"
- Same page (2026-09-30): "A copy of the actual license is included in the installation"
- Same page (2026-09-30): "PNGGauntlet isn't being updated anymore. It still works fine"
- Live download `PNGGauntlet-3.1.2.exe` (2026-09-30): HTTP 200

## Related

- [squoosh](squoosh.md)
- [pngyu](pngyu.md)
- [imagealpha](imagealpha.md)

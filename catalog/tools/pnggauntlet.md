---
id: pnggauntlet
name: PNGGauntlet
url: https://pnggauntlet.com
category: tools
subcategories: [compression, pipeline]
license: custom
commercial: true
attribution_required: false
formats: [desktop-app, PNG]
tags: [png, lossless, pngout, optipng, windows]
verified: 2026-10-04
status: active
maintenance: inactive
---

# PNGGauntlet

Windows (.NET 4.0) freeware by Benjamin Hollis that runs PNGOUT, OptiPNG and DeflOpt over a batch of images to produce the smallest lossless PNGs, and converts JPG, GIF, TIFF and BMP to PNG. Version 3.1.2 is still downloadable from the official page. It is closed-source freeware, not open source.

## Notes

- Maintenance: the official page says PNGGauntlet "isn't being updated anymore" and still works, read on 2026-09-30. There is no public source repository.
- The licence: on 2026-10-04 the `License.txt` inside the official 3.1.2 installer (`PNGGauntletSetup.msi`) was read. It permits "Redistribution and use in binary forms" with conditions that all concern redistribution: no modified or bundled redistribution without permission, no charging for it, keep the copyright notice and disclaimer, no endorsement use of the name. Use of the program carries no commercial restriction, and the licence claims nothing over the images you compress, so `commercial: true`
- Credit: the copyright notice must travel with redistributed copies of PNGGauntlet itself. Nothing asks you to credit PNGGauntlet in a game whose PNGs it optimised, so `attribution_required: false`
- The licence is only published inside the installer, not on a web page. If the download disappears, this entry should be re-checked
- The bundled PNGOUT and DeflOpt are "used with permission" from their authors; OptiPNG is zlib/libpng. Those terms govern redistributing those binaries, not your images
- The page itself points to Squoosh as an alternative. Prefer [squoosh](squoosh.md) or [pngyu](pngyu.md) if you need a licence you can link to

## Evidence

- Live `https://pnggauntlet.com/` (2026-09-30): "permits unlimited distribution as long as nobody charges money for it"
- Same page (2026-09-30): "A copy of the actual license is included in the installation"
- Same page (2026-09-30): "PNGGauntlet isn't being updated anymore. It still works fine"
- Live download `PNGGauntlet-3.1.2.exe` (2026-09-30): HTTP 200
- `License.txt` in the official `https://pnggauntlet.com/PNGGauntlet-3.1.2.exe` installer, extracted 2026-10-04: "PNGGauntlet is Copyright (c) 2005-2012, Benjamin Hollis"; "Redistribution and use in binary forms are permitted provided that the following conditions are met"
- Same file (2026-10-04): "Redistributions with modification or as part of a larger software package are not permitted without specific prior written permission." and "Redistributions, with or without modification, must be distributed free of charge, unless specific prior written permission is given."
- Same file (2026-10-04): "Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer"

## Related

- [squoosh](squoosh.md)
- [pngyu](pngyu.md)
- [imagealpha](imagealpha.md)

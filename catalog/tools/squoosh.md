---
id: squoosh
name: Squoosh
url: https://squoosh.app
category: tools
subcategories: [compression, pipeline]
license: Apache-2.0
license_spdx: Apache-2.0
commercial: true
attribution_required: false
formats: [PNG, JPG]
tags: [image-compression, webp, avif, jpeg-xl, browser]
verified: 2026-09-30
status: active
---

# Squoosh

Google Chrome Labs image compression web app. Drop in an image, pick a codec and settings, compare against the original, and export. The repository ships MozJPEG, OxiPNG, WebP, AVIF, JPEG XL, QOI and WebP2 codecs plus resize and palette reduction (libimagequant), all compiled to WebAssembly and run locally in the browser. Useful for tuning web-build textures and store-page art.

## Notes

- Apache-2.0 covers the web app. Images you compress are your own. The app does not upload them
- The app uses Google Analytics for visit data and before/after sizes, per its README
- Individual codecs in `codecs/` carry their own upstream licences, which only matter if you redistribute a self-hosted build
- Last commit to the default `dev` branch was 2024-08-19. Not inactive yet, but development has slowed

## Evidence

- Live GitHub `LICENSE` (2026-09-30): "Apache License Version 2.0, January 2004"
- Live GitHub README (2026-09-30): "Squoosh does not send your image to a server."
- GitHub API (2026-09-30): `license.spdx_id` "Apache-2.0", not archived

## Related

- [pngyu](pngyu.md)
- [imagealpha](imagealpha.md)
- [basis-universal](basis-universal.md)

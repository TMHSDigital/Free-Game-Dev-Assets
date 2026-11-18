---
id: imagealpha
name: ImageAlpha
url: https://pngmini.com
license_url: https://pngmini.com/
category: tools
subcategories: [compression, pipeline]
license: GPL-2.0-only
license_spdx: GPL-2.0-only
commercial: true
attribution_required: false
formats: [PNG]
delivery: [desktop-app]
tags: [png, lossy-png, pngquant, macos]
added: 2026-09-30
verified: 2026-09-30
status: active
maintenance: archived
---

# ImageAlpha

macOS GUI for pngquant, pngnq and posterizer by Kornel Lesiński. It converts 24-bit PNGs to much smaller 8-bit palette PNGs while keeping full alpha, with a live preview against different backgrounds so you can pick the lowest palette size that still looks right. Handy for UI sprites and web builds. macOS only.

## Notes

- Maintenance: the GitHub repository kornelski/ImageAlpha is archived, with the last push on 2019-07-04, per the GitHub API on 2026-09-30.
- The GPL covers the application. PNGs you convert are your own images, and the GPL does not reach them. The bundled pngquant executable carries its own licence (current pngquant is GPL-3.0-or-later), which only matters if you redistribute the tool
- Recorded under the catalog convention (CONTRIBUTING, #95): a project that names a GPL version without saying "only" or "or later" is recorded as `-only`. The project says "GPL v2"
- Unmaintained Python/PyObjC app. Compatibility with current macOS releases was not tested this session. The `pngquant` CLI does the same job on any OS

## Evidence

- Live `https://pngmini.com/` (2026-09-30): "ImageAlpha is free, open-source software under terms of the GPL v2"
- Live GitHub `LICENSE` (2026-09-30): "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"
- GitHub API (2026-09-30): `archived` true, `pushed_at` 2019-07-04

## Related

- [pngyu](pngyu.md)
- [squoosh](squoosh.md)
- [pnggauntlet](pnggauntlet.md)

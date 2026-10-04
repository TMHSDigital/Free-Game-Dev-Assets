---
id: pngyu
name: Pngyu
url: https://github.com/nukesaq88/Pngyu
category: tools
subcategories: [compression, pipeline]
license: BSD
commercial: true
attribution_required: false
formats: [desktop-app, PNG]
tags: [png, lossy-png, pngquant, batch, windows, macos]
verified: 2026-10-04
status: needs-review
---

# Pngyu

Qt front end for pngquant by nukesaq88: drop a folder of PNGs, pick colour count and speed, and batch-convert them to 8-bit palette PNGs with alpha. Pre-built binaries for Windows and macOS are on the project homepage, and v1.0.5 was released on 2026-01-22. Building from source needs Qt 6.

## Notes

- Licence variant open: the project states only "the BSD license", with no clause count, no `LICENSE` file in the repository and no licence or copyright header in the sources (re-checked 2026-10-04). It is recorded as the bare vocabulary value `BSD`; BSD-2-Clause vs BSD-3-Clause cannot be chosen, so `license_spdx` is left out. Without the licence text there is also no copyright line to reproduce. That is why the entry stays `needs-review`
- The pre-built binaries bundle pngquant, which is GPL-3.0-or-later. That affects redistributing the download, not the PNGs you compress
- Compressed PNGs are your own images. Neither licence claims them
- Repository last pushed 2026-01-25

## Evidence

- Live GitHub README (2026-09-30): "Pngyu itself is distributed under the BSD license."
- Same README (2026-09-30): "the pre-built binaries include pngquant, which is licensed under GPL v3 or later"
- Live homepage `https://nukesaq88.github.io/Pngyu/` (2026-09-30): "Pngyu is Free Software released under the BSD License."
- GitHub API (2026-09-30): `license` null (no licence file detected)
- Re-check (2026-10-04): GitHub API `license` still null, `pushed_at` 2026-01-25; README still reads "Pngyu itself is distributed under the BSD license."; a grep of the cloned repository outside the bundled pngquant for "BSD", "license", "copyright" and "redistribut" matched only that README section

## Related

- [imagealpha](imagealpha.md)
- [squoosh](squoosh.md)
- [pnggauntlet](pnggauntlet.md)

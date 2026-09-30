---
id: jfxr
name: jfxr
url: https://jfxr.frozenfractal.com/
category: tools
subcategories: [sfx-generator]
license: BSD-3-Clause
license_spdx: BSD-3-Clause
commercial: true
attribution_required: false
formats: [WAV]
tags: [sfx, procedural, retro, browser, synthesis]
verified: 2026-09-30
status: active
---

# jfxr

Browser-based sound effect generator by Thomas ten Cate. It started from the sfxr/Bfxr idea and exposes more synthesis controls: amplitude, pitch, tone and filters, with presets and a mutate button. It exports WAV. Its synthesis core is also packaged as a JavaScript library, so a game can generate sounds at runtime.

## Notes

- BSD-3-Clause covers the code, in both `app/LICENSE` and `lib/LICENSE`. The README says sounds you make are entirely yours, for any use including commercial. Attribution is not required but a link back is appreciated
- Next to [jsfxr](jsfxr.md) and [chiptone](chiptone.md): jfxr exposes more synthesis parameters than jsfxr and less than ChipTone
- The page notes that WAV export is broken on Safari; saving opens a new tab you can save from
- The repository has no releases. Its last push was 2026-07-08, dependency updates (read 2026-09-30)

## Evidence

- Live GitHub README (2026-09-30): "The code itself is under a three-clause BSD license"
- Same README (2026-09-30): "Any sound you create with jfxr is entirely yours"
- Same README (2026-09-30): "Attribution is not required"
- Live GitHub `app/LICENSE` (2026-09-30): "Copyright (c) 2014, Thomas ten Cate"

## Related

- [jsfxr](jsfxr.md)
- [chiptone](chiptone.md)
- [bfxr](bfxr.md)
- [sfxr](sfxr.md)

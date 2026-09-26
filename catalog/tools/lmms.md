---
id: lmms
name: LMMS
url: https://lmms.io
category: tools
subcategories: [daw, music]
license: GPL-2.0-or-later
license_spdx: GPL-2.0-or-later
commercial: true
attribution_required: false
formats: [WAV, OGG, MIDI, MMP]
tags: [daw]
verified: 2026-09-22
status: active
---

# LMMS

Cross-platform DAW (Windows, Linux, macOS) with piano roll, mixer, built-in synths, LADSPA/VST, and SoundFont2. This is the missing tracker-adjacent music tool next to [tenacity](tenacity.md), which only edits samples. The application is GNU GPL-2.0. The homepage does not publish a license body (it says "100% free, open source"). GitHub `LICENSE.txt` is GPLv2. Pages fetched on 2026-08-24 do not say your exported song is yours. GPL on a DAW does not copyleft a composition you wrote, but that sentence is inferred. Bundled presets, VSTs, and any SF2 you load keep their own terms.

## Notes

- Evidence for the tool license: [github.com/LMMS/lmms](https://github.com/LMMS/lmms) `LICENSE.txt` and GitHub SPDX `GPL-2.0`
- Shipping LMMS itself inside a closed product is a GPL event. Shipping a WAV you bounced is not automatically that event
- Nintendo / Roland / Yamaha chip emulations in the plugin list are *emulations*. Do not treat ROM dumps or trademarked patch names as free
- Prefer [incompetech](../audio/incompetech.md) or [kenney-music-jingles](../audio/kenney-music-jingles.md) when you want a library grant instead of a DAW
- Checklist: license file on GitHub, commercial use of the *program* under GPL, no NC/ND on the app, not a marketplace, community project, not blocklisted, tool vs song ownership unquoted
- Source headers elect "or any later version", so the SPDX identifier is `GPL-2.0-or-later` rather than the bare, deprecated `GPL-2.0`.

## Evidence

- Live GitHub `src/core/main.cpp` header (2026-09-22): "either version 2 of the License, or (at your option) any later version"
- Live GitHub `LICENSE.txt` (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"
- Live GitHub repo license metadata (2026-08-24): SPDX "GPL-2.0"
- Live homepage (2026-08-24): "LMMS is a 100% free, open source, community-driven project" (not a license name)

## Related

- [tenacity](tenacity.md)
- [jsfxr](jsfxr.md)
- [chiptone](chiptone.md)
- [../audio/incompetech](../audio/incompetech.md)
- [../audio/kenney-music-jingles](../audio/kenney-music-jingles.md)

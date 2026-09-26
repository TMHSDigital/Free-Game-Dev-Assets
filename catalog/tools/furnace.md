---
id: furnace
name: Furnace
url: https://github.com/tildearrow/furnace
category: tools
subcategories: [music]
license: GPL-2.0-or-later
license_spdx: GPL-2.0-or-later
commercial: true
attribution_required: false
formats: [desktop-app]
tags: [tracker, chiptune, sound-chips, retro]
verified: 2026-09-26
status: active
---

# Furnace

Multi-system chiptune tracker that emulates a long list of sound chips (Yamaha FM, AY/YM, SN76489, SNES, Amiga, PC Engine and many more). It is the tool for music that has to sound like a specific retro console or arcade board. Releases for Windows, macOS and Linux are on GitHub.

## Notes

- The GPL covers the program. Music you write and render is your own; shipping Furnace itself inside a closed product would be a GPL event
- **ASIO builds are GPL-3.0:** the `LICENSE` says enabling ASIO support at build time "will result in a GPLv3-licensed binary". Irrelevant to the music you export
- Emulation cores and libraries carry their own licences in their source trees
- Chip emulation is not a licence to any ROM, sample set or trademarked patch name

## Evidence

- Live GitHub `LICENSE` (2026-09-26): "most of Furnace is under the GNU General Public License (GPL) version 2 or later" and "certain components, such as emulation cores, libraries and tools, are under various licenses, which can be found in their respective source files/trees"
- Live GitHub `src/main.cpp` header (2026-09-26): "either version 2 of the License, or (at your option) any later version"
- Live GitHub README (2026-09-26): "available for Windows, macOS and Linux"

## Related

- [openmpt](openmpt.md)
- [beepbox](beepbox.md)
- [lmms](lmms.md)

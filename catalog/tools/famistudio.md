---
id: famistudio
name: FamiStudio
url: https://famistudio.org/
category: tools
subcategories: [music]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [desktop-app, mobile-app]
tags: [nes, chiptune, sequencer, sound-engine, retro]
verified: 2026-09-30
status: active
---

# FamiStudio

NES and Famicom music editor with a piano-roll interface instead of a tracker grid, so it is easier for people who don't read tracker columns. It covers the 2A03 and the expansion audio chips. It exports WAV, MP3 and OGG for any engine, and NSF, ROM and assembly for real NES homebrew. It runs on Windows, macOS, Linux and Android, and is actively maintained: 4.5.3 was released on 2026-08-10.

## Notes

- MIT covers the application. Music you write and render is your own
- For NES homebrew, the bundled sound engine (`SoundEngine/famistudio_*.s`) has its own all-permissive notice. You may copy and modify it without royalty, provided the copyright notice stays in source copies. A ROM built with it owes no product credit
- The engine is a heavily modified FamiTone2 by Shiru, which the header acknowledges
- The author asks contributors to get in touch before opening pull requests
- For a full NES tracker instead of a piano roll, see [dn-famitracker](dn-famitracker.md). For many chips beyond the NES, see [furnace](furnace.md)

## Evidence

- Live GitHub `LICENSE` (2026-09-30): "MIT License", "Copyright (c) 2019 BleuBleu"
- Live GitHub `SoundEngine/famistudio_ca65.s` header (2026-09-30): "permitted in any medium without royalty provided the copyright notice and this notice are preserved"
- Live GitHub releases (2026-09-30): latest release 4.5.3, published 2026-08-10

## Related

- [dn-famitracker](dn-famitracker.md)
- [furnace](furnace.md)
- [milkytracker](milkytracker.md)
- [openmpt](openmpt.md)

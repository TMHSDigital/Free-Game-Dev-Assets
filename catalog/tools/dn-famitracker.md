---
id: dn-famitracker
name: Dn-FamiTracker
url: https://github.com/Dn-Programming-Core-Management/Dn-FamiTracker
category: tools
subcategories: [music]
license: GPL-3.0-or-later
license_spdx: GPL-3.0-or-later
commercial: true
attribution_required: false
formats: [desktop-app]
tags: [nes, tracker, chiptune, retro, windows]
verified: 2026-09-30
status: active
---

# Dn-FamiTracker

Maintained fork of FamiTracker, the classic NES and Famicom tracker. The GitHub description calls it "modifications and improvements for 0CC-FamiTracker". Use it if you want the FamiTracker workflow and module format with current bug fixes. Windows only. The latest release is Dn0.5.3.0 (2026-05-25), and the repository was last pushed on 2026-09-23 (read 2026-09-30).

## Notes

- The application is GPL-3.0-or-later. It inherits FamiTracker and 0CC-FamiTracker code, which was GPLv2-or-later. Music you write and render to WAV is your own
- Its components carry their own licences: emu2413, emu2149 and JSON for Modern C++ are MIT, Blip_buffer is LGPL-2.1, libsamplerate is BSD-2-Clause, and the Mesen cores are GPLv3-or-later
- **NSF driver, only if you ship music inside a NES ROM:** Dn-FT's own driver changes are MIT-0. But `LICENSE.md` says the original FamiTracker driver is "source-available, under no explicit license". Its permission is only "presumed". Read `Source/drivers/asm/LICENSE.md` before building a commercial NES release on it, or use [famistudio](famistudio.md), whose sound engine has an explicit permissive notice
- NSFPlay is used "under an informal license", per the same file

## Evidence

- Live GitHub `LICENSE.md` (2026-09-30): "The application is distributed under the GPLv3+ license, or any later version"
- Same file (2026-09-30): "Dn-FT NSF driver modifications are under MIT-0"
- Live `Source/drivers/asm/LICENSE.md` (2026-09-30): "It is instead source-available, under no explicit license"

## Related

- [famistudio](famistudio.md)
- [furnace](furnace.md)
- [milkytracker](milkytracker.md)

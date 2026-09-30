---
id: milkytracker
name: MilkyTracker
url: https://milkytracker.org/
category: tools
subcategories: [music]
license: GPL-3.0-or-later
license_spdx: GPL-3.0-or-later
commercial: true
attribution_required: false
formats: [desktop-app]
tags: [tracker, fasttracker, xm, amiga, retro]
verified: 2026-09-30
status: active
---

# MilkyTracker

Open-source tracker modelled on Fasttracker II, for XM and MOD music. It will feel familiar to anyone from the 90s demoscene. Module files are small and several game audio libraries play them directly, which still suits retro-styled games. It runs on Windows, macOS and Linux. The latest release is v1.05.01 (2024-11-28), and the repository was last pushed on 2026-09-10 (read 2026-09-30).

## Notes

- The tracker is GPL-3.0-or-later. Music you compose, as a module or rendered audio, is your own
- The player library MilkyPlay is under the New-BSD licence. You can embed it in a closed-source game to play XM and MOD files without the GPL applying
- For a Windows tracker with more formats and a larger plugin ecosystem see [openmpt](openmpt.md); for chip-specific sound see [furnace](furnace.md)

## Evidence

- Live GitHub `COPYING` (2026-09-30): "Milkyplay (the player library used by MilkyTracker) is now licensed under the New-BSD license"
- Same file (2026-09-30): "The rest of MilkyTracker remains covered by the GPL" followed by "Version 3, 29 June 2007"
- Live GitHub `src/tracker/Tracker.cpp` header (2026-09-30): "either version 3 of the License, or (at your option) any later version"

## Related

- [openmpt](openmpt.md)
- [furnace](furnace.md)
- [famistudio](famistudio.md)
- [sunvox](sunvox.md)

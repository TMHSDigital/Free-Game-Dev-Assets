---
id: fracplanet
name: Fracplanet
url: https://sourceforge.net/projects/fracplanet/
category: tools
subcategories: [terrain, procedural]
license: GPL-3.0-or-later
license_spdx: GPL-3.0-or-later
commercial: true
attribution_required: false
formats: [desktop-app]
tags: [planet, heightfield, fractal, pov-ray]
maintenance: inactive
verified: 2026-09-30
status: needs-review
---

# Fracplanet

Tim Day's Qt/OpenGL application that generates random fractal planets and terrain with oceans, mountains, ice caps and rivers, then exports them to POV-Ray or to Blender. Source-only release (0.4.0 tarball); you build it yourself, mainly on Linux. Filed under tools beside [gaea](gaea.md) because it is a generator, not a terrain dataset. It stays `needs-review` because the project states two different GPL versions.

## Notes

- The licence conflict: the SourceForge project page says GPLv2, and the tarball's LICENSE file is the GPLv2 text, but every source file header in the same tarball says GPLv3 or any later version. The frontmatter records the headers, which are the author's own statement about the code; the version is unsettled
- Either version allows commercial use of the program. GPL covers the program, not the planets you generate and export; exported meshes are your output
- Community forks exist on GitHub (Qt5/Qt6 ports, a Blender export fix). They carry the same headers; they are not the author's release
- Maintenance: SourceForge shows last update 2017-11-16, read 2026-09-30

## Evidence

- Live [SourceForge project page](https://sourceforge.net/projects/fracplanet/) (2026-09-30): License "GNU General Public License version 2.0 (GPLv2)"
- fracplanet-0.4.0.tar.gz source headers, downloaded 2026-09-30: "either version 3 of the License, or (at your option) any later version"
- Same tarball, LICENSE file (2026-09-30): "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"

## Related

- [gaea](gaea.md)
- [terrain3d](terrain3d.md)
- [opentopography](../environment/opentopography.md)

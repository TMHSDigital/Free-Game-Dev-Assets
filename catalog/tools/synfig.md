---
id: synfig
name: Synfig Studio
url: https://www.synfig.org/
category: tools
subcategories: [animation, vectors]
license: GPL-3.0
commercial: true
attribution_required: false
formats: [desktop-app]
tags: [2d-animation, vector, tweening, bones]
verified: 2026-09-26
status: active
---

# Synfig Studio

Vector 2D animation program built around tweening: you set keyframes and Synfig interpolates shapes, transforms and bone rigs between them, instead of drawing every frame. Useful for cut-out style character animation and animated UI.

## Notes

- **Version wording:** the site and README say GPL v3, and the repository `LICENSE` is the GPLv3 text, but the source headers read (for example `synfig-studio/src/gui/main.cpp`) say "version 2 of the License, or (at your option) any later version". The project-level statement is GPLv3 without an "or later", so this entry keeps the bare `GPL-3.0`
- The GPL covers the program. Animations and rendered frames you make are your own work
- Filed in `tools/` with [krita](krita.md) and [pixelorama](pixelorama.md), the other general 2D art and animation editors; `animation/` holds clips and capture tools

## Evidence

- Live homepage (2026-09-26): "Synfig is a free and open-source software licensed under GNU GPL v3"
- Live GitHub README (2026-09-26): "This project is licensed under the GNU General Public License v3.0"
- Live GitHub `synfig-studio/src/gui/main.cpp` header (2026-09-26): "either version 2 of the License, or (at your option) any later version"

## Related

- [opentoonz](opentoonz.md)
- [pencil2d](pencil2d.md)
- [krita](krita.md)

---
id: tiled
name: Tiled Map Editor
url: https://www.mapeditor.org/
category: tools
subcategories: [level-editor]
license: GPL-2.0-or-later
license_spdx: GPL-2.0-or-later
commercial: true
attribution_required: false
formats: [tmx, JSON]
tags: [tilemap, isometric, hex]
verified: 2026-09-22
status: active
---

# Tiled Map Editor

Mature tilemap editor (isometric/hex/ortho). The editor (`src/tiled`) is GPL-2.0. Official `libtiled` is BSD-2-Clause, not MIT. You can ship commercial games that load Tiled maps through a BSD/MIT loader. Do not statically link the GPL editor into a closed-source shipping binary.

## Notes

- Homepage: "free and open source"; versioned grant is GitHub `LICENSE.GPL` (GPL Version 2, June 1991)
- `COPYING` table: plugins GPL; libtiled / tmxviewer / tmxrasterizer BSD-2-Clause
- Complements [ldtk](ldtk.md) (MIT editor)
- Version precision corrected 2026-09-22. The bundled `LICENSE.GPL` is simply the stock GPLv2 text; the editor's own source headers elect "or any later version", making it `GPL-2.0-or-later`.

## Evidence

- Live GitHub `src/tiled/mainwindow.cpp` header (2026-09-22): "either version 2 of the License, or (at your option) any later version"
- Live GitHub `LICENSE.GPL` (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"
- Live GitHub `COPYING` (2026-08-24): "Tiled src/tiled GPL" and "libtiled src/libtiled BSD 2-clause license"
- Live homepage (2026-08-24): "Tiled is a free and open source"

## Related

- [ldtk](ldtk.md)
- [kenney-tiny-dungeon](../2d/kenney-tiny-dungeon.md)

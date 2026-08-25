---
id: tiled
name: Tiled Map Editor
url: https://www.mapeditor.org/
category: tools
subcategories: [level-editor]
license: GPL-2.0
commercial: true
attribution_required: false
formats: [tmx, json]
tags: [tilemap, isometric, hex, r04]
verified: 2026-08-24
status: active
---

# Tiled

Mature tilemap editor (isometric/hex/ortho). The editor (`src/tiled`) is GPL-2.0. Official `libtiled` is BSD-2-Clause, not MIT. You can ship commercial games that load Tiled maps through a BSD/MIT loader. Do not statically link the GPL editor into a closed-source shipping binary.

## Notes

- Homepage: "free and open source"; versioned grant is GitHub `LICENSE.GPL` (GPL Version 2, June 1991)
- `COPYING` table: plugins GPL; libtiled / tmxviewer / tmxrasterizer BSD-2-Clause
- Complements [ldtk](ldtk.md) (MIT editor)

## Evidence

- Live GitHub `LICENSE.GPL` (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"
- Live GitHub `COPYING` (2026-08-24): "Tiled src/tiled GPL" and "libtiled src/libtiled BSD 2-clause license"
- Live homepage (2026-08-24): "Tiled is a free and open source"

## Related

- [ldtk](ldtk.md)
- [kenney-tiny-dungeon](../2d/kenney-tiny-dungeon.md)

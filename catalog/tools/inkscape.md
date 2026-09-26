---
id: inkscape
name: Inkscape
url: https://inkscape.org
category: tools
subcategories: [vectors, ui, icons]
license: GPL-3.0-or-later
license_spdx: GPL-3.0-or-later
commercial: true
attribution_required: false
formats: [SVG, PNG, PDF, EPS]
tags: [vector, svg, ui, icons, dcc]
verified: 2026-09-22
status: active
---

# Inkscape

Free vector editor with native SVG as its working format, which makes it the natural companion to the SVG icon sets already in this catalog. Useful for recoloring and recombining icons, authoring resolution-independent UI, and batch-exporting PNG at multiple densities. The project states plainly that exported files belong to you, so the GPL on the application does not reach your artwork.

## Notes

- Inkscape writes SVG with its own `inkscape:` namespace attributes; run Save As plain SVG before importing into Godot or a web build
- Export PNG dialog takes an explicit DPI, so one source file yields 1x/2x/4x UI atlases without redrawing
- Batch export of every object as a separate PNG is under Export, Batch Export, which is how to slice an icon sheet
- The licensing page distinguishes the software license from output ownership; derivative clipart you import keeps its own license, and Inkscape stores that in Document Properties metadata
- Text is not converted to paths on export by default; convert before shipping SVG or the font must ship too
- Version corrected 2026-09-22. The licensing page still shows the GPLv2 text title, but the in-tree `COPYING` states the shipped binaries are GPL-3.0-or-later, because GPL-3-or-later files are linked in. Source files remain mostly GPL-2.0-or-later. Either way the GPL covers the application, not your exported artwork.

## Evidence

- Live GitLab `COPYING` (2026-09-22): "the complete binaries of Inkscape are currently covered by the terms of GNU GPL version 3 or later"
- Same file (2026-09-22): "Most Inkscape source code is available under the GNU General Public License, version 2 or later"
- Live licensing page, "Files made using Inkscape" (2026-08-24): "owned by the creators of the work (that's you)"
- Same page, Software License section (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"

## Related

- [krita](krita.md)
- [../2d/lucide-icons](../2d/lucide-icons.md)
- [../2d/game-icons-net](../2d/game-icons-net.md)
- [../2d/tabler-icons](../2d/tabler-icons.md)

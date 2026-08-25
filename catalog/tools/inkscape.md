---
id: inkscape
name: Inkscape
url: https://inkscape.org
category: tools
subcategories: [vector, ui, icons]
license: GPL-2.0
commercial: true
attribution_required: false
formats: [SVG, PNG, PDF, EPS]
tags: [vector, svg, ui, icons, open-source, dcc]
verified: 2026-08-24
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

## Evidence

- Live licensing page, "Files made using Inkscape" (2026-08-24): "owned by the creators of the work (that's you)"
- Same page, Software License section (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"

## Related

- [krita](krita.md)
- [../2d/lucide-icons](../2d/lucide-icons.md)
- [../2d/game-icons-net](../2d/game-icons-net.md)
- [../2d/tabler-icons](../2d/tabler-icons.md)

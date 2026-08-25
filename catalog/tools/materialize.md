---
id: materialize
name: Materialize
url: https://boundingboxsoftware.com/materialize/
category: tools
subcategories: [textures, pbr, baker]
license: GPL-3.0
commercial: true
attribution_required: false
formats: [PNG, TGA]
tags: [pbr, baker, open-source]
verified: 2026-08-24
status: active
---

# Materialize

Standalone Bounding Box Software tool that builds a PBR set from a photo: height, metallic, smoothness, normal, occlusion, plus seamless tiling. Used on the Uncharted Collection remaster for metallic/smoothness/AO. The application is GNU GPL v3. The pages fetched this session do not spell out ownership of maps you generate. Treat output like other GPL editors: the program is copyleft, the bitmaps you export from your own photos are not automatically GPL, and photos you did not take keep their own licenses.

## Notes

- Source: [github.com/BoundingBoxSoftware/Materialize](https://github.com/BoundingBoxSoftware/Materialize). Unity project in-repo
- Download flow goes through `getkey.php`. Still GPL; not a paid EULA
- Clipboard/XML automation exists for batch open/save. Useful for folder dumps, easy to accidentally process third-party textures whose licenses you do not have
- Prefer this when you already own a photo. Prefer [ambientcg](../3d/ambientcg.md) / [cgbookcase](../3d/cgbookcase.md) when you need a ready CC0 stack
- FAQ fetched this session is install troubleshooting only. No output-ownership FAQ line

## Evidence

- Live homepage, Open Source (2026-08-24): "Materialize is open source under the GNU GPL v3"
- Live GitHub `LICENSE` (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"

## Related

- [material-maker](material-maker.md)
- [../3d/ambientcg](../3d/ambientcg.md)
- [../3d/cgbookcase](../3d/cgbookcase.md)
- [krita](krita.md)
- [xnormal](xnormal.md)

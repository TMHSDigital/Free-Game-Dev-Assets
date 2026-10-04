---
id: xnormal
name: xNormal
url: https://xnormal.net
category: tools
subcategories: [textures, baker]
license: custom
commercial: true
attribution_required: false
formats: [PNG, TGA, EXR]
tags: [baker, normals, windows]
verified: 2026-10-04
status: active
---

# xNormal

Windows baker (v3.19.3c) for normal maps, AO, and related texture maps from high/low meshes. DirectX 10+, 4 GB RAM. The homepage only calls it a "free app", but the licence shipped inside the official installer (`docs/xNormal_legal_unified.rtf`) is a zlib-style freeware licence that allows use "for any purpose, including commercial applications" and makes credit optional. If you need a licence you can link to on a web page, [materialize](materialize.md) (GPL v3) is the alternative.

## Notes

- Licence: read on 2026-10-04 from `docs/xNormal_legal_unified.rtf` inside `xNormal-3.19.3c-installer.exe`, served by the download form on xnormal.net. The site's own legal page says the program "will be ruled by its own conditions" accepted during installation, so the installer text is the authoritative one. It is published nowhere on the web
- Commercial: use and free redistribution are allowed "for any purpose, including commercial applications". You may not sell, rent or lend the program itself, or reverse-engineer or modify its files
- Credit: an acknowledgment "would be appreciated, but is not required". If you redistribute xNormal, the copyright notice and licence must go with it
- The licence covers the program; it claims nothing over the maps you bake. Third-party high-poly scans you bake from keep their own licences, and bundled plug-ins/libraries (Lua and others) have their own terms, listed in the same file
- Copyright holder per the licence: S.Orgaz (2005-2018)
- Windows-only. No macOS/Linux build on the page fetched

## Evidence

- Live homepage (2026-08-24): "xNormal is a free app to bake texture maps"
- Live `/eula.html` and `/license.txt` (2026-08-24): HTTP 404. No EULA body on 2026-08-24
- Re-check (2026-10-04): live homepage still reads "xNormal™ is a free app to bake texture maps ( like normal maps and ambient occlusion )." and carries no licence, EULA or commercial-use sentence; `/eula.html` and `/license.txt` still HTTP 404
- Live [legal info page](https://xnormal.net/infLeg_en.php) (2026-10-04): "The use of the download service offered on this site, and the program's install process in your computer, will be ruled by its own conditions"
- `docs/xNormal_legal_unified.rtf` in the official `xNormal-3.19.3c-installer.exe` from https://xnormal.net, extracted 2026-10-04: "xNormal's main license & copyright"; "Copyright (c) 2005-2018 S.Orgaz"
- Same file (2026-10-04): "Permission is granted to anyone to use, copy and/or redistribute this software for any purpose, including commercial applications, subject to the following restrictions:"
- Same file (2026-10-04): "If you use this software in a product, an acknowledgment in the product documentation would be appreciated, but is not required."
- Same file (2026-10-04): "3. You can't sell, resell, rent, lease or lend this software." and "5. The Copyright notice above and this license must be included in any redistribution of this software."

## Related

- [materialize](materialize.md)
- [material-maker](material-maker.md)
- [../3d/ambientcg](../3d/ambientcg.md)

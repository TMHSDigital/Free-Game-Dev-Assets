---
id: cloudcompare
name: CloudCompare
url: https://www.cloudcompare.org
category: tools
subcategories: [point-cloud, pipeline]
license: GPL-2.0
commercial: true
attribution_required: false
formats: [LAS, E57, PLY, OBJ]
tags: [lidar, point-cloud, gpl]
verified: 2026-08-24
status: active
---

# CloudCompare

Point-cloud / mesh tool for lidar cleanup, alignment, and sampling down to something an engine can swallow. Download page: "Free as in Free speech". Wiki License page: **CCLib** (core algorithms) is LGPL 2.0 and "can be integrated in any commercial or non-commercial project" if you share modifications of that lib; **CloudCompare the app** plus qCC_db / qCC_io / qCC_gl are GPL 2.0. `license.txt` in GitHub matches GPL-2-or-later for the program. Use the app on your clouds. Do not copy qCC_* into a closed engine without GPL.

## Notes

- Wiki: [cloudcompare.org/doc/wiki/index.php?title=License](https://www.cloudcompare.org/doc/wiki/index.php?title=License) (last edited 2015; still the page they link)
- Homepage fetch via HTML-to-markdown failed this session; download and wiki pages returned 200 as text
- Global Shift exists because lidar is in Earth coordinates. Apply it before export or your mesh is 1e6 units from origin
- Checklist: license on wiki + GitHub, commercial use of the *app* under GPL / CCLib under LGPL, no NC/ND, not a marketplace, named project, not blocklisted, lib vs app split recorded, output ownership unquoted

## Evidence

- Live wiki License (2026-08-24): "The license of the CCLib library ... is LGPL version 2.0"
- Same page (2026-08-24): "can be integrated in any commercial or non-commercial project"
- Same page (2026-08-24): "The license of the other components is GPL (version 2.0)"
- Live GitHub `license.txt` (2026-08-24): "under the terms of the GNU General Public License ... version 2 or later"

## Related

- [meshlab](meshlab.md)
- [instant-meshes](instant-meshes.md)
- [../environment/opentopography](../environment/opentopography.md)
- [osm2world](osm2world.md)

---
id: instant-meshes
name: Instant Meshes
url: https://github.com/wjakob/instant-meshes
category: tools
subcategories: [remesh, pipeline]
license: BSD-3-Clause
commercial: true
attribution_required: false
formats: [OBJ]
tags: [retopo, remesh, quad, open-source]
verified: 2026-08-24
status: active
---

# Instant Meshes

Interactive field-aligned remesher from Jakob / Tarini / Panozzo / Sorkine-Hornung (SIGGRAPH Asia 2015). The job it closes here is turning dense scans or sculpt dumps into a quad-ish mesh you can actually UV and skin. The program is BSD-3-Clause. Pages fetched this session do not say "the mesh you export is yours" in those words. Treat it like other pipeline tools: the code is BSD, the topology you compute from *your* input is not automatically BSD, and third-party scans keep their own licenses.

## Notes

- Evidence: `LICENSE.txt` in [wjakob/instant-meshes](https://github.com/wjakob/instant-meshes). README also links prebuilt Windows / macOS / Linux zips on S3
- The binary expects a sibling `datasets` folder or the Open panel is empty. Those demo meshes are for the paper UI, not a shippable kit
- Workflow: orientation field, then position field, then Export mesh. Brush tools exist; they are easy to overfit
- Modo 10.2+ ships a related auto-retopo. That is Foundry's product, not a second license for this repo
- Checklist: license file visible, commercial redistribution of the *software* permitted with notice, no NC/ND, not a marketplace, ETH/authors are named, not blocklisted, tool vs export ownership unquoted

## Evidence

- Live `LICENSE.txt` (2026-08-24): "Redistribution and use in source and binary forms, with or without modification, are permitted"
- Same file (2026-08-24): "Neither the name of the copyright holder nor the names of its contributors may be used to endorse"

## Related

- [meshoptimizer](meshoptimizer.md)
- [assimp](assimp.md)
- [quadriflow](quadriflow.md)
- [../3d/smithsonian-open-access](../3d/smithsonian-open-access.md)
- [materialize](materialize.md)

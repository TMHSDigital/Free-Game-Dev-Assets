---
id: als-community
name: Advanced Locomotion System Community
url: https://github.com/PanicPetal/ALS-Community
category: tools
subcategories: [unreal, animation]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, locomotion, character-movement, anim-blueprint, replication, mantling, ragdoll]
ue_versions: "5.4"
added: 2026-10-13
verified: 2026-10-13
status: active
---

# Advanced Locomotion System Community

Community C++ port of Advanced Locomotion System V4 for Unreal Engine: a third-person character locomotion framework with stances, gaits, rotation modes, mantling, ragdoll and footstep handling, rebuilt as a replicated plugin. The source code is MIT licensed. The maintainer now recommends newer locomotion systems for new projects, so treat this as a reference or a base for existing ALS projects.

## Notes

- Canonical URL: the original address `github.com/dyanikoglu/ALS-Community` now redirects to `github.com/PanicPetal/ALS-Community`, which the GitHub API reports as the repository's current full name; the README still links issues and the wiki under the old path
- The README states: "Advanced Locomotion system is built upon pretty outdated animation programming techniques of pre Unreal Engine 5 era, and I highly recommended to utilize other available locomotion systems, such as Epic's Lyra sample project. This repository will only receive engine compatibility fixes from now."
- Version recorded from the README ("for **Unreal Engine 5.4**") and the `.uplugin`, which declares `"EngineVersion": "5.4.0"`; release v4.26 (2024-07-09) is the 5.4 compatibility update and no later release exists
- Supported platforms per the README are Windows and Linux; console, Mac and mobile are "not tested and supported"
- C++ core with an Animation Blueprint; input uses Enhanced Input; setup instructions are on the repository wiki
- The README scopes the licence to "**Source code** of the plugin"; the LICENSE copyright line credits LongmireLocomotion "as developer of the blueprints used as reference for source code"; the original marketplace ALS V4 content is a separate product under Epic's marketplace terms, so check any animations or meshes you take from the sample before redistributing them outside an Unreal project
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL and LGPL; keep the copyright notice in your third-party credits
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2024-07-10; under three years, so no `maintenance` value is set, but the README limits future work to engine compatibility fixes

## Evidence

- `LICENSE` in the repository, `main` branch (2026-10-13): "MIT License Copyright (c) 2020 Doğa Can Yanıkoğlu & LongmireLocomotion as developer of the blueprints used as reference for source code"
- Same file (2026-10-13): "to deal in the Software without restriction"
- `README.md`, `main` branch (2026-10-13): "**Source code** of the plugin is licensed under MIT license"

## Related

- [pb-character-movement](pb-character-movement.md)
- [kawaii-physics](kawaii-physics.md)
- [gas-documentation](gas-documentation.md)
- [mixamo](../animation/mixamo.md)

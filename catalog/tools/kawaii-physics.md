---
id: kawaii-physics
name: Kawaii Physics
url: https://github.com/pafuhana1213/KawaiiPhysics
category: tools
subcategories: [unreal, animation]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, physics, bone-physics, secondary-motion, anim-graph, hair, cloth]
ue_versions: "5.3-5.8"
added: 2026-10-13
verified: 2026-10-13
status: active
---

# Kawaii Physics

Lightweight bone physics for Unreal Engine: an AnimGraph node that adds secondary motion to hair, skirts, tails, ears and accessories without setting up a Physics Asset or a cloth simulation. It is a pseudo-physics solver tuned for stylised characters, cheap enough to run on many characters at once. The GitHub source is MIT licensed and can ship inside a closed commercial game.

## Notes

- Used from an Animation Blueprint: add the `KawaiiPhysics` node to the AnimGraph and point it at a root bone; parameters and external forces (wind, gravity) can be driven at runtime from Blueprint or C++
- Supported versions come from the README, which states "Unreal Engine 5.3 ~ 5.8"; the last UE4 release is v1.11.1 for UE 4.27, linked from the README
- Install by copying `Plugins/KawaiiPhysics` from the repository or a release into your project's `Plugins` folder; the repository root is a sample project with one example level per feature
- The README warns that packaging a Blueprint-only project can fail; converting to a C++ project (add any C++ class) is the stated fix
- A Fab listing exists and the README says it is "Same content as the GitHub version"; the paid listing is a way to support the author, the GitHub copy is the free one
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL and LGPL; keep the copyright notice in your third-party credits
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2026-10-01; latest release v1.21.0 (2026-06-23)

## Evidence

- `LICENSE` in the repository, `master` branch (2026-10-13): "MIT License Copyright (c) 2019-2026 pafuhana1213"
- Same file (2026-10-13): "to deal in the Software without restriction"
- `README.md`, `master` branch (2026-10-13): "Unreal Engine 5.3 ~ 5.8"

## Related

- [als-community](als-community.md)
- [ue5coro](ue5coro.md)
- [mixamo](../animation/mixamo.md)
- [dlgsystem](dlgsystem.md)

---
id: microsoft-rocketbox
name: Microsoft Rocketbox
url: https://github.com/microsoft/Microsoft-Rocketbox
publisher: Microsoft
category: characters
subcategories: [humanoid, rigged, library]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [FBX]
tags: [rigged, vr, research-origin, diverse]
verified: 2026-09-26
status: active
maintenance: inactive
---

# Microsoft Rocketbox

115+ fully rigged humanoid avatars (multi-LOD FBX) released by Microsoft Research. Useful crowd / NPC / VR embodiment starter set when you need variety beyond stylized CC0 kits.

## Notes

- Maintenance: no push to the GitHub repository microsoft/Microsoft-Rocketbox since 2022-10-02, per the GitHub API on 2026-09-26.
- README still mentions the older “research/academic” blog framing; **LICENSE.md is MIT** (updated Dec 2020) — keep the copyright notice.
- Unity import helpers ship in-repo; Unreal batch importer contributed later. Retarget animations carefully (skeleton is library-specific).
- Paper citation requested for *research* use; MIT still requires copyright notice in distributions.
- What the repository ships beyond the meshes, per its README read 2026-09-23: **four poly levels per avatar** (`hipoly`, `midpoly`, `lowpoly`, `ultralowpoly`), **417 animations** (added 4/2022), and **facial blendshapes** (15 visemes, 48 FACS, 30 for the Vive facial tracker, plus ARKit-compatible sets from 6/2022). No other character source in this catalog has facial blendshapes or built-in LODs
- Tooling is Unity-first: the import script fixes 3ds Max materials and reorganises bones for Unity's humanoid rig. In Godot or Unreal, plan on doing that step yourself
- Keep the MIT copyright and permission notice (`LICENSE.md`, "Copyright (c) 2020 Microsoft") with redistributed copies of the avatars; no on-screen credit is required. The README's citation request covers research use only

## Evidence

- `LICENSE.md` (2026-08-24): MIT License, Copyright (c) 2020 Microsoft — rights include use, modify, sell.
- README changelog: “12/2020: Updated license to MIT.”
- Live [LICENSE.md](https://github.com/microsoft/Microsoft-Rocketbox/blob/master/LICENSE.md) (2026-09-26): "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software."
- Live README (2026-09-26): "If you are using this library for research you should consider citing it." and "The library of avatars is now released under MIT License."

## Related

- [microsoft-movebox](../animation/microsoft-movebox.md) — Kinect→Rocketbox mocap tool
- [mixamo](../animation/mixamo.md) — retarget clips onto humanoids
- [quaternius-universal-animation-library](../animation/quaternius-universal-animation-library.md) — CC0 humanoid clips
- [blender-human-base-meshes](blender-human-base-meshes.md) — topology-focused bases

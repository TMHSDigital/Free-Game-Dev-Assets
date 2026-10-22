---
id: gas-documentation
name: GASDocumentation
url: https://github.com/tranek/GASDocumentation
category: tools
subcategories: [unreal, learning]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [Unreal]
tags: [unreal-engine, gameplay-ability-system, multiplayer, replication, tutorial, sample-project]
ue_versions: "5.3"
added: 2026-10-13
verified: 2026-10-13
status: active
---

# GASDocumentation

Community guide to Unreal Engine's Gameplay Ability System plugin, with a small multiplayer sample project that implements the concepts it describes. The README covers the Ability System Component, attributes, gameplay effects, abilities, tags, cues, prediction and many worked examples such as stuns, sprinting and critical hits. The text and sample code are MIT licensed. The author states it is unofficial and not affiliated with Epic Games.

## Notes

- The documentation is the repository README itself; the sample project in the same repository is a C++ and Blueprint Unreal project
- Version recorded from the README: "The Sample Project and documentation are current with **Unreal Engine 5.3**"; the `.uproject` declares `"EngineAssociation": "5.3"`; branches for older engine versions exist but the README says they "are no longer supported"
- GAS changes between engine releases, so check the engine source for anything newer than 5.3; the README itself says "The best documentation will always be the plugin source code"
- The author also maintains GASShooter, a sister sample linked from the README for more advanced multiplayer shooter techniques
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL and LGPL; keep the copyright notice if you reuse the sample code
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2024-04-06

## Evidence

- `LICENSE` in the repository, `master` branch (2026-10-13): "MIT License Copyright (c) 2020 Dan Kestranek"
- Same file (2026-10-13): "to deal in the Software without restriction"
- `README.md`, `master` branch (2026-10-13): "The Sample Project and documentation are current with **Unreal Engine 5.3** (UE5)."

## Related

- [ue5coro](ue5coro.md)
- [als-community](als-community.md)
- [pb-character-movement](pb-character-movement.md)
- [unreal-imgui](unreal-imgui.md)

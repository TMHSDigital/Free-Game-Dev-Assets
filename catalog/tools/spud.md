---
id: spud
name: SPUD (Steve's Persistent Unreal Data)
url: https://github.com/sinbad/SPUD
category: tools
subcategories: [unreal, save-system]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, save-game, persistence, level-streaming, blueprint]
added: 2026-10-13
verified: 2026-10-13
status: active
publisher: Steve Streeting
---

# SPUD (Steve's Persistent Unreal Data)

Save game and level persistence plugin for Unreal Engine 5. Actors opt in through a marker interface and properties through the engine's existing SaveGame flag, and SPUD then saves and restores them, including references between objects, spawned actors and destroyed level actors. Streamed levels keep their state as they unload and reload, without an explicit save. MIT licensed, so it can ship inside a closed commercial game.

## Notes

- Two jobs in one: whole-game save/load, and per-level state retention across level streaming, which is the part that is tedious to write by hand
- Usable from C++ or Blueprints, per the README; transform, controller rotation and physics state are saved automatically
- Install by cloning the repository (git submodule) or unzipping it into `YourProject/Plugins/SPUD`; it builds from source, so the project needs C++ enabled
- A separate SPUD Examples repository shows usage; the main repository carries the documentation
- Engine support: the README says "Unreal Engine 5" without naming minor versions, and the `.uplugin` has no `EngineVersion` key, so no `ue_versions` is recorded
- Companion to SUDS and SUQS by the same author, both of which can store their state through SPUD
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL, LGPL and CC-BY-SA; keep the copyright notice in your third-party credits
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2026-08-24

## Evidence

- `License.txt` in the repository, `master` branch (2026-10-13): "The MIT License (MIT) Copyright © 2021 Steve Streeting"
- Same file (2026-10-13): "to deal in the Software without restriction"

## Related

- [suds](suds.md)
- [suqs](suqs.md)
- [flowgraph](flowgraph.md)

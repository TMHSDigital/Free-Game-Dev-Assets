---
id: suqs
name: SUQS (Steve's Unreal Quest System)
url: https://github.com/sinbad/SUQS
category: tools
subcategories: [unreal, quests]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, quest, data-driven, json, blueprint]
added: 2026-10-13
verified: 2026-10-13
status: active
publisher: Steve Streeting
---

# SUQS (Steve's Unreal Quest System)

Data-driven quest system for Unreal Engine. Quest structures, objectives and tasks are defined in data tables, edited in the editor or written as JSON with a provided schema for autocomplete and validation, and a small runtime API records progress: accept quests, complete tasks, increment counters. Callbacks and a query API let the world react as tasks complete. MIT licensed, so it can ship inside a closed commercial game.

## Notes

- Quest data lives in static data tables, so quests are content rather than code; the JSON route suits version control and bulk editing
- Progression rules are deliberately simple; branching narrative logic belongs in your own code, or in a flow tool such as FlowGraph
- Install by cloning the repository (git submodule) or unzipping it into `YourProject/Plugins/SUQS`; it builds from source, so the project needs C++ enabled
- Engine support: the README refers to the UE5 editor but names no minor versions, and the `.uplugin` has no `EngineVersion` key, so no `ue_versions` is recorded
- Companion to SUDS (dialogue) and SPUD (saving) by the same author; quest progress can be persisted through SPUD
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL, LGPL and CC-BY-SA; keep the copyright notice in your third-party credits
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2026-10-13

## Evidence

- `License.txt` in the repository, `master` branch (2026-10-13): "The MIT License (MIT) Copyright © 2021 Steve Streeting"
- Same file (2026-10-13): "to deal in the Software without restriction"

## Related

- [suds](suds.md)
- [spud](spud.md)
- [flowgraph](flowgraph.md)

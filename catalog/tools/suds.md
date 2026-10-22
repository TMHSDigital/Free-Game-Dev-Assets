---
id: suds
name: SUDS (Steve's Unreal Dialogue System)
url: https://github.com/sinbad/SUDS
category: tools
subcategories: [unreal, dialogue]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, dialogue, branching-dialogue, scripting, localization, blueprint]
added: 2026-10-13
verified: 2026-10-13
status: active
publisher: Steve Streeting
---

# SUDS (Steve's Unreal Dialogue System)

Dialogue plugin for Unreal Engine 5 where conversations are written as plain-text scripts rather than drawn as graphs. Scripts cover speaker lines, player choices, goto and gosub, conditional branches, random lines, persistent variables and events sent back to C++ or Blueprints, and import as assets with localisation support. MIT licensed, so it can ship inside a closed commercial game.

## Notes

- Text-script workflow inspired by Ink and Yarn Spinner, per the README; suits writers who prefer a text editor to a node graph, and a VSCode extension provides syntax highlighting
- Includes an in-editor testing tool for running a script without playing the game
- Install by cloning the repository (git submodule) or unzipping it into `YourProject/Plugins/SUDS`; it builds from source, so the project needs C++ enabled
- SUDS Pro on Fab is a separate paid add-on with prebuilt binaries and camera, cutscene and animation integration; the README says core SUDS is "a perfectly capable dialogue engine on its own", and this entry covers only the free MIT repository
- Engine support: the README says "Unreal Engine 5" without naming minor versions, and the `.uplugin` has no `EngineVersion` key, so no `ue_versions` is recorded
- Compared with DlgSystem and Mountea Dialogue System, which are graph editors, SUDS is the text-first option; it integrates with SPUD for saving dialogue variable state
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL, LGPL and CC-BY-SA; keep the copyright notice in your third-party credits
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2026-06-19

## Evidence

- `License.txt` in the repository, `master` branch (2026-10-13): "The MIT License (MIT) Copyright © 2022 Steve Streeting"
- Same file (2026-10-13): "to deal in the Software without restriction"

## Related

- [spud](spud.md)
- [suqs](suqs.md)
- [dlgsystem](dlgsystem.md)
- [mountea-dialogue-system](mountea-dialogue-system.md)
- [dialogic](dialogic.md)

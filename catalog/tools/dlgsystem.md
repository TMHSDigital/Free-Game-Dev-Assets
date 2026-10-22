---
id: dlgsystem
name: DlgSystem
url: https://github.com/NotYetGames/DlgSystem
category: tools
subcategories: [unreal, dialogue]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, dialogue, dialogue-graph, branching-dialogue, blueprint, narrative]
ue_versions: "5.6-5.8"
added: 2026-10-13
verified: 2026-10-13
status: active
publisher: Not Yet
---

# DlgSystem

Dialogue plugin for Unreal Engine with its own graph editor: each dialogue is an asset of linked speech and choice nodes, with conditions, events and per-participant variables wired in the graph. Full Blueprint and C++ access, so writers can work in the editor while programmers hook conditions and events into game code. The source on GitHub is MIT licensed and can ship inside a closed commercial game.

## Notes

- Supported versions come from the README, which states "Supported Unreal versions: `5.6`, `5.7`, `5.8`"; the `.uplugin` itself declares `"EngineVersion" : "ANY_VERSION"`, so the README is the version claim to trust
- Older engine versions live on their own branches, which the README says "are kept but not updated anymore"
- Free install is a git clone (or ZIP) of the repository into `YourProject/Plugins/DlgSystem`, which needs a C++ project to compile the plugin; the Marketplace/Fab listing is paid and exists to supply prebuilt binaries, and the README says it moved from free to "a small fee" because of the cost of maintaining binaries per engine target
- Graph-based, unlike SUDS which is script-based; closer in shape to Mountea Dialogue System, but MIT rather than MPL-2.0
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL, LGPL and CC-BY-SA; keep the copyright notice in your third-party credits
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2026-06-22

## Evidence

- `LICENSE.txt` in the repository, `master` branch (2026-10-13): "MIT License Copyright (c) Csaba Molnar & Daniel Butum. All Rights Reserved."
- Same file (2026-10-13): "to deal in the Software without restriction"
- `README.md`, `master` branch (2026-10-13): "Supported Unreal versions: `5.6`, `5.7`, `5.8`"

## Related

- [suds](suds.md)
- [mountea-dialogue-system](mountea-dialogue-system.md)
- [flowgraph](flowgraph.md)
- [dialogic](dialogic.md)

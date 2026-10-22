---
id: flowgraph
name: Flow Graph
url: https://github.com/MothCocoon/FlowGraph
category: tools
subcategories: [unreal, scripting]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, node-graph, event-scripting, narrative, quest, blueprint]
ue_versions: "5.6-5.8"
added: 2026-10-13
verified: 2026-10-13
status: active
---

# Flow Graph

Design-agnostic node editor for scripting the flow of events in Unreal Engine: quests, story beats, level events and anything else that is a sequence of things waiting on other things. Each node is a UObject that bundles logic and data and is asynchronous by design, so a node can wait on a delegate and fire output pins later, which a Blueprint function cannot. MIT licensed, so it can ship inside a closed commercial game.

## Notes

- A framework rather than a finished system: the README says it is "a convenient base for building systems tailored to fit your needs", so expect to write game-specific nodes in C++ or Blueprints
- Runtime debugging draws messages over active nodes and wires while the game plays
- Engine support comes from the release list: v2.3 shipped as separate releases for UE 5.6, 5.7 and 5.8 (2026-07-11); the README and `Flow.uplugin` name no engine version, and the default branch is `5.x`
- Install by cloning the repository or downloading a release into `YourProject/Plugins`; documentation is on the project's GitHub Pages site
- Pairs with the dialogue plugins in this catalog rather than replacing them: Flow Graph sequences events, while DlgSystem, SUDS or Mountea handle the conversation itself; SUQS covers quest state in data tables if a graph is more than you need
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL, LGPL and CC-BY-SA; keep the copyright notice in your third-party credits
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2026-10-13

## Evidence

- `LICENSE` in the repository, `5.x` branch (2026-10-13): "MIT License Copyright (c) https://github.com/MothCocoon/FlowGraph/graphs/contributors"
- Same file (2026-10-13): "to deal in the Software without restriction"
- GitHub releases (2026-10-13): "Flow v2.3 - UE 5.6", "Flow v2.3 - UE 5.7", "Flow v2.3 - UE 5.8"

## Related

- [suqs](suqs.md)
- [dlgsystem](dlgsystem.md)
- [suds](suds.md)
- [mountea-dialogue-system](mountea-dialogue-system.md)

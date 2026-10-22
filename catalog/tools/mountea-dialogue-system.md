---
id: mountea-dialogue-system
name: Mountea Dialogue System
url: https://github.com/Mountea-Framework/MounteaDialogueSystem
category: tools
subcategories: [unreal, dialogue]
license: MPL-2.0
license_spdx: MPL-2.0
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, dialogue, dialogue-graph, branching-dialogue, blueprint, narrative]
ue_versions: "5.2-5.8"
added: 2026-10-13
verified: 2026-10-13
status: active
publisher: Mountea Framework
---

# Mountea Dialogue System

Dialogue plugin for Unreal Engine with its own dialogue tree graph editor and a validation system that flags broken graphs before runtime. Per-node Decorators, written in Blueprint, trigger side effects such as cutscenes or camera switches from within a conversation. Licensed MPL-2.0, a file-level copyleft: commercial use is allowed, but changes to the plugin's own files must stay available as source.

## Notes

- MPL-2.0 is not GPL or LGPL, but it is copyleft at the file level: if you modify Mountea's source files and distribute the game, those modified files must be made available under MPL-2.0; your own game code that merely uses the plugin is not affected
- The Unreal Engine EULA forbids combining engine code with licences that require source disclosure, naming GPL, LGPL and CC-BY-SA as examples; MPL-2.0 is not named, and an unmodified plugin raises no disclosure question, but a team that plans to patch the plugin should check this with counsel before shipping
- Engine support: the README support table lists UE 5.2 to 5.5 as supported (5.1 partial, 4.26 to 5.0 deprecated), and the GitHub releases add builds tagged 3.0.5.56, 3.0.5.57 and 3.0.5.58 for 5.6 to 5.8 (the last published 2026-06-27); the `.uplugin` on `master` declares `"EngineVersion": "5.7.0"`
- Install from a GitHub release zip into `YourProject/Plugins`, or from the Marketplace/Fab listing linked in the README; the README points to a wiki Getting Started guide and a tutorial video playlist
- Graph-based like DlgSystem, with a stronger editor-side validation story; SUDS is the text-script alternative
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2026-10-05

## Evidence

- `LICENSE` in the repository, `master` branch (2026-10-13): "Mozilla Public License Version 2.0"
- GitHub API repository metadata (2026-10-13): licence detected as `MPL-2.0`
- `README.md`, `master` branch (2026-10-13): support table rows "UE 5.2" to "UE 5.5" marked supported

## Related

- [dlgsystem](dlgsystem.md)
- [suds](suds.md)
- [flowgraph](flowgraph.md)
- [dialogic](dialogic.md)

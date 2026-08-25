---
id: beehave
name: Beehave
url: https://github.com/bitbrain/beehave
category: tools
subcategories: [godot, ai]
license: MIT
commercial: true
attribution_required: false
formats: [godot-addon]
tags: [godot-4, behavior-tree, ai, enemy-logic]
verified: 2026-08-24
status: active
---

# Beehave

Behavior tree addon for Godot 4 that gives enemy and NPC logic a visible structure instead of a growing pile of state booleans. Trees are built as node hierarchies in the scene tree, so composites, decorators, and leaf actions are editable and inspectable with the normal editor tooling. MIT licensed, which means it can ship inside a closed commercial build with no source obligation.

## Notes

- Trees live in the scene tree as real nodes, so the editor debugger shows which branch is ticking, which is the main practical advantage over a hand-rolled state machine
- Ticks are driven by a BeehaveTree node; throttle it on a timer rather than every frame for crowds
- Leaf actions are GDScript classes you write, so the addon is structure, not behavior; budget time for the actions themselves
- MIT requires the copyright notice be included somewhere in your distribution, commonly a third-party credits screen; this is not user-facing attribution in the CC-BY sense
- Overlaps with LimboAI in purpose; Beehave is pure GDScript and installs by copying a folder, LimboAI ships as a compiled extension

## Evidence

- `LICENSE` in the repository, `godot-4.x` branch (2026-08-24): "MIT License Copyright (c) 2023 bitbrain"
- Same file (2026-08-24): "to deal in the Software without restriction"

## Related

- [limboai](limboai.md)
- [phantom-camera](phantom-camera.md)
- [dialogic](dialogic.md)
- [godot-input-helper](godot-input-helper.md)

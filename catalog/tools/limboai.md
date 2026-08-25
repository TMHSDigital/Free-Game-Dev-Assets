---
id: limboai
name: LimboAI
url: https://github.com/limbonaut/limboai
category: tools
subcategories: [godot, ai]
license: MIT
commercial: true
attribution_required: false
formats: [godot-addon, gdextension]
tags: [godot-4, behavior-tree, state-machine, ai, gdextension]
verified: 2026-08-24
status: active
---

# LimboAI

Behavior trees plus hierarchical state machines for Godot 4, shipped as a GDExtension with a dedicated editor panel and its own debugger. The combination is the point: a state machine handles coarse modes such as patrol, combat, and flee, while a behavior tree handles the decision detail inside each mode. Heavier to install than a pure GDScript addon, and faster at runtime because the core is compiled.

## Notes

- Distributed as a GDExtension binary per platform, or as a custom Godot build; the binary set must cover every export target you ship, including web if you need it
- Blackboard variables are typed and scoped per tree, which avoids the shared-global-dictionary pattern that makes hand-rolled trees fragile
- Tasks can be written in GDScript or C++; GDScript tasks are the normal path and hot-reload during play
- Ships a behavior tree debugger panel that shows live task status, worth the install cost on its own for a project with many enemy types
- The `LICENSE.md` file carries verbatim MIT terms without an "MIT License" title line; the terms themselves are unambiguous

## Evidence

- `LICENSE.md` in the repository, `master` branch (2026-08-24): "Copyright (c) 2023-2025 Serhii Snitsaruk and the LimboAI contributors."
- Same file (2026-08-24): "to deal in the Software without restriction"

## Related

- [beehave](beehave.md)
- [terrain3d](terrain3d.md)
- [phantom-camera](phantom-camera.md)
- [godot-guide](godot-guide.md)

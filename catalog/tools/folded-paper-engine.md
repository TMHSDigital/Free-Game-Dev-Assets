---
id: folded-paper-engine
name: Folded Paper Engine
url: https://github.com/papercraftgames/folded-paper-engine
category: tools
subcategories: [godot, level-editor]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [godot-addon, blender-extension]
tags: [godot, godot-4, blender, gameplay, levels, third-person]
verified: 2026-09-30
status: active
---

# Folded Paper Engine

Blender-to-Godot pipeline from Papercraft Games. You tag objects in a Blender side panel as characters, players, triggers, speakers, physics bodies or holdable items, and set scene metadata. Then you add one `FoldedPaperEngine` node in Godot, and the imported scene runs as playable gameplay. Each release ships a Godot add-on zip and a Blender add-on or extension zip.

## Notes

- Section: this is a Godot 4 add-on. The README states "Engine: Godot 4.4+" and "Pipeline: Blender 4.4+", and the Godot side lives in `src/Game/addons/folded_paper_engine`. The Blender half is the authoring tool
- MIT covers both halves. Levels and art you build are your own
- It is opinionated: it drives 2.5D, first-person and third-person controls, triggers and inventory through its own node, which suits small projects. Check that its model fits before building a large game on it
- Active: v1.0.11 released 2026-06-02, last push 2026-07-20 (read 2026-09-30). The README calls it "MVP Released", so expect changes

## Evidence

- Live GitHub `LICENSE.txt` (2026-09-30): "MIT License", "Copyright (c) 2025 Papercraft Games"
- Live foldedpaperengine.com (2026-09-30): "Folded Paper Engine stays free, open-source, and MIT licensed"
- Live GitHub README (2026-09-30): "Engine: Godot 4.4+"

## Related

- [godot-engine](godot-engine.md)
- [blender](blender.md)
- [phantom-camera](phantom-camera.md)
- [trenchbroom](trenchbroom.md)

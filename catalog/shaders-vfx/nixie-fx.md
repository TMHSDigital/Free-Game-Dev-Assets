---
id: nixie-fx
name: NixieFX
url: https://github.com/azakhary/nixie-fx
category: shaders-vfx
subcategories: [particles, vfx]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [npm, JavaScript, JSON]
tags: [particles, web, threejs, pixijs]
verified: 2026-09-30
status: active
---

# NixieFX

Browser particle and VFX editor for HTML5 games, with an MIT runtime on npm (`nixie-fx`) that plays exported effects through PixiJS or Three.js adapters. You author in the hosted editor at nixiefx.com, export a JSON bundle into your project folder, and load it with the runtime. It sits in shaders-vfx beside the other particle entries because the runtime ships in your game, the way [sky3d](sky3d.md) does.

## Notes

- The MIT grant is the GitHub repository's, and covers the runtime you ship. The hosted editor is described as "Free · no install" and showed no separate terms on 2026-09-30; the effects you author are your own files
- PixiJS and Three.js are optional peer dependencies; the core and export APIs load neither
- The CLI can create effects, export the bundle and report stale or unexported effects (`npx nixie-fx export-status`)
- Young project: LICENSE copyright is 2026 and the repository was pushed 2026-09-29. Expect API churn
- Web-only. For Godot, Unity or Unreal particles use [effekseer-samples](effekseer-samples.md) or engine-native systems

## Evidence

- Live GitHub `azakhary/nixie-fx` LICENSE (2026-09-30): "MIT License", "Copyright (c) 2026 Avetis Zakharyan"
- Live [nixiefx.com](https://nixiefx.com) (2026-09-30): "Free · no install · your effects stay in your own project folder"
- Live GitHub README (2026-09-30): "renderer adapters for PixiJS and Three.js"

## Related

- [effekseer-samples](effekseer-samples.md)
- [kenney-particle-pack](kenney-particle-pack.md)
- [unity-labs-vfx-flipbooks](unity-labs-vfx-flipbooks.md)
- [pixel-composer](../tools/pixel-composer.md)

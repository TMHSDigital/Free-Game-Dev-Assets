---
id: ezspritesheet
name: EzSpriteSheet
url: https://github.com/z64me/EzSpriteSheet
category: tools
subcategories: [atlas, pipeline]
license: GPL-3.0
commercial: true
attribution_required: true
attribution_string: "EzSpriteSheet <z64.me>"
formats: [desktop-app, PNG]
tags: [spritesheet, atlas, animated-gif, webp, windows]
verified: 2026-09-30
status: needs-review
---

# EzSpriteSheet

Sprite sheet packer by z64me. Point it at a folder and it packs, trims, rotates, pads and de-duplicates sprites, reads animated GIF and WebP, detects pivot points, and lets you write your own export modules. The v1.0.0 release (2022-01-23) ships a Windows build. C/SDL2 and JavaScript canvas loaders are in the repo.

## Notes

- Ambiguity 1, a credit on your product: the same `LICENSE.md` that names the GPL adds an "EULA" saying that if you use EzSpriteSheet to build something, "you agree" to credit `EzSpriteSheet <z64.me>` visibly in your product's credits. That is a condition on your game, not on the tool's code, and it sits oddly next to the GPL, which does not reach your packed sheets. Until the author clarifies, treat the credit as required. `attribution_required: true` reflects that clause, not the GPL
- Ambiguity 2, the GPL version: the text says "GNU GPL3" without "only" or "or later", so no SPDX id is recorded
- The GPL covers the program. Sheets and metadata you export from your own art are your output. Redistributing a modified EzSpriteSheet is the GPL event. The paid "commercial license" is for reusing or rebranding its code, not for shipping games made with its output
- The repository was last pushed on 2026-06-11, so it is not inactive

## Evidence

- Live GitHub `LICENSE.md` (2026-09-30): "EzSpriteSheet is released under the GNU GPL3 license."
- Same file (2026-09-30): "Visibly attribute `EzSpriteSheet <z64.me>` in your product's credits."
- Same file (2026-09-30): "A commercial license is available for those wishing to reuse or rebrand its code"

## Related

- [free-tex-packer](free-tex-packer.md)
- [gdx-texture-packer-gui](gdx-texture-packer-gui.md)
- [cheetah-texture-packer](cheetah-texture-packer.md)

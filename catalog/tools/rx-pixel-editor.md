---
id: rx-pixel-editor
name: rx
url: https://rx.cloudhead.io/
category: tools
subcategories: [pixel]
license: GPL-3.0-only
license_spdx: GPL-3.0-only
commercial: true
attribution_required: false
formats: [PNG, desktop-app]
tags: [pixel-art, editor, keyboard-driven, vi-like]
verified: 2026-09-30
status: active
---

# rx

A minimalist, keyboard-driven pixel art editor written in Rust by Alexis Sellier (cloudhead), with vi-style commands, a command line and multi-frame sprite views. It suits artists who prefer typing commands to clicking through panels; for a conventional layered editor use [libresprite](libresprite.md) or [pixelorama](pixelorama.md). The program is GPLv3. Development has slowed: the last tagged release is v0.5.2 from August 2021, though the repository was still receiving pushes in early 2024.

## Notes

- Licence of the tool: GPLv3. The repository's `Cargo.toml` declares `GPL-3.0-only`, which is the value recorded here.
- Your output: the GPL covers the editor's source code, not the images you draw with it. Sprites you create are yours to license as you choose.
- Install: build with Cargo (`cargo install` from the v0.5.2 tag, needs CMake) or use the pre-built binaries linked from the guide's binary releases section.
- Maintenance: last push to cloudhead/rx on 2024-01-31 and latest release v0.5.2 published 2021-08-15, per the GitHub API on 2026-09-30. Under three years since the last push, so no maintenance flag, but expect few updates.

## Evidence

- Live site (2026-09-30): "rx is free software, licensed under the GPL."
- Live `Cargo.toml` in cloudhead/rx (2026-09-30): `license = "GPL-3.0-only"`
- Live `LICENSE` (2026-09-30): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"

## Related

- [libresprite](libresprite.md)
- [pixelorama](pixelorama.md)
- [spritemate](spritemate.md)

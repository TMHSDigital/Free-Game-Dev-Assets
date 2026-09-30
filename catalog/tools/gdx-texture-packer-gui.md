---
id: gdx-texture-packer-gui
name: GDX Texture Packer GUI
url: https://github.com/crashinvaders/gdx-texture-packer-gui
category: tools
subcategories: [atlas, pipeline]
license: Apache-2.0
license_spdx: Apache-2.0
commercial: true
attribution_required: false
formats: [desktop-app, cli, PNG, ktx2]
tags: [spritesheet, atlas, libgdx, java]
verified: 2026-09-30
status: active
---

# GDX Texture Packer GUI

Desktop front end for the libGDX TexturePacker by Crashinvaders. It manages several atlases in one project file, exposes the packer settings visually, and has a headless batch mode for CI. It can also compress PNG/JPEG to KTX2/Basis. It needs a Java runtime (JRE 8 or newer) and OpenGL 2.0, and runs on Windows, macOS and Linux. Output is the libGDX `.atlas` text file plus PNG pages, which other runtimes can parse too.

## Notes

- Apache-2.0 covers the application. Atlases you pack from your own sprites are your output, and nothing in the licence reaches them
- If you only need the packer inside a Gradle build, the underlying libGDX TexturePacker lives in the libGDX repository (also Apache-2.0). This entry is the GUI
- Last commit to master 2024-07-14 and last release 4.13.0 on 2023-11-02, so not yet inactive
- Checklist: Apache text visible, commercial use of the software permitted, no NC/ND, tool vs atlas contents distinguished

## Evidence

- Live GitHub `LICENSE` (2026-09-30): "Apache License Version 2.0, January 2004"
- Live GitHub README (2026-09-30): "mostly just a visual wrapper over libGDX TexturePacker"
- GitHub API (2026-09-30): `license.spdx_id` "Apache-2.0", `pushed_at` 2024-08-09, not archived

## Related

- [free-tex-packer](free-tex-packer.md)
- [ezspritesheet](ezspritesheet.md)
- [basis-universal](basis-universal.md)

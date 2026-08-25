---
id: fontsource
name: Fontsource
url: https://fontsource.org
category: fonts
subcategories: [aggregator, sans, npm]
license: varies
commercial: true
attribution_required: true
formats: [TTF, WOFF, WOFF2, npm]
tags: [ofl, npm, self-host, aggregator]
attribution_string: "See the OFL.txt / LICENSE in the @fontsource/<family> package you installed"
verified: 2026-08-24
status: active
---

# Fontsource

NPM packaging of self-hostable open-source fonts (2000+ families). Closes the "Google Fonts CSS API in a shipped game / offline build" problem: version-locked files, no runtime Google request. The **bundler** is MIT. The **faces** are not. GitHub README: most use SIL OFL 1.1, some Apache 2, Ubuntu faces use the Ubuntu Font License. Read the package README. The fonts.google.com/icons-style JS directory does not replace that file.

## Notes

- Install `@fontsource/<id>` or `@fontsource-variable/<id>`. Godot/Unity still want the TTF/WOFF from `files/` inside the package, not the CSS helper
- MIT on [fontsource/fontsource `LICENSE`](https://github.com/fontsource/fontsource/blob/main/LICENSE) is Ayuhito's packaging code. Embedding Inter is still Inter's OFL
- Live API example this session: `api.fontsource.org/v1/fonts/inter` reports `license: OFL-1.1`
- Ubuntu Font License is not OFL. Do not assume every package is OFL
- Checklist: license text in README + per-package files, commercial OK for OFL/Apache majority, attribution per OFL, not a marketplace, named org, not blocklisted, software vs font licenses split

## Evidence

- Live GitHub README, Licensing (2026-08-24): "Most of the fonts in the collection use the SIL Open Font License, v1.1"
- Same section (2026-08-24): "Some fonts use the Apache 2 license. The Ubuntu fonts use the Ubuntu Font License v1.0"
- Live GitHub `LICENSE` (2026-08-24): "MIT License Copyright (c) 2024 Ayuhito"

## Related

- [inter](inter.md)
- [noto-sans](noto-sans.md)
- [fontshare](fontshare.md)
- [velvetyne](velvetyne.md)
- [open-foundry](open-foundry.md)

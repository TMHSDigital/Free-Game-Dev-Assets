---
id: sprite-fusion-pixel-snapper
name: Sprite Fusion Pixel Snapper
url: https://github.com/Hugo-Dz/spritefusion-pixel-snapper
category: tools
subcategories: [pixel]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [cli, PNG]
tags: [pixel-art, cleanup, quantization, batch, rust]
verified: 2026-09-30
status: active
publisher: Sprite Fusion
---

# Sprite Fusion Pixel Snapper

Fixes pixel art that is not on a grid. It detects the pixel size, snaps every pixel to a consistent grid and quantises colours to a fixed or supplied palette, keeping details such as dithering. It is built for AI-generated "pixel art", but it works on any upscaled or resampled sprite. Rust source and a CLI are on GitHub, and there is a free web version on spritefusion.com.

## Notes

- MIT covers the code, the CLI and the web version's engine. The PNGs it writes are derived from your input, so they carry whatever rights your input had. Cleaning an image does not clear its licence
- CLI: install with `cargo install spritefusion-pixel-snapper` or Homebrew. It takes a PNG or JPEG, or a directory for batch runs
- A paid "Desktop Edition" with batch processing is sold on the site. The free CLI already does batch processing from the command line
- Last push to the repository was 2026-07-16 (read 2026-09-30)

## Evidence

- Live GitHub `LICENSE` (2026-09-30): "MIT License", "Copyright (c) 2025 Hugo Duprez"
- Live product page (2026-09-30): "Pixel Snapper is free and open source"
- Live product page (2026-09-30): "Web Edition FREE", "Commercial projects", "No account required"

## Related

- [sprite-fusion](sprite-fusion.md)
- [palette-extractor](palette-extractor.md)
- [pixelorama](pixelorama.md)

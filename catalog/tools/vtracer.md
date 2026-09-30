---
id: vtracer
name: VTracer
url: https://github.com/visioncortex/vtracer
category: tools
subcategories: [vectors, conversion]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [SVG, desktop-app, cli, library]
tags: [vectorize, tracing, rust, python]
verified: 2026-09-30
status: active
---

# VTracer

Raster-to-vector converter from visioncortex, written in Rust. Unlike Potrace it handles full-colour images, and it stacks shapes instead of cutting holes, so the SVG output is compact. It ships as desktop apps for Windows, macOS and Linux, a CLI, a Rust crate, a Python package and an npm WebAssembly build, and there is a web demo on visioncortex.org. Good for vectorising pixel art and scanned sketches for scalable UI.

## Notes

- MIT covers the software. SVGs you convert from your own images are your output
- Current release is 1.0.0-alpha.4 (2026-08-29). The API may still change before 1.0
- Tracing does not change who owns the input image

## Evidence

- Live GitHub `LICENSE` (2026-09-30): "Permission is hereby granted, free of charge, to any person obtaining a copy"
- GitHub API (2026-09-30): `license.spdx_id` "MIT", `pushed_at` 2026-09-29, not archived
- Live GitHub README (2026-09-30): "open source software to convert raster images (like jpg & png) into vector graphics"

## Related

- [svgcode](svgcode.md)
- [inkscape](inkscape.md)

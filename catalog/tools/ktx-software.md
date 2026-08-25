---
id: ktx-software
name: KTX-Software
url: https://github.com/KhronosGroup/KTX-Software
category: tools
subcategories: [compression, textures]
license: Apache-2.0
commercial: true
attribution_required: false
formats: [ktx, ktx2]
tags: [khronos, pipeline, r04]
verified: 2026-08-25
status: active
---

# KTX-Software

Khronos tools/SDK for KTX/KTX2 containers. Works with Basis Universal supercompression. Project SPDX is Apache-2.0, but the tree is mixed. `lib/etcdec.cxx` is not open source (Ericsson terms in that file).

## Notes

- LICENSE.md: unique files generally Apache-2.0; other projects keep their own licenses under `LICENSES/`
- Run `reuse spdx` upstream if you need a file-level bill of materials
- Do not treat etcdec as Apache when you redistribute the SDK sources

## Evidence

- Live GitHub `LICENSE.md` (2026-08-25): "Files unique to this repository generally fall under the Apache 2.0 license"
- Same file (2026-08-25): "The file lib/etcdec.cxx is not open source."

## Related

- [basis-universal](basis-universal.md)
- [gltf-transform](gltf-transform.md)

---
id: google-draco
name: Google Draco
url: https://github.com/google/draco
category: tools
subcategories: [pipeline, compression]
license: Apache-2.0
license_spdx: Apache-2.0
commercial: true
attribution_required: false
formats: [DRC, glTF]
tags: [mesh-compression, gltf]
added: 2026-07-19
verified: 2026-10-23
status: active
---

# Google Draco

Apache-2.0 mesh/point-cloud compression used widely with glTF `KHR_draco_mesh_compression`. Commercial OK; retain Apache notice.

## Notes

- Encode offline; decode in-engine or via glTF loaders
- Complements [ktx-software](ktx-software.md) / [basis-universal](basis-universal.md) for textures

## Evidence

- Live LICENSE (2026-07-19): **Apache License 2.0**
- Live [LICENSE](https://github.com/google/draco/blob/main/LICENSE) on main (2026-10-23): "Apache License, Version 2.0" with the standard grant text
- Live [README](https://github.com/google/draco/blob/main/README.md) License section (2026-10-23): "Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License."

## Related

- [meshoptimizer](meshoptimizer.md)
- [gltf-transform](gltf-transform.md)
- [assimp](assimp.md)

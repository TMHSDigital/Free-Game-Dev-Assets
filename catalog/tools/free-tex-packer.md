---
id: free-tex-packer
name: Free Tex Packer
url: https://free-tex-packer.com/
category: tools
subcategories: [atlas, pipeline]
license: MIT
commercial: unknown
attribution_required: false
formats: [PNG, JSON]
tags: [spritesheet, atlas]
verified: 2026-08-24
status: needs-review
---

# Free Tex Packer

Was a web/desktop sprite atlas packer with engine metadata exports. This session the apex URL returned a 481-byte "Loading..." shell with no license text. A follow-redirect landed on `ww1.free-tex-packer.com` (privacy-policy copy, not the packer UI). GitHub [odrick/free-tex-packer](https://github.com/odrick/free-tex-packer) still exists; `LICENSE` / `LICENSE.md` at repo root 404. Do not treat MIT as re-verified. Stay `needs-review` until a license file or a working app page can be quoted.

## Notes

- Previous catalog pass marked this MIT. That grant was not re-read this session
- Do not ship a download from ww1.* hosts

## Evidence

- Live https://free-tex-packer.com/ (2026-08-24): body "Loading..." only. No MIT/license sentence
- Followed fetch (2026-08-24): `ww1.free-tex-packer.com` privacy-policy page, not the packer
- GitHub `LICENSE` (2026-08-24): HTTP 404

## Related

- [pixelorama](pixelorama.md)
- [ldtk](ldtk.md)
- [gltf-transform](gltf-transform.md)

---
id: opengameart
name: OpenGameArt
url: https://opengameart.org
category: 2d
subcategories: [sprites, tileset, aggregator]
license: varies
commercial: true
attribution_required: unknown
formats: [PNG, SVG, OGG]
tags: [community, pixel-art, aggregator]
verified: 2026-09-26
status: needs-review
---

# OpenGameArt

Community hub for game art under many licenses (CC0, CC-BY, CC-BY-SA, GPL, OGA-BY, etc.). Commercial use is **possible** when the upload’s license allows it — never assume from “free download.” Prefer catalogued primaries ([glitch-archive](glitch-archive.md), [lpc-revised-basics](lpc-revised-basics.md), [ox72-dungeon-tileset](ox72-dungeon-tileset.md)).

## Notes

- FAQ: closed-source commercial games OK **if** you follow each file’s license
- Multi-license uploads = pick one compatible set; SA/GPL packs need extra care (see [`docs/high-risk.md`](../../docs/high-risk.md))
- Filter CC0 / CC-BY before packaging
- `commercial: true` follows the FAQ's plain site-wide statement (re-read 2026-09-26). Still open: credit is per upload (CC0 none; CC-BY needs it; the FAQ says to assume GPL uploads need it), and the schema has no per-file value for `attribution_required`, so the entry stays `needs-review`
- Apple App Store: the FAQ says GPL, LGPL, CC-BY-SA and CC-BY terms conflict with Apple's, so ask the artist first

## Evidence

- Live [FAQ](https://opengameart.org/content/faq) (2026-07-20): “I'm a commercial (closed-source) game developer… **Yes, you can use this art. Even in commercial projects.** Be sure to follow the terms of the license…”
- Same FAQ: CC0 “commercial use is ok”; CC-BY needs credit; SA/GPL also hosted → keep catalog-level `needs-review` / `commercial: unknown`
- Live [FAQ](https://opengameart.org/content/faq) (2026-09-26): "Yes, you can use any of the art submitted to this site. Even in commercial projects. Just be sure to adhere to the license terms."
- Same FAQ (2026-09-26): CC0 works may be used "without asking, crediting or notifying the creating artist"; CC-BY: "You must state that you have used the work and credit the original artist"; GPL: "you should assume that all work contained on OpenGameArt requires it [attribution] unless otherwise specified"
- Same FAQ (2026-09-26), Apple App Store: "Not necessarily." Terms "conflict with the terms of the GNU GPL, the GNU LGPL, CC-BY-SA, and CC-BY"

## Related

- [lpc-revised-basics](lpc-revised-basics.md)
- [glitch-archive](glitch-archive.md)
- [ox72-dungeon-tileset](ox72-dungeon-tileset.md)
- [paleto-vol01](paleto-vol01.md)

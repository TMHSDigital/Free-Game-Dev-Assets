---
id: material-maker-gallery
name: Material Maker Community Gallery
url: https://www.materialmaker.org/materials
publisher: Material Maker
category: shaders-vfx
subcategories: [materials, procedural]
license: varies
commercial: unknown
attribution_required: unknown
formats: [mm, PNG]
tags: [procedural, pbr, per-item-license]
verified: 2026-10-04
status: needs-review
---

# Material Maker Community Gallery

Community procedural materials/nodes/brushes/environments with **per-item** licenses. Gallery filters: **CC-BY / CC0 / CC-BY-SA**. Useful discovery hub, not a single commercial grant. Prefer the **CC0** filter for zero-friction embeds.

## Notes

- CC-BY → credit author; CC-BY-SA → share-alike on asset derivatives (keep graphs/textures extractable)
- Site `/terms` is privacy/cookies, not an IP license for gallery items (re-read 2026-09-26: still a privacy policy, "effective as of 01/01/2021")
- Still open (2026-09-26): the site makes no commercial or credit statement of its own, and item pages are script-rendered, so a per-item licence could not be read in a plain fetch. All three filter licences are CC licences that allow commercial use, but the catalog records `commercial` only from a source statement, so it and `attribution_required` stay `unknown`
- Per-item licences are readable from the site's JSON endpoint `https://www.materialmaker.org/api/getMaterials` (checked 2026-10-04): 1826 items, 912 "CC-BY", 892 "CC0", 22 "CC-BY-SA", nothing else. Still open: the values carry no CC version and the site still makes no commercial or credit statement of its own, so `commercial` stays `unknown`; credit is per item (CC0 none, CC-BY and CC-BY-SA required), which the schema cannot express as one `attribution_required` value
- Bake/export for engines; keep license metadata if you redistribute `.mm`
- Pair with [material-maker](../tools/material-maker.md); for ready CC0 PBR prefer [ambientcg](../3d/ambientcg.md)

## Evidence

- Live gallery license filters (2026-07-19): links labeled **CC-BY**, **CC0**, **CC-BY-SA** (`license_mask` query params), which confirms per-item, not site-wide.
- Live [gallery](https://www.materialmaker.org/materials) (2026-09-26): License filter still lists only "CC-BY", "CC0", "CC-BY-SA"; types material, brush, node, environment
- Live [gallery](https://www.materialmaker.org/materials) (2026-10-04): License filter unchanged, "CC-BY", "CC0", "CC-BY-SA"; [/terms](https://www.materialmaker.org/terms) still a privacy policy, "This Privacy Policy is effective as of 01/01/2021"
- Live [api/getMaterials](https://www.materialmaker.org/api/getMaterials) (2026-10-04): every item has a `license` field, e.g. `{"id":1,"name":"Cookie",...,"author":"RodZilla","license":"CC-BY"}`; counts across 1826 items: CC-BY 912, CC0 892, CC-BY-SA 22

## Related

- [material-maker](../tools/material-maker.md)
- [ambientcg](../3d/ambientcg.md)

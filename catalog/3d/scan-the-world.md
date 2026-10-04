---
id: scan-the-world
name: Scan the World
url: https://www.myminifactory.com/scantheworld
category: 3d
subcategories: [scans, historical]
license: unknown
commercial: false
attribution_required: unknown
formats: [STL, OBJ]
tags: [photogrammetry, museum, print, aggregator]
verified: 2026-10-04
status: needs-review
---

# Scan the World

MyMiniFactory's collection of 3D-scanned cultural artefacts, made for **physical 3D printing**. "Freely share" on the landing page is not a game licence, and MyMiniFactory's own Terms of Use limit downloads to "your own non-commercial use" unless the design's owner has agreed otherwise. Treat it as **not usable in a commercial game** by default. For museum scans you can ship, use [smithsonian-open-access](smithsonian-open-access.md) (CC0, quoted).

## Notes

- **The platform terms are non-commercial.** MyMiniFactory's Terms of Use allow downloads "solely for your own non-commercial use", unless there is "a prior arrangement or agreement" with MyMiniFactory or the design's owner. A per-object licence could be such an agreement, but no per-object licence was read, so `license` stays `unknown`
- The Scan the World store lists 12,437 objects, split into free and **premium** (paid) objects. Free to download is not the same as free to use
- Per-object pages load only through the site's scripts and did not render object links on 2026-09-23, even in a browser
- Still open (2026-10-04): no per-object licence could be read; the Scan The World user page and a scoped search return no object links or licence fields in a plain fetch. The platform terms moved to `/pages/terms-and-conditions` (the old `/terms-and-conditions` URL 404s) with the non-commercial clause unchanged. A per-object licence from the scan's owner is what would settle `license`
- STL/OBJ from a print pipeline are rarely game-ready: wrong scale, solid meshes, no PBR materials
- No `attribution_string`: none could be quoted, and a guessed credit line would be a liability

## Evidence

- Live MyMiniFactory Terms & Conditions (2026-09-23): "You may print or download portions of the materials from various areas of this website (including through the use of our API) solely for your own non-commercial use - unless there is a prior arrangement or agreement with My Mini Factory Ltd or the owner of the design regarding the commercial use of said items"
- Live Scan the World landing (2026-09-23): "an ecosystem for everyone to freely share digital, 3D scanned cultural artefacts for physical 3D printing"
- Live [MyMiniFactory Terms & Conditions](https://www.myminifactory.com/pages/terms-and-conditions) (2026-10-04): unchanged, "solely for your own non-commercial use - unless there is a prior arrangement or agreement with My Mini Factory Ltd or the owner of the design regarding the commercial use of said items"; also "You may not access any content on the website (including, without limitation, 3D print files) for any other reason except your non-commercial, personal use solely as intended through the web interface."
- Live [Scan the World landing](https://www.myminifactory.com/scantheworld) (2026-10-04): unchanged, "an ecosystem for everyone to freely share digital, 3D scanned cultural artefacts for physical 3D printing"

## Related

- [smithsonian-open-access](smithsonian-open-access.md)
- [nasa-3d-resources](nasa-3d-resources.md)
- [poly-pizza](poly-pizza.md)

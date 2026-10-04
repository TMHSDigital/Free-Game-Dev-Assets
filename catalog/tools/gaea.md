---
id: gaea
name: Gaea (Community Edition)
url: https://quadspinner.com/download
category: tools
subcategories: [terrain]
license: custom
commercial: false
attribution_required: false
formats: [desktop-app]
tags: [terrain, freemium, eula-pdf, heightfield]
verified: 2026-10-04
status: active
---

# Gaea Community Edition

QuadSpinner terrain tool with a free download on the product site. The free Community Edition is **non-commercial only**. That covers the program and the terrain you export from it: the EULA bundled with the current release says you may use it "for non-commercial purposes, including but not limited to Assets", and "Assets" means everything Gaea produces. Commercial terrain needs a paid edition, which is out of scope here. For a free Godot heightmap path use [terrain3d](terrain3d.md).

## Notes

- Legal hub: [quadspinner.com/legal](https://quadspinner.com/legal). On 2026-10-04 every EULA PDF linked there returned HTTP 404, so the terms were read from `EULA.txt` inside the official `Gaea-2.3.1.0.7z` portable download (EULA "applies to all versions of the Software released on or after July 1, 2025")
- Commercial: `false`. Section 1.4.1 limits the Community Edition to non-commercial purposes, and the download page says the same
- Credit: `false` for what the Community Edition allows. The only credit clause (1.8.2, "Assets created with QuadSpinner Gaea.") applies to retail sales of terrain assets, which is commercial use the Community Edition does not permit anyway
- Other limits, for every edition: no interactive product whose main purpose is terrain generation (games where terrain generation is incidental are exempt), and no AI training on Gaea output without written consent
- Download page lists v2.3.1.0 (released 2026-09-24)

## Evidence

- Live legal page (2026-08-24): Gaea EULA "July 14, 2025 (Active)" as `/PDF/Gaea2-2025-07.pdf` (not fetched as text)
- Live legal page (2026-08-24): "Free versions of our products are available for evaluation prior to purchase"
- Prior `commercial: false` in this catalog was not re-established from a live quote on 2026-08-24
- Live [download page](https://quadspinner.com/download) (2026-10-04): "Community Edition The Community Edition of Gaea is available for free for evaluation and non-commercial use."
- Live legal page (2026-10-04): still links the EULA as "July 14, 2025 (Active)" at `/PDF/Gaea2-2025-07.pdf`; that URL and both previous-version PDFs returned HTTP 404
- `EULA.txt` in the official `https://get.gaea.app/Release/Gaea-2.3.1.0.7z`, extracted 2026-10-04: "1.4.1. Community Edition. You may use the Community Edition of Software without a license for non-commercial purposes, including but not limited to Assets."
- Same file (2026-10-04): "All content produced by the Software, including but not limited to visuals and exported files, shall be collectively referred to as “Assets.”"
- Same file (2026-10-04): "1.8.2. Attribution Requirement. Any public-facing product description for the Assets must include the text: “Assets created with QuadSpinner Gaea.”" (section 1.8 covers retail sales of Assets)
- Same file (2026-10-04): "Assets shall be the sole property of you, the user."

## Related

- [terrain3d](terrain3d.md)
- [../environment/opentopography](../environment/opentopography.md)
- [../environment/poly-haven](../environment/poly-haven.md)

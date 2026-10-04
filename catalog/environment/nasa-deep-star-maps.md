---
id: nasa-deep-star-maps
name: NASA Deep Star Maps 2020
url: https://svs.gsfc.nasa.gov/4851/
category: environment
subcategories: [hdri, skybox]
license: custom
commercial: unknown
attribution_required: true
attribution_string: "NASA/Goddard Space Flight Center Scientific Visualization Studio. Gaia DR2: ESA/Gaia/DPAC."
formats: [EXR, TIFF]
tags: [stars, space, milky-way, skybox]
publisher: NASA
verified: 2026-10-04
status: needs-review
---

# NASA Deep Star Maps 2020

Full-sky star map built from 1.7 billion stars (Hipparcos-2, Tycho-2, Gaia DR2), supplied as linear half-float OpenEXR in plate carree projection from 4k up to 64k wide. A strong source for a space skybox. Marked needs-review: the page states credits but no licence of its own, and the data blends NASA output with ESA Gaia data and Sky and Telescope constellation figures.

## Notes

- Celestial (ICRF/J2000 RA and Dec) and galactic mappings are both offered; celestial is better for 3D, per the page. Boundary, figure and grid overlays are grayscale TIFF.
- Equirectangular, so it maps straight onto a sphere or skybox cube in most engines. Distortion near the poles is a projection effect, not galaxies.
- The 64k EXR is 3.8 GB; the 4k is 34 MB. Convert to a compressed cubemap for shipping.
- The page's credit line asks for NASA/Goddard SVS and for Gaia DR2: ESA/Gaia/DPAC. Constellation figures are credited to IAU / Alan MacRobert of Sky and Telescope; omit those overlays if you cannot clear them.
- NASA's media guidelines say NASA should be acknowledged and that content must not imply endorsement. See also [nasa-3d-resources](../3d/nasa-3d-resources.md).

## Evidence

- SVS page (2026-10-04): "Please give credit for this item to: NASA/Goddard Space Flight Center Scientific Visualization Studio."
- Same page (2026-10-04): "Gaia DR2: ESA/Gaia/DPAC"
- NASA media guidelines (2026-10-04): "NASA should be acknowledged as the source of the material."
- Same guidelines: "may be used without needing explicit permission" when used factually without implying endorsement. The SVS page has no per-item licence statement, so commercial status is unconfirmed here.

## Related

- [nasa-3d-resources](../3d/nasa-3d-resources.md)
- [poly-haven](poly-haven.md)
- [open-hdri](open-hdri.md)

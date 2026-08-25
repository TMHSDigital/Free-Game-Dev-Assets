---
id: opentopography
name: OpenTopography
url: https://opentopography.org
category: environment
subcategories: [heightmaps, dem, lidar]
license: varies
commercial: varies
attribution_required: true
formats: [GeoTIFF, LAS, LAZ]
tags: [terrain, lidar, nsf, portal]
attribution_string: "Cite the dataset landing page plus OpenTopography (see opentopography.org/citations)"
verified: 2026-08-24
status: active
---

# OpenTopography

NSF-backed portal for lidar point clouds and DEMs (US, global SRTM-class, country-wide 1 m sets). This is the *access* layer, not one license. Citations page: hosted data are "free of all copyright restrictions" and available for commercial use, **and** some datasets carry a named open license such as CC BY 4.0. You must cite the dataset. Read the landing page for the tile you actually pull. Do not treat the portal sentence as CC0 for every job.

## Notes

- Policy: [opentopography.org/citations](https://www.opentopography.org/citations)
- Account/API keys are normal. Point Elevation API exists; still inherits the source DEM's terms
- Country-wide 1 m DEMs added in 2026 news are not automatically the same grant as USGS PD tiles. Open the dataset page
- GIS first: reproject, downsample, then heightmap. Raw LAS is not a Godot terrain
- Checklist: license policy in HTML, commercial allowed at portal level, citation required, not a marketplace, NSF/university, not blocklisted, no rights claimed, per-dataset licenses called out

## Evidence

- Live Citations (2026-08-24): "fully and freely available for both non-commercial and commercial uses"
- Same page (2026-08-24): "Certain datasets may have open data licenses (e.g., Creative Common CC BY 4.0)"
- Same page (2026-08-24): "you must cite the use of OpenTopography data"

## Related

- [usgs-earth-explorer](usgs-earth-explorer.md)
- [copernicus-dem-glo30](copernicus-dem-glo30.md)
- [nasadem](nasadem.md)
- [jaxa-alos-aw3d30](jaxa-alos-aw3d30.md)
- [etopo-2022](etopo-2022.md)

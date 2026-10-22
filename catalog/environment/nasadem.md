---
id: nasadem
name: NASADEM (LP DAAC)
url: https://www.earthdata.nasa.gov/data/catalog/lpcloud-nasadem-hgt-001
publisher: NASA
category: environment
subcategories: [heightmaps, dem]
license: CC0
license_spdx: CC0-1.0
commercial: true
attribution_required: false
formats: [HGT, GeoTIFF]
tags: [srtm, 30m, global-land]
added: 2026-07-19
verified: 2026-08-24
status: active
---

# NASADEM (LP DAAC)

~30 m global land DEM reprocessed from SRTM (+ ASTER/AW3D30 void fills). Strong default heightmap for continents when you want clearer voids than raw SRTM. Free Earthdata login for download.

## Notes

- Coverage roughly 60°N–56°S land. Citation strongly urged even though CC0.
- Prefer over scraping Google/Bing elevation — see [`docs/high-risk.md`](../../docs/high-risk.md).
- Entry `url` moved to the Earthdata catalog on 2026-09-22 after a link check; the LP DAAC product page redirects there. Domain move only, no license re-check that day.

## Evidence

- LP DAAC product page (2026-08-24): “openly shared, without restriction” per EOSDIS Data Use Guidance.
- Live EOSDIS guidance (2026-08-24): NASA-led mission data unmarked by a license are **CC0**; acknowledge NASA as source.

## Related

- [usgs-earth-explorer](usgs-earth-explorer.md)
- [jaxa-alos-aw3d30](jaxa-alos-aw3d30.md)
- [copernicus-dem-glo30](copernicus-dem-glo30.md)

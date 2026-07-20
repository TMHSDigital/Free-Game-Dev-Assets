---
id: nasadem
name: NASADEM (LP DAAC)
url: https://lpdaac.usgs.gov/products/nasadem_hgtv001/
category: environment
subcategories: [heightmaps, dem]
license: CC0
commercial: true
attribution_required: false
formats: [HGT, GeoTIFF]
tags: [srtm, 30m, global-land]
verified: 2026-07-19
status: active
---

# NASADEM

~30 m global land DEM reprocessed from SRTM (+ ASTER/AW3D30 void fills). Strong default heightmap for continents when you want clearer voids than raw SRTM. Free Earthdata login for download.

## Notes

- Coverage roughly 60°N–56°S land. Citation strongly urged even though CC0.
- Prefer over scraping Google/Bing elevation — see [`docs/high-risk.md`](../../docs/high-risk.md).

## Evidence

- LP DAAC product page: “openly shared, without restriction” per EOSDIS Data Use Guidance.
- Live EOSDIS guidance: NASA-led mission data unmarked by a license are **CC0**; acknowledge NASA as source.

## Related

- [usgs-earth-explorer](usgs-earth-explorer.md)
- [jaxa-alos-aw3d30](jaxa-alos-aw3d30.md)
- [copernicus-dem-glo30](copernicus-dem-glo30.md)

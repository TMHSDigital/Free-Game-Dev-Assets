---
id: swisstopo-swissalti3d
name: swisstopo swissALTI3D
url: https://www.swisstopo.admin.ch/en/height-model-swissalti3d
category: environment
subcategories: [heightmaps, dem]
license: custom
commercial: true
attribution_required: true
attribution_string: "Federal Office of Topography swisstopo"
formats: [COG, GeoTIFF, ASCII]
tags: [terrain, government, switzerland, alps]
publisher: swisstopo
verified: 2026-10-04
status: active
---

# swisstopo swissALTI3D

High-precision bare-earth terrain model of Switzerland at 0.5 m or 2 m grid spacing, delivered in 1 km tiles. Alpine relief at this detail is rare in free data. It falls under swisstopo's open government data (OGD) terms, which allow commercial use but require a source reference.

## Notes

- The OGD terms list the accepted source references in German, French, Italian and English (for example "Federal Office of Topography swisstopo" or "©swisstopo"); use one of them. Some products, including swissALTI Regio and swissEO, require different wording, so check each product's own documentation.
- Data is a surface without vegetation and buildings. The 0.5 m grid is oversampled where the source density is too low.
- Formats per the product page: Cloud Optimized GeoTIFF (LZW) and ASCII X,Y,Z; ESRI ASCII GRID on request. A 2 m tile is about 1 MB, a 0.5 m tile about 26 MB, full coverage 44 GB at 2 m.
- Coordinate system is Swiss LV95 / LN02; reproject before importing into a game engine.
- Excessive use of the geoservices may be throttled; download tiles rather than scraping services.

## Evidence

- OGD terms page (2026-10-04): "may be used, distributed and made accessible"
- Same page (2026-10-04): "they may be enriched and processed and also used commercially. A reference to the source is mandatory."
- Product page (2026-10-04) links to these terms ("Terms of use") and lists COG and ASCII X,Y,Z delivery.

## Related

- [nls-finland-elevation-model](nls-finland-elevation-model.md)
- [copernicus-dem-glo30](copernicus-dem-glo30.md)
- [jaxa-alos-aw3d30](jaxa-alos-aw3d30.md)

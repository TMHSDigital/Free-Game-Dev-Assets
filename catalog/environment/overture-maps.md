---
id: overture-maps
name: Overture Maps
url: https://docs.overturemaps.org/attribution/
category: environment
subcategories: [geodata, vectors]
license: varies
commercial: unknown
attribution_required: true
attribution_string: "© OpenStreetMap contributors, Overture Maps Foundation"
formats: [GeoJSON]
tags: [buildings, roads, places, world-data]
publisher: Overture Maps Foundation
verified: 2026-10-04
status: needs-review
---

# Overture Maps

Open map dataset (buildings, roads, places, administrative divisions, base land and water, addresses) conflated from many sources. It is convenient for generating city layouts, but there is no single licence: each theme carries the licences of its sources, and several themes include ODbL (share-alike) OpenStreetMap data. Marked needs-review because licence depends on which theme and region you pull.

## Notes

- Per the attribution page, the Buildings, Base, Divisions and Transportation themes each list "License for theme: ODbL" with OpenStreetMap as a source; Places lists CDLA Permissive 2.0, Apache 2.0 and CC0 sources; many Buildings, Divisions and address sources are CC BY 4.0.
- ODbL share-alike applies if you ship a derived database, not to a game that only uses baked meshes; see [docs/geodata.md](../../docs/geodata.md) and [openstreetmap](openstreetmap.md). Verify each source you rely on rather than treating the whole dataset as permissive.
- Credit line used by the publisher where OSM-derived data is shown: "© OpenStreetMap contributors, Overture Maps Foundation". Other sources add their own credit lines, listed on the attribution page.
- The getting-data docs show a Python CLI that exports by bounding box to GeoJSON, and DuckDB queries over the cloud-hosted GeoParquet files.
- Some sources need non-standard terms (for example Australian G-NAF addresses under an end user licence agreement).

## Evidence

- Attribution page (2026-10-04): "Some of the data sources we use in Overture datasets require their own attribution"
- Same page (2026-10-04): Buildings, Base, Divisions and Transportation each state "License for theme: ODbL".
- Same page (2026-10-04): Places sources "Available under CDLA Permissive 2.0".
- No single blanket commercial grant is stated; status is needs-review for that reason.

## Related

- [openstreetmap](openstreetmap.md)
- [ms-building-footprints](ms-building-footprints.md)
- [esa-worldcover](esa-worldcover.md)

---
id: dcss-tiles
name: Dungeon Crawl Stone Soup Tiles
url: https://github.com/crawl/tiles
category: 2d
subcategories: [tileset, sprites, monsters, items]
license: varies
commercial: unknown
attribution_required: unknown
formats: [PNG]
tags: [roguelike, tileset, dungeon, monsters, items, mixed-license]
verified: 2026-10-04
status: needs-review
maintenance: inactive
grid_dimensions: 32x32
camera_perspective: top_down
---

# Dungeon Crawl Stone Soup Tiles

Thousands of 32x32 top-down tiles covering monsters, items, dungeon features, and effects, accumulated over decades of Dungeon Crawl Stone Soup development and packaged separately in the `crawl/tiles` repository. It is the largest full-colour roguelike sprite set available for free, and by far the deepest monster and item coverage in this catalog. It is filed as `needs-review` because the project itself says the licensing is not uniform and maintains an explicit list of tiles whose license is unknown.

## Notes

- Maintenance: no push to the GitHub repository crawl/tiles since 2020-09-05, per the GitHub API on 2026-09-26.
- The project publishes `TILES_UNDER_UNKNOWN_LICENSE.md` and `ARTISTS.md` alongside the art; read both before using anything, and treat the unknown-license list as unusable
- The upstream statement is that the majority is CC0 and new submissions are CC0 unless specified otherwise, with older pieces being the problem
- Derived from rltiles, which is where much of the older and less traceable provenance comes from
- Tiles are 32x32 with a consistent silhouette-first style, so mixing in a handful of your own is realistic
- Do not treat the game repository's GPL-2.0 as covering the art; the code license and the art license are separate questions here, and the art is the one that is unresolved
- If a specific tile matters to your project, resolve it individually against `ARTISTS.md` rather than adopting the set wholesale
- Still open (re-checked 2026-10-04): the `crawl/tiles` README says the export is meant to hold only CC0 tiles, but hedges ("every care possible has been taken"), describes the grant as "a license similar to \"public domain\"", and the export dates from 2015 with no push since 2020. No file states one unconditional licence for the packaged set, so `license` stays `varies` and `commercial` / `attribution_required` stay `unknown`. Settling it needs a statement from the maintainer, or a per-tile check against `ARTISTS.md`

## Evidence

- `LICENSE` in `crawl/crawl`, `master` (2026-08-24): "The majority of Crawl's tiles and artwork are released under the CC0 license"
- Same file (2026-08-24): "the licensing situation may be complex, especially for older pieces"
- `crawl/tiles` repository listing (2026-08-24): contains a file named `TILES_UNDER_UNKNOWN_LICENSE.md`
- `LICENSE` in `crawl/crawl` via `gh api` (2026-10-04): unchanged, "Public Domain|CC0: most of tiles" and "the licensing situation may be complex, especially for older pieces"
- `README.md` in `crawl/tiles` via `gh api` (2026-10-04): "Many of those artist making these changes have signed off their copyright, returning these tiles to a license similar to \"public domain\", CC Zero"; "While every care possible has been taken to separate those tiles released into CC Zero from those who have not or can not be contacted, if you happen to see a tile incorrectly included in this export, please contact the maintainer"
- `TILES_UNDER_UNKNOWN_LICENSE.md` (2026-10-04): "The following tiles (as of 2010) had unclear ownership and/or the original author was unable to be reached. They will be excluded from any release."
- `ARTISTS.md` (2026-10-04): "the list of artists that gave approval in 2010 for their artwork to be released under CC:0. It is asserted that this covers any new art submitted to Crawl."; repository `releases/` holds `Ancient` and `Nov-2015`

## Related

- [urizen-onebit](urizen-onebit.md)
- [kenney-tiny-dungeon](kenney-tiny-dungeon.md)
- [ox72-dungeontileset-ii](ox72-dungeontileset-ii.md)
- [universal-lpc-generator](universal-lpc-generator.md)

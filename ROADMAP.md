# Roadmap

Where help is most useful. The rule behind all of it: a wrong licence claim is worse than a
missing entry, so freshness and accuracy come before volume.

## Open to contributors

- **Thin categories:** video is the smallest, then animation and shaders-vfx, then environment
  (counts in the [category table](catalog/README.md)). See [CONTRIBUTING.md](CONTRIBUTING.md)
  and the "new source" issue form.
- **Re-verify batch:** each month a [re-verify issue](https://github.com/TMHSDigital/Free-Game-Dev-Assets/issues?q=is%3Aissue+is%3Aopen+%22Re-verify+batch%22+in%3Atitle)
  lists the entries whose licence was read longest ago. Re-read one source, add a dated
  Evidence line, and open a pull request.
- **Starter stacks:** audio, a game-jam kit, Unity and VR are not covered yet (Unreal is, in
  [stacks/3d-third-person-unreal.md](stacks/3d-third-person-unreal.md)). Use the "request an
  asset" form to add to a stack's Gaps list.
- **Corrections:** a licence that changed or a link that moved. The weekly link check opens an
  issue listing them.
- **Small tasks:** issues labelled [`good first issue`](https://github.com/TMHSDigital/Free-Game-Dev-Assets/labels/good%20first%20issue)
  and [`gap`](https://github.com/TMHSDigital/Free-Game-Dev-Assets/labels/gap).

## Planned

- A changelog page generated from [docs/review-ledger.md](docs/review-ledger.md).
- Full-text search over entry bodies (Notes and Evidence), not only names, tags and summaries.
- The guides rendered as site pages, and an engine filter on the site (see the
  [`feature`](https://github.com/TMHSDigital/Free-Game-Dev-Assets/labels/feature) label).

## Done

- Site search across names, tags and summaries, with licence, format and category filters.
- Accessibility fixes: focus handling, contrast, heading outline and tap targets (Lighthouse
  accessibility 100).
- Thin categories topped up: 15 video, animation and environment sources (2026-10-04).
- Machine-readable exports: `data.json`, `catalog.csv`, an Atom feed of new sources
  (`feed.xml`) and one of re-verified licences (`reverified.xml`); see [docs/data.md](docs/data.md).
- Monthly dataset releases tagged `vYYYY.MM.DD`, with the version written into `CITATION.cff`.
- Re-verification in regular batches: since 2026-10 the `reverify.yml` workflow opens a
  monthly checklist of the entries checked longest ago (over 150 days, about a tenth of the
  catalog each month), so the July 2026 verifications do not all expire together in mid-2027.
- `camera_perspective` and `grid_dimensions` on 2D entries.

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

- Full-text search over entry bodies (Notes and Evidence), not only names, tags and summaries.

## Done

- A changelog page: [docs/review-ledger.md](docs/review-ledger.md) on the site as guide/changelog/, and the README "Recent" block written from it by `npm run counts`.
- Site search across names, tags and summaries, with licence, format and category filters.
- The guides in docs/ rendered as site pages, and an engine filter that hides projects,
  addons and plugins for other engines.
- Accessibility fixes: focus handling, contrast, heading outline and tap targets (Lighthouse
  accessibility 100).
- Thin categories topped up: 15 video, animation and environment sources (2026-10-04).
- Machine-readable exports: `data.json`, `catalog.csv`, an Atom feed of new sources
  (`feed.xml`) and one of re-verified licences (`reverified.xml`); see [docs/data.md](docs/data.md).
- Monthly dataset releases tagged `vYYYY.MM.DD`, with the version written into `CITATION.cff`.
- Re-verification in regular batches: since 2026-10 the `reverify.yml` workflow opens a
  monthly checklist of the entries checked longest ago, sized so none passes 180 days before
  the next batch (about a fifth of the catalog a month, more while the July-September 2026
  verifications come due); a 24-month simulation in `site/lib/lib.test.mjs` holds it to that.
- `camera_perspective` and `grid_dimensions` on 2D entries.

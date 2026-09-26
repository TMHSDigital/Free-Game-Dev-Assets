# Catalog

One markdown file per source under a category folder. Copy [`TEMPLATE.md`](TEMPLATE.md) to add entries.

| Category | Entries | Path | Focus |
| --- | ---: | --- | --- |
| 3D | 70 | [`3d/`](3d/) | Models, scans, PBR textures |
| Tools | 77 | [`tools/`](tools/) | Editors, pipeline, TTS, Godot add-ons |
| 2D | 54 | [`2d/`](2d/) | Sprites, UI, icons, palettes |
| Audio | 30 | [`audio/`](audio/) | SFX, music, foley, IRs |
| Characters | 28 | [`characters/`](characters/) | Generators & modular humanoids |
| Fonts | 25 | [`fonts/`](fonts/) | OFL / commercial-ok type |
| Environment | 13 | [`environment/`](environment/) | HDRI, terrain, geodata |
| Shaders & VFX | 17 | [`shaders-vfx/`](shaders-vfx/) | Shaders, particle textures, FX |
| Animation | 12 | [`animation/`](animation/) | MoCap, character clips |
| Video | 8 | [`video/`](video/) | Stock footage, archival clips |

Guides: [`docs/licenses.md`](../docs/licenses.md) · [`docs/provenance.md`](../docs/provenance.md) · [`docs/high-risk.md`](../docs/high-risk.md) · [`docs/fivem.md`](../docs/fivem.md) · [`docs/ai-assets.md`](../docs/ai-assets.md) · [`docs/trust-score.md`](../docs/trust-score.md) · [`docs/fonts.md`](../docs/fonts.md) · [`docs/geodata.md`](../docs/geodata.md) · [`docs/game-vs-video-licensing.md`](../docs/game-vs-video-licensing.md) · [`docs/godot-budget-stack.md`](../docs/godot-budget-stack.md) · [`docs/research-index.md`](../docs/research-index.md)

**Which category.** File a source under the kind of content it mainly gives you.
Software that exists to make one kind of content lives with that content, next to the
assets it competes with: character creators (MakeHuman, VRoid Studio, CharMorph) are in
`characters/`, capture and retargeting tools (Rokoko Vision, MoveBox, Animated Drawings)
in `animation/`. General-purpose editors and pipeline tools live in `tools/`. A library
that mixes several kinds is filed by its main one: dedicated HDRI publishers are in
`environment/`, while BlendKit, mostly models and materials with some HDRIs, is in `3d/`.

Optional frontmatter (2D/UI): `grid_dimensions`, `camera_perspective`, `hardware_tags`, `attribution_string`. Any entry: `maintenance` (`archived` or `inactive`, for a source repository that is archived or has had no push in three years; the site shows it as a badge and the weekly link check reports a GitHub source whose state disagrees). See [`TEMPLATE.md`](TEMPLATE.md).

Status legend: `active` = license spot-checked · `needs-review` = useful but verify before shipping · `deprecated` = keep for history only.

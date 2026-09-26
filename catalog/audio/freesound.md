---
id: freesound
name: Freesound
url: https://freesound.org
category: audio
subcategories: [sfx, field-recordings]
license: varies
commercial: varies
attribution_required: unknown
formats: [WAV, FLAC, OGG]
tags: [community, filter-required, cc0-filter]
verified: 2026-09-26
status: needs-review
---

# Freesound

Huge community audio library. Per-sound licenses are **CC0**, **CC BY**, or **CC BY-NC** (plus legacy Sampling+). Filter to **CC0** (or BY with credit) for commercial shipping — NC / Sampling+ uploads are not commercial-safe.

## Notes

- **Content ID reaches sound effects, through third parties.** Freesound's own FAQ (read 2026-09-23) explains it: musicians put "raw" Freesound sounds into songs and register those songs with YouTube Content ID, so any other video containing the same unedited sound gets matched. It adds that a sound "modified with plugins, stretched or slowed" is less likely to match, and that a claim can be disputed by showing the Freesound upload predates the song. For a game, process sounds before you ship them, which also protects your players' videos

- `commercial: varies` (set 2026-09-26): the FAQ names three per-sound licences, and one of them (BY-NC) forbids commercial use, so this is the per-file case the catalog marks `varies`. Still open: credit is also per sound (CC0 none, BY required), and the schema has no per-file value for `attribution_required`, so the entry stays `needs-review`

- Search filters are not a legal guarantee — open each sound’s license page before packaging
- Attribution list tool: freesound.org/home/attribution/
- Site ToS restricts commercial use of the *website portal*; sound reuse still follows the per-file Creative Commons choice
- Prefer [kenney-rpg-audio](kenney-rpg-audio.md) / [bigsoundbank](bigsoundbank.md) when you want site-wide commercial clarity

## Evidence

- Live [FAQ — Licenses](https://freesound.org/help/faq/) (2026-07-19): uploaders choose CC0 / BY / BY-NC; FAQ summary: NC means “you can't earn any money with the piece of work you create!”
- Live [website ToS](https://freesound.org/help/tos_web/) (2026-07-19): sounds/metadata licensed under the CC license the uploader selects — not a site-wide commercial grant → keep `needs-review` / `commercial: unknown`
- Live [FAQ — Licenses](https://freesound.org/help/faq/) (2026-09-26): "freesound lets the user select one of three licenses for their sounds. And, we used to have a 4th license"; zero: "you can do pretty much what you want with the sound"; attribution: "you should always mention the original creators"; noncommercial: "you can't earn any money with the piece of work you create!"

## Related

- [bigsoundbank](bigsoundbank.md)
- [kenney-rpg-audio](kenney-rpg-audio.md)
- [sonniss-gdc](sonniss-gdc.md)

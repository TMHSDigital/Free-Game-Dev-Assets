---
id: pulselite-ui-sfx
name: PulseLite UI SFX (free sample)
url: https://bigshadex.itch.io/pulselite-ui-sfx-free
category: audio
subcategories: [sfx]
license: CC-BY-4.0
license_spdx: CC-BY-4.0
commercial: true
attribution_required: true
attribution_string: "PulseLite UI SFX by Bigshadex (https://bigshadex.itch.io/pulselite-ui-sfx-free), CC BY 4.0"
formats: [WAV, Godot]
tags: [ui, menu, procedural, godot]
added: 2026-10-22
verified: 2026-10-21
status: active
publisher: Bigshadex
---

# PulseLite UI SFX (free sample)

Twenty matched UI and game-feedback sounds (click, hover, toggle, confirm, back, error, notify, panel open/close, whoosh, coin, reward, level up) plus a Godot 4 autoload that wires hover/click/toggle sounds onto every button in one line. WAV 44.1 kHz / 16-bit mono, loudness-matched. The audio is procedural DSP (oscillators and envelopes), not recorded samples and not generative-AI audio; the helper script and page text were written with AI assistance. Free for commercial games under CC BY 4.0 with the credit line above. A larger paid kit (200 sounds) exists on a separate itch page; only this free sample belongs in the catalog. Also available as a free addon on the Godot Asset Store.

## Notes

- Licence: the 20 free sounds are CC BY 4.0; the Godot script and event maps are MIT. Credit the sounds as in `attribution_string`. The other 180 sounds in the paid kit are not covered by this entry.
- Redistribution: CC BY 4.0 allows sharing the 20 files with credit and licence; do not add stricter terms.
- Provenance: the publisher states the audio is deterministic procedural DSP, with no recorded samples and no AI audio models; the helper script and page text were written with AI assistance. For a human-recorded alternative see [kenney-interface-sounds](kenney-interface-sounds.md).
- Engines: WAV works in any engine; Godot 4 users can install via the Asset Store listing or copy PulseLiteUI.gd as an autoload. Playable browser demo is on the itch free page.
- Editor notice: enabling the Godot plugin prints a one-time line in the editor output that links the publisher's paid kit. It is editor-only and never runs in an exported game (`plugin.gd`, read 2026-10-21).
- Source: the publisher submitted this entry and said so in the pull request. The licence facts were re-read by a maintainer at the itch page, the GitHub `LICENSE` and `LICENSE-SOUNDS` files on 2026-10-21.

## Evidence

- Live itch free page (2026-10-21): "The CC BY 4.0 licence here covers only these 20 free sounds." Install instructions on the same page: "Credit (CC BY 4.0, fine for jam and commercial games): PulseLite UI SFX by Bigshadex (CC BY 4.0) - https://bigshadex.itch.io/pulselite-ui-sfx-free"
- Same page (2026-10-21): "How it was made: the audio is synthesized from code (procedural DSP). No recorded samples, sample libraries or AI-generated audio. The text and the helper script were written with AI assistance."
- `LICENSE-SOUNDS` in the GitHub repository (2026-10-21): "The 20 sound files in sounds/ are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0)." and "Attribution is required."
- `LICENSE` in the same repository (2026-10-21): "MIT License ... Applies to all code and data in this repository (addons/pulselite_ui/*.gd, plugin.cfg, ui_events.json, demo/ and project.godot). The sound files in addons/pulselite_ui/sounds/ are covered by LICENSE-SOUNDS (CC BY 4.0), not this license."
- Godot Asset Store listing (2026-10-21): https://store.godotengine.org/asset/bigshadex/pulselite-ui-sounds-free-button-menu-sfx-autoload/

## Related

- [kenney-interface-sounds](kenney-interface-sounds.md)
- [kenney-ui-audio](kenney-ui-audio.md)
- [budgetpixel-sfx](budgetpixel-sfx.md)

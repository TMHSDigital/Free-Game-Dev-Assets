---
id: tenacity
name: Tenacity
url: https://codeberg.org/tenacityteam/tenacity
category: tools
subcategories: [audio-editing]
license: GPL-2.0
commercial: true
attribution_required: false
formats: [WAV, FLAC, OGG, MP3, AUP3]
tags: [audio, editor, sfx, open-source, dcc]
verified: 2026-08-24
status: active
---

# Tenacity

Community fork of Audacity, maintained on Codeberg, for trimming and cleaning the sample-based SFX this catalog points at. Covers the unglamorous work a game project actually needs: batch resampling a downloaded pack to a consistent rate, trimming silence off attack transients, normalizing loudness across a footstep set, and looping music beds. Chosen over upstream Audacity because the fork was created specifically to strip the telemetry and updated terms that upstream added.

## Notes

- Set Project Rate before importing a mixed-rate pack, or exports inherit whichever file was loaded first
- Truncate Silence plus Normalize is the standard pass for a downloaded footstep or impact set
- Export as 16-bit PCM WAV for engine-side SFX and OGG Vorbis for music beds; Godot streams OGG but decodes WAV to memory
- No non-destructive automation lanes, so keep the original downloads and treat the AUP3 project as scratch
- GPL-2.0 covers the application; recordings and edits you make carry whatever license the source audio had, which for CC-BY sources means the attribution obligation survives your edit

## Evidence

- `LICENSE.txt` in the Codeberg repository (2026-08-24): "Tenacity is distributed under the terms of the GNU GPL Version 2."
- Same file (2026-08-24): documentation is separately "under the Creative Commons license (CC BY 3.0)"

## Related

- [jsfxr](jsfxr.md)
- [audacity](audacity.md)
- [../audio/kenney-impact-sounds](../audio/kenney-impact-sounds.md)
- [../audio/freesound](../audio/freesound.md)
- [../audio/voxengo-impulses](../audio/voxengo-impulses.md)

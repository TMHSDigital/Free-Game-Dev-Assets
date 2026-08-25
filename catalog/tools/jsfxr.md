---
id: jsfxr
name: jsfxr
url: https://sfxr.me
category: tools
subcategories: [sfx-generator]
license: public-domain
license_spdx: Unlicense
commercial: true
attribution_required: false
formats: [WAV]
tags: [sfx, procedural, retro, browser, chiptune]
verified: 2026-08-24
status: active
---

# jsfxr

Browser port of DrPetter's sfxr, the 8-bit sound effect generator. Press a category button (pickup, laser, explosion, powerup, hit, jump, blip), get a usable retro SFX, tweak the oscillator and envelope sliders, export WAV. This closes the gap that no fixed SFX pack can: when a specific interaction needs a sound that is not in Kenney's set, generating one takes seconds and the result is unencumbered because you made it.

## Notes

- Runs entirely client-side, so no upload and no account; the permalink encodes the full parameter set, which makes a sound reproducible from a URL in a design doc
- Exports 8-bit or 16-bit WAV at 44100 Hz; pick 16-bit unless you want the quantization crunch as an aesthetic
- Output is short and mono by design; layer two exports in an editor for anything meaty
- The generator is Unlicense so the code is public domain, and sounds you generate are your own output, not a redistribution of licensed content
- A paid "jsfxr pro" desktop version exists; the web generator linked here is the free one

## Evidence

- `UNLICENSE` in the repository (2026-08-24): "free and unencumbered software released into the public domain"
- Same file (2026-08-24): "for any purpose, commercial or non-commercial, and by any means"

## Related

- [tenacity](tenacity.md)
- [../audio/kenney-interface-sounds](../audio/kenney-interface-sounds.md)
- [../audio/kenney-impact-sounds](../audio/kenney-impact-sounds.md)
- [../audio/kenney-sci-fi-sounds](../audio/kenney-sci-fi-sounds.md)

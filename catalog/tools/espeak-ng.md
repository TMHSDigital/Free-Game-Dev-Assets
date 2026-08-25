---
id: espeak-ng
name: eSpeak NG
url: https://github.com/espeak-ng/espeak-ng
category: tools
subcategories: [tts, speech]
license: GPL-3.0
commercial: true
attribution_required: false
formats: [WAV, espeak-ng-data]
tags: [tts, formant, gpl, offline]
verified: 2026-08-24
status: active
---

# eSpeak NG

Formant (robotic) TTS for 100+ languages. Useful for placeholder VO, accessibility debug lines, and tiny footprints where neural models are overkill. The program is GPL-3.0 or later (`COPYING`). GitHub README also notes a BSD-2 `getopt.c` exception on Windows. Pages fetched this session do not say the WAV you synthesize is yours. Shipping the *engine* inside a closed game is a GPL event. Shipping a bounced line *may* not be; that split is inferred. Prefer [piper-plus](piper-plus.md) / [kokoro-82m](kokoro-82m.md) when you need MIT/Apache TTS code.

## Notes

- Evidence: repo README "License Information" plus `COPYING` (GPL v3). GitHub SPDX `GPL-3.0`
- `espeak-ng-data` (voices, dictionaries) lives in-tree under the same GPL. Do not treat voices as a separate Apache grant
- This is why Piper Plus advertises "without espeak-ng"
- Checklist: license file visible, commercial use of the *program* under GPL, no NC/ND, not a marketplace, named org, not blocklisted, engine vs WAV unquoted

## Evidence

- Live GitHub README, License Information (2026-08-24): "released under the GPL version 3 or later license"
- Live `COPYING` (2026-08-24): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"

## Related

- [piper-plus](piper-plus.md)
- [kokoro-82m](kokoro-82m.md)
- [sherpa-onnx](sherpa-onnx.md)
- [melotts](melotts.md)

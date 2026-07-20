---
id: sherpa-onnx
name: sherpa-onnx
url: https://github.com/k2-fsa/sherpa-onnx
category: tools
subcategories: [tts, speech, asr]
license: Apache-2.0
commercial: true
attribution_required: false
formats: [ONNX, C++, Python, WASM]
tags: [apache, local, offline, tts, asr]
verified: 2026-07-19
status: active
---

# sherpa-onnx

Local ONNX runtime for **TTS + ASR** (and VAD/diarization) across desktop/mobile/WASM. **Apache-2.0** toolkit — commercial OK. Check **per-voice/model** licenses when bundling Piper/Matcha/etc. checkpoints.

## Notes

- Prefer over cloud free tiers ([`docs/high-risk.md`](../../docs/high-risk.md) ElevenLabs)
- Retain Apache notice with redistributed binaries
- Complements [kokoro-82m](kokoro-82m.md) / [piper-plus](piper-plus.md)

## Evidence

- Live LICENSE (2026-07-19): **Apache License 2.0**
- Live README: supports local speech synthesis (TTS) and recognition

## Related

- [kokoro-82m](kokoro-82m.md)
- [piper-plus](piper-plus.md)
- [melotts](melotts.md)

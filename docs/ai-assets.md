# AI-generated assets — catalog policy

Synthesized from gap research (as of early 2026 claims in that brief — **re-verify** before relying on dates/rulings).

## Practical catalog rules

1. **Prefer human-authored CC0 / clear commercial licenses** for default recommendations.
2. **Label AI tooling** clearly (`tags: [ai-generated]` or `compliance:ai-disclosure`) when an entry is primarily generative.
3. **Do not treat “public domain because AI” as a shipping strategy** — platform rules (Steam disclosure), training-data risk, and publicity/voice rights still apply.
4. **Exclude free-tier cloud TTS/voice** that is non-commercial (ElevenLabs-class) from “commercial OK” lists.
5. **Prefer local permissive models** (Apache 2.0 / MIT) when synthetic VO is needed.

## Platform notes (verify live)

- **Steam**: research notes player-facing generative assets may require store disclosure; internal coding assistants may not. Check current Valve guidelines.
- **US copyright**: research cites human-authorship requirements for registration; pure machine output may be unprotected — that does **not** clear third-party training-data or likeness claims.
- **Voice/likeness**: generating a real performer’s voice without rights is high risk regardless of model license.

## Related entries

- [`catalog/tools/kokoro-82m.md`](../catalog/tools/kokoro-82m.md)
- [`catalog/tools/piper-plus.md`](../catalog/tools/piper-plus.md)
- [`high-risk.md`](high-risk.md)

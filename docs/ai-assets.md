# AI-generated assets — catalog policy

Last reviewed 2026-11-03. Court rulings and platform rules on AI content change quickly: **re-verify** dates and rulings before relying on them.

## Practical catalog rules

1. **Prefer human-authored CC0 / clear commercial licenses** for default recommendations.
2. **Label AI tooling** clearly (`tags: [ai-generated]`) when an entry is primarily generative.
3. **Do not treat “public domain because AI” as a shipping strategy** — platform rules (Steam disclosure), training-data risk, and publicity/voice rights still apply.
4. **Exclude free-tier cloud TTS/voice** that is non-commercial (ElevenLabs-class) from “commercial OK” lists.
5. **Prefer local permissive models** (Apache 2.0 / MIT) when synthetic VO is needed.

## Platform notes (verify live)

- **Steam**: the Content Survey you fill in before review has a section on generative AI.
  The live [Content Survey page](https://partner.steamgames.com/doc/gettingstarted/contentsurvey)
  (read 2026-11-03) says it "is concerned with the use of AI in creating content that ships
  with your game, and is consumed by players. This includes content such as artwork, sound,
  narrative, localization, etc.", and that AI tools used only for development efficiency
  are "not the focus of this section". It splits AI content into "Pre-Generated: Any kind of
  content that ships with your game and is consumed by players that is created with the
  help of AI tools during development" and "Live-Generated", content made while the game
  runs, for which "you'll need to tell us what kind of guardrails you're putting on your
  AI to ensure it's not generating illegal content."
- **US copyright**: research cites human-authorship requirements for registration; pure machine output may be unprotected — that does **not** clear third-party training-data or likeness claims.
- **Voice/likeness**: generating a real performer’s voice without rights is high risk regardless of model license.

## What an `ai-generated` entry obliges you to disclose

An entry tagged `ai-generated` holds content that its source says was made with AI tools,
in whole or in part. If you ship any of it, it is content "created with the help of AI
tools" that players consume, so on Steam it belongs in the Pre-Generated part of the
Content Survey, whoever ran the generator. Describe which assets and where they came
from. The same holds for a library that mixes human and AI files, such as Soundza, if a
file you use is labelled AI on its page. Other stores have their own rules; read them
before you submit.

## Mixed catalogs (human CC0 vs generator)

[3DTexel](../catalog/shaders-vfx/3dtexel-decals.md) ships a **human-authored CC0 decal library** on the same site as paid premium files and AI generators. The catalog entry is the human CC0 set only. Footer (2026-08-29): free assets CC0; premium and AI assets use a separate 3DTexel License. Do not treat generator output as that CC0 grant.

## Entries tagged ai-generated

These entries carry the `ai-generated` tag; the validator keeps this list complete (V37).
The [live search](https://tmhsdigital.github.io/Free-Game-Dev-Assets/?q=ai-generated) shows
the same set.

- [Avramania Free Collection](../catalog/3d/avramania-free-collection.md)
- [BitNuker Fantasy Environments Sampler](../catalog/2d/bitnuker-fantasy-environments-sampler.md)
- [BitNuker Workshop Sampler](../catalog/2d/bitnuker-workshop-sampler.md)
- [BudgetPixel Sound Effects](../catalog/audio/budgetpixel-sfx.md)
- [SFXMint](../catalog/audio/sfxmint.md)
- [Soundza](../catalog/audio/soundza.md)

## Related entries

- [`catalog/shaders-vfx/3dtexel-decals.md`](../catalog/shaders-vfx/3dtexel-decals.md)
- [`catalog/tools/kokoro-82m.md`](../catalog/tools/kokoro-82m.md)
- [`catalog/tools/piper-plus.md`](../catalog/tools/piper-plus.md)
- [`high-risk.md`](high-risk.md)

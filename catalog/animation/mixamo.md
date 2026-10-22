---
id: mixamo
name: Mixamo
url: https://www.mixamo.com
category: animation
subcategories: [mocap, characters]
license: custom
commercial: true
attribution_required: false
formats: [FBX]
tags: [adobe, freemium, retargeting-heavy, humanoid]
added: 2026-07-19
verified: 2026-07-19
status: active
---

# Mixamo

Adobe’s free character + animation service (Adobe ID required; no CC subscription). Royalty-free for **personal and commercial** projects including video games. Proprietary Mixamo rigs — plan retargeting to your engine skeleton. Not CC0.

## Notes

- Unavailable for Enterprise/Federated IDs and China country codes (per Adobe FAQ)
- Humanoid bipeds only for auto-rigger / animation library
- Save rigged characters locally; service keeps only the last character
- Unreal Engine: the IK Rig editor's Auto Retarget Chains tool matches bone chains by name against templates. Epic's templates name the UE4/UE5 Mannequins, MetaHumans and Stack O Bot, not Mixamo, so check the generated chains before batch-retargeting. For a third-person Unreal project, the [Game Animation Sample](game-animation-sample.md) already targets the UE5 Mannequin
- Prefer CC0 packs ([Quaternius UAL](quaternius-universal-animation-library.md), [KayKit](kaykit-character-animations.md)) when you want redistribute-friendly sources

## Evidence

- Live [Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) (checked 2026-07-19): “You can use both characters and animations royalty free for personal, commercial, and non-profit projects including: … Create video games.” Free with Adobe ID, no Creative Cloud subscription required.

## Related

- [quaternius-universal-animation-library](quaternius-universal-animation-library.md)
- [kaykit-character-animations](kaykit-character-animations.md)
- [cmu-mocap](cmu-mocap.md)
- [game-animation-sample](game-animation-sample.md)

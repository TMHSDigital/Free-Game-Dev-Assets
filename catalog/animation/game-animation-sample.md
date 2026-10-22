---
id: game-animation-sample
name: Game Animation Sample (GASP)
url: https://www.fab.com/listings/880e319a-a59e-4ed2-b268-b32dac7fa016
category: animation
subcategories: [sample-projects, mocap, animation]
license: custom
commercial: true
attribution_required: false
formats: [Unreal]
tags: [unreal-engine, third-person, motion-matching, locomotion, humanoid]
publisher: Epic Games
ue_versions: "5.4-5.8"
added: 2026-10-13
verified: 2026-10-13
status: needs-review
---

# Game Animation Sample (GASP)

Epic's free Unreal Engine sample project for a third-person animation system built on Motion Matching. It ships a capsule-driven locomotion set (walk, run, jump, fall), a simple traversal system (ledges, vaulting) and a library of over 500 motion-captured animations on the UE5 Mannequin skeleton, wired up with Choosers and Pose Search databases. Delivered as an Unreal project through Fab; there are no standalone FBX downloads.

## Notes

- Contents: the Fab description lists "500+ of game-ready animations compatible with the UE5 Mannequin Skeleton through runtime retargeting", Motion Matching locomotion and a traversal example; Epic's docs describe it as a living project updated with each engine release
- UE versions: the Fab listing's "Unreal Engine versions" field read 5.4 – 5.8 on 2026-10-13 (first published June 2024, last update August 17, 2026). The UE 5.8 tech-blog post returned HTTP 403 to a plain fetch and was not read
- Licence: the listing's licence terms are the Fab Standard License, free on both the Personal and Professional tiers. Unlike Lyra, Cropout and the City Sample sub-packs, this listing's description carries no "UE-Only Content" line, so `engine_lock` is omitted. Open question: whether Epic intends this Mannequin animation set to be usable outside Unreal; the Standard License summary says usage "is not limited to Unreal Engine", but confirm on the listing before exporting animations to another engine. Kept at needs-review for that reason
- Redistribution: this is Epic content and may not be redistributed in source form or committed to a public repository. Epic's content licence says you "may not Distribute Licensed Content in source format to third parties except to employees, affiliates, and contractors who are utilizing the Licensed Content in good faith to develop a Project on your behalf"; the Fab Standard License summary likewise allows sharing only "via a private repository or in the Project" with collaborators. Keep the project's Content folder out of public Git
- Gotchas: the project is large and expects the matching engine version; the animations target the UE5 Mannequin (Manny/Quinn) skeleton, so other characters need an IK retargeter; motion matching databases must be rebuilt after adding or changing animations
- The listing's "Allows usage with AI" field reads No

## Evidence

- Live [Fab listing](https://www.fab.com/listings/880e319a-a59e-4ed2-b268-b32dac7fa016) (2026-10-13): "License terms" "Standard License"; both Personal and Professional tiers priced at 0 USD; "Unreal Engine versions" "5.4 – 5.8"
- Same listing description (2026-10-13): "3rd person capsule driven locomotion, powered by Motion Matching, complete with walk, run, jump and fall states."; no "UE-Only Content" line present
- Live [Fab EULA](https://www.fab.com/eula) Standard License summary (2026-10-13): "Use the assets commercially or privately"; "You are not required to give credit to the publisher you acquired the Fab asset from"; "You may not: Resell or redistribute the asset for free on a standalone basis"
- Live [Unreal Engine content licence](https://www.unrealengine.com/eula/content) (2026-10-13): "you may not Distribute Licensed Content in source format to third parties except to employees, affiliates, and contractors who are utilizing the Licensed Content in good faith to develop a Project on your behalf"
- Live [Game Animation Sample docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/game-animation-sample-project-in-unreal-engine) (2026-10-13): "This project will continue to be updated and improved upon with each major engine release."

## Related

- [mixamo](mixamo.md)
- [quaternius-universal-animation-library](quaternius-universal-animation-library.md)
- [cmu-mocap](cmu-mocap.md)
- [lyra-starter-game](../3d/lyra-starter-game.md)

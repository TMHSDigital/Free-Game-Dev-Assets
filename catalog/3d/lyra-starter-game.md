---
id: lyra-starter-game
name: Lyra Starter Game
url: https://www.fab.com/listings/93faede1-4434-47c0-85f1-bf27c0820ad0
category: 3d
subcategories: [sample-projects, characters]
license: custom
commercial: true
attribution_required: false
formats: [Unreal]
tags: [unreal-engine, shooter, third-person, multiplayer]
publisher: Epic Games
engine_lock: unreal
ue_versions: "5.0-5.8"
added: 2026-10-13
verified: 2026-10-13
status: active
---

# Lyra Starter Game

Epic's free UE5 sample gameplay project and the successor to UE4's ShooterGame. It ships two multiplayer modes (Expanse team deathmatch and Convolution control point), cross-play via Epic Online Services, scalability from mobile to high-end PC, and the UE5 Mannequins Manny and Quinn as playable characters. Delivered as an Unreal project through Fab and marked UE-only.

## Notes

- Contents: full C++ and Blueprint gameplay framework (modular game features, Gameplay Ability System, Enhanced Input, Common UI), maps, weapons, the Manny and Quinn mannequins and their animation set
- UE versions: the Fab listing's "Unreal Engine versions" field read 5.0 – 5.8 on 2026-10-13 (first published February 2022, last update September 30, 2026)
- Licence: Fab Standard License, free on both tiers, and the description states "UE-Only Content - Licensed for Use Only with Unreal Engine-based Products", hence `engine_lock: unreal`. The models, animations and textures may not be exported for use in Godot, Unity or other engines
- Redistribution: this is Epic content and may not be redistributed in source form or committed to a public repository. Epic's content licence says you "may not Distribute Licensed Content in source format to third parties except to employees, affiliates, and contractors who are utilizing the Licensed Content in good faith to develop a Project on your behalf". Forks of Lyra on public GitHub that include the Content folder are not licensed redistribution
- Gotchas: Lyra is a large, architecture-heavy project; teams often learn from it rather than ship on top of it. Each engine version has its own Lyra download, and upgrading an existing Lyra-based project between versions is manual work. EOS cross-play needs your own Epic developer portal setup

## Evidence

- Live [Fab listing](https://www.fab.com/listings/93faede1-4434-47c0-85f1-bf27c0820ad0) (2026-10-13): "License terms" "Standard License"; both Personal and Professional tiers priced at 0 USD; "Unreal Engine versions" "5.0 – 5.8"
- Same listing description (2026-10-13): "UE-Only Content - Licensed for Use Only with Unreal Engine-based Products"
- Same listing description (2026-10-13): "Lyra Starter Game will take over the role that ShooterGame served in UE4"
- Live [Fab EULA](https://www.fab.com/eula) Standard License summary (2026-10-13): "Use the assets commercially or privately"; "You are not required to give credit to the publisher you acquired the Fab asset from"
- Live [Unreal Engine content licence](https://www.unrealengine.com/eula/content) (2026-10-13): "you may not Distribute Licensed Content in source format to third parties except to employees, affiliates, and contractors who are utilizing the Licensed Content in good faith to develop a Project on your behalf"; "UE-Only Content" means Licensed Content "designated as only permitted for use in conjunction with Unreal Engine and Unreal Engine-based products as designated by Epic"

## Related

- [game-animation-sample](../animation/game-animation-sample.md)
- [cropout-sample-project](cropout-sample-project.md)
- [stack-o-bot](stack-o-bot.md)
- [fab-megascans-standard](fab-megascans-standard.md)

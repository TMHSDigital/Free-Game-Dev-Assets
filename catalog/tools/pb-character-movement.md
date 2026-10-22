---
id: pb-character-movement
name: PBCharacterMovement
url: https://github.com/ProjectBorealis/PBCharacterMovement
category: tools
subcategories: [unreal, first-person]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, character-movement, fps, bunny-hopping, air-strafing, crouch-slide]
ue_versions: "5.5"
added: 2026-10-13
verified: 2026-10-13
status: active
---

# PBCharacterMovement

Half-Life 2 style first-person movement for Unreal Engine, written in C++ by the Project Borealis team. It replaces the default character movement feel with classic Source-engine behaviour: air strafing, bunny hopping, surface friction, crouch sliding and step sounds. MIT licensed, so it can ship inside a closed commercial game.

## Notes

- Built as a character movement component plus a `PBPlayerCharacter` base class; the README's setup creates a Blueprint child of that class and a game mode that uses it, so tuning happens in Blueprint while the movement code is C++
- Version recorded from the README: "Binaries are compiled for `5.5`"; other engine versions need a recompile, and the README says "Versions prior to `5.5` may require additional code changes"
- Install by downloading the repository ZIP into your project's `Plugins` folder; the README states Blueprint-only projects "must upgrade to a C++ project, or else the game will fail to package"
- Release 3.1.0 (2025-03-10) added air jumps and edge friction and made crouch sliding available without recompiling
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL and LGPL; keep the copyright notice in your third-party credits
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2025-06-08

## Evidence

- `LICENSE` in the repository, `main` branch (2026-10-13): "MIT License Copyright (c) 2019-2025 Project Borealis"
- Same file (2026-10-13): "to deal in the Software without restriction"
- `README.md`, `main` branch (2026-10-13): "Binaries are compiled for `5.5`, and will work on C++ projects."

## Related

- [als-community](als-community.md)
- [gas-documentation](gas-documentation.md)
- [ue5coro](ue5coro.md)

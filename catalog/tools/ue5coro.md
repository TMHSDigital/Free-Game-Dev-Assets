---
id: ue5coro
name: UE5Coro
url: https://github.com/landelare/ue5coro
category: tools
subcategories: [unreal, library]
license: BSD-3-Clause-Clear
license_spdx: BSD-3-Clause-Clear
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, coroutines, async, latent-actions, multithreading, gameplay-programming]
verified: 2026-10-13
status: active
maintenance: archived
---

# UE5Coro

C++20 coroutine support for Unreal Engine, built around gameplay code. Changing a function's return type to one of the plugin's coroutine types lets it `co_await` delays, ticks, async asset loads, delegates, timelines and thread switches, replacing chains of callbacks and timers with straight-line code. Latent UFUNCTIONs written this way appear as ordinary latent nodes in Blueprint. Licensed under the BSD 3-Clause Clear licence, which permits closed commercial use.

## Notes

- C++ only: coroutines are authored in C++; Blueprint sees the result as latent nodes, with the coroutine return type hidden from designers
- Install from a numbered release, not a Git branch (the README says "Only numbered releases are supported"); extract into `Plugins/UE5Coro` without the version suffix, then reference the `UE5Coro` module in Build.cs; optional modules such as `UE5CoroGAS` add Gameplay Ability System support
- Requires C++20, which the README says is standard "in new projects made in Unreal Engine 5.3 or later"; older projects must switch Target.cs to the latest build settings and include order
- No supported UE5 version range is stated in the README or `.uplugin`, so none is recorded here; a separate `-ue4` release targets Unreal Engine 4.27.2 and is marked unsupported by the author
- The v2.3.2 release notes warn that builds made with LLVM 22 are unstable and that Clang "remains unsupported"; check this before building for Clang-based platforms
- BSD-3-Clause-Clear is BSD 3-Clause plus an explicit statement that no patent licence is granted; binary redistribution must reproduce the copyright notice and disclaimer in documentation, so add it to your third-party credits
- Permissive, so compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL and LGPL
- Maintenance: GitHub API (2026-10-13) reports the repository not archived, last push 2026-07-19; latest release v2.3.2 (2026-07-19)
- Maintenance: the repository was archived after a final push on 2026-10-16, per the GitHub API on 2026-10-22. The README now says "UE5Coro is complete, with no known bugs at the time of archival. Unreal Engine 5 has reached the end of its lifecycle, and this plugin with it." The licence file is unchanged (API still reports BSD-3-Clause-Clear); releases stay downloadable, but expect no fixes for newer engine versions

## Evidence

- `COPYING` in the repository, `master` branch (2026-10-13): "Copyright © Laura Andelare All rights reserved."
- Same file (2026-10-13): "Redistribution and use in source and binary forms, with or without modification, are permitted (subject to the limitations in the disclaimer below)"
- Same file (2026-10-13): "NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED BY THIS LICENSE."
- GitHub API repository licence field (2026-10-13): `BSD-3-Clause-Clear`

## Related

- [gas-documentation](gas-documentation.md)
- [unreal-imgui](unreal-imgui.md)
- [pb-character-movement](pb-character-movement.md)
- [dlgsystem](dlgsystem.md)

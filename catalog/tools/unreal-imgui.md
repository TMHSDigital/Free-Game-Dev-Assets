---
id: unreal-imgui
name: UnrealImGui (IDI-Systems fork)
url: https://github.com/IDI-Systems/UnrealImGui
category: tools
subcategories: [unreal, ui]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [unreal-plugin, C++]
tags: [unreal-engine, debug-ui, imgui, immediate-mode, developer-tools, implot]
ue_versions: "4.27-5.5"
added: 2026-10-13
verified: 2026-10-13
status: active
---

# UnrealImGui (IDI-Systems fork)

Unreal Engine plugin that integrates Dear ImGui, the immediate-mode GUI library, for in-game debug windows, tweak panels and developer tools drawn from a few lines of C++. This entry links the IDI-Systems fork, which carries the original segross/UnrealImGui forward to Unreal Engine 5 and bundles ImPlot. MIT licensed, as are the bundled Dear ImGui and ImPlot sources.

## Notes

- Canonical link choice: the original [segross/UnrealImGui](https://github.com/segross/UnrealImGui) README states "Supported engine version: 4.26" and its last commit on `master` is dated 2021-04-16; the IDI-Systems fork (GitHub lists segross/UnrealImGui as its parent) states support for 4.27 through 5.5 and was last pushed 2026-02-10, with a commit for 5.6+ compiler warnings
- Supported versions come from the fork's README: "Supported Unreal Engine version: `4.27`, `5.0`, `5.1`, `5.2`, `5.3`, `5.4`, `5.5`"; the latest commit touches 5.6+ warnings but the README has not been updated to claim 5.6
- C++ only: windows are drawn with ImGui calls from C++ code; there is no Blueprint authoring
- Install by cloning into `YourProject/Plugins`; a docking variant of Dear ImGui is on the `docking` branch, and the fork's README notes its NetImGui branch is not up to date with the fork's changes
- Alternative: [VesCodes/ImGui](https://github.com/VesCodes/ImGui) is a separate MIT plugin (not a fork) with docking, multi-viewports, editor and per-PIE contexts and NetImGui remote drawing, last pushed 2026-05-22; its README states no general engine version range, only that Slate-application use before UE 5.4 needs an engine patch
- Debug tooling: strip or compile out ImGui in shipping builds if players should not reach it
- MIT is compatible with the Unreal Engine EULA, which forbids combining engine code with copyleft licences such as GPL and LGPL; keep the copyright notices (plugin, Dear ImGui, ImPlot) in your third-party credits
- Maintenance: GitHub API (2026-10-13) reports IDI-Systems/UnrealImGui not archived, last push 2026-02-10; segross/UnrealImGui not archived, last push 2024-07-22

## Evidence

- `LICENSE` in IDI-Systems/UnrealImGui, `master` branch (2026-10-13): "The MIT License (MIT) Copyright (c) 2017-2021 Sebastian Gross Copyright (c) 2025 International Development and Integration Systems LLC (IDI-Systems)"
- Same file (2026-10-13): "to deal in the Software without restriction"
- `README.md` in IDI-Systems/UnrealImGui (2026-10-13): "Supported Unreal Engine version: `4.27`, `5.0`, `5.1`, `5.2`, `5.3`, `5.4`, `5.5`"
- `LICENSE` in segross/UnrealImGui, `master` branch (2026-10-13): "The MIT License (MIT) Copyright (c) 2017-2021 Sebastian Gross"

## Related

- [ue5coro](ue5coro.md)
- [gas-documentation](gas-documentation.md)
- [dlgsystem](dlgsystem.md)

# Godot-oriented free stack (from research)

Synthesized from local research on Godot 4 physics / destruction pipelines. Focus: **free or CC0 assets + free Godot tooling**. Not a full game production plan.

## Assets (free / CC0 first)

| Need | Catalog entry | Notes |
| --- | --- | --- |
| Industrial / tech props | [Kenney](../catalog/3d/kenney.md) | Space Kit + Industrial Kit work well for server racks, pipes, consoles, flat-shaded looks |
| Modular low-poly / characters | [Quaternius](../catalog/3d/quaternius.md), [KayKit](../catalog/3d/kaykit.md) | Prototyping and stylized kits |
| PBR surfaces | [ambientCG](../catalog/3d/ambientcg.md) | Seamless materials |
| HDRI / IBL | [Poly Haven](../catalog/environment/poly-haven.md) | CC0 calibrated environments |
| Oceans / water | [Boujie Water](../catalog/shaders-vfx/boujie-water.md) | MIT Godot ocean shader |
| Pro SFX (free annual dumps) | [Sonniss #GameAudioGDC](../catalog/audio/sonniss-gdc.md) | Commercial OK; no AI/ML training; no standalone resale |
| Granular tech foley | [Freesound](../catalog/audio/freesound.md) | **Filter CC0 only** (fans, HDD whir, sparks, etc.) |
| Music (with credit) | [Incompetech](../catalog/audio/incompetech.md) | CC-BY — avoid ND tracks elsewhere |

Paid Sonniss impact packs can fill metal/glass destruction gaps on a small budget — they are **not** catalogued here as free.

## Godot 4 add-ons (free)

| Need | Catalog entry |
| --- | --- |
| Cinematic camera / shake | [Phantom Camera](../catalog/tools/phantom-camera.md) (MIT) |
| Remappable input (Deck-friendly) | [G.U.I.D.E.](../catalog/tools/godot-guide.md) (MIT) |
| Device swap / rumble helpers | [Input Helper](../catalog/tools/godot-input-helper.md) (MIT) |
| Dialogue / timeline UI | [Dialogic](../catalog/tools/dialogic.md) (MIT) |
| Steamworks bindings | [GodotSteam](../catalog/tools/godotsteam.md) (verify license + Steamworks) |
| Mod loading | [Godot Mod Loader](../catalog/tools/godot-mod-loader.md) (MIT) |

Godot **4.4+** ships **Jolt Physics** as a built-in option — prefer the engine docs over third-party mirrors when configuring.

## Art pipeline tips (Blender → Godot)

- Export **glTF**; keep collision-friendly meshes (convex pieces / primitives) separate from render meshes where possible.
- Blender **Cell Fracture** (and similar) for pre-baked debris — keep fragment counts modest for runtime physics (visual grit via particles).
- Prefer trusted CC0 kits over anonymous “destructible mega packs.”

## Hygiene

See [`licenses.md`](licenses.md) and [`provenance.md`](provenance.md). Track source URL + license + download date for every pack that ships in a commercial build.

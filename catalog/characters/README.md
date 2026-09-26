# Characters — generators and finished packs

One folder. `subcategories` tells the two jobs apart: `generator` for tools that emit a mesh, `library` / `rigged` / `creatures` / `vrm` for packs you download ready to retarget. See [`docs/provenance.md`](../../docs/provenance.md).

## Choosing a rigged character source

Sort by licence first: it decides whether you owe a credit line, and in this category it
varies more than anywhere else. Then by whether the rig is ready for an engine at all.
Figures marked *measured* came from opening the files on 2026-09-23.

| If you need | Take | Licence | What you get |
| --- | --- | --- | --- |
| A stylised party with motion already on it | [kaykit-adventurers](kaykit-adventurers.md) | **CC0** | *Measured:* 5 characters, **76 animations**, about 6,500 triangles, 41-joint rig shared with [kaykit-skeletons](kaykit-skeletons.md), hand-slot bones for weapons, **no finger bones** |
| Mix-and-match humanoids and outfits | [quaternius-universal-base-characters](quaternius-universal-base-characters.md) with [outfits](quaternius-modular-character-outfits-fantasy.md) | **CC0** | Six bases built for engine retargeting. *Measured on a separate Quaternius base character:* 53-joint Rigify rig with full fingers, 45 animations, about 13,700 triangles |
| Realistic humans, crowds, VR, faces | [microsoft-rocketbox](microsoft-rocketbox.md) | MIT, keep the notice | 115 avatars, four LODs each, 417 animations, and the only facial blendshapes here (FACS and ARKit). FBX with Unity-first tooling |
| A placeholder while art is unfinished | [gdquest-3d-mannequin](gdquest-3d-mannequin.md) | CC-BY-4.0, **credit required** | *Measured:* 45-joint rig with Unreal-mannequin-style bone names, 10 animations, a Godot third-person controller alongside |
| Avatars that move between apps | [osa-100avatars](osa-100avatars.md) | **CC0** | VRM, whose humanoid bone map is part of the format, so VRM-aware importers map it for you |
| To generate your own | [mpfb](mpfb.md) or [makehuman](makehuman.md) | **CC0** exports | Generators, not packs. The app code is GPL or AGPL; what you export is CC0 |
| A PS1-style stand-in, fast | [barnabe-wild-lowpoly-rigged](barnabe-wild-lowpoly-rigged.md) | **CC0** | One low-poly humanoid with IK helpers |
| First-person arms for a shooter | [oga-fps-arms-rigged](oga-fps-arms-rigged.md) | **CC0** | *Measured:* arms only, full finger bones and IK hand controls. A 2015 "crude first attempt", FBX and `.blend`, **no animations**: you animate it |
| A film-quality hero to study or render | Blender Studio: [rain](blender-studio-rain.md), [one](blender-studio-one.md), [critters](blender-studio-critter.md) | CC-BY-4.0, **credit required** | Production rigs, `.blend` only. The Singularity rigs (One, the Critters) need Blender 5.0+ and a login; Rain is a direct download. **Not engine-ready**: expect to bake and export yourself |

**Animations do not move between publishers for free.** Three different skeletons turned
up in three sources: KayKit's own short names (`hips`, `upperarm.l`), Rigify deform bones
on the Quaternius model (`DEF-spine.001`), and Unreal-mannequin names on GDQuest's
(`pelvis`, `thigh.l`, `spine_01`). Godot 4's import retargeting (a `BoneMap` against the
humanoid profile) and Unity's Humanoid avatar both bridge these, but it is a setup step,
not drag and drop. Retarget finger animation onto KayKit and it is lost, because those
rigs have no finger bones.

**The attribution trap in this folder:** the Blender Studio rigs and the GDQuest mannequin
are the CC-BY-4.0 entries. Everything else in the table owes no credit line, except
Rocketbox, whose MIT licence requires the copyright notice to ship with your build.

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [blender-human-base-meshes](blender-human-base-meshes.md) | Blender Studio base meshes | CC0 | yes | active |
| [blender-studio-rain](blender-studio-rain.md) | Blender Studio Rain | CC-BY-4.0 | yes | active |
| [blender-studio-critter](blender-studio-critter.md) | Blender Studio Critter | CC-BY-4.0 | yes | active |
| [blender-studio-one](blender-studio-one.md) | Blender Studio One | CC-BY-4.0 | yes | active |
| [blender-studio-critter-evolved](blender-studio-critter-evolved.md) | Blender Studio Critter Evolved | CC-BY-4.0 | yes | active |
| [blender-studio-space-creatures](blender-studio-space-creatures.md) | Blender Studio Space Creatures | CC-BY-4.0 | yes | active |
| [microsoft-rocketbox](microsoft-rocketbox.md) | Microsoft Rocketbox | MIT | yes | active |
| [osa-100avatars](osa-100avatars.md) | Open Source Avatars (100Avatars) | CC0 | yes | active |
| [gdquest-3d-mannequin](gdquest-3d-mannequin.md) | GDQuest 3D Mannequin | CC-BY-4.0 | yes | active |
| [barnabe-wild-lowpoly-rigged](barnabe-wild-lowpoly-rigged.md) | Barnabe Wild low-poly rigged | CC0 | yes | active |
| [quaternius-universal-base-characters](quaternius-universal-base-characters.md) | Quaternius Universal Base Characters | CC0 | yes | active |
| [quaternius-modular-character-outfits-fantasy](quaternius-modular-character-outfits-fantasy.md) | Quaternius Modular Outfits (Fantasy) | CC0 | yes | active |
| [quaternius-ultimate-monsters](quaternius-ultimate-monsters.md) | Quaternius Ultimate Monsters | CC0 | yes | active |
| [kaykit-adventurers](kaykit-adventurers.md) | KayKit Adventurers | CC0 | yes | active |
| [kaykit-skeletons](kaykit-skeletons.md) | KayKit Skeletons | CC0 | yes | active |
| [quaternius-farm-animal-pack](quaternius-farm-animal-pack.md) | Quaternius Farm Animals | CC0 | yes | active |
| [quaternius-animated-fish-pack](quaternius-animated-fish-pack.md) | Quaternius Animated Fish | CC0 | yes | active |
| [quaternius-cube-world-kit](quaternius-cube-world-kit.md) | Quaternius Cube World Kit | CC0 | yes | active |
| [quaternius-sci-fi-essentials-kit](quaternius-sci-fi-essentials-kit.md) | Quaternius Sci-Fi Essentials | CC0 | yes | active |
| [quaternius-animated-mech-pack](quaternius-animated-mech-pack.md) | Quaternius Animated Mech | CC0 | yes | active |
| [quaternius-toon-shooter-game-kit](quaternius-toon-shooter-game-kit.md) | Quaternius Toon Shooter Kit | CC0 | yes | active |
| [quaternius-rpg-character-pack](quaternius-rpg-character-pack.md) | Quaternius RPG Characters | CC0 | yes | active |
| [mpfb](mpfb.md) | MPFB (MakeHuman for Blender) | CC0* | yes | active |
| [makehuman](makehuman.md) | MakeHuman | CC0 | yes | active |
| [oga-fps-arms-rigged](oga-fps-arms-rigged.md) | FPS Arms, rigged (OpenGameArt) | CC0 | yes | active |
| [charmorph](charmorph.md) | CharMorph | varies (AGPL/`mb_*`) | unknown | needs-review |
| [vroid-studio](vroid-studio.md) | VRoid Studio | custom | yes | active |
| [kenney-animated-characters](kenney-animated-characters.md) | Kenney Animated Characters | CC0 | yes | active |

\* MPFB/MakeHuman: **core exports/assets CC0**; app/addon code AGPL/GPL. Avoid **MB-Lab** and CharMorph **`mb_*`** AGPL bases — [`docs/high-risk.md`](../../docs/high-risk.md).

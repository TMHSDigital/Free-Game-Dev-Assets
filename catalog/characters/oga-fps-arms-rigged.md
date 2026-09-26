---
id: oga-fps-arms-rigged
name: FPS Arms, rigged (OpenGameArt)
url: https://opengameart.org/content/fps-arms-rigged-only
category: characters
subcategories: [rigged, first-person]
license: CC0
license_spdx: CC0-1.0
commercial: true
attribution_required: false
formats: [FBX, Blend]
tags: [first-person, fps, arms, ik, fingers, opengameart]
verified: 2026-09-23
status: active
---

# FPS Arms, rigged (OpenGameArt)

A pair of first-person arms with a full hand rig, released as CC0 by the OpenGameArt user para in 2015. This is the catalog's only rigged first-person arms source: every other rigged character here is a full body seen from outside, and the one CC0 "rifle and hands" set checked alongside it turned out to be a rifle with static hands on a single recoil bone.

## Notes

- **Rig, measured 2026-09-23 from the FBX:** clavicle, deltoid, upper arm, forearm and hand on each side; three-segment index, middle, ring, pinky and thumb on both hands; and `hand.L.control` / `hand.R.control` handles for IK posing
- **No production animation.** The plain FBX has no animation curves. A separate "test anim" file carries 154 animation curves across three stacks, which is a rig test rather than a reload or idle set. You will animate this yourself
- The author calls it "a crude first attempt", and it is: treat it as a working rig to animate and restyle, not finished art
- FBX and `.blend` only, no glTF. Import the FBX into Blender and export glTF for Godot, which also lets you check the IK before it reaches the engine
- One skin mesh, named `caucasian_male_1`. That naming resembles MakeHuman's; if the arms were cut from a MakeHuman export, that base is CC0 as well (see [makehuman](makehuman.md)), but the page does not say
- OpenGameArt is a host, and the CC0 is the submitter's declaration. See [`docs/provenance.md`](../../docs/provenance.md)
- Needs something to hold: [3dmodelscc0-guns](../3d/3dmodelscc0-guns.md) and [3dmodelscc0-melee-weapons](../3d/3dmodelscc0-melee-weapons.md) are CC0 weapon meshes

## Evidence

- Live OpenGameArt submission (2026-09-23): "License(s): CC0", submitted by para on Wednesday, March 18, 2015
- Same page (2026-09-23): "There's kind of a lack of 3d arms for a first person view on OGA ... As of yet it's only rigged"

## Related

- [kaykit-adventurers](kaykit-adventurers.md)
- [quaternius-toon-shooter-game-kit](quaternius-toon-shooter-game-kit.md)
- [../3d/3dmodelscc0-guns](../3d/3dmodelscc0-guns.md)
- [makehuman](makehuman.md)

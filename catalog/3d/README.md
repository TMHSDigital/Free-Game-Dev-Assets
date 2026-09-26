# 3D — models, textures, environments

## Choosing a PBR texture source

Seven texture libraries are listed and all seven market themselves as free PBR.
They are not equally free, and that is the first thing to sort by.

| If you need | Take | Licence |
| --- | --- | --- |
| A default first stop | [ambientcg](ambientcg.md): 1500+ seamless materials, no strings | **CC0** |
| The other safe default | [poly-haven](../environment/poly-haven.md): also HDRIs and models | **CC0** |
| Photoscanned surfaces ambientCG lacks | [cgbookcase](cgbookcase.md): 566 sets, 4K/8K, plus decals | **CC0** |
| Parameters you can tweak | [texturecan](texturecan.md): ships **SBSAR sources**, not just fixed maps | **CC0** |
| Extra seamless coverage | [threedtextures-me](threedtextures-me.md): aimed at Blender, Unreal, Unity and Godot | **CC0** |
| Unique photo detail | [texture-ninja](texture-ninja.md): you do the tiling cleanup; not seamless out of the box | **CC0** |
| To read the terms first | [sharetextures](sharetextures.md): a "Custom CC0" that **bans redistribution** on other sites, in plugins, or in collections | custom |
| To read the terms first | [freepbr](freepbr.md): free for games, but the About page is the grant, not the CC0 badge you might assume | custom |

The split that matters: the first six are real CC0 and you can redistribute the maps
inside an asset pack. The last two are custom grants that permit shipping a game but
restrict passing the textures on. If you are assembling something others will
redistribute, stay in the CC0 block.

Two more caveats recorded on the entries themselves: texturecan's site footer still
says "All rights reserved" while its terms page is the actual grant, and texture-ninja
keeps its licence string inside a JS bundle rather than in static HTML.

## Choosing between Kenney, KayKit and Quaternius

Three publishers hold 80 of this catalog's entries, all CC0, all "low-poly", and they
are not interchangeable. These numbers were measured on 2026-09-23 by opening the files,
not taken from the store pages: every GLB in Kenney's Modular Dungeon and Nature kits
(368 models), every model in KayKit's Dungeon Remastered and Adventurers packs (235),
and eight Quaternius models.

| | Kenney | KayKit | Quaternius |
| --- | --- | --- | --- |
| **Triangle budget** | Lowest. Nature trees median 166, rocks 52 | Low. Dungeon pieces median 257 | Highest. Trees around 3,600; the base character 13,700 |
| **Texturing** | Flat material colours (Nature) or one shared `colormap.png` (Modular Dungeon) | One gradient atlas across all 203 Dungeon models; one texture per character in Adventurers | Mostly one shared texture per model |
| **Rigged characters** | None among the catalogued 3D kits: they are environments, props and vehicles | Yes. Five adventurers, **76 animations** each, about 6,500 triangles | Yes. Base character with 45 animations |
| **Scale** | **Varies by kit.** Nature trees 1.3 m, Dungeon walls 4.2 m | Dungeon walls 4.0 m | Trees 7 to 10 m |
| **Typical file** | Tiny: 7 KB median (Nature) | Small: 33 KB median (Dungeon) | Large: about 2 MB per model |
| **Delivery** | Direct zip: GLB, FBX, OBJ, plus DAE and STL in some kits | Official GitHub repos laid out as **Godot addons** | quaternius.com routes to itch; a paid Source tier sits beside the free one |

**How to choose:**

- **Blockout, prototypes, mobile or web**: Kenney. Nothing here is lighter, and the
  flat-colour kits recolour with a material edit.
- **A consistent stylised game with characters that already move**: KayKit. The shared
  atlas keeps environment draw calls and style coherent, and the adventurers ship with 76
  clips. If you build in Godot, the repos drop straight into `addons/`.
- **Finished-looking scenes, especially nature**: Quaternius. Roughly twenty times the
  triangles of Kenney's equivalents, and realistic metric scale.

**Mixing them.** KayKit and Kenney's Modular Dungeon walls are within 5% of each other
(4.0 m and 4.2 m), so those two combine cleanly. Kenney's Nature Kit does not combine
with anything at its native scale; see its entry. Across publishers, the triangle-density
gap reads as a style clash well before it becomes a performance problem.

The Quaternius figures come from eight models the author uploaded to
[Poly Pizza](poly-pizza.md). The pack archive is served through itch, which would not hand
over a download outside a browser session. Treat those numbers as indicative rather
than pack-wide. Triangle counts are geometry and survive re-hosting; file sizes may not.

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [kenney](kenney.md) | Kenney | CC0 | yes | active |
| [kenney-car-kit](kenney-car-kit.md) | Kenney Car Kit | CC0 | yes | active |
| [ggbotnet-psx-cars](ggbotnet-psx-cars.md) | GGBotNet PSX Style Cars | CC0 | yes | active |
| [3dmodelscc0-melee-weapons](3dmodelscc0-melee-weapons.md) | 3dmodelscc0 Melee Weapons | CC0 | yes | active |
| [3dmodelscc0-city](3dmodelscc0-city.md) | 3dmodelscc0 City Environment | CC0 | yes | active |
| [3dmodelscc0-guns](3dmodelscc0-guns.md) | 3dmodelscc0 Guns and Explosives | CC0 | yes | active |
| [kenney-nature-kit](kenney-nature-kit.md) | Kenney Nature Kit | CC0 | yes | active |
| [kenney-furniture-kit](kenney-furniture-kit.md) | Kenney Furniture Kit | CC0 | yes | active |
| [kenney-city-kit-roads](kenney-city-kit-roads.md) | Kenney City Kit (Roads) | CC0 | yes | active |
| [kenney-city-kit-commercial](kenney-city-kit-commercial.md) | Kenney City Kit (Commercial) | CC0 | yes | active |
| [kenney-city-kit-suburban](kenney-city-kit-suburban.md) | Kenney City Kit (Suburban) | CC0 | yes | active |
| [kenney-city-kit-industrial](kenney-city-kit-industrial.md) | Kenney City Kit (Industrial) | CC0 | yes | active |
| [kenney-factory-kit](kenney-factory-kit.md) | Kenney Factory Kit | CC0 | yes | active |
| [kenney-food-kit](kenney-food-kit.md) | Kenney Food Kit | CC0 | yes | active |
| [kenney-graveyard-kit](kenney-graveyard-kit.md) | Kenney Graveyard Kit | CC0 | yes | active |
| [kenney-fantasy-town-kit](kenney-fantasy-town-kit.md) | Kenney Fantasy Town Kit | CC0 | yes | active |
| [kenney-modular-space-kit](kenney-modular-space-kit.md) | Kenney Modular Space Kit | CC0 | yes | active |
| [kenney-train-kit](kenney-train-kit.md) | Kenney Train Kit | CC0 | yes | active |
| [quaternius](quaternius.md) | Quaternius | CC0 | yes | active |
| [quaternius-stylized-nature-megakit](quaternius-stylized-nature-megakit.md) | Quaternius Stylized Nature MegaKit | CC0 | yes | active |
| [quaternius-fantasy-props-megakit](quaternius-fantasy-props-megakit.md) | Quaternius Fantasy Props MegaKit | CC0 | yes | active |
| [quaternius-downtown-city-megakit](quaternius-downtown-city-megakit.md) | Quaternius Downtown City MegaKit | CC0 | yes | active |
| [quaternius-sushi-restaurant-kit](quaternius-sushi-restaurant-kit.md) | Quaternius Sushi Restaurant Kit | CC0 | yes | active |
| [quaternius-medieval-village-megakit](quaternius-medieval-village-megakit.md) | Quaternius Medieval Village MegaKit | CC0 | yes | active |
| [kenney-pirate-kit](kenney-pirate-kit.md) | Kenney Pirate Kit | CC0 | yes | active |
| [kenney-modular-dungeon-kit](kenney-modular-dungeon-kit.md) | Kenney Modular Dungeon Kit | CC0 | yes | active |
| [kenney-modular-cave-kit](kenney-modular-cave-kit.md) | Kenney Modular Cave Kit | CC0 | yes | active |
| [kenney-mini-forest](kenney-mini-forest.md) | Kenney Mini Forest | CC0 | yes | active |
| [kenney-mini-skate](kenney-mini-skate.md) | Kenney Mini Skate | CC0 | yes | active |
| [kenney-mini-dungeon](kenney-mini-dungeon.md) | Kenney Mini Dungeon | CC0 | yes | active |
| [kenney-mini-arena](kenney-mini-arena.md) | Kenney Mini Arena | CC0 | yes | active |
| [kenney-platformer-kit](kenney-platformer-kit.md) | Kenney Platformer Kit | CC0 | yes | active |
| [kenney-castle-kit](kenney-castle-kit.md) | Kenney Castle Kit | CC0 | yes | active |
| [kenney-tower-defense-kit](kenney-tower-defense-kit.md) | Kenney Tower Defense Kit | CC0 | yes | active |
| [kenney-retro-fantasy-kit](kenney-retro-fantasy-kit.md) | Kenney Retro Fantasy Kit | CC0 | yes | active |
| [kenney-retro-urban-kit](kenney-retro-urban-kit.md) | Kenney Retro Urban Kit | CC0 | yes | active |
| [kenney-racing-kit](kenney-racing-kit.md) | Kenney Racing Kit | CC0 | yes | active |
| [kenney-watercraft-kit](kenney-watercraft-kit.md) | Kenney Watercraft Kit | CC0 | yes | active |
| [quaternius-modular-sci-fi-megakit](quaternius-modular-sci-fi-megakit.md) | Quaternius Modular Sci-Fi Megakit | CC0 | yes | active |
| [quaternius-ultimate-space-kit](quaternius-ultimate-space-kit.md) | Quaternius Ultimate Space Kit | CC0 | yes | active |
| [quaternius-zombie-apocalypse-kit](quaternius-zombie-apocalypse-kit.md) | Quaternius Zombie Apocalypse Kit | CC0 | yes | active |
| [quaternius-cyberpunk-game-kit](quaternius-cyberpunk-game-kit.md) | Quaternius Cyberpunk Game Kit | CC0 | yes | active |
| [quaternius-pirate-kit](quaternius-pirate-kit.md) | Quaternius Pirate Kit | CC0 | yes | active |
| [kaykit-restaurant-bits](kaykit-restaurant-bits.md) | KayKit Restaurant Bits | CC0 | yes | active |
| [kaykit-dungeon-pack](kaykit-dungeon-pack.md) | KayKit Dungeon Pack | CC0 | yes | active |
| [kaykit-platformer](kaykit-platformer.md) | KayKit Platformer Pack | CC0 | yes | active |
| [kaykit-halloween-bits](kaykit-halloween-bits.md) | KayKit Halloween Bits | CC0 | yes | active |
| [kaykit-holiday-bits](kaykit-holiday-bits.md) | KayKit Holiday Bits | CC0 | yes | active |
| [kaykit-block-bits](kaykit-block-bits.md) | KayKit Block Bits | CC0 | yes | active |
| [kaykit](kaykit.md) | KayKit | CC0 | yes | active |
| [kaykit-prototype-bits](kaykit-prototype-bits.md) | KayKit Prototype Bits | CC0 | yes | active |
| [kaykit-resource-bits](kaykit-resource-bits.md) | KayKit Resource Bits | CC0 | yes | active |
| [kaykit-furniture-bits](kaykit-furniture-bits.md) | KayKit Furniture Bits | CC0 | yes | active |
| [the-base-mesh](the-base-mesh.md) | The Base Mesh | CC0 | yes | active |
| [ambientcg](ambientcg.md) | ambientCG | CC0 | yes | active |
| [texturecan](texturecan.md) | TextureCan | CC0 | yes | active |
| [texture-ninja](texture-ninja.md) | Texture Ninja | CC0 | yes | active |
| [cgbookcase](cgbookcase.md) | cgbookcase | CC0 | yes | active |
| [sharetextures](sharetextures.md) | ShareTextures | custom | yes | active |
| [threedtextures-me](threedtextures-me.md) | 3DTextures.me | CC0 | yes | active |
| [freepbr](freepbr.md) | FreePBR | custom | no | active |
| [scan-the-world](scan-the-world.md) | Scan the World | unknown | no (platform terms) | needs-review |
| [blenderkit](blenderkit.md) | Blendkit | varies | varies | active |
| [magicavoxel](magicavoxel.md) | MagicaVoxel | custom | yes | active |
| [smithsonian-open-access](smithsonian-open-access.md) | Smithsonian Open Access | CC0 | yes | active |
| [charge-materials](charge-materials.md) | Charge materials | CC-BY? | unknown | needs-review |
| [fab-megascans-standard](fab-megascans-standard.md) | Fab/Quixel (Standard) | custom | unknown* | needs-review |
| [poly-pizza](poly-pizza.md) | Poly Pizza | varies | unknown | needs-review |
| [sketchfab](sketchfab.md) | Sketchfab | varies | unknown | needs-review |
| [nasa-3d-resources](nasa-3d-resources.md) | NASA 3D Resources | public-domain* | yes* | active |

\* Fab Standard vs Epic Content License — verify per asset; Fab/Epic license pages unreachable this harden pass. Poly Haven models are under [`environment/poly-haven`](../environment/poly-haven.md) (CC0).

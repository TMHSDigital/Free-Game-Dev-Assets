# Tools — asset creation & pipeline

These are editors/utilities and free engine add-ons, not asset packs. Tool license ≠ license of art you create with them.

## Choosing between near-duplicates

Several pairs and clusters below do the same job. What separates them:

| If you want | Take | Over | Because |
| --- | --- | --- | --- |
| A retro SFX in ten seconds | [jsfxr](jsfxr.md) | sfxr, bfxr | Browser, nothing to install, and the permalink encodes the full parameter set so a sound is reproducible from a URL in a design doc |
| Control over the synthesis | [chiptone](chiptone.md) | jsfxr | Deepest editor of the four, still browser-based and CC0 |
| The original desktop tool | [sfxr](sfxr.md) | bfxr | Reference implementation; [bfxr](bfxr.md) adds mixing and more waveforms if you need them |
| A pixel editor under active development | [pixelorama](pixelorama.md) | libresprite | Godot-based, still shipping releases |
| Aseprite muscle memory | [libresprite](libresprite.md) | pixelorama | Fork of Aseprite from before it went proprietary, so the UX matches; development is slower |
| A mature tilemap editor | [tiled](tiled.md) | ldtk | Ortho, isometric and hex; the widest engine loader support. Note the editor is GPL, `libtiled` is BSD-2-Clause |
| Modern level-design UX | [ldtk](ldtk.md) | tiled | MIT throughout, auto-layers and entity definitions, no GPL question at all |
| An audio editor without telemetry history | [tenacity](tenacity.md) | audacity | Community fork made over exactly that objection |
| The mainstream audio editor | [audacity](audacity.md) | tenacity | Larger plugin and tutorial ecosystem |
| Photogrammetry with a GUI | [meshroom](meshroom.md) | colmap | Node graph you can watch; needs CUDA for the dense stage |
| Photogrammetry you can script | [colmap](colmap.md) | meshroom | The SfM reference, CLI-first, more control at every step |
| Interactive retopology | [instant-meshes](instant-meshes.md) | quadriflow | You paint the orientation field and watch the quads follow |
| Batch retopology | [quadriflow](quadriflow.md) | instant-meshes | Runs unattended, which is what you want in a pipeline step |

Not interchangeable despite the names: [proton-scatter](proton-scatter.md) is 3D scattering
along curves and surfaces, [scatter2d](scatter2d.md) is 2D. The four colourblindness tools
each cover a different stage: [color-oracle](color-oracle.md) simulates full-screen on
desktop, [sim-daltonism](sim-daltonism.md) is a live lens on macOS and iOS,
[daltonlens](daltonlens.md) implements the more accurate models for analysis, and
[ubisoft-chroma](ubisoft-chroma.md) is built to run over captured game footage.

## Editors & creation

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [blender](blender.md) | Blender | GPL-2.0-or-later | active |
| [blockbench](blockbench.md) | Blockbench | GPL-3.0 | active |
| [ldtk](ldtk.md) | LDtk | MIT | active |
| [tiled](tiled.md) | Tiled Map Editor | GPL-2.0-or-later | active |
| [pixelorama](pixelorama.md) | Pixelorama | MIT | active |
| [material-maker](material-maker.md) | Material Maker | MIT | active |
| [gaea](gaea.md) | Gaea Community Edition | custom | needs-review |
| [accurig](accurig.md) | AccuRig (Reallusion) | custom | needs-review |
| [krita](krita.md) | Krita | GPL-3.0 | active |
| [inkscape](inkscape.md) | Inkscape | GPL-3.0-or-later | active |
| [tenacity](tenacity.md) | Tenacity | GPL-2.0-or-later | active |
| [jsfxr](jsfxr.md) | jsfxr | Unlicense | active |
| [chiptone](chiptone.md) | ChipTone | CC0 | active |
| [gimp](gimp.md) | GIMP | GPL-3.0-or-later | active |
| [libresprite](libresprite.md) | LibreSprite | GPL-2.0 | active |
| [goxel](goxel.md) | Goxel | GPL-3.0-or-later | active |
| [materialize](materialize.md) | Materialize | GPL-3.0 | active |
| [lmms](lmms.md) | LMMS | GPL-2.0-or-later | active |
| [bfxr](bfxr.md) | Bfxr | MIT | active |
| [sfxr](sfxr.md) | sfxr | MIT | active |
| [audacity](audacity.md) | Audacity | GPL-3.0 | active |
| [blender-cell-fracture](blender-cell-fracture.md) | Cell Fracture (Blender extension) | GPL-3.0-or-later | active |
| [godot-engine](godot-engine.md) | Godot Engine | MIT | active |
| [trenchbroom](trenchbroom.md) | TrenchBroom | GPL-3.0-or-later | active |
| [ogmo-editor](ogmo-editor.md) | Ogmo Editor 3 | MIT | active |
| [beepbox](beepbox.md) | BeepBox | MIT | active |
| [bosca-ceoil-blue](bosca-ceoil-blue.md) | Bosca Ceoil Blue | MIT | active |
| [furnace](furnace.md) | Furnace | GPL-2.0-or-later | active |
| [openmpt](openmpt.md) | OpenMPT | BSD-3-Clause | active |
| [synfig](synfig.md) | Synfig Studio | GPL-3.0 | active |
| [opentoonz](opentoonz.md) | OpenToonz | BSD-3-Clause | active |
| [pencil2d](pencil2d.md) | Pencil2D | GPL-2.0-only | active |

## Pipeline & compression

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [gltf-transform](gltf-transform.md) | glTF Transform | MIT | active |
| [basis-universal](basis-universal.md) | Basis Universal | Apache-2.0 | active |
| [ktx-software](ktx-software.md) | KTX-Software | Apache-2.0 | active |
| [meshoptimizer](meshoptimizer.md) | meshoptimizer | MIT | active |
| [google-draco](google-draco.md) | Google Draco | Apache-2.0 | active |
| [assimp](assimp.md) | assimp | BSD-3-Clause | active |
| [free-tex-packer](free-tex-packer.md) | Free Tex Packer | MIT | active |
| [osm2world](osm2world.md) | OSM2World | MIT | active |
| [instant-meshes](instant-meshes.md) | Instant Meshes | BSD-3-Clause | active |
| [quadriflow](quadriflow.md) | QuadriFlow | BSD-3-Clause | active |
| [meshroom](meshroom.md) | Meshroom | MPL-2.0 | active |
| [colmap](colmap.md) | COLMAP | BSD-3-Clause | active |
| [meshlab](meshlab.md) | MeshLab | GPL-3.0 | active |
| [cloudcompare](cloudcompare.md) | CloudCompare | GPL-2.0-or-later | active |
| [xnormal](xnormal.md) | xNormal | custom | needs-review |

## Audio middleware

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [fmod-studio](fmod-studio.md) | FMOD Studio | custom | active |
| [wwise](wwise.md) | Wwise Indie | custom | needs-review |

## Accessibility & localization

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [ubisoft-chroma](ubisoft-chroma.md) | Ubisoft Chroma | Apache-2.0 | active |
| [sim-daltonism](sim-daltonism.md) | Sim Daltonism | Apache-2.0 | active |
| [daltonlens](daltonlens.md) | DaltonLens | BSD-2-Clause | active |
| [color-oracle](color-oracle.md) | Color Oracle | MIT | active |
| [polyglot-gamedev](polyglot-gamedev.md) | Polyglot Gamedev | CC0 | active |

## Speech / TTS (local)

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [kokoro-82m](kokoro-82m.md) | Kokoro-82M | Apache-2.0 | active |
| [sherpa-onnx](sherpa-onnx.md) | sherpa-onnx | Apache-2.0 | active |
| [melotts](melotts.md) | MeloTTS | MIT | active |
| [piper-plus](piper-plus.md) | Piper Plus | MIT | active |
| [espeak-ng](espeak-ng.md) | eSpeak NG | GPL-3.0-or-later | active |

## Godot 4 add-ons

For an add-on, the licence is rarely the question. Whether it still builds against your
engine version is. Maintenance was read from each repository on 2026-09-23.

| Job | Take | Godot | Latest release | Last commit |
| --- | --- | --- | --- | --- |
| Enemy and NPC logic, trees only | [beehave](beehave.md) | 4.x | v2.9.3, 2026-08 | 2026-09 |
| Trees **plus** state machines, with a debugger | [limboai](limboai.md) | 4.x, GDExtension | v1.8.1, 2026-08 | 2026-09 |
| Cameras: follow, blend, shake | [phantom-camera](phantom-camera.md) | 4.x | v0.11.0.3, 2026-07 | 2026-09 |
| Large terrain from heightmaps | [terrain3d](terrain3d.md) | 4.x, GDExtension | v1.0.2, 2026-05 | 2026-09 |
| Dialogue and timelines | [dialogic](dialogic.md) | **4.5 or newer** | **2.0 alpha 20**, 2026-07 | 2026-08 |
| Input remapping and profiles | [godot-guide](godot-guide.md) | 4.x | v0.14.0, 2026-07 (pre-1.0) | 2026-08 |
| Device detection and prompts, small | [godot-input-helper](godot-input-helper.md) | 4.x | v4.7.0, 2025-06 | **2025-06** |
| 3D props and foliage | [proton-scatter](proton-scatter.md) | 4.x | 4.0, **2023-10** | 2026-07 |
| 2D props and foliage | [scatter2d](scatter2d.md) | 4.x | v1.4.1, 2026-01 | 2026-01 |
| Textured 2D terrain edges | [smartshape2d](smartshape2d.md) | 4.x | 3.3.2, 2026-08 | 2026-08 |
| Mod support | [godot-mod-loader](godot-mod-loader.md) | 4.x on `4.x-dev` | v7.0.1, 2025-06 | 2026-08 |
| Steamworks | [godotsteam](godotsteam.md) | 4.x | v4.22.1, 2026-09 | **moved to Codeberg** |
| Creature mesh-deform animation | [creature-2d-runtimes](creature-2d-runtimes.md) | **3 only** | none | **2020-06** |
| Fracture a mesh into debris, inside Godot | [voronoishatter](voronoishatter.md) | 4.4+ (inferred) | v0.3, 2026-06 (pre-1.0) | 2026-06 |
| Swap in pieces pre-broken in Blender | [godot-destruction-plugin](godot-destruction-plugin.md) | 4.x | v7.2, 2024-06 | **2024-06** |
| Voxel destruction for MagicaVoxel models | [godot-voxel-destruction](godot-voxel-destruction.md) | 4.1+ | v1.2.0, 2026-08 | 2026-09 |

Read the bold cells before depending on one:

- **Dialogic 2 is still alpha** and needs Godot 4.5. Plan for breaking changes.
- **ProtonScatter's last release is from 2023**, but `main` is maintained. Install from
  the branch, not the release.
- **Input Helper** has had no commit in fifteen months. It is small enough that this may
  simply mean finished, but check it against your engine version.
- **GodotSteam** archived its GitHub repository and moved to Codeberg; the project itself
  is active.
- **Creature 2D Runtimes** is a Godot 3 runtime last touched in 2020. It is in this list
  for completeness, not because it runs in Godot 4.
- **Godot Destruction Plugin** has had no commit since its 2024 release, and its README
  says it is "only tested in very small scenes".

Debris and rubble: the catalog has no pack of pre-broken meshes, because making them from
your own models is the normal route. Fracture in Blender with
[blender-cell-fracture](blender-cell-fracture.md) and swap the pieces in at runtime with
the Destruction Plugin, or do both steps inside Godot with VoronoiShatter. If your art is
voxels, Voxel Destruction removes voxels directly and needs no pre-broken pieces.

Beehave or LimboAI: both are maintained. Take Beehave if trees alone are enough and you
want an addon written in GDScript you can read and patch; take LimboAI when you also want
state machines and a visual debugger, and can accept a compiled C++ GDExtension. The same Godot-version trap affects
[waterways](../shaders-vfx/waterways.md) in the shaders folder: its default branch and
only release are Godot 3.

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [proton-scatter](proton-scatter.md) | ProtonScatter | MIT | active |
| [scatter2d](scatter2d.md) | Scatter2D | MIT | active |
| [smartshape2d](smartshape2d.md) | SmartShape2D | MIT | active |
| [phantom-camera](phantom-camera.md) | Phantom Camera | MIT | active |
| [godot-guide](godot-guide.md) | G.U.I.D.E. | MIT | active |
| [godot-input-helper](godot-input-helper.md) | Input Helper | MIT | active |
| [dialogic](dialogic.md) | Dialogic | MIT | active |
| [creature-2d-runtimes](creature-2d-runtimes.md) | Creature 2D Runtimes (Godot 3 only) | Apache-2.0 | active |
| [godot-mod-loader](godot-mod-loader.md) | Godot Mod Loader | CC0 | active |
| [beehave](beehave.md) | Beehave | MIT | active |
| [limboai](limboai.md) | LimboAI | MIT | active |
| [terrain3d](terrain3d.md) | Terrain3D | MIT | active |
| [godotsteam](godotsteam.md) | GodotSteam | MIT | active |
| [voronoishatter](voronoishatter.md) | VoronoiShatter | MIT | active |
| [godot-destruction-plugin](godot-destruction-plugin.md) | Godot Destruction Plugin | MIT | active |
| [godot-voxel-destruction](godot-voxel-destruction.md) | Godot Voxel Destruction | MIT | active |
| [func-godot](func-godot.md) | func_godot | MIT | active |

## GTA-format tooling

Software only. Not a GTA V asset grant. See [`docs/fivem.md`](../../docs/fivem.md).

| ID | Name | License | Status |
| --- | --- | --- | --- |
| [sollumz](sollumz.md) | Sollumz | GPL-3.0-or-later | active |

See: [`docs/godot-budget-stack.md`](../../docs/godot-budget-stack.md) · [`docs/ai-assets.md`](../../docs/ai-assets.md) · [`docs/fivem.md`](../../docs/fivem.md) · [`docs/research-index.md`](../../docs/research-index.md).

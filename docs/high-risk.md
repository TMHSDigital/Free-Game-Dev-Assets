# Free sources that aren't safe to ship

These sources are free to download, or look free, but their terms make them unsafe in a commercial game: non-commercial or research-only licences, copyleft that can reach your own code or meshes, engine locks, or no readable licence at all. Some rows are a trap inside a source the catalog does list (GPL posts on Godot Shaders, share-alike LPC sheets); read the row before you take from it. Where a safer alternative exists, the row names it.

| Source | Why |
| --- | --- |
| **SMPL / SMPL-X (free academic license)** | Free download is **non-commercial scientific/education/artistic only**; commercial use needs a paid Meshcapade / MPI license. |
| **MB-Lab / CharMorph `mb_*` bases** | AGPL v3 can attach to generated meshes — unsafe for closed-source games. CharMorph-db ships `mb_female` under AGPL (Antonia is CC-BY-3.0). Prefer MakeHuman / MPFB (CC0 core exports). |
| **Shadertoy (default)** | Default **CC BY-NC-SA 3.0** unless an author states otherwise. Do not port into commercial builds without explicit permission. |
| **GodotShaders.com GPL v3 posts** | Site allows commercial use of shader **code**, but submitters may pick **GPL v3** — viral copyleft risk for closed-source games. Use CC0 or MIT posts only; see the [Godot Shaders](../catalog/shaders-vfx/godot-shaders.md) entry. |
| **Bandai Namco mocap datasets** | CC-BY-NC — research/non-commercial only. |
| **Ubisoft LaFAN1 / La Forge Animation Dataset** | CC-BY-NC-ND 4.0 — non-commercial, no derivatives; unusable for shipping games. |
| **SFU Motion Capture Database** | Explicitly free for research only — “cannot be used for commercial products or resale.” |
| **AMASS** | Live `license.html` (2026-08-25): “non-commercial scientific research” and “use for commercial purposes, is prohibited.” Meshes are SMPL, so the SMPL commercial lock also applies. |
| **Human3.6M** | Live EULA (2026-08-25): “GRANT OF LICENSE FREE OF CHARGE FOR ACADEMIC USE ONLY.” Free tier is academic; commercial licensing is a separate paid path. |
| **Ready Player Me** | Homepage and `/legal` connection refused (2026-08-25). GitHub `animation-library` LICENSE.md: animations “licensed for use with Ready Player Me Avatars”; use with other characters “is prohibited.” Avatar mesh terms were not readable on 2026-08-25, so treat the avatars as unlicensed until you can read them. |
| **ElevenLabs / similar free TTS tiers** | Free tiers often **non-commercial**; commercial rights sit behind paid plans. Prefer local Apache/MIT TTS (Kokoro, Piper Plus). |
| **Google Maps / Earth meshes** | Scraping via RenderDoc/plugins violates ToS — not public domain. |
| **ColorADD symbols** | Proprietary accessibility coding system; needs a paid license. |
| **CC-*-ND music** | Interactive sync is treated as a derivative — **ND music is generally unusable in games**. |
| **Anonymous “CC0” mega-dumps** | License-laundering risk — see [`provenance.md`](provenance.md). |
| **FABDEM** | Research flags **CC BY-NC-SA** / non-commercial DEM — do not treat as commercial-ok terrain. |
| **Yamms (Godot)** | AGPLv3 addon — viral copyleft risk for commercial closed-source games. |
| **Meshy AI free tier** | Ownership / training-data restrictions on free outputs — high uncertainty. |
| **Cascadeur Free** | Research: non-commercial / proprietary `.casc` export limits — paid tiers differ. |
| **Unreal Starter Content** | Engine EULA — **UE-only**; do not port meshes/textures to other engines. |
| **Unity Companion License / Starter Assets** | Unity-only embedding in shipped Unity games; no raw-file redistribution; extra seats for outside contractors. Not a multi-engine CC0 kit. |
| **Fab “Epic Content License”** | Engine-locked to Unreal. Only **Fab Standard License** claims may be multi-engine — verify badge per asset. |
| **LPC / CC-BY-SA sprites** | Commercial OK with SA obligations on asset derivatives; keep sheets extractable; not “CC0-like.” |
| **Font Awesome brand icons** | Brand marks only for representing those brands — not generic UI decoration. |
| **GTA V / RDR2 game files and rips** | Rockstar / Take-Two IP. Owning the game (or running FiveM) licenses play, not redistribution of extracted `ydr` / `ytd` / `ymap` / MLO interiors. Not a free asset library. See [`fivem.md`](fivem.md). |
| **FiveM “free props” dumps** | Anonymous GitHub trees, MLO leaks, escrow bypasses, and Tebex reuploads are stolen or unlicensed regardless of a CC0 badge. Do not use them. |
| **Cfx Marketplace / forum Releases (as a blanket source)** | Per-resource terms. Cfx is not a commercial grant. Live Finding Resources (2026-08-25): “Use resources at your own risk.” Read each resource's own terms; the marketplace is not CC0. |
| **HDRLabs sIBL archive** | Live `hdrlabs.com/sibl/archive.html` HTTP 404 (2026-08-29). Wayback 2023-01-01: “licensed under the Creative Commons Attribution-Noncommercial-Share Alike 3.0 License.” NC-SA. Use [Poly Haven](../catalog/environment/poly-haven.md) or [Open HDRI](../catalog/environment/open-hdri.md) instead. |
| **Truebones Mixamo 2400 dump** | Mixamo clip repack, not the ZOO SKU. The [Mixamo](../catalog/animation/mixamo.md) entry has Adobe's terms; a third-party dump does not create a new grant. The [Truebones ZOO](../catalog/animation/truebones-zoo.md) entry is a different product. |
| **Khronos glTF Sample Sponza** | `Models/Sponza/LICENSE.md`: model files under the **CryEngine Limited License Agreement**, not CC-BY. Metadata files are CC-BY-4.0. Do not treat the Khronos sample tree as a bulk CC0/CC-BY kit. |
| **Sprout Lands (Cup Nooble) free itch tier** | Live itch: free pack is **non-commercial**; commercial needs paid premium. Not CC0. |
| **Pixel Crawler (Anokolisa)** | Live itch page had no license text (“permanently free” only). Do not infer CC0 from a gist. |

A source that is not on this list is not automatically safe. If you cannot read its terms at the source, treat it as unlicensed until you can.

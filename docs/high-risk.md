# Do not catalog / high risk

Sources that fail our commercial-safety bar. Keep out of `status: active` listings; link here only as warnings.

| Source | Why |
| --- | --- |
| **SMPL / SMPL-X (free academic license)** | Free download is **non-commercial scientific/education/artistic only**; commercial use needs a paid Meshcapade / MPI license. |
| **MB-Lab / CharMorph `mb_*` bases** | AGPL v3 can attach to generated meshes — unsafe for closed-source games. CharMorph-db ships `mb_female` under AGPL (Antonia is CC-BY-3.0). Prefer MakeHuman / MPFB (CC0 core exports). |
| **Shadertoy (default)** | Default **CC BY-NC-SA 3.0** unless an author states otherwise. Do not port into commercial builds without explicit permission. |
| **GodotShaders.com GPL v3 posts** | Site allows commercial use of shader **code**, but submitters may pick **GPL v3** — viral copyleft risk for closed-source games. Prefer CC0/MIT posts only; see `catalog/shaders-vfx/godot-shaders.md`. |
| **Bandai Namco mocap datasets** | CC-BY-NC — research/non-commercial only. |
| **Ubisoft LaFAN1 / La Forge Animation Dataset** | CC-BY-NC-ND 4.0 — non-commercial, no derivatives; unusable for shipping games. |
| **SFU Motion Capture Database** | Explicitly free for research only — “cannot be used for commercial products or resale.” |
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
| **Fab “Epic Content License”** | Engine-locked to Unreal. Only **Fab Standard License** claims may be multi-engine — verify badge per asset. |
| **LPC / CC-BY-SA sprites** | Commercial OK with SA obligations on asset derivatives; keep sheets extractable; not “CC0-like.” |
| **Font Awesome brand icons** | Brand marks only for representing those brands — not generic UI decoration. |

When in doubt: `status: needs-review` or omit entirely.

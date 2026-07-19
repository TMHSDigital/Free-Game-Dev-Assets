# Do not catalog / high risk

Sources that fail our commercial-safety bar. Keep out of `status: active` listings; link here only as warnings.

| Source | Why |
| --- | --- |
| **MB-Lab exports** | AGPL v3 can attach to generated meshes — unsafe for closed-source games. Prefer MakeHuman (CC0 export exception) or CharMorph. |
| **Shadertoy (default)** | Default **CC BY-NC-SA 3.0** unless an author states otherwise. Do not port into commercial builds without explicit permission. |
| **Bandai Namco mocap datasets** | CC-BY-NC — research/non-commercial only. |
| **ElevenLabs / similar free TTS tiers** | Free tiers often **non-commercial**; commercial rights sit behind paid plans. Prefer local Apache/MIT TTS (Kokoro, Piper Plus). |
| **Google Maps / Earth meshes** | Scraping via RenderDoc/plugins violates ToS — not public domain. |
| **ColorADD symbols** | Proprietary accessibility coding system; needs a paid license. |
| **CC-*-ND music** | Interactive sync is treated as a derivative — **ND music is generally unusable in games**. |
| **Anonymous “CC0” mega-dumps** | License-laundering risk — see [`provenance.md`](provenance.md). |

When in doubt: `status: needs-review` or omit entirely.

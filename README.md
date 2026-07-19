# Free Game Dev Assets

A curated public catalog of **free and commercially usable** assets, libraries, and tools for game development and related interactive work.

This repository **indexes and documents** sources. It does **not** rehost third-party binary packs. Every entry points to the original publisher so licenses stay authoritative at the source.

---

## Contents

- [Browse the catalog](#browse-the-catalog)
- [Quick start](#quick-start)
- [How entries work](#how-entries-work)
- [Safe starting points](#safe-starting-points)
- [Licenses](#licenses)
- [Scope](#scope)
- [Contributing](#contributing)
- [Repository layout](#repository-layout)
- [License](#license)

---

## Browse the catalog

| Category | Focus | Index |
| --- | --- | --- |
| **3D** | Models, scans, PBR textures & materials | [`catalog/3d/`](catalog/3d/) |
| **2D** | Sprites, UI/HUD, icons, palettes | [`catalog/2d/`](catalog/2d/) |
| **Audio** | SFX, music, foley libraries | [`catalog/audio/`](catalog/audio/) |
| **Animation** | MoCap databases & character clips | [`catalog/animation/`](catalog/animation/) |
| **Shaders & VFX** | Shaders, particle/FX resources | [`catalog/shaders-vfx/`](catalog/shaders-vfx/) |
| **Fonts** | OFL and commercial-ok typefaces | [`catalog/fonts/`](catalog/fonts/) |
| **Tools** | Editors & asset pipeline utilities | [`catalog/tools/`](catalog/tools/) |

Master index: [`catalog/README.md`](catalog/README.md)

---

## Quick start

1. Open a category folder above (or the [master index](catalog/README.md)).
2. Prefer entries with `status: active` and `commercial: true`.
3. Follow the source URL and **re-check the live license** before shipping.
4. Keep attribution / notices files for anything that isn’t CC0.

If you’re prototyping under a tight deadline, start with the [safe starting points](#safe-starting-points).

---

## How entries work

Each source is one markdown file with YAML frontmatter plus short notes. Add new ones from [`catalog/TEMPLATE.md`](catalog/TEMPLATE.md).

| Field | Meaning |
| --- | --- |
| `license` | Short license name as stated by the source (`CC0`, `CC-BY-3.0`, `SIL OFL`, `custom`, `varies`) |
| `commercial` | `true` / `false` / `unknown` |
| `attribution_required` | Whether credits are mandatory |
| `formats` | Common download / interchange formats |
| `verified` | Date of the last license spot-check (`YYYY-MM-DD`) |
| `status` | See legend below |

### Status legend

| Status | Meaning |
| --- | --- |
| `active` | License spot-checked; suitable to evaluate for production use |
| `needs-review` | Useful discovery — verify the live page before shipping |
| `deprecated` | Kept for history; prefer alternatives |

Aggregators (OpenGameArt, itch collections, Poly Pizza, font indexes) are usually `license: varies`. Treat each pack or file as its own review.

---

## Safe starting points

High-signal CC0 / clearly permissive sources that cover most early production needs:

| Need | Source | Entry |
| --- | --- | --- |
| Modular low-poly 3D / UI | Kenney | [`catalog/3d/kenney.md`](catalog/3d/kenney.md) |
| Rigged low-poly characters | Quaternius | [`catalog/3d/quaternius.md`](catalog/3d/quaternius.md) |
| Atlas-optimized kits | KayKit | [`catalog/3d/kaykit.md`](catalog/3d/kaykit.md) |
| Seamless PBR materials | ambientCG | [`catalog/3d/ambientcg.md`](catalog/3d/ambientcg.md) |
| Hand-drawn 2D vectors | Glitch archive | [`catalog/2d/glitch-archive.md`](catalog/2d/glitch-archive.md) |
| Input prompt icons | Xelu | [`catalog/2d/xelu-input-prompts.md`](catalog/2d/xelu-input-prompts.md) |
| Pro SFX dumps | Sonniss #GameAudioGDC | [`catalog/audio/sonniss-gdc.md`](catalog/audio/sonniss-gdc.md) |
| Pixel / terminal font | Departure Mono | [`catalog/fonts/departure-mono.md`](catalog/fonts/departure-mono.md) |

---

## Licenses

Read [`docs/licenses.md`](docs/licenses.md) before mixing packs into a commercial build. Short version:

- **CC0** — safest default for closed-source games; attribution not required
- **CC-BY** — commercial OK; keep credits
- **CC-BY-SA** — commercial OK with caveats; prefer extractable asset bundles over encrypting SA files into the binary
- **SIL OFL** — preferred for fonts embedded in games
- **Marketplace “free”** (Unity / Fab / Unreal / many itch packs) — engine or pack EULA applies; do not rehost

Catalog metadata in *this* repo is CC0. Linked assets remain under their own licenses.

---

## Scope

**In scope**

- Free asset libraries, packs, and aggregators with a clear free tier
- Tools useful for creating or processing game assets
- Sources usable in commercial games when terms allow

**Out of scope**

- Rehosting or mirroring third-party ZIP / model / audio dumps
- Paid-only marketplaces with no meaningful free content
- Guessing licenses — use `unknown` / `needs-review` instead

---

## Contributing

PRs welcome for new sources, license corrections, dead links, and clearer notes.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the entry checklist and verification steps.

---

## Repository layout

```text
.
├── README.md              ← you are here
├── CONTRIBUTING.md        ← how to add / verify entries
├── LICENSE                ← CC0 for catalog metadata & docs
├── docs/
│   └── licenses.md        ← license cheat sheet
└── catalog/
    ├── TEMPLATE.md        ← copy this for new entries
    ├── 3d/  2d/  audio/  animation/
    ├── shaders-vfx/  fonts/  tools/
    └── README.md          ← master index
```

---

## License

Catalog metadata and documentation in this repository are dedicated to the public domain under [CC0 1.0](LICENSE).

Third-party assets linked from the catalog remain under their original licenses. Always verify terms on the source site before use.

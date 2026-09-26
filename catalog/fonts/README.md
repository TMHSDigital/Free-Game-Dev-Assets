# Fonts

Prefer **SIL OFL** for embedding in commercial games. See [docs/licenses.md](../../docs/licenses.md)
and [docs/fonts.md](../../docs/fonts.md) for what you still owe when `attribution_required` is false.

## Choosing a pixel font

Nine pixel faces, and the difference is what kind of retro you mean, plus whether you
need CJK. All nine are safe to embed; only the last is CC0 rather than OFL.

| You want | Take | Note |
| --- | --- | --- |
| A terminal or low-res HUD | [departure-mono](departure-mono.md) | Monospaced, the catalog's default pixel face. Site is MIT, the **font** is OFL |
| A CRT or hacking UI | [vt323](vt323.md) | Soft-pixel terminal look, gentler than Press Start |
| Hard 8-bit arcade | [press-start-2p](press-start-2p.md) | Title and score type. Reserved Font Name, so rename if you modify |
| Chunky retro labels | [silkscreen](silkscreen.md) | The arcade weight without Press Start's blocky letterforms |
| Readable pixel UI | [pixelify-sans](pixelify-sans.md) | Soft modern pixel sans; least crunchy of the set |
| **Japanese** | [dotgothic16](dotgothic16.md) | Fontworks, on a 16px grid, covers what the Latin faces cannot |
| **Pan-CJK, several sizes** | [ark-pixel-font](ark-pixel-font.md) | 10/12/16px, mono and proportional, language-specific glyphs. OFL on the font, MIT covers build tools only |
| **CJK at 8x8** | [quanpixel](quanpixel.md) | The smallest CJK option. Download `QuanPixel.zip`; the itch slug still says galmuri-extended |
| No licence file at all | [ggbotnet-fonts-cc0](ggbotnet-fonts-cc0.md) | 45 faces, **CC0**, so nothing to ship alongside. The same account's OFL collection is a different thing |

Match the font's design grid to your tile grid where you can: DotGothic16 is drawn for
16px, QuanPixel for 8px. A 16px face in an 8px UI needs scaling and will blur.



| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [atkinson-hyperlegible](atkinson-hyperlegible.md) | Atkinson Hyperlegible | SIL OFL | yes | active |
| [dotgothic16](dotgothic16.md) | DotGothic16 | SIL OFL | yes | active |
| [ark-pixel-font](ark-pixel-font.md) | Ark Pixel Font | SIL OFL | yes | active |
| [quanpixel](quanpixel.md) | QuanPixel | SIL OFL | yes | active |
| [ggbotnet-fonts-cc0](ggbotnet-fonts-cc0.md) | GGBotNet Fonts CC0 | CC0 | yes | active |
| [amiri](amiri.md) | Amiri | SIL OFL | yes | active |
| [reem-kufi](reem-kufi.md) | Reem Kufi | SIL OFL | yes | active |
| [league-gothic](league-gothic.md) | League Gothic | SIL OFL | yes | active |
| [departure-mono](departure-mono.md) | Departure Mono | SIL OFL | yes | active |
| [ibm-plex-sans](ibm-plex-sans.md) | IBM Plex Sans | SIL OFL | yes | active |
| [inter](inter.md) | Inter | SIL OFL | yes | active |
| [jetbrains-mono](jetbrains-mono.md) | JetBrains Mono | SIL OFL | yes | active |
| [noto-sans](noto-sans.md) | Noto Sans (CJK+) | SIL OFL | yes | active |
| [orbitron](orbitron.md) | Orbitron | SIL OFL | yes | active |
| [pixelify-sans](pixelify-sans.md) | Pixelify Sans | SIL OFL | yes | active |
| [press-start-2p](press-start-2p.md) | Press Start 2P | SIL OFL | yes | active |
| [silkscreen](silkscreen.md) | Silkscreen | SIL OFL | yes | active |
| [source-sans-3](source-sans-3.md) | Source Sans 3 | SIL OFL | yes | active |
| [vt323](vt323.md) | VT323 | SIL OFL | yes | active |
| [fontshare](fontshare.md) | Fontshare | varies | unknown | needs-review |
| [velvetyne](velvetyne.md) | Velvetyne | SIL OFL | yes | active |
| [fontsource](fontsource.md) | Fontsource | varies | varies | active |
| [open-foundry](open-foundry.md) | Open Foundry | varies | varies | active |
| [kenney-fonts](kenney-fonts.md) | Kenney Fonts | CC0 | yes | active |
| [monogram](monogram.md) | Monogram | CC0 | yes | active |

Aggregators (Fontesk, JustFreeFonts, etc.) are intentionally omitted unless the source itself is the distribution path. Fontsource is listed because it is that path (npm). Open Foundry is a display-only index: download from the upstream OFL.txt. Fontshare is a warning: mixed `itf_ffl` / OFL, terms page not readable as text.

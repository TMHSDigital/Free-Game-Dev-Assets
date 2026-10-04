---
id: fontshare
name: Fontshare
url: https://www.fontshare.com
category: fonts
subcategories: [aggregator, sans, display]
license: varies
commercial: true
attribution_required: false
formats: [OTF, TTF, WOFF]
tags: [foundry, itf, mixed-license, variable-font]
verified: 2026-10-04
status: active
---

# Fontshare

Indian Type Foundry's free-font site. Quality display and UI faces (Satoshi, General Sans, and others) plus a set of SIL OFL families also available elsewhere. **This is not an OFL aggregator.** The public API on 2026-10-04 tagged 64 families `itf_ffl` (the ITF Free Font License, a custom EULA) and 36 families `sil_ofl`. The ITF Free Font License names Games, allows commercial use and embedding in applications, and does not require credit, but it forbids modifying the font files, including subsetting and format conversion.

## Notes

- **Check the licence on each family page.** The family page's Details panel says either "Closed Source / ITF Free Font License" or an OFL licence. The two have different rules
- **ITF FFL (read 2026-10-04):** personal or commercial use, free, in "any media", Games named. Embedding in "mobile or desktop applications" is allowed. Credit is optional. You may not redistribute the font files on their own, give them to contractors (they must download their own copy) or let third-party users pick the font in a tool or template editor you run
- **The engine trap:** the FFL bans modifying the Font Software without written consent, and spells out "subsetting, format conversion" and changing the font's names or metadata. "Font Software" includes "bitmap or vector representations". An engine import step that subsets glyphs or converts the font into its own format (a baked SDF or bitmap atlas, a WOFF2 you made yourself) may count. Ship the official file where the engine allows it, or ask ITF first
- Embedded fonts in PDFs and other documents must not be extractable for independent use
- For OFL families, prefer the upstream project and its OFL.txt where one exists ([jetbrains-mono](jetbrains-mono.md) is on Fontshare as `sil_ofl` too). OFL allows subsetting and conversion, so it is the easier choice if your pipeline converts fonts
- API: `https://api.fontshare.com/v2/fonts` (100 families listed on 2026-10-04)
- The licence routes (`/licenses`, `/licenses/itf-ffl`) are a JavaScript app; the text was read in a browser on the Satoshi family page

## Evidence

- `api.fontshare.com/v2/fonts` (2026-08-24): `license_type` is `itf_ffl` on 64 families and `sil_ofl` on 36
- Live `/licenses`, `/legal`, `/eula` (2026-08-24): "Enable javascript to use this application" with no license body. Terms page not reachable as text on 2026-08-24
- Live homepage (2026-08-25): still a JS shell. ITF FFL body still unreadable as text. Stay `needs-review`.
- `api.fontshare.com/v2/fonts` (2026-10-04): 100 families, `license_type` `itf_ffl` on 64 and `sil_ofl` on 36
- Live [Satoshi family page](https://www.fontshare.com/fonts/satoshi), License panel (2026-10-04): "License Closed Source / ITF Free Font License", followed by the full ITF Free Font License text
- Same ITF Free Font License, 01 Grant of License (2026-10-04): "use the Font Software for personal or commercial purposes, free of charge and for an unlimited period of time"; "You may use the Font Software in any media, including Print, Websites, Mobile or Desktop Applications, Digital Images, Digital Advertising, Social Media, ePublishing, Video, Broadcasting and Games"
- Same section (2026-10-04): "You may embed the Font Software in mobile or desktop applications and digital documents for the uses permitted under this License."; "You may, but are not required to, identify or credit Indian Type Foundry or Fontshare in works created using the Font Software."
- Same licence, 02 Limitations of Usage (2026-10-04): "You may not modify, edit, adapt, translate, reverse engineer, decompile, disassemble or otherwise alter the Font Software ... This includes modifying or replacing glyphs, subsetting, format conversion, or altering font names, copyright information, ownership information or other metadata."
- Same section (2026-10-04): distribution of the Font Software "through another font website, font library, marketplace, repository, download service, application or platform" is not allowed, and "You may not provide the Font Software directly to external designers, agencies, contractors, printers or other service providers."

## Related

- [inter](inter.md)
- [jetbrains-mono](jetbrains-mono.md)
- [source-sans-3](source-sans-3.md)
- [orbitron](orbitron.md)

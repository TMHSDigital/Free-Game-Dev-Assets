---
id: fontshare
name: Fontshare
url: https://www.fontshare.com
category: fonts
subcategories: [aggregator, sans, display]
license: varies
commercial: unknown
attribution_required: true
attribution_string: "Credit the designer named on the Fontshare family page. Per-family; ITF FFL terms were not readable as text."
formats: [OTF, TTF, WOFF, variable]
tags: [foundry, itf, mixed-license]
verified: 2026-08-24
status: needs-review
---

# Fontshare

Indian Type Foundry's free-font site. Quality display and UI faces (Satoshi, General Sans, and others) plus a pile of SIL OFL families also available elsewhere. **This is not an OFL aggregator.** The public API this session tagged 64 families `itf_ffl` and 36 families `sil_ofl`. HTML routes `/licenses`, `/legal`, `/eula`, and `/license` all returned a JavaScript shell with no terms text. Until the ITF Free Font License can be quoted from a live document, do not treat `itf_ffl` faces as OFL-equivalent for embedding.

## Notes

- Prefer the OFL faces already in this catalog ([jetbrains-mono](jetbrains-mono.md) is on Fontshare as `sil_ofl` too) when you need a known embedding grant
- `itf_ffl` is a custom foundry license. Desktop/web/app rights, webfont kit limits, and trademark/reserved-name rules are the usual traps on ITF licenses. None of those sentences were readable this session
- Do not copy a Fontshare OFL face from this site and skip the upstream OFL.txt. Use the original project's OFL when it exists
- API: `https://api.fontshare.com/v2/fonts` (100 families listed this session)

## Evidence

- `api.fontshare.com/v2/fonts` (2026-08-24): `license_type` is `itf_ffl` on 64 families and `sil_ofl` on 36
- Live `/licenses`, `/legal`, `/eula` (2026-08-24): "Enable javascript to use this application" with no license body. Terms page not reachable as text this session

## Related

- [inter](inter.md)
- [jetbrains-mono](jetbrains-mono.md)
- [source-sans-3](source-sans-3.md)
- [orbitron](orbitron.md)

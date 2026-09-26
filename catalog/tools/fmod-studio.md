---
id: fmod-studio
name: FMOD Studio
url: https://www.fmod.com/licensing
category: tools
subcategories: [audio-middleware]
license: custom
commercial: true
attribution_required: true
attribution_string: "Made using FMOD Studio by Firelight Technologies Pty Ltd."
formats: [middleware]
tags: [audio, freemium, indie-threshold]
verified: 2026-09-26
status: active
---

# FMOD Studio

Audio middleware with a Free Indie License for small developers: under $200k USD revenue per year, on a project under $600k development budget. Above that, per-game fees apply. Every licence level requires an in-app credit line and the FMOD logo on a startup splash screen.

## Notes

- Keep comparing [Wwise indie](wwise.md) (budget-cap model; DLC caveats).
- The Free Indie terms are thresholds, not a blanket grant: revenue counts the whole company and all development partners, and budget is the expected cost at full commercial release. Check both before shipping.
- The project must be registered in your FMOD profile before a commercial release.
- The authoring tool (FMOD Studio) is free for all use, including commercial, when making content for the FMOD engine; the licence thresholds apply to the FMOD Engine shipped in the game.
- The logo requirement can be waived only for a fee, on the Basic and Premium licences.
- fmod.com pages are script-rendered, so a plain fetch returns an empty shell (as on 2026-07-19); on 2026-09-26 they were read in a full browser.

## Evidence

- Target URL `https://www.fmod.com/licensing` — fetch returned empty body (2026-07-19). Re-open manually before promoting.
- Live [Licensing](https://www.fmod.com/licensing) (2026-09-26): "Free Indie License available for developers with less than $200k revenue per year, on a small (under $600k) development budget." FMOD Logo row: "Required" for Indie, Basic and Premium.
- Same page (2026-09-26), EULA: "This EULA grants you the right to use FMOD Engine, for limited Commercial use", subject to a development budget under $600k USD, revenue under $200k USD, registration, and "Product includes attribution in accordance with Clause 3."
- Same page (2026-09-26): "All FMOD licenses require a logo be displayed on a splash screen".
- Live [Attribution](https://www.fmod.com/attribution) (2026-09-26): "Projects using FMOD Studio must include an in-app credit line and the FMOD logo." Example credit: "Made using FMOD Studio by Firelight Technologies Pty Ltd."

## Related

- [wwise](wwise.md)

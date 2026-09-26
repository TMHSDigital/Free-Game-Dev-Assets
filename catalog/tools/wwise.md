---
id: wwise
name: Wwise (Indie tier)
url: https://www.audiokinetic.com/en/wwise/pricing/
category: tools
subcategories: [audio-middleware]
license: custom
commercial: true
attribution_required: unknown
formats: [middleware]
tags: [audio, freemium, budget-cap]
verified: 2026-09-26
status: needs-review
---

# Wwise Indie

Audiokinetic middleware — the Indie plan is free for game projects with a production budget under $250K, royalty free, with unlimited sounds. A licence is per title and per platform (Indie platforms are free). DLC with new audio needs a DLC licence, which is also free at Indie level. Compare [FMOD](fmod-studio.md).

## Notes

- Pricing/download pages returned **HTTP 403** on 2026-07-19 — cannot confirm current indie thresholds.
- Re-checked 2026-09-26: the pricing pages load with a browser user agent and confirm the $250K Indie cap. Still open: whether a shipped game must credit Audiokinetic or show a "Powered by Wwise" logo. Neither pricing page says so, and the Wwise EULA / licence agreement that would settle it was not found on a public page (`/en/licensing/faq/` and `/en/legal/` paths return 404; the public SDK Agreement PDF covers plug-in developers, not shipped games). Keep `attribution_required: unknown` until that text is read
- The Free Trial (no registered project) is non-commercial only and capped at 200 media assets; register the project for the Indie licence before shipping
- The licence is tied to one title; a new game needs its own registration

## Evidence

- `audiokinetic.com` pricing/download: HTTP 403 (2026-07-19). Leave `needs-review` until a live quote is possible.
- Live [Pricing](https://www.audiokinetic.com/en/wwise/pricing/) (2026-09-26): Indie "Free"; "Production Budget: Less than $250K"; "Sound Files / Media Assets: Unlimited"; Royalty Free (0%) ticked for Indie.
- Same page FAQ (2026-09-26): "The Free Trial version allows you to create a project for non-commercial use only and is limited to 200 media assets"; "The Wwise Project License is tied to a specific project (Licensee Title)".
- Live [Wwise for Games](https://www.audiokinetic.com/en/wwise/pricing/for-games/) (2026-09-26): "the Indie plan is valid for projects with a production budget up to $250K"; Indie first platform and extra platforms "Free"; Wwise DLC License 12-Month Term "Indie (Level A) Free"; "Licenses allow for worldwide distribution of your game title."

## Related

- [fmod-studio](fmod-studio.md)

# Interactive games vs linear video

"Royalty-free for commercial use" on a music or SFX library usually means **monetized YouTube, Twitch, and ads**. It does not automatically mean a shipped game. Interactive sync and linear video sync are different licenses in this industry, and catalogs that collapse them will get someone a takedown.

## Why the split exists

A linear video is one mix, one timeline, one public performance. The library can price that. A game is an interactive soundtrack: loops, layers, adaptive cues, player-triggered one-shots, potentially infinite duration, and a copy of the audio **inside the distributed binary**. Many stock contracts treat that as a separate product, or omit it so the default is "not granted."

ND (no derivatives) is the sharp version of the same idea. Playing a track under gameplay, ducking it, looping it, or layering it with SFX is commonly treated as a derivative. ND music is unsafe in games even when "commercial video" is allowed. See [`licenses.md`](licenses.md).

## Words that usually mean video, not games

On a terms page, these are video grants until you find a games sentence:

- YouTube, Vimeo, TikTok, podcast, broadcast, advertising, film, "content creator"
- "monetized videos" / "royalty-free for commercial projects" with no mention of software
- Sync license, performance royalty, PRO (ASCAP/BMI) language aimed at linear cue sheets

Words that actually open games:

- games, apps, software, interactive, video game, in-product, compiled binary
- "ship inside your game" / "distribute to end users as part of your product"

Silence is not a yes. If games are not named, set `commercial: unknown` and `needs-review`, or mark `commercial: false` if the page is clearly creator-media only.

## Redistribution vs shipping in a game

Most game-ok libraries still split two acts:

| Act | Typical answer |
| --- | --- |
| Compile the audio into your game and sell the game | Allowed, if games are in scope |
| Put the same files in an asset pack, template, game jam kit, or "royalty-free SFX folder" you resell | Forbidden |
| Ship a user-facing soundboard / sampler whose content *is* their library | Forbidden |
| Train a model on the library | Often forbidden; read the current clause |

"Free download" and "free tier" are access, not scope.

## How to read a terms page for this question

1. Search the page for `game`, `app`, `software`, `interactive`. If none hit, you do not have a game grant.
2. Check whether the game grant is on the **free** tier or only on a paid/premium SKU.
3. Check attribution: video credits (description box) are not the same as an in-game credits screen. Some sources require the credit **in the game**, not only on the store page.
4. Check redistribution / "similar to a competitor's library."
5. Ignore homepage marketing. The license URL wins.

## Catalog entries where this distinction is load-bearing

- [`catalog/audio/zapsplat.md`](../catalog/audio/zapsplat.md) — Basic tier names games, apps, and software, and requires credit. Premium drops attribution. Still a redistribution ban.
- [`catalog/audio/pixabay-audio.md`](../catalog/audio/pixabay-audio.md) — Content License is built for media; confirm interactive/software use on the live page before shipping. Do not infer a game grant from "royalty-free."
- [`catalog/audio/mixkit-sfx.md`](../catalog/audio/mixkit-sfx.md) — Envato Mixkit terms are video-first. Read the current license for software/games; do not copy a YouTube credit pattern into a shipped title and call it done.
- [`catalog/audio/incompetech.md`](../catalog/audio/incompetech.md) — CC-BY-4.0 covers games if you credit; the paid "no attribution" SKU exists for ads and other credit-impossible formats, not because games are excluded.
- [`catalog/audio/soundimage.md`](../catalog/audio/soundimage.md) — Custom grant; credit must appear **in the game**, not only on a store page.
- [`catalog/audio/freepd.md`](../catalog/audio/freepd.md) — Site went offline; do not substitute a video-library clone and keep the old commercial-ok flag.

Sonniss GDC dumps and Kenney audio are written as game libraries. Still read the pack page; do not assume every "free SFX" site on the same itch listing is in the same class.

Related: [`licenses.md`](licenses.md), [`high-risk.md`](high-risk.md), [`provenance.md`](provenance.md), [`fivem.md`](fivem.md).

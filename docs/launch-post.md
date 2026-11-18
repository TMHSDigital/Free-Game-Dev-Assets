# Launch post (draft)

A draft for announcing the catalog (#118). Edit before posting; adjust the length for each place in [distribution.md](distribution.md). Counts are as of 2026-11-18; check the site's footer for the current number before posting.

---

**Title:** Free game assets where every licence is quoted and dated

I kept running into the same problem with "free game assets" lists: they say *free*, but not free for what. Free for a commercial game? With credit or without? Since when? So I started a catalog that answers those questions from the source, one entry at a time.

Free Game Dev Assets lists over 420 sources: 3D models, sprites, audio, fonts, shaders, animation, tools. For each one:

- the licence is quoted from the page that states it, with a link to that page and the date it was read
- it says whether a commercial game may use it, and whether you have to credit the author
- when the source does not say plainly, the entry says "unknown" and names the open question instead of guessing

A validator runs on every change and fails the build if a claim has no dated evidence behind it, a weekly link check catches dead or moved sources, and the oldest readings are re-read every month.

Some things people use it for:

- **Starter stacks:** one pick per need for a kind of game (pixel platformer, low-poly Godot, mobile puzzle), with the credits the whole set owes worked out for you. There are three for game jams where nothing needs credit.
- **A shortlist** that exports a CREDITS file for your game.
- **The data:** everything is CC0 and downloadable as JSON or CSV, and there is a Godot editor plugin.

It links to sources and hosts nothing. It is a reading of each licence, not legal advice, so re-check the live page before you ship. If a reading is wrong, there is a one-form correction.

Site: https://tmhsdigital.github.io/Free-Game-Dev-Assets/
How each licence is read: https://tmhsdigital.github.io/Free-Game-Dev-Assets/guide/method/
Source: https://github.com/TMHSDigital/Free-Game-Dev-Assets

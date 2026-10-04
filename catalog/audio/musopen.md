---
id: musopen
name: Musopen
url: https://musopen.org
category: audio
subcategories: [music]
license: varies
commercial: varies
attribution_required: unknown
formats: [MP3]
tags: [music, recordings, classical, per-file-license]
verified: 2026-10-04
status: needs-review
---

# Musopen

Classical recordings and scores, most of them marked public domain, some not. Every recording carries its own licence icon, and on the one work page checked, one of six recordings was CC BY-NC-SA 3.0, which rules it out for a commercial game. Stays `needs-review` as a whole: this is an aggregator where the licence is decided per recording.

## Notes

- **Check the licence icon on the exact recording you download.** On Chopin's Nocturnes, Op. 9, five recordings link the Public Domain Mark 1.0 and one (Op. 9 no. 3, Gleb Ivanov) links CC BY-NC-SA 3.0. The same piece can be safe from one performer and non-commercial from another
- The Public Domain Mark is a label, not a licence: it records Musopen's view that the recording is free of copyright. The Terms of Use say Musopen "does not warrant that all content is in the public domain" and that users "are responsible for determining the copyright status"
- The composition being public domain does not settle the recording. Interactive use needs the recording's own status
- The site Terms of Use also contain a generic "personal, non-commercial transitory viewing" clause for "materials (information or software)" on the website. It sits alongside per-recording licence icons and reads as boilerplate for the site itself, but it is on the page; this catalog does not resolve that conflict for you
- For music with a single, plain grant, prefer [incompetech](incompetech.md) or [kenney-music-jingles](kenney-music-jingles.md)
- Musopen's licence URLs (`/license/`, `/about/license/`) return 404; the Terms of Use page (`/tos/`) and the per-recording icons are where the statements live. The site is behind Cloudflare and loads only in a browser
- Re-checked 2026-10-04 in a browser: `/music/` and `/tos/` unchanged. Still open: licence is per recording (Public Domain Mark or CC, including BY-NC-SA), so credit and commercial use cannot be settled site-wide, and the ToS "non-commercial transitory viewing" clause still sits beside the per-recording icons

## Evidence

- Live `musopen.org/music/` (2026-09-23): "All the music we host is royalty and copyright free. For specific restrictions when applicable, check the license icons."
- Live `musopen.org/music/108-nocturnes-op-9/` (2026-09-23): per-recording links to `creativecommons.org/publicdomain/mark/1.0/` (five recordings) and `creativecommons.org/licenses/by-nc-sa/3.0/` (Op. 9 no. 3, Gleb Ivanov)
- Live `musopen.org/tos/` (2026-09-23): "Musopen provides access to music and sheet music that is believed to be in the public domain. However, Musopen does not warrant that all content is in the public domain"
- Live [`musopen.org/music/`](https://musopen.org/music/) (2026-10-04): unchanged: "All the music we host is royalty and copyright free. For specific restrictions when applicable, check the license icons."
- Live [`musopen.org/tos/`](https://musopen.org/tos/) (2026-10-04): unchanged: "Permission is granted to temporarily download one copy of the materials (information or software) on Musopen's website for personal, non-commercial transitory viewing only."; "Users are responsible for determining the copyright status of any content they wish to use."

## Related

- [freepd](freepd.md)
- [incompetech](incompetech.md)
- [kenney-music-jingles](kenney-music-jingles.md)
- [free-music-archive](free-music-archive.md)
- [filmmusic-ende](filmmusic-ende.md)

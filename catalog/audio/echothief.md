---
id: echothief
name: EchoThief Impulse Response Library
url: https://www.echothief.com/
category: audio
subcategories: [impulse-responses, reverb]
license: custom
commercial: false
attribution_required: unknown
formats: [WAV]
tags: [impulse-response, reverb, field-recording]
verified: 2026-10-04
status: needs-review
---

# EchoThief Impulse Response Library

Field IRs from unusual spaces (domes, kilns, lava tubes, fortresses) by Dr. Chris Warren. The homepage offers a zip, and the zip ships a licence PDF from the San Diego State University Research Foundation (SDSURF). That licence permits use only for "original musical compositions and other creative works of individuals" and names gaming, and embedding in distributed software, as uses that need a separate commercial licence from SDSURF. **Not usable in a shipped game without that paid or negotiated licence.**

## Notes

- Licence (read 2026-10-04 from `EchoThief/_EchoThief License.pdf` inside the homepage zip): gaming, other audiovisual sync, AI training, and embedding in software "intended for distribution, sale, or other commercial exploitation" all require a separate commercial licence from SDSURF (innovation@sdsu.edu). Hence `license: custom`, `commercial: false`
- Still open: the licence says nothing about credit, so `attribution_required` stays `unknown`. Whether rendering a reverb tail into your own music counts as an individual's "creative work" when that music then ships in a game is not stated; treat game use as needing the commercial licence
- The homepage itself shows no licence text, only the copyright line; the terms live only in the zip
- Prefer [voxengo-impulses](voxengo-impulses.md) for IRs with a plain commercial grant
- Academic citations of the library are not a substitute for a licence

## Evidence

- Live homepage (2026-08-29): "copyright 2013-2026 Dr. Chris Warren cwarren@sdsu.edu"
- Same session: `/about/` and `/impulse-responses/` did not expose a usable license. `/impulse-responses/` 404.
- Live [homepage](https://www.echothief.com/) (2026-10-04): unchanged copyright line; "Download EchoThief" links `wp-content/uploads/2025/10/EchoThief.zip`
- Licence PDF in that zip (2026-10-04): "permits the use of the EchoThief Response Library and associated materials ("EchoThief") solely for the purpose of creating original musical compositions and other creative works of individuals."
- Same PDF (2026-10-04): "EchoThief shall not be used, in whole or in part, for any video production purposes intended for wide distribution, including but not limited to synchronization with motion picture, television, streaming video, gaming, advertising, or other audiovisual works, without first obtaining a separate commercial license from SDSURF."
- Same PDF (2026-10-04): "This restriction also applies to any training of artificial intelligence models and/or algorithms or embedding of EchoThief in software, applications, or other products intended for distribution, sale, or other commercial exploitation."

## Related

- [voxengo-impulses](voxengo-impulses.md)
- [adventure-kid-irs](adventure-kid-irs.md)
- [convology-xt](convology-xt.md)

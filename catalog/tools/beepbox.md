---
id: beepbox
name: BeepBox
url: https://www.beepbox.co/
category: tools
subcategories: [music]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [WAV, MP3, MIDI, JSON]
tags: [chiptune, browser, sequencer, retro]
verified: 2026-09-26
status: active
---

# BeepBox

Browser-based chiptune sequencer. A song is stored in the page URL, so sharing a link shares the song. An offline version is offered for download, and the source is MIT.

## Notes

- The MIT licence covers the program and its synth code; the site says you can use the synth code to play BeepBox songs in your own JavaScript projects
- Songs you write are your own; the site does not claim them
- `formats` lists the export options in the editor's export dialog (`editor/ExportPrompt.ts`: .wav, .mp3, .mid, .json, .html); the homepage text quoted below does not name them

## Evidence

- Live homepage (2026-09-26): "You can download and use the source code under the MIT license. In particular, you can use the synth code as demonstrated here to play BeepBox songs in your own JavaScript projects!"
- Live homepage (2026-09-26): "BeepBox is a passion project, and will always be free to use."
- Live GitHub `editor/ExportPrompt.ts` (2026-09-26): export options ".wav", ".mp3", ".mid", ".json (for any BeepBox version)" and ".html (opens BeepBox)"
- Live GitHub `johnnesky/beepbox` `LICENSE.md` (2026-09-26): "MIT License", "Copyright (c) 2012-2024 John Nesky and contributing authors"

## Related

- [bosca-ceoil-blue](bosca-ceoil-blue.md)
- [furnace](furnace.md)
- [jsfxr](jsfxr.md)

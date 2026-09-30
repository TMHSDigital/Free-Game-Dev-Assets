---
id: tilesplit
name: tilesplit
url: https://github.com/morganholly/tilesplit
category: tools
subcategories: [atlas, pipeline]
license: MIT
license_spdx: MIT
commercial: true
attribution_required: false
formats: [PNG, cli]
tags: [tileset, spritesheet, splitter, python]
verified: 2026-09-30
status: active
maintenance: inactive
---

# tilesplit

A small Python 3 command-line script by Morgan Holly that cuts a tilesheet into separate PNG files, either numbered by grid position or named from a text file you supply. A `.tsn` template file can declare the image path and tile size and handle tiles that are not all the same size. It is the reverse of an atlas packer such as [free-tex-packer](free-tex-packer.md): useful when an asset pack ships one big sheet and your engine or editor wants individual frames. Older awesome lists link it under its previous owner name, AlexPoulsen/tilesplit, which now resolves to this repository.

## Notes

- Licence of the tool: MIT. Keep the copyright notice if you redistribute the script.
- Your output: the tiles it writes are cut from your input image and keep that image's licence. Splitting a CC-BY or custom-licensed sheet does not change its terms.
- Usage from the README: `python3 tilesplit.py tilesheet.png 16 names.txt` for named tiles, or omit the names file for `tile_x_y.png` output.
- Maintenance: no push to morganholly/tilesplit since 2022-02-27, per the GitHub API on 2026-09-30. It is a single script with no build step, so age matters less than for a GUI tool.

## Evidence

- Live `LICENSE` (2026-09-30): "MIT License Copyright (c) 2019 Morgan Holly"
- Same file (2026-09-30): "Permission is hereby granted, free of charge, to any person obtaining a copy"
- Live README (2026-09-30): "exports named tiles in a dir with the name of the tilesheet"

## Related

- [free-tex-packer](free-tex-packer.md)
- [tiled](tiled.md)
- [ldtk](ldtk.md)

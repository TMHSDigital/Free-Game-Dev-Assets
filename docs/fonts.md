# Fonts: embedding, redistribution, and attribution

Fonts are the one category where the obligation does not attach to what your players see.
It attaches to the font file you ship. That is why 19 of the font entries in this catalog
set `attribution_required: false` while still carrying a real duty, and why this page
exists separately from [`licenses.md`](licenses.md).

## What `attribution_required` means on a font entry

In this catalog the field answers one question: **must you credit the author somewhere in
your product?** For SIL OFL fonts the answer is no, so the field is `false`.

It does not mean you owe nothing. OFL obliges you to keep the copyright notice and the
licence text **with the font files you redistribute**, including the copies embedded in a
game build. That is a notice obligation, not a credit obligation. A credits screen does
not satisfy it and is not required by it.

If you filter this catalog by "No attribution" you will get OFL fonts. That filter is
telling you there is no credit line to write. It is not telling you the licence file can
be dropped.

## What you actually owe when shipping an OFL font

1. Ship `OFL.txt` (or the licence text the foundry supplied) with the build. A
   `third-party-licences.txt` next to the executable, or inside the package, is the normal
   way. Godot: put it in the exported `.pck` or alongside it. Unity and Unreal: include it
   in the licences or credits file you already generate for third-party code.
2. Keep the copyright notice intact. Do not strip the metadata out of the `.ttf`.
3. Do not sell the font on its own. Bundling it inside a game is fine; putting it in an
   asset pack you sell as fonts is not.
4. If you modify the font, respect the **Reserved Font Name**. Any RFN declared in the
   licence header cannot appear in the name of your modified version. Rename the family
   before you ship a patched or subsetted-and-renamed build.

Under OFL, subsetting, hinting changes, and converting to another format are all permitted.
Other font licences can forbid them (see the ITF Free Font License below). They are
modifications, so the licence and notice travel with the result, and the RFN rule applies
if the original declared one.

## Embedding is not redistribution of a font product

The distinction that trips people up: embedding a font in a game binary is allowed under
OFL, and always has been. What OFL forbids is releasing the font files by themselves under
a different name or for sale. Shipping a `.pck` that happens to contain a `.ttf` is
embedding. Uploading that `.ttf` to a font site is redistribution.

Two consequences worth knowing:

- Encrypted or packed builds are fine. OFL does not require the font to stay extractable,
  unlike the share-alike reasoning that applies to CC-BY-SA art.
- A web build that serves the font as a separate file over HTTP is distributing the font
  file. Keep the licence reachable; a link in your credits page is enough.

## The ITF Free Font License and engine font imports

About two thirds of [Fontshare](../catalog/fonts/fontshare.md)'s families use the ITF Free
Font License (FFL), not OFL; each family page says which. The FFL allows commercial use,
Games included, and embedding in desktop and mobile applications, with credit optional.
It also forbids changing the font, and names the changes engines make. From its
"Limitations of Usage" section, read on 2026-10-04: "You may not modify, edit, adapt,
translate, reverse engineer, decompile, disassemble or otherwise alter the Font Software
... This includes modifying or replacing glyphs, subsetting, format conversion, or
altering font names, copyright information, ownership information or other metadata."

Several common import paths do one of those things: baking a signed-distance-field or
bitmap atlas (Unity TextMeshPro font assets, MSDF or pre-rendered fonts in Godot, offline
cached fonts in Unreal), or subsetting a web build's font to the glyphs it uses. Whether
ITF treats a given import as "format conversion" is its call; the licence gives no
exception for it. For a game whose pipeline converts fonts, an OFL family is the safe
default. With an FFL family, ship the original font file and render it at runtime, or ask
ITF first.

## CC0 fonts

`ggbotnet-fonts-cc0` and similar CC0 releases owe nothing at all: no notice, no credit, no
RFN. They are the lowest-friction option if you do not want to maintain a notices file.
This is the only font licence in the catalog where dropping the licence text is safe.

## Aggregators and the traps

- **Google Fonts** is not a licence. Almost every family there is OFL, a few are
  Apache-2.0, and the terms are per family. Check the family page, not the site.
- **"Free for personal use"** is the most common trap on free-font sites. It is not a
  commercial grant and it is not in this catalog.
- **Webfont-only EULAs** grant `@font-face` use and nothing else. A game binary is not a
  web page; embedding under a webfont-only licence is outside the grant.
- **Fontshare** mixes two licences: OFL on some families and the ITF Free Font License
  on most. The FFL allows games but forbids subsetting and format conversion; see the
  section above before you import one into an engine.
- **Open Foundry** is a display index. Download from the upstream foundry so you get the
  real `OFL.txt` with the family.

## Quick reference

| Licence | Credit in product | Ship licence file | Sell font alone | Rename on modify |
| --- | --- | --- | --- | --- |
| **SIL OFL** | No | **Yes** | No | Only if an RFN is declared |
| **Apache-2.0** (some Google families) | No | **Yes** | Permitted | No |
| **CC0** | No | No | Permitted | No |
| Desktop / "personal use" | n/a | n/a | n/a | Not usable commercially |

## Related

- [`licenses.md`](licenses.md) for the cross-category cheat sheet
- [`high-risk.md`](high-risk.md) for sources to avoid entirely
- Catalog: [`catalog/fonts/`](../catalog/fonts/)

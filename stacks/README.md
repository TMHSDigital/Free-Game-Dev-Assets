# Starter stacks

One file per kind of game: one pick per need, and the site works out what the whole set
owes from the picked entries. Each stack has a page at `stack/<id>/` on the site.

| Stack | For |
| --- | --- |
| [Make a 2D pixel platformer](2d-pixel-platformer.md) | A side-scrolling pixel-art platformer |
| [Make a 2D top-down pixel game](2d-top-down-pixel.md) | A top-down pixel-art adventure or RPG |
| [Make a 3D low-poly arena game in Godot](3d-low-poly-arena-godot.md) | A 3D arena game with rigged characters, in Godot 4 |
| [Make a first-person destruction game](first-person-destruction.md) | A first-person game about breaking things |
| [Make a mobile puzzle game](mobile-puzzle.md) | A casual match-3 or board-style game for phones |

## Writing a stack

- Frontmatter: `id` (the filename without `.md`), `title`, `task` (one sentence), and
  `walked`, the date you assembled the stack against the catalog. Walking a stack
  re-verifies no licence and changes no entry.
- A lead paragraph, then `##` sections in this order, each optional: Art, Audio, Fonts,
  Tools, Gaps.
- In Art, Audio, Fonts and Tools, every bullet is one pick: the need in bold with a
  colon, a link to the entry's file, a full stop, then why this pick. Copy the shape
  from any stack above.
- The why sentence states facts the entry records. It must not name a licence: licence
  facts come from the entry, so a re-verified entry updates every stack that uses it.
- A pick must be a listed entry. A deprecated pick fails `node site/validate.mjs`;
  repick or move the need to Gaps.
- Gaps: plain bullets for what the catalog does not yet cover for the task. Readers report new gaps with the "Request an asset / report a gap" issue form, which is the queue these bullets are drawn from.

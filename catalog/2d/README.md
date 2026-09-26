# 2D — sprites, GUI, icons, palettes

Do not mix tile grids or camera projections without scaling/reprojection. Typical buckets: **micro** 8–12px (Urizen 12×12, Bit Bonanza 10×10), **standard** 16×16, **dense** 32×32+. `isometric_3_4` (Ninja Adventure, Dungeon Tileset II) is not ortho top-down or side-scroller. Baked 2D character cycles (LuizMelo and similar) live here, not under `animation/`.

Optional frontmatter: `grid_dimensions`, `camera_perspective`, `hardware_tags`.

## Choosing a pixel tileset

Ten CC0 pixel tilesets, and from the outside they look like the same thing ten times.
Grid size and projection are what actually decide it, because **mixing two projections
in one map reads as a bug** and mixing two grids needs integer scaling. Pick the row
that matches the game you are building, not the one with the most tiles.

| If you are building | Take | Grid | View | Why this one |
| --- | --- | ---: | --- | --- |
| A whole RPG, one art style | [kenney-roguelike-rpg-pack](kenney-roguelike-rpg-pack.md) | 16x16 | 3/4 | 1700 tiles: overworld, town, interiors, items and matching UI. Gets a prototype furthest without a second source |
| A small town or overworld | [kenney-tiny-town](kenney-tiny-town.md) | 16x16 | 3/4 | 130 tiles, exteriors only. Pairs exactly with Tiny Dungeon |
| Dungeon interiors | [kenney-tiny-dungeon](kenney-tiny-dungeon.md) | 16x16 | 3/4 | The interior half of the Tiny pair, same grid and style |
| A grittier dungeon | [ox72-dungeontileset-ii](ox72-dungeontileset-ii.md) | 16x16 | 3/4 | Darker palette with characters included; [vol. I](ox72-dungeon-tileset.md) is the older sibling |
| A complete game in one download | [ninja-adventure](ninja-adventure.md) | 16x16 | 3/4 | Tiles **plus** 4-directional characters, UI, VFX, 100+ SFX and 37 music tracks |
| An RPG without the Kenney look | [armm1998-zelda-like](armm1998-zelda-like.md) | 16x16 | 3/4 | Overworld, cave and indoor sets with a 4-directional sword character, single author |
| A true overhead roguelike | [kenney-micro-roguelike](kenney-micro-roguelike.md) | **8x8** | **ortho** | Genuinely top-down, not 3/4. Half the grid of everything else here |
| A turn-based strategy map | [kenney-tiny-battle](kenney-tiny-battle.md) | 16x16 | **ortho** | Roads, rivers, bridges and faction unit markers. Nothing else here covers wargames |
| Enormous variety, one colour | [urizen-onebit](urizen-onebit.md) | **12x12** | 3/4 | 5500+ one-bit tiles across many genres. A third grid size, so commit early |
| A monochrome prototype | [kenney-1-bit-pack](kenney-1-bit-pack.md) | 16x16 | either | 1078 1-bit tiles. Kenney ships both an overworld and a platformer sample, so it is the one set here that works in two projections |

Three grids are in play (8x8, 12x12, 16x16) and they do not mix without scaling.
Two of these are orthographic overhead and the rest are 3/4; the difference is whether
walls show a front face. See `camera_perspective` on each entry, or filter by View on
the site.

**Characters:** only Ninja Adventure and ArMM1998 ship characters that turn.
[kenney-roguelike-characters](kenney-roguelike-characters.md) is front-facing only.

## Choosing an icon set

Eight icon sources are listed and seven of them are permissive UI sets that look
interchangeable. They are not. Pick by what you need, not by licence.

| Need | Take | Why |
| --- | --- | --- |
| A general UI set, no decisions | [lucide-icons](lucide-icons.md) | ISC, actively maintained Feather successor, brand-free, consistent stroke |
| The widest coverage | [tabler-icons](tabler-icons.md) | MIT, the largest outline set here, uniform 24px grid |
| Several weights of one family | [phosphor-icons](phosphor-icons.md) | MIT, six weights including duotone, so emphasis stays on-family |
| Google design language | [material-symbols](material-symbols.md) | Apache-2.0, variable axes for weight, fill and optical size |
| Small and opinionated | [heroicons](heroicons.md) | MIT, fewest icons, chosen not configured |
| App chrome plus some logos | [bootstrap-icons](bootstrap-icons.md) | MIT, broad UI coverage, includes a few brand marks |
| **Brand logos** | [simple-icons](simple-icons.md) | CC0 covers the SVG only. **Trademarks still apply**: identify, do not imply endorsement |
| **Game iconography** | [game-icons-net](game-icons-net.md) | The only set here that is not UI chrome: swords, potions, abilities. **CC-BY-3.0, credit the individual author** |

The last two are the ones to read carefully. Everything above them is a style choice; those
two carry obligations the rest do not.

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [glitch-archive](glitch-archive.md) | Glitch archive | CC0 | yes | active |
| [kenney-ui-pack](kenney-ui-pack.md) | Kenney UI Pack | CC0 | yes | active |
| [playpug-simple-vector-ui](playpug-simple-vector-ui.md) | PlayPug Simple Vector UI | CC0 | yes | active |
| [kenney-puzzle-pack-2](kenney-puzzle-pack-2.md) | Kenney Puzzle Pack 2 | CC0 | yes | active |
| [kenney-playing-cards-pack](kenney-playing-cards-pack.md) | Kenney Playing Cards Pack | CC0 | yes | active |
| [kenney-boardgame-pack](kenney-boardgame-pack.md) | Kenney Board Game Pack | CC0 | yes | active |
| [bondoki-rotating-gems](bondoki-rotating-gems.md) | Rotating Gems for Match-3 (Bondoki) | CC0 | yes | active |
| [sylly-gem-match-3](sylly-gem-match-3.md) | Gem Match 3 Set (Sylly) | CC0 | yes | active |
| [ansimuz-industrial-parallax](ansimuz-industrial-parallax.md) | Industrial Parallax Background (ansimuz) | CC0 | yes | active |
| [gustavo-saraiva-city-parallax](gustavo-saraiva-city-parallax.md) | City Parallax Pixel Art (Gustavo Saraiva) | CC0 | yes | active |
| [kenney-cursor-pack](kenney-cursor-pack.md) | Kenney Cursor Pack | CC0 | yes | active |
| [kenney-pixel-platformer](kenney-pixel-platformer.md) | Kenney Pixel Platformer | CC0 | yes | active |
| [kenney-1-bit-pack](kenney-1-bit-pack.md) | Kenney 1-Bit Pack | CC0 | yes | active |
| [kenney-tiny-dungeon](kenney-tiny-dungeon.md) | Kenney Tiny Dungeon | CC0 | yes | active |
| [kenney-roguelike-rpg-pack](kenney-roguelike-rpg-pack.md) | Kenney Roguelike/RPG Pack | CC0 | yes | active |
| [kenney-roguelike-characters](kenney-roguelike-characters.md) | Kenney Roguelike Characters | CC0 | yes | active |
| [kenney-tiny-town](kenney-tiny-town.md) | Kenney Tiny Town | CC0 | yes | active |
| [kenney-tiny-battle](kenney-tiny-battle.md) | Kenney Tiny Battle | CC0 | yes | active |
| [kenney-micro-roguelike](kenney-micro-roguelike.md) | Kenney Micro Roguelike | CC0 | yes | active |
| [armm1998-zelda-like](armm1998-zelda-like.md) | Zelda-like tilesets (ArMM1998) | CC0 | yes | active |
| [kenney-pixel-vehicle-pack](kenney-pixel-vehicle-pack.md) | Kenney Pixel Vehicle Pack | CC0 | yes | active |
| [kenney-input-prompts](kenney-input-prompts.md) | Kenney Input Prompts | CC0 | yes | active |
| [ox72-dungeon-tileset](ox72-dungeon-tileset.md) | 0x72 Dungeon Tileset | CC0 | yes | active |
| [ox72-dungeontileset-ii](ox72-dungeontileset-ii.md) | 0x72 Dungeon Tileset II | CC0 | yes | active |
| [ninja-adventure](ninja-adventure.md) | Ninja Adventure | CC0 | yes | active |
| [sparklin-superpowers](sparklin-superpowers.md) | Sparklin Superpowers packs | CC0 | yes | active |
| [screaming-brain-studios](screaming-brain-studios.md) | Screaming Brain Studios iso tiles | CC0 | yes | active |
| [gameart2d-freebies](gameart2d-freebies.md) | GameArt2D freebies | CC0 | yes | active |
| [bit-bonanza](bit-bonanza.md) | Bit Bonanza | CC0 | yes | active |
| [urizen-onebit](urizen-onebit.md) | Urizen 1Bit | CC0 | yes | active |
| [openpeeps](openpeeps.md) | Open Peeps | CC0 | yes | active |
| [paleto-vol01](paleto-vol01.md) | Paleto Vol.01 | CC0 | yes | active |
| [pixel-frog](pixel-frog.md) | Pixel Frog | varies | varies | active |
| [ansimuz-sunnyland](ansimuz-sunnyland.md) | SunnyLand (ansimuz) | CC0 | yes | active |
| [luizmelo-martial-hero](luizmelo-martial-hero.md) | LuizMelo Martial Hero | CC0 | yes | active |
| [luizmelo-evil-wizard](luizmelo-evil-wizard.md) | LuizMelo Evil Wizard | CC0 | yes | active |
| [luizmelo-monsters-creatures-fantasy](luizmelo-monsters-creatures-fantasy.md) | LuizMelo Monsters Fantasy | CC0 | yes | active |
| [penzilla](penzilla.md) | Penzilla | custom | yes | needs-review |
| [material-symbols](material-symbols.md) | Material Symbols | Apache-2.0 | yes | active |
| [craftpix](craftpix.md) | CraftPix freebies | custom | yes | active |
| [game-icons-net](game-icons-net.md) | Game-Icons.net | CC-BY-3.0 | yes | active |
| [lucide-icons](lucide-icons.md) | Lucide Icons | ISC | yes | active |
| [phosphor-icons](phosphor-icons.md) | Phosphor Icons | MIT | yes | active |
| [tabler-icons](tabler-icons.md) | Tabler Icons | MIT | yes | active |
| [heroicons](heroicons.md) | Heroicons | MIT | yes | active |
| [bootstrap-icons](bootstrap-icons.md) | Bootstrap Icons | MIT | yes | active |
| [simple-icons](simple-icons.md) | Simple Icons | CC0 | yes†† | active |
| [xelu-input-prompts](xelu-input-prompts.md) | Xelu input prompts | CC0 | yes | active |
| [universal-lpc-generator](universal-lpc-generator.md) | Universal LPC Generator | varies (SA) | varies† | active |
| [lpc-revised-basics](lpc-revised-basics.md) | LPC Revised Basics | varies (OGA-BY for every item) | yes | active |
| [openclipart](openclipart.md) | Openclipart | CC0 | yes | active |
| [opengameart](opengameart.md) | OpenGameArt | varies | yes | needs-review |
| [lospec](lospec.md) | Lospec | varies | unknown | needs-review |
| [dcss-tiles](dcss-tiles.md) | Dungeon Crawl Stone Soup Tiles | varies | unknown | needs-review |

† Commercial OK with attribution + share-alike / GPL obligations on asset derivatives — see [`docs/high-risk.md`](../../docs/high-risk.md).  
†† CC0 on SVG copyright; brand trademarks still apply — identify brands only.

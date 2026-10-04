# Audio — SFX, music, foley

## SFX & libraries

### Choosing sound effects

Most sound-effect sources here are free for games with no credit owed, so the licence
column rarely decides it. Coverage, file quality and the restrictions beyond credit do.
Checked at the sources on 2026-09-23:

| You need | Take | Credit owed | Watch for |
| --- | --- | --- | --- |
| A big professional library | [sonniss-gdc](sonniss-gdc.md) | None | Multi-GB WAV bundles. Licensed for media production only, and **AI training is banned** |
| UI clicks and menu feedback | [kenney-interface-sounds](kenney-interface-sounds.md) (100) or [kenney-ui-audio](kenney-ui-audio.md) (50) | None, CC0 | Interface Sounds is the broader set |
| Punches, thuds, impacts | [kenney-impact-sounds](kenney-impact-sounds.md) | None, CC0 | 130 clips; built for prototyping |
| Lasers, thrusters, sci-fi blips | [kenney-sci-fi-sounds](kenney-sci-fi-sounds.md) | None, CC0 | 70 clips |
| Real-world foley and field recordings | [bigsoundbank](bigsoundbank.md) | None | CC0 applies only to files marked "Free and Royalty Free" |
| Footsteps on many surfaces | [congusbongus-footsteps-surfaces](congusbongus-footsteps-surfaces.md) | **Required**, CC-BY-3.0 | Derived from named Freesound contributors; keep the pack's credits |
| Footsteps, no credit | [gboxmikefozzy-footsteps](gboxmikefozzy-footsteps.md), [fesliyan-footsteps](fesliyan-footsteps.md) or [kenney-rpg-audio](kenney-rpg-audio.md) | None | Gbox is a small real recording; Fesliyan's music is under a separate paid policy |
| A searchable pool, no credit | [pixabay-audio](pixabay-audio.md) or [mixkit-sfx](mixkit-sfx.md) | None | Pixabay bars redistributing its sounds as a pack; Mixkit bars redistributing them "on its own, as stock, in a tool or template". Inside a game is fine for both. Mixkit is a broad filler rather than a game-focused library |
| A large library, and credit is fine | [zapsplat](zapsplat.md) | **Required on the free tier** | **Free tier is MP3 only**, with download limits; WAV needs Premium |
| Anything at all | [freesound](freesound.md) | Per sound | Licences vary by upload, including non-commercial ones; filter to CC0 or CC-BY |

**Content ID reaches sound effects too, just indirectly.** Freesound's FAQ explains how:
musicians drop "raw", unedited sounds from free libraries into songs and register the
songs with YouTube Content ID, and from then on any video containing that same raw sound
can be matched. ZapSplat's licence likewise says automated systems "may, on rare
occasions, generate mistaken or unjustified claims". Freesound describes this for its own
library, but the mechanism works on any sound that many people download, CC0 included.
The defence is the one sound designers use anyway: **process sounds before you ship
them.** Freesound notes that pitching, stretching or running a sound through plugins makes
a match less likely. As with music, this protects your players' videos as much as yours.
Sonniss, Fesliyan and BigSoundBank say nothing on Content ID. Mixkit's licence forbids
registering its sounds "on any rights management service", which is the step that causes
these matches, but that binds downloaders who read it, not everyone.

**Impulse responses** (below) are the one place where shipping changes what you owe.
Baking reverb into your sounds offline does not ship the IR file. Convolving at runtime
does, and [adventure-kid-irs](adventure-kid-irs.md) asks for credit when its IRs are
redistributed "in software". [voxengo-impulses](voxengo-impulses.md) owes nothing unless
you sell or redistribute the IR files as a standalone product.

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [sonniss-gdc](sonniss-gdc.md) | Sonniss #GameAudioGDC | custom | yes | active |
| [kenney-rpg-audio](kenney-rpg-audio.md) | Kenney RPG Audio | CC0 | yes | active |
| [kenney-impact-sounds](kenney-impact-sounds.md) | Kenney Impact Sounds | CC0 | yes | active |
| [kenney-ui-audio](kenney-ui-audio.md) | Kenney UI Audio | CC0 | yes | active |
| [kenney-interface-sounds](kenney-interface-sounds.md) | Kenney Interface Sounds | CC0 | yes | active |
| [kenney-sci-fi-sounds](kenney-sci-fi-sounds.md) | Kenney Sci-fi Sounds | CC0 | yes | active |
| [gboxmikefozzy-footsteps](gboxmikefozzy-footsteps.md) | GboxMikeFozzy Footsteps | CC0 | yes | active |
| [congusbongus-footsteps-surfaces](congusbongus-footsteps-surfaces.md) | Congusbongus Footsteps | CC-BY-3.0 | yes | active |
| [fesliyan-footsteps](fesliyan-footsteps.md) | Fesliyan Footsteps | custom | yes | active |
| [mixkit-sfx](mixkit-sfx.md) | Mixkit Sound Effects | custom | yes | active |
| [bigsoundbank](bigsoundbank.md) | BigSoundBank | CC0 | yes | active |
| [pixabay-audio](pixabay-audio.md) | Pixabay Audio | custom | yes | active |
| [zapsplat](zapsplat.md) | Zapsplat | custom | yes† | active |
| [freesound](freesound.md) | Freesound | varies | filter | needs-review |
| [budgetpixel-sfx](budgetpixel-sfx.md) | BudgetPixel Sound Effects | CC-BY-4.0 | yes | active |
| [octave-ui-sounds](octave-ui-sounds.md) | Octave | custom | yes | active |
| [pacdv](pacdv.md) | PacDV Free Sound Effects | custom | unknown | needs-review |
| [soundbible](soundbible.md) | SoundBible | varies | filter | needs-review |

† Zapsplat's basic (free) tier requires attribution; Premium does not.

## Impulse responses

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [voxengo-impulses](voxengo-impulses.md) | Voxengo Free IRs | custom | yes | active |
| [adventure-kid-irs](adventure-kid-irs.md) | Adventure Kid IRs (AKRT) | CC-BY-4.0 | yes | active |
| [echothief](echothief.md) | EchoThief IRs | custom | no (games need a separate licence) | needs-review |
| [convology-xt](convology-xt.md) | Convology XT Free Factory | custom | unknown | needs-review |

## Music

### Choosing game music

Two questions decide it, and the licence column answers only the first.

**Do you owe a credit?** Five of the eight active sources owe nothing.

**Will videos of your game get claimed?** This is the one that bites later, and it bites
your players rather than you. A track registered with YouTube's Content ID gets matched in
any video that contains it. A licence that lets you ship the track does not stop that, and
an in-game credits screen shown on camera is not something YouTube reads. If you want
streamers and let's-players to post your game freely, choose music that is not fingerprinted.
Checked at each source on 2026-09-23:

| You need | Take | Credit owed | Content ID, per the source | Form |
| --- | --- | --- | --- | --- |
| Level-complete, pickup and menu cues | [kenney-music-jingles](kenney-music-jingles.md) | None, CC0 | Not addressed | 85 short stingers |
| Background loops, no strings | [tallbeard-abstraction-music-loop-bundle](tallbeard-abstraction-music-loop-bundle.md) | None, CC0 | Not addressed | 200+ loops |
| Full tracks, no credit | [filmmusic-ende](filmmusic-ende.md) | None; the author waives the CC BY credit | **Forbids anyone registering the tracks**; allows monetised YouTube and Twitch | Tracks |
| A huge library, and credit is fine | [incompetech](incompetech.md) | **Required** | **Claims likely unless each video carries the credit in its description text** | Tracks |
| Loops and atmospheres, and credit is fine | [soundimage](soundimage.md) | **Required, in the game itself** | Not addressed | Loop-oriented; use the Ogg files for looping |
| A big searchable pool, no credit | [pixabay-audio](pixabay-audio.md) | None | **Some tracks are fingerprinted.** Filter for unflagged ones, then verify | Tracks and SFX |
| A small chiptune soundtrack, no strings | [subspaceaudio-5-chiptunes](subspaceaudio-5-chiptunes.md) | None, CC0 | Not addressed | 5 looping WAV tracks: title, three levels, ending |
| A full chiptune album, and credit is fine | [eric-skiff-resistor-anthems](eric-skiff-resistor-anthems.md) | **Required**, in a set form | Not addressed | 18 MP3 tracks |

"Not addressed" means the source says nothing either way, not that it is safe. CC0 music
can still be registered by a third party, so check a track in YouTube Studio before you
build a trailer around it.

The three aggregators below (ccMixter, Free Music Archive, Musopen) license per track.
Some of their tracks are non-commercial or no-derivatives, which rules them out for a
game; read each track's licence. FreePD and Purple Planet are deprecated because the
sites are gone.

| ID | Name | License | Commercial | Status |
| --- | --- | --- | --- | --- |
| [incompetech](incompetech.md) | Incompetech | CC-BY-4.0 | yes | active |
| [filmmusic-ende](filmmusic-ende.md) | FilmMusic / Sascha Ende | CC-BY-4.0 | yes | active |
| [soundimage](soundimage.md) | Soundimage.org | custom | yes | active |
| [purple-planet](purple-planet.md) | Purple Planet | custom | unknown | deprecated |
| [kenney-music-jingles](kenney-music-jingles.md) | Kenney Music Jingles | CC0 | yes | active |
| [tallbeard-abstraction-music-loop-bundle](tallbeard-abstraction-music-loop-bundle.md) | Abstraction Music Loop Bundle | CC0 | yes | active |
| [subspaceaudio-5-chiptunes](subspaceaudio-5-chiptunes.md) | 5 Chiptunes (Action), SubspaceAudio | CC0 | yes | active |
| [eric-skiff-resistor-anthems](eric-skiff-resistor-anthems.md) | Eric Skiff, Resistor Anthems | CC-BY-4.0 | yes | active |
| [freepd](freepd.md) | FreePD | unknown | unknown | deprecated |
| [free-music-archive](free-music-archive.md) | Free Music Archive | varies | filter | needs-review |
| [ccmixter](ccmixter.md) | ccMixter | varies | filter | needs-review |
| [musopen](musopen.md) | Musopen | varies (PD Mark / CC BY-NC-SA) | varies | needs-review |

Avoid **ND**-licensed music in games — see [`docs/licenses.md`](../../docs/licenses.md) / [`docs/high-risk.md`](../../docs/high-risk.md).

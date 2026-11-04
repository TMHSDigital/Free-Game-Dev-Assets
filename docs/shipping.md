# Shipping to Steam, consoles and app stores

Most free-asset licences were written for files you hand to someone else, not for a
game sold through a store that wraps it in DRM, signs it, and forbids users from
changing it. Three clauses cause most of the trouble at release time: the CC-BY
anti-DRM clause, copyleft terms against app-store terms, and LGPL's relinking rule on
platforms that allow no dynamic linking. Steam also asks you to disclose AI content.
Each section quotes the licence text it relies on, with the date it was read. This is
the catalog's reading, not legal advice.

## The CC-BY anti-DRM clause

The Creative Commons licences with conditions (CC BY and its variants; not CC0) forbid
you to use technical measures to stop others from using the work as the licence allows.

- **CC BY 3.0**, Section 4(a), read 2026-11-03: "When You Distribute or Publicly Perform
  the Work, You may not impose any effective technological measures on the Work that
  restrict the ability of a recipient of the Work from You to exercise the rights
  granted to that recipient under the terms of the License."
- **CC BY 4.0**, Section 2(a)(5)(B), read 2026-11-03: "You may not offer or impose any
  additional or different terms or conditions on, or apply any Effective Technological
  Measures to, the Licensed Material if doing so restricts exercise of the Licensed
  Rights by any recipient of the Licensed Material."

4.0 adds a release valve that 3.0 does not have. Section 2(a)(4), read 2026-11-03: the
licensor "waives and/or agrees not to assert any right or authority to forbid You from
making technical modifications necessary to exercise the Licensed Rights, including
technical modifications necessary to circumvent Effective Technological Measures."
Under 4.0, a recipient may lawfully get the work out of your DRM-wrapped build, which
is the usual argument that a 4.0 asset can ship in a Steam, console or mobile build.
The no-DRM sentence is still in 4.0, though, so CC0 remains the only choice with no
question at all. Under 3.0 the restriction stands with no such waiver, so a CC BY 3.0
asset inside an encrypted or signed package is the riskier case.

What to do:

- Prefer CC0 or CC BY 4.0 for anything that ships inside a protected build. The
  [LPC Revised Basics](../catalog/2d/lpc-revised-basics.md) entry takes the OGA-BY
  versions of its sprites for exactly this reason: OGA-BY 3.0 is CC-BY without the
  anti-DRM clause.
- For a CC BY 3.0 asset you need, ask the author for a waiver or a 4.0 or OGA-BY
  licence, or ship the file where players can reach it (a loose file beside the
  executable rather than inside an encrypted package).
- Share-alike (CC-BY-SA) licences carry the same clause, as well as their copyleft.

## App stores and copyleft

Store terms of use can restrict copying and changing what a customer downloads, which
sits badly with licences that require every recipient to be free to do both. The
[OpenGameArt](../catalog/2d/opengameart.md) FAQ, read 2026-09-26, answers the question of
using its art on the Apple App Store with "Not necessarily": Apple's terms "conflict
with the terms of the GNU GPL, the GNU LGPL, CC-BY-SA, and CC-BY". The catalog's advice
for an App Store build is to prefer CC0, OGA-BY or a permissive code licence (MIT, BSD,
Apache-2.0), or to get the author's written consent first.

The same reasoning applies to GPL code you link into the game: a store build is a
distribution, and you cannot meet the GPL's terms if the store forbids what the GPL
grants. GPL tools you only use to make assets, such as an editor, are a different case;
see [the licence guide](licenses.md).

## LGPL on consoles and closed platforms

LGPL lets you ship a closed-source game that uses the library only if users can swap in
a modified copy of the library.

- **LGPL 2.1**, Section 6, read 2026-11-03: you may "combine or link a 'work that uses the
  Library' with the Library to produce a work containing portions of the Library, and
  distribute that work under terms of your choice, provided that the terms permit
  modification of the work for the customer's own use and reverse engineering for
  debugging such modifications."
- **LGPL 3.0**, Section 4(d), read 2026-11-03: you must either convey the source and
  application code "in a form suitable for, and under terms that permit, the user to
  recombine or relink the Application with a modified version of the Linked Version",
  or "Use a suitable shared library mechanism for linking with the Library. A suitable
  mechanism is one that (a) uses at run time a copy of the Library already present on
  the user's computer system, and (b) will operate properly with a modified version of
  the Library".

On a console or other platform that only runs signed code and allows no user-supplied
libraries, the user can neither relink nor drop in a modified library, so neither
option can be met in practice, so an LGPL library is not a safe choice there. On desktop, a dynamically
linked LGPL library (a `.dll`, `.so` or `.dylib` beside the game) is the normal way to
comply. The Unreal Engine EULA forbids combining the engine with GPL or LGPL code
altogether; see [the Unreal guide](unreal.md).

## Steam's AI disclosure

Steam's Content Survey asks about AI-made content that ships with your game. The quote,
and what it means for an entry tagged `ai-generated`, are in
[the AI assets guide](ai-assets.md).

## Before you submit

1. List every third-party asset and library in the build, with its licence.
2. CC BY 3.0, CC-BY-SA, GPL or LGPL in a console, iOS or other locked-down build: replace
   it, get the author's consent, or keep it out of that build.
3. LGPL on desktop: link it dynamically and ship its licence and source offer.
4. Ship your credits and licence notices; see [the licence guide](licenses.md).
5. AI-made content: fill in the Content Survey's AI section.

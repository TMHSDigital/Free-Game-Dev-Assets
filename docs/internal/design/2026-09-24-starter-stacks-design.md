# Design: starter stacks

Date: 2026-09-24. Status: implemented; see the entry for it in `docs/review-ledger.md`.

## Why

Sub-project A from the site brainstorm. The site now has a page per entry (sub-project B,
shipped 2026-09-24), but a visitor still has to assemble a game's assets themselves:
search for characters, then music, then a font, then work out what the whole set owes.
People ask AI assistants exactly that question ("free assets for a 2D platformer I can
sell"), and the catalog already has five tested answers: the task tests A to E recorded
in `docs/review-ledger.md`, each walked end to end against the catalog.

Goals, from the maintainer: be useful to visitors, reach more people, look credible.

## What success looks like

- A solo developer starting a game of one of five kinds opens one page and gets one
  pick per need, why that pick, and a single list of what the whole set owes.
- Every licence fact on a stack page comes from the entries at build time, so a stack
  never disagrees with an entry and a re-verified entry updates every stack using it.
- What the catalog does not cover for a task is stated on the page, not hidden.

## Decisions taken

| Question | Decision |
| --- | --- |
| Audience | Solo developers starting out |
| First release | The five task tests: 3D low-poly arena, 2D top-down pixel, first-person destruction, 2D pixel platformer, mobile puzzle |
| Engine | Engine-neutral, with format friction noted per pick; engine add-ons only where the task named an engine (the 3D arena, Godot) |
| Authoring | One markdown file per stack with a strict pick-line format |
| Combined credits | A "Copy all credits" button alongside per-pick Copy buttons |
| Deprecated pick | Fails validation and the build |

## The stack file

Each stack is `stacks/<id>.md`. Frontmatter holds flat fields only, which the existing
parser reads:

- `id`: kebab-case, unique among stacks.
- `title`: the page title, a task phrased as an action ("Make a 2D pixel platformer").
- `task`: one sentence naming the game and the intent to sell it.
- `walked`: the date the stack was assembled against the catalog. It is deliberately not
  called `verified`: walking a stack re-verifies no licence, and moves no entry's
  `verified` date.

The body:

- A lead paragraph before the first `##`: who the stack is for and what it assumes
  (engine, style, perspective).
- `##` sections, in this order, each optional: `Art`, `Audio`, `Fonts`, `Tools`, `Gaps`.
  Any other `##` heading is an error.
- In Art, Audio, Fonts and Tools, every bullet is a pick line: the need in bold followed
  by a colon, then a markdown link to the picked entry's file, then a full stop and one
  or more sentences on why this pick and any friction (format, filtering, perspective).
  The first link in the line is the pick. Later links in the same line are ordinary
  links and do not count as picks.
- `Gaps` holds plain bullets: what the catalog does not yet cover for this task, taken
  from the task test's recorded leave points.

Rules on picks:

- The pick must link an existing entry whose status is not `deprecated`.
- A `needs-review` pick is allowed and is flagged on the page.
- One pick per need. Where two sources honestly split a need, it becomes two needs
  ("Music, no credit" and "Music, with credit").
- A why sentence must not state a licence. It is checked against the licence ids in
  `site/license-vocabulary.json` and `site/spdx-allowed.json` (whole words, case
  sensitive, excluding ids that are ordinary lower-case words such as `custom`,
  `unknown` and `varies`) and the phrases "Creative Commons", "public domain" and
  "royalty-free" (any case). Licence facts come from the entry.

## The stack page

Built at `/stack/<id>/`, from the stack file and the picked entries.

- Breadcrumb (Catalog / Stacks / title), the title as the one `h1`, the task sentence
  and the lead.
- **What this stack owes**, computed from the picks:
  - Credits to ship: each pick with `attribution_required: true`, showing its credit
    line with a Copy button, or "no canned credit line: see the entry" where it has
    none. A "Copy all credits" button copies every canned line as one block, one per
    line.
  - No credit needed: the count and names of picks with `attribution_required: false`.
  - Check each file: picks with `commercial: varies`, with "Some files qualify, some do
    not."
  - Open questions: `needs-review` picks, each with its entry's status note.
  - Unclear credit: picks whose `attribution_required` is neither true nor false.
- Sections: one row per pick with the need, the entry name linked to its entry page,
  the entry's licence and commercial label, the why sentence, and the entry's verified
  age with the same aging cue as the homepage cards.
- Gaps, when the file has them.
- A closing line: "Stack walked <walked>. Each licence is only as current as its entry's
  verified date."
- Canonical URL, description, social tags and JSON-LD (`ItemList` of the picked entry
  pages). The page works without JavaScript; the only script is the Copy buttons, and
  only when the page has at least one canned credit line.

Links in:

- The homepage gets a "Starter stacks" section above "Safe starting points": one line
  per stack with its title and task.
- Each picked entry's page lists "Used in" with links to its stacks.
- `sitemap.xml` lists each stack page.
- `llms.txt` gets a stacks section at the top; `llms-full.txt` carries each stack's
  picks with their needs, entry page URLs and the owed list.

## Build and validation

- `site/lib/stacks.mjs`, pure functions:
  - `parseStack(md, file)`: frontmatter, lead, sections, picks and gaps; throws
    `StackError` naming the file and line on any rule above.
  - `owes(picks, entriesById)`: `{ credits, noCredit, perFile, openQuestions, unclear }`.
  - `stackPageHtml(...)`: the page.
- `site/build.mjs` loads `stacks/*.md` after the entries, resolves each pick through the
  existing link resolver, writes `dist/stack/<id>/index.html`, and runs every stack page
  through the existing page checks. It exits 1 on any `StackError`, `LinkError` or page
  check error. Stack pick text is rendered with the existing renderer.
- `site/validate.mjs` gains V15, which applies `parseStack` and the pick rules to every
  stack file, so `node site/validate.mjs` alone reports stack errors. Build and
  validator share `site/lib/stacks.mjs`, so the rules cannot drift.
- A deprecated or missing pick fails both; the fix is to repick or move the need to
  Gaps.
- A duplicate stack `id` fails both.

## Content

- Five stacks, one per task test, picks drawn from what that walk found:
  - `3d-low-poly-arena-godot` (task A)
  - `2d-top-down-pixel` (task B)
  - `first-person-destruction` (task C)
  - `2d-pixel-platformer` (task D)
  - `mobile-puzzle` (task E)
- Every pick is read from its entry file on the day of writing; no source is re-fetched
  for the stack and no entry changes.
- Why sentences state only facts the entry records (formats, counts, perspective,
  friction). Gaps restate the ledger's leave points and name the ledger date.
- Repo style: no emojis, no em dashes, no marketing voice. Prefer removing a claim over
  softening it.

## Testing

- `site/lib/lib.test.mjs`: `parseStack` on a good file and on each malformed shape
  (unknown section, pick line without a link, pick line without the bold need, licence
  name in a why sentence) with file and line; `owes` for every bucket, including a
  required credit with no canned line; `stackPageHtml` for escaping of names and credit
  lines, one `h1`, canonical, Copy script present only with a canned credit line, and
  the Copy all block joining lines in pick order.
- `site/checks.test.mjs`: V15 pass and fail cases per rule, including a deprecated and a
  missing pick and a duplicate id.
- Gate proof: point one pick at a deprecated entry; build and validator both exit 1
  naming the stack file and line; revert by the inverse edit.
- Browser: both Copy buttons copy; the page works without JavaScript; no horizontal
  scroll at 375px; no text below AA contrast in light and dark; homepage section and
  "Used in" links resolve; zero console errors.
- Live after deploy: five stack pages return 200; `sitemap.xml` has 323 URLs; the
  stacks appear in `llms.txt`.

## Risks

- **A stack reads as an endorsement of fitness.** The page states the task and the
  assumptions, and the closing line ties every licence to its entry's date.
- **Picks go stale when an entry changes.** Licence facts are read at build time; only
  the why sentence can drift, and it is limited to facts the entry records.
- **Copy all credits used for assets not shipped.** The button sits under the list
  that names each asset beside its credit line, so a reader sees what the block holds
  and can drop lines for assets they do not ship.

## Out of scope

- Stacks for further engines, user-submitted stacks, and stacks beyond these five.
- Pages for category READMEs and `docs/` guides.
- Folding `docs/godot-budget-stack.md` into the stack format.

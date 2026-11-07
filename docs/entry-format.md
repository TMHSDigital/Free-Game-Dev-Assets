# Reading an entry

How a catalog entry is laid out and what its fields mean. The rules for writing one are in [CONTRIBUTING.md](../CONTRIBUTING.md#frontmatter-rules).

Each source is one Markdown file: frontmatter for the facts, then notes on what it is good
for, what the catch is, and a dated **Evidence** section quoting the live licence page.

| Status | Meaning | What to do |
| :--- | :--- | :--- |
| 🟢 `active` | Licence read at the source and quoted with a date | Suitable to evaluate for production |
| 🟡 `needs-review` | Useful, but a real question is still open, and the entry says which | Verify before shipping |
| ⚪ `deprecated` | Kept for history, with the reason stated | Use an alternative |

`verified` is the date someone last read the licence at the source. The website shows its
age on every row and marks it once it passes a year; at that point, re-read the licence
yourself before you rely on it.

Aggregators (OpenGameArt, Poly Pizza, itch collections, font indexes) are usually `license: varies`.
The licence belongs to each file, not to the site or even to the author, so review every
file you take.

<details>
<summary>Frontmatter fields</summary>

| Field | Meaning |
| :--- | :--- |
| `license` | Licence as the source states it, from a closed vocabulary in [`site/license-vocabulary.json`](../site/license-vocabulary.json) (`CC0`, `CC-BY-4.0`, `SIL OFL`, `GPL-3.0-or-later`, `custom`, `varies`, and so on) |
| `license_spdx` | The SPDX identifier, whenever the licence maps to exactly one. Absent when there is no single identifier: `custom`, `varies`, `unknown`, public domain, unversioned `CC-BY`, and GPL values that do not say `-only` or `-or-later` |
| `commercial` | `true`, `false`, `unknown` or `varies`. `varies` means per-file review; the site's Commercial OK filter still lists these, labelled **per-file review** |
| `attribution_required` | `true`, `false` or `unknown`. For fonts, `false` means no credit line, not no obligation: see [`docs/fonts.md`](fonts.md) |
| `attribution_string` | Copy-paste credit line, present when attribution is required |
| `formats` | Common download and interchange formats |
| `verified` | Date the licence was last read at the source (`YYYY-MM-DD`) |
| `status` | See the table above |
| `publisher` | The rights holder, when it has more than one entry. Never a generic host |
| `grid_dimensions`, `camera_perspective`, `hardware_tags` | Optional 2D metadata: tile size, projection (`top_down`, `isometric_3_4`, `side_scroller`, `2d_flat`), input-device coverage |

Add a new source from [`catalog/TEMPLATE.md`](../catalog/TEMPLATE.md). `id` must be unique across the whole catalog.

</details>

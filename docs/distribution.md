# Distribution checklist

Where the catalog has been listed or announced, and where it still could be (#118). A living checklist: add the date and a link when an item is done, and a note when a list declines. Read each list's contribution rules before submitting; most want one line in an existing section, in their own format, and some ask for a minimum age or star count.

The landing pages for posts: the [catalog](https://tmhsdigital.github.io/Free-Game-Dev-Assets/), [How each licence is read](method.md) for the method, and [Use the data](data.md) for the dataset. A draft announcement is in [launch-post.md](launch-post.md).

## Curated lists

Each open pull request to another repository has a tracking issue here, labelled `outreach` and titled with the reference ("Outreach: magictools (ellisonleao/magictools#538)"). A daily workflow (`.github/workflows/outreach-prs.yml`, `site/outreach-prs.mjs`) comments on the tracking issue when someone reviews or comments, and closes it when the pull request is merged or closed. To track a new one, open an issue in that shape; the first run records its state quietly.

| Target | What to add | Status |
| --- | --- | --- |
| magictools | One line under the assets or resources section | PR [ellisonleao/magictools#538](https://github.com/ellisonleao/magictools/pull/538) opened 2026-11-18 (replaces #418, closed after the list's new submission rules) |
| awesome-gamedev | One line under free assets | PR [Calinou/awesome-gamedev#98](https://github.com/Calinou/awesome-gamedev/pull/98) open since 2026-09-25, still mergeable on 2026-11-18 |
| awesome-godot | The Godot plugin under Plugins and scripts, Godot 4 | PR [Calinou/awesome-godot#555](https://github.com/Calinou/awesome-godot/pull/555) opened 2026-11-18 |
| awesome-unity3d (insthync) | One line under Collections / Forums / Shops | PR [insthync/awesome-unity3d#73](https://github.com/insthync/awesome-unity3d/pull/73) opened 2026-11-18. RyanNielson/awesome-unity is archived |
| Awesome Unreal Engine 4/5 (aiekick) | One line under Assets | PR [aiekick/Awesome_Unreal_Engine_4_-_5#10](https://github.com/aiekick/Awesome_Unreal_Engine_4_-_5/pull/10) opened 2026-11-18. insthync/awesome-unreal lists code repositories only (no resources section); terrehbyte/awesome-ue4 is inactive since 2023 |
| A CC0 / public-domain awesome list | One line; the catalog's metadata is CC0 | Skipped 2026-11-18: madjin/awesome-cc0, the only active-looking one, has had no push since 2024 and five unmerged PRs |
| Engine docs "community resources" pages | Only where the engine accepts external links | |

## Dataset hubs

| Target | What to publish | Status |
| --- | --- | --- |
| Hugging Face Datasets | `data.json` and `catalog.csv` with the field table from [data.md](data.md) as the dataset card; CC0 | Published 2026-11-18: [TMHS/free-game-dev-assets](https://huggingface.co/datasets/TMHS/free-game-dev-assets), a dated snapshot whose card points at the live files |
| Kaggle Datasets | `catalog.csv` with the same field table; CC0 | |

Keep each hub copy pointing at the live files, or re-upload on a schedule, so it does not drift from the catalog.

## Communities (one post each, link the method page)

| Target | Angle | Status |
| --- | --- | --- |
| r/gamedev | "Every licence quoted and dated": the method, not a list dump | |
| r/godot and the Godot forum | The Godot stacks and the Godot plugin | |
| itch.io community | Jam stacks: assets that need no credit | |
| Hacker News (Show HN) | The validator and the data: a catalog that fails its own build when a claim has no evidence | |
| Mastodon and Bluesky game-dev tags | Short post with one entry's card as the image | |

## Game jams (#188)

| Target | What to send | Status |
| --- | --- | --- |
| Organisers of upcoming itch.io jams | The three jam stacks: 2D no-credit, 3D low-poly, audio in 10 minutes | |
| Recurring large jams with resource pages | The same, for their resources page | |

## Publishers

| Target | What to ask | Status |
| --- | --- | --- |
| Listed publishers | Link back with the entry badge ([For publishers](for-publishers.md#link-to-your-entry)) | |

## Results

Record stars, referrers (GitHub Insights > Traffic) and GoatCounter visits before and after each push, so the "step change" in #118 can be shown rather than guessed.

| Date | Stars | Notes |
| --- | --- | --- |
| 2026-11-18 | | Checklist created |

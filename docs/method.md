# How each licence is read

Most lists of free game assets say "free" and link out. This catalog does something narrower and slower: for every source, someone opened the page where the licence is stated, quoted the words that matter, and wrote down the date they read them.

## What an entry records

- **What the licence says.** The `license` field holds a value from a closed vocabulary, mapped to its SPDX identifier where one exists. `commercial` and `attribution_required` say whether a commercial game may use it and whether it must credit the author, each as `true`, `false`, `unknown` or `varies`.
- **Where it says it.** The Evidence section quotes the licence text and links the page it came from. When that page is not the source's own page (a terms page, a LICENSE file, a FAQ), `license_url` names it, and the entry page shows it as "Licence text".
- **When it was read.** Every Evidence quote carries a date, and `verified` is the date of the newest one. The validator refuses a `verified` date that no Evidence line backs, so a date cannot be bumped without a fresh quote.

## What "unsure" looks like

An entry never guesses. If the source does not say plainly, the field says `unknown` and the entry's status is `needs-review`, with a "Review" line naming the open question. An aggregator whose licence is set per file is `per-item`, with a line saying how to read each file's licence on that site. Those statuses are shown on every card, and a filter can hide them.

## How it stays current

- A weekly link check reports sources whose pages moved, died or changed hosts, and licence pages that no longer load.
- A monthly re-verify batch lists the entries whose licence was read longest ago, so the oldest readings are re-read first. The [freshness page](https://tmhsdigital.github.io/Free-Game-Dev-Assets/freshness/) shows how old each reading is.
- Every review pass, and every correction it made, is written up in the [changelog](review-ledger.md).

## What it is not

The catalog is a reading of each licence, not legal advice, and it links to sources rather than hosting any files. Licences change: re-check the live page before you ship, and if a reading is wrong, the [correction form](https://github.com/TMHSDigital/Free-Game-Dev-Assets/issues/new/choose) is the fastest way to fix it for everyone.

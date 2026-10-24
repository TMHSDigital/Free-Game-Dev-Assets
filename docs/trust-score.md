# Trust score rubric (0–5)

A mental model for judging a source while reviewing it. The score is not recorded on entries; use it to decide how hard to look before an entry goes `active`.

| Score | Meaning |
| --- | --- |
| **5** | Official / institutional source, stable URL, explicit license page, long track record (e.g. Kenney, Poly Haven, JAXA, Blender Studio) |
| **4** | Well-known maintainer + clear SPDX/CC text; minor caveats |
| **3** | Usable but license varies per item, or freemium caps need re-check |
| **2** | Aggregator / community dump — filter heavily; provenance uneven |
| **1** | Thin documentation; anonymous uploader; conflicting license claims |
| **0** | Blocklist / known trap — see [`high-risk.md`](high-risk.md) |

Bump score down for: NC/ND clauses, engine-lock, AI free-tier ownership fog, abandoned upstream.

Re-verify licenses periodically; dead links → `status: deprecated` or fix URL.

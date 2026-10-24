#!/usr/bin/env node
/**
 * Fixture suite for the checks added in batch B. Run: node site/checks.test.mjs
 *
 * Every check gets a known-bad fixture it must reject and a known-good one it
 * must accept. A check that passes while measuring nothing is the failure mode
 * this file exists to prevent, so "rejects" asserts on the message too.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkActiveIsSettled,
  checkAddedDate,
  checkAttributionConsistency,
  checkCategoryReadmeRows,
  checkCategorySets,
  checkCountTables,
  checkDeprecationReason,
  checkEngineFields,
  checkEntryUrl,
  checkEvidenceDates,
  checkFieldTypes,
  checkFormatVocabulary,
  evidenceDates,
  markdownAnchors,
  checkLicenseVocabulary,
  checkLineEndings,
  checkMaintenance,
  checkNonCommercialEvidence,
  maintenanceFromRepo,
  checkPublisherConsistency,
  checkSpdxConsistency,
  checkStacks,
  checkTagsRestatePublisher,
  checkTaxonomyValues,
  checkTitleMatchesName,
  checkValueAliases,
  checkValueSpellings,
} from "./checks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vocab = JSON.parse(
  fs.readFileSync(path.join(__dirname, "license-vocabulary.json"), "utf8")
);
const spdxAllowed = new Set(
  JSON.parse(fs.readFileSync(path.join(__dirname, "spdx-allowed.json"), "utf8"))
);

let passed = 0;
const failures = [];

function rejects(label, errors, needle) {
  if (!errors.length) {
    failures.push(`${label}: expected an error, got none`);
    return;
  }
  if (needle && !errors.some((e) => e.includes(needle))) {
    failures.push(
      `${label}: error did not mention "${needle}"; got: ${errors.join(" | ")}`
    );
    return;
  }
  passed += 1;
}

function eq(label, actual, expected) {
  if (actual === expected) passed += 1;
  else failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function accepts(label, errors) {
  if (errors.length) {
    failures.push(`${label}: expected no error, got: ${errors.join(" | ")}`);
    return;
  }
  passed += 1;
}

const TODAY = "2026-09-22";
const EV = (d) => `\n## Evidence\n\n- Live page (${d}): "CC0"\n`;

/* V1 -------------------------------------------------------------------- */
rejects(
  "V1 rejects an undocumented license value",
  checkLicenseVocabulary("bad.md", { license: "CC-BY 4.0" }, vocab),
  "not in site/license-vocabulary.json"
);
rejects(
  "V1 rejects the OFL near-miss",
  checkLicenseVocabulary("bad.md", { license: "OFL" }, vocab),
  "OFL"
);
accepts(
  "V1 accepts a documented license value",
  checkLicenseVocabulary("ok.md", { license: "SIL OFL" }, vocab)
);

/* V2 / V3 --------------------------------------------------------------- */
rejects(
  "V3 rejects a fillable but absent license_spdx",
  checkSpdxConsistency("bad.md", { license: "MIT" }, vocab, spdxAllowed),
  "license_spdx is absent"
);
rejects(
  "V2 rejects a license_spdx that contradicts the license",
  checkSpdxConsistency(
    "bad.md",
    { license: "CC0", license_spdx: "MIT" },
    vocab,
    spdxAllowed
  ),
  'license_spdx is "MIT"'
);
rejects(
  "V2 rejects an SPDX id invented for a license that has none",
  checkSpdxConsistency(
    "bad.md",
    { license: "custom", license_spdx: "MIT" },
    vocab,
    spdxAllowed
  ),
  "must not carry license_spdx"
);
rejects(
  "V2 rejects guessing -only for a bare GPL value",
  checkSpdxConsistency(
    "bad.md",
    { license: "GPL-3.0", license_spdx: "GPL-3.0-only" },
    vocab,
    spdxAllowed
  ),
  "deprecated the bare identifier"
);
accepts(
  "V2/V3 accept a correct pairing",
  checkSpdxConsistency(
    "ok.md",
    { license: "CC0", license_spdx: "CC0-1.0" },
    vocab,
    spdxAllowed
  )
);
accepts(
  "V3 accepts an absent SPDX on an ambiguous license",
  checkSpdxConsistency("ok.md", { license: "GPL-3.0" }, vocab, spdxAllowed)
);

/* V4 -------------------------------------------------------------------- */
rejects(
  "V4 rejects an attribution license silently marked not-required",
  checkAttributionConsistency(
    "bad.md",
    { license: "CC-BY-4.0", attribution_required: false },
    "# X\n\nNo waiver stated.\n",
    vocab
  ),
  "no \"- Attribution waived:\" line"
);
accepts(
  "V4 accepts the same entry once the waiver is stated",
  checkAttributionConsistency(
    "ok.md",
    { license: "CC-BY-4.0", attribution_required: false },
    "# X\n\n## Notes\n\n- Attribution waived: publisher offers an opt-out\n",
    vocab
  )
);
accepts(
  "V4 does not fire on OFL, whose obligation is a notice not a credit",
  checkAttributionConsistency(
    "ok.md",
    { license: "SIL OFL", attribution_required: false },
    "# X\n",
    vocab
  )
);

/* V8 / V10 -------------------------------------------------------------- */
for (const date of ["2025-13-01", "2026-02-30", "2025-02-29", "1900-02-29", "2026-04-31"]) {
  rejects(
    `V8 rejects impossible Evidence date ${date}`,
    checkEvidenceDates("bad.md", { verified: "2026-01-01" }, `# X${EV(date)}`, TODAY),
    `Evidence date ${date} is not a real YYYY-MM-DD date`
  );
}
rejects(
  "V8 rejects an impossible date even alongside valid Evidence",
  checkEvidenceDates("bad.md", { verified: "2026-09-20" }, `# X${EV("2026-02-30")}\n- Rechecked 2026-09-20.\n`, TODAY),
  "Evidence date 2026-02-30 is not a real YYYY-MM-DD date"
);
accepts(
  "V8 accepts real leap-day Evidence",
  checkEvidenceDates("ok.md", { verified: "2000-02-29" }, `# X${EV("2000-02-29")}`, TODAY)
);
rejects(
  "V8 rejects a verified date newer than its newest Evidence date",
  checkEvidenceDates(
    "bad.md",
    { verified: "2026-09-22" },
    `# X${EV("2026-07-19")}`,
    TODAY
  ),
  "newer than its newest Evidence date"
);
rejects(
  "V8 rejects an Evidence date in the future",
  checkEvidenceDates(
    "bad.md",
    { verified: "2026-09-22" },
    `# X${EV("2027-01-01")}`,
    TODAY
  ),
  "is in the future"
);
rejects(
  "V10 rejects an Evidence section with no date",
  checkEvidenceDates(
    "bad.md",
    { verified: "2026-09-22" },
    '# X\n\n## Evidence\n\n- Live page: "CC0"\n',
    TODAY
  ),
  "carries no YYYY-MM-DD date"
);
accepts(
  "V8 accepts verified equal to the Evidence date",
  checkEvidenceDates(
    "ok.md",
    { verified: "2026-07-19" },
    `# X${EV("2026-07-19")}`,
    TODAY
  )
);
accepts(
  "V8 accepts verified older than the Evidence date",
  checkEvidenceDates(
    "ok.md",
    { verified: "2026-07-19" },
    `# X${EV("2026-08-24")}`,
    TODAY
  )
);

/* V9 -------------------------------------------------------------------- */
rejects(
  "V9 rejects a deprecated entry with no stated reason",
  checkDeprecationReason(
    "bad.md",
    { status: "deprecated" },
    "# X\n\nThe site is gone.\n",
    vocab
  ),
  "needs a \"- Deprecated:\" line"
);
accepts(
  "V9 accepts a deprecated entry that states one",
  checkDeprecationReason(
    "ok.md",
    { status: "deprecated" },
    "# X\n\n## Notes\n\n- Deprecated: the site is gone\n",
    vocab
  )
);
accepts(
  "V9 does not fire on an active entry",
  checkDeprecationReason("ok.md", { status: "active" }, "# X\n", vocab)
);

/* V7 -------------------------------------------------------------------- */
rejects(
  "V7 rejects a generic host used as a publisher",
  checkPublisherConsistency([
    { rel: "bad.md", meta: { publisher: "GitHub", url: "https://github.com/a/b" } },
  ]),
  "is a generic host"
);
rejects(
  "V7 rejects two publishers claiming one domain",
  checkPublisherConsistency([
    { rel: "a.md", meta: { publisher: "Alpha", url: "https://example.com/a" } },
    { rel: "b.md", meta: { publisher: "Beta", url: "https://example.com/b" } },
  ]),
  "conflicting publisher values"
);
accepts(
  "V7 accepts one publisher across a domain, with a sibling entry unset",
  checkPublisherConsistency([
    { rel: "a.md", meta: { publisher: "Blender Studio", url: "https://www.blender.org/a" } },
    { rel: "b.md", meta: { publisher: "Blender Studio", url: "https://www.blender.org/b" } },
    { rel: "c.md", meta: { url: "https://www.blender.org/c" } },
  ])
);
rejects(
  "V7 rejects OpenGameArt as a publisher, since it is the host",
  checkPublisherConsistency([
    { rel: "bad.md", meta: { publisher: "OpenGameArt", url: "https://opengameart.org/content/x" } },
  ]),
  "is a generic host"
);
rejects(
  "V7 rejects Google Fonts as a publisher, since it distributes rather than holds the rights",
  checkPublisherConsistency([
    { rel: "bad.md", meta: { publisher: "Google Fonts", url: "https://fonts.google.com/specimen/X" } },
  ]),
  "is a generic host"
);
accepts(
  "V7 allows different artists on opengameart.org, which hosts many publishers",
  checkPublisherConsistency([
    { rel: "a.md", meta: { publisher: "ansimuz", url: "https://opengameart.org/content/a" } },
    { rel: "b.md", meta: { publisher: "Sylly", url: "https://opengameart.org/content/b" } },
  ])
);
accepts(
  "V7 does not fire across github.com, which hosts many publishers",
  checkPublisherConsistency([
    { rel: "a.md", meta: { publisher: "Alpha", url: "https://github.com/a/x" } },
    { rel: "b.md", meta: { publisher: "Beta", url: "https://github.com/b/y" } },
  ])
);

/* V6 -------------------------------------------------------------------- */
const goodReadme = [
  "[![Sources](https://img.shields.io/badge/sources-3-informational)](x)",
  "**[Browse 3 sources](x)**",
  "| **2D** | 2 | Sprites | [`catalog/2d/`](catalog/2d/) |",
  "| **Video** | 1 | Clips | [`catalog/video/`](catalog/video/) |",
].join("\n");
rejects(
  "V6 rejects a category count that drifted",
  checkCountTables({ "2d": 5, video: 1 }, [
    { name: "README.md", text: goodReadme, pathFragment: "catalog/CAT/" },
  ]),
  'lists 2 entries for "2d" but the catalog has 5'
);
rejects(
  "V6 rejects a stale sources badge",
  checkCountTables({ "2d": 2, video: 2 }, [
    { name: "README.md", text: goodReadme, pathFragment: "catalog/CAT/" },
  ]),
  "sources badge says 3 but the catalog has 4"
);
rejects(
  "V6 rejects a category missing from the table entirely",
  checkCountTables({ "2d": 2, video: 1, audio: 1 }, [
    { name: "README.md", text: goodReadme, pathFragment: "catalog/CAT/" },
  ]),
  'no category count row for "audio"'
);
accepts(
  "V6 accepts tables that match",
  checkCountTables({ "2d": 2, video: 1 }, [
    { name: "README.md", text: goodReadme, pathFragment: "catalog/CAT/" },
  ])
);
rejects(
  "V6 rejects a stale 'searches all N entries'",
  checkCountTables({ "2d": 2, video: 1 }, [
    { name: "README.md", text: `${goodReadme}\nThe site searches all 2 entries.`, pathFragment: "catalog/CAT/" },
  ]),
  '"searches all 2 entries" but the catalog has 3'
);

/* V11 ------------------------------------------------------------------- */
const readme = [
  "| ID | Name | License | Status |",
  "| [tiled](tiled.md) | Tiled | GPL-3.0 | active |",
  "| [kenney](kenney.md) | Kenney | CC0 | active |",
  "| [lpc](lpc.md) | LPC | varies (SA) | active |",
].join("\n");
rejects(
  "V11 reports a category README with entries but no catalog table",
  checkCategoryReadmeRows("tools", "# Tools\n\nNo table here.\n", [
    { rel: "catalog/tools/a.md", meta: { license: "MIT" } },
  ]),
  "has no catalog table"
);
accepts(
  "V11 ignores a comparison table that leads with the entry link",
  checkCategoryReadmeRows(
    "3d",
    [
      "| If you need | Take | Licence |",
      "| A default | [ambientcg](ambientcg.md) - seamless | **CC0** |",
      "",
      "| ID | Name | License | Commercial | Status |",
      "| [ambientcg](ambientcg.md) | ambientCG | CC0 | yes | active |",
    ].join("\n"),
    [{ rel: "catalog/3d/ambientcg.md", meta: { license: "CC0" } }]
  )
);
rejects(
  "V11 still catches drift in the listing when a link-first comparison table exists",
  checkCategoryReadmeRows(
    "3d",
    [
      "| If you need | Take | Licence |",
      "| A default | [ambientcg](ambientcg.md) - seamless | **CC0** |",
      "",
      "| ID | Name | License | Commercial | Status |",
      "| [ambientcg](ambientcg.md) | ambientCG | MIT | yes | active |",
    ].join("\n"),
    [{ rel: "catalog/3d/ambientcg.md", meta: { license: "CC0" } }]
  ),
  'does not carry its license "CC0"'
);

rejects(
  "V11 rejects a README row whose license contradicts the frontmatter",
  checkCategoryReadmeRows("tools", readme, [
    { rel: "catalog/tools/tiled.md", meta: { license: "GPL-2.0-or-later" } },
  ]),
  'does not carry its license "GPL-2.0-or-later"'
);
accepts(
  "V11 accepts a row that matches",
  checkCategoryReadmeRows("tools", readme, [
    { rel: "catalog/tools/kenney.md", meta: { license: "CC0" } },
  ])
);
accepts(
  "V11 keeps annotated cells legal, since the footnote carries a warning",
  checkCategoryReadmeRows("tools", readme, [
    { rel: "catalog/tools/lpc.md", meta: { license: "varies" } },
  ])
);
accepts(
  "V11 tolerates a trailing footnote marker",
  checkCategoryReadmeRows(
    "tools",
    [
      "| ID | Name | License | Status |",
      "| [a](a.md) | A | CC0* | active |",
      "| [b](b.md) | B | CC-BY? | active |",
    ].join("\n"),
    [
      { rel: "catalog/tools/a.md", meta: { license: "CC0" } },
      { rel: "catalog/tools/b.md", meta: { license: "CC-BY" } },
    ]
  )
);
accepts(
  "V11 ignores a comparison table that links an entry from a prose cell",
  checkCategoryReadmeRows(
    "tools",
    [
      "| If you want | Take | Over | Because |",
      "| A retro SFX fast | [jsfxr](jsfxr.md) | sfxr | Browser, no install |",
      "| ID | Name | License | Status |",
      "| [jsfxr](jsfxr.md) | jsfxr | Unlicense | active |",
    ].join("\n"),
    [{ rel: "catalog/tools/jsfxr.md", meta: { license: "Unlicense" } }]
  )
);
rejects(
  "V11 still catches the catalog row when a comparison table is present",
  checkCategoryReadmeRows(
    "tools",
    [
      "| If you want | Take | Over | Because |",
      "| A retro SFX fast | [jsfxr](jsfxr.md) | sfxr | Browser, no install |",
      "",
      "| ID | Name | License | Status |",
      "| [jsfxr](jsfxr.md) | jsfxr | public-domain | active |",
    ].join("\n"),
    [{ rel: "catalog/tools/jsfxr.md", meta: { license: "Unlicense" } }]
  ),
  'does not carry its license "Unlicense"'
);
rejects(
  "V11 checks every listing table, not only the first",
  checkCategoryReadmeRows(
    "tools",
    [
      "## Editors",
      "| ID | Name | License | Status |",
      "| [tiled](tiled.md) | Tiled | GPL-2.0-or-later | active |",
      "",
      "## Godot 4 add-ons",
      "| ID | Name | License | Status |",
      "| [godot-mod-loader](godot-mod-loader.md) | Godot Mod Loader | MIT | active |",
    ].join("\n"),
    [
      { rel: "catalog/tools/tiled.md", meta: { license: "GPL-2.0-or-later" } },
      { rel: "catalog/tools/godot-mod-loader.md", meta: { license: "CC0" } },
    ]
  ),
  'row for "godot-mod-loader" does not carry its license "CC0"'
);
accepts(
  "V11 stays quiet when the entry has no row (validate.mjs reports that)",
  checkCategoryReadmeRows("tools", readme, [
    { rel: "catalog/tools/absent.md", meta: { license: "MIT" } },
  ])
);

/* V12 ------------------------------------------------------------------- */
rejects(
  "V12 rejects an undocumented camera_perspective",
  checkTaxonomyValues("bad.md", { camera_perspective: "isometric" }),
  'camera_perspective "isometric" is not one of'
);
rejects(
  "V12 rejects a grid_dimensions that is not WxH",
  checkTaxonomyValues("bad.md", { grid_dimensions: "16px" }),
  "is not WxH in pixels"
);
rejects(
  "V12 rejects hardware_tags that is not a list",
  checkTaxonomyValues("bad.md", { hardware_tags: "steam_deck" }),
  "must be a list"
);
accepts(
  "V12 accepts the documented values",
  checkTaxonomyValues("ok.md", {
    camera_perspective: "isometric_3_4",
    grid_dimensions: "16x16",
    hardware_tags: ["steam_deck"],
  })
);
accepts("V12 stays quiet when the optional fields are absent", checkTaxonomyValues("ok.md", {}));

/* V13 ------------------------------------------------------------------- */
rejects(
  "V13 rejects a format spelt two ways across entries",
  checkValueSpellings([
    { rel: "a.md", meta: { formats: ["PNG", "glTF"] } },
    { rel: "b.md", meta: { formats: ["png"] } },
  ]),
  'formats spells one value several ways: "PNG" (a.md), "png" (b.md)'
);
rejects(
  "V13 rejects a subcategory that differs only by punctuation",
  checkValueSpellings([
    { rel: "a.md", meta: { subcategories: ["field-recordings"] } },
    { rel: "b.md", meta: { subcategories: ["field_recordings"] } },
  ]),
  "subcategories spells one value several ways"
);
rejects(
  "V13 rejects a singular beside its plural",
  checkValueSpellings([
    { rel: "a.md", meta: { subcategories: ["character"] } },
    { rel: "b.md", meta: { subcategories: ["characters"] } },
  ]),
  'subcategories spells one value several ways: "character" (a.md), "characters" (b.md)'
);
rejects(
  "V13 rejects a tag beside its plural",
  checkValueSpellings([
    { rel: "a.md", meta: { tags: ["button"] } },
    { rel: "b.md", meta: { tags: ["buttons"] } },
  ]),
  "tags spells one value several ways"
);
accepts(
  "V13 accepts one spelling used many times",
  checkValueSpellings([
    { rel: "a.md", meta: { formats: ["PNG"], subcategories: ["characters", "sfx"] } },
    { rel: "b.md", meta: { formats: ["PNG"], subcategories: ["characters", "glass"] } },
  ])
);

/* V14 ------------------------------------------------------------------- */
rejects(
  "V14 rejects an active entry with unknown attribution",
  checkActiveIsSettled("bad.md", { status: "active", license: "custom", commercial: true, attribution_required: "unknown" }),
  "is active but attribution_required is unknown"
);
rejects(
  "V14 rejects an active entry with an unknown licence",
  checkActiveIsSettled("bad.md", { status: "active", license: "unknown", commercial: true, attribution_required: false }),
  "is active but license is unknown"
);
accepts(
  "V14 accepts unknowns on a needs-review entry",
  checkActiveIsSettled("ok.md", { status: "needs-review", license: "unknown", commercial: "unknown", attribution_required: "unknown" })
);
accepts(
  "V14 accepts a settled active entry",
  checkActiveIsSettled("ok.md", { status: "active", license: "MIT", commercial: true, attribution_required: false })
);

/* V15 ------------------------------------------------------------------- */
const stackEntries = new Map([
  ["catalog/2d/good.md", { id: "good", status: "active" }],
  ["catalog/2d/old.md", { id: "old", status: "deprecated" }],
]);
const stackText = (pick, meta = {}) =>
  `---\nid: ${meta.id || "s1"}\ntitle: T\ntask: A task.\nwalked: ${meta.walked || "2026-09-01"}\n---\n\nLead.\n\n${meta.section || "## Art"}\n\n${pick}\n`;
const goodPick = "- **Tiles:** [Good](../catalog/2d/good.md). Sixteen tiles.";
const oneStack = (text, rel = "stacks/s1.md") => checkStacks([{ rel, text }], stackEntries, ["MIT"], TODAY);
accepts("V15 accepts a good stack", oneStack(stackText(goodPick)));
rejects("V15 rejects a pick that is not an entry", oneStack(stackText("- **Tiles:** [Nope](../catalog/2d/nope.md). Why.")), 'stacks/s1.md:12: pick "../catalog/2d/nope.md" is not a catalog entry');
rejects("V15 rejects a deprecated pick", oneStack(stackText("- **Tiles:** [Old](../catalog/2d/old.md). Why.")), 'stacks/s1.md:12: pick "old" is deprecated');
rejects("V15 rejects a malformed pick line", oneStack(stackText("- Tiles: Good. Why.")), "stacks/s1.md:12: a pick line is");
rejects("V15 rejects an id that is not the filename", oneStack(stackText(goodPick), "stacks/other.md"), 'id "s1" does not match the filename');
rejects("V15 rejects a duplicate id", checkStacks([{ rel: "stacks/s1.md", text: stackText(goodPick) }, { rel: "stacks/s1.md", text: stackText(goodPick) }], stackEntries, [], TODAY), 'duplicate stack id "s1"');
rejects("V15 rejects a licence in a why sentence", oneStack(stackText("- **Tiles:** [Good](../catalog/2d/good.md). A MIT pack.")), 'names a licence ("MIT")');
rejects("V15 rejects a walked date in the future", oneStack(stackText(goodPick, { walked: "2099-01-01" })), "walked 2099-01-01 is in the future");
rejects("V15 rejects an unknown section", oneStack(stackText(goodPick, { section: "## Levels" })), 'section "Levels" is not one of');

/* V8: evidence dates are prose dates, and real ------------------------- */
const V8_META = { verified: "2026-09-01" };
accepts(
  "V8 ignores a date inside a link target",
  checkEvidenceDates("ok.md", V8_META, "\n## Evidence\n\n- [Notes](https://x.test/releases/2026-09-20-notes) (2026-09-01): \"CC0\"\n", TODAY)
);
accepts(
  "V8 ignores a date inside a bare URL",
  checkEvidenceDates("ok.md", V8_META, "\n## Evidence\n\n- Live page (2026-09-01): https://x.test/2099-01-01/post\n", TODAY)
);
rejects(
  "V8 still sees a bumped verified behind a URL date",
  checkEvidenceDates("bad.md", { verified: "2026-09-20" }, "\n## Evidence\n\n- Live page (2026-09-01): https://x.test/2026-09-20/\n", TODAY),
  "newer than its newest Evidence date 2026-09-01"
);
rejects(
  "V8 rejects an impossible Evidence date",
  checkEvidenceDates("bad.md", { verified: "2026-02-01" }, EV("2026-02-30"), TODAY),
  "2026-02-30 is not a real YYYY-MM-DD date"
);
eq(
  "evidenceDates reads prose dates only",
  evidenceDates("- [a](https://x/2020-01-01) (2026-01-02) and <https://y/2021-01-01> 2026-01-03").join(","),
  "2026-01-02,2026-01-03"
);

/* V16: url scheme ------------------------------------------------------ */
rejects("V16 rejects javascript:", checkEntryUrl("bad.md", { url: "javascript:alert(1)" }), "must be https://");
rejects("V16 rejects data:", checkEntryUrl("bad.md", { url: "data:text/html,<script>x</script>" }), "must be https://");
rejects("V16 rejects a relative url", checkEntryUrl("bad.md", { url: "/downloads" }), "is not an absolute URL");
accepts("V16 accepts https", checkEntryUrl("ok.md", { url: "https://kenney.nl/assets" }));
rejects("V16 rejects localhost", checkEntryUrl("bad.md", { url: "http://localhost:8080/x" }), "must be a public site");
rejects("V16 rejects an IPv4 literal", checkEntryUrl("bad.md", { url: "http://169.254.169.254/latest" }), "must be a public site");
rejects("V16 rejects an IPv6 literal", checkEntryUrl("bad.md", { url: "http://[::1]/" }), "must be a public site");
rejects("V16 rejects .local", checkEntryUrl("bad.md", { url: "https://nas.local/files" }), "must be a public site");
accepts("V16 accepts a digit-led host", checkEntryUrl("ok.md", { url: "https://3dtexel.com/" }));
accepts("V16 accepts http where a source has no https", checkEntryUrl("ok.md", { url: "http://www.makehumancommunity.org/" }));

/* V17: category sets --------------------------------------------------- */
accepts(
  "V17 accepts matching sets",
  checkCategorySets({ dirs: ["2d", "3d"], configured: ["3d", "2d"], formOptions: ["2d", "3d"] })
);
rejects(
  "V17 rejects a folder missing from config",
  checkCategorySets({ dirs: ["2d", "video"], configured: ["2d"], formOptions: null }),
  "catalog/video/ is not in site/config.json"
);
rejects(
  "V17 rejects a config category with no folder",
  checkCategorySets({ dirs: ["2d"], configured: ["2d", "vfx"], formOptions: null }),
  'category "vfx" has no catalog/vfx/ folder'
);
rejects(
  "V17 rejects an issue form missing a category",
  checkCategorySets({ dirs: ["2d", "video"], configured: ["2d", "video"], formOptions: ["2d"] }),
  'leave out "video"'
);

/* V18: markdown anchors ------------------------------------------------ */
const anchors = markdownAnchors(
  "# Top\n\n## Choosing a pixel tileset\n\n## Notes\n\n## Notes\n\n```\n## Not a heading\n```\n\n### Fonts & `OFL` [link](x.md)\n\n<a id=\"custom\"></a>\n"
);
eq("V18 slugs a heading", anchors.has("choosing-a-pixel-tileset"), true);
eq("V18 numbers a repeated heading", anchors.has("notes") && anchors.has("notes-1"), true);
eq("V18 skips fenced code", anchors.has("not-a-heading"), false);
eq("V18 drops punctuation and link syntax", anchors.has("fonts--ofl-link"), true);
eq("V18 reads explicit ids", anchors.has("custom"), true);

/* V13: -es and -ies plurals -------------------------------------------- */
const rec = (rel, subcategories) => ({ rel, meta: { subcategories } });
rejects(
  "V13 joins an -es plural to its singular",
  checkValueSpellings([rec("a.md", ["base-mesh"]), rec("b.md", ["base-meshes"])], ["subcategories"]),
  '"base-mesh" (a.md), "base-meshes" (b.md)'
);
rejects(
  "V13 joins an -ies plural to its singular",
  checkValueSpellings([rec("a.md", ["category"]), rec("b.md", ["categories"])], ["subcategories"]),
  "spells one value several ways"
);
accepts(
  "V13 does not strip -es from a word that is not a sibilant plural",
  checkValueSpellings([rec("a.md", ["shade"]), rec("b.md", ["shades"]), rec("c.md", ["shad"])], ["subcategories"]).filter((e) => e.includes('"shad"'))
);
accepts(
  "V13 leaves an -ies word alone when no singular is in use",
  checkValueSpellings([rec("a.md", ["movies"]), rec("b.md", ["movie"])], ["subcategories"]).filter((e) => e.includes("movy"))
);

/* V19: retired spellings ----------------------------------------------- */
const aliases = JSON.parse(fs.readFileSync(path.join(__dirname, "value-aliases.json"), "utf8"));
rejects("V19 rejects a retired subcategory", checkValueAliases("bad.md", { subcategories: ["tiles"] }, aliases), 'use "tileset"');
rejects("V19 rejects a retired format", checkValueAliases("bad.md", { formats: ["JPEG"] }, aliases), 'use "JPG"');
rejects("V19 rejects a licence as a subcategory", checkValueAliases("bad.md", { subcategories: ["public-domain"] }, aliases), "a licence, not a kind of content");
rejects("V19 rejects an internal review tag", checkValueAliases("bad.md", { tags: ["r04"] }, aliases), "internal review marker");
accepts("V19 lets a tag use a word retired only as a subcategory", checkValueAliases("ok.md", { tags: ["tiles", "gui"] }, aliases));
rejects("V19 rejects a tag that restates the licence", checkValueAliases("bad.md", { tags: ["cc0"] }, aliases), 'tags must not carry "cc0"');
accepts("V19 keeps a tag that only mentions a licence word", checkValueAliases("ok.md", { tags: ["odbl-adjacent", "free-tier"] }, aliases));

/* Licence families: every licence in exactly one Licence-filter group ---- */
{
  const fams = Object.entries(vocab.families).filter(([k]) => !k.startsWith("_"));
  const homeless = Object.keys(vocab.licenses).filter((l) => fams.filter(([, f]) => f.licenses.includes(l)).length !== 1);
  accepts("every licence value sits in exactly one family", homeless);
  const unknown = fams.flatMap(([, f]) => f.licenses).filter((l) => !(l in vocab.licenses));
  accepts("families name only licence values the vocabulary has", unknown);
}

/* V22: maintenance ------------------------------------------------------ */
rejects("V22 rejects an unknown maintenance value", checkMaintenance("bad.md", { maintenance: "dead" }), 'maintenance "dead" is not one of archived | inactive');
accepts("V22 accepts archived", checkMaintenance("ok.md", { maintenance: "archived" }));
accepts("V22 leaves the field optional", checkMaintenance("ok.md", {}));
{
  const now = Date.parse("2026-09-26T00:00:00Z");
  const same = (label, actual, expected) => (actual === expected ? accepts(label, []) : accepts(label, [`got ${actual}, want ${expected}`]));
  same("an archived repo is archived", maintenanceFromRepo({ archived: true, pushed_at: "2026-09-01T00:00:00Z" }, now), "archived");
  same("no push in over three years is inactive", maintenanceFromRepo({ archived: false, pushed_at: "2023-01-01T00:00:00Z" }, now), "inactive");
  same("a recent push is neither", maintenanceFromRepo({ archived: false, pushed_at: "2025-01-01T00:00:00Z" }, now), null);
}

/* V23: engine fields ---------------------------------------------------- */
rejects("V23 rejects an unknown engine_lock", checkEngineFields("bad.md", { engine_lock: "unity" }), 'engine_lock "unity" is not one of unreal');
rejects("V23 rejects a malformed ue_versions", checkEngineFields("bad.md", { ue_versions: "UE5" }), 'ue_versions "UE5" is not X.Y, X.Y-X.Y or X.Y+');
rejects("V23 rejects a backwards range", checkEngineFields("bad.md", { ue_versions: "5.8-5.4" }), 'ue_versions "5.8-5.4" runs backwards');
accepts("V23 accepts a range", checkEngineFields("ok.md", { engine_lock: "unreal", ue_versions: "5.4-5.8" }));
accepts("V23 accepts an open range", checkEngineFields("ok.md", { ue_versions: "5.6+" }));
accepts("V23 accepts a single version", checkEngineFields("ok.md", { ue_versions: "5.8" }));
accepts("V23 compares minor versions numerically", checkEngineFields("ok.md", { ue_versions: "5.9-5.10" }));
accepts("V23 leaves both fields optional", checkEngineFields("ok.md", {}));
rejects("V23 rejects a GPL Unreal plugin", checkEngineFields("bad.md", { license: "GPL-3.0-only", formats: ["unreal-plugin"] }), "forbids combining the engine with GPL/LGPL code");
accepts("V23 allows a GPL standalone tool", checkEngineFields("ok.md", { license: "GPL-3.0-only", formats: ["desktop-app"] }));

/* V21: tag restating the publisher ------------------------------------- */
rejects("V21 rejects the publisher as a tag", checkTagsRestatePublisher("bad.md", { publisher: "Blender Studio", tags: ["blender-studio", "open-movie"] }), 'tag "blender-studio" restates publisher');
accepts("V21 allows another publisher's name as a tag", checkTagsRestatePublisher("ok.md", { publisher: "Envato", tags: ["kenney-style"] }));
accepts("V21 ignores an entry with no publisher", checkTagsRestatePublisher("ok.md", { tags: ["kenney"] }));

/* V20: closed format list ---------------------------------------------- */
const formatVocab = JSON.parse(fs.readFileSync(path.join(__dirname, "format-vocabulary.json"), "utf8"));
rejects("V20 rejects a format missing from the vocabulary", checkFormatVocabulary("bad.md", { formats: ["glTF KHR_draco"] }, formatVocab), 'formats "glTF KHR_draco" is not in site/format-vocabulary.json');
rejects("V20 is case-sensitive", checkFormatVocabulary("bad.md", { formats: ["png"] }, formatVocab), 'formats "png"');
accepts("V20 accepts listed formats", checkFormatVocabulary("ok.md", { formats: ["PNG", "glTF", "GLB"] }, formatVocab));
accepts(
  "V20 vocabulary lists every format a filter group names",
  Object.values(formatVocab.groups).flatMap((g) => g.formats).filter((f) => !formatVocab.formats.includes(f))
);
accepts(
  "V20 vocabulary carries no retired spelling",
  formatVocab.formats.filter((f) => Object.prototype.hasOwnProperty.call(aliases.formats, f))
);

/* V24: field types (#79) ------------------------------------------------ */
rejects("V24 rejects tags that parsed as text", checkFieldTypes("bad.md", { tags: "[a, b]   # note" }), "tags must be a list");
rejects("V24 rejects a subcategories string", checkFieldTypes("bad.md", { subcategories: "models" }), "subcategories must be a list");
rejects("V24 rejects a quoted boolean", checkFieldTypes("bad.md", { commercial: "true" }), "write commercial: true without quotes");
rejects("V24 rejects a quoted attribution_required", checkFieldTypes("bad.md", { attribution_required: "false" }), "write attribution_required: false without quotes");
rejects("V24 rejects an unknown commercial word", checkFieldTypes("bad.md", { commercial: "maybe" }), 'commercial "maybe" is not true|false|varies|unknown');
accepts("V24 accepts lists and booleans", checkFieldTypes("ok.md", { tags: ["a"], subcategories: ["b"], formats: ["PNG"], commercial: true, attribution_required: false }));
accepts("V24 accepts the literal words", checkFieldTypes("ok.md", { commercial: "varies", attribution_required: "unknown" }));
accepts("V24 leaves missing fields to the required check", checkFieldTypes("ok.md", {}));

/* V26: added date (#90) ------------------------------------------------- */
rejects("V26 rejects a non-date", checkAddedDate("bad.md", { added: "July" }, TODAY), 'added "July" is not a real YYYY-MM-DD date');
rejects("V26 rejects a future date", checkAddedDate("bad.md", { added: "2027-01-01" }, TODAY), "added 2027-01-01 is in the future");
accepts("V26 accepts a past date", checkAddedDate("ok.md", { added: "2026-07-19" }, TODAY));
accepts("V26 leaves a missing field to the required check", checkAddedDate("ok.md", {}, TODAY));

/* V25: heading matches name (#95) --------------------------------------- */
rejects("V25 rejects a heading that differs from name", checkTitleMatchesName("bad.md", { name: "KayKit (Kay Lousberg)" }, "\n# KayKit\n\nText"), 'heading "# KayKit" differs from name "KayKit (Kay Lousberg)"');
rejects("V25 rejects a body with no heading", checkTitleMatchesName("bad.md", { name: "X" }, "Just text"), "has no \"# X\" heading");
accepts("V25 accepts a matching heading", checkTitleMatchesName("ok.md", { name: "KayKit (Kay Lousberg)" }, "\n# KayKit (Kay Lousberg)\n\n## Notes"));
accepts("V25 ignores a missing name", checkTitleMatchesName("ok.md", {}, "# Anything"));

/* Thumbnails: the manifest, the files and the gate must agree ------------- */
import { checkPreviewField, checkThumbManifest } from "./checks.mjs";
{
  const okEntry = { id: "a", license: "CC0", status: "active", url: "https://a.itch.io/x" };
  const manifest = { thumbs: { a: { fetched: "2026-10-01", license: "CC0", hash: "h", width: 640, height: 400, source: "https://a.itch.io/x", image: "https://i/a.png" } } };
  accepts("thumbs manifest: file and record agree", checkThumbManifest(manifest, new Map([["a", okEntry]]), ["a.webp"]));
  accepts("thumbs manifest: nothing at all", checkThumbManifest(null, new Map([["a", okEntry]]), []));
  rejects("thumbs manifest: file without record", checkThumbManifest({ thumbs: {} }, new Map([["a", okEntry]]), ["a.webp"]), "site/public/thumbs/a.webp has no record in site/thumbs.json");
  rejects("thumbs manifest: record without file", checkThumbManifest(manifest, new Map([["a", okEntry]]), []), 'site/thumbs.json has "a" but site/public/thumbs/a.webp is missing');
  rejects("thumbs manifest: record for unknown entry", checkThumbManifest(manifest, new Map(), ["a.webp"]), 'site/thumbs.json has "a" but no catalog entry has that id');
  rejects("thumbs manifest: rejects a thumbnail whose entry is no longer eligible", checkThumbManifest(manifest, new Map([["a", { ...okEntry, license: "custom" }]]), ["a.webp"]), 'thumbnail for "a" must be removed: licence custom is not in the preview allowlist (run node site/thumbs.mjs)');
  accepts("thumbs manifest: licence drift between two allowed licences is not an error", checkThumbManifest(manifest, new Map([["a", { ...okEntry, license: "MIT" }]]), ["a.webp"]));
  rejects("thumbs manifest: stray file", checkThumbManifest(manifest, new Map([["a", okEntry]]), ["a.webp", "notes.txt"]), "site/public/thumbs/notes.txt is not a <id>.webp thumbnail");
}
accepts("preview field: absent", checkPreviewField("ok.md", {}));
accepts("preview field: none", checkPreviewField("ok.md", { preview: "none" }));
accepts("preview field: https url", checkPreviewField("ok.md", { preview: "https://a/b.png" }));
rejects("preview field: http refused", checkPreviewField("bad.md", { preview: "http://a/b.png" }), 'bad.md preview must be "none" or an https:// image URL');
rejects("preview field: loopback refused", checkPreviewField("bad.md", { preview: "https://127.0.0.1/a.png" }), "bad.md preview must be an https:// image URL on a public host");
rejects("preview field: word refused", checkPreviewField("bad.md", { preview: "yes" }), 'bad.md preview must be "none" or an https:// image URL');

/* V30: line endings ------------------------------------------------------ */
accepts("V30 accepts LF-only text", checkLineEndings("ok.md", "---\nid: a\n---\n\nBody\n"));
rejects("V30 rejects CRLF and names the first line", checkLineEndings("bad.md", "---\nid: a\r\n---\n"), "bad.md:2 has a CR line ending");
rejects("V30 rejects a lone CR", checkLineEndings("bad.md", "one\rtwo\n"), "bad.md:1 has a CR line ending");

/* V31: non-commercial entries quote the restriction ----------------------- */
accepts("V31 ignores commercial: true", checkNonCommercialEvidence("ok.md", { status: "active", commercial: true }, "## Evidence\n\n- Live page (2026-01-01): \"free\"\n"));
accepts("V31 ignores needs-review", checkNonCommercialEvidence("ok.md", { status: "needs-review", commercial: false }, "## Evidence\n\n- Live page (2026-01-01): \"free\"\n"));
accepts("V31 accepts a quoted restriction", checkNonCommercialEvidence("ok.md", { status: "active", commercial: false }, "## Evidence\n\n- Live About (2026-01-01): \"as long as you don't use these commercially\"\n"));
rejects("V31 rejects an unquoted restriction", checkNonCommercialEvidence("bad.md", { status: "active", commercial: false }, "## Evidence\n\n- Live page (2026-01-01): \"free download\"\n"), "bad.md is active with commercial: false but no Evidence line mentions the commercial restriction");

/* ----------------------------------------------------------------------- */
if (failures.length) {
  console.error(`checks.test failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`checks.test ok: ${passed} assertions across 29 checks`);

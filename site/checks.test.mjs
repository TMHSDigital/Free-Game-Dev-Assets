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
  checkAttributionConsistency,
  checkCategoryReadmeRows,
  checkCountTables,
  checkDeprecationReason,
  checkEvidenceDates,
  checkLicenseVocabulary,
  checkPublisherConsistency,
  checkSpdxConsistency,
  checkStacks,
  checkTaxonomyValues,
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

/* ----------------------------------------------------------------------- */
if (failures.length) {
  console.error(`checks.test failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`checks.test ok: ${passed} assertions across 15 checks`);

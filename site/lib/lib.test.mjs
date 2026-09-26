#!/usr/bin/env node
/**
 * Tests for the site's build modules. Run: node site/lib/lib.test.mjs
 * Each task appends a section; the report block stays last.
 */
import {
  commercialLabel,
  entryPageUrl,
  esc,
  isRealDate,
  STATUS_NOTES,
  verifiedAge,
} from "./shared.mjs";

let passed = 0;
const failures = [];

function eq(label, actual, expected) {
  if (actual === expected) passed += 1;
  else failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function has(label, text, needle) {
  if (String(text).includes(needle)) passed += 1;
  else failures.push(`${label}: expected to contain ${JSON.stringify(needle)}`);
}
function lacks(label, text, needle) {
  if (!String(text).includes(needle)) passed += 1;
  else failures.push(`${label}: expected not to contain ${JSON.stringify(needle)}`);
}
function throws(label, fn, needle) {
  try {
    fn();
    failures.push(`${label}: expected an error`);
  } catch (err) {
    if (!needle || String(err.message).includes(needle)) passed += 1;
    else failures.push(`${label}: error did not mention ${JSON.stringify(needle)}; got ${err.message}`);
  }
}

/* shared ----------------------------------------------------------------- */
for (const date of ["2026-01-01", "2026-12-31", "2026-04-30", "2024-02-29", "2000-02-29", "0000-02-29", "0099-12-31"]) {
  eq(`isRealDate accepts ${date}`, isRealDate(date), true);
}
for (const date of ["2025-13-01", "2026-02-30", "2025-02-29", "1900-02-29", "2100-02-29", "2026-04-31", "2026-00-01", "2026-01-00", "2026-01-32", "0099-02-29", "2026-1-01", "2026-01-1", "2026-01-01\n", " 2026-01-01", "2026-01-01T00:00:00Z", "", null, undefined, 20260101]) {
  eq(`isRealDate rejects ${JSON.stringify(date)}`, isRealDate(date), false);
}
eq("esc escapes all five characters", esc(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
eq("commercialLabel true", commercialLabel(true), "commercial OK");
eq("commercialLabel varies", commercialLabel("varies"), "per-file review");
eq("commercialLabel unknown", commercialLabel("unknown"), "commercial ?");
eq("verifiedAge fresh", verifiedAge("2026-09-01", Date.parse("2026-09-24T00:00:00Z")).bucket, "fresh");
eq("verifiedAge missing", verifiedAge(null, Date.now()).bucket, "unknown");
for (const date of ["2025-13-01", "2026-02-30", "2025-02-29", "1900-02-29", "2026-04-31"]) {
  eq(`verifiedAge rejects ${date}`, verifiedAge(date, Date.parse("2026-09-24T00:00:00Z")).bucket, "unknown");
}
eq("entryPageUrl trims the site slash", entryPageUrl({ siteUrl: "https://x.test/site/" }, "a-b"), "https://x.test/site/entry/a-b/");
has("STATUS_NOTES covers needs-review", STATUS_NOTES["needs-review"], "open");

/* markdown: inline --------------------------------------------------------- */
import { renderInline } from "./markdown.mjs";
const passLink = (href) => ({ href, external: /^https?:/.test(href) });
eq("plain text is escaped", renderInline(`a < b & "c"`, passLink), "a &lt; b &amp; &quot;c&quot;");
eq("bold", renderInline("a **b** c", passLink), "a <strong>b</strong> c");
eq("italic", renderInline("a *b* c", passLink), "a <em>b</em> c");
eq("underscores stay literal", renderInline("Rig_Medium and qCC_db", passLink), "Rig_Medium and qCC_db");
eq("code is literal", renderInline("use `**x** <y>`", passLink), "use <code>**x** &lt;y&gt;</code>");
eq("external link", renderInline("[Site](https://a.test/x)", passLink), '<a href="https://a.test/x" rel="noopener noreferrer">Site</a>');
eq("relative link uses the resolver", renderInline("[k](k.md)", () => ({ href: "../k/", external: false })), '<a href="../k/">k</a>');
eq("code inside link text", renderInline("[`docs/provenance.md`](../../docs/provenance.md)", () => ({ href: "https://gh.test/p", external: true })), '<a href="https://gh.test/p" rel="noopener noreferrer"><code>docs/provenance.md</code></a>');
eq("bold inside link text", renderInline("[**x**](https://a.test)", passLink), '<a href="https://a.test" rel="noopener noreferrer"><strong>x</strong></a>');
eq("bare url keeps trailing period outside", renderInline("see https://a.test/x.", passLink), 'see <a href="https://a.test/x" rel="noopener noreferrer">https://a.test/x</a>.');
eq("bare url in parentheses", renderInline("(https://a.test/x)", passLink), '(<a href="https://a.test/x" rel="noopener noreferrer">https://a.test/x</a>)');
eq("backslash escape", renderInline("\\*not italic\\*", passLink), "*not italic*");
eq("html in text is escaped", renderInline("<script>alert(1)</script>", passLink), "&lt;script&gt;alert(1)&lt;/script&gt;");
eq("non-ASCII survives", renderInline("Johannes Sjölund", passLink), "Johannes Sjölund");

/* markdown: blocks --------------------------------------------------------- */
import { deprecationReason, renderBlocks, sectionMarkdown, splitEntryBody } from "./markdown.mjs";
const rb = (md) => renderBlocks(md, { file: "t.md", resolveLink: passLink });
eq("paragraph joins lines", rb("a\nb"), "<p>a b</p>");
eq("h1 is dropped", rb("# Title\n\nText"), "<p>Text</p>");
eq("h2 gets an id", rb("## Notes"), '<h2 id="notes">Notes</h2>');
eq("flat list", rb("- a\n- b"), "<ul><li>a</li><li>b</li></ul>");
eq("nested list", rb("- a\n  - b\n- c"), "<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>");
eq("list item continuation", rb("- a\n  more"), "<ul><li>a more</li></ul>");
eq("list then paragraph", rb("- a\n\nText"), "<ul><li>a</li></ul>\n<p>Text</p>");
eq("italic at line start is not a list", rb("*Measured:* 5"), "<p><em>Measured:</em> 5</p>");
throws("table rejected", () => rb("| a | b |"), "t.md:1: a table row");
throws("fence rejected", () => rb("x\n```"), "t.md:2: a code fence");
throws("blockquote rejected", () => rb("> q"), "a blockquote");
throws("image rejected", () => rb("![i](x.png)"), "an image");
throws("raw html rejected", () => rb("<div>x</div>"), "raw HTML");
throws("h3 rejected", () => rb("### Sub"), "a heading below level 2");
throws("ordered list rejected", () => rb("1. one"), "an ordered list");
throws("firstLine offsets line numbers", () => renderBlocks("ok\n> q", { file: "t.md", resolveLink: passLink, firstLine: 10 }), "t.md:11:");
const body = "# T\n\nLead one.\n\nLead two.\n\n## Notes\n\n- n1\n- Deprecated: gone\n\n## Evidence\n\n- e1";
eq("split lead", splitEntryBody(body).lead, "# T\n\nLead one.\n\nLead two.\n");
eq("split rest starts at first h2", splitEntryBody(body).rest.split("\n")[0], "## Notes");
eq("split restFirstLine", splitEntryBody(body).restFirstLine, 7);
eq("sectionMarkdown Notes", sectionMarkdown(body, "Notes"), "- n1\n- Deprecated: gone");
eq("sectionMarkdown missing", sectionMarkdown(body, "Nope"), null);
eq("deprecationReason starts a sentence", deprecationReason(body), "Gone");

/* links -------------------------------------------------------------------- */
import { makeLinkResolver } from "./links.mjs";
const idByPath = new Map([["catalog/2d/kenney-ui-pack.md", "kenney-ui-pack"], ["catalog/audio/kenney-ui-audio.md", "kenney-ui-audio"]]);
const files = new Map([["docs/provenance.md", "file"], ["catalog/2d/README.md", "file"], ["catalog/video", "dir"]]);
const resolve = makeLinkResolver({ entryPath: "catalog/2d/kenney-ui-pack.md", idByPath, repo: "https://github.com/o/r", kindOf: (p) => files.get(p) || null });
eq("sibling entry", resolve("kenney-ui-pack.md").href, "../kenney-ui-pack/");
eq("entry in another category", resolve("../audio/kenney-ui-audio.md").href, "../kenney-ui-audio/");
eq("entry link is internal", resolve("../audio/kenney-ui-audio.md").external, false);
eq("docs go to GitHub blob", resolve("../../docs/provenance.md").href, "https://github.com/o/r/blob/main/docs/provenance.md");
eq("category README goes to GitHub", resolve("README.md").href, "https://github.com/o/r/blob/main/catalog/2d/README.md");
eq("directory goes to GitHub tree", resolve("../video/").href, "https://github.com/o/r/tree/main/catalog/video");
eq("hash is kept", resolve("../../docs/provenance.md#fonts").href, "https://github.com/o/r/blob/main/docs/provenance.md#fonts");
eq("external untouched", resolve("https://a.test/x").href, "https://a.test/x");
eq("external flagged", resolve("https://a.test/x").external, true);
throws("missing target fails", () => resolve("nope.md"), 'link target "nope.md" does not exist');
throws("escaping the repo fails", () => resolve("../../../outside.md"), "does not exist");

/* entry page --------------------------------------------------------------- */
import { entryPageHtml, jsonLd, scriptJson } from "./entry-page.mjs";
const site = { siteUrl: "https://x.test/s/", title: "Free Game Dev Assets", tagline: "T", repo: "https://github.com/o/r" };
const base = { id: "e1", name: 'A "quoted" <Name>', url: "https://src.test/", category: "2d", license: "CC-BY-4.0", license_spdx: "CC-BY-4.0", commercial: true, attribution_required: true, attribution_string: 'Art by "X" </script>', formats: ["PNG"], verified: "2026-09-01", status: "active", path: "catalog/2d/e1.md", summary: "Sum </script> <b>" };
const page = (over = {}) => entryPageHtml({ entry: { ...base, ...over }, leadHtml: "<p>Lead</p>", restHtml: '<h2 id="notes">Notes</h2>', deprecatedReasonHtml: null, prev: null, next: { id: "e2", name: "Next one" }, site, categoryLabel: "2D", stamp: "2026-09-24", total: 319, hasCard: true, now: Date.parse("2026-09-24T00:00:00Z") });
const p = page();
has("title is escaped", p, "<title>A &quot;quoted&quot; &lt;Name&gt; (CC-BY-4.0) | Free Game Dev Assets</title>");
has("canonical", p, '<link rel="canonical" href="https://x.test/s/entry/e1/" />');
eq("one h1", (p.match(/<h1[\s>]/g) || []).length, 1);
has("credit line escaped", p, "Art by &quot;X&quot; &lt;/script&gt;");
has("copy script with a credit line", p, '<script src="../../entry.js" defer></script>');
lacks("no copy script without one", page({ attribution_string: undefined }), "entry.js");
has("note when credit is required but not canned", page({ attribution_string: undefined }), "no canned credit line");
has("breadcrumb category link", p, "../../?cat=2d#catalog");
has("next link", p, 'href="../e2/" rel="next"');
has("report link prefills the entry", p, "template=correction.yml");
lacks("active is indexable", p, 'content="noindex"');
has("deprecated is noindex", page({ status: "deprecated" }), '<meta name="robots" content="noindex" />');
has("deprecated banner", page({ status: "deprecated" }), 'class="deprecated-banner"');
const ldBlock = p.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
lacks("json-ld cannot close its script", ldBlock, "</script");
eq("json-ld parses with a licence URL", JSON.parse(ldBlock).mainEntity.license, "https://spdx.org/licenses/CC-BY-4.0.html");
eq("json-ld omits licence without spdx", jsonLd({ ...base, license: "custom", license_spdx: undefined }, site).mainEntity.license, undefined);
eq("scriptJson escapes <", scriptJson({ a: "</script>" }), '{"a":"\\u003c/script>"}');

/* page checks -------------------------------------------------------------- */
import { checkPage } from "./page-checks.mjs";
const okPage = `<html><head><title>T</title><link rel="canonical" href="https://x/" /></head><body><h1>A</h1><p><code>**x**</code></p><a href="../e2/">n</a><a href="https://a.test">x</a><script>var a = "**";</script></body></html>`;
const kinds = new Map([["entry/e2", "dir"], ["", "dir"]]);
const opts = { file: "entry/e1/index.html", kindOf: (p) => kinds.get(p) || null };
eq("clean page passes", checkPage(okPage, opts).length, 0);
has("leaked bold", checkPage(okPage.replace("<h1>A</h1>", "<h1>A</h1>**b**"), opts).join(), "double asterisk");
has("leaked link", checkPage(okPage.replace("<h1>A</h1>", "<h1>A</h1>[a](b)"), opts).join(), "markdown link");
has("leaked backtick", checkPage(okPage.replace("<h1>A</h1>", "<h1>A</h1>`x`"), opts).join(), "backtick");
has("two h1", checkPage(okPage.replace("<h1>A</h1>", "<h1>A</h1><h1>B</h1>"), opts).join(), "expected one h1, found 2");
has("no canonical", checkPage(okPage.replace(/<link rel="canonical"[^>]*>/, ""), opts).join(), "missing canonical");
has("empty title", checkPage(okPage.replace("<title>T</title>", "<title></title>"), opts).join(), "missing or empty title");
has("dangling link", checkPage(okPage.replace("../e2/", "../e3/"), opts).join(), "../e3/ does not resolve");
has("link leaving the site", checkPage(okPage.replace("../e2/", "../../../x/"), opts).join(), "leaves the site");
eq("query and hash are ignored", checkPage(okPage.replace("../e2/", "../../?cat=2d#catalog"), opts).length, 0);

/* llms ------------------------------------------------------------------- */
import { llmsFullTxt, llmsTxt } from "./llms.mjs";
const cats = { "2d": { label: "2D" }, audio: { label: "Audio" } };
const llmsEntries = [
  { ...base, id: "a1", name: "Alpha", category: "2d", status: "active", attribution_required: false, commercial: true, license: "CC0" },
  { ...base, id: "d1", name: "Gone", category: "2d", status: "deprecated" },
];
const lt = llmsTxt({ entries: llmsEntries, site, categories: cats });
has("llms header", lt, "# Free Game Dev Assets\n\n> T");
has("llms entry line", lt, "- [Alpha](https://x.test/s/entry/a1/): CC0; commercial OK; no credit required; active");
lacks("llms skips deprecated", lt, "Gone");
lacks("llms skips empty categories", lt, "## Audio");
const lf = llmsFullTxt({ entries: llmsEntries, site, categories: cats, bodies: new Map([["a1", "# A\n\nLead\n\n## Notes\n\n- catch one\n\n## Evidence\n\n- e"]]) });
has("full carries notes", lf, "- catch one");
lacks("full leaves evidence out", lf, "## Evidence");
has("full carries the source", lf, "Source: https://src.test/");

/* final review fixes ------------------------------------------------------- */
import { unquoteScalar } from "./shared.mjs";
eq("escaped double quote", renderInline('a \\"q\\" b', passLink), "a &quot;q&quot; b");
eq("escaped comma", renderInline("x\\,y", passLink), "x,y");
eq("yaml double-quoted escapes", unquoteScalar('"Music \\"{t}\\" by a\\\\b"'), 'Music "{t}" by a\\b');
eq("yaml single-quoted escape", unquoteScalar("'it''s'"), "it's");
eq("yaml unquoted passes through", unquoteScalar("plain"), "plain");
const longLead = `Lead ${"word ".repeat(60)}with [k](k.md) at the end.`;
const lfLinks = llmsFullTxt({
  entries: [{ ...llmsEntries[0], summary: "Short…" }],
  site,
  categories: cats,
  bodies: new Map([["a1", `# A\n\n${longLead}\n\n## Notes\n\n- see [o](../audio/o.md) and [d](../../docs/p.md)\n- read [\`docs/p.md\`](../../docs/p.md); \`[x](y)\` stays literal`]]),
  resolverFor: () => (href) =>
    href.endsWith("o.md") ? { href: "../o/", external: false } : href.endsWith("k.md") ? { href: "../k/", external: false } : { href: "https://github.com/o/r/blob/main/docs/p.md", external: true },
});
has("full uses the whole lead", lfLinks, "word with [k](https://x.test/s/entry/k/) at the end.");
lacks("full does not use the cut summary", lfLinks, "Short…");
has("full notes link to entry pages", lfLinks, "[o](https://x.test/s/entry/o/)");
has("full notes link to GitHub", lfLinks, "[d](https://github.com/o/r/blob/main/docs/p.md)");
lacks("full has no relative links", lfLinks, "](../");
has("full rewrites a link whose label is code", lfLinks, "[`docs/p.md`](https://github.com/o/r/blob/main/docs/p.md)");
has("full leaves links inside code alone", lfLinks, "`[x](y)` stays literal");

/* stacks: parse ------------------------------------------------------------ */
import { licenceTerms, namedLicence, parseStack, pickPath, STACK_SECTIONS } from "./stacks.mjs";
const stackMd = [
  "---",
  "id: s1",
  "title: Make a thing",
  'task: "A game: to sell."',
  "walked: 2026-09-20",
  "---",
  "",
  "# Make a thing",
  "",
  "Lead line one.",
  "Lead line two.",
  "",
  "## Art",
  "",
  "- **Tiles:** [Kenney Pixel Platformer](../catalog/2d/kenney-pixel-platformer.md). 200 tiles on an 18x18 grid, see [UI](../catalog/2d/kenney-ui-pack.md).",
  "- **Player:** [Hero](../catalog/2d/luizmelo-martial-hero.md). Idle, run and jump.",
  "",
  "## Audio",
  "",
  "- **Music, no credit:** [Chips](../catalog/audio/subspaceaudio-5-chiptunes.md). Five loops.",
  "",
  "## Gaps",
  "",
  "- No parallax layers yet.",
].join("\n");
const st = parseStack(stackMd, { file: "stacks/s1.md", terms: ["MIT", "CC0"] });
eq("stack id", st.meta.id, "s1");
eq("stack task unquoted", st.meta.task, "A game: to sell.");
eq("stack lead skips the h1", st.lead, "Lead line one.\nLead line two.");
eq("stack lead line", st.leadLine, 10);
eq("stack sections exclude Gaps", st.sections.map((s) => s.name).join(","), "Art,Audio");
eq("stack pick need", st.sections[0].picks[0].need, "Tiles");
eq("stack pick href", st.sections[0].picks[0].href, "../catalog/2d/kenney-pixel-platformer.md");
eq("stack pick why keeps later links", st.sections[0].picks[0].why, "200 tiles on an 18x18 grid, see [UI](../catalog/2d/kenney-ui-pack.md).");
eq("stack pick line", st.sections[0].picks[1].line, 16);
eq("stack gaps", st.gaps[0].text, "No parallax layers yet.");
eq("stack gap line", st.gaps[0].line, 24);
eq("CRLF parses the same", JSON.stringify(parseStack(stackMd.replace(/\n/g, "\r\n"), { file: "stacks/s1.md", terms: ["MIT", "CC0"] })), JSON.stringify(st));
const badStack = (edit) => () => parseStack(edit(stackMd), { file: "stacks/s1.md", terms: ["MIT", "CC0"] });
throws("unknown section", badStack((m) => m.replace("## Audio", "## Levels")), 'stacks/s1.md:18: section "Levels" is not one of');
throws("sections out of order", badStack((m) => m.replace("## Art", "## Tools")), 'stacks/s1.md:18: section "Audio" is out of order');
throws("pick without a link", badStack((m) => m.replace("[Hero](../catalog/2d/luizmelo-martial-hero.md)", "Hero")), "stacks/s1.md:16: a pick line is");
throws("pick without the bold need", badStack((m) => m.replace("- **Player:** ", "- Player: ")), "stacks/s1.md:16: a pick line is");
throws("pick without a why", badStack((m) => m.replace("). Idle, run and jump.", ").")), "stacks/s1.md:16: a pick line is");
throws("licence in a why sentence", badStack((m) => m.replace("Five loops.", "Five CC0 loops.")), 'stacks/s1.md:20: the why sentence names a licence ("CC0")');
throws("licence phrase in a why sentence", badStack((m) => m.replace("Five loops.", "Five public domain loops.")), '("public domain")');
throws("missing walked", badStack((m) => m.replace("walked: 2026-09-20\n", "")), "frontmatter is missing walked");
throws("bad walked date", badStack((m) => m.replace("2026-09-20", "20 Sept")), "walked is not YYYY-MM-DD");
for (const date of ["2025-13-01", "2026-02-30", "2025-02-29", "1900-02-29", "2026-04-31"]) {
  throws(`impossible walked date ${date}`, badStack((m) => m.replace("2026-09-20", date)), "walked is not YYYY-MM-DD");
}
eq("leap-day walked date", parseStack(stackMd.replace("2026-09-20", "2000-02-29"), { file: "stacks/s1.md" }).meta.walked, "2000-02-29");
throws("empty pick section", badStack((m) => m.replace("- **Music, no credit:** [Chips](../catalog/audio/subspaceaudio-5-chiptunes.md). Five loops.", "")), 'section "Audio" has no picks');
throws("gaps line not a bullet", badStack((m) => m.replace("- No parallax layers yet.", "No parallax layers yet.")), "stacks/s1.md:24: a Gaps line is a bullet");
eq("licence terms skip plain words", licenceTerms({ licenses: { custom: {}, MIT: { spdx: "MIT" }, CC0: { spdx: "CC0-1.0" } } }, ["OFL-1.1"]).sort().join(","), "CC0,CC0-1.0,MIT,OFL-1.1");
eq("whole words only", namedLicence("A MITRE-style layout.", ["MIT"]), null);
eq("finds a hyphenated id", namedLicence("Ships under OFL-1.1 terms.", ["OFL-1.1"]), "OFL-1.1");
eq("licence in the label is not checked", parseStack(stackMd.replace("[Chips]", "[CC0 Chips]"), { file: "stacks/s1.md", terms: ["CC0"] }).sections[1].picks[0].label, "CC0 Chips");
eq("pickPath resolves from stacks/", pickPath("stacks/s1.md", "../catalog/2d/x.md"), "catalog/2d/x.md");
eq("section order constant", STACK_SECTIONS.join(","), "Art,Audio,Fonts,Tools,Gaps");
throws("licence in the lead", badStack((m) => m.replace("Lead line two.", "All picks are CC0.")), 'stacks/s1.md:11: the lead names a licence ("CC0")');
throws("licence in a gap", badStack((m) => m.replace("- No parallax layers yet.", "- No CC0 parallax layers yet.")), 'stacks/s1.md:24: the gap names a licence ("CC0")');
throws("licence in the task", badStack((m) => m.replace('task: "A game: to sell."', "task: A public domain game.")), 'stacks/s1.md:4: the task names a licence ("public domain")');
throws("licence in the title", badStack((m) => m.replace("title: Make a thing", "title: Make a MIT thing")), 'stacks/s1.md:3: the title names a licence ("MIT")');

/* stacks: owes and page ---------------------------------------------------- */
import { copyAllText, owes } from "./stacks.mjs";
import { stackJsonLd, stackPageHtml } from "./stack-page.mjs";
import { stackPageUrl } from "./shared.mjs";
const resolveDeep = makeLinkResolver({ entryPath: "stacks/s1.md", idByPath, repo: "https://github.com/o/r", kindOf: (p) => files.get(p) || null, entryBase: "../../entry/" });
eq("stack links reach entry pages two levels up", resolveDeep("../catalog/2d/kenney-ui-pack.md").href, "../../entry/kenney-ui-pack/");
eq("default entry base unchanged", resolve("kenney-ui-pack.md").href, "../kenney-ui-pack/");
eq("stackPageUrl", stackPageUrl({ siteUrl: "https://x.test/s/" }, "s1"), "https://x.test/s/stack/s1/");
const eA = { ...base, id: "a", name: "Alpha", attribution_required: true, attribution_string: 'Art by "A" <x>', status: "active", commercial: true };
const eB = { ...base, id: "b", name: "Beta", attribution_required: true, attribution_string: "Music by B", status: "active", commercial: true };
const eC = { ...base, id: "c", name: "Gamma", attribution_required: false, attribution_string: undefined, commercial: "varies", status: "needs-review" };
const eD = { ...base, id: "d", name: "Delta", attribution_required: "unknown", attribution_string: undefined, status: "active" };
const eE = { ...base, id: "e", name: "Eps", attribution_required: true, attribution_string: undefined, status: "active" };
const pickedFix = [{ need: "Tiles", entry: eA }, { need: "Music", entry: eB }, { need: "Sprites", entry: eA }, { need: "Sounds", entry: eC }, { need: "Font", entry: eD }, { need: "Icons", entry: eE }];
const ow = owes(pickedFix);
eq("credits once per entry", ow.credits.map((c) => c.entry.id).join(","), "a,b,e");
eq("an entry picked twice keeps both needs", ow.credits[0].needs.join(","), "Tiles,Sprites");
eq("a required credit with no canned line", ow.credits[2].line, null);
eq("no credit bucket", ow.noCredit.map((i) => i.entry.id).join(","), "c");
eq("per-file bucket", ow.perFile.map((i) => i.entry.id).join(","), "c");
eq("open questions bucket", ow.openQuestions.map((i) => i.entry.id).join(","), "c");
eq("unclear bucket", ow.unclear.map((i) => i.entry.id).join(","), "d");
eq("copy all joins canned lines in pick order", copyAllText(ow), 'Art by "A" <x>\nMusic by B');
const stackMeta = { id: "s1", title: 'Make a "thing" </script>', task: "A task <b>.", walked: "2026-09-20" };
const sp = (over = {}) =>
  stackPageHtml({
    stack: { meta: stackMeta },
    sections: [{ name: "Art", rows: [{ need: "Tiles", entry: eA, whyHtml: "Why <em>a</em>." }, { need: "Sounds", entry: eC, whyHtml: "Why c." }] }],
    gapsHtml: ["No parallax."],
    leadHtml: "<p>Lead</p>",
    owed: ow,
    site,
    stamp: "2026-09-24",
    total: 319,
    hasCard: true,
    now: Date.parse("2026-09-24T00:00:00Z"),
    ...over,
  });
const spage = sp();
has("stack title escaped", spage, "<title>Make a &quot;thing&quot; &lt;/script&gt; | Free Game Dev Assets</title>");
has("stack canonical", spage, '<link rel="canonical" href="https://x.test/s/stack/s1/" />');
eq("stack one h1", (spage.match(/<h1[\s>]/g) || []).length, 1);
has("stack pick links its entry page", spage, 'href="../../entry/a/"');
has("stack credit line escaped", spage, "Art by &quot;A&quot; &lt;x&gt;");
has("copy all carries every canned line", spage, 'data-copy="Art by &quot;A&quot; &lt;x&gt;\nMusic by B"');
has("no canned line note", spage, "No canned credit line: see the entry.");
has("per-file note", spage, "Some files qualify, some do not.");
has("needs-review flag on the pick", spage, 'class="pick-flag"');
has("gaps rendered", spage, "<li>No parallax.</li>");
has("walked line", spage, "Stack walked 2026-09-20. Each licence is only as current as its entry's verified date.");
has("copy script with canned lines", spage, '<script src="../../stack.js" defer></script>');
lacks("no copy script without canned lines", sp({ owed: owes([{ need: "Sounds", entry: eC }]) }), "stack.js");
const sld = spage.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
lacks("stack json-ld cannot close its script", sld, "</script");
eq("stack json-ld lists the picks", JSON.parse(sld).itemListElement[0].url, "https://x.test/s/entry/a/");
eq("stack json-ld name survives", stackJsonLd(stackMeta, [{ rows: [] }], site).name, 'Make a "thing" </script>');

/* stacks: links in --------------------------------------------------------- */
const pageWithStacks = entryPageHtml({ entry: base, leadHtml: "<p>Lead</p>", restHtml: "", deprecatedReasonHtml: null, prev: null, next: null, site, categoryLabel: "2D", stamp: "2026-09-24", total: 319, hasCard: true, now: Date.parse("2026-09-24T00:00:00Z"), stacks: [{ id: "s1", title: "Make <X>" }] });
has("used in links the stack", pageWithStacks, 'Used in: <a href="../../stack/s1/">Make &lt;X&gt;</a>');
lacks("no used in without stacks", p, "Used in");
const llmsStacks = [{ meta: { id: "s1", title: "Make X", task: "A task.", walked: "2026-09-01" }, picked: [{ need: "Tiles", entry: llmsEntries[0] }] }];
const lts = llmsTxt({ entries: llmsEntries, site, categories: cats, stacks: llmsStacks });
has("llms lists stacks", lts, "## Starter stacks\n\n- [Make X](https://x.test/s/stack/s1/): A task.");
lacks("llms without stacks has no stacks section", lt, "Starter stacks");
const lfs = llmsFullTxt({ entries: llmsEntries, site, categories: cats, bodies: new Map(), stacks: llmsStacks });
has("full lists each pick", lfs, "- Tiles: Alpha (https://x.test/s/entry/a1/); CC0; commercial OK; no credit required; active");
has("full lists credits", lfs, "Credits to ship: none");

/* deferred minors, batch A ------------------------------------------------- */
eq("deprecation reason is capitalised", deprecationReason("- Deprecated: the service is offline"), "The service is offline");
eq("bare url in bold", renderInline("**https://a.test/x**", passLink), '<strong><a href="https://a.test/x" rel="noopener noreferrer">https://a.test/x</a></strong>');
eq("bare url keeps a balanced paren", renderInline("see https://a.test/wiki/Foo_(bar).", passLink), 'see <a href="https://a.test/wiki/Foo_(bar)" rel="noopener noreferrer">https://a.test/wiki/Foo_(bar)</a>.');
eq("angle-bracket autolink", renderInline("<https://a.test/x>", passLink), '<a href="https://a.test/x" rel="noopener noreferrer">https://a.test/x</a>');
eq("bare url stops at a code span", renderInline("https://a.test/x`y`", passLink), '<a href="https://a.test/x" rel="noopener noreferrer">https://a.test/x</a><code>y</code>');
throws("malformed escape is a link error", () => resolve("bad%E0.md"), 'link target "bad%E0.md" is malformed');
eq("query on a relative link is kept", resolve("../../docs/provenance.md?plain=1").href, "https://github.com/o/r/blob/main/docs/provenance.md?plain=1");

/* deferred minors, batch B ------------------------------------------------- */
import fsTest from "node:fs";
import osTest from "node:os";
import pathTest from "node:path";
import { listStackFiles } from "./stacks.mjs";
eq("short name OFL", namedLicence("An OFL font.", []), "OFL");
eq("short name GPL", namedLicence("a GPL editor", []), "GPL");
eq("short name CC BY", namedLicence("CC BY 4.0 music", []), "CC BY");
eq("lower-case cc0", namedLicence("a cc0 pack", []), "CC0");
eq("royalty free without the hyphen", namedLicence("royalty free loops", []), "royalty free");
eq("hyphenated public-domain", namedLicence("Public-domain art", []), "public-domain");
eq("short names match whole words only", namedLicence("Wolf sprites and a gplus icon.", []), null);
eq("link targets are not scanned", parseStack(stackMd.replace("Five loops.", "Five loops, see [x](../catalog/MIT/x.md)."), { file: "stacks/s1.md", terms: ["MIT", "CC0"] }).sections[1].picks[0].why.includes("MIT"), true);
eq("a byte-order mark is ignored", parseStack(`﻿${stackMd}`, { file: "stacks/s1.md", terms: [] }).meta.id, "s1");
eq("trailing spaces on the fences are ignored", parseStack(stackMd.replace("---\nid", "---  \nid").replace("\n---\n\n#", "\n---   \n\n#"), { file: "stacks/s1.md", terms: [] }).meta.id, "s1");
const tmpRoot = fsTest.mkdtempSync(pathTest.join(osTest.tmpdir(), "stacks-"));
fsTest.mkdirSync(pathTest.join(tmpRoot, "stacks", "drafts"), { recursive: true });
for (const [f, t] of [["stacks/b.md", "B"], ["stacks/a.md", "A"], ["stacks/README.md", "R"], ["stacks/drafts/c.md", "C"]]) fsTest.writeFileSync(pathTest.join(tmpRoot, f), t);
const listed = listStackFiles(tmpRoot);
eq("listStackFiles reads the top level, sorted, without README", listed.files.map((f) => f.rel).join(","), "stacks/a.md,stacks/b.md");
eq("listStackFiles reports nested files", listed.stray.join(","), "stacks/drafts/c.md");
eq("listStackFiles keeps the text", listed.files[0].text, "A");
eq("listStackFiles without a stacks folder", listStackFiles(pathTest.join(tmpRoot, "nope")).files.length, 0);
fsTest.rmSync(tmpRoot, { recursive: true, force: true });
const lfsCredit = llmsFullTxt({ entries: llmsEntries, site, categories: cats, bodies: new Map(), stacks: [{ meta: { id: "s2", title: "Make Y", task: "A task.", walked: "2026-09-01" }, picked: [{ need: "Art", entry: { ...base, id: "b1", name: "Beta" } }] }] });
has("full carries the credit line text", lfsCredit, 'Credits to ship:\n- Beta: Art by "X" </script>');

/* deferred minors, batch C ------------------------------------------------- */
has("copy all targets a block of just the credit lines", spage, 'data-target="credits-all"');
has("that block is hidden until the fallback needs it", spage, '<pre class="attribution-string copy-all-text" id="credits-all" hidden>Art by &quot;A&quot; &lt;x&gt;\nMusic by B</pre>');

/* freshness: stats and line ------------------------------------------------ */
import { freshnessLineHtml, freshnessStats } from "./freshness.mjs";
const fNow = Date.parse("2026-09-25T12:00:00Z");
const daysAgo = (n) => new Date(fNow - n * 86400000).toISOString().slice(0, 10);
const fe = (id, name, days, over = {}) => ({ ...base, id, name, status: "active", verified: days === null ? null : daysAgo(days), ...over });
const fEntries = [
  fe("a", "Alpha", 180), fe("b", "Beta", 181), fe("c", "Gamma", 365), fe("d", "Delta", 366),
  fe("e", "Eps", 30), fe("f", "Zeta", 31), fe("g", "Eta", null), fe("h", "Theta", 400, { status: "deprecated" }),
  fe("i", "Aardvark", 366), fe("j", "Iota", 0),
];
const fs1 = freshnessStats(fEntries, fNow);
eq("freshness skips deprecated", fs1.total, 9);
eq("fresh bucket includes day 180", fs1.fresh, 4);
eq("aging bucket is 181 to 365", fs1.aging, 2);
eq("stale bucket is over 365", fs1.stale, 2);
eq("missing verified is unknown", fs1.unknown, 1);
eq("oldest ties break by name", fs1.oldest.entry.id, "i");
eq("oldest age", fs1.oldest.days, 366);
eq("recent window includes day 30, excludes 31", fs1.recent.map((r) => r.entry.id).join(","), "j,e");
eq("rows oldest first, unknown last", fs1.rows.map((r) => r.entry.id).join(","), "i,d,c,b,a,f,e,j,g");
eq("buckets match the cards", fs1.rows.every((r) => r.bucket === verifiedAge(r.entry.verified, fNow).bucket), true);
const fl = freshnessLineHtml(fs1, "2026-09-25", "freshness/");
has("line counts fresh of total", fl, "<strong>Checked within 180 days: 4 of 9.</strong>");
has("line shows aging when present", fl, "Aging (181 to 365 days): 2.");
has("line shows stale", fl, "Older than a year: 2.");
has("line shows unknown when present", fl, "No check date: 1.");
has("line shows the oldest check", fl, `Oldest check: ${daysAgo(366)} (366 days).`);
has("line shows as-of", fl, "As of 2026-09-25.");
has("line links the page", fl, '<a href="freshness/">See every check, oldest first</a>.');
const flClean = freshnessLineHtml(freshnessStats([fe("a", "Alpha", 10)], fNow), "2026-09-25", "freshness/");
lacks("no aging clause at zero", flClean, "Aging");
lacks("no unknown clause at zero", flClean, "No check date");
has("stale clause even at zero", flClean, "Older than a year: 0.");
has("one day is singular", freshnessLineHtml(freshnessStats([fe("a", "Alpha", 1)], fNow), "2026-09-25", "f/"), "(1 day)");
const fEmpty = freshnessStats([], fNow);
eq("empty catalog has no oldest", fEmpty.oldest, null);
lacks("empty catalog line has no oldest clause", freshnessLineHtml(fEmpty, "2026-09-25", "f/"), "Oldest check");

/* freshness: page ---------------------------------------------------------- */
import { freshnessPageHtml } from "./freshness.mjs";
const fp = freshnessPageHtml({ stats: freshnessStats([...fEntries, fe("k", 'Q "<b>"', 5)], fNow), site, stamp: "2026-09-25", total: 319, hasCard: true });
has("freshness title", fp, "<title>Licence freshness | Free Game Dev Assets</title>");
has("freshness canonical", fp, '<link rel="canonical" href="https://x.test/s/freshness/" />');
eq("freshness one h1", (fp.match(/<h1[\s>]/g) || []).length, 1);
has("freshness links entries one level up", fp, 'href="../entry/i/"');
has("freshness names escaped", fp, "Q &quot;&lt;b&gt;&quot;");
has("freshness line links the table", fp, '<a href="#every-check">See every check, oldest first</a>');
has("freshness table cells carry labels", fp, '<td data-label="Checked">');
eq("freshness table rows oldest first", [...fp.matchAll(/<tr class="fresh-row" data-id="([^"]+)"/g)].map((m) => m[1]).slice(0, 3).join(","), "i,d,c");
has("an undated row says so", fp, "no check date");
has("recent section present", fp, 'id="recent"');
lacks("deprecated left out of the page", fp, "Theta");

/* freshness: links in ------------------------------------------------------ */
has("entry page footer links freshness", p, '<a href="../../freshness/">Licence freshness</a>');
has("stack page footer links freshness", spage, '<a href="../../freshness/">Licence freshness</a>');
has("llms points at freshness", lt, "Licence freshness, every entry by check date: https://x.test/s/freshness/");

/* freshness: review fixes -------------------------------------------------- */
has("recent window wording counts the build day", fp, "Checked on 2026-09-25 or in the 30 days before it, newest first.");
has("empty recent window wording counts the build day", freshnessPageHtml({ stats: freshnessStats([fe("a", "Alpha", 90)], fNow), site, stamp: "2026-09-25", total: 1, hasCard: false }), "None checked on 2026-09-25 or in the 30 days before it.");

/* report (keep last) ------------------------------------------------------ */
if (failures.length) {
  console.error(`lib.test failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`lib.test ok: ${passed} assertions`);

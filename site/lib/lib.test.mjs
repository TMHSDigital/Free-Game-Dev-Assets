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
import { atomFeed, catalogCsv } from "./exports.mjs";

let passed = 0;
const failures = [];

// A test that throws (rather than failing an assertion) ends the run. Report
// what had already failed and where the run stopped, so one crash does not
// hide the failures before it.
let lastLabel = "(none yet)";
process.on("uncaughtException", (err) => {
  console.error(`lib.test crashed after ${passed} passing assertions; the last one was "${lastLabel}".`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});

function eq(label, actual, expected) {
  lastLabel = label;
  if (actual === expected) passed += 1;
  else failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function has(label, text, needle) {
  lastLabel = label;
  if (String(text).includes(needle)) passed += 1;
  else failures.push(`${label}: expected to contain ${JSON.stringify(needle)}`);
}
function lacks(label, text, needle) {
  lastLabel = label;
  if (!String(text).includes(needle)) passed += 1;
  else failures.push(`${label}: expected not to contain ${JSON.stringify(needle)}`);
}
function throws(label, fn, needle) {
  lastLabel = label;
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
eq("commercialLabel false", commercialLabel(false), "non-commercial");
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
import { makeLinkResolver, caseMismatch } from "./links.mjs";
const idByPath = new Map([["catalog/2d/kenney-ui-pack.md", "kenney-ui-pack"], ["catalog/audio/kenney-ui-audio.md", "kenney-ui-audio"]]);
const files = new Map([["docs/provenance.md", "file"], ["catalog/2d/README.md", "file"], ["catalog/video", "dir"]]);
const resolve = makeLinkResolver({ entryPath: "catalog/2d/kenney-ui-pack.md", idByPath, repo: "https://github.com/o/r", kindOf: (p) => files.get(p) || null });
eq("links: case mismatch names the component", caseMismatch("docs/Licenses.md", "docs/licenses.md"), "Licenses.md vs licenses.md");
eq("links: directory case counts", caseMismatch("Docs/a.md", "docs/a.md"), "Docs vs docs");
eq("links: same path is not a mismatch", caseMismatch("docs/licenses.md", "docs\\licenses.md"), null);
eq("links: a different file is not a case mismatch", caseMismatch("docs/a.md", "docs/b.md"), null);
eq("links: a drive letter ends the comparison", caseMismatch("e:/r/docs/a.md", "E:/r/docs/a.md"), null);
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
// #83: one scheme rule everywhere, and the unsupported scheme is named.
throws("ftp link names its scheme", () => resolve("ftp://a.test/x"), 'unsupported scheme "ftp:"');
throws("data link names its scheme", () => resolve("data:text/plain,hi"), 'unsupported scheme "data:"');
throws("javascript link names its scheme", () => resolve("javascript:alert(1)"), 'unsupported scheme "javascript:"');
eq("mailto is external", resolve("mailto:a@b.test").external, true);

/* entry page --------------------------------------------------------------- */
import { entryPageHtml, jsonLd, scriptJson } from "./entry-page.mjs";
const site = { siteUrl: "https://x.test/s/", title: "Free Game Dev Assets", tagline: "T", repo: "https://github.com/o/r" };
const base = { id: "e1", name: 'A "quoted" <Name>', url: "https://src.test/", category: "2d", license: "CC-BY-4.0", license_spdx: "CC-BY-4.0", commercial: true, attribution_required: true, attribution_string: 'Art by "X" </script>', formats: ["PNG"], verified: "2026-09-01", status: "active", path: "catalog/2d/e1.md", summary: "Sum </script> <b>" };
const page = (over = {}) => entryPageHtml({ entry: { ...base, ...over }, leadHtml: "<p>Lead</p>", restHtml: '<h2 id="notes">Notes</h2>', deprecatedReasonHtml: null, prev: null, next: { id: "e2", name: "Next one" }, site, categoryLabel: "2D", stamp: "2026-09-24", total: 319, hasCard: true, now: Date.parse("2026-09-24T00:00:00Z") });
const p = page();
has("title is escaped", p, "<title>A &quot;quoted&quot; &lt;Name&gt; · CC-BY-4.0</title>");
has("og:title keeps the licence and site name", p, '<meta property="og:title" content="A &quot;quoted&quot; &lt;Name&gt; (CC-BY-4.0) | Free Game Dev Assets" />');
has("description leads with licence, stance and credit", p, '<meta name="description" content="CC-BY-4.0, commercial use OK, credit required. Sum &lt;/script&gt; &lt;b&gt;" />');
has("canonical", p, '<link rel="canonical" href="https://x.test/s/entry/e1/" />');
eq("one h1", (p.match(/<h1[\s>]/g) || []).length, 1);
has("credit line escaped", p, "Art by &quot;X&quot; &lt;/script&gt;");
has("entry script with a credit line", p, '<script src="../../entry.js" defer></script>');
has("entry script without one, for the back link", page({ attribution_string: undefined }), '<script src="../../entry.js" defer></script>');
lacks("no copy button without a credit line", page({ attribution_string: undefined }), "copy-attribution");
has("breadcrumb catalog link can return to the results", p, '<a href="../../#catalog" data-back-to-results>Catalog</a>');
has("note when credit is required but not canned", page({ attribution_string: undefined }), "no canned credit line");
has("breadcrumb category link", p, "../../category/2d/");
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
const { CSP_META } = await import("./shared.mjs");
const okPage = `<html><head>${CSP_META}<title>T</title><link rel="canonical" href="https://x/" /></head><body><h1>A</h1><p><code>**x**</code></p><a href="../e2/">n</a><a href="https://a.test">x</a><script>var a = "**";</script></body></html>`;
const kinds = new Map([["entry/e2", "dir"], ["", "dir"]]);
const opts = { file: "entry/e1/index.html", kindOf: (p) => kinds.get(p) || null };
eq("clean page passes", checkPage(okPage, opts).length, 0);
{
  const withLinks = (links) => okPage.replace("<h1>A</h1>", `<h1 id="top">A</h1>${links}`);
  const fopts = { ...opts, idsOf: (p) => (p === "entry/e2/index.html" ? new Set(["preview-images"]) : null) };
  eq("fragment: a same-page id passes", checkPage(withLinks('<a href="#top">t</a><a href="#">x</a>'), fopts).length, 0);
  has("fragment: a missing same-page id fails", checkPage(withLinks('<a href="#nowhere">t</a>'), fopts).join(), "link #nowhere names no id on this page");
  eq("fragment: a cross-page id passes", checkPage(withLinks('<a href="../e2/#preview-images">p</a>'), fopts).length, 0);
  has("fragment: a missing cross-page id fails", checkPage(withLinks('<a href="../e2/#no-such-anchor">p</a>'), fopts).join(), "names no id on entry/e2/index.html");
  eq("fragment: an encoded id is decoded", checkPage(withLinks('<a href="#t%6Fp">t</a>'), fopts).length, 0);
  eq("fragment: unknown target ids are not guessed", checkPage(withLinks('<a href="../../#search">s</a>'), fopts).length, 0);
}
has("leaked bold", checkPage(okPage.replace("<h1>A</h1>", "<h1>A</h1>**b**"), opts).join(), "double asterisk");
has("leaked link", checkPage(okPage.replace("<h1>A</h1>", "<h1>A</h1>[a](b)"), opts).join(), "markdown link");
has("leaked backtick", checkPage(okPage.replace("<h1>A</h1>", "<h1>A</h1>`x`"), opts).join(), "backtick");
has("two h1", checkPage(okPage.replace("<h1>A</h1>", "<h1>A</h1><h1>B</h1>"), opts).join(), "expected one h1, found 2");
has("no canonical", checkPage(okPage.replace(/<link rel="canonical"[^>]*>/, ""), opts).join(), "missing canonical");
has("no content security policy", checkPage(okPage.replace(CSP_META, ""), opts).join(), "missing the Content-Security-Policy meta tag");
has("empty title", checkPage(okPage.replace("<title>T</title>", "<title></title>"), opts).join(), "missing or empty title");
has("dangling link", checkPage(okPage.replace("../e2/", "../e3/"), opts).join(), "../e3/ does not resolve");
has("link leaving the site", checkPage(okPage.replace("../e2/", "../../../x/"), opts).join(), "leaves the site");
eq("query and hash are ignored", checkPage(okPage.replace("../e2/", "../../?cat=2d#catalog"), opts).length, 0);
has("page check rejects a data: href", checkPage(okPage.replace("../e2/", "data:text/html,x"), opts).join(), 'unsupported scheme "data:"');
has("page check rejects a long title", checkPage(okPage.replace("<title>T</title>", `<title>${"t".repeat(61)}</title>`), opts).join(), "title is 61 characters, over 60");
has("page check rejects a long description", checkPage(okPage.replace("<head>", `<head><meta name="description" content="${"d".repeat(161)}" />`), opts).join(), "description is 161 characters, over 160");
eq("page check measures unescaped text", checkPage(okPage.replace("<title>T</title>", `<title>${"&amp;".repeat(20)}</title>`), opts).length, 0);
has("page check rejects a javascript: href", checkPage(okPage.replace("../e2/", "javascript:void(0)"), opts).join(), 'unsupported scheme "javascript:"');
eq("page check accepts mailto", checkPage(okPage.replace("../e2/", "mailto:a@b.test"), opts).length, 0);

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
{
  const { creditFields, fillInNote, creditLineHtml, FILL_IN_HEADER, creditsFile: cf } = await import("./owes.mjs");
  const tpl = { id: "t", name: "Tunes", license: "CC-BY-4.0", attribution_required: true, attribution_string: 'Music: "{title}" by {artist} ({title})' };
  const plain = { id: "p", name: "Plain", license: "CC-BY-4.0", attribution_required: true, attribution_string: "Art by P" };
  eq("credit fields: distinct, in order", creditFields(tpl.attribution_string).join(" "), "{title} {artist}");
  eq("credit fields: none in a plain line", creditFields("Art by P").length, 0);
  eq("credit fill note names every field", fillInNote(tpl.attribution_string), "Fill in {title} and {artist} before you ship.");
  eq("credit fill note is empty for a plain line", fillInNote("Art by P"), "");
  eq("credit html marks fields and escapes the rest", creditLineHtml('"{a}" <b>', (t) => t.replace(/</g, "&lt;").replace(/"/g, "&quot;")), '&quot;<mark class="credit-field">{a}</mark>&quot; &lt;b>');
  const owT = owes([{ need: "Music", entry: tpl }, { need: "Art", entry: plain }]);
  eq("copy all starts with the fill-in line when a line is a template", copyAllText(owT).split("\n")[0], FILL_IN_HEADER);
  eq("copy all has no fill-in line without templates", copyAllText(owes([{ need: "Art", entry: plain }])), "Art by P");
  const file = cf(owT, { format: "md" });
  eq("credits file names the templated entries", file.includes(`${FILL_IN_HEADER} The lines for Tunes are templates`), true);
  eq("credits file has no fill-in note without templates", cf(owes([{ need: "Art", entry: plain }])).includes(FILL_IN_HEADER), false);
}

/* entry page: maintenance and shortlist toggle ----------------------------- */
has("maintenance row on an archived entry", page({ maintenance: "archived" }), "<dt>Maintenance</dt><dd>archived: The source repository is archived");
lacks("no maintenance row by default", page(), "<dt>Maintenance</dt>");
has("engine lock row on a UE-only entry", page({ engine_lock: "unreal" }), "<dt>Engine lock</dt><dd>Licensed for use only in products built with Unreal Engine");
has("Unreal version row", page({ ue_versions: "5.4-5.8" }), "<dt>Unreal Engine</dt><dd>5.4-5.8, as stated by the source");
lacks("no engine rows by default", page(), "<dt>Engine lock</dt>");
has("entry page has a shortlist toggle", page(), 'data-shortlist="e1"');
has("entry page loads the shortlist module", page(), '<script type="module" src="../../shortlist.js"></script>');

/* entry page: every licence statement (#225) ------------------------------- */
{
  const nc = page({ commercial: false });
  has("non-commercial active entry: banner", nc, "<strong>Not for commercial use.</strong>");
  has("non-commercial active entry: facts row", nc, "<dt>Commercial use</dt><dd>non-commercial</dd>");
  has("non-commercial active entry: verdict", nc, "<span>non-commercial</span>");
  const ncDep = page({ commercial: false, status: "deprecated" });
  has("non-commercial deprecated entry: deprecated banner", ncDep, "<strong>Deprecated.</strong>");
  lacks("non-commercial deprecated entry: no non-commercial banner", ncDep, "Not for commercial use.");
  lacks("commercial entry: no non-commercial banner", page(), "Not for commercial use.");

  const notReq = page({ attribution_required: false, attribution_string: undefined });
  has("credit not required: facts row", notReq, "<dt>Credit</dt><dd>Not required</dd>");
  has("credit not required: verdict", notReq, "<span>Credit: Not required</span>");
  lacks("credit not required: no copy button", notReq, 'id="copy-attribution"');
  const unclear = page({ attribution_required: undefined, attribution_string: undefined });
  has("credit unclear: facts row", unclear, "<dt>Credit</dt><dd>Unclear: read the Notes</dd>");
  lacks("credit unclear: no copy button", unclear, 'id="copy-attribution"');
  const noLine = page({ attribution_required: true, attribution_string: undefined });
  has("credit required, no line: note", noLine, "Attribution is required and no canned credit line is recorded.");
  has("credit required, no line: facts row", noLine, "<dt>Credit</dt><dd>Required</dd>");
  lacks("credit required, no line: no copy button", noLine, 'id="copy-attribution"');
  const plain = page();
  has("credit line: copy button", plain, 'id="copy-attribution"');
  lacks("plain credit line: no fill-in note", plain, "credit-fill");
  lacks("plain credit line: no data-fill", plain, "data-fill=");
  const tpl = page({ attribution_string: 'Music: "{title}" by Ann' });
  has("template credit line: fill-in note", tpl, '<p class="attribution-note credit-fill">Fill in {title} before you ship. The line is a template.</p>');
  has("template credit line: data-fill on the button", tpl, 'data-fill="Fill in {title} before you ship."');
  has("template credit line: field marked", tpl, '<mark class="credit-field">{title}</mark>');

  const shipping = '<a class="facts-guide" href="../../guide/shipping/">shipping to stores</a>';
  has("cc-by family: shipping link", page({ licenseFamily: "cc-by" }), shipping);
  has("copyleft family: shipping link", page({ licenseFamily: "copyleft" }), shipping);
  lacks("cc0 family: no shipping link", page({ licenseFamily: "cc0" }), shipping);

  has("spdx differs from licence: both shown", page({ license: "CC BY 4.0", license_spdx: "CC-BY-4.0" }), "<dt>Licence</dt><dd>CC BY 4.0 (CC-BY-4.0) ");
  has("spdx equals licence: shown once", page(), "<dt>Licence</dt><dd>CC-BY-4.0 <a");
  has("no spdx: licence alone", page({ license: "custom", license_spdx: undefined }), "<dt>Licence</dt><dd>custom <a");

  const pg = (prev, next) => entryPageHtml({ entry: base, leadHtml: "", restHtml: "", deprecatedReasonHtml: null, prev, next, site, categoryLabel: "2D", stamp: "2026-09-24", total: 1, hasCard: false, now: Date.parse("2026-09-24T00:00:00Z") });
  const onlyPrev = pg({ id: "e0", name: "Before" }, null);
  has("pager, prev only: prev link", onlyPrev, '<a class="btn-ghost" href="../e0/" rel="prev">');
  lacks("pager, prev only: no next link", onlyPrev, 'rel="next"');
  const onlyNext = pg(null, { id: "e2", name: "After" });
  has("pager, next only: next link", onlyNext, '<a class="btn-ghost" href="../e2/" rel="next">');
  lacks("pager, next only: no prev link", onlyNext, 'rel="prev"');
  lacks("pager, neither: no pager", pg(null, null), 'class="page-pager"');
}
/* shortlist: CREDITS file -------------------------------------------------- */
import { creditsFile } from "./owes.mjs";
const eF = { ...base, id: "f", name: "Font F", license: "SIL OFL", attributionClass: "notice", attribution_required: false, status: "active", commercial: true };
const owShort = owes([eA, eB, eC, eD, eE, eF].map((entry) => ({ need: "shortlist", entry })));
eq("notices bucket holds carry-the-licence entries", owShort.notices.map((i) => i.entry.id).join(","), "f");
const md = creditsFile(owShort, { format: "md", pageUrl: (e) => `https://x.test/entry/${e.id}/`, date: "2026-09-26" });
has("md credits carry the canned line", md, '- Art by "A" <x>');
has("md credits flag a missing canned line", md, "- [Eps](https://x.test/entry/e/): no canned credit line");
has("md lists notices to keep", md, "## Notices to keep with the files");
has("md lists per-file review", md, "## Check each file");
has("md lists open questions", md, "## Open questions");
has("md lists unclear credit", md, "## Unclear credit");
has("md is dated", md, "on 2026-09-26");
const txt = creditsFile(owShort, { format: "txt", pageUrl: (e) => `https://x.test/entry/${e.id}/` });
lacks("txt has no markdown links", txt, "](");
has("txt gives the page url plainly", txt, "Gamma (CC-BY-4.0) <https://x.test/entry/c/>");
eq("an empty shortlist still makes a file", creditsFile(owes([])).startsWith("# Credits"), true);
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
has("stack title escaped", spage, "<title>Make a &quot;thing&quot; &lt;/script&gt;</title>");
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
{
  // #220: the stack panel and the CREDITS export carry the same sections.
  const both = sp({ owed: owShort });
  has("stack lists notices to keep", both, "<h3>Notices to keep with the files</h3>");
  lacks("a notice pick is not also 'no credit needed'", both.match(/<h3>No credit needed<\/h3><p>[^<]*(?:<a[^>]*>[^<]*<\/a>[^<]*)*<\/p>/)?.[0] || "", "Font F");
  const fileHeads = [...creditsFile(owShort, { format: "md" }).matchAll(/^## (.+)$/gm)].map((m) => m[1]).sort();
  const pageHeads = [...both.matchAll(/<div class="owes-group"><h3>([^<]+)<\/h3>/g)].map((m) => m[1]).sort();
  eq("stack panel and CREDITS export have the same sections", pageHeads.join("|"), fileHeads.join("|"));
}
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
eq("freshness line is one sentence", fl, '<strong>4 of 9</strong> licences re-read in the last 180 days. <a href="freshness/">Every check, oldest first</a>.');
const fEmpty = freshnessStats([], fNow);
eq("empty catalog has no oldest", fEmpty.oldest, null);
eq("empty catalog line still reads", freshnessLineHtml(fEmpty, "2026-09-25", "f/"), '<strong>0 of 0</strong> licences re-read in the last 180 days. <a href="f/">Every check, oldest first</a>.');

/* freshness: page ---------------------------------------------------------- */
import { freshnessPageHtml } from "./freshness.mjs";
const fp = freshnessPageHtml({ stats: freshnessStats([...fEntries, fe("k", 'Q "<b>"', 5)], fNow), site, stamp: "2026-09-25", total: 319, hasCard: true });
has("freshness title", fp, "<title>Licence freshness | Free Game Dev Assets</title>");
has("freshness canonical", fp, '<link rel="canonical" href="https://x.test/s/freshness/" />');
eq("freshness one h1", (fp.match(/<h1[\s>]/g) || []).length, 1);
has("freshness links entries one level up", fp, 'href="../entry/i/"');
has("freshness names escaped", fp, "Q &quot;&lt;b&gt;&quot;");
has("freshness line links the table", fp, '<a href="#every-check">Every check, oldest first</a>');
has("freshness table cells carry labels", fp, '<td data-label="Checked">');
eq("freshness table rows oldest first", [...fp.matchAll(/<tr class="fresh-row" data-id="([^"]+)"/g)].map((m) => m[1]).slice(0, 3).join(","), "i,d,c");
has("an undated row says so", fp, "no check date");
has("recent section present", fp, 'id="recent"');
lacks("deprecated left out of the page", fp, "Theta");

/* freshness: links in ------------------------------------------------------ */
has("entry page footer links freshness", p, '<a href="../../freshness/">Licence freshness</a>');
has("stack page footer links freshness", spage, '<a href="../../freshness/">Licence freshness</a>');
has("llms points at freshness", lt, "Licence freshness, every entry by check date: https://x.test/s/freshness/");

/* head: every page type carries the same baseline (#104) ------------------- */
import { baseHeadHtml } from "./shared.mjs";
{
  const homeHead = baseHeadHtml({ site, title: site.title, description: site.tagline, url: site.siteUrl, hasCard: true });
  const baseline = [
    '<link rel="sitemap" type="application/xml" href="https://x.test/s/sitemap.xml" />',
    '<link rel="alternate" type="application/atom+xml" title="Free Game Dev Assets: new sources" href="https://x.test/s/feed.xml" />',
    '<link rel="alternate" type="application/atom+xml" title="Free Game Dev Assets: recently verified" href="https://x.test/s/reverified.xml" />',
    '<meta name="theme-color" content="#1a4d3e" media="(prefers-color-scheme: light)" />',
    '<meta name="theme-color" content="#0f1216" media="(prefers-color-scheme: dark)" />',
    '<meta property="og:image" content="https://x.test/s/og-card.png" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="Free Game Dev Assets: T" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta property="og:site_name" content="Free Game Dev Assets" />',
  ];
  for (const [name, html] of [["home head", homeHead], ["entry page", p], ["stack page", spage], ["freshness page", fp]]) {
    for (const tag of baseline) has(`${name} has ${tag.slice(0, 40)}`, html, tag);
    eq(`${name} has one canonical`, (html.match(/<link rel="canonical"/g) || []).length, 1);
  }
  has("entry page og:type is article", p, '<meta property="og:type" content="article" />');
  has("freshness og:type is website", fp, '<meta property="og:type" content="website" />');
  has("no card falls back to a summary card", baseHeadHtml({ site, title: "t", description: "d", url: "https://x.test/s/", hasCard: false }), '<meta name="twitter:card" content="summary" />');
  lacks("no card has no image", baseHeadHtml({ site, title: "t", description: "d", url: "https://x.test/s/", hasCard: false }), "og:image");
}

/* seo title and description (#103) ----------------------------------------- */
import { clipText, seoDescription, seoTitle } from "./shared.mjs";
eq("clip keeps short text", clipText("Short.", 60), "Short.");
eq("clip cuts at a sentence end", clipText("First sentence here. Second sentence is long and goes on.", 40), "First sentence here.");
eq("clip cuts at a word with an ellipsis when no sentence fits", clipText("one two three four five six seven eight nine", 20), "one two three four…");
eq("clip never exceeds max", clipText("x".repeat(100), 30).length <= 30, true);
eq("seo title joins name and licence", seoTitle("Kenney", "CC0"), "Kenney · CC0");
eq("seo title drops the licence when too long", seoTitle("A".repeat(50), "CC-BY-SA-4.0"), "A".repeat(50));
eq("seo title clips a very long name", seoTitle("word ".repeat(20).trim(), "CC0").length <= 60, true);
eq("seo description states licence, stance and credit", seoDescription({ license: "CC0", commercial: true, attribution_required: false, summary: "Lots of packs. More text." }), "CC0, commercial use OK, no credit needed. Lots of packs.");
eq("seo description with varies and unknown", seoDescription({ license: "varies", commercial: "varies", attribution_required: "unknown", summary: "" }), "Mixed licences, per file, commercial use varies per file, credit varies per file.");
eq("seo description: custom reads as prose", seoDescription({ license: "custom", commercial: true, attribution_required: false, summary: "" }), "Custom licence, commercial use OK, no credit needed.");
eq("seo description: varies never promises no credit", seoDescription({ license: "varies", commercial: "varies", attribution_required: false, summary: "" }).includes("no credit needed"), false);
eq("seo description fits the limit", seoDescription({ license: "CC-BY-4.0", commercial: true, attribution_required: true, summary: "word ".repeat(60) }).length <= 160, true);

/* sitemap lastmod (#108) --------------------------------------------------- */
import { sitemapXml } from "./exports.mjs";
{
  const { commitDatesFromLog, DATED_PATHS } = await import("./exports.mjs");
  const log = "\0" + "2026-10-20\n\ndocs/fonts.md\ncatalog/2d/a.md\n\0" + "2026-09-01\n\ndocs/fonts.md\ndocs/data.md\n";
  const dates = commitDatesFromLog(log);
  eq("git dates: newest commit wins", dates.get("docs/fonts.md"), "2026-10-20");
  eq("git dates: older-only file keeps its date", dates.get("docs/data.md"), "2026-09-01");
  const siteCfg = JSON.parse(nodeFs.readFileSync(new URL("../config.json", import.meta.url), "utf8"));
  const undated = (siteCfg.guides || []).filter((g) => !DATED_PATHS.some((d) => g.path.startsWith(`${d}/`)));
  eq("git dates: every guide lives under a dated path", undated.map((g) => g.path).join(", "), "");
  const sm = sitemapXml({ site, stamp: "2026-11-03", entries: [], guides: [{ id: "fonts", path: "docs/fonts.md" }], modified: dates });
  eq("sitemap: a guide's lastmod is its doc's last commit", sm.includes("<loc>https://x.test/s/guide/fonts/</loc><lastmod>2026-10-20</lastmod>"), true);
}
{
  const sm = sitemapXml({
    site,
    stamp: "2026-10-22",
    entries: [
      { id: "old", path: "catalog/2d/old.md", verified: "2026-07-01" },
      { id: "edited", path: "catalog/2d/edited.md", verified: "2026-07-01" },
      { id: "undated", path: "catalog/2d/undated.md", verified: null },
    ],
    stacks: [{ rel: "stacks/s1.md", meta: { id: "s1", walked: "2026-09-01" } }],
    modified: new Map([["catalog/2d/edited.md", "2026-10-15"], ["catalog/2d/old.md", "2026-06-01"], ["stacks/s1.md", "2026-10-02"]]),
  });
  has("sitemap home has the build date", sm, "<loc>https://x.test/s/</loc><lastmod>2026-10-22</lastmod>");
  has("sitemap freshness has the build date", sm, "<loc>https://x.test/s/freshness/</loc><lastmod>2026-10-22</lastmod>");
  has("sitemap entry keeps verified when it is later than the commit", sm, "<loc>https://x.test/s/entry/old/</loc><lastmod>2026-07-01</lastmod>");
  has("sitemap entry takes the later commit date", sm, "<loc>https://x.test/s/entry/edited/</loc><lastmod>2026-10-15</lastmod>");
  has("sitemap entry with no dates falls back to the build date", sm, "<loc>https://x.test/s/entry/undated/</loc><lastmod>2026-10-22</lastmod>");
  has("sitemap stack takes the later commit date", sm, "<loc>https://x.test/s/stack/s1/</loc><lastmod>2026-10-02</lastmod>");
  eq("every sitemap url has a lastmod", (sm.match(/<url>/g) || []).length, (sm.match(/<lastmod>/g) || []).length);
}

/* sponsor link, not an iframe (#101) --------------------------------------- */
import { sponsorButtonHtml } from "./shared.mjs";
lacks("sponsor button is not an iframe", sponsorButtonHtml(), "<iframe");
has("sponsor button links to GitHub Sponsors", sponsorButtonHtml(), 'href="https://github.com/sponsors/TMHSDigital"');
lacks("entry page loads nothing from github.com", p.replace(/href="https:\/\/github\.com[^"]*"/g, ""), "github.com/sponsors/TMHSDigital/button");
eq("entry page has no iframe", (p.match(/<iframe/g) || []).length, 0);

/* new this month (#90) ----------------------------------------------------- */
import { newEntriesLineHtml } from "./freshness.mjs";
{
  const ne = (id, added, status = "active") => ({ id, name: id.toUpperCase(), added, status });
  const pool = [ne("old", "2026-08-01"), ne("n1", "2026-10-20"), ne("n2", "2026-10-01"), ne("n3", "2026-09-25"), ne("dead", "2026-10-21", "deprecated"), ne("undated", null)];
  const line = newEntriesLineHtml(pool, "2026-10-22", { named: 2 });
  has("new line counts the last 30 days", line, "New in the last 30 days: 3.");
  has("new line names the newest first", line, '<a href="entry/n1/">N1</a>, <a href="entry/n2/">N2</a>');
  has("new line links the rest to the added sort", line, '<a href="?sort=added#catalog">1 more</a>');
  lacks("new line skips deprecated", line, "DEAD");
  eq("new line is empty when nothing is new", newEntriesLineHtml([ne("old", "2026-01-01")], "2026-10-22"), "");
}

/* freshness: review fixes -------------------------------------------------- */
has("recent window wording counts the build day", fp, "Checked on 2026-09-25 or in the 30 days before it, newest first.");
has("empty recent window wording counts the build day", freshnessPageHtml({ stats: freshnessStats([fe("a", "Alpha", 90)], fNow), site, stamp: "2026-09-25", total: 1, hasCard: false }), "None checked on 2026-09-25 or in the 30 days before it.");

/* frontmatter -------------------------------------------------------------- */
import { evidenceSection, parseFrontmatter, plainText, summaryFromBody } from "./frontmatter.mjs";
import { latestAllowedDate } from "./shared.mjs";
const fm = (lines, body = "Body.\n") => parseFrontmatter(`---\n${lines.join("\n")}\n---\n${body}`);
eq("frontmatter: unterminated double quote is an error", fm(['name: "Foo']).errors.some((e) => e === 'line 2: "name" opens a double quote that is never closed'), true);
eq("frontmatter: unterminated single quote in a list item", fm(["tags:", "  - 'a"]).errors.some((e) => e === "line 3: list item opens a single quote that is never closed"), true);
eq("frontmatter: column-0 list item is an error", fm(["tags:", "- foo: bar"]).errors.some((e) => e.startsWith('line 3: list item "- foo: bar" starts at column 0')), true);
eq("frontmatter: column-0 list item does not become a key", Object.keys(fm(["tags:", "- foo: bar"]).meta).join(","), "tags");
eq("frontmatter: key:value with no space is an error", fm(["key:value"]).errors.some((e) => e.includes("needs a space after the colon")), true);
eq("frontmatter: a colon inside a value is fine", fm(["url: https://a.example/x:y"]).meta.url, "https://a.example/x:y");
eq("frontmatter: '' inside a single-quoted scalar", fm(["name: 'Kay''s # 1'"]).meta.name, "Kay's # 1");
eq("frontmatter: '' in a single-quoted scalar raises no error", fm(["name: 'Kay''s # 1'"]).errors.length, 0);
eq("frontmatter: '' inside a flow-list item", fm(["tags: ['it''s', b]"]).meta.tags.join("|"), "it's|b");
eq("frontmatter: closed quotes stay clean", fm(['name: "Foo"', "tags:", "  - 'a'"]).errors.length, 0);
eq("frontmatter: a lone quote character is unterminated", fm(['name: "']).errors.length, 1);
const f1 = fm([
  "id: a",
  'attribution_string: "Music \\"{title}\\" by {artist}"',
  'tags: ["sci-fi, space", ui, \'it\'\'s\']',
  "formats:",
  "  - PNG",
  '  - "SVG"',
  "# a comment",
  "commercial: true",
]);
eq("frontmatter undoes quote escapes", f1.meta.attribution_string, 'Music "{title}" by {artist}');
eq("frontmatter keeps a quoted comma inside one list item", JSON.stringify(f1.meta.tags), JSON.stringify(["sci-fi, space", "ui", "it's"]));
eq("frontmatter reads a block list", JSON.stringify(f1.meta.formats), JSON.stringify(["PNG", "SVG"]));
eq("frontmatter reads booleans", f1.meta.commercial, true);
eq("frontmatter has no errors on good input", f1.errors.length, 0);
eq("frontmatter ignores a byte-order mark", parseFrontmatter("﻿---\nid: a\n---\nB")?.meta.id, "a");
// #227: prototype keys are refused, and their list items do not attach elsewhere.
{
  const p = fm(["id: x", "__proto__:", "  - evil", "name: y"]);
  has("frontmatter refuses a __proto__ key", p.errors.join("|"), 'line 3: "__proto__" is not allowed as a key');
  eq("frontmatter: meta keeps a plain prototype", Object.getPrototypeOf(p.meta), Object.prototype);
  has("frontmatter refuses a constructor key", fm(["constructor: x"]).errors.join("|"), '"constructor" is not allowed as a key');
}
// #234: a trailing comma ends a flow list; an empty item is an error.
eq("flow list: one trailing comma is dropped", JSON.stringify(fm(["tags: [a, b,]"]).meta.tags), '["a","b"]');
eq("flow list: trailing comma is not an error", fm(["tags: [a, b,]"]).errors.length, 0);
has("flow list: an empty middle item is an error", fm(["subcategories: [x, , y]"]).errors.join("|"), 'line 2: "subcategories" has an empty list item');
has("flow list: two trailing commas leave an empty item", fm(["tags: [a,,]"]).errors.join("|"), "has an empty list item");
eq("flow list: a quoted comma is not a separator", JSON.stringify(fm(['tags: ["a, b", c]']).meta.tags), '["a, b","c"]');
has("block list: an empty quoted item is an error", fm(["tags:", '  - ""', "  - b"]).errors.join("|"), "line 3: list item is empty");
eq("frontmatter with CRLF line endings", parseFrontmatter("---\r\nid: a\r\nname: B\r\n---\r\nBody")?.meta.name, "B");
has("frontmatter rejects a duplicate key", fm(["id: a", "id: b"]).errors.join(), 'line 3: key "id" is given twice');
has("frontmatter rejects a line that is not key: value", fm(["id: a", "just words"]).errors.join(), 'line 3: "just words" is not a key: value line');
eq("no frontmatter is null", parseFrontmatter("# Title\n"), null);
// #79: trailing comments. #84: a comment between a key and its block list.
const f2 = fm([
  "id: a",
  "tags: [low-poly, modular]   # describe the content",
  "name: Kay's pack # note",
  'attribution_string: "Art # by X"   # keep the hash inside the quotes',
  "langs: [c#, f#]",
  'colour: "#fff"',
  "ref: a#b",
  "verified: 2026-07-19   # the day you read the licence",
  "formats:",
  "  # content words only",
  "",
  "  - PNG   # a comment on an item",
  "  - SVG",
  "commercial: true # yes",
]);
eq("frontmatter strips a comment after a flow list", JSON.stringify(f2.meta.tags), JSON.stringify(["low-poly", "modular"]));
eq("frontmatter strips a comment after a bare scalar with an apostrophe", f2.meta.name, "Kay's pack");
eq("frontmatter keeps a # inside quotes", f2.meta.attribution_string, "Art # by X");
eq("frontmatter keeps C# and F#", JSON.stringify(f2.meta.langs), JSON.stringify(["c#", "f#"]));
eq("frontmatter keeps a quoted # value", f2.meta.colour, "#fff");
eq("frontmatter keeps a # with no space before it", f2.meta.ref, "a#b");
eq("frontmatter strips a comment after a date", f2.meta.verified, "2026-07-19");
eq("frontmatter block list after a comment and a blank line", JSON.stringify(f2.meta.formats), JSON.stringify(["PNG", "SVG"]));
eq("frontmatter boolean before a comment", f2.meta.commercial, true);
eq("frontmatter has no errors with comments everywhere", f2.errors.join(), "");
eq("frontmatter keeps a quoted boolean as text", fm(["id: a", 'commercial: "true"']).meta.commercial, "true");
has("frontmatter flags a hashtag read as a comment", fm(["id: a", "name: Sonniss #GameAudioGDC Bundle"]).errors.join(), '"name" is cut at " #"');
eq("frontmatter keeps a quoted hashtag", fm(["id: a", 'name: "Sonniss #GameAudioGDC Bundle"']).meta.name, "Sonniss #GameAudioGDC Bundle");
has("frontmatter flags a list item cut at a hashtag", fm(["id: a", "tags:", "  - foo #bar"]).errors.join(), 'line 4: list item is cut at " #"');
has("frontmatter flags a list item that is only a hashtag", fm(["id: a", "tags:", "  - #gamedev"]).errors.join(), "line 4: list item is empty");
eq("frontmatter keeps a commented list item", JSON.stringify(fm(["id: a", "tags:", "  - foo # a note", '  - "bar #baz"']).meta.tags), JSON.stringify(["foo", "bar #baz"]));
eq("evidence stops at the next heading, whatever its letter", evidenceSection("## Evidence\n\n- e (2026-01-01)\n\n## Extras\n\n- x"), "## Evidence\n\n- e (2026-01-01)\n");
eq("summary keeps underscores", summaryFromBody("Split by Rig_Medium and **KHR_draco**.\n\n## Notes"), "Split by Rig_Medium and KHR_draco.");
eq("summary keeps C# and link text", summaryFromBody("# T\n\nA [C#](x.md) library, `code`, *em*."), "A C# library, code, em.");
eq("plain text undoes escapes", plainText("A \\*literal\\* & <b>"), "A *literal* & <b>");
eq("summary is capped at 220", summaryFromBody("word ".repeat(80)).length, 218);

/* markdown: review fixes --------------------------------------------------- */
eq("link href keeps balanced parens", renderInline("[Foo](https://en.wikipedia.org/wiki/Foo_(bar)) next", passLink), '<a href="https://en.wikipedia.org/wiki/Foo_(bar)" rel="noopener noreferrer">Foo</a> next');
eq("misnested emphasis stays literal", renderInline("**a *b** c*", passLink), "<strong>a *b</strong> c*");
eq("italic around bold still works", renderInline("*a **b** c*", passLink), "<em>a <strong>b</strong> c</em>");
has("a line starting with an autolink is not raw HTML", rb("<https://a.test/x> is the page."), '<a href="https://a.test/x"');
throws("a line starting with a tag is still raw HTML", () => rb("<b>bold</b>"), "raw HTML");
const dupIds = rb("## Notes\n\nx\n\n## Notes\n\ny\n\n## Content\n\nz");
has("first heading keeps its id", dupIds, '<h2 id="notes">');
has("repeated heading gets a suffix", dupIds, '<h2 id="notes-2">');
has("heading avoids a template id", dupIds, '<h2 id="content-2">');

/* dates -------------------------------------------------------------------- */
eq("real date", isRealDate("2026-02-28"), true);
eq("leap day", isRealDate("2028-02-29"), true);
eq("no month 13", isRealDate("2025-13-01"), false);
eq("no 30 February", isRealDate("2026-02-30"), false);
eq("shape only is not enough", isRealDate("2026-9-1"), false);
eq("latest allowed is tomorrow in UTC", latestAllowedDate(Date.parse("2026-09-25T23:30:00Z")), "2026-09-26");

/* exports ------------------------------------------------------------------ */
const sample = [
  { id: "a", name: 'Say "hi", ok', url: "https://x.test/a", category: "2d", license: "CC0", commercial: true, formats: ["PNG", "SVG"], tags: [], added: "2026-07-20", verified: "2026-09-01", status: "active", page: "entry/a/", summary: "A & B" },
  { id: "b", name: "Old", url: "https://x.test/b", category: "2d", license: "MIT", added: "2026-07-19", verified: "2026-01-01", status: "deprecated", page: "entry/b/" },
  { id: "c", name: "New", url: "https://x.test/c", category: "3d", license: "CC0", added: "2026-09-20", verified: "2026-08-10", status: "active", page: "entry/c/", summary: "" },
];
const csv = catalogCsv(sample, "https://s.test/site/");
has("csv header", csv, "id,name,url,category");
has("csv has the added column before verified", csv, "tags,added,verified,status");
has("csv quotes commas and quotes", csv, '"Say ""hi"", ok"');
has("csv joins lists", csv, "PNG; SVG");
has("csv ends with the credit columns", csv, "status,page,subcategories,publisher,attribution_string\r\n");
has("csv absolute page url", csv, "https://s.test/site/entry/a/");
const feed = atomFeed({ entries: sample, site: { title: "T", tagline: "t", siteUrl: "https://s.test/site/" }, generatedAt: "2026-10-01T00:00:00.000Z", kind: "verified" });
has("feed escapes summary", feed, "CC0. A &amp; B");
lacks("feed skips deprecated", feed, "entry/b/");
eq("reverified feed is by verified, newest first", feed.indexOf("entry/a/") < feed.indexOf("entry/c/"), true);
has("reverified feed names itself", feed, '<link rel="self" href="https://s.test/site/reverified.xml" />');
const newFeed = atomFeed({ entries: sample, site: { title: "T", tagline: "t", siteUrl: "https://s.test/site/" }, generatedAt: "2026-10-01T00:00:00.000Z" });
eq("new-sources feed is by added, newest first", newFeed.indexOf("entry/c/") < newFeed.indexOf("entry/a/"), true);
has("new-sources feed is the default feed.xml", newFeed, '<link rel="self" href="https://s.test/site/feed.xml" />');
has("new-sources feed uses the added date", newFeed, "<updated>2026-09-20T00:00:00Z</updated>");
has("new-sources feed title", newFeed, "<title>T: new sources</title>");
{
  const catFeed = atomFeed({ entries: sample, site: { title: "T", tagline: "t", siteUrl: "https://s.test/site/" }, generatedAt: "2026-10-01T00:00:00.000Z", category: { id: sample[0].category, label: "Cat & Co" } });
  const others = sample.filter((e) => e.category !== sample[0].category && e.status !== "deprecated");
  has("category feed names itself", catFeed, `<link rel="self" href="https://s.test/site/category/${sample[0].category}/feed.xml" />`);
  has("category feed links its page", catFeed, `<link href="https://s.test/site/category/${sample[0].category}/" />`);
  has("category feed title escapes the label", catFeed, "<title>T: new sources in Cat &amp; Co</title>");
  has("category feed keeps its own entries", catFeed, `entry/${sample[0].id}/`);
  for (const e of others) lacks(`category feed leaves out ${e.id}`, catFeed, `entry/${e.id}/`);
}

/* review fixes, 2026-10 (#59-#66) ------------------------------------------ */
import { csvField } from "./exports.mjs";
import { checkMaintenanceRepos, classify, reportUrl, siteOf, staleDaysFrom } from "./link-check.mjs";
import { listEntryFiles } from "./entry-files.mjs";
import nodeFs from "node:fs";
import nodeOs from "node:os";
import nodePath from "node:path";

// #59: Atom required elements.
for (const tag of ["<id>", "<title>", "<updated>", "<author><name>T</name>"]) has(`feed has ${tag}`, feed, tag);
eq("every feed entry has id, title, updated", (feed.match(/<entry>[\s\S]*?<\/entry>/g) || []).every((e) => /<id>/.test(e) && /<title>/.test(e) && /<updated>/.test(e)), true);
eq("feed respects limit", (atomFeed({ entries: sample, site: { title: "T", tagline: "t", siteUrl: "https://s.test/" }, generatedAt: "x", limit: 1 }).match(/<entry>/g) || []).length, 1);
eq("feed with no entries is still a feed", atomFeed({ entries: [], site: { title: "T", tagline: "t", siteUrl: "https://s.test/" }, generatedAt: "x" }).includes("</feed>"), true);

// #74: homepage JSON-LD.
import { homeJsonLd } from "./exports.mjs";
const ld = homeJsonLd({ site: { title: "T", tagline: "t.", siteUrl: "https://s.test/site/" }, generatedAt: "2026-10-04T12:00:00Z", total: 3 });
eq("home ld types", ld.map((x) => x["@type"]).join(","), "WebSite,Dataset");
eq("home ld search target", ld[0].potentialAction.target.urlTemplate, "https://s.test/site/?q={search_term_string}");
eq("home ld csv download", ld[1].distribution[0].contentUrl, "https://s.test/site/catalog.csv");
eq("home ld date", ld[1].dateModified, "2026-10-04");

// #62: formula-leading cells are neutralised, then quoted as usual.
for (const lead of ["=", "+", "-", "@", "\t"]) eq(`csv neutralises ${JSON.stringify(lead)}`, csvField(`${lead}1+1`).replace(/^"/, "").startsWith("'"), true);
eq("csv leaves plain text alone", csvField("Kenney"), "Kenney");
eq("csv quotes a neutralised comma", csvField("=a,b"), `"'=a,b"`);

// #61: NUL in the input cannot loop the restore.
eq("NUL slot token in a code span", renderInline("`\u00000\u0000` x", passLink), "<code>0</code> x");
eq("bare NUL is dropped", renderInline("a\u0000b", passLink), "ab");

// #60: llms reads the same balanced-paren hrefs as the site.
const lfParens = llmsFullTxt({
  entries: [llmsEntries[0]],
  site,
  categories: cats,
  bodies: new Map([["a1", "# A\n\nSee [w](https://en.wikipedia.org/wiki/Foo_(bar)) and [r](Foo_(bar).md)."]]),
  resolverFor: () => (href) => (href.startsWith("http") ? { href, external: true } : href === "Foo_(bar).md" ? { href: "../foo/", external: false } : (() => { throw new Error(`bad href ${href}`); })()),
});
has("llms keeps an external balanced-paren href", lfParens, "[w](https://en.wikipedia.org/wiki/Foo_(bar))");
has("llms resolves a relative balanced-paren href", lfParens, "[r](https://x.test/s/entry/foo/)");

// #65: link-check classification and report escaping.
eq("site of a .co.uk host", siteOf("www.example.co.uk"), "example.co.uk");
eq("site of a plain host", siteOf("www.kenney.nl"), "kenney.nl");
eq("site of a github.io host", siteOf("user.github.io"), "user.github.io");
eq("moved between .co.uk sites", classify("https://a.co.uk/x", 200, "https://b.co.uk/x").kind, "moved");
eq("same .co.uk site is ok", classify("https://a.co.uk/x", 200, "https://www.a.co.uk/y").kind, "ok");
eq("github repo transfer is moved", classify("https://github.com/a/b", 200, "https://github.com/c/b").kind, "moved");
eq("403 is blocked", classify("https://a.test/", 403, "https://a.test/").kind, "blocked");
eq("404 is dead", classify("https://a.test/", 404, "https://a.test/").kind, "dead");
eq("report url is an inert code span", reportUrl("https://a.test/@x](y)`z"), "`https://a.test/@x](y)%60z`");

// #64: one entry walker; hidden and scratch folders are not entries.
const tmp = nodeFs.mkdtempSync(nodePath.join(nodeOs.tmpdir(), "entries-"));
for (const rel of ["2d/a.md", "2d/README.md", "2d/TEMPLATE.md", "2d/.hidden/b.md", "_scratch/c.md", "3d/sub/d.md", "3d/e.txt"]) {
  nodeFs.mkdirSync(nodePath.dirname(nodePath.join(tmp, rel)), { recursive: true });
  nodeFs.writeFileSync(nodePath.join(tmp, rel), "");
}
eq("entry walker skips index, template, hidden and scratch", listEntryFiles(tmp).map((f) => nodePath.relative(tmp, f).split(nodePath.sep).join("/")).join(","), "2d/a.md,3d/sub/d.md");
nodeFs.rmSync(tmp, { recursive: true, force: true });

/* client search, URL state and 404 guesses (search.mjs, #67) --------------- */
import {
  closestEntries,
  slugOf,
  missSlug,
  normalize,
  passesFilters,
  queryTests,
  readState,
  scoreFields,
  searchFields,
  similarity,
  stateQuery,
  MAX_QUERY,
} from "./search.mjs";

const kit = { id: "ui-kit", name: "UI Kit", publisher: "Kenney", tags: ["button", "first-person"], license: "CC0", category: "2d", camera_perspective: "isometric_3_4", formats: ["PNG"], subcategories: ["ui"], summary: "Panels for the earth biome." };
const kFields = searchFields(kit);
const kScore = (q) => scoreFields(kFields, queryTests(q));
eq("normalize folds hyphens and case", normalize("First-Person  UI_kit"), "first person ui kit");
eq("empty query matches everything", kScore(""), 1);
eq("word-start match", kScore("ui") > 0, true);
eq("no match inside a word (ui/build)", scoreFields(searchFields({ ...kit, name: "Build tools", tags: [], subcategories: [] }), queryTests("ui")), 0);
eq("no match inside a word (art/earth)", kScore("art"), 0);
eq("plural query finds singular tag", kScore("buttons") > 0, true);
eq("hyphenated tag found by spaced words", kScore("first person") > 0, true);
{
  const { joinedCompounds } = await import("./search.mjs");
  const pack = { ...kit, name: "Space Pack", tags: ["sci-fi", "low-poly"], subcategories: [], summary: "Ships with sound effects and a tile-set." };
  const ps = (q) => scoreFields(searchFields(pack), queryTests(q));
  eq("compounds: hyphenated words joined", joinedCompounds("Low-poly sci_fi pack"), "lowpoly scifi");
  eq("compounds: scifi finds the sci-fi tag", ps("scifi") > 0, true);
  eq("compounds: scifi and sci-fi both match", ps("scifi") > 0 && ps("sci-fi") > 0, true);
  eq("compounds: lowpoly finds the low-poly tag", ps("lowpoly") > 0, true);
  eq("compounds: joined forms do not match inside a word", ps("cifi"), 0);
  eq("synonyms: sfx finds sound effects", ps("sfx") > 0, true);
  eq("synonyms: tilemap finds a tile-set", ps("tilemap") > 0, true);
  eq("synonyms: bgm finds music", scoreFields(searchFields({ ...pack, summary: "Chiptune music." }), queryTests("bgm")) > 0, true);
  eq("synonyms: models finds a mesh", scoreFields(searchFields({ ...pack, summary: "One mesh." }), queryTests("models")) > 0, true);
  eq("synonyms: unrelated words stay unmatched", ps("music"), 0);
}
eq("3/4 view answers top down", kScore("top down") > 0, true);
eq("every word must match", kScore("ui zzz"), 0);
eq("name hit outranks summary hit", kScore("kit") > kScore("panels"), true);
eq("regex characters are literal", kScore("c++"), 0);

const URL_DEF = { category: "all", q: "", active: true, review: true, deprecated: false, commercialOnly: false, noAttr: false, perspective: "any", license: "any", format: "any", engine: "any", sort: "name" };
const URL_ALLOWED = { category: ["all", "2d", "3d"], sort: ["name", "license", "verified"], perspective: ["any", "top_down"], license: ["any", "cc0"], format: ["any", "image"] };
const urlSt = readState("?cat=2d&q=pixel&sort=bogus&view=top_down&deprecated=1&review=maybe&licence=cc0", URL_DEF, URL_ALLOWED);
eq("url: known category kept", urlSt.category, "2d");
eq("url: unknown sort falls back", urlSt.sort, "name");
eq("url: q kept verbatim", urlSt.q, "pixel");
eq("url: switch 1 is on", urlSt.deprecated, true);
eq("url: switch junk keeps default", urlSt.review, true);
eq("url: licence family", urlSt.license, "cc0");
eq("url: defaults not mutated", URL_DEF.category, "all");
eq("url: round trip", readState(`?${stateQuery(urlSt, URL_DEF)}`, URL_DEF, URL_ALLOWED).perspective, "top_down");
eq("url: defaults write nothing", stateQuery(URL_DEF, URL_DEF), "");
eq("url: switch off written as 0", stateQuery({ ...URL_DEF, active: false }, URL_DEF), "active=0");
eq("url: blank q not written", stateQuery({ ...URL_DEF, q: "   " }, URL_DEF), "");

const fmtGroups = { image: { formats: ["PNG", "SVG"] } };
eq("filter: needs-review hidden when review off", passesFilters({ status: "needs-review" }, { ...URL_DEF, review: false }), false);
eq("filter: deprecated hidden by default", passesFilters({ status: "deprecated" }, URL_DEF), false);
{
  const { ENGINES: EN, engineRank: er } = await import("./search.mjs");
  eq("engine: godot hides UE-only", passesFilters({ status: "active", engine_lock: "unreal" }, { ...URL_DEF, engine: "godot" }), false);
  eq("engine: unreal keeps UE-only", passesFilters({ status: "active", engine_lock: "unreal" }, { ...URL_DEF, engine: "unreal" }), true);
  eq("engine: agnostic entries stay", passesFilters({ status: "active" }, { ...URL_DEF, engine: "godot" }), true);
  eq("engine: godot-tagged ranks first", er({ tags: ["godot-4"] }, "godot") - er({ tags: ["pixel"] }, "godot"), -1);
  eq("engine: url round-trips", readState("?engine=unity", URL_DEF, { engine: ["any", ...Object.keys(EN)] }).engine, "unity");
  eq("engine: written to the url", stateQuery({ ...URL_DEF, engine: "godot" }, URL_DEF), "engine=godot");
  eq("engine: unknown value ignored", readState("?engine=cryengine", URL_DEF, { engine: ["any", ...Object.keys(EN)] }).engine, "any");
  const { nativeEngines: ne, worksInEngine: wie, placementKey: pk } = await import("./search.mjs");
  const on = (formats, engine) => passesFilters({ status: "active", formats }, { ...URL_DEF, engine });
  eq("engine: godot hides an Unreal project", on(["Unreal"], "godot"), false);
  eq("engine: godot hides an Unreal plugin with its C++", on(["unreal-plugin", "C++"], "godot"), false);
  eq("engine: unity hides a Godot addon", on(["godot-addon"], "unity"), false);
  eq("engine: unity hides a Godot project", on(["gdshader", "Godot"], "unity"), false);
  eq("engine: unreal hides the Godot editor", on(["desktop-app", "Godot"], "unreal"), false);
  eq("engine: godot hides a Unity-only entry", on(["Unity"], "godot"), false);
  eq("engine: an addon stays native despite asset formats", ne({ formats: ["godot-addon", "gdextension", "EXR", "PNG"] }).join(), "godot");
  eq("engine: a sound pack with a Godot demo is agnostic", on(["WAV", "Godot"], "unity"), true);
  eq("engine: a multi-engine export is agnostic", ne({ formats: ["Unity", "Godot", "JSON", "PNG"] }).length, 0);
  eq("engine: a pack for two engines stays under either", on(["Unity", "Unreal"], "unity"), true);
  eq("engine: godot keeps Godot addons", on(["godot-addon"], "godot"), true);
  eq("engine: no formats is agnostic", wie({}, "godot"), true);
  eq("engine: an unknown engine hides nothing", wie({ formats: ["Unreal"] }, "pico-8"), true);
  eq("engine: native format ranks first", er({ formats: ["unreal-plugin"] }, "unreal"), 0);
  eq("placement: key changes with the engine", pk({ sort: "name", engine: "godot" }, { ranked: false, group: true, list: [] }) === pk({ sort: "name", engine: "unity" }, { ranked: false, group: true, list: [] }), false);
  eq("placement: key ignores filters under a plain sort", pk({ sort: "name", engine: "any", q: "x" }, { ranked: false, group: false, list: [{ id: "a" }] }), pk({ sort: "name" }, { ranked: false, group: false, list: [] }));
  eq("placement: a ranked key follows the list", pk({ sort: "name" }, { ranked: true, group: false, list: [{ id: "a" }, { id: "b" }] }), "rank:false:a,b");
}
eq("filter: commercial-only keeps varies", passesFilters({ status: "active", commercial: "varies" }, { ...URL_DEF, commercialOnly: true }), true);
eq("filter: commercial-only drops unknown", passesFilters({ status: "active", commercial: "unknown" }, { ...URL_DEF, commercialOnly: true }), false);
eq("filter: no-attribution needs false, not unknown", passesFilters({ status: "active", attribution_required: "unknown" }, { ...URL_DEF, noAttr: true }), false);
eq("filter: format group", passesFilters({ status: "active", formats: ["SVG"] }, { ...URL_DEF, format: "image" }, fmtGroups), true);
eq("filter: format group miss", passesFilters({ status: "active", formats: ["WAV"] }, { ...URL_DEF, format: "image" }, fmtGroups), false);

eq("404 slug from a nested miss", missSlug("/Free-Game-Dev-Assets/entry/Kenny_UI/index.html", "/Free-Game-Dev-Assets/"), "kenny-ui");
eq("404 slug survives a bad escape", missSlug("/s/entry/%E0%A4%A/", "/s/"), "e0-a4-a");
eq("404 slug drops the category/ prefix", missSlug("/s/category/audoi/", "/s/"), "audoi");
eq("404 slug drops the guide/ prefix", missSlug("/s/guide/licences/", "/s/"), "licences");
{
  const { missSection } = await import("./search.mjs");
  eq("404 section: category", missSection("/s/category/audoi/", "/s/"), "category");
  eq("404 section: guide", missSection("/s/guide/licences/", "/s/"), "guide");
  eq("404 section: entry", missSection("/s/entry/kenny-ui/", "/s/"), "entry");
  eq("404 section: none", missSection("/s/some/other/", "/s/"), "");
  const cats = [{ id: "audio", name: "Audio" }, { id: "animation", name: "Animation" }, { id: "3d", name: "3D" }];
  eq("404: a mistyped category finds the category", closestEntries("audoi", cats)[0]?.id, "audio");
  const guides = [{ id: "licenses", name: "Licenses" }, { id: "fonts", name: "Fonts" }];
  eq("404: a British spelling finds the guide", closestEntries("licences", guides)[0]?.id, "licenses");
}
eq("identical strings are 1", similarity("kenney", "kenney"), 1);
eq("disjoint strings are 0", similarity("abc", "xyz"), 0);
const guessPool = [
  { id: "kenney-ui-pack", name: "Kenney UI Pack", status: "active" },
  { id: "kenney-ui-old", name: "Kenney UI Old", status: "deprecated" },
  { id: "freesound", name: "Freesound", status: "active" },
];
eq("404 guesses closest first", closestEntries("kenny-ui-pack", guessPool)[0].id, "kenney-ui-pack");
eq("404 guesses drop weak matches", closestEntries("kenny-ui-pack", guessPool).some((e) => e.id === "freesound"), false);
eq("404 guesses respect limit", closestEntries("kenney-ui", guessPool, { limit: 1 }).length, 1);
// #109: the empty search state reuses the same guesses for a misspelt publisher.
eq("did you mean: misspelt publisher", closestEntries(slugOf("quaternious"), [...guessPool, { id: "quaternius", name: "Quaternius" }]).map((e) => e.name).includes("Quaternius"), true);
eq("did you mean: misspelt kenney", closestEntries(slugOf("kenny"), guessPool).some((e) => /kenney/i.test(e.name)), true);

/* check-links: flags and API failures (#82) -------------------------------- */
eq("stale-days default", staleDaysFrom(["node", "x"]).days, 365);
eq("stale-days value", staleDaysFrom(["node", "x", "--stale-days", "30"]).days, 30);
has("stale-days as the last argument is an error", staleDaysFrom(["node", "x", "--stale-days"]).error, "got nothing");
has("stale-days followed by another flag is an error", staleDaysFrom(["node", "x", "--stale-days", "--report"]).error, "--stale-days needs a whole number");
has("stale-days non-number is an error", staleDaysFrom(["node", "x", "--stale-days", "soon"]).error, '"soon"');
has("stale-days error carries usage", staleDaysFrom(["node", "x", "--stale-days", "1.5"]).error, "usage:");
{
  const gh = (id, maintenance = null) => ({ id, url: `https://github.com/o/${id}`, maintenance });
  const ents = [gh("a"), { id: "n", url: "https://kenney.nl/" }, gh("b", "archived"), gh("c"), gh("d")];
  const expected = (data) => (data.archived ? "archived" : null);
  const calls = [];
  const fetchRepo = async (repo) => {
    calls.push(repo);
    if (repo === "o/a") return { ok: false, status: 502, data: null };
    if (repo === "o/b") return { ok: true, status: 200, data: { archived: true } };
    if (repo === "o/c") return { ok: false, status: 403, data: null };
    throw Object.assign(new Error("boom"), { name: "TimeoutError" });
  };
  const r = await checkMaintenanceRepos(ents, fetchRepo, expected);
  eq("api: only github repos are fetched, until the rate limit", calls.join(","), "o/a,o/b,o/c");
  eq("api: a matching repo is not a mismatch", r.mismatches.length, 0);
  eq("api: failures are skipped, not problems", r.skipped.map((s) => s.id).join(","), "a,c,d");
  has("api: a 5xx names the status", r.skipped[0].detail, "HTTP 502");
  has("api: the unchecked rest says why", r.skipped[2].detail, "not checked: GitHub API rate limit (HTTP 403) hit on o/c");
  const r2 = await checkMaintenanceRepos([gh("b", "archived")], async () => ({ ok: true, status: 200, data: { archived: false, pushed_at: "2020-01-02T00:00:00Z" } }), expected);
  has("api: a real mismatch is reported", r2.mismatches[0].detail, "o/b is last push 2020-01-02; maintenance is archived, expected unset");
  const r3 = await checkMaintenanceRepos([gh("d")], fetchRepo, expected);
  has("api: a thrown timeout is skipped with its name", r3.skipped[0].detail, "GitHub API TimeoutError for o/d");
}

/* monthly re-verify batch (#93) -------------------------------------------- */
import { batchIssueMarkdown, pickBatch } from "./reverify.mjs";
{
  const rvNow = Date.parse("2026-11-01T08:00:00Z");
  const rv = (id, verified, status = "active") => ({ id, url: `https://${id}.test/`, license: "CC0", verified, status, rel: `catalog/2d/${id}.md` });
  const pool = [
    rv("fresh", "2026-10-20"),
    rv("july", "2026-07-19"),
    rv("june", "2026-06-01", "needs-review"),
    rv("gone", "2025-01-01", "deprecated"),
    rv("undated", null),
    rv("edge", "2026-06-04"), // exactly 150 days: not yet due
    rv("due", "2026-06-03"), // 151 days: due
  ];
  const picked = pickBatch(pool, { now: rvNow, size: 10 });
  eq("batch: oldest first, undated first of all", picked.map((e) => e.id).join(","), "undated,june,due");
  eq("batch: 105 days is not yet due either", picked.some((e) => e.id === "july"), false);
  eq("batch: a fresh entry is left alone", picked.some((e) => e.id === "fresh"), false);
  eq("batch: deprecated entries are never picked", picked.some((e) => e.id === "gone"), false);
  eq("batch: 150 days is not yet due", picked.some((e) => e.id === "edge"), false);
  eq("batch: by default, everything that would turn stale before the next batch", pickBatch(pool, { now: rvNow }).map((e) => e.id).join(","), "undated,june,due,edge");
  eq("batch: nothing due means an empty batch", pickBatch(pool, { now: Date.parse("2026-08-01T00:00:00Z"), size: 10 }).map((e) => e.id).join(","), "undated");
  eq("batch: explicit size caps the list", pickBatch(pool, { now: rvNow, size: 2 }).map((e) => e.id).join(","), "undated,june");
  // 100 entries read the same day, 109 days ago: they must all be re-read
  // within two more batches, so the load is spread over the three.
  const bulge = Array.from({ length: 100 }, (_, i) => rv(`e${String(i).padStart(3, "0")}`, "2026-07-15"));
  eq("batch: a bulge is spread over the batches before it expires", pickBatch(bulge, { now: rvNow }).length, 34);
  eq("batch: a bulge is picked oldest first even before it is due", pickBatch(bulge, { now: rvNow })[0].age, 109);

  // A catalog-shaped fixture with a fixed start date (#219: the test used to
  // read the live catalog and today's clock, so it failed by itself once the
  // oldest real entry aged past the window). It is run through 24 monthly
  // batches in which every picked entry is re-read on the day: nothing may
  // pass the fresh window, and no batch may need more than a third of it.
  const { VERIFIED_FRESH_DAYS } = await import("./shared.mjs");
  const simStart = Date.parse("2026-11-01T08:00:00Z");
  const daysBefore = (n) => new Date(simStart - n * 86400000).toISOString().slice(0, 10);
  let sim = [
    // a bulge read on two days, the way the first catalog pass was
    ...Array.from({ length: 60 }, (_, i) => ({ id: `bulge-a${i}`, verified: daysBefore(140), status: "active" })),
    ...Array.from({ length: 80 }, (_, i) => ({ id: `bulge-b${i}`, verified: daysBefore(110), status: i % 5 ? "active" : "needs-review" })),
    // a steady trickle over the last 150 days
    ...Array.from({ length: 280 }, (_, i) => ({ id: `steady${i}`, verified: daysBefore(i % 150), status: "active" })),
    ...Array.from({ length: 10 }, (_, i) => ({ id: `gone${i}`, verified: daysBefore(400), status: "deprecated" })),
    { id: "undated", verified: null, status: "needs-review" },
  ];
  let t = simStart;
  let worstAge = 0;
  let biggest = 0;
  for (let m = 0; m < 24; m += 1) {
    for (const e of sim) {
      if (e.status === "deprecated" || !e.verified) continue;
      worstAge = Math.max(worstAge, Math.floor((t - Date.parse(`${e.verified}T00:00:00Z`)) / 86400000));
    }
    const picked = new Set(pickBatch(sim, { now: t }).map((e) => e.id));
    biggest = Math.max(biggest, picked.size);
    const day = new Date(t).toISOString().slice(0, 10);
    sim = sim.map((e) => (picked.has(e.id) ? { ...e, verified: day } : e));
    const d = new Date(t);
    t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 8);
  }
  eq("batch simulation: the fixture is catalog-sized", sim.length > 400, true);
  eq("batch simulation: no live entry passes the fresh window in 24 months", worstAge <= VERIFIED_FRESH_DAYS, true);
  eq("batch simulation: a batch stays under a third of the catalog", biggest <= Math.ceil(sim.length / 3), true);
  const md = batchIssueMarkdown({ batch: pickBatch(pool, { now: rvNow, size: 2 }), repo: "https://github.com/o/r", date: "2026-11-01", total: 6 });
  has("batch issue links the entry file", md, "[`june`](https://github.com/o/r/blob/main/catalog/2d/june.md)");
  has("batch issue says what was recorded", md, "recorded as `CC0`, needs-review, verified 2026-06-01 (153 days ago)");
  has("batch issue handles no date", md, "[`undated`](https://github.com/o/r/blob/main/catalog/2d/undated.md): `https://undated.test/`, recorded as `CC0`, active, no verified date");
  has("batch issue explains the steps", md, "**How to do one**");
  has("batch issue links CONTRIBUTING absolutely (relative links 404 from an issue)", md, "[CONTRIBUTING.md](https://github.com/o/r/blob/main/CONTRIBUTING.md)");
  eq("batch issue has one checkbox per entry", (md.match(/^- \[ \] /gm) || []).length, 2);
}

/* sync-counts and new-entry text rewrites (scaffold.mjs, #67) -------------- */
import { newEntryProblem, newEntryText, syncCatalogReadme, syncConfig, syncReadme } from "./scaffold.mjs";

const rmText = "| **2D** | 5 | Sprites | [`catalog/2d/`](catalog/2d/) |\n| **3D** | 7 | Models | [`catalog/3d/`](catalog/3d/) |\n[Browse 12 sources](x) badge/sources-12-blue searches all 12 entries";
const rmSynced = syncReadme(rmText, { "2d": 6, "3d": 7 }, 13);
has("readme 2d row", rmSynced, "| **2D** | 6 |");
has("readme 3d row untouched", rmSynced, "| **3D** | 7 |");
has("readme browse line", rmSynced, "Browse 13 sources");
has("readme badge", rmSynced, "badge/sources-13-blue");
has("readme search line", rmSynced, "searches all 13 entries");
eq("catalog rmText row", syncCatalogReadme("| 2D | 5 | [`2d/`](2d/) | x |", { "2d": 9 }), "| 2D | 9 | [`2d/`](2d/) | x |");
eq("category row does not match a prefix category", syncCatalogReadme("| 3D | 5 | [`3d/`](3d/) |", { d: 1 }), "| 3D | 5 | [`3d/`](3d/) |");
eq("config count", syncConfig('{ "expectedEntryCount": 391 }', 392), '{ "expectedEntryCount": 392 }');

const neCats = ["2d", "3d"];
eq("new-entry: ok", newEntryProblem({ category: "2d", id: "my-pack", categories: neCats }), null);
has("new-entry: usage", newEntryProblem({ category: "2d", categories: neCats }), "usage");
has("new-entry: bad category", newEntryProblem({ category: "4d", id: "x", categories: neCats }), "not a category");
has("new-entry: bad id", newEntryProblem({ category: "2d", id: "My_Pack", categories: neCats }), "kebab-case");
has("new-entry: taken id", newEntryProblem({ category: "2d", id: "x", categories: neCats, taken: "3d" }), "catalog/3d/x.md already exists");
const neText = newEntryText("id: example\ncategory: 3d\nverified: 2026-07-19   # note\nstatus: active\n", { id: "my-pack", category: "2d", today: "2026-10-04" });
eq("new-entry text", neText, "id: my-pack\ncategory: 2d\nverified: 2026-10-04\nstatus: needs-review\n");
eq("template copy starts needs-review", newEntryText(nodeFs.readFileSync(new URL("../../catalog/TEMPLATE.md", import.meta.url), "utf8"), { id: "a", category: "2d", today: "2026-10-04" }).split(/\r?\n/).includes("status: needs-review"), true);
eq("new-entry sets added to today", newEntryText("added: 2026-07-19\nverified: 2026-07-19\n", { id: "a", category: "2d", today: "2026-10-04" }), "added: 2026-10-04\nverified: 2026-10-04\n");
{
  // #79: the template round-trips through the scaffold to typed fields.
  const fromTemplate = parseFrontmatter(newEntryText(nodeFs.readFileSync(new URL("../../catalog/TEMPLATE.md", import.meta.url), "utf8"), { id: "a", category: "2d", today: "2026-10-04" }));
  eq("template tags parse as a list", Array.isArray(fromTemplate.meta.tags), true);
  eq("template commercial parses as a boolean", fromTemplate.meta.commercial, true);
  eq("template added parses as today", fromTemplate.meta.added, "2026-10-04");
  eq("template has no frontmatter errors", fromTemplate.errors.join(), "");
}

// Site refresh: thumbnail rules.
import { afterFailure, filmstripPick, imageUrlFromHtml, isPrivateHost, needsFetch, previewCredit, previewEligibility, publisherKey, safeImageUrl, sharedImageIds, sniffImage, webpSize } from "./thumbs.mjs";
eq("thumbs: CC0 active itch page is eligible", previewEligibility({ license: "CC0", status: "active", url: "https://kaylousberg.itch.io/block-bits" }).ok, true);
eq("thumbs: custom licence refused", previewEligibility({ license: "custom", status: "active", url: "https://x.itch.io/a" }).reason, "licence custom is not in the preview allowlist");
eq("thumbs: needs-review refused before licence", previewEligibility({ license: "custom", status: "needs-review", url: "https://x.itch.io/a" }).reason, "status is needs-review");
eq("thumbs: github host skipped", previewEligibility({ license: "MIT", status: "active", url: "https://github.com/a/b" }).reason, "host github.com is skipped");
eq("thumbs: preview url overrides host only", previewEligibility({ license: "MIT", status: "active", url: "https://github.com/a/b", preview: "https://a.b/c.png" }).ok, true);
eq("thumbs: preview url cannot override licence", previewEligibility({ license: "custom", status: "active", url: "https://a.b/", preview: "https://a.b/c.png" }).ok, false);
eq("thumbs: preview none", previewEligibility({ license: "CC0", status: "active", url: "https://a.b/", preview: "none" }).reason, "preview: none");
eq("thumbs: og:image property-first", imageUrlFromHtml('<meta property="og:image" content="https://i.x/a.png?w=1&amp;h=2">', "https://x/"), "https://i.x/a.png?w=1&h=2");
eq("thumbs: og:image content-first", imageUrlFromHtml('<meta content="/img/a.jpg" property="og:image">', "https://x.y/p/"), "https://x.y/img/a.jpg");
eq("thumbs: twitter fallback", imageUrlFromHtml('<meta name="twitter:image" content="https://i/t.png">', "https://x/"), "https://i/t.png");
eq("thumbs: no image", imageUrlFromHtml("<html></html>", "https://x/"), null);
eq("thumbs: shared hash dropped at three", [...sharedImageIds({ a: { hash: "h1" }, b: { hash: "h1" }, c: { hash: "h1" }, d: { hash: "h2" }, e: { hash: "h2" } })].sort().join(), "a,b,c");
eq("thumbs: pinned never dropped", [...sharedImageIds({ a: { hash: "h1", pinned: true }, b: { hash: "h1" }, c: { hash: "h1" }, d: { hash: "h1" } })].sort().join(), "b,c,d");
{
  // #232: a run that re-drops the same shared images changes nothing.
  const { manifestChanges } = await import("./thumbs.mjs");
  const rec = { hash: "h1", fetched: "2026-10-01" };
  eq("thumbs: no change between equal manifests", manifestChanges({ thumbs: { a: rec }, shared: { s: rec } }, { thumbs: { a: { ...rec } }, shared: { s: { ...rec } } }), 0);
  eq("thumbs: a new shared id is a change", manifestChanges({ thumbs: {} }, { thumbs: {}, shared: { s: rec } }), 1);
  eq("thumbs: a removed and a changed record are two", manifestChanges({ thumbs: { a: rec, b: rec } }, { thumbs: { b: { ...rec, fetched: "2026-11-01" } } }), 2);
  eq("thumbs: a missing shared map is empty", manifestChanges({ thumbs: { a: rec } }, { thumbs: { a: rec }, shared: {} }), 0);
}
eq("thumbs: needsFetch no record", needsFetch(undefined, { license: "CC0", today: "2026-10-23" }), true);
eq("thumbs: needsFetch fresh same licence", needsFetch({ fetched: "2026-09-01", license: "CC0" }, { license: "CC0", today: "2026-10-23" }), false);
eq("thumbs: needsFetch licence changed", needsFetch({ fetched: "2026-09-01", license: "CC0" }, { license: "CC-BY-4.0", today: "2026-10-23" }), true);
eq("thumbs: needsFetch stale", needsFetch({ fetched: "2026-01-01", license: "CC0" }, { license: "CC0", today: "2026-10-23" }), true);
eq("thumbs: needsFetch force", needsFetch({ fetched: "2026-10-20", license: "CC0" }, { license: "CC0", today: "2026-10-23", force: true }), true);
const recA = { source: "https://a.example/", image: "https://a.example/og.png", fetched: "2026-10-20", license: "CC0" };
eq("thumbs: needsFetch url moved", needsFetch(recA, { license: "CC0", today: "2026-10-23", url: "https://b.example/", preview: "" }), true);
eq("thumbs: needsFetch unchanged entry", needsFetch(recA, { license: "CC0", today: "2026-10-23", url: "https://a.example/", preview: "" }), false);
eq("thumbs: needsFetch pin added", needsFetch(recA, { license: "CC0", today: "2026-10-23", url: "https://a.example/", preview: "https://a.example/shot.png" }), true);
eq("thumbs: needsFetch pin changed", needsFetch({ ...recA, pinned: true, image: "https://a.example/old.png" }, { license: "CC0", today: "2026-10-23", url: "https://a.example/", preview: "https://a.example/new.png" }), true);
eq("thumbs: needsFetch pin removed", needsFetch({ ...recA, pinned: true }, { license: "CC0", today: "2026-10-23", url: "https://a.example/", preview: "" }), true);
eq("thumbs: afterFailure counts", afterFailure(recA, { today: "2026-10-23" }).failures, 1);
eq("thumbs: afterFailure drops at the limit", afterFailure({ ...recA, failures: 2 }, { today: "2026-10-23" }), null);
eq("thumbs: afterFailure drops an ancient image", afterFailure({ ...recA, fetched: "2025-01-01" }, { today: "2026-10-23" }), null);
eq("thumbs: afterFailure keeps a matching record", afterFailure(recA, { today: "2026-10-23", url: "https://a.example/", preview: "" }).failures, 1);
eq("thumbs: afterFailure drops a record for a moved url", afterFailure(recA, { today: "2026-10-23", url: "https://b.example/", preview: "" }), null);
eq("thumbs: afterFailure drops a record when a pin is added", afterFailure(recA, { today: "2026-10-23", url: "https://a.example/", preview: "https://a.example/shot.png" }), null);
eq("thumbs: afterFailure drops a record for a changed pin", afterFailure({ ...recA, pinned: true, image: "https://a.example/old.png" }, { today: "2026-10-23", url: "https://a.example/", preview: "https://a.example/new.png" }), null);
eq("thumbs: afterFailure without a converter keeps the record as is", afterFailure(recA, { today: "2026-10-23", url: "https://a.example/", preview: "", countFailure: false }), recA);
eq("thumbs: afterFailure without a converter still drops a moved url", afterFailure(recA, { today: "2026-10-23", url: "https://b.example/", preview: "", countFailure: false }), null);
eq("thumbs: private host localhost", isPrivateHost("localhost"), true);
eq("thumbs: private host ip literal", isPrivateHost("127.0.0.1"), true);
eq("thumbs: public host", isPrivateHost("img.itch.zone"), false);
eq("thumbs: http image upgraded", safeImageUrl("http://a.example/x.png"), "https://a.example/x.png");
eq("thumbs: loopback image refused", safeImageUrl("https://127.0.0.1/x.png"), null);
eq("thumbs: file scheme refused", safeImageUrl("file:///etc/passwd"), null);
eq("thumbs: og:image on loopback refused", imageUrlFromHtml('<meta property="og:image" content="http://localhost/a.png">', "https://a.example/"), null);
eq("thumbs: sniff png", sniffImage(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])), "png");
eq("thumbs: sniff html refused", sniffImage(new TextEncoder().encode("<!doctype html><html>")), null);
{
  const hex = (s) => Buffer.from(s.replaceAll(" ", ""), "hex");
  const vp8x = hex("52494646 24000000 57454250 56503858 0a000000 10000000 7f0200 8f0100");
  eq("thumbs: webp VP8X size", JSON.stringify(webpSize(vp8x)), '{"width":640,"height":400}');
  const vp8l = hex("52494646 24000000 57454250 5650384c 10000000 2f 7fc26300");
  eq("thumbs: webp VP8L size", JSON.stringify(webpSize(vp8l)), '{"width":640,"height":400}');
  const vp8 = hex("52494646 24000000 57454250 56503820 10000000 000000 9d012a 8002 9001");
  eq("thumbs: webp VP8 size", JSON.stringify(webpSize(vp8)), '{"width":640,"height":400}');
  eq("thumbs: not webp", webpSize(Buffer.from("89504e47", "hex")), null);
}
eq("thumbs: publisherKey falls back to host", publisherKey({ url: "https://www.kenney.nl/assets/x" }), "kenney.nl");
eq("thumbs: publisherKey prefers publisher", publisherKey({ publisher: "Kenney", url: "https://x/" }), "Kenney");
eq("thumbs: ODbL (attribution, not in the allowlist) gets no preview", previewEligibility({ status: "active", license: "ODbL", category: "data", url: "https://a.example/", publisher: "OSM" }).ok, false);
eq("thumbs: CC-BY-SA is not allowlisted (not in the vocabulary)", previewEligibility({ status: "active", license: "CC-BY-SA-4.0", category: "2d", url: "https://a.example/", publisher: "X" }).ok, false);
eq("thumbs: credit with publisher", previewCredit({ publisher: "Kenney", license: "CC0" }), "Preview image from Kenney, shown under CC0");
eq("thumbs: credit without publisher", previewCredit({ license: "CC-BY-4.0" }), "Preview image from the source page, shown under CC-BY-4.0");
eq("thumbs: CC-BY credit prefers the recorded credit line", previewCredit({ license: "CC-BY-4.0", publisher: "Dareful", attribution_string: "Video by Dareful.com" }), "Video by Dareful.com. Preview image shown under CC-BY-4.0");
eq("thumbs: CC-BY credit falls back to publisher", previewCredit({ license: "CC-BY-3.0", publisher: "Kevin MacLeod" }), "Kevin MacLeod. Preview image shown under CC-BY-3.0");
eq("thumbs: tools need a pinned preview", previewEligibility({ license: "GPL-3.0-or-later", status: "active", category: "tools", url: "https://www.gimp.org/" }).ok, false);
eq("thumbs: fonts need a pinned preview", previewEligibility({ license: "SIL OFL", status: "active", category: "fonts", url: "https://rsms.me/inter/" }).reason.startsWith("category fonts:"), true);
eq("thumbs: a pinned preview admits a tool", previewEligibility({ license: "MIT", status: "active", category: "tools", url: "https://ldtk.io/", preview: "https://ldtk.io/shot.png" }).ok, true);
eq("thumbs: 3d page image is the asset", previewEligibility({ license: "CC0", status: "active", category: "3d", url: "https://x.itch.io/a" }).ok, true);
eq("thumbs: CC-BY without a creator refused", previewEligibility({ license: "CC-BY-4.0", status: "active", category: "audio", url: "https://x.itch.io/a" }).reason, "licence CC-BY-4.0 needs a creator to credit; set attribution_string or publisher");
eq("thumbs: CC-BY with attribution_string admitted", previewEligibility({ license: "CC-BY-4.0", status: "active", category: "audio", url: "https://x.itch.io/a", attribution_string: "Sound by X" }).ok, true);
{
  const t = { path: "thumbs/x.webp", width: 640, height: 400 };
  const pool = [
    { id: "a", name: "A", status: "active", category: "3d", verified: "2026-10-01", publisher: "P1", url: "https://p1/", thumb: t },
    { id: "b", name: "B", status: "active", category: "3d", verified: "2026-10-02", publisher: "P1", url: "https://p1/", thumb: t },
    { id: "c", name: "C", status: "active", category: "tools", verified: "2026-10-03", url: "https://p2/", thumb: t },
    { id: "d", name: "D", status: "needs-review", category: "2d", verified: "2026-10-04", url: "https://p3/", thumb: t },
    { id: "e", name: "E", status: "active", category: "2d", verified: "2026-10-05", url: "https://p4/", thumb: null },
    { id: "f", name: "F", status: "active", category: "2d", verified: "2026-09-01", url: "https://p5/", thumb: t },
  ];
  eq("thumbs: filmstrip picks newest, one per publisher, card categories, active, with thumb", filmstripPick(pool, { count: 9, cardCategories: ["3d", "2d"] }).map((e) => e.id).join(), "b,f");
  eq("thumbs: filmstrip count cap", filmstripPick(pool, { count: 1, cardCategories: ["3d", "2d"] }).map((e) => e.id).join(), "b");
}

// Site refresh: self-hosted fonts and one shared head.
has("head: preloads body font", baseHeadHtml({ site: { siteUrl: "https://s/", title: "T", tagline: "x" }, title: "T", description: "d", url: "https://s/", root: "../../" }), '<link rel="preload" href="../../fonts/public-sans.woff2" as="font" type="font/woff2" crossorigin');
has("head: preloads mono font", baseHeadHtml({ site: { siteUrl: "https://s/", title: "T", tagline: "x" }, title: "T", description: "d", url: "https://s/", root: "../../" }), '<link rel="preload" href="../../fonts/ibm-plex-mono-400.woff2" as="font" type="font/woff2" crossorigin');
has("head: stylesheet from root", baseHeadHtml({ site: { siteUrl: "https://s/", title: "T", tagline: "x" }, title: "T", description: "d", url: "https://s/", root: "./" }), '<link rel="stylesheet" href="./styles.css"');
has("head: icon from root", baseHeadHtml({ site: { siteUrl: "https://s/", title: "T", tagline: "x" }, title: "T", description: "d", url: "https://s/", root: "../" }), '<link rel="icon" href="../favicon.svg" type="image/svg+xml"');
has("page check: google fonts refused", checkPage('<html><head><title>x</title><link rel="canonical" href="https://s/"><link href="https://fonts.googleapis.com/css2"></head><body><h1>x</h1></body></html>', { file: "p.html", kindOf: () => "file" }).join(), "p.html: references Google Fonts");

// Site refresh: one entry template for the build and app.js.
import { CARD_LIMIT, LIST_LIMIT, entryCardHtml, groupHeadingHtml, groupMoreHtml, groupedEntriesHtml, thumbHtml, tileHtml } from "./cards.mjs";
const cardBase = { id: "x", name: "X Pack", url: "https://x.itch.io/p", category: "3d", license: "CC0", commercial: true, status: "active", formats: ["GLB"], verified: "2026-10-01", path: "catalog/3d/x.md", summary: "S." };
eq("cards: limits", `${CARD_LIMIT}/${LIST_LIMIT}`, "6/8");
has("cards: img with dimensions and lazy", thumbHtml({ ...cardBase, thumb: { path: "thumbs/x.webp", width: 640, height: 400 } }, "../../"), '<img class="entry-thumb-img" src="../../thumbs/x.webp" width="640" height="400" alt="" loading="lazy" decoding="async">');
has("cards: tile when no thumb", thumbHtml(cardBase, ""), 'class="entry-tile" data-cat="3d"');
has("cards: tile carries name", tileHtml({ ...cardBase, name: "A <b>" }), "A &lt;b&gt;");
has("cards: tile note names licence", tileHtml(cardBase, "3D"), '<span class="entry-tile-note">3D · CC0</span>');
has("cards: card view attribute", entryCardHtml(cardBase, { root: "", repo: "https://r", now: Date.parse("2026-10-23"), view: "cards" }), '<article class="entry-card" data-view="cards"');
has("cards: root-relative entry link", entryCardHtml(cardBase, { root: "../../", repo: "https://r", now: 0, view: "list" }), 'href="../../entry/x/"');
has("cards: lead and trail slots", entryCardHtml(cardBase, { root: "", repo: "https://r", now: 0, view: "list", lead: '<p class="pick-need">Need</p>', trail: "<p>Why</p>" }), '<p class="pick-need">Need</p>');
has("cards: heading count readable", groupHeadingHtml({ cat: "3d", label: "3D", count: 77, view: "cards", root: "" }), '<span class="group-count"><span class="sr-only">, </span><span class="group-n">77</span><span class="sr-only"> entries</span></span>');
has("cards: heading carries view", groupHeadingHtml({ cat: "3d", label: "3D", count: 77, view: "list", root: "" }), '<h3 class="group-heading" id="group-3d" data-cat="3d" data-view="list">');
has("cards: show-all link", groupMoreHtml({ cat: "3d", label: "3D", count: 77, root: "" }), '<a class="group-more" data-cat="3d" href="category/3d/">Show all 77 in 3D</a>');
{
  const many = Array.from({ length: 9 }, (_, i) => ({ ...cardBase, id: `e${i}`, name: `E${i}` }));
  const html = groupedEntriesHtml(many, { "3d": { label: "3D", view: "cards" } }, { root: "", repo: "https://r", now: 0 });
  eq("cards: limit six cards", (html.match(/<article /g) || []).length, 6);
  has("cards: more link after limit", html, "Show all 9 in 3D");
  eq("cards: no limit when asked", (groupedEntriesHtml(many, { "3d": { label: "3D", view: "cards" } }, { root: "", repo: "https://r", now: 0, limit: false }).match(/<article /g) || []).length, 9);
  eq("cards: list limit eight", (groupedEntriesHtml(many, { "3d": { label: "3D", view: "list" } }, { root: "", repo: "https://r", now: 0 }).match(/<article /g) || []).length, 8);
  eq("cards: no more link under the limit", groupedEntriesHtml(many.slice(0, 3), { "3d": { label: "3D", view: "cards" } }, { root: "", repo: "https://r", now: 0 }).includes("group-more"), false);
  eq("cards: empty category skipped", groupedEntriesHtml(many, { "3d": { label: "3D", view: "cards" }, audio: { label: "Audio", view: "list" } }, { root: "", repo: "https://r", now: 0 }).includes("group-audio"), false);
}

// Site refresh: static category pages.
import { categoryPageHtml } from "./category-page.mjs";
{
  const html = categoryPageHtml({ cat: "3d", meta: { label: "3D", blurb: "Models, scans, PBR textures", view: "cards" }, entries: [cardBase], site: { title: "Free Game Dev Assets", tagline: "t", siteUrl: "https://s/x/", repo: "https://r" }, stamp: "2026-10-23", total: 1, hasCard: false, now: 0 });
  has("category page: title", html, "<title>3D assets | Free Game Dev Assets</title>");
  has("category page: root-relative entry link", html, 'href="../../entry/x/"');
  has("category page: canonical", html, '<link rel="canonical" href="https://s/x/category/3d/" />');
  has("category page: one h1", html, "<h1>3D</h1>");
  has("category page: count and blurb", html, "1 source · Models, scans, PBR textures");
  has("category page: search link back", html, 'href="../../?cat=3d#catalog"');
  eq("category page: no more link", html.includes("group-more"), false);
  has("category page: footer credit line", html, "Preview images belong to their publishers and are shown under each entry's licence.");
  has("category page: loads the view toggle module", html, '<script type="module" src="../../category.js"></script>');
  eq("category page: page checks pass", checkPage(html, { file: "category/3d/index.html", kindOf: () => "file" }).join(), "");
}
has("sitemap: category pages", sitemapXml({ site: { siteUrl: "https://s/" }, entries: [], stacks: [], stamp: "2026-10-23", categories: [{ id: "3d", lastmod: "2026-10-23" }] }), "<loc>https://s/category/3d/</loc>");

// Site refresh: hero filmstrip.
import { filmstripHtml } from "./cards.mjs";
has("filmstrip: links and alt", filmstripHtml([{ id: "x", name: "X Pack", thumb: { path: "thumbs/x.webp", width: 640, height: 400 } }], { root: "./" }), '<a href="./entry/x/"><img src="./thumbs/x.webp" width="640" height="400" alt="X Pack" loading="eager"');
eq("filmstrip: empty when nothing to show", filmstripHtml([], { root: "" }), "");
{
  const nine = Array.from({ length: 9 }, (_, i) => ({ id: `e${i}`, name: `E${i}`, thumb: { path: `thumbs/e${i}.webp`, width: 640, height: 400 } }));
  const strip = filmstripHtml(nine, { root: "" });
  eq("filmstrip: first three eager, rest lazy", `${(strip.match(/loading="eager"/g) || []).length}/${(strip.match(/loading="lazy"/g) || []).length}`, "3/6");
  has("filmstrip: labelled list", strip, '<ul class="filmstrip" aria-label="A few of the assets inside">');
}

// Site refresh: entry page strip and actions; stack picks as cards.
{
  const siteR = { title: "T", tagline: "t", siteUrl: "https://s/", repo: "https://r" };
  const common = { leadHtml: "<p>l</p>", restHtml: "<p>r</p>", deprecatedReasonHtml: null, prev: null, next: null, site: siteR, categoryLabel: "3D", stamp: "2026-10-23", total: 1, hasCard: false, now: 0 };
  const html = entryPageHtml({ ...common, entry: { ...cardBase, thumb: { path: "thumbs/x.webp", width: 640, height: 400 }, publisher: "Kenney" } });
  has("entry page: strip image", html, '<img class="entry-thumb-img" src="../../thumbs/x.webp"');
  has("entry page: strip capped at twice its width", html, '<figure class="entry-strip" style="--thumb-max:');
  has("entry page: strip image loads first", html, 'loading="eager" fetchpriority="high"');
  has("entry page: credit line", html, '<figcaption class="entry-credit">Preview image from Kenney, shown under CC0. <a href="../../guide/for-publishers/#preview-images">About previews</a></figcaption>');
  has("entry page: one primary action", html, '<p class="page-actions"><a class="btn" href="https://x.itch.io/p"');
  has("entry page: secondary links row", html, '<p class="page-links">');
  eq("entry page: ghost buttons gone from actions", (html.match(/class="btn-ghost"/g) || []).length, 0);
  has("entry page: shortlist toggle kept", html, 'class="link-button shortlist-toggle" data-shortlist="x"');
  has("entry page: footer credit line", html, "Preview images belong to their publishers and are shown under each entry's licence.");
  eq("entry page: no strip without thumb", entryPageHtml({ ...common, entry: cardBase }).includes("entry-strip"), false);
  eq("entry page: page checks pass with strip", checkPage(html, { file: "entry/x/index.html", kindOf: () => "file" }).join(), "");
}
{
  const html = sp();
  has("stack page: pick renders as card", html, 'class="entry-card" data-view="cards"');
  has("stack page: pick need leads the card", html, '<p class="pick-need">Tiles</p>');
  has("stack page: pick reason trails the card", html, '<p class="pick-why">Why <em>a</em>.</p>');
  has("stack page: pick list is the card grid", html, '<ul class="pick-list entry-list">');
  has("stack page: footer credit line", html, "Preview images belong to their publishers and are shown under each entry's licence.");
}

// Final review: heading levels never skip on category and stack pages.
has("cards: heading level option", groupHeadingHtml({ cat: "3d", label: "3D", count: 1, view: "cards", level: 2 }), '<h2 class="group-heading" id="group-3d"');
has("cards: title level option", entryCardHtml(cardBase, { root: "", repo: "https://r", now: 0, view: "cards", titleLevel: 3 }), '<h3><a class="entry-link" href="entry/x/"');
{
  const html = categoryPageHtml({ cat: "3d", meta: { label: "3D", blurb: "b", view: "cards" }, entries: [cardBase], site: { title: "T", tagline: "t", siteUrl: "https://s/", repo: "https://r" }, stamp: "2026-10-23", total: 1, hasCard: false, now: 0 });
  has("category page: group heading is h2 under the h1", html, '<h2 class="group-heading"');
  has("category page: card titles are h3", html, '<h3><a class="entry-link"');
  eq("category page: no h4", html.includes("<h4"), false);
}
{
  const html = sp();
  has("stack page: card titles are h3 under the section h2", html, '<h3><a class="entry-link"');
  eq("stack page: no h4", html.includes("<h4"), false);
}

eq("search: q from the URL is capped", readState(`?q=${"a".repeat(5000)}`, { q: "" }, {}).q.length, MAX_QUERY);

/* modulepreload lists match the import graph ---------------------------- */
{
  const { PAGE_MODULES } = await import("./shared.mjs");
  const libDir = new URL("./", import.meta.url);
  const publicDir = new URL("../public/", import.meta.url);
  // dist name -> source file (build.mjs copies these four from site/lib).
  const fromLib = { "search.js": "search.mjs", "owes.js": "owes.mjs", "cards.mjs": "cards.mjs", "shared.mjs": "shared.mjs" };
  const src = (name) => nodeFs.readFileSync(fromLib[name] ? new URL(fromLib[name], libDir) : new URL(name, publicDir), "utf8");
  const importsOf = (name) => [...src(name).matchAll(/^import[^;]*?from "\.\/([^"]+)";/gm)].map((m) => m[1]);
  const closure = (roots) => {
    const seen = new Set();
    const walk = (n) => { if (seen.has(n)) return; seen.add(n); importsOf(n).forEach(walk); };
    roots.forEach(walk);
    return [...seen].sort();
  };
  const roots = { home: ["app.js", "shortlist.js"], entry: ["shortlist.js"], category: ["category.js", "shortlist.js"], notFound: ["not-found.js"] };
  for (const [page, list] of Object.entries(roots)) {
    eq(`modulepreload: ${page} list matches its imports`, [...PAGE_MODULES[page]].sort().join(","), closure(list).join(","));
  }
  has("modulepreload: head emits the links", baseHeadHtml({ site: { siteUrl: "https://s/", title: "T", tagline: "x" }, title: "T", description: "d", url: "https://s/", root: "../../", modules: ["a.js"] }), '<link rel="modulepreload" href="../../a.js" />');
}

/* entry links read as names; thumbnails size honestly ------------------- */
{
  const r = makeLinkResolver({ entryPath: "catalog/2d/a.md", idByPath: new Map([["catalog/2d/b.md", "b"]]), repo: "https://g/r", kindOf: () => null, nameById: new Map([["b", "Bee Pack"]]) });
  has("links: an id label becomes the entry name", renderInline("[b](b.md)", r), ">Bee Pack</a>");
  has("links: a written label is kept", renderInline("[the bee one](b.md)", r), ">the bee one</a>");
  const { thumbHtml: th } = await import("./cards.mjs");
  has("thumbs: small preview contained", th({ thumb: { path: "t/a.webp", width: 160, height: 120 } }), 'class="entry-thumb-img is-small"');
  lacks("thumbs: normal preview not marked small", th({ thumb: { path: "t/a.webp", width: 640, height: 400 } }), "is-small");
  has("thumbs: eager strip image", th({ thumb: { path: "t/a.webp", width: 640, height: 400 } }, "", undefined, { eager: true }), 'loading="eager" fetchpriority="high"');
}

/* structured data ---------------------------------------------------------- */
{
  const { jsonLd: ld } = await import("./entry-page.mjs");
  const { categoryJsonLd } = await import("./category-page.mjs");
  const s = { siteUrl: "https://s.test/site/", title: "T" };
  const e = { id: "a", name: "A", url: "https://a/", category: "3d", license: "CC0", thumb: { path: "thumbs/a.webp", width: 640, height: 400 } };
  const page = ld(e, s, { categoryLabel: "3D" });
  eq("json-ld: image is absolute", page.mainEntity.image.url, "https://s.test/site/thumbs/a.webp");
  eq("json-ld: breadcrumb has three steps", page.breadcrumb.itemListElement.map((x) => x.name).join(">"), "T>3D>A");
  const cat = categoryJsonLd({ cat: "3d", label: "3D", description: "d", entries: [e], site: s });
  eq("json-ld: category is a CollectionPage", cat["@type"], "CollectionPage");
  eq("json-ld: category lists its entries", cat.mainEntity.itemListElement[0].url, "https://s.test/site/entry/a/");
}

/* guide renderer ---------------------------------------------------------- */
{
  const { renderGuide, headingSlug } = await import("./guide-render.mjs");
  const pass = (h) => ({ href: h, external: false });
  const g = renderGuide("# Title\n\nIntro **bold**.\n\n## CC-BY & friends\n\n| A | B |\n| --- | --- |\n| `x|y` | two |\n\n> quoted\n\n1. one\n2. two\n\n```sh\necho **hi**\n```\n", { file: "g.md", resolveLink: pass });
  eq("guide: title comes from the h1", g.title, "Title");
  eq("guide: first paragraph", g.firstParagraph, "Intro **bold**.");
  has("guide: heading id matches GitHub", g.html, '<h2 id="cc-by--friends">');
  eq("guide: slug helper", headingSlug("Licence of contributions"), "licence-of-contributions");
  has("guide: table header", g.html, '<th scope="col">A</th>');
  has("guide: pipe inside code stays in its cell", g.html, "<td><code>x|y</code></td>");
  has("guide: blockquote", g.html, "<blockquote><p>quoted</p></blockquote>");
  has("guide: ordered list", g.html, "<ol><li>one</li><li>two</li></ol>");
  has("guide: code fence escaped", g.html, '<pre class="guide-code" data-lang="sh"><code>echo **hi**</code></pre>');
  let threw = "";
  try { renderGuide("# T\n\n![x](a.png)\n", { file: "g.md", resolveLink: pass }); } catch (e) { threw = e.message; }
  has("guide: images refused", threw, "g.md:3: an image is not supported");
  const gr = (md) => renderGuide(`# T\n\n${md}`, { file: "g.md", resolveLink: pass }).html;
  has("guide: an ordered list keeps its start number", gr("3. third\n4. fourth\n"), '<ol start="3"><li>third</li><li>fourth</li></ol>');
  has("guide: a loose ordered list stays one list", gr("1. a\n\n2. b\n"), "<ol><li>a</li><li>b</li></ol>");
  has("guide: a loose bullet list stays one list", gr("- a\n\n- b\n\nAfter.\n"), "<ul><li>a</li><li>b</li></ul>\n<p>After.</p>");
  has("guide: a paragraph between lists splits them", gr("1. a\n\nText.\n\n2. b\n"), '<ol start="2"><li>b</li></ol>');
  has("guide: --- is a thematic break", gr("Para.\n\n---\n\nNext.\n"), "<p>Para.</p>\n<hr />\n<p>Next.</p>");
  has("guide: *** is a thematic break", gr("***\n"), "<hr />");
  throws("guide: --- under text (a setext heading) fails", () => gr("Para\n---\n"), "a setext heading underline");
  throws("guide: === under text (a setext heading) fails", () => gr("Para\n===\n"), "a setext heading underline");
  has("guide: ~~~ fences render as code", gr("~~~js\nlet a = **1**;\n~~~\n"), '<pre class="guide-code" data-lang="js"><code>let a = **1**;</code></pre>');
  has("guide: a ``` line inside a ~~~ fence is literal", gr("~~~\n```\n~~~\n"), "<code>```</code>");
  throws("guide: a fence indented under a list item fails", () => gr("1. step\n   ```sh\n   x\n   ```\n"), "an indented code fence");
  throws("guide: a fence after a blank line under a list item fails", () => gr("- step\n\n  ```\n  x\n  ```\n"), "an indented code fence");
  has("guide: ## Content does not take the template's id", gr("## Content\n"), '<h2 id="content-1">Content</h2>');
  has("guide: a second ## Content continues the count", gr("## Content\n\n## Content\n"), '<h2 id="content-2">Content</h2>');
}

/* new-entry --from-issue (scaffold.mjs) ------------------------------------ */
{
  const { parseIssueForm, entryFromIssue } = await import("./scaffold.mjs");
  const { checkKnownKeys, checkEntryBasics } = await import("../checks.mjs");
  const template = nodeFs.readFileSync(new URL("../../catalog/TEMPLATE.md", import.meta.url), "utf8");
  const vocab = JSON.parse(nodeFs.readFileSync(new URL("../license-vocabulary.json", import.meta.url), "utf8"));
  const body = [
    "### Name", "", 'Sound "Pack" One', "",
    "### Publisher URL", "", "https://sounds.example/pack", "",
    "### Category", "", "audio", "",
    "### License as stated on the live page", "", "CC-BY-4.0", "",
    "### Licence quote and date", "", 'Live licence page (2026-10-30): "Use it in games, credit Sound Co."', "",
    "### Commercial / game use", "", "Explicitly allowed", "",
    "### Credit required?", "", "Yes", "",
    "### Credit line as the source words it", "", "Sounds by Sound Co.", "",
    "### Relationship to the source", "", "- [X] I publish or maintain this source (see CONTRIBUTING, \"Submitting your own source\")", "",
    "### Why it belongs", "", "_No response_", "",
  ].join("\n");
  const form = parseIssueForm(body);
  eq("issue form: a field by its label", form["Publisher URL"], "https://sounds.example/pack");
  eq("issue form: _No response_ is empty", form["Why it belongs"], "");
  const { text, warnings } = entryFromIssue(template, form, { id: "sound-pack-one", issue: 42, today: "2026-11-03", vocab });
  const parsed = parseFrontmatter(text);
  eq("from-issue: the draft parses", parsed.errors.join(" | "), "");
  const m = parsed.meta;
  eq("from-issue: name with quotes survives", m.name, 'Sound "Pack" One');
  eq("from-issue: licence in the vocabulary is kept", m.license, "CC-BY-4.0");
  eq("from-issue: SPDX filled from the vocabulary", m.license_spdx, "CC-BY-4.0");
  eq("from-issue: commercial from the dropdown", m.commercial, true);
  eq("from-issue: credit from the dropdown", m.attribution_required, true);
  eq("from-issue: credit line", m.attribution_string, "Sounds by Sound Co.");
  eq("from-issue: verified is the quote's date", m.verified, "2026-10-30");
  eq("from-issue: always starts needs-review", m.status, "needs-review");
  eq("from-issue: no warnings for a clean form", warnings.length, 0);
  has("from-issue: the quote is the Evidence line", parsed.body, '- Reported in #42: Live licence page (2026-10-30): "Use it in games, credit Sound Co."');
  has("from-issue: a publisher submission is noted", parsed.body, "Submitted by the publisher (#42).");
  eq("from-issue: no unknown keys", checkKnownKeys("d.md", m).length, 0);
  has("from-issue: validate fails until lists are filled", checkEntryBasics("catalog/audio/sound-pack-one.md", m, parsed.body, { stem: "sound-pack-one", dirName: "audio", categories: new Set(["audio"]), readmeText: "(sound-pack-one.md)", today: "2026-11-03" }).join(" "), "missing/empty: subcategories, formats, tags");
  const odd = entryFromIssue(template, { ...form, "License as stated on the live page": "Royalty free!", "Commercial / game use": "maybe", "Licence quote and date": "no date here" }, { id: "x", issue: 7, today: "2026-11-03", vocab });
  const om = parseFrontmatter(odd.text).meta;
  eq("from-issue: an unknown licence becomes unknown", om.license, "unknown");
  eq("from-issue: no SPDX for unknown", om.license_spdx, undefined);
  eq("from-issue: an unexpected dropdown answer is unknown", om.commercial, "unknown");
  eq("from-issue: no quote date means verified today", om.verified, "2026-11-03");
  eq("from-issue: both problems are warned about", odd.warnings.length, 2);
}

/* PR licence-field summary (licence-diff.mjs) ------------------------------ */
{
  const { licenceChanges, licenceDiffMarkdown, newestEvidenceLine } = await import("./licence-diff.mjs");
  const before = { id: "a", license: "CC-BY", commercial: true, attribution_required: true, status: "active", verified: "2026-01-01", tags: ["x"] };
  const after = { ...before, license: "CC0", attribution_required: false, verified: "2026-11-01", tags: ["y"] };
  const ch = licenceChanges(before, after);
  eq("licence diff: only licence fields, in order", ch.map((c) => c.field).join(","), "license,attribution_required,verified");
  eq("licence diff: old and new values", `${ch[0].before}>${ch[0].after}`, "CC-BY>CC0");
  eq("licence diff: booleans as text", ch[1].after, "false");
  eq("licence diff: an added entry lists its set fields", licenceChanges(null, after).map((c) => c.field).join(","), "status,license,commercial,attribution_required,verified");
  eq("licence diff: no change, no rows", licenceChanges(before, { ...before, tags: ["z"] }).length, 0);
  const body = "Intro (2027-01-01).\n\n## Evidence\n\n- Page (2026-01-01): \"old\"\n- [Release](https://x.example/2030-01-01) (2026-11-01): \"CC0\"\n\n## Notes\n\n- 2028-01-01 later note\n";
  eq("licence diff: newest Evidence line, URL dates and other sections ignored", newestEvidenceLine(body), '- [Release](https://x.example/2030-01-01) (2026-11-01): "CC0"');
  eq("licence diff: no Evidence section", newestEvidenceLine("Nothing."), null);
  const md = licenceDiffMarkdown([
    { file: "catalog/2d/a.md", change: "modified", fields: ch, evidence: "- quote with | pipe and `tick` (2026-11-01)" },
    { file: "catalog/2d/b.md", change: "modified", fields: [], evidence: null },
  ]);
  has("licence diff: table counts changed entries only", md, "1 entry changed.");
  has("licence diff: a row per field", md, "| `catalog/2d/a.md` | license | `CC-BY` | `CC0` |");
  has("licence diff: pipes are escaped and backticks neutralised", md, "quote with \\| pipe and 'tick'");
  lacks("licence diff: unchanged entries are left out", md, "b.md");
  has("licence diff: nothing changed", licenceDiffMarkdown([]), "No licence field changed");
}

/* closed vocabularies stay in step (#222) ----------------------------------- */
{
  const sh = await import("./shared.mjs");
  const ck = await import("../checks.mjs");
  const { PERSPECTIVE_SEARCH } = await import("./search.mjs");
  const cards = await import("./cards.mjs");
  const schema = JSON.parse(nodeFs.readFileSync(new URL("../data.schema.json", import.meta.url), "utf8"));
  const keys = (x) => [...(x instanceof Set ? x : Array.isArray(x) ? x : Object.keys(x))].sort().join("|");
  const props = schema.$defs.entryBase.properties;
  const perspective = keys(sh.PERSPECTIVES);
  eq("vocab: validate's perspectives are the shared ones", keys(ck.CAMERA_PERSPECTIVES), perspective);
  eq("vocab: every perspective has a card label", keys(sh.PERSPECTIVE_LABELS), perspective);
  eq("vocab: cards use the shared labels", keys(cards.PERSPECTIVE_LABELS), perspective);
  eq("vocab: every perspective is searchable", keys(PERSPECTIVE_SEARCH), perspective);
  eq("vocab: every perspective has a filter option", Object.values(sh.PERSPECTIVES).every((p) => p.label && p.search && p.option), true);
  const indexHtml = nodeFs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  lacks("vocab: no perspective option is written into index.html", indexHtml, '<option value="top_down"');
  eq("vocab: status values, notes and schema agree", [keys(ck.STATUS_VALUES), keys(props.status?.enum || [])].join(" / "), [keys(sh.STATUS_NOTES), keys(sh.STATUS_NOTES)].join(" / "));
  eq("vocab: maintenance values, notes and schema agree", [keys(ck.MAINTENANCE_VALUES), keys(props.maintenance?.enum || [])].join(" / "), [keys(sh.MAINTENANCE_NOTES), keys(sh.MAINTENANCE_NOTES)].join(" / "));
  eq("vocab: engine lock values, notes and labels agree", [keys(ck.ENGINE_LOCK_VALUES), keys(sh.ENGINE_LOCK_LABELS)].join(" / "), [keys(sh.ENGINE_LOCK_NOTES), keys(sh.ENGINE_LOCK_NOTES)].join(" / "));
  if (props.engine_lock?.enum) eq("vocab: engine lock schema agrees", keys(props.engine_lock.enum), keys(sh.ENGINE_LOCK_NOTES));
}

/* data.json schema (schema-check.mjs + site/data.schema.json) -------------- */
{
  const { schemaErrors } = await import("./schema-check.mjs");
  const schema = JSON.parse(nodeFs.readFileSync(new URL("../data.schema.json", import.meta.url), "utf8"));
  const entry = {
    id: "a", name: "A", url: "https://a.example/", category: "2d", subcategories: ["x"], license: "CC0", commercial: true,
    attribution_required: false, formats: ["PNG"], tags: [], added: "2026-01-01", verified: "2026-01-02", status: "active",
    path: "catalog/2d/a.md", page: "entry/a/", summary: "", thumb: null, licenseFamily: "public-domain", attributionClass: "none", licenseRank: 0,
  };
  const payload = (over = {}) => ({
    generatedAt: "2026-11-03T00:00:00.000Z", version: "v2026.11.03",
    site: { title: "T", tagline: "t", repo: "r", siteUrl: "s" }, categories: { "2d": { label: "2D", view: "cards" } },
    guides: [{ id: "g", title: "G", path: "docs/g.md" }], featured: [{ ...entry, need: "x" }],
    stats: { total: 1, active: 1, needsReview: 0, deprecated: 0, commercialOk: 1, commercialVaries: 0, categories: 1 },
    filters: { licenseFamilies: { cc0: "CC0" }, formatGroups: { image: { label: "Images", formats: ["PNG"] } } },
    entries: [entry], ...over,
  });
  const errs = (p) => schemaErrors(schema, p).join(" | ");
  eq("schema: a well-formed payload passes", errs(payload()), "");
  eq("schema: a thumb object passes", errs(payload({ entries: [{ ...entry, thumb: { path: "thumbs/a.webp", width: 640, height: 360, credit: "c" } }] })), "");
  has("schema: a renamed field fails", errs(payload({ entries: [{ ...entry, licence: "CC0", license: undefined }] })), 'unexpected key "licence"');
  has("schema: a missing required field fails", errs(payload({ entries: [(({ summary, ...rest }) => rest)(entry)] })), 'missing required "summary"');
  has("schema: a retyped field fails", errs(payload({ entries: [{ ...entry, licenseRank: "0" }] })), "$.entries[0].licenseRank: expected integer, got string");
  has("schema: an unknown status fails", errs(payload({ entries: [{ ...entry, status: "retired" }] })), '"retired" is not one of');
  has("schema: commercial outside its values fails", errs(payload({ entries: [{ ...entry, commercial: "yes" }] })), "$.entries[0].commercial");
  has("schema: need is not an entry field", errs(payload({ entries: [{ ...entry, need: "x" }] })), 'unexpected key "need"');
  has("schema: a bad id pattern fails", errs(payload({ entries: [{ ...entry, id: "Bad_ID" }] })), "does not match");
  has("schema: a new top-level key fails", errs(payload({ extra: 1 })), 'unexpected key "extra"');
  has("schema: a negative stat fails", errs(payload({ stats: { ...payload().stats, total: -1 } })), "is below 0");
  throws("schema: an unsupported keyword is refused, not ignored", () => schemaErrors({ type: "string", maxLength: 3 }, "abcd"), 'unsupported keyword "maxLength"');
}

/* catalog ordering, grouping and chip counts (search.mjs, used by app.js) -- */
{
  const { computeResults, sorterFor, shouldGroup, engineRank, SORTS } = await import("./search.mjs");
  const E = [
    { id: "a", name: "Alpha", category: "2d", license: "CC0", licenseRank: 0, verified: "2026-01-01", added: "2026-01-05", tags: ["godot"] },
    { id: "b", name: "Bravo", category: "2d", license: "MIT", licenseRank: 1, verified: null, added: "2026-02-01", tags: [] },
    { id: "c", name: "Charlie", category: "audio", license: "CC-BY", licenseRank: 2, verified: "2026-03-01", added: null, tags: [] },
    { id: "d", name: "Delta", category: "audio", license: "custom", verified: "2026-02-01", added: "2026-01-01", tags: [], engine_lock: "unreal" },
  ];
  const ids = (list) => list.map((e) => e.id).join("");
  const run = (state, { passes = () => true, score = () => 1, hasQuery = false } = {}) =>
    computeResults(E, { sort: "name", category: "all", engine: "any", ...state }, { passes, score, hasQuery });

  eq("order: name sort is alphabetical", ids(run({}).list), "abcd");
  eq("order: name sort is not ranked without a query", run({}).ranked, false);
  const scores = { a: 1, b: 5, c: 5, d: 0 };
  const searched = run({}, { score: (e) => scores[e.id], hasQuery: true });
  eq("order: a search ranks by score, ties by name, and drops non-matches", ids(searched.list), "bca");
  eq("order: a search under the name sort is ranked", searched.ranked, true);
  eq("order: a search under another sort keeps that sort", ids(run({ sort: "verified" }, { score: (e) => scores[e.id], hasQuery: true }).list), "cab");
  eq("order: licence sort puts unknown rank last", ids(run({ sort: "license" }).list), "abcd");
  eq("order: verified sort is newest first, undated last", ids(run({ sort: "verified" }).list), "cdab");
  eq("order: added sort is newest first, undated last", ids(run({ sort: "added" }).list), "badc");
  eq("order: unknown sort falls back to name", ids([...E].sort(sorterFor({ sort: "nope", engine: "any" }))), "abcd");
  eq("order: engine=godot puts godot-tagged entries first", ids([...E].sort(sorterFor({ sort: "verified", engine: "godot" }))), "acdb");
  eq("order: engine=unreal puts engine-locked entries first", ids([...E].sort(sorterFor({ sort: "name", engine: "unreal" }))), "dabc");
  eq("order: engineRank with an unknown engine is 0", engineRank(E[0], "pico-8"), 0);
  eq("order: a ranked search breaks score ties by engine", ids(run({ engine: "unreal" }, { score: (e) => (e.id === "b" ? 0 : 1), hasQuery: true }).list), "dac");
  eq("order: SORTS.name ties nothing", SORTS.name(E[0], E[0]), 0);

  const filtered = run({ category: "audio" }, { passes: (e) => e.id !== "d" });
  eq("counts: the category filter narrows the list", ids(filtered.list), "c");
  eq("counts: chip counts ignore the category filter", `${filtered.counts.get("2d")}/${filtered.counts.get("audio")}`, "2/1");
  eq("counts: chip counts apply the other filters", filtered.total, 3);
  eq("group: grouped under name sort and all categories", shouldGroup({ sort: "name", category: "all" }), true);
  eq("group: flat under another sort", shouldGroup({ sort: "verified", category: "all" }), false);
  eq("group: flat under a category filter", shouldGroup({ sort: "name", category: "2d" }), false);
}

/* added dates follow renames (added-dates.mjs) ----------------------------- */
{
  const { firstAddedFromLog, lateAddedDates } = await import("./added-dates.mjs");
  const log = [
    "\0" + "2026-07-19", "", "A\tcatalog/2d/a.md", "A\tcatalog/2d/b.md",
    "\0" + "2026-08-25", "", "R095\tcatalog/2d/a.md\tcatalog/tools/a.md", "A\tcatalog/2d/c.md",
    "\0" + "2026-09-26", "", "R100\tcatalog/tools/a.md\tcatalog/3d/a.md",
  ].join("\n");
  const first = firstAddedFromLog(log);
  eq("added: a renamed file keeps its first-add date through two moves", first.get("catalog/3d/a.md"), "2026-07-19");
  eq("added: a plain add", first.get("catalog/2d/c.md"), "2026-08-25");
  const errs = lateAddedDates([
    { rel: "catalog/3d/a.md", added: "2026-09-26" },
    { rel: "catalog/2d/b.md", added: "2026-07-18" },
    { rel: "catalog/2d/c.md", added: "2026-08-25" },
    { rel: "catalog/2d/new.md", added: "2026-11-01" },
  ], first);
  eq("added: a date reset by a move is caught", errs.length, 1);
  has("added: the message names the right date", errs[0], "set added: 2026-07-19");
}

/* engine scope and limits on entry pages (#173) --------------------------- */
{
  const { engineScope } = await import("./entry-page.mjs");
  const { seoDescription } = await import("./shared.mjs");
  const base = { license: "MIT", commercial: true, attribution_required: false, summary: "A thing." };
  eq("scope: an Unreal project is made for Unreal", engineScope({ formats: ["Unreal"] }), "Unreal Engine");
  eq("scope: a Godot addon is made for Godot", engineScope({ formats: ["godot-addon", "PNG"] }), "Godot");
  eq("scope: a portable pack has none", engineScope({ formats: ["WAV", "Godot"] }), null);
  eq("scope: a two-engine pack has none", engineScope({ formats: ["Unity", "Unreal"] }), null);
  has("seo: the scope leads the description", seoDescription(base, undefined, { scope: "Godot" }), "no credit needed. For Godot only. A thing.");
  has("seo: limits lead the description", seoDescription({ ...base, limits: "No redistribution" }), "no credit needed. No redistribution. A thing.");
  has("seo: an engine lock reads as its badge", seoDescription({ ...base, engine_lock: "unreal" }), "no credit needed. UE only.");
  eq("seo: no scope, no limits, unchanged", seoDescription(base), "MIT, commercial use OK, no credit needed. A thing.");
}

/* heading anchors: validator and guide renderer agree ---------------------- */
{
  const { markdownAnchors } = await import("../checks.mjs");
  const { renderGuide } = await import("./guide-render.mjs");
  const md = "# Fonts\n\nIntro.\n\n## Fonts\n\nText.\n\n## Setup `npm` and [links](https://a.example/)\n\n```\n## not a heading\n```\n\n## Fonts\n\n### Q&A: what's new?\n";
  const r = renderGuide(md, { file: "g.md", resolveLink: (href) => ({ href, external: true }) });
  const ids = [r.titleId, ...[...r.html.matchAll(/<h\d id="([^"]+)"/g)].map((m) => m[1])];
  eq("anchors: renderer ids", ids.join(","), "fonts,fonts-1,setup-npm-and-links,fonts-2,qa-whats-new");
  eq("anchors: validator matches the renderer", [...markdownAnchors(md)].sort().join(","), [...ids].sort().join(","));
}

/* entry counts skip the same folders as build and validate ---------------- */
{
  const { countEntriesByCategory, listEntryFiles } = await import("./entry-files.mjs");
  const os = await import("node:os");
  const nodePath = await import("node:path");
  const root = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "fgda-count-"));
  try {
    const put = (rel) => {
      nodeFs.mkdirSync(nodePath.dirname(nodePath.join(root, rel)), { recursive: true });
      nodeFs.writeFileSync(nodePath.join(root, rel), "x");
    };
    ["2d/a.md", "2d/README.md", "2d/sub/b.md", "audio/c.md", "_scratch/x.md", "_scratch/y.md", ".hidden/z.md", "README.md", "TEMPLATE.md"].forEach(put);
    const { counts, total } = countEntriesByCategory(root);
    eq("counts: per category, nested files included", Object.entries(counts).sort().map(([k, n]) => `${k}=${n}`).join(","), "2d=2,audio=1");
    eq("counts: total skips _scratch and hidden folders", total, 3);
    eq("counts: total matches the entry list build and validate use", total, listEntryFiles(root).length);
    nodeFs.writeFileSync(nodePath.join(root, "audio/old.md"), "---\nid: old\nstatus: deprecated # moved\n---\n\nGone.\n");
    nodeFs.writeFileSync(nodePath.join(root, "audio/body.md"), "---\nid: body\nstatus: active\n---\n\nstatus: deprecated\n");
    const listed = countEntriesByCategory(root);
    eq("counts: a deprecated entry is not listed", listed.counts.audio, 2);
    eq("counts: total is listed entries only", listed.total, 4);
    eq("counts: files and deprecated are reported", `${listed.files}/${listed.deprecated}`, "5/1");
    // #221: a BOM'd deprecated entry is deprecated here too, as parseFrontmatter reads it.
    nodeFs.writeFileSync(nodePath.join(root, "audio/bom.md"), "﻿---\nid: bom\nstatus: deprecated\n---\n\nGone.\n");
    eq("counts: a BOM'd deprecated entry is not listed", countEntriesByCategory(root).counts.audio, 2);
    const { isDeprecated, isEntryPath, readCatalog, usableRecord } = await import("./entry-files.mjs");
    eq("isDeprecated agrees with parseFrontmatter on a BOM", isDeprecated("﻿---\nid: a\nstatus: deprecated\n---\nx"), true);
    eq("isDeprecated: a quoted status", isDeprecated('---\nid: a\nstatus: "deprecated"\n---\nx'), true);
    eq("isDeprecated: active is not", isDeprecated("---\nid: a\nstatus: active\n---\nx"), false);
    // One entry-path rule for the walker and pr-diff.
    eq("entry path: a nested entry", isEntryPath("2d/sub/a.md"), true);
    eq("entry path: index and template are not", [isEntryPath("2d/README.md"), isEntryPath("TEMPLATE.md")].join(), "false,false");
    eq("entry path: underscore and dot folders are not", [isEntryPath("_scratch/a.md"), isEntryPath("2d/_wip/a.md"), isEntryPath(".hidden/a.md")].join(), "false,false,false");
    eq("entry path: windows separators", isEntryPath("2d\\_wip\\a.md"), false);
    eq("entry path: not markdown", isEntryPath("2d/a.txt"), false);
    // The shared reader parses once; usableRecord names the usual filter.
    nodeFs.writeFileSync(nodePath.join(root, "audio/wrong-name.md"), "---\nid: other\nstatus: active\n---\n\nx\n");
    const recs = new Map(readCatalog(root, { root }).map((r) => [r.rel, r]));
    eq("readCatalog: rel is relative to root with /", recs.has("audio/bom.md"), true);
    eq("readCatalog: a BOM'd file parses", recs.get("audio/bom.md").parsed.meta.status, "deprecated");
    eq("readCatalog: no frontmatter gives null", recs.get("2d/a.md").parsed, null);
    eq("usableRecord: a clean entry", usableRecord(recs.get("audio/old.md")), true);
    eq("usableRecord: an id that does not match its file", usableRecord(recs.get("audio/wrong-name.md")), false);
    eq("usableRecord: no frontmatter", usableRecord(recs.get("2d/a.md")), false);
  } finally {
    nodeFs.rmSync(root, { recursive: true, force: true });
  }
}

/* local preview server ---------------------------------------------------- */
{
  const { resolveRequest } = await import("../serve.mjs");
  const os = await import("node:os");
  const nodePath = await import("node:path");
  const root = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "fgda-serve-"));
  try {
    nodeFs.mkdirSync(nodePath.join(root, "entry", "a"), { recursive: true });
    nodeFs.writeFileSync(nodePath.join(root, "index.html"), "home");
    nodeFs.writeFileSync(nodePath.join(root, "entry", "a", "index.html"), "a");
    nodeFs.writeFileSync(nodePath.join(root, "data.json"), "{}");
    eq("serve: / is index.html", resolveRequest(root, "/"), nodePath.join(root, "index.html"));
    eq("serve: a directory serves its index", resolveRequest(root, "/entry/a/"), nodePath.join(root, "entry", "a", "index.html"));
    eq("serve: query strings are ignored", resolveRequest(root, "/data.json?v=1"), nodePath.join(root, "data.json"));
    eq("serve: missing file", resolveRequest(root, "/nope.html"), null);
    eq("serve: directory without an index", resolveRequest(root, "/entry/"), null);
    eq("serve: dot-dot cannot escape", resolveRequest(root, "/../../etc/passwd"), null);
    eq("serve: encoded dot-dot cannot escape", resolveRequest(root, "/%2e%2e/%2e%2e/secret"), null);
    eq("serve: backslash dot-dot cannot escape", resolveRequest(root, "/..%5c..%5csecret"), null);
    eq("serve: a NUL byte is refused", resolveRequest(root, "/index.html%00.txt"), null);
    eq("serve: bad percent-encoding is refused", resolveRequest(root, "/%E0%A4%A"), null);
    // #231: a directory URL without its slash redirects, as on Pages.
    const { slashRedirect } = await import("../serve.mjs");
    eq("serve: a directory without its slash redirects", slashRedirect(root, "/entry/a"), "/entry/a/");
    eq("serve: the redirect keeps the query", slashRedirect(root, "/entry/a?q=1#x"), "/entry/a/?q=1#x");
    eq("serve: a slash URL does not redirect", slashRedirect(root, "/entry/a/"), null);
    eq("serve: a file does not redirect", slashRedirect(root, "/data.json"), null);
    eq("serve: index.html itself does not redirect", slashRedirect(root, "/entry/a/index.html"), null);
    eq("serve: a missing path does not redirect", slashRedirect(root, "/nope"), null);
    eq("serve: a protocol-relative path never redirects", slashRedirect(root, "//entry/a"), null);
    // A link inside root that points outside it serves nothing (a junction
    // needs no privilege on Windows; elsewhere it is a plain dir symlink).
    const outside = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "fgda-outside-"));
    try {
      nodeFs.writeFileSync(nodePath.join(outside, "secret.txt"), "s");
      nodeFs.writeFileSync(nodePath.join(outside, "index.html"), "s");
      nodeFs.symlinkSync(outside, nodePath.join(root, "leak"), "junction");
      eq("serve: a file through a link out of root is refused", resolveRequest(root, "/leak/secret.txt"), null);
      eq("serve: a directory index through a link out of root is refused", resolveRequest(root, "/leak/"), null);
    } finally {
      nodeFs.rmSync(nodePath.join(root, "leak"), { force: true, recursive: false });
      nodeFs.rmSync(outside, { recursive: true, force: true });
    }
  } finally {
    nodeFs.rmSync(root, { recursive: true, force: true });
  }
}

/* shared page chrome ------------------------------------------------------ */
{
  const { siteHeaderHtml, siteFooterHtml, PREVIEW_CREDIT_LINE: credit } = await import("./shared.mjs");
  const deep = siteHeaderHtml({ root: "../../", repo: "https://github.com/o/r" });
  for (const a of ["#catalog", "#stacks", "#starters", "#guides"]) has(`chrome: header links ${a} at depth 2`, deep, `href="../../${a}"`);
  has("chrome: header brand at depth 2", deep, '<a class="brand" href="../../">');
  has("chrome: header repo link", deep, 'href="https://github.com/o/r" rel="noopener noreferrer"');
  has("chrome: header brand at depth 1", siteHeaderHtml({ root: "../", repo: "x" }), '<a class="brand" href="../">');
  has("chrome: header escapes the repo url", siteHeaderHtml({ root: "../", repo: 'x"y' }), 'href="x&quot;y"');
  const foot = siteFooterHtml({ root: "../../", stamp: "2026-11-03", total: 7 });
  for (const href of ["freshness/", "data.json", "catalog.csv", "feed.xml", "guide/data/"]) has(`chrome: footer links ${href}`, foot, `href="../../${href}"`);
  has("chrome: footer carries the preview credit", foot, credit);
  has("chrome: footer stamp", foot, "Built 2026-11-03 from 7 catalog entries.");
  lacks("chrome: credit: false drops the preview credit", siteFooterHtml({ root: "../../", stamp: "s", total: 1, credit: false }), credit);
  const fresh = siteFooterHtml({ root: "../", stamp: "s", total: 1, current: "freshness" });
  lacks("chrome: the freshness page does not link to itself", fresh, "freshness/");
  has("chrome: the freshness page keeps the data links", fresh, 'href="../guide/data/"');
}

/* client scripts parse, and every named import exists --------------------- */
{
  const { execFileSync } = await import("node:child_process");
  const os = await import("node:os");
  const nodePath = await import("node:path");
  const publicDir = new URL("../public/", import.meta.url);
  // dist name -> source module in site/lib (build.mjs copies these out).
  const fromLib = { "search.js": "search.mjs", "owes.js": "owes.mjs", "cards.mjs": "cards.mjs", "shared.mjs": "shared.mjs" };
  const scripts = nodeFs.readdirSync(publicDir).filter((f) => f.endsWith(".js")).sort();
  const tmp = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "fgda-client-"));
  const exportsOfPublic = (text) => {
    const names = new Set([...text.matchAll(/^export\s+(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]));
    for (const m of text.matchAll(/^export\s*\{([^}]*)\}/gm)) for (const part of m[1].split(",")) if (part.trim()) names.add(part.trim().split(/\s+as\s+/).pop());
    return names;
  };
  try {
    for (const name of scripts) {
      const text = nodeFs.readFileSync(new URL(name, publicDir), "utf8");
      // Parse as an ES module: node --check reads .js as CommonJS here, so check a .mjs copy.
      const copy = nodePath.join(tmp, name.replace(/\.js$/, ".mjs"));
      nodeFs.writeFileSync(copy, text);
      let parseError = "";
      try { execFileSync(process.execPath, ["--check", copy], { stdio: ["ignore", "ignore", "pipe"] }); } catch (e) { parseError = String(e.stderr || e.message).split(/\r?\n/).find((l) => /Error/.test(l)) || "parse failed"; }
      eq(`client: ${name} parses as a module`, parseError, "");
      for (const m of text.matchAll(/^import\s*\{([^}]*)\}\s*from\s*"\.\/([^"]+)";/gm)) {
        const target = m[2];
        let exported;
        if (fromLib[target]) exported = new Set(Object.keys(await import(`./${fromLib[target]}`)));
        else if (nodeFs.existsSync(new URL(target, publicDir))) exported = exportsOfPublic(nodeFs.readFileSync(new URL(target, publicDir), "utf8"));
        else { eq(`client: ${name} imports a file that exists (${target})`, false, true); continue; }
        for (const spec of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
          const imported = spec.split(/\s+as\s+/)[0];
          eq(`client: ${name} imports ${imported} from ${target}`, exported.has(imported), true);
        }
      }
    }
    eq("client: found the public scripts", scripts.length >= 5, true);
  } finally {
    nodeFs.rmSync(tmp, { recursive: true, force: true });
  }
}

/* safe-fetch -------------------------------------------------------------- */
{
  const { isPrivateAddress, refusalFor, safeFetch } = await import("./safe-fetch.mjs");
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1", "::1", "::", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "not-an-ip",
    // IPv4 carried inside IPv6, cloud platform and reserved forms
    "::127.0.0.1", "::7f00:1", "::ffff:0:7f00:1", "64:ff9b::a9fe:a9fe", "64:ff9b::10.0.0.1", "64:ff9b:1::1", "2002:7f00:1::", "2002:a9fe:a9fe::1", "2001::1", "2001:db8::1", "fec0::1", "feff::1", "100::1", "168.63.129.16", "192.0.2.1", "203.0.113.9", "[::1]", "fe80::1%eth0"]) {
    eq(`safe-fetch: ${ip} is private`, isPrivateAddress(ip), true);
  }
  for (const ip of ["8.8.8.8", "172.32.0.1", "100.128.0.1", "2606:4700::1111", "::ffff:8.8.8.8", "::ffff:808:808", "64:ff9b::8.8.8.8", "2002:808:808::1", "2001:4860::8888", "192.0.1.1", "168.63.129.17"]) {
    eq(`safe-fetch: ${ip} is public`, isPrivateAddress(ip), false);
  }
  eq("safe-fetch: https public url allowed", refusalFor("https://example.com/a"), null);
  has("safe-fetch: http refused by default", refusalFor("http://example.com/"), "scheme http:");
  eq("safe-fetch: http allowed when asked", refusalFor("http://example.com/", { schemes: ["https:", "http:"] }), null);
  has("safe-fetch: ip literal refused", refusalFor("https://169.254.169.254/"), "private or an IP literal");
  has("safe-fetch: credentials refused", refusalFor("https://u:p@example.com/"), "credentials");

  // A fake network: DNS answers and responses by URL.
  const dns = { "public.example": "93.184.216.34", "rebind.example": "127.0.0.1", "hop.example": "93.184.216.35" };
  const lookup = async (host) => {
    if (!dns[host]) throw Object.assign(new Error(`getaddrinfo ENOTFOUND ${host}`), { code: "ENOTFOUND" });
    return [{ address: dns[host], family: 4 }];
  };
  const routes = {
    "https://public.example/": { status: 200 },
    "https://public.example/to-meta": { status: 302, location: "http://169.254.169.254/latest/meta-data/" },
    "https://public.example/to-rebind": { status: 301, location: "https://rebind.example/" },
    "https://public.example/to-hop": { status: 302, location: "//hop.example/page" },
    "https://hop.example/page": { status: 200 },
    "https://public.example/loop": { status: 302, location: "/loop" },
  };
  const requested = [];
  const fetchImpl = async (url, init) => {
    requested.push(url);
    eq(`safe-fetch: ${url} requested with manual redirects`, init.redirect, "manual");
    const r = routes[url] || { status: 404 };
    return { status: r.status, ok: r.status < 300, headers: new Headers(r.location ? { location: r.location } : {}), body: null };
  };
  const opts = { lookup, fetchImpl, schemes: ["https:", "http:"] };
  const errOf = async (p) => { try { await p; return ""; } catch (e) { return `${e.message} ${e.cause?.code || ""}`; } };

  const ok = await safeFetch("https://public.example/", {}, opts);
  eq("safe-fetch: plain fetch returns the response", ok.response.status, 200);
  eq("safe-fetch: plain fetch final url", ok.finalUrl, "https://public.example/");
  const hopped = await safeFetch("https://public.example/to-hop", {}, opts);
  eq("safe-fetch: protocol-relative redirect followed", hopped.finalUrl, "https://hop.example/page");
  requested.length = 0;
  has("safe-fetch: redirect to metadata IP refused", await errOf(safeFetch("https://public.example/to-meta", {}, opts)), "private or an IP literal");
  eq("safe-fetch: metadata IP never requested", requested.includes("http://169.254.169.254/latest/meta-data/"), false);
  has("safe-fetch: name resolving to loopback refused", await errOf(safeFetch("https://public.example/to-rebind", {}, opts)), "resolves to a private address");
  eq("safe-fetch: loopback name never requested", requested.includes("https://rebind.example/"), false);
  has("safe-fetch: redirect loop capped", await errOf(safeFetch("https://public.example/loop", {}, { ...opts, maxRedirects: 3 })), "EREDIRECTS");
  has("safe-fetch: DNS failure keeps its code", await errOf(safeFetch("https://missing.example/", {}, opts)), "ENOTFOUND");
}

/* CI helper scripts (#237) ------------------------------------------------ */
{
  const { changedEntries, diffRows, licenceDiffMarkdown } = await import("./licence-diff.mjs");
  const z = ["A", "catalog/2d/new.md", "M", "catalog/2d/mod.md", "D", "catalog/audio/gone.md", "T", "catalog/3d/typed.md", "M", "catalog/2d/_draft.md", "M", "catalog/README.md", "A", "catalog/.hidden/x.md", "M", "catalog/2d/README.md", "M", "docs/other.md"].join("\0") + "\0";
  const ch = changedEntries(z);
  eq("pr-diff: A/M/D/T entry rows kept in order", ch.map((c) => `${c.status} ${c.file}`).join(", "), "A catalog/2d/new.md, M catalog/2d/mod.md, D catalog/audio/gone.md, T catalog/3d/typed.md");
  eq("pr-diff: empty diff", changedEntries("").length, 0);
  const fmText = (lic) => `---\nid: x\nlicense: ${lic}\nstatus: active\n---\n\n## Evidence\n\n- Live page (2026-10-01): "ok"\n`;
  const reads = [];
  const rows = diffRows(ch, {
    before: (f) => (reads.push(`before ${f}`), fmText("CC0")),
    after: (f) => (reads.push(`after ${f}`), fmText(f.includes("mod") ? "MIT" : "CC0")),
  });
  eq("pr-diff: an added file has no base read", reads.includes("before catalog/2d/new.md"), false);
  eq("pr-diff: a removed file has no working read", reads.includes("after catalog/audio/gone.md"), false);
  eq("pr-diff: change labels", rows.map((r) => r.change).join(), "added,modified,removed,modified");
  eq("pr-diff: modified licence is a field change", JSON.stringify(rows[1].fields[0]), '{"field":"license","before":"CC0","after":"MIT"}');
  eq("pr-diff: unchanged type change has no fields", rows[3].fields.length, 0);
  const { baseArg } = await import("../pr-diff.mjs");
  eq("pr-diff: a sha base is accepted", baseArg(["node", "x", "--base", "abc1234"]), "abc1234");
  eq("pr-diff: a ref name is refused (exit 2)", baseArg(["node", "x", "--base", "main"]), null);
  eq("pr-diff: a missing base is refused", baseArg(["node", "x", "--base"]), null);

  const one = licenceDiffMarkdown([{ file: "catalog/a.md", change: "added", fields: [{ field: "tags", before: null, after: "a, b" }], evidence: null }]);
  has("licence diff: one entry", one, "1 entry changed.");
  has("licence diff: added label", one, "`catalog/a.md` (added)");
  const two = licenceDiffMarkdown([
    { file: "catalog/a.md", change: "removed", fields: [{ field: "license", before: "a|b `c`", after: null }], evidence: "x" },
    { file: "catalog/b.md", change: "modified", fields: [{ field: "limits", before: null, after: "y".repeat(200) }], evidence: null },
  ]);
  has("licence diff: two entries", two, "2 entries changed.");
  has("licence diff: removed label", two, "`catalog/a.md` (removed)");
  has("licence diff: pipe and backtick escaped", two, "`a\\|b 'c'`");
  has("licence diff: long cell truncated to 160", two, `\`${"y".repeat(159)}…\``);
  const { licenceChanges } = await import("./licence-diff.mjs");
  eq("licence diff: an array value is joined", licenceChanges({ license: ["MIT", "CC0"] }, {})[0]?.before, "MIT, CC0");

  const { sniffImage } = await import("./thumbs.mjs");
  const pad = (head) => Buffer.from([...head, ...Array(16).fill(0)]);
  eq("sniff: png", sniffImage(pad([0x89, 0x50, 0x4e, 0x47])), "png");
  eq("sniff: jpeg", sniffImage(pad([0xff, 0xd8, 0xff, 0xe0])), "jpeg");
  eq("sniff: gif", sniffImage(pad([0x47, 0x49, 0x46, 0x38])), "gif");
  eq("sniff: webp", sniffImage(Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "latin1")), "webp");
  eq("sniff: riff wave is not an image", sniffImage(Buffer.from("RIFF\0\0\0\0WAVEfmt ", "latin1")), null);
  eq("sniff: under 12 bytes", sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47])), null);

  const { fetchBytes, convertFailure } = await import("../thumbs.mjs");
  const png = pad([0x89, 0x50, 0x4e, 0x47]);
  const streamOf = (chunks) => new ReadableStream({ start(c) { for (const ch of chunks) c.enqueue(ch); c.close(); } });
  const serve = (headers, chunks) => ({
    lookup: async () => [{ address: "93.184.216.34", family: 4 }],
    fetchImpl: async () => ({ status: 200, ok: true, headers: new Headers(headers), body: streamOf(chunks) }),
  });
  const errOf = async (p) => { try { await p; return ""; } catch (e) { return e.message; } };
  eq("fetchBytes: a small image", (await fetchBytes("https://img.example/a.png", { fetchOptions: serve({}, [png]) })).length, png.length);
  has("fetchBytes: declared size over the cap", await errOf(fetchBytes("https://img.example/a.png", { maxBytes: 10, fetchOptions: serve({ "content-length": "999" }, [png]) })), "over the 10 limit");
  has("fetchBytes: a body past the cap with no header", await errOf(fetchBytes("https://img.example/a.png", { maxBytes: 30, fetchOptions: serve({}, [png, png]) })), "over the 30 byte limit");
  has("fetchBytes: a body past the cap with a lying header", await errOf(fetchBytes("https://img.example/a.png", { maxBytes: 30, fetchOptions: serve({ "content-length": "5" }, [png, png]) })), "over the 30 byte limit");
  has("fetchBytes: not an image", await errOf(fetchBytes("https://img.example/a.png", { fetchOptions: serve({}, [Buffer.from("<html>not an image</html>")]) })), "not a PNG, JPEG, GIF or WebP");
  has("fetchBytes: a private host is refused first", await errOf(fetchBytes("https://127.0.0.1/a.png", { fetchOptions: serve({}, [png]) })), "image URL refused");
  eq("convert failure: last stderr line", convertFailure({ stderr: Buffer.from("noise\nInvalid data found\n"), message: "Command failed" }), "convert failed: Invalid data found");
  eq("convert failure: no stderr", convertFailure(new Error("spawn ffmpeg ENOENT")), "convert failed: spawn ffmpeg ENOENT");
}

/* lint: unused imports (#230) --------------------------------------------- */
{
  const { unusedImports, scriptFiles } = await import("../lint.mjs");
  eq("lint: a used import passes", unusedImports('import { a } from "./x.mjs";\na();\n').join(), "");
  eq("lint: an unused named import", unusedImports('import { a, b } from "./x.mjs";\na();\n').join(), "b");
  eq("lint: a renamed import is checked by its local name", unusedImports('import { a as z } from "./x.mjs";\na();\n').join(), "z");
  eq("lint: default and namespace imports", unusedImports('import fs from "node:fs";\nimport * as p from "node:path";\nfs.x();\n').join(), "p");
  eq("lint: a multi-line import", unusedImports('import {\n  a,\n  b,\n} from "./x.mjs";\nb();\n').join(), "a");
  eq("lint: a spread counts as a use", unusedImports('import { a } from "./x.mjs";\nf(...a);\n').join(), "");
  eq("lint: a property of the same name is not a use", unusedImports('import { a } from "./x.mjs";\nobj.a();\n').join(), "a");
  const listed = scriptFiles().map((f) => f.split(/[\\/]/).slice(-2).join("/"));
  eq("lint: browser scripts are listed", listed.includes("public/app.js"), true);
  eq("lint: dist is not", listed.some((f) => f.startsWith("dist/")), false);
}

/* report (keep last) ------------------------------------------------------ */
if (failures.length) {
  console.error(`lib.test failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`lib.test ok: ${passed} assertions`);

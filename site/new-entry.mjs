#!/usr/bin/env node
/**
 * Starts a catalog entry from catalog/TEMPLATE.md:
 *   node site/new-entry.mjs <category> <id>
 * Writes catalog/<category>/<id>.md with the id, category and today's date
 * filled in, then prints the steps that still need a person: the licence
 * research, the category README row, and the checks.
 *
 * Or drafts one from a "New source" issue form (read-only `gh issue view`):
 *   node site/new-entry.mjs --from-issue <number> [--id <id>]
 * The draft starts needs-review with empty subcategories, formats and tags,
 * so validate fails until a maintainer has read the source and finished it.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { entryFromIssue, newEntryProblem, newEntryText, parseIssueForm } from "./lib/scaffold.mjs";
import { slugOf } from "./lib/search.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");

function fail(msg) {
  console.error(`new-entry: ${msg}`);
  process.exit(1);
}

function flag(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1] || "";
}

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);
const template = fs.readFileSync(path.join(CATALOG, "TEMPLATE.md"), "utf8");
// Ids are unique across the whole catalog, not per category.
const takenBy = (id) =>
  id ? fs.readdirSync(CATALOG, { withFileTypes: true }).find((d) => d.isDirectory() && fs.existsSync(path.join(CATALOG, d.name, `${id}.md`)))?.name : undefined;

let category;
let id;
let text;
let fromIssue = null;
const warnings = [];

const issueArg = flag("--from-issue");
if (issueArg !== null) {
  if (!/^\d+$/.test(issueArg)) fail("usage: node site/new-entry.mjs --from-issue <number> [--id <id>]");
  const repo = String(config.site?.repo || "").replace(/^https:\/\/github\.com\//, "").replace(/\/+$/, "");
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) fail(`site/config.json site.repo is not a GitHub repository URL: ${config.site?.repo}`);
  let issue;
  try {
    issue = JSON.parse(execFileSync("gh", ["issue", "view", issueArg, "--repo", repo, "--json", "number,title,body,labels"], { encoding: "utf8" }));
  } catch (err) {
    fail(`could not read issue #${issueArg} with gh (is it installed and signed in?): ${String(err.stderr || err.message).trim()}`);
  }
  const form = parseIssueForm(issue.body);
  if (!form["Publisher URL"] || !form["Category"]) fail(`issue #${issue.number} is not a "New source" form (no Publisher URL or Category answer)`);
  category = form["Category"];
  id = flag("--id") || slugOf(form["Name"] || "");
  fromIssue = issue.number;
  const vocab = JSON.parse(fs.readFileSync(path.join(__dirname, "license-vocabulary.json"), "utf8"));
  const problem = newEntryProblem({ category, id, categories: Object.keys(config.categories || {}), taken: takenBy(id) });
  if (problem) fail(`${problem}${flag("--id") ? "" : " (pass --id <id> to choose another)"}`);
  const draft = entryFromIssue(template, form, { id, issue: issue.number, today, vocab });
  text = draft.text;
  warnings.push(...draft.warnings);
} else {
  [category, id] = process.argv.slice(2);
  const problem = newEntryProblem({ category, id, categories: Object.keys(config.categories || {}), taken: takenBy(id) });
  if (problem) fail(problem);
  text = newEntryText(template, { id, category, today });
}

const rel = `catalog/${category}/${id}.md`;
// A category can be in config.json before its folder exists.
fs.mkdirSync(path.join(CATALOG, category), { recursive: true });
fs.writeFileSync(path.join(ROOT, rel), text);

for (const w of warnings) console.log(`warning: ${w}`);
console.log(`wrote ${rel}${fromIssue ? ` (draft from #${fromIssue})` : ""}

Next:
  1. ${fromIssue ? "Read the live source yourself and check every field the reporter gave; fill" : "Fill every frontmatter field from the live source page (CONTRIBUTING.md,\n     \"Frontmatter rules\"), and replace the example body. Fill"} subcategories,
     formats and tags. Quote the licence in ## Evidence with today's date: (${today}).
  2. Add a row for [${id}.md](${id}.md) to catalog/${category}/README.md.
  3. node site/sync-counts.mjs   (README counts, badge, expectedEntryCount)
  4. npm test && npm run validate   (quick; every message names ${rel} by
     path; CI also runs the full build)`);

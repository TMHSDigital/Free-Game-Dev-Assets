#!/usr/bin/env node
/**
 * Writes the monthly "re-verify batch" issue: the live entries whose licence
 * was read longest ago (more than 150 days), oldest first, sized so the
 * catalog cycles in about ten months.
 *   node site/reverify-batch.mjs [--report <file.md>] [--size <n>]
 * Under GitHub Actions it also writes `count=<n>` to $GITHUB_OUTPUT.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { listEntryFiles } from "./lib/entry-files.mjs";
import { batchIssueMarkdown, pickBatch } from "./lib/reverify.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const REPO = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8")).site.repo;

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

const entries = [];
for (const full of listEntryFiles(CATALOG)) {
  const parsed = parseFrontmatter(fs.readFileSync(full, "utf8"));
  if (!parsed?.meta.id) continue;
  const { id, url, license, verified, status } = parsed.meta;
  entries.push({
    id: String(id),
    url: String(url || ""),
    license: String(license || "unknown"),
    verified: verified ? String(verified) : null,
    status: String(status || "needs-review"),
    rel: path.relative(ROOT, full).split(path.sep).join("/"),
  });
}

const sizeArg = arg("--size");
const size = sizeArg === undefined ? undefined : Number(sizeArg);
if (size !== undefined && (!Number.isInteger(size) || size < 1)) {
  console.error("usage: node site/reverify-batch.mjs [--report <file.md>] [--size <positive whole number>]");
  process.exit(2);
}

const batch = pickBatch(entries, { size });
const live = entries.filter((e) => e.status !== "deprecated").length;
const date = new Date().toISOString().slice(0, 10);
const report = batchIssueMarkdown({ batch, repo: REPO, date, total: live });

const reportPath = arg("--report");
if (reportPath) fs.writeFileSync(reportPath, report);
else process.stdout.write(report);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `count=${batch.length}\n`);
console.error(`${batch.length} of ${live} live entries picked for re-verification`);

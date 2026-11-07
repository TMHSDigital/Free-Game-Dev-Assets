#!/usr/bin/env node
/**
 * Writes the monthly "re-verify batch" issue: the live entries whose licence
 * was read longest ago, oldest first, as many as keep every entry inside the
 * 180-day fresh window (lib/reverify.mjs batchSizeNeeded).
 *   node site/reverify-batch.mjs [--report <file.md>] [--size <n>]
 * Under GitHub Actions it also writes `count=<n>` to $GITHUB_OUTPUT.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readCatalog, usableRecord } from "./lib/entry-files.mjs";
import { cliArgs } from "./lib/cli.mjs";
import { isListed } from "./lib/shared.mjs";
import { reviewQuestion } from "./lib/markdown.mjs";
import { normalizeEntry } from "./lib/entry-fields.mjs";
import { batchIssueMarkdown, pickBatch } from "./lib/reverify.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const REPO = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8")).site.repo;

const USAGE = "node site/reverify-batch.mjs [--report <file.md>] [--size <positive whole number>]";
const { values: flags } = cliArgs({ report: { type: "string" }, size: { type: "string" } }, USAGE);

const entries = [];
for (const r of readCatalog(CATALOG, { root: ROOT })) {
  if (!usableRecord(r)) continue;
  // The shared reading (entry-fields.mjs, #256): no status stays "", not needs-review.
  const { id, url, license, verified, status } = normalizeEntry(r.parsed.meta, r.rel);
  entries.push({ id, url, license, verified, status, rel: r.rel, review: status === "needs-review" ? reviewQuestion(r.parsed.body) : null });
}

const sizeArg = flags.size;
const size = sizeArg === undefined ? undefined : Number(sizeArg);
if (size !== undefined && (!Number.isInteger(size) || size < 1)) {
  console.error(`usage: ${USAGE}`);
  process.exit(2);
}

const batch = pickBatch(entries, { size });
const live = entries.filter(isListed).length;
const date = new Date().toISOString().slice(0, 10);
const openQuestions = entries.filter((e) => e.review);
const report = batchIssueMarkdown({ batch, repo: REPO, date, total: live, openQuestions });

const reportPath = flags.report;
if (reportPath) fs.writeFileSync(reportPath, report);
else process.stdout.write(report);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `count=${batch.length}\n`);
console.error(`${batch.length} of ${live} live entries picked for re-verification`);

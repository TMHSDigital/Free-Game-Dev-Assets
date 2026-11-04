#!/usr/bin/env node
/**
 * Fails when an entry's `added` date is later than the first commit of its
 * file, following renames (lib/added-dates.mjs): a category move must not
 * make an old entry look new in the feeds and the "new this month" list.
 *   node site/check-added.mjs
 * Needs the full git history; in a shallow clone it says so and exits 0.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { firstAddedFromLog, lateAddedDates } from "./lib/added-dates.mjs";
import { listEntryFiles } from "./lib/entry-files.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
  console.log("check-added: shallow clone, skipped (fetch the full history to run it)");
  process.exit(0);
}

const log = git(["log", "--reverse", "--format=%x00%as", "--name-status", "-M", "--diff-filter=AR", "--", "catalog"]);
const firstAdded = firstAddedFromLog(log);
const entries = listEntryFiles(path.join(ROOT, "catalog")).map((full) => ({
  rel: path.relative(ROOT, full).split(path.sep).join("/"),
  added: parseFrontmatter(fs.readFileSync(full, "utf8"))?.meta.added ?? null,
}));
const errors = lateAddedDates(entries, firstAdded);
if (errors.length) {
  console.error(`check-added failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`check-added ok: ${entries.length} entries, no added date later than its first commit`);

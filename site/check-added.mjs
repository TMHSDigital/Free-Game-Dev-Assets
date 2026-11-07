#!/usr/bin/env node
/**
 * Fails when an entry's `added` date is later than the first commit of its
 * file, following renames (lib/added-dates.mjs): a category move must not
 * make an old entry look new in the feeds and the "new this month" list.
 *   node site/check-added.mjs
 * Needs the full git history; in a shallow clone it says so and exits 0.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { firstAddedFromLog, lateAddedDates } from "./lib/added-dates.mjs";
import { readCatalog } from "./lib/entry-files.mjs";
import { cliArgs } from "./lib/cli.mjs";
import { normalizeEntry } from "./lib/entry-fields.mjs";

// No flags: a mistyped one fails instead of being ignored.
cliArgs({}, "node site/check-added.mjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
  console.log("check-added: shallow clone, skipped (fetch the full history to run it)");
  process.exit(0);
}

// %at, not %as: the author's local date is a day behind UTC in the evening
// west of UTC, while `added` is written as a UTC date (#247).
const log = git(["log", "--reverse", "--format=%x00%at", "--name-status", "-M", "--diff-filter=AR", "--", "catalog"]);
const firstAdded = firstAddedFromLog(log);
// Every entry file, parsed or not: a broken one still has an added date to check.
const entries = readCatalog(path.join(ROOT, "catalog"), { root: ROOT }).map((r) => ({
  rel: r.rel,
  added: r.parsed ? normalizeEntry(r.parsed.meta, r.rel).added : null,
}));
const errors = lateAddedDates(entries, firstAdded);
if (errors.length) {
  console.error(`check-added failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`check-added ok: ${entries.length} entries, no added date later than its first commit`);

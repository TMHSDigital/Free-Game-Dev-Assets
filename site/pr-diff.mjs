#!/usr/bin/env node
/**
 * Summarises the licence-field changes between a base commit and HEAD:
 *
 *   node site/pr-diff.mjs --base <sha> [--out <file>]
 *
 * For every catalog entry the range adds, removes or modifies, it lists each
 * changed licence field (lib/licence-diff.mjs) beside the entry's newest
 * Evidence line, as Markdown. CI appends it to the pull request's step
 * summary ($GITHUB_STEP_SUMMARY). Informational: it never fails a pull
 * request over content, only over a missing base commit or bad arguments.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { changedEntries, diffRows, licenceDiffMarkdown } from "./lib/licence-diff.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/** The --base value, or null when it is missing or not a commit sha. */
export function baseArg(argv) {
  const i = argv.indexOf("--base");
  const base = i === -1 ? null : argv[i + 1] || null;
  return base && /^[0-9a-f]{7,40}$/i.test(base) ? base : null;
}

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1] || null;
}

const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

function main() {
  const base = baseArg(process.argv);
  if (!base) {
    console.error("usage: node site/pr-diff.mjs --base <commit sha> [--out <file>]");
    process.exit(2);
  }
  const out = arg("--out");
  // Renames are reported as a removal and an addition, which shows both ids.
  const changes = changedEntries(git(["diff", "--no-renames", "--name-status", "-z", base, "HEAD", "--", "catalog/"]));
  const rows = diffRows(changes, {
    before: (file) => git(["show", `${base}:${file}`]),
    after: (file) => fs.readFileSync(path.join(ROOT, file), "utf8"),
  });
  const md = licenceDiffMarkdown(rows);
  if (out) fs.appendFileSync(out, `${md}\n`);
  else process.stdout.write(md);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

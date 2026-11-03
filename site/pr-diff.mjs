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
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { licenceChanges, licenceDiffMarkdown, newestEvidenceLine } from "./lib/licence-diff.mjs";
import { NON_ENTRY_MD } from "./lib/entry-files.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1] || null;
}

const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

function parse(text) {
  if (text === null) return { meta: null, body: "" };
  const parsed = parseFrontmatter(text);
  return parsed ? { meta: parsed.meta, body: parsed.body } : { meta: null, body: "" };
}

function main() {
  const base = arg("--base");
  if (!base || !/^[0-9a-f]{7,40}$/i.test(base)) {
    console.error("usage: node site/pr-diff.mjs --base <commit sha> [--out <file>]");
    process.exit(2);
  }
  const out = arg("--out");
  // Renames are reported as a removal and an addition, which shows both ids.
  const changes = git(["diff", "--no-renames", "--name-status", "-z", base, "HEAD", "--", "catalog/"]).split("\0").filter(Boolean);
  const rows = [];
  for (let i = 0; i + 1 < changes.length; i += 2) {
    const status = changes[i];
    const file = changes[i + 1];
    if (!file.endsWith(".md") || NON_ENTRY_MD.has(path.posix.basename(file)) || file.split("/").some((p) => p.startsWith("_") || p.startsWith("."))) continue;
    const before = status === "A" ? null : git(["show", `${base}:${file}`]);
    const after = status === "D" ? null : fs.readFileSync(path.join(ROOT, file), "utf8");
    const a = parse(before);
    const b = parse(after);
    rows.push({
      file,
      change: status === "A" ? "added" : status === "D" ? "removed" : "modified",
      fields: licenceChanges(a.meta, b.meta),
      evidence: newestEvidenceLine(b.body || a.body),
    });
  }
  const md = licenceDiffMarkdown(rows);
  if (out) fs.appendFileSync(out, `${md}\n`);
  else process.stdout.write(md);
}

main();

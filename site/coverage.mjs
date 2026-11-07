#!/usr/bin/env node
/**
 * Which site/ functions the test suites never call. Runs both suites under
 * NODE_V8_COVERAGE (built into Node, no dependency), then prints, per file,
 * the share of functions that ran and the uncovered ones with their lines.
 *   node site/coverage.mjs [--all]
 * By default only files with an uncovered function are listed; --all lists
 * every file. Informational: it never fails (exit 1 only if a suite fails).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { cliArgs } from "./lib/cli.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SUITES = ["site/checks.test.mjs", "site/lib/lib.test.mjs"];

/**
 * V8 script coverage => `{ total, uncovered: [{ name, line }] }` per url.
 * A function counts as covered when its own range ran at least once in any
 * of the runs (a module loaded by both suites appears once per run); the
 * module's top-level pseudo-function (empty name at offset 0) is skipped.
 */
export function functionCoverage(scripts, sourceOf) {
  const byUrl = new Map(); // url => Map(startOffset => { name, ran })
  for (const script of scripts) {
    if (!byUrl.has(script.url)) byUrl.set(script.url, new Map());
    const fns = byUrl.get(script.url);
    for (const fn of script.functions) {
      const range = fn.ranges[0];
      if (!range || (range.startOffset === 0 && !fn.functionName)) continue;
      const seen = fns.get(range.startOffset) || { name: fn.functionName || "(anonymous)", ran: false };
      seen.ran ||= range.count > 0;
      fns.set(range.startOffset, seen);
    }
  }
  const out = new Map();
  for (const [url, fns] of byUrl) {
    const src = sourceOf(url);
    if (src === null) continue;
    const lineAt = (offset) => src.slice(0, offset).split("\n").length;
    const uncovered = [...fns]
      .filter(([, f]) => !f.ran)
      .sort(([a], [b]) => a - b)
      .map(([offset, f]) => ({ name: f.name, line: lineAt(offset) }));
    out.set(url, { total: fns.size, uncovered });
  }
  return out;
}

function main() {
  const { values } = cliArgs({ all: { type: "boolean" } }, "node site/coverage.mjs [--all]");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fgda-coverage-"));
  try {
    for (const suite of SUITES) {
      execFileSync(process.execPath, [suite], { cwd: ROOT, stdio: ["ignore", "ignore", "inherit"], env: { ...process.env, NODE_V8_COVERAGE: dir } });
    }
    const siteUrl = pathToFileURL(__dirname).href + "/";
    const scripts = [];
    for (const name of fs.readdirSync(dir)) {
      for (const s of JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")).result) {
        if (s.url.startsWith(siteUrl) && !/\.test\.mjs$/.test(s.url) && !s.url.includes("/dist/")) scripts.push(s);
      }
    }
    const sourceOf = (url) => {
      try {
        return fs.readFileSync(fileURLToPath(url), "utf8");
      } catch {
        return null;
      }
    };
    let total = 0;
    let missed = 0;
    for (const [url, cov] of [...functionCoverage(scripts, sourceOf)].sort(([a], [b]) => a.localeCompare(b))) {
      total += cov.total;
      missed += cov.uncovered.length;
      if (!cov.uncovered.length && !values.all) continue;
      const rel = path.relative(ROOT, fileURLToPath(url)).split(path.sep).join("/");
      const pct = cov.total ? Math.round((100 * (cov.total - cov.uncovered.length)) / cov.total) : 100;
      console.log(`${rel}  ${pct}% of ${cov.total} functions`);
      for (const u of cov.uncovered) console.log(`    line ${u.line}  ${u.name}`);
    }
    console.log(`coverage: ${total - missed} of ${total} functions in loaded site/ modules ran under the tests (scripts never imported by a test are not listed)`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

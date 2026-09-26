#!/usr/bin/env node
/**
 * Fetches every entry's `url` and reports the ones that need a person:
 *   node site/check-links.mjs [--report <file.md>] [--stale-days 365]
 *
 * - dead: 404/410, 5xx, DNS failure or timeout
 * - moved: the final URL is on another domain, or another GitHub repository
 * - stale: `verified` is older than --stale-days (365 by default)
 * - blocked: 401/403/429, which is usually a site refusing robots rather
 *   than a dead link; listed for a manual check, never counted as a problem
 * - maintenance: a github.com source whose repository is archived or has had
 *   no push in three years while its `maintenance` field does not say so, or
 *   the other way round. Uses the GitHub API; set GITHUB_TOKEN to lift the
 *   60-requests-an-hour anonymous limit.
 *
 * Writes a Markdown report (stdout, or --report) and, under GitHub Actions,
 * `problems=<n>` to $GITHUB_OUTPUT so the workflow can open or update one
 * issue. It never changes an entry: a moved or dead source still needs its
 * licence re-read before the entry is edited.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { maintenanceFromRepo } from "./checks.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const REPO = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8")).site.repo;
const CONCURRENCY = 8;
const TIMEOUT_MS = 20000;
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 " +
  "(+https://github.com/TMHSDigital/Free-Game-Dev-Assets link check)";

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
}

function loadEntries() {
  const out = [];
  const walk = (dir) => {
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) walk(full);
      else if (d.name.endsWith(".md") && d.name !== "README.md" && d.name !== "TEMPLATE.md") {
        const parsed = parseFrontmatter(fs.readFileSync(full, "utf8"));
        if (!parsed?.meta.url) continue;
        const { id, url, verified, status, maintenance } = parsed.meta;
        out.push({ id: String(id), url: String(url), verified: verified ? String(verified) : null, status: String(status), maintenance: maintenance ? String(maintenance) : null, rel: path.relative(ROOT, full).split(path.sep).join("/") });
      }
    }
  };
  walk(CATALOG);
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

const rootDomain = (host) => host.replace(/^www\./, "").split(".").slice(-2).join(".");
// A transferred GitHub repository redirects within github.com.
const repoOf = (url) => new URL(url).pathname.split("/").slice(1, 3).join("/").toLowerCase();

async function check(entry) {
  const opts = { redirect: "follow", headers: { "user-agent": UA, accept: "text/html,*/*;q=0.8" } };
  try {
    const res = await fetch(entry.url, { ...opts, signal: AbortSignal.timeout(TIMEOUT_MS) });
    res.body?.cancel().catch(() => {});
    const from = rootDomain(new URL(entry.url).hostname);
    const to = rootDomain(new URL(res.url).hostname);
    if ([401, 403, 429].includes(res.status)) return { kind: "blocked", detail: `HTTP ${res.status}` };
    if (res.status >= 400) return { kind: "dead", detail: `HTTP ${res.status}` };
    if (from !== to) return { kind: "moved", detail: `now ${res.url}` };
    if (from === "github.com" && repoOf(entry.url) !== repoOf(res.url)) return { kind: "moved", detail: `repository now ${res.url}` };
    return { kind: "ok" };
  } catch (err) {
    const cause = err.cause?.code || err.name || "error";
    return { kind: "dead", detail: cause === "TimeoutError" ? `no answer in ${TIMEOUT_MS / 1000}s` : cause };
  }
}

async function run(entries) {
  const results = new Array(entries.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < entries.length) {
        const i = next++;
        let r = await check(entries[i]);
        // One retry for anything that did not answer cleanly.
        if (r.kind === "dead") r = await check(entries[i]);
        results[i] = r;
      }
    })
  );
  return results;
}

/**
 * GitHub sources whose repository state and `maintenance` field disagree.
 * One API call per github.com repository, one at a time: a few dozen calls,
 * well inside the limit with a token. An API failure is listed, not guessed.
 */
async function checkMaintenance(entries) {
  const headers = { "user-agent": UA, accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const out = [];
  for (const e of entries) {
    let host;
    try {
      host = new URL(e.url).hostname;
    } catch {
      continue;
    }
    if (host !== "github.com") continue;
    const repo = repoOf(e.url);
    if (!repo.includes("/")) continue;
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) {
        out.push({ ...e, detail: `GitHub API HTTP ${res.status} for ${repo}` });
        if (res.status === 403 || res.status === 429) break; // rate limited: the rest would fail too
        continue;
      }
      const data = await res.json();
      const want = maintenanceFromRepo(data);
      if (want !== e.maintenance) {
        const state = data.archived ? "archived" : `last push ${String(data.pushed_at).slice(0, 10)}`;
        out.push({ ...e, detail: `${repo} is ${state}; maintenance is ${e.maintenance || "unset"}, expected ${want || "unset"}` });
      }
    } catch (err) {
      out.push({ ...e, detail: `GitHub API ${err.name || "error"} for ${repo}` });
    }
  }
  return out;
}

const staleDays = Number(arg("--stale-days", "365"));
const entries = loadEntries().filter((e) => e.status !== "deprecated");
const results = await run(entries);
const maintenance = await checkMaintenance(entries);
const cutoff = new Date(Date.now() - staleDays * 86400000).toISOString().slice(0, 10);
const rows = entries.map((e, i) => ({ ...e, ...results[i] }));
const pick = (kind) => rows.filter((r) => r.kind === kind);
const stale = entries.filter((e) => e.verified && e.verified < cutoff);
const line = (r) => `- [ ] [\`${r.id}\`](${REPO}/blob/main/${r.rel}): ${r.url}${r.detail ? ` (${r.detail})` : ""}`;

const dead = pick("dead");
const moved = pick("moved");
const blocked = pick("blocked");
const problems = dead.length + moved.length + stale.length + maintenance.length;
const date = new Date().toISOString().slice(0, 10);
const report = [
  `Link check of ${entries.length} active and needs-review entries, run ${date}.`,
  "",
  "Re-read the licence before changing an entry: a moved or rebuilt source can come back under different terms.",
  "",
  `### Dead (${dead.length})`,
  "",
  ...(dead.length ? dead.map(line) : ["None."]),
  "",
  `### Moved to another domain or repository (${moved.length})`,
  "",
  ...(moved.length ? moved.map(line) : ["None."]),
  "",
  `### Verified more than ${staleDays} days ago (${stale.length})`,
  "",
  ...(stale.length ? stale.map((e) => `- [ ] [\`${e.id}\`](${REPO}/blob/main/${e.rel}): verified ${e.verified}`) : ["None."]),
  "",
  `### GitHub repository state differs from \`maintenance\` (${maintenance.length})`,
  "",
  ...(maintenance.length ? maintenance.map(line) : ["None."]),
  "",
  `<details><summary>Refused the checker (${blocked.length}): usually bot blocking, check by hand</summary>`,
  "",
  ...(blocked.length ? blocked.map(line) : ["None."]),
  "",
  "</details>",
  "",
].join("\n");

const reportPath = arg("--report", null);
if (reportPath) fs.writeFileSync(reportPath, report);
else process.stdout.write(report);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `problems=${problems}\n`);
console.error(`${entries.length} checked: ${dead.length} dead, ${moved.length} moved, ${stale.length} stale, ${maintenance.length} maintenance, ${blocked.length} blocked`);

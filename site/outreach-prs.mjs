#!/usr/bin/env node
/**
 * Checks the catalog's pull requests to other repositories (#118) and reports
 * on their tracking issues here: new reviews and comments, merges, closes.
 *
 *   GITHUB_TOKEN=... node site/outreach-prs.mjs [--dry-run]
 *
 * The tracked pull requests are the open issues labelled `outreach` whose
 * title ends with the reference, e.g. "Outreach: magictools
 * (ellisonleao/magictools#538)". Run daily by .github/workflows/outreach-prs.yml.
 * It never writes to the other repositories.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cliArgs } from "./lib/cli.mjs";
import { parsePrRef, plan, readState, writeState } from "./lib/outreach.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const REPO = new URL(CONFIG.site.repo).pathname.replace(/^\/+|\/+$/g, "");
const SELF = REPO.split("/")[0];
const { values: flags } = cliArgs({ "dry-run": { type: "boolean" } }, "node site/outreach-prs.mjs [--dry-run]");
const DRY = Boolean(flags["dry-run"]);
const headers = {
  accept: "application/vnd.github+json",
  "user-agent": "free-game-dev-assets-outreach",
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function api(pathname, init = {}) {
  const res = await fetch(`https://api.github.com/${pathname}`, { ...init, headers: { ...headers, ...(init.headers || {}) }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${init.method || "GET"} ${pathname}: HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

async function activityOf({ owner, repo, number }) {
  const [reviews, comments, reviewComments] = await Promise.all([
    api(`repos/${owner}/${repo}/pulls/${number}/reviews?per_page=100`),
    api(`repos/${owner}/${repo}/issues/${number}/comments?per_page=100`),
    api(`repos/${owner}/${repo}/pulls/${number}/comments?per_page=100`),
  ]);
  return [
    ...reviews.filter((r) => r.state !== "PENDING").map((r) => ({ id: r.id, user: r.user?.login, kind: "review", state: r.state, url: r.html_url })),
    ...comments.map((c) => ({ id: c.id, user: c.user?.login, kind: "comment", url: c.html_url })),
    ...reviewComments.map((c) => ({ id: c.id, user: c.user?.login, kind: "review-comment", url: c.html_url })),
  ];
}

const issues = await api(`repos/${REPO}/issues?labels=outreach&state=open&per_page=100`);
let changed = 0;
for (const issue of issues) {
  const ref = (issue.title.match(/\(([\w.-]+\/[\w.-]+#\d+)\)\s*$/) || [])[1];
  const pr = ref && parsePrRef(ref);
  if (!pr) {
    console.error(`#${issue.number}: no "(owner/repo#N)" at the end of the title; skipped`);
    continue;
  }
  const data = await api(`repos/${pr.owner}/${pr.repo}/pulls/${pr.number}`);
  const step = plan(ref, data, await activityOf(pr), readState(issue.body), SELF);
  const body = writeState(issue.body, step.state);
  console.log(`#${issue.number} ${ref}: ${step.state.state}${step.comment ? ", reporting" : ""}${step.close ? `, closing (${step.close})` : ""}`);
  if (DRY) {
    if (step.comment) console.log(step.comment.replace(/^/gm, "    "));
    continue;
  }
  if (body !== issue.body) await api(`repos/${REPO}/issues/${issue.number}`, { method: "PATCH", body: JSON.stringify({ body }) });
  if (step.comment) {
    await api(`repos/${REPO}/issues/${issue.number}/comments`, { method: "POST", body: JSON.stringify({ body: step.comment }) });
    changed++;
  }
  if (step.close) await api(`repos/${REPO}/issues/${issue.number}`, { method: "PATCH", body: JSON.stringify({ state: "closed", state_reason: step.close }) });
}
console.log(`${issues.length} tracked, ${changed} reported${DRY ? " (dry run)" : ""}`);

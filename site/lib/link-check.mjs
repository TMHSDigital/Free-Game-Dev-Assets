/**
 * The pure parts of site/check-links.mjs: how a response is classified,
 * how a URL is written into the report issue, how the run is configured and
 * how the GitHub maintenance check separates findings from outages.
 * Kept here so they are tested.
 */

import { maintenanceFromRepo } from "../checks.mjs";

/**
 * Two-label public suffixes the catalog's sources sit under. A plain "last two
 * labels" rule would read every *.co.uk host as the same site.
 */
const MULTI_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk",
  "com.au", "net.au", "org.au",
  "co.jp", "co.nz", "co.kr", "com.br", "com.cn",
  "github.io", "gitlab.io", "itch.io", "netlify.app", "pages.dev", "vercel.app",
]);

/** The registrable site of a hostname: example.co.uk, kenney.nl, user.github.io. */
export function siteOf(hostname) {
  const labels = hostname.toLowerCase().replace(/^www\./, "").split(".");
  const take = MULTI_SUFFIXES.has(labels.slice(-2).join(".")) ? 3 : 2;
  return labels.slice(-take).join(".");
}

/** owner/repo of a github.com URL, lowercased. A transferred repository redirects within github.com. */
export const repoOf = (url) => new URL(url).pathname.split("/").slice(1, 3).join("/").toLowerCase();

/** What a finished request says about an entry. */
export function classify(entryUrl, status, finalUrl) {
  if ([401, 403, 429].includes(status)) return { kind: "blocked", detail: `HTTP ${status}` };
  if (status >= 400) return { kind: "dead", detail: `HTTP ${status}` };
  const from = siteOf(new URL(entryUrl).hostname);
  const to = siteOf(new URL(finalUrl).hostname);
  if (from !== to) return { kind: "moved", detail: `now ${reportUrl(finalUrl)}` };
  if (from === "github.com" && repoOf(entryUrl) !== repoOf(finalUrl)) {
    return { kind: "moved", detail: `repository now ${reportUrl(finalUrl)}` };
  }
  return { kind: "ok" };
}

/**
 * A URL as inert Markdown for the report issue: a code span, so a crafted URL
 * cannot add links, images or @mentions to the issue.
 */
export function reportUrl(url) {
  return `\`${String(url).replaceAll("`", "%60")}\``;
}

/**
 * `--stale-days` for site/check-links.mjs: a whole number of days, >= 0.
 * A flag given as the last argument arrives as `undefined` and a non-number
 * as NaN; either used to slip through and the run died later, in
 * `new Date(NaN).toISOString()` — after every fetch had already run (#82).
 */
export function parseStaleDays(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`--stale-days wants a whole number of days >= 0, got ${JSON.stringify(String(raw))}`);
  }
  return n;
}

/**
 * GitHub sources whose repository state and `maintenance` field disagree,
 * plus the ones that could not be checked at all.
 *
 * An API failure — a 5xx, a timeout or a rate limit — is a *skipped* row,
 * never a catalog problem: guessing from a transient error used to open or
 * update the correction issue over an outage. After a 403/429 the remaining
 * repositories are marked skipped with the reason instead of silently
 * disappearing from the report (#82).
 *
 * `fetchImpl` is injectable so the failure classification is testable
 * without the network.
 */
export async function checkMaintenance(entries, opts = {}) {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const timeoutMs = opts.timeoutMs ?? 20000;
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": opts.userAgent ?? "Free-Game-Dev-Assets link check",
  };
  const token = opts.token ?? process.env.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;

  const pending = [];
  for (const e of entries) {
    let host;
    try {
      host = new URL(e.url).hostname;
    } catch {
      continue;
    }
    if (host !== "github.com") continue;
    if (!repoOf(e.url).includes("/")) continue;
    pending.push(e);
  }

  const differs = [];
  const skipped = [];
  for (let i = 0; i < pending.length; i++) {
    const e = pending[i];
    const repo = repoOf(e.url);
    try {
      const res = await fetchImpl(`https://api.github.com/repos/${repo}`, { headers, signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) {
        skipped.push({ ...e, detail: `GitHub API HTTP ${res.status} for ${repo}` });
        if (res.status === 403 || res.status === 429) {
          // Rate limited: the rest would fail the same way — say so instead of dropping them.
          for (const rest of pending.slice(i + 1)) {
            skipped.push({ ...rest, detail: `not checked: stopped after GitHub API HTTP ${res.status}` });
          }
          break;
        }
        continue;
      }
      const data = await res.json();
      const want = maintenanceFromRepo(data);
      if (want !== e.maintenance) {
        const state = data.archived ? "archived" : `last push ${String(data.pushed_at).slice(0, 10)}`;
        differs.push({ ...e, detail: `${repo} is ${state}; maintenance is ${e.maintenance || "unset"}, expected ${want || "unset"}` });
      }
    } catch (err) {
      skipped.push({ ...e, detail: `GitHub API ${err.name || "error"} for ${repo}` });
    }
  }
  return { differs, skipped };
}

/**
 * The pure parts of site/check-links.mjs: how a response is classified and
 * how a URL is written into the report issue. Kept here so they are tested.
 */

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

export const USAGE = "usage: node site/check-links.mjs [--report <file.md>] [--stale-days <whole number of days, 365 by default>]";

/**
 * The `--stale-days` value from argv: `{ days }` or `{ error }`. Checked
 * before any fetch, so a typo cannot throw after twenty minutes of requests.
 */
export function staleDaysFrom(argv, fallback = 365) {
  const i = argv.indexOf("--stale-days");
  if (i === -1) return { days: fallback };
  const raw = argv[i + 1];
  const days = Number(raw);
  if (raw === undefined || raw.startsWith("--") || !/^\d+$/.test(raw.trim()) || !Number.isSafeInteger(days)) {
    return { error: `--stale-days needs a whole number of days, got ${raw === undefined ? "nothing" : JSON.stringify(raw)}\n${USAGE}` };
  }
  return { days };
}

/**
 * GitHub sources whose repository state and `maintenance` field disagree.
 * `fetchRepo(owner/repo)` resolves to `{ ok, status, data }` or throws; one
 * call per repository, one at a time. An API failure is never a catalog
 * problem: it goes to `skipped`, and after a rate limit (403/429) so does
 * every repository left unchecked, each saying why.
 */
export async function checkMaintenanceRepos(entries, fetchRepo, expected) {
  const mismatches = [];
  const skipped = [];
  const repos = [];
  for (const e of entries) {
    let host;
    try {
      host = new URL(e.url).hostname;
    } catch {
      continue;
    }
    if (host !== "github.com") continue;
    const repo = repoOf(e.url);
    if (repo.includes("/")) repos.push({ entry: e, repo });
  }
  for (let i = 0; i < repos.length; i += 1) {
    const { entry, repo } = repos[i];
    let res;
    try {
      res = await fetchRepo(repo);
    } catch (err) {
      skipped.push({ ...entry, detail: `GitHub API ${err?.name || "error"} for ${repo}` });
      continue;
    }
    if (!res.ok) {
      skipped.push({ ...entry, detail: `GitHub API HTTP ${res.status} for ${repo}` });
      if (res.status === 403 || res.status === 429) {
        for (const rest of repos.slice(i + 1)) {
          skipped.push({ ...rest.entry, detail: `not checked: GitHub API rate limit (HTTP ${res.status}) hit on ${repo}` });
        }
        break;
      }
      continue;
    }
    const want = expected(res.data);
    if (want !== entry.maintenance) {
      const state = res.data.archived ? "archived" : `last push ${String(res.data.pushed_at).slice(0, 10)}`;
      mismatches.push({ ...entry, detail: `${repo} is ${state}; maintenance is ${entry.maintenance || "unset"}, expected ${want || "unset"}` });
    }
  }
  return { mismatches, skipped };
}

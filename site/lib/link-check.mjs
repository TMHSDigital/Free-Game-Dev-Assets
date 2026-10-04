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

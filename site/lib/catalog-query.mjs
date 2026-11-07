/**
 * Queries over data.json for scripts and assistants (#115): the CLI
 * (site/cli/fgda.mjs) and the MCP server (site/cli/mcp.mjs) are thin
 * wrappers over these. Pure; the same search and filter code as the site.
 */
import { ENGINES, queryTests, scoreFields, searchFields, SORTS, worksInEngine } from "./search.mjs";
import { isListed } from "./shared.mjs";

/** The fields an answer carries: enough to decide, with the page to read. */
export function assetSummary(e, siteUrl = "") {
  const base = String(siteUrl).replace(/\/+$/, "");
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    license: e.license,
    ...(e.license_spdx ? { license_spdx: e.license_spdx } : {}),
    commercial: e.commercial,
    attribution_required: e.attribution_required,
    ...(e.attribution_string ? { attribution_string: e.attribution_string } : {}),
    ...(e.engine_lock ? { engine_lock: e.engine_lock } : {}),
    ...(e.limits ? { limits: e.limits } : {}),
    status: e.status,
    ...(e.review ? { open_question: e.review } : {}),
    verified: e.verified,
    url: e.url,
    page: base ? `${base}/${e.page}` : e.page,
  };
}

/**
 * Listed entries matching the words and filters, best first:
 * { q, category, license (a licence value or family), commercial (true:
 * commercial OK or per-file), noAttribution, engine, format, limit }.
 */
export function searchAssets(data, { q = "", category, license, commercial, noAttribution, engine, format, limit = 20 } = {}) {
  const tests = queryTests(q);
  const lic = license ? String(license).toLowerCase() : null;
  const fmt = format ? String(format).toLowerCase() : null;
  const hits = [];
  for (const e of data.entries || []) {
    if (!isListed(e)) continue;
    if (category && e.category !== category) continue;
    if (lic && String(e.license).toLowerCase() !== lic && String(e.licenseFamily).toLowerCase() !== lic && String(e.license_spdx || "").toLowerCase() !== lic) continue;
    if (commercial && e.commercial !== true && e.commercial !== "varies") continue;
    if (noAttribution && e.attribution_required !== false) continue;
    if (engine && !worksInEngine(e, engine)) continue;
    if (fmt && !(e.formats || []).some((f) => String(f).toLowerCase() === fmt)) continue;
    const score = scoreFields(searchFields(e), tests);
    if (score) hits.push({ e, score });
  }
  hits.sort((a, b) => b.score - a.score || SORTS.name(a.e, b.e));
  return hits.slice(0, Math.max(1, Number(limit) || 20)).map((h) => assetSummary(h.e, data.site?.siteUrl));
}

/** One entry by id, or null. */
export function getAsset(data, id) {
  const e = (data.entries || []).find((x) => x.id === id);
  return e ? assetSummary(e, data.site?.siteUrl) : null;
}

/**
 * Whether an entry fits a use: { ok, problems, owes }. `commercial: true`
 * asks for a commercial game; `engine` names the engine it ships in.
 * `owes` is the credit line or the notice to keep; `problems` are reasons
 * not to rely on it without reading the source.
 */
export function checkLicense(data, id, { commercial = true, engine } = {}) {
  const e = (data.entries || []).find((x) => x.id === id);
  if (!e) return { ok: false, problems: [`no entry "${id}" in the catalog`], owes: [] };
  const problems = [];
  if (commercial && e.commercial === false) problems.push("not for commercial use");
  if (commercial && e.commercial === "unknown") problems.push("commercial use is not established");
  if (e.commercial === "varies") problems.push("terms vary per file: check each file you take");
  if (engine && ENGINES[engine] && !worksInEngine(e, engine)) problems.push(e.engine_lock ? `licensed for ${e.engine_lock} only` : `made for another engine than ${engine}`);
  if (e.status === "deprecated") problems.push("deprecated in the catalog");
  if (e.status === "needs-review") problems.push(`needs review${e.review ? `: ${e.review}` : ""}`);
  if (e.attribution_required === "unknown") problems.push("the credit requirement is not established");
  const owes = [];
  if (e.attribution_required === true) owes.push(e.attribution_string ? `credit: ${e.attribution_string}` : "a credit line (see the entry)");
  if (e.attributionClass === "notice") owes.push("keep the licence and copyright notice with the files");
  return { ok: problems.length === 0, problems, owes, asset: assetSummary(e, data.site?.siteUrl) };
}

/** The starter stacks: id, title and page. */
export function listStacks(data) {
  const base = String(data.site?.siteUrl || "").replace(/\/+$/, "");
  return (data.stacks || []).map((s) => ({ id: s.id, title: s.title, page: `${base}/stack/${s.id}/` }));
}

/** The published data.json, unless a local file or URL is given. */
export const DATA_URL = "https://tmhsdigital.github.io/Free-Game-Dev-Assets/data.json";

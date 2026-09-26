/**
 * Catalog checks added by the 2026-09-22 review (batch B).
 *
 * Each function is pure and returns an array of error strings, so
 * site/checks.test.mjs can drive every one against a known-bad fixture
 * without touching the real catalog. validate.mjs wires them into the run.
 */

import path from "node:path";
import { parseStack, pickPath, StackError } from "./lib/stacks.mjs";
import { isRealDate } from "./lib/shared.mjs";

const DATE_ANY_RE = /\d{4}-\d{2}-\d{2}/g;

/** Generic hosts and distributors that are never a rights holder. */
export const GENERIC_HOSTS = new Set([
  "github",
  "github.com",
  "gitlab",
  "gitlab.com",
  "hugging face",
  "huggingface",
  "huggingface.co",
  "itch.io",
  "itch",
  "sourceforge",
  "sourceforge.net",
  "google drive",
  "dropbox",
  "archive.org",
  "internet archive",
  "opengameart",
  "opengameart.org",
  "google fonts",
  "fonts.google.com",
]);

/** Domains that host many rights holders, so publishers there may differ. */
const MULTI_PUBLISHER_DOMAINS = new Set([
  "github.com",
  "gitlab.com",
  "opengameart.org",
  "archive.org",
  "fonts.google.com",
]);

function empty(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

/** The `## Evidence` section of an entry body, or null. */
export function evidenceSection(body) {
  const idx = body.search(/^## Evidence\s*$/m);
  if (idx === -1) return null;
  const rest = body.slice(idx);
  const next = rest.search(/\n## (?!Evidence)/);
  return next === -1 ? rest : rest.slice(0, next);
}

/* ------------------------------------------------------------------ V1 */
/** `license` must be a value the vocabulary documents. */
export function checkLicenseVocabulary(rel, meta, vocab) {
  const errors = [];
  if (empty(meta.license)) return errors;
  const license = String(meta.license);
  if (!Object.prototype.hasOwnProperty.call(vocab.licenses, license)) {
    errors.push(
      `${rel} license "${license}" is not in site/license-vocabulary.json (add it there first, with its SPDX mapping and attribution expectation)`
    );
  }
  return errors;
}

/* --------------------------------------------------------------- V2/V3 */
/**
 * `license_spdx` must agree with what `license` implies:
 *   - a license with one SPDX id must carry it (V3, fillable but absent)
 *   - and must carry that exact id (V2, mismatch)
 *   - a license with no SPDX id must not carry one (V2, invented)
 *   - an ambiguous license must not be resolved by guessing (V2)
 */
export function checkSpdxConsistency(rel, meta, vocab, spdxAllowed) {
  const errors = [];
  if (empty(meta.license)) return errors;
  const license = String(meta.license);
  const spec = vocab.licenses[license];
  if (!spec) return errors; // V1 already reported it
  const recorded = empty(meta.license_spdx) ? null : String(meta.license_spdx);

  if (spec.spdx) {
    if (recorded === null) {
      errors.push(
        `${rel} license "${license}" maps to SPDX "${spec.spdx}" but license_spdx is absent`
      );
    } else if (recorded !== spec.spdx) {
      errors.push(
        `${rel} license "${license}" maps to SPDX "${spec.spdx}" but license_spdx is "${recorded}"`
      );
    } else if (spdxAllowed && !spdxAllowed.has(spec.spdx)) {
      errors.push(
        `${rel} license_spdx "${spec.spdx}" is not in site/spdx-allowed.json`
      );
    }
    return errors;
  }

  if (recorded !== null) {
    const why = spec.spdx_ambiguous
      ? ` ${spec.spdx_ambiguous}`
      : " That license value has no SPDX identifier.";
    errors.push(
      `${rel} license "${license}" must not carry license_spdx "${recorded}".${why}`
    );
  }
  return errors;
}

/* ------------------------------------------------------------------ V4 */
/**
 * A license whose attribution is `required` cannot silently set
 * `attribution_required: false`. Either the flag is true and an
 * attribution_string exists (validate.mjs enforces that pair), or the body
 * states the publisher's waiver on a marker line.
 */
export function checkAttributionConsistency(rel, meta, body, vocab) {
  const errors = [];
  if (empty(meta.license)) return errors;
  const spec = vocab.licenses[String(meta.license)];
  if (!spec || spec.attribution !== "required") return errors;
  if (meta.attribution_required !== false) return errors;
  if (body.includes(vocab.attribution_waiver_marker)) return errors;
  errors.push(
    `${rel} license "${meta.license}" requires attribution but attribution_required is false, ` +
      `and the body has no "${vocab.attribution_waiver_marker}" line explaining the publisher's waiver`
  );
  return errors;
}

/* ------------------------------------------------------------------ V8 */
/**
 * The check that defends the repo's central promise: a `verified` date may
 * never be newer than the evidence it claims to rest on. Bumping `verified`
 * without adding a dated Evidence line is exactly the failure this catches.
 * Also rejects impossible or future Evidence dates, and (V10) an Evidence section
 * that carries no date at all, whatever the entry's status.
 */
export function checkEvidenceDates(rel, meta, body, today) {
  const errors = [];
  const ev = evidenceSection(body);
  if (!ev) return errors; // presence is validate.mjs's job, and only for active
  const dates = [...ev.matchAll(DATE_ANY_RE)].map((m) => m[0]).sort();
  if (!dates.length) {
    errors.push(`${rel} ## Evidence section carries no YYYY-MM-DD date`);
    return errors;
  }
  const validDates = dates.filter((date) => {
    if (isRealDate(date)) return true;
    errors.push(`${rel} Evidence date ${date} is not a real YYYY-MM-DD date`);
    return false;
  });
  if (!validDates.length) return errors;
  const newest = validDates[validDates.length - 1];
  if (newest > today) {
    errors.push(`${rel} Evidence date ${newest} is in the future`);
  }
  const verified = empty(meta.verified) ? null : String(meta.verified);
  if (isRealDate(verified) && verified > newest) {
    errors.push(
      `${rel} verified ${verified} is newer than its newest Evidence date ${newest}. ` +
        `A new verified date needs a dated Evidence line from the same check`
    );
  }
  return errors;
}

/* ------------------------------------------------------------------ V9 */
/** A deprecated entry must say why, on a marker line. */
export function checkDeprecationReason(rel, meta, body, vocab) {
  const errors = [];
  if (String(meta.status) !== "deprecated") return errors;
  if (body.includes(vocab.deprecation_reason_marker)) return errors;
  errors.push(
    `${rel} status deprecated needs a "${vocab.deprecation_reason_marker}" line giving the reason`
  );
  return errors;
}

/* ------------------------------------------------------------------ V7 */
/**
 * `publisher` names a rights holder, never a host, and entries sharing a root
 * domain must not disagree about who that is. An entry that leaves `publisher`
 * unset is fine: sibling organisations on one domain are real (the Blender
 * application and Blender Studio's asset bundles both live on blender.org).
 */
export function checkPublisherConsistency(entries) {
  const errors = [];
  const byDomain = new Map();
  for (const e of entries) {
    if (empty(e.meta.publisher)) continue;
    const publisher = String(e.meta.publisher);
    if (GENERIC_HOSTS.has(publisher.toLowerCase())) {
      errors.push(
        `${e.rel} publisher "${publisher}" is a generic host, not a rights holder`
      );
    }
    let domain;
    try {
      domain = new URL(String(e.meta.url)).hostname.replace(/^www\./, "");
    } catch {
      continue;
    }
    if (!byDomain.has(domain)) byDomain.set(domain, new Map());
    const seen = byDomain.get(domain);
    if (!seen.has(publisher)) seen.set(publisher, e.rel);
  }
  for (const [domain, seen] of byDomain) {
    // Hosts where every upload has its own rights holder.
    if (MULTI_PUBLISHER_DOMAINS.has(domain)) continue;
    if (seen.size < 2) continue;
    const listed = [...seen.entries()]
      .map(([p, rel]) => `"${p}" (${rel})`)
      .join(", ");
    errors.push(`domain ${domain} has conflicting publisher values: ${listed}`);
  }
  return errors;
}

/* ----------------------------------------------------------------- V12 */
/** Documented values for the optional 2D/UI taxonomy. See catalog/TEMPLATE.md. */
export const CAMERA_PERSPECTIVES = new Set([
  "top_down",
  "isometric_3_4",
  "side_scroller",
  "2d_flat",
]);
const GRID_RE = /^\d{1,3}x\d{1,3}$/;

/**
 * The optional taxonomy fields were documented in TEMPLATE.md and enforced
 * nowhere, so a typo or an invented value would have shipped silently and a
 * filter built on them would quietly drop entries.
 */
export function checkTaxonomyValues(rel, meta) {
  const errors = [];
  if (!empty(meta.camera_perspective)) {
    const v = String(meta.camera_perspective);
    if (!CAMERA_PERSPECTIVES.has(v)) {
      errors.push(
        `${rel} camera_perspective "${v}" is not one of ${[...CAMERA_PERSPECTIVES].join(" | ")}`
      );
    }
  }
  if (!empty(meta.grid_dimensions)) {
    const v = String(meta.grid_dimensions);
    if (!GRID_RE.test(v)) {
      errors.push(
        `${rel} grid_dimensions "${v}" is not WxH in pixels, for example 16x16`
      );
    }
  }
  if (!empty(meta.hardware_tags) && !Array.isArray(meta.hardware_tags)) {
    errors.push(`${rel} hardware_tags must be a list`);
  }
  return errors;
}

/* ----------------------------------------------------------------- V13 */
/**
 * `formats`, `subcategories` and `tags` are free-form, so the same value drifts into
 * several spellings (`png` beside `PNG`, `field-recording` beside
 * `field-recordings`) and search and grouping split on them. Two values that
 * differ only by case, punctuation or a trailing "s" are one value spelt
 * twice. Plural folding was checked against the whole catalog before it was
 * switched on: its only hits were five real singular/plural pairs.
 */
export function checkValueSpellings(records, fields = ["formats", "subcategories", "tags"]) {
  const errors = [];
  for (const field of fields) {
    const byKey = new Map();
    for (const { rel, meta } of records) {
      const values = Array.isArray(meta[field]) ? meta[field] : [];
      for (const raw of values) {
        const v = String(raw);
        const key = v.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/s$/, "");
        if (!key) continue;
        if (!byKey.has(key)) byKey.set(key, new Map());
        const spellings = byKey.get(key);
        if (!spellings.has(v)) spellings.set(v, rel);
      }
    }
    for (const spellings of byKey.values()) {
      if (spellings.size < 2) continue;
      const listed = [...spellings.entries()].map(([v, rel]) => `"${v}" (${rel})`).join(", ");
      errors.push(`${field} spells one value several ways: ${listed}`);
    }
  }
  return errors;
}

/* ----------------------------------------------------------------- V14 */
/**
 * `active` tells a reader the licence, the commercial stance and the credit
 * requirement are all settled. An `unknown` in any of them means an open
 * question, which is what `needs-review` is for. Evidence presence for active
 * entries is checked in validate.mjs.
 */
export function checkActiveIsSettled(rel, meta) {
  const errors = [];
  if (String(meta.status) !== "active") return errors;
  for (const field of ["license", "commercial", "attribution_required"]) {
    if (String(meta[field]) === "unknown") {
      errors.push(`${rel} is active but ${field} is unknown; use needs-review until it is settled`);
    }
  }
  return errors;
}

/* ----------------------------------------------------------------- V15 */
/**
 * Starter stacks (stacks/<id>.md). The shape rules live in lib/stacks.mjs so
 * the build and this check cannot drift; here each pick must also be a
 * catalog entry that is still listed, and the stack id must be unique.
 */
export function checkStacks(stackFiles, entriesByPath, terms, today) {
  const errors = [];
  const ids = new Map();
  for (const { rel, text } of stackFiles) {
    let stack;
    try {
      stack = parseStack(text, { file: rel, terms });
    } catch (err) {
      if (err instanceof StackError) {
        errors.push(err.message);
        continue;
      }
      throw err;
    }
    const { id, walked } = stack.meta;
    if (id !== path.posix.basename(rel, ".md")) errors.push(`${rel}: id "${id}" does not match the filename`);
    if (ids.has(id)) errors.push(`duplicate stack id "${id}": ${ids.get(id)} and ${rel}`);
    else ids.set(id, rel);
    if (today && walked > today) errors.push(`${rel}: walked ${walked} is in the future`);
    for (const section of stack.sections) {
      for (const pick of section.picks) {
        const entry = entriesByPath.get(pickPath(rel, pick.href));
        if (!entry) errors.push(`${rel}:${pick.line}: pick "${pick.href}" is not a catalog entry`);
        else if (String(entry.status) === "deprecated") {
          errors.push(`${rel}:${pick.line}: pick "${entry.id}" is deprecated; repick or move the need to Gaps`);
        }
      }
    }
  }
  return errors;
}

/* ----------------------------------------------------------------- V11 */
/**
 * A category README row must not contradict its entry's frontmatter. The
 * table is hand-maintained beside frontmatter that changes, so it drifts
 * silently: before this check, tiled's row said GPL-3.0 while its frontmatter
 * said GPL-2.0, and nothing noticed.
 *
 * Annotated cells are deliberate and must survive: `varies (SA)`, `CC0*` and
 * `varies (CC0/MIT/GPL)` all carry footnote warnings the plain value cannot.
 * So a cell passes when it starts with the frontmatter value; only an
 * outright different license is an error.
 */
export function checkCategoryReadmeRows(categoryName, readmeText, entries) {
  const errors = [];
  const lines = readmeText.split(/\r?\n/);

  // Only the catalog listing table is checked. A category README may also carry
  // comparison tables that link entries, and those have no license column to
  // contradict. The listing is found by its header rather than by row shape,
  // because a comparison table can legitimately lead with the entry link too.
  //
  // A README can hold several listing tables (tools has one per section), so
  // collect the rows of every table that starts with an "| ID |" header. Reading
  // only the first one silently skipped every later section, which is how a
  // licence change in the Godot table went unnoticed.
  const table = [];
  let tables = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\|\s*ID\s*\|/i.test(lines[i].trim())) continue;
    tables += 1;
    for (let k = i + 1; k < lines.length && lines[k].trim().startsWith("|"); k += 1) {
      table.push(lines[k]);
    }
  }
  if (!tables) {
    if (entries.length) {
      errors.push(
        `catalog/${categoryName}/README.md has no catalog table (expected a header row starting "| ID |")`
      );
    }
    return errors;
  }

  for (const entry of entries) {
    const stem = entry.rel.split("/").pop().replace(/\.md$/, "");
    const row = table.find((l) => l.includes(`(${stem}.md)`));
    if (!row) continue; // validate.mjs already reports an entry missing from the README
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    const license = String(entry.meta.license);
    // Strip a trailing footnote marker or parenthetical qualifier before
    // comparing, so "CC0*", "CC-BY?" and "varies (SA)" keep working.
    const bare = (cell) =>
      cell
        .replace(/\s*\([^)]*\)\s*$/, "")
        .replace(/[*?†‡]+$/, "")
        .trim();
    const ok = cells.some((c) => bare(c) === license);
    if (!ok) {
      errors.push(
        `catalog/${categoryName}/README.md row for "${stem}" does not carry its license "${license}": ${cells.join(" | ")}`
      );
    }
  }
  return errors;
}

/* ------------------------------------------------------------------ V6 */
/**
 * The category count tables in README.md and catalog/README.md, and the
 * README source-count badge and link text, all restate numbers the catalog
 * already knows. They are correct today and drift on the next addition.
 */
export function checkCountTables(measured, docs) {
  const errors = [];
  const total = Object.values(measured).reduce((a, b) => a + b, 0);

  for (const { name, text, pathFragment } of docs) {
    for (const [cat, count] of Object.entries(measured)) {
      const re = new RegExp(
        `\\|[^|\\n]*\\|\\s*(\\d+)\\s*\\|[^\\n]*${pathFragment.replace("CAT", cat)}`
      );
      const m = text.match(re);
      if (!m) {
        errors.push(`${name} has no category count row for "${cat}"`);
        continue;
      }
      if (Number(m[1]) !== count) {
        errors.push(
          `${name} lists ${m[1]} entries for "${cat}" but the catalog has ${count}`
        );
      }
    }
  }

  const readme = docs.find((d) => d.name === "README.md");
  if (readme) {
    const badge = readme.text.match(/badge\/sources-(\d+)-/);
    if (!badge) errors.push("README.md has no sources-<count> badge");
    else if (Number(badge[1]) !== total) {
      errors.push(
        `README.md sources badge says ${badge[1]} but the catalog has ${total}`
      );
    }
    const browse = readme.text.match(/Browse (\d+) sources/);
    if (!browse) errors.push('README.md has no "Browse <count> sources" link');
    else if (Number(browse[1]) !== total) {
      errors.push(
        `README.md "Browse ${browse[1]} sources" but the catalog has ${total}`
      );
    }
  }
  return errors;
}

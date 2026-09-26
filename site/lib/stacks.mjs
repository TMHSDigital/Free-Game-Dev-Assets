/**
 * Starter stacks: one markdown file per kind of game, one pick per need.
 * A stack names its picks; every licence fact on its page comes from the
 * picked entries at build time, so a stack cannot disagree with an entry.
 */
import fs from "node:fs";
import path from "node:path";
import { isRealDate, unquoteScalar } from "./shared.mjs";

export class StackError extends Error {}

/** The `##` sections a stack may have, in the order they must appear. */
export const STACK_SECTIONS = ["Art", "Audio", "Fonts", "Tools", "Gaps"];

const REQUIRED = ["id", "title", "task", "walked"];
// - **Need:** [Entry name](path/to/entry.md). Why this pick.
const PICK_RE = /^- \*\*([^*]+?):\*\* \[([^\]]+)\]\(([^)\s]+)\)\.\s+(\S.*)$/;
// Names and shorthands matched in any case, as whole words. The exact ids
// from the vocabulary are matched case-sensitively in namedLicence.
const LICENCE_PHRASES = [
  "Creative Commons",
  "public domain",
  "public-domain",
  "royalty-free",
  "royalty free",
  "CC BY",
  "CC0",
  "OFL",
  "GPL",
];
// Vocabulary keys that are ordinary words, not licence names.
const PLAIN_WORD_IDS = new Set(["custom", "unknown", "varies"]);

/** Licence ids and SPDX ids a why sentence must not name. */
export function licenceTerms(vocab, spdxAllowed) {
  const ids = new Set();
  for (const [key, spec] of Object.entries(vocab.licenses || {})) {
    if (!PLAIN_WORD_IDS.has(key)) ids.add(key);
    for (const s of [].concat(spec?.spdx || [])) if (typeof s === "string") ids.add(s);
  }
  for (const id of spdxAllowed) ids.add(id);
  return [...ids];
}

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The first licence term or phrase the text names, or null. Ids match whole words. */
export function namedLicence(text, terms) {
  for (const t of terms) {
    if (new RegExp(`(^|[^\\w-])${escRe(t)}(?!\\w)`).test(text)) return t;
  }
  for (const p of LICENCE_PHRASES) {
    if (new RegExp(`(^|[^\\w-])${escRe(p)}(?![\\w])`, "i").test(text)) return p;
  }
  return null;
}

/** Repo-relative path of a pick link written in `stackFile`. */
export function pickPath(stackFile, href) {
  const target = href.split("#")[0];
  let decoded = target;
  try {
    decoded = decodeURI(target);
  } catch {
    // A malformed escape stays as written; the lookup then fails as a missing pick.
  }
  return path.posix.normalize(path.posix.join(path.posix.dirname(stackFile), decoded));
}

export function parseStack(text, { file, terms = [] }) {
  // A byte-order mark and trailing spaces are invisible in an editor; ignore both.
  const lines = String(text)
    .replace(/^﻿/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""));
  const fail = (i, msg) => {
    throw new StackError(`${file}:${i + 1}: ${msg}`);
  };
  if (lines[0] !== "---") fail(0, "a stack starts with frontmatter (---)");
  const end = lines.indexOf("---", 1);
  if (end === -1) fail(0, "frontmatter is not closed with ---");
  // Licence facts come only from the entries, so no prose in a stack may state one.
  // Link targets are paths, not prose: "../catalog/x-cc0.md" states nothing.
  const noLicence = (i, text, what) => {
    const named = namedLicence(text.replace(/\]\([^)]*\)/g, "]"), terms);
    if (named) fail(i, `the ${what} names a licence ("${named}"); licence facts come from the entry`);
  };
  const meta = {};
  const metaLine = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const at = line.indexOf(":");
    if (at === -1) fail(i, `frontmatter line "${line.trim()}" is not key: value`);
    const key = line.slice(0, at).trim();
    meta[key] = unquoteScalar(line.slice(at + 1).trim());
    metaLine[key] = i;
  }
  for (const key of REQUIRED) if (!meta[key]) fail(0, `frontmatter is missing ${key}`);
  if (!isRealDate(meta.walked)) fail(0, "walked is not YYYY-MM-DD (a real calendar date is required)");
  noLicence(metaLine.title, meta.title, "title");
  noLicence(metaLine.task, meta.task, "task");

  const lead = [];
  let leadLine = null;
  const sections = [];
  const gaps = [];
  let current = null;
  let order = -1;
  let gapsLine = null;
  for (let i = end + 1; i < lines.length; i++) {
    const line = lines[i];
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      const name = h[1];
      const at = STACK_SECTIONS.indexOf(name);
      if (at === -1) fail(i, `section "${name}" is not one of ${STACK_SECTIONS.join(", ")}`);
      if (at <= order) fail(i, `section "${name}" is out of order or repeated; the order is ${STACK_SECTIONS.join(", ")}`);
      order = at;
      current = { name, line: i + 1, picks: [] };
      if (name === "Gaps") gapsLine = i;
      else sections.push(current);
      continue;
    }
    if (!current) {
      if (/^#\s/.test(line)) continue; // the page shows the title as its h1
      if (line.trim() && leadLine === null) leadLine = i + 1;
      if (leadLine !== null) lead.push(line);
      noLicence(i, line, "lead");
      continue;
    }
    if (!line.trim()) continue;
    if (current.name === "Gaps") {
      const g = line.match(/^- (\S.*)$/);
      if (!g) fail(i, "a Gaps line is a bullet (- text)");
      noLicence(i, g[1], "gap");
      gaps.push({ text: g[1], line: i + 1 });
      continue;
    }
    const m = line.match(PICK_RE);
    if (!m) fail(i, "a pick line is: - **Need:** then a link to the entry, a full stop, and why this pick");
    const [, need, label, href, why] = m;
    noLicence(i, why, "why sentence");
    current.picks.push({ need: need.trim(), label, href, why, line: i + 1 });
  }
  for (const s of sections) if (!s.picks.length) fail(s.line - 1, `section "${s.name}" has no picks`);
  if (gapsLine !== null && !gaps.length) fail(gapsLine, `section "Gaps" has no bullets`);
  if (!sections.length) fail(end, "a stack needs at least one of Art, Audio, Fonts, Tools");
  return {
    meta: { id: meta.id, title: meta.title, task: meta.task, walked: meta.walked },
    lead: lead.join("\n").trim(),
    leadLine: leadLine || end + 2,
    sections,
    gaps,
  };
}

/**
 * What the picks owe, one row per entry (an entry picked for two needs is
 * listed once with both). `picked` is [{ need, entry }] with payload entries.
 */
export function owes(picked) {
  const byId = new Map();
  for (const { need, entry } of picked) {
    if (byId.has(entry.id)) byId.get(entry.id).needs.push(need);
    else byId.set(entry.id, { entry, needs: [need] });
  }
  const items = [...byId.values()];
  const credit = (i) => i.entry.attribution_required;
  return {
    credits: items.filter((i) => credit(i) === true).map((i) => ({ ...i, line: i.entry.attribution_string || null })),
    noCredit: items.filter((i) => credit(i) === false),
    unclear: items.filter((i) => credit(i) !== true && credit(i) !== false),
    perFile: items.filter((i) => i.entry.commercial === "varies"),
    openQuestions: items.filter((i) => i.entry.status === "needs-review"),
  };
}

/** Every canned credit line, one per line, in pick order. */
export function copyAllText(owed) {
  return owed.credits
    .filter((c) => c.line)
    .map((c) => c.line)
    .join("\n");
}

/**
 * The stack files under <root>/stacks: `files` are the top-level .md files
 * except README.md, sorted, as [{ rel, text }]; `stray` are .md files in
 * subfolders, which the build does not read. Build and validator share this.
 */
export function listStackFiles(root) {
  const dir = path.join(root, "stacks");
  const files = [];
  const stray = [];
  if (!fs.existsSync(dir)) return { files, stray };
  const walk = (d, rel) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const r = `${rel}/${ent.name}`;
      if (ent.isDirectory()) walk(path.join(d, ent.name), r);
      else if (ent.name.endsWith(".md") && ent.name !== "README.md") {
        if (rel === "stacks") files.push({ rel: r, text: fs.readFileSync(path.join(d, ent.name), "utf8") });
        else stray.push(r);
      }
    }
  };
  walk(dir, "stacks");
  files.sort((a, b) => a.rel.localeCompare(b.rel));
  stray.sort();
  return { files, stray };
}

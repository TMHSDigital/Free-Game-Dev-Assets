/**
 * Entry frontmatter and body helpers, shared by build.mjs and validate.mjs so
 * the two can never read the same file differently. (They used to carry a
 * copy each, and the copies had drifted: one undid quote escapes and the
 * other did not.)
 *
 * The parser reads exactly the YAML subset entries use: `key: value`, quoted
 * scalars, flow lists (`[a, "b, c"]`), block lists (`key:` then `  - item`)
 * and `#` comment lines. Anything else, and a key given twice, is reported
 * with its line number rather than guessed at.
 */
import { renderInline } from "./markdown.mjs";
import { unquoteScalar } from "./shared.mjs";

/** Splits the inside of a flow list on commas that are not inside quotes. */
function splitFlowList(inner) {
  const parts = [];
  let cur = "";
  let quote = null;
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (quote) {
      cur += ch;
      if (quote === '"' && ch === "\\" && i + 1 < inner.length) cur += inner[++i];
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === ",") {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => unquoteScalar(p.trim()));
}

export function parseScalar(raw) {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null" || v === "~" || v === "") return null;
  if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
    return unquoteScalar(v);
  }
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    return inner ? splitFlowList(inner) : [];
  }
  return v;
}

/**
 * `{ meta, body, errors }`, or null when the text has no frontmatter block.
 * `errors` are "line N: ..." strings; the caller prefixes the file.
 */
export function parseFrontmatter(text) {
  // A byte-order mark is invisible in an editor; ignore it.
  const match = String(text)
    .replace(/^﻿/, "")
    .match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/);
  if (!match) return null;
  const meta = {};
  const errors = [];
  const lines = match[1].split(/\r?\n/);
  let listKey = null;
  lines.forEach((line, i) => {
    const lineNo = i + 2; // line 1 is the opening ---
    if (!line.trim() || line.trim().startsWith("#")) return;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item) {
      if (listKey === null) errors.push(`line ${lineNo}: list item without a key above it`);
      else meta[listKey].push(parseScalar(item[1]));
      return;
    }
    listKey = null;
    const idx = line.indexOf(":");
    if (idx === -1 || /^\s/.test(line)) {
      errors.push(`line ${lineNo}: "${line.trim()}" is not a key: value line`);
      return;
    }
    const key = line.slice(0, idx).trim();
    if (Object.prototype.hasOwnProperty.call(meta, key)) {
      errors.push(`line ${lineNo}: key "${key}" is given twice`);
      return;
    }
    const value = parseScalar(line.slice(idx + 1));
    let nextIndex = i + 1;
    while (nextIndex < lines.length && (!lines[nextIndex].trim() || lines[nextIndex].trim().startsWith("#"))) {
      nextIndex += 1;
    }
    const next = lines[nextIndex];
    if (value === null && next !== undefined && /^\s+-\s/.test(next)) {
      meta[key] = [];
      listKey = key;
      return;
    }
    meta[key] = value;
  });
  return { meta, body: match[2] || "", errors };
}

/** The `## Evidence` section of an entry body, up to the next `## ` heading, or null. */
export function evidenceSection(body) {
  const idx = body.search(/^## Evidence\s*$/m);
  if (idx === -1) return null;
  const rest = body.slice(idx);
  const next = rest.search(/\n## (?!Evidence\s*$)/m);
  return next === -1 ? rest : rest.slice(0, next);
}

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

/**
 * Plain text of a line of entry markdown. It goes through the same inline
 * renderer as the entry page and drops the tags, so it strips exactly the
 * markup the page renders: underscores and `#` stay literal (Rig_Medium, C#).
 */
export function plainText(markdown) {
  const html = renderInline(markdown, (href) => ({ href, external: true }));
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m])
    .replace(/\s+/g, " ")
    .trim();
}

/** The first paragraph of an entry body as plain text, at most 220 characters. */
export function summaryFromBody(body) {
  const first =
    String(body)
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith("#")) || "";
  const clean = plainText(first);
  return clean.length > 220 ? `${clean.slice(0, 217)}…` : clean;
}

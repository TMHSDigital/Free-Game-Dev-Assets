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

/**
 * Drops a trailing ` # comment`. As in YAML, a `#` starts a comment only after
 * whitespace (or at the start) and outside quotes, so `C#` and `#fff` are
 * content. A quote opens only where a scalar can start (the start, or after
 * `[`, `,` or whitespace), so an apostrophe in `Kay's` is content too.
 */
function stripComment(raw) {
  let quote = null;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (quote) {
      if (quote === '"' && ch === "\\") i += 1;
      else if (ch === quote) quote = null;
    } else if ((ch === '"' || ch === "'") && (i === 0 || /[\s[,]/.test(raw[i - 1]))) {
      quote = ch;
    } else if (ch === "#" && (i === 0 || /\s/.test(raw[i - 1]))) {
      return raw.slice(0, i);
    }
  }
  return raw;
}

/**
 * True when an unquoted bare scalar lost a ` #word` to the comment rule. A
 * hash with no space after it is a hashtag or a colour, not a comment
 * (`# text`); say so, since the silent truncation is what hurts.
 */
function cutAtHash(raw, value) {
  return /\S\s+#\S/.test(raw) && typeof value === "string" && value !== "" && !/^["'[]/.test(raw.trim());
}

export function parseScalar(raw) {
  const v = stripComment(raw).trim();
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
      else {
        const value = parseScalar(item[1]);
        if (value === null) errors.push(`line ${lineNo}: list item is empty (a value starting with # is a comment; quote it)`);
        else if (cutAtHash(item[1], value)) errors.push(`line ${lineNo}: list item is cut at " #" (read as a comment); quote the value if the # is part of it`);
        else meta[listKey].push(value);
      }
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
    const rawValue = line.slice(idx + 1);
    const value = parseScalar(rawValue);
    if (cutAtHash(rawValue, value)) {
      errors.push(`line ${lineNo}: "${key}" is cut at " #" (read as a comment); quote the value if the # is part of it`);
    }
    // A block list may start after blank or comment lines under its key.
    let j = i + 1;
    while (j < lines.length && (!lines[j].trim() || lines[j].trim().startsWith("#"))) j += 1;
    const next = lines[j];
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

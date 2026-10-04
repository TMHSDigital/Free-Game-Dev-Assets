/**
 * Renders catalog entry bodies to HTML. Deliberately small: it supports the
 * markdown the catalog uses (measured 2026-09-24) and throws on anything
 * else, so a new construct fails the build instead of rendering wrong.
 * Underscores are literal: bodies contain identifiers like Rig_Medium.
 */
import { esc } from "./shared.mjs";

export class MarkdownError extends Error {}

const slot = (i) => `\u0000${i}\u0000`;
const SLOT_RE = /\u0000(\d+)\u0000/g;

const count = (str, sub) => str.split(sub).length - 1;

/**
 * A markdown link. The href may hold one level of balanced parens
 * (Foo_(bar)). Shared with llms.mjs so both read the same href.
 */
export const LINK_RE = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

/**
 * Bold and italic on already-escaped text. Italic that would cross a bold
 * boundary (`**a *b** c*`) stays literal: wrapping it would nest the tags
 * wrongly.
 */
function marks(escaped) {
  return escaped
    .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*(?=\S)([^*]+?)(?<=\S)\*(?![*\w])/g, (whole, pre, inner) =>
      count(inner, "<strong>") === count(inner, "</strong>") ? `${pre}<em>${inner}</em>` : whole
    );
}

/** Ids the page templates use themselves; a heading must not take one. */
const RESERVED_IDS = new Set([
  "attribution-string",
  "content",
  "copy-attribution",
  "copy-status",
  "credits-all",
  "credits-list",
  "every-check",
  "facts-title",
  "owes-title",
  "recent",
  "sec-gaps",
]);

export function renderInline(text, resolveLink) {
  const slots = [];
  const keep = (html) => {
    slots.push(html);
    return slot(slots.length - 1);
  };
  // NUL marks a slot below; one in the input could make a slot hold its own
  // token and the restore loop never settle.
  let s = String(text).replaceAll("\u0000", "");
  // Code spans first: their contents are literal.
  s = s.replace(/`([^`]+)`/g, (_, code) => keep(`<code>${esc(code)}</code>`));
  // Backslash escapes: any ASCII punctuation, as in CommonMark.
  s = s.replace(/\\([!-/:-@[-`{-~])/g, (_, ch) => keep(esc(ch)));
  // Links. The label keeps bold, italic and code; the href goes through the
  // resolver.
  s = s.replace(LINK_RE, (_, label, href) => {
    const { href: out, external } = resolveLink(href);
    const rel = external ? ' rel="noopener noreferrer"' : "";
    return keep(`<a href="${esc(out)}"${rel}>${marks(esc(label))}</a>`);
  });
  // Autolinks in angle brackets.
  s = s.replace(/<(https?:\/\/[^\s<>]+)>/g, (_, url) => keep(`<a href="${esc(url)}" rel="noopener noreferrer">${esc(url)}</a>`));
  // Bare URLs, leaving trailing sentence punctuation outside the link. A URL
  // stops at `*` (bold around it) and at a slot (a code span right after it),
  // and keeps a closing paren that balances one inside it (Foo_(bar)).
  s = s.replace(/https?:\/\/[^\s<>"*\u0000]+/g, (url) => {
    let [, core, tail] = url.match(/^(.*?)([.,;:!?)\]]*)$/);
    while (tail.startsWith(")") && count(core, "(") > count(core, ")")) {
      core += ")";
      tail = tail.slice(1);
    }
    return keep(`<a href="${esc(core)}" rel="noopener noreferrer">${esc(core)}</a>`) + tail;
  });
  s = marks(esc(s));
  // Link labels can hold code slots, so restore until stable.
  let before;
  do {
    before = s;
    s = s.replace(SLOT_RE, (_, i) => slots[Number(i)]);
  } while (s !== before);
  return s;
}

const UNSUPPORTED = [
  [/^\s*\|/, "a table row"],
  [/^\s*```/, "a code fence"],
  [/^\s*>/, "a blockquote"],
  [/^\s*!\[/, "an image"],
  [/^\s*<[A-Za-z!/]/, "raw HTML"],
  [/^#{3,}\s/, "a heading below level 2"],
  [/^\s*\d+[.)]\s/, "an ordered list"],
];

const lines = (md) => String(md).replace(/\r\n?/g, "\n").split("\n");

export function renderBlocks(md, { file, resolveLink, firstLine = 1 }) {
  const html = [];
  const stack = [];
  const ids = new Set(RESERVED_IDS);
  let para = [];
  let item = null;
  let blank = false;
  const inline = (t) => renderInline(t, resolveLink);
  const flushPara = () => {
    if (para.length) html.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const flushItem = () => {
    if (item !== null) html.push(inline(item));
    item = null;
  };
  const closeLists = () => {
    flushItem();
    while (stack.length) {
      html.push("</li></ul>");
      stack.pop();
    }
  };
  lines(md).forEach((line, i) => {
    for (const [re, what] of UNSUPPORTED) {
      if (re.test(line)) {
        throw new MarkdownError(`${file}:${firstLine + i}: ${what} is not supported by the site renderer`);
      }
    }
    if (!line.trim()) {
      flushPara();
      blank = true;
      return;
    }
    const li = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (li) {
      flushPara();
      const indent = li[1].replace(/\t/g, "    ").length;
      if (!stack.length) {
        html.push("<ul><li>");
        stack.push(indent);
      } else if (indent > stack[stack.length - 1]) {
        flushItem();
        html.push("<ul><li>");
        stack.push(indent);
      } else {
        flushItem();
        while (stack.length > 1 && indent < stack[stack.length - 1]) {
          html.push("</li></ul>");
          stack.pop();
        }
        html.push("</li><li>");
      }
      item = li[2];
      blank = false;
      return;
    }
    if (stack.length && !blank && /^\s/.test(line)) {
      item += ` ${line.trim()}`;
      return;
    }
    closeLists();
    blank = false;
    const h = line.match(/^(#{1,2})\s+(.*)$/);
    if (h) {
      flushPara();
      if (h[1] === "#") return; // the page shows the entry name as its h1
      // Unique on the page: a second "Notes" becomes notes-2, and a heading
      // never takes an id the page template uses.
      const base = h[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
      let id = base;
      for (let n = 2; ids.has(id); n += 1) id = `${base}-${n}`;
      ids.add(id);
      html.push(`<h2 id="${esc(id)}">${inline(h[2])}</h2>`);
      return;
    }
    para.push(line.trim());
  });
  flushPara();
  closeLists();
  // Items and their markup were pushed as separate strings; join tight.
  return html.join("").replace(/<\/p><(h2|p|ul)/g, "</p>\n<$1").replace(/<\/ul><(h2|p)/g, "</ul>\n<$1").replace(/<\/h2><(p|ul)/g, "</h2>\n<$1");
}

/** Lead (before the first `## `) and the rest, with the rest's first line number. */
export function splitEntryBody(body) {
  const ls = lines(body);
  const i = ls.findIndex((l) => /^##\s/.test(l));
  if (i === -1) return { lead: ls.join("\n"), rest: "", restFirstLine: ls.length + 1 };
  return { lead: ls.slice(0, i).join("\n"), rest: ls.slice(i).join("\n"), restFirstLine: i + 1 };
}

/** Raw markdown under `## <heading>`, up to the next `## `, or null. */
export function sectionMarkdown(body, heading) {
  const ls = lines(body);
  const start = ls.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return null;
  let end = ls.findIndex((l, j) => j > start && /^##\s/.test(l));
  if (end === -1) end = ls.length;
  return ls.slice(start + 1, end).join("\n").trim();
}

/** The text after the `- Deprecated:` marker line, or null. */
export function deprecationReason(body) {
  const m = String(body).match(/^- Deprecated:\s*(.+)$/m);
  if (!m) return null;
  // The banner reads "Deprecated. <reason>", so the reason starts a sentence.
  const reason = m[1].trim();
  return reason.charAt(0).toUpperCase() + reason.slice(1);
}

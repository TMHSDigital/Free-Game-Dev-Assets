/**
 * Renders a guide in docs/ for its site page. Guides use more markdown than
 * entry bodies (tables, fenced code, blockquotes, numbered lists, ### headings),
 * so they get their own renderer; renderBlocks stays strict for entries.
 * Inline markup and links go through renderInline and the caller's resolver.
 * Images and raw HTML still fail the build, as on entry pages, and so do the
 * constructs it would otherwise get wrong: setext headings and code fences
 * indented under a list item. Pure.
 */
import { esc } from "./shared.mjs";
import { MarkdownError, renderInline, RESERVED_IDS } from "./markdown.mjs";

/** GitHub's heading anchor, so links written for GitHub (licenses.md#cc-by) land here too. */
export function headingSlug(text) {
  return String(text)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/ /g, "-");
}

/** Table cells, split on pipes outside code spans; a leading and trailing pipe are dropped. */
function cells(line) {
  const out = [];
  let cur = "";
  let code = false;
  const s = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === "\\" && s[i + 1] === "|") {
      cur += "|";
      i += 1;
    } else if (ch === "`") {
      code = !code;
      cur += ch;
    } else if (ch === "|" && !code) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** A thematic break: three or more of the same -, * or _ (spaces allowed between). */
const isBreak = (line) => /^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line);
/** A setext underline (=== or ---) under a paragraph line. */
const isSetext = (line) => /^\s{0,3}(=+|-+)\s*$/.test(line);
const FENCE_RE = /^\s*(`{3,}|~{3,})/;

const isSeparator = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line);

/**
 * `{ title, titleId, html, firstParagraph }`. The first `# ` heading is the page
 * title (the template prints it as the h1); later `#` headings are refused.
 */
export function renderGuide(md, { file, resolveLink }) {
  const ls = String(md).replace(/\r\n?/g, "\n").split("\n");
  const inline = (t) => renderInline(t, resolveLink);
  const html = [];
  const seen = new Map();
  let title = "";
  let titleId = "";
  let firstParagraph = "";
  let i = 0;
  const fail = (n, what) => {
    throw new MarkdownError(`${file}:${n + 1}: ${what} is not supported on guide pages`);
  };
  const isBlockStart = (l) => /^\s*(```|~~~|>|\||#{1,6}\s|[-*]\s|\d+[.)]\s)/.test(l) || isBreak(l);

  while (i < ls.length) {
    const line = ls[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (/^\s*!\[/.test(line)) fail(i, "an image");
    if (/^\s*<(?!https?:\/\/)[A-Za-z!/]/.test(line)) fail(i, "raw HTML");

    // Fenced code (``` or ~~~): literal, escaped. It closes on a fence of
    // the same character at least as long as the opening one.
    const fence = line.match(FENCE_RE);
    if (fence) {
      if (/^\s+/.test(line)) fail(i, "an indented code fence (inside a list item)");
      const mark = fence[1];
      const lang = line.trim().slice(mark.length).trim();
      const closes = new RegExp(`^\\s*\\${mark[0]}{${mark.length},}\\s*$`);
      const body = [];
      i += 1;
      while (i < ls.length && !closes.test(ls[i])) body.push(ls[i++]);
      if (i >= ls.length) fail(i - 1, "an unclosed code fence");
      i += 1;
      html.push(`<pre class="guide-code"${lang ? ` data-lang="${esc(lang)}"` : ""}><code>${esc(body.join("\n"))}</code></pre>`);
      continue;
    }

    if (isBreak(line)) {
      html.push("<hr />");
      i += 1;
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h) {
      const level = h[1].length;
      if (level === 1) {
        if (title) fail(i, "a second top-level heading");
        title = h[2];
        // GitHub gives the h1 an anchor and counts it among duplicates, so
        // "# Fonts" then "## Fonts" is #fonts and #fonts-1 here as there.
        titleId = headingSlug(title);
        seen.set(titleId, (seen.get(titleId) || 0) + 1);
        i += 1;
        continue;
      }
      const base = headingSlug(h[2]);
      let n = seen.get(base) || 0;
      let id = n ? `${base}-${n}` : base;
      // The page template owns some ids (<main id="content">): take the next suffix.
      while (RESERVED_IDS.has(id)) {
        n += 1;
        id = `${base}-${n}`;
      }
      seen.set(base, n + 1);
      const tag = `h${Math.min(level, 4)}`;
      html.push(`<${tag} id="${esc(id)}">${inline(h[2])}</${tag}>`);
      i += 1;
      continue;
    }

    if (/^\s*\|/.test(line)) {
      const rows = [];
      while (i < ls.length && /^\s*\|/.test(ls[i])) rows.push(ls[i++]);
      if (rows.length < 2 || !isSeparator(rows[1])) fail(i - rows.length, "a table without a header separator");
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      html.push(
        `<div class="table-wrap"><table class="guide-table"><thead><tr>${head.map((c) => `<th scope="col">${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
          body.map((r) => `<tr>${head.map((_, k) => `<td>${inline(r[k] || "")}</td>`).join("")}</tr>`).join("") +
          `</tbody></table></div>`
      );
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote = [];
      while (i < ls.length && /^\s*>/.test(ls[i])) quote.push(ls[i++].replace(/^\s*>\s?/, ""));
      const paras = quote.join("\n").split(/\n\s*\n/).map((p) => `<p>${inline(p.replace(/\n/g, " ").trim())}</p>`);
      html.push(`<blockquote>${paras.join("")}</blockquote>`);
      continue;
    }

    const listRe = /^\s*([-*]|\d+[.)])\s+(.*)$/;
    const li = line.match(listRe);
    if (li) {
      const ordered = /\d/.test(li[1]);
      const start = ordered ? parseInt(li[1], 10) : 1;
      const items = [];
      while (i < ls.length) {
        const m = ls[i].match(listRe);
        if (m && /\d/.test(m[1]) === ordered) {
          items.push(m[2]);
          i += 1;
        } else if (items.length && ls[i].trim() && /^\s+/.test(ls[i]) && !isBlockStart(ls[i])) {
          items[items.length - 1] += ` ${ls[i].trim()}`;
          i += 1;
        } else if (items.length && FENCE_RE.test(ls[i]) && /^\s+/.test(ls[i])) {
          fail(i, "an indented code fence (inside a list item)");
        } else if (items.length && !ls[i].trim()) {
          // Blank lines between items of the same list keep one list
          // (a "loose" list), so 1. a / blank / 2. b stays numbered 1, 2.
          let j = i;
          while (j < ls.length && !ls[j].trim()) j += 1;
          const next = j < ls.length ? ls[j].match(listRe) : null;
          if (next && /\d/.test(next[1]) === ordered && !/^\s+/.test(ls[j])) i = j;
          else if (j < ls.length && FENCE_RE.test(ls[j]) && /^\s+/.test(ls[j])) fail(j, "an indented code fence (inside a list item)");
          else break;
        } else break;
      }
      const tag = ordered ? "ol" : "ul";
      const startAttr = ordered && start !== 1 ? ` start="${start}"` : "";
      html.push(`<${tag}${startAttr}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${tag}>`);
      continue;
    }

    const para = [];
    while (i < ls.length && ls[i].trim() && !isBlockStart(ls[i])) {
      // A === or --- under paragraph text is a setext heading on GitHub.
      if (para.length && isSetext(ls[i])) fail(i, "a setext heading underline (use ## instead)");
      para.push(ls[i++].trim());
    }
    if (para.length && i < ls.length && isBreak(ls[i]) && /^\s{0,3}-/.test(ls[i])) {
      fail(i, "a setext heading underline (use ## instead)");
    }
    if (!para.length) {
      // A line that looks like a block start but matched nothing above.
      para.push(ls[i++].trim());
    }
    const text = para.join(" ");
    if (!firstParagraph) firstParagraph = text;
    html.push(`<p>${inline(text)}</p>`);
  }
  if (!title) throw new MarkdownError(`${file}:1: a guide needs a "# " title`);
  return { title, titleId, html: html.join("\n"), firstParagraph };
}

/** Markdown inline marks and links reduced to plain text, for a meta description. */
export function plainText(md) {
  return String(md)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

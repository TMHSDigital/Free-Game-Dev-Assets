/** Checks run on every generated page; the build fails on any error. */
import path from "node:path";
import { ANY_SCHEME_RE, EXTERNAL_SCHEME_RE, SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from "./shared.mjs";

const unescape = (s) => s.replace(/&(amp|lt|gt|quot|#39);/g, (m) => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" })[m]);

const LEAKS = [
  [/\*\*/, "a double asterisk"],
  [/\]\(/, "a markdown link"],
  [/`/, "a backtick"],
];

export function checkPage(html, { file, kindOf }) {
  const errors = [];
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<code>[\s\S]*?<\/code>/g, " ")
    .replace(/<[^>]+>/g, " ");
  for (const [re, what] of LEAKS) if (re.test(text)) errors.push(`${file}: leaked markdown (${what})`);
  // Fonts are self-hosted (site/public/fonts/); a third-party font request is a privacy and speed regression.
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) errors.push(`${file}: references Google Fonts`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${file}: expected one h1, found ${h1}`);
  if (!/<link rel="canonical" href="[^"]+"/.test(html)) errors.push(`${file}: missing canonical link`);
  if (!/<title>[^<\s][^<]*<\/title>/.test(html)) errors.push(`${file}: missing or empty title`);
  // Search results cut titles around 60 characters and descriptions around 160.
  const title = unescape(html.match(/<title>([^<]*)<\/title>/)?.[1] || "");
  if (title.length > SEO_TITLE_MAX) errors.push(`${file}: title is ${title.length} characters, over ${SEO_TITLE_MAX}`);
  const description = unescape(html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "");
  if (description.length > SEO_DESCRIPTION_MAX) errors.push(`${file}: description is ${description.length} characters, over ${SEO_DESCRIPTION_MAX}`);
  const dir = path.posix.dirname(file);
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const href = m[1];
    if (EXTERNAL_SCHEME_RE.test(href) || href.startsWith("#")) continue;
    const scheme = href.match(ANY_SCHEME_RE);
    if (scheme) {
      errors.push(`${file}: link ${href} uses the unsupported scheme "${scheme[1].toLowerCase()}:"`);
      continue;
    }
    const clean = href.split(/[?#]/)[0];
    let target = path.posix.normalize(path.posix.join(dir, clean || ".")).replace(/\/$/, "");
    if (target === ".") target = "";
    if (target.startsWith("..")) {
      errors.push(`${file}: link ${href} leaves the site`);
      continue;
    }
    if (!kindOf(target)) errors.push(`${file}: link ${href} does not resolve`);
  }
  return errors;
}

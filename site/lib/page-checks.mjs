/** Checks run on every generated page; the build fails on any error. */
import path from "node:path";
import { ANY_SCHEME_RE, EXTERNAL_SCHEME_RE } from "./shared.mjs";

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
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${file}: expected one h1, found ${h1}`);
  if (!/<link rel="canonical" href="[^"]+"/.test(html)) errors.push(`${file}: missing canonical link`);
  if (!/<title>[^<\s][^<]*<\/title>/.test(html)) errors.push(`${file}: missing or empty title`);
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

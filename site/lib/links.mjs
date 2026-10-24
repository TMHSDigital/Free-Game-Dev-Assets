/** Rewrites links in an entry body for the entry's own page. */
import path from "node:path";
import { ANY_SCHEME_RE, EXTERNAL_SCHEME_RE } from "./shared.mjs";

export class LinkError extends Error {}

/**
 * The path component whose case differs between a link target and the file
 * on disk, as "linked vs on disk", or null. Windows and macOS resolve
 * `Docs/Foo.md` to `docs/foo.md`; Linux, where CI runs, does not. Compared
 * from the file name backwards; a component that differs in more than case
 * (a symlink, a drive letter) ends the comparison.
 */
export function caseMismatch(linked, onDisk) {
  const a = String(linked).split(/[\\/]+/).filter(Boolean);
  const b = String(onDisk).split(/[\\/]+/).filter(Boolean);
  const n = Math.min(a.length, b.length);
  for (let i = 1; i <= n; i += 1) {
    const x = a[a.length - i];
    const y = b[b.length - i];
    if (x === y) continue;
    if (x.endsWith(":") || y.endsWith(":")) return null;
    return x.toLowerCase() === y.toLowerCase() ? `${x} vs ${y}` : null;
  }
  return null;
}

export function makeLinkResolver({ entryPath, idByPath, repo, kindOf, entryBase = "../", nameById }) {
  const dir = path.posix.dirname(entryPath);
  return (raw) => {
    if (EXTERNAL_SCHEME_RE.test(raw)) return { href: raw, external: true };
    if (raw.startsWith("#")) return { href: raw, external: false };
    const scheme = raw.match(ANY_SCHEME_RE);
    if (scheme) throw new LinkError(`${entryPath}: link "${raw}" uses the unsupported scheme "${scheme[1].toLowerCase()}:" (only https, http and mailto links are allowed)`);
    // Split off ?query and #hash; both are kept on the rewritten link.
    const m = raw.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
    const target = m[1];
    const hash = `${m[2] || ""}${m[3] || ""}`;
    let decoded;
    try {
      decoded = decodeURI(target);
    } catch {
      throw new LinkError(`${entryPath}: link target "${raw}" is malformed`);
    }
    const repoPath = path.posix.normalize(path.posix.join(dir, decoded)).replace(/\/$/, "");
    const id = idByPath.get(repoPath);
    if (id) return { href: `${entryBase}${id}/${hash}`, external: false, entryId: id, entryName: nameById ? nameById.get(id) : undefined };
    const kind = repoPath.startsWith("..") ? null : kindOf(repoPath);
    if (!kind) throw new LinkError(`${entryPath}: link target "${raw}" does not exist`);
    const mode = kind === "dir" ? "tree" : "blob";
    return { href: `${repo}/${mode}/main/${encodeURI(repoPath)}${hash}`, external: true };
  };
}

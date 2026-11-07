/**
 * The build's output writer. It creates a directory once, writes a file only
 * when its bytes changed and remembers every path it produced, so the build
 * can prune what an earlier build left behind instead of wiping dist/ and
 * recreating 420 directories (94% of the build time on a slow disk).
 * `--clean` still wipes first; the result is byte-identical either way.
 * The directory is a parameter so the tests can run it in a temp dir (#265).
 */
import fs from "node:fs";
import path from "node:path";

export function createDistWriter(dist) {
  const produced = new Set();
  const madeDirs = new Set();
  let writes = 0;

  function ensureDir(dir) {
    if (madeDirs.has(dir)) return;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    madeDirs.add(dir);
  }

  /** Writes `content` (string or Buffer) to dist-relative `rel` if it differs. */
  function writeOut(rel, content) {
    const full = path.join(dist, rel);
    produced.add(rel.split(path.sep).join("/"));
    ensureDir(path.dirname(full));
    const next = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    if (fs.existsSync(full)) {
      const stat = fs.statSync(full);
      if (stat.isFile() && stat.size === next.length && fs.readFileSync(full).equals(next)) return;
    }
    fs.writeFileSync(full, next);
    writes += 1;
  }

  /** Removes every file and directory in dist that this build did not produce. */
  function pruneDist(dir = dist, prefix = "") {
    let kept = 0;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const rel = prefix ? `${prefix}/${name}` : name;
      if (fs.statSync(full).isDirectory()) {
        if (pruneDist(full, rel) === 0) fs.rmSync(full, { recursive: true, force: true });
        else kept += 1;
      } else if (produced.has(rel)) kept += 1;
      else fs.rmSync(full, { force: true });
    }
    return kept;
  }

  return { ensureDir, writeOut, pruneDist, produced, writes: () => writes };
}

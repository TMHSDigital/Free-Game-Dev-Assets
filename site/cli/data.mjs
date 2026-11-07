/**
 * Loads data.json for the CLI and the MCP server: a local file or URL from
 * `--data` or FGDA_DATA, else this checkout's build (site/dist/data.json)
 * when there is one, else the published copy.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DATA_URL } from "../lib/catalog-query.mjs";

const LOCAL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "data.json");

export async function loadData(source = process.env.FGDA_DATA) {
  const from = source || (fs.existsSync(LOCAL) ? LOCAL : DATA_URL);
  if (/^https:\/\//.test(from)) {
    const res = await fetch(from, { headers: { "user-agent": "free-game-dev-assets-cli" }, signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`could not load ${from}: HTTP ${res.status}`);
    return res.json();
  }
  return JSON.parse(fs.readFileSync(from, "utf8"));
}

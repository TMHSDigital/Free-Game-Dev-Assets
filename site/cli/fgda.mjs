#!/usr/bin/env node
/**
 * Query the catalog from a shell or CI job (#115). Zero dependencies.
 *   fgda search [words] [--license cc0] [--category audio] [--commercial] [--no-attribution]
 *               [--engine godot] [--format ttf] [--limit 20] [--json]
 *   fgda get <id> [--json]
 *   fgda check <id> [--engine unreal] [--non-commercial] [--json]   exit 1 when it does not fit
 *   fgda stacks [--json]
 * Every command takes --data <file|https URL> (default: this checkout's
 * build, else the published data.json). From anywhere:
 *   npx github:TMHSDigital/Free-Game-Dev-Assets search "pixel font" --license cc0
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { checkLicense, getAsset, listStacks, searchAssets } from "../lib/catalog-query.mjs";
import { loadData } from "./data.mjs";

const USAGE = `usage: fgda search [words] [--license L] [--category C] [--commercial] [--no-attribution] [--engine E] [--format F] [--limit N]
       fgda get <id>
       fgda check <id> [--engine E] [--non-commercial]
       fgda stacks
options: --data <file|https URL>  --json`;

const line = (a) =>
  `${a.id}  ${a.name}\n  ${a.license}${a.commercial === true ? ", commercial OK" : a.commercial === "varies" ? ", per-file" : a.commercial === false ? ", NOT commercial" : ", commercial ?"}${a.attribution_required === true ? ", credit required" : a.attribution_required === false ? ", no credit" : ""}${a.engine_lock ? `, ${a.engine_lock} only` : ""}; ${a.status}; read ${a.verified || "never"}\n  ${a.page}`;

export async function main(argv = process.argv.slice(2), out = (s) => process.stdout.write(`${s}\n`)) {
  const { values: o, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: true,
    options: {
      data: { type: "string" },
      json: { type: "boolean" },
      license: { type: "string" },
      category: { type: "string" },
      commercial: { type: "boolean" },
      "no-attribution": { type: "boolean" },
      "non-commercial": { type: "boolean" },
      engine: { type: "string" },
      format: { type: "string" },
      limit: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  const [cmd, ...rest] = positionals;
  if (o.help || !cmd) {
    out(USAGE);
    return o.help ? 0 : 2;
  }
  const data = await loadData(o.data);
  const print = (value, text) => out(o.json ? JSON.stringify(value, null, 2) : text);
  if (cmd === "search") {
    const hits = searchAssets(data, { q: rest.join(" "), license: o.license, category: o.category, commercial: o.commercial, noAttribution: o["no-attribution"], engine: o.engine, format: o.format, limit: o.limit ? Number(o.limit) : 20 });
    print(hits, hits.length ? hits.map(line).join("\n\n") : "No match.");
    return 0;
  }
  if (cmd === "get") {
    const a = getAsset(data, rest[0]);
    if (!a) {
      out(`No entry "${rest[0]}".`);
      return 1;
    }
    print(a, line(a));
    return 0;
  }
  if (cmd === "check") {
    const r = checkLicense(data, rest[0], { commercial: !o["non-commercial"], engine: o.engine });
    print(r, `${r.ok ? "OK" : "CHECK"}: ${rest[0]}${r.problems.length ? `\n  - ${r.problems.join("\n  - ")}` : ""}${r.owes.length ? `\n  owes: ${r.owes.join("; ")}` : ""}`);
    return r.ok ? 0 : 1;
  }
  if (cmd === "stacks") {
    const s = listStacks(data);
    print(s, s.map((x) => `${x.id}  ${x.title}\n  ${x.page}`).join("\n"));
    return 0;
  }
  out(USAGE);
  return 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => process.exit(code), (err) => {
    console.error(err.message);
    process.exit(2);
  });
}

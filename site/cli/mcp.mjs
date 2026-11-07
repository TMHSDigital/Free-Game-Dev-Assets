#!/usr/bin/env node
/**
 * A Model Context Protocol server over the catalog (#115), on stdio, with
 * no dependencies: newline-delimited JSON-RPC 2.0, the tools capability
 * only. Tools: search_assets, get_asset, check_license, list_stacks.
 *   node site/cli/mcp.mjs [--data <file|https URL>]
 * Client config (Claude Desktop, Cursor and others):
 *   { "command": "node", "args": ["/path/to/Free-Game-Dev-Assets/site/cli/mcp.mjs"] }
 */
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { checkLicense, getAsset, listStacks, searchAssets } from "../lib/catalog-query.mjs";
import { loadData } from "./data.mjs";

export const TOOLS = [
  {
    name: "search_assets",
    description: "Search the Free Game Dev Assets catalog of free game assets and tools. Every licence was read at its source; results carry the licence, whether commercial use is OK, the credit owed and the date the licence was last checked.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words to search for, e.g. \"pixel font\"" },
        category: { type: "string", description: "3d, 2d, audio, characters, environment, fonts, shaders-vfx, animation, video or tools" },
        license: { type: "string", description: "A licence value (CC0, CC-BY-4.0, MIT...), SPDX id, or licence family" },
        commercial: { type: "boolean", description: "Only sources usable in a commercial game (including per-file ones)" },
        no_attribution: { type: "boolean", description: "Only sources that need no credit line" },
        engine: { type: "string", description: "godot, unity or unreal: hide sources made only for other engines" },
        format: { type: "string", description: "A file format, e.g. glb, png, ttf" },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
    },
  },
  {
    name: "get_asset",
    description: "One catalog entry by id: licence, commercial use, credit line, status, verified date and page.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "check_license",
    description: "Whether a catalog entry fits a use: commercial or not, and the engine it ships in. Returns problems to resolve and what it owes.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, commercial: { type: "boolean", default: true }, engine: { type: "string" } },
      required: ["id"],
    },
  },
  { name: "list_stacks", description: "The starter stacks: one pick per need for a kind of game.", inputSchema: { type: "object", properties: {} } },
];

/** One tool call's result as MCP content. */
export function callTool(data, name, args = {}) {
  const text = (v) => ({ content: [{ type: "text", text: JSON.stringify(v, null, 2) }] });
  if (name === "search_assets") {
    return text(searchAssets(data, { q: args.query || "", category: args.category, license: args.license, commercial: args.commercial, noAttribution: args.no_attribution, engine: args.engine, format: args.format, limit: args.limit }));
  }
  if (name === "get_asset") {
    const a = getAsset(data, args.id);
    return a ? text(a) : { content: [{ type: "text", text: `No entry "${args.id}".` }], isError: true };
  }
  if (name === "check_license") return text(checkLicense(data, args.id, { commercial: args.commercial !== false, engine: args.engine }));
  if (name === "list_stacks") return text(listStacks(data));
  return { content: [{ type: "text", text: `Unknown tool ${name}` }], isError: true };
}

/** The answer to one JSON-RPC message, or null for a notification. */
export function handle(msg, data) {
  if (msg.id === undefined || msg.id === null) return null;
  const reply = (result) => ({ jsonrpc: "2.0", id: msg.id, result });
  switch (msg.method) {
    case "initialize":
      return reply({
        protocolVersion: msg.params?.protocolVersion || "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "free-game-dev-assets", version: String(data.version || "0") },
      });
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS });
    case "tools/call":
      return reply(callTool(data, msg.params?.name, msg.params?.arguments || {}));
    default:
      return { jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `Method not found: ${msg.method}` } };
  }
}

async function main() {
  const i = process.argv.indexOf("--data");
  const data = await loadData(i === -1 ? undefined : process.argv[i + 1]);
  const rl = readline.createInterface({ input: process.stdin });
  rl.on("line", (raw) => {
    if (!raw.trim()) return;
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } })}\n`);
      return;
    }
    const answer = handle(msg, data);
    if (answer) process.stdout.write(`${JSON.stringify(answer)}\n`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

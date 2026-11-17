#!/usr/bin/env node
/**
 * Retakes docs/images/readme/og-card.png, the README screenshot and the
 * site's social card: the top 1200x630 of the built home page, light mode,
 * no scrollbar, through headless Chrome (or Chromium, or Edge). No dependencies.
 *
 *   npm run build && node site/og-card.mjs [--out <file.png>]
 *
 * Set CHROME_PATH to pick the browser. .github/workflows/og-card.yml runs
 * this after each push to main that can change the home page, and commits
 * the result when it differs.
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cliArgs } from "./lib/cli.mjs";
import { chromeArgs, chromeCandidates, OG_CARD_HEIGHT, OG_CARD_WIDTH, pngSize } from "./lib/og-card.mjs";
import { OG_CARD_NAME } from "./lib/shared.mjs";
import { createSiteServer } from "./serve.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIST = path.join(__dirname, "dist");
const DEFAULT_OUT = path.join(ROOT, "docs", "images", "readme", OG_CARD_NAME);

/** The first candidate that runs `--version`, or null. */
function findChrome() {
  for (const bin of chromeCandidates(process.platform, process.env)) {
    if (path.isAbsolute(bin) && !fs.existsSync(bin)) continue;
    // Chrome on Windows prints nothing for --version; existing is enough there.
    if (process.platform === "win32") return bin;
    const r = spawnSync(bin, ["--version"], { encoding: "utf8", timeout: 20000 });
    if (r.status === 0) return bin;
  }
  return null;
}

/** Runs `bin` to completion (or kills it after `timeoutMs`); resolves `{ status, stderr }`. */
function run(bin, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d));
    const timer = setTimeout(() => child.kill(), timeoutMs);
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ status: null, stderr: String(err.message) });
    });
    child.on("close", (status) => {
      clearTimeout(timer);
      resolve({ status, stderr });
    });
  });
}

async function main() {
  const { values: flags } = cliArgs({ out: { type: "string" } }, "node site/og-card.mjs [--out <file.png>]");
  const out = path.resolve(flags.out ?? DEFAULT_OUT);
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    console.error("site/dist has no index.html; run npm run build first");
    process.exit(1);
  }
  const chrome = findChrome();
  if (!chrome) {
    console.error("No Chrome, Chromium or Edge found; set CHROME_PATH");
    process.exit(1);
  }

  const server = createSiteServer(DIST);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "og-card-"));
  const shot = path.join(tmp, "shot.png");
  try {
    // Async: the server runs in this process, so a blocking spawn would starve it.
    const r = await run(chrome, chromeArgs({ url: `http://127.0.0.1:${port}/`, out: shot, profileDir: path.join(tmp, "profile") }), 120000);
    if (!fs.existsSync(shot)) {
      console.error(`Chrome wrote no screenshot (exit ${r.status}).\n${r.stderr}`);
      process.exitCode = 1;
      return;
    }
    const size = pngSize(fs.readFileSync(shot));
    if (!size || size.width !== OG_CARD_WIDTH || size.height !== OG_CARD_HEIGHT) {
      console.error(`Expected a ${OG_CARD_WIDTH}x${OG_CARD_HEIGHT} PNG, got ${size ? `${size.width}x${size.height}` : "no PNG"}`);
      process.exitCode = 1;
      return;
    }
    const before = fs.existsSync(out) ? fs.readFileSync(out) : null;
    const after = fs.readFileSync(shot);
    if (before && before.equals(after)) {
      console.log(`${path.relative(ROOT, out)} unchanged`);
    } else {
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, after);
      console.log(`Wrote ${path.relative(ROOT, out)} (${OG_CARD_WIDTH}x${OG_CARD_HEIGHT}, ${after.length} bytes)`);
    }
  } finally {
    server.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

await main();

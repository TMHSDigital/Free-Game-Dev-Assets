#!/usr/bin/env node
/**
 * Renders each listed entry's own social card, site/dist/entry/<id>/card.png
 * (#117), which the entry page's og:image points at. Run after the build:
 *
 *   npm run build && node site/entry-cards.mjs
 *
 * One headless Chrome (or Chromium, or Edge; set CHROME_PATH to pick) is
 * driven over the DevTools protocol, so the whole catalog takes about a
 * minute instead of one browser launch per entry. No dependencies: Node's
 * built-in WebSocket speaks the protocol. The cards are build output only,
 * never committed; ci.yml renders them before the Pages upload.
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromeCandidates, ENTRY_CARD_NAME, entryCardHtml, OG_CARD_HEIGHT, OG_CARD_WIDTH, pngSize } from "./lib/og-card.mjs";
import { createSiteServer } from "./serve.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const STAGE = "_entry-cards";

function findChrome() {
  for (const bin of chromeCandidates(process.platform, process.env)) {
    if (path.isAbsolute(bin) && !fs.existsSync(bin)) continue;
    if (process.platform === "win32") return bin;
    const r = spawnSync(bin, ["--version"], { encoding: "utf8", timeout: 20000 });
    if (r.status === 0) return bin;
  }
  return null;
}

/** Resolves the browser's DevTools WebSocket URL once Chrome writes DevToolsActivePort. */
async function devtoolsUrl(profileDir, child) {
  const file = path.join(profileDir, "DevToolsActivePort");
  for (let i = 0; i < 300; i++) {
    if (child.exitCode !== null) throw new Error(`Chrome exited early (${child.exitCode})`);
    if (fs.existsSync(file)) {
      const [port, wsPath] = fs.readFileSync(file, "utf8").split("\n");
      if (port && wsPath) return `ws://127.0.0.1:${port.trim()}${wsPath.trim()}`;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Chrome did not open a DevTools port in 30 s");
}

/** A minimal DevTools protocol client: send(method, params, sessionId) and once(event, sessionId). */
function cdp(ws) {
  let nextId = 1;
  const pending = new Map();
  const waiters = [];
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
      else resolve(msg.result);
      return;
    }
    for (let i = waiters.length - 1; i >= 0; i--) {
      const w = waiters[i];
      if (w.method === msg.method && w.sessionId === msg.sessionId) {
        waiters.splice(i, 1);
        w.resolve(msg.params);
      }
    }
  });
  return {
    send(method, params = {}, sessionId) {
      const id = nextId++;
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    once(method, sessionId) {
      return new Promise((resolve) => waiters.push({ method, sessionId, resolve }));
    },
  };
}

async function main() {
  const dataPath = path.join(DIST, "data.json");
  if (!fs.existsSync(dataPath)) {
    console.error("site/dist has no data.json; run npm run build first");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const labels = Object.fromEntries(Object.entries(data.categories || {}).map(([id, c]) => [id, c.label]));
  const entries = data.entries.filter((e) => fs.existsSync(path.join(DIST, "entry", e.id, "index.html")));
  const chrome = findChrome();
  if (!chrome) {
    console.error("No Chrome, Chromium or Edge found; set CHROME_PATH");
    process.exit(1);
  }

  // Stage one HTML file per card inside dist so the fonts load same-origin.
  const stageDir = path.join(DIST, STAGE);
  fs.rmSync(stageDir, { recursive: true, force: true });
  fs.mkdirSync(stageDir);
  for (const e of entries) {
    fs.writeFileSync(path.join(stageDir, `${e.id}.html`), entryCardHtml(e, { siteTitle: data.site?.title || "Free Game Dev Assets", categoryLabel: labels[e.category] || e.category, fontRoot: "/" }));
  }

  const server = createSiteServer(DIST);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "entry-cards-"));
  const child = spawn(chrome, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
    "--disable-extensions", "--force-color-profile=srgb", "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`, "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  child.stderr.resume();

  let written = 0;
  try {
    const ws = new WebSocket(await devtoolsUrl(profileDir, child));
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", () => reject(new Error("DevTools WebSocket failed")), { once: true });
    });
    const c = cdp(ws);
    const { targetId } = await c.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await c.send("Target.attachToTarget", { targetId, flatten: true });
    await c.send("Page.enable", {}, sessionId);
    await c.send("Emulation.setDeviceMetricsOverride", { width: OG_CARD_WIDTH, height: OG_CARD_HEIGHT, deviceScaleFactor: 1, mobile: false }, sessionId);
    for (const e of entries) {
      const loaded = c.once("Page.loadEventFired", sessionId);
      await c.send("Page.navigate", { url: `http://127.0.0.1:${port}/${STAGE}/${encodeURIComponent(e.id)}.html` }, sessionId);
      await loaded;
      await c.send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => true)", awaitPromise: true }, sessionId);
      const { data: b64 } = await c.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: OG_CARD_WIDTH, height: OG_CARD_HEIGHT, scale: 1 } }, sessionId);
      const png = Buffer.from(b64, "base64");
      const size = pngSize(png);
      if (!size || size.width !== OG_CARD_WIDTH || size.height !== OG_CARD_HEIGHT) throw new Error(`${e.id}: expected a ${OG_CARD_WIDTH}x${OG_CARD_HEIGHT} PNG`);
      fs.writeFileSync(path.join(DIST, "entry", e.id, ENTRY_CARD_NAME), png);
      written++;
    }
    await c.send("Browser.close").catch(() => {});
    ws.close();
  } finally {
    child.kill();
    server.close();
    fs.rmSync(stageDir, { recursive: true, force: true });
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
  console.log(`Rendered ${written} entry cards (${OG_CARD_WIDTH}x${OG_CARD_HEIGHT}) into site/dist/entry/<id>/${ENTRY_CARD_NAME}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

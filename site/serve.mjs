#!/usr/bin/env node
/**
 * Serves site/dist for a local preview, with no dependencies:
 *
 *   node site/serve.mjs [--port 3000]
 *
 * Listens on 127.0.0.1 only. A directory serves its index.html, and a
 * missing path gets 404.html with status 404, as on GitHub Pages. Requests
 * that resolve outside site/dist are refused.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cliArgs } from "./lib/cli.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/** The file under `root` a request path maps to, or null when it escapes root or does not exist. */
export function resolveRequest(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(String(urlPath).split(/[?#]/)[0]);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  const full = path.resolve(root, `.${path.posix.normalize(`/${decoded}`)}`);
  if (full !== root && !full.startsWith(root + path.sep)) return null;
  let stat;
  let real;
  try {
    stat = fs.statSync(full);
    // A symlink inside root must not serve a file from outside it.
    real = fs.realpathSync.native(full);
    const realRoot = fs.realpathSync.native(root);
    if (real !== realRoot && !real.startsWith(realRoot + path.sep)) return null;
  } catch {
    return null;
  }
  if (stat.isDirectory()) {
    const index = path.join(full, "index.html");
    return fs.existsSync(index) && resolveRequest(root, path.relative(root, index).split(path.sep).join("/")) ? index : null;
  }
  return stat.isFile() ? full : null;
}

/**
 * Where to redirect a directory URL that lacks its trailing slash, as GitHub
 * Pages does (a 301), or null. Without it, an entry page's relative links
 * resolve one level too high locally.
 */
export function slashRedirect(root, urlPath) {
  const raw = String(urlPath);
  const cut = raw.search(/[?#]/);
  const pathname = cut === -1 ? raw : raw.slice(0, cut);
  // "//host" would be a protocol-relative Location: never redirect it.
  if (pathname.endsWith("/") || !pathname.startsWith("/") || pathname.startsWith("//")) return null;
  if (/\/index\.html$/i.test(pathname)) return null;
  const file = resolveRequest(root, pathname);
  if (!file || path.basename(file) !== "index.html") return null;
  return `${pathname}/${cut === -1 ? "" : raw.slice(cut)}`;
}

function send(req, res, status, file) {
  res.writeHead(status, { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
  if (req.method === "HEAD") res.end();
  else fs.createReadStream(file).pipe(res);
}

function main() {
  const { values: flags } = cliArgs({ port: { type: "string" } }, "node site/serve.mjs [--port <1-65535>]");
  const port = Number(flags.port ?? (process.env.PORT || 3000));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("usage: node site/serve.mjs [--port <1-65535>]");
    process.exit(2);
  }
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    console.error("site/dist has no index.html; run npm run build first");
    process.exit(1);
  }
  const server = http.createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { allow: "GET, HEAD" }).end();
      return;
    }
    const location = slashRedirect(DIST, req.url || "/");
    if (location) {
      res.writeHead(301, { location, "cache-control": "no-store" }).end();
      return;
    }
    const file = resolveRequest(DIST, req.url || "/");
    if (file) return send(req, res, 200, file);
    const notFound = path.join(DIST, "404.html");
    if (fs.existsSync(notFound)) return send(req, res, 404, notFound);
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found\n");
  });
  server.listen(port, "127.0.0.1", () => console.log(`Serving site/dist at http://127.0.0.1:${port}/ (Ctrl+C to stop)`));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

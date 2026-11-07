#!/usr/bin/env node
/**
 * Fetch and resize each eligible entry's publisher preview image.
 *
 *   node site/thumbs.mjs [--force] [--only id,id] [--limit n] [--dry-run] [--report path]
 *
 * Reads catalog/<category>/<id>.md, keeps site/thumbs.json (the manifest)
 * and site/public/thumbs/<id>.webp in step with the licence gate in
 * site/lib/thumbs.mjs, and never edits an entry. Resizing needs ffmpeg
 * (or ImageMagick's `magick`) on PATH; without one, every fetch is reported
 * as skipped. Individual fetch failures are listed, not fatal: the exit code
 * is non-zero only when the script itself breaks.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readCatalog, usableRecord } from "./lib/entry-files.mjs";
import { safeFetch } from "./lib/safe-fetch.mjs";
import { readArgs } from "./lib/cli.mjs";
import { normalizeEntry } from "./lib/entry-fields.mjs";
import { afterFailure, imageUrlFromHtml, manifestChanges, needsFetch, previewEligibility, safeImageUrl, sharedImageIds, sniffImage, webpSize } from "./lib/thumbs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const THUMBS_DIR = path.join(__dirname, "public", "thumbs");
const MANIFEST = path.join(__dirname, "thumbs.json");
const USER_AGENT = "Mozilla/5.0 (compatible; FreeGameDevAssets-thumbs; +https://github.com/TMHSDigital/Free-Game-Dev-Assets)";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const TIMEOUT_MS = 20000;
const CONCURRENCY = 4;
// A converter that hangs on a hostile file is killed rather than stalling the run.
const CONVERT_TIMEOUT_MS = 30000;

const USAGE = "node site/thumbs.mjs [--force] [--only id,id] [--limit n] [--dry-run] [--report path]";

/** The run's options; throws on an unknown flag, a flag missing its value, or a --limit that is not a whole number. */
export function thumbsOptions(argv) {
  const { values: v } = readArgs(argv, {
    force: { type: "boolean" },
    "dry-run": { type: "boolean" },
    only: { type: "string" },
    limit: { type: "string" },
    report: { type: "string" },
  });
  if (v.limit !== undefined && !/^\d+$/.test(v.limit)) throw new TypeError(`--limit needs a whole number, got ${JSON.stringify(v.limit)}`);
  return {
    force: v.force === true,
    dryRun: v["dry-run"] === true,
    only: v.only === undefined ? null : new Set(v.only.split(",").filter(Boolean)),
    limit: v.limit === undefined ? Infinity : Number(v.limit),
    report: v.report ?? null,
  };
}

function parseArgs(argv) {
  try {
    return thumbsOptions(argv);
  } catch (err) {
    console.error(`${err.message}\nusage: ${USAGE}`);
    process.exit(2);
  }
}

function loadEntries() {
  const out = [];
  for (const r of readCatalog(CATALOG)) {
    if (!usableRecord(r)) continue;
    // The shared reading (entry-fields.mjs, #256).
    const { id, url, license, status, publisher, category, attribution_string, preview } = normalizeEntry(r.parsed.meta, r.rel);
    out.push({ id, url, license, status, publisher, category, attribution_string, preview });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST)) return { generated: null, thumbs: {} };
  const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  return { generated: m.generated || null, thumbs: m.thumbs || {}, shared: m.shared || {} };
}

function detectConverter() {
  for (const [name, args] of [
    ["ffmpeg", ["-version"]],
    ["magick", ["-version"]],
  ]) {
    try {
      execFileSync(name, args, { stdio: "ignore" });
      return name;
    } catch {
      // Try the next one.
    }
  }
  return null;
}

function convert(converter, input, output) {
  if (converter === "ffmpeg") {
    execFileSync(
      "ffmpeg",
      ["-y", "-loglevel", "error", "-i", input, "-frames:v", "1", "-vf", "scale='min(640,iw)':-2", "-c:v", "libwebp", "-quality", "78", output],
      { stdio: ["ignore", "ignore", "pipe"], timeout: CONVERT_TIMEOUT_MS, killSignal: "SIGKILL", maxBuffer: 1024 * 1024 }
    );
  } else {
    execFileSync("magick", [`${input}[0]`, "-resize", "640x>", "-quality", "78", output], { stdio: ["ignore", "ignore", "pipe"], timeout: CONVERT_TIMEOUT_MS, killSignal: "SIGKILL", maxBuffer: 1024 * 1024 });
  }
}

/**
 * An image's bytes, capped at maxBytes whatever content-length says, and
 * only when they are a PNG, JPEG, GIF or WebP. `fetchOptions` reaches
 * safeFetch (tests inject `fetchImpl` and `lookup`).
 */
export async function fetchBytes(url, { maxBytes = MAX_IMAGE_BYTES, fetchOptions = {} } = {}) {
  const safe = safeImageUrl(url);
  if (!safe) throw new Error(`image URL refused (needs a public https host): ${url}`);
  // Every redirect hop and resolved address is checked before it is requested.
  const { response: res } = await safeFetch(safe, { headers: { "user-agent": USER_AGENT, accept: "image/*" }, signal: AbortSignal.timeout(TIMEOUT_MS) }, { schemes: ["https:", "http:"], ...fetchOptions });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new Error(`image is ${declared} bytes, over the ${maxBytes} limit`);
  // Stream with a cap: content-length is optional and may lie.
  const chunks = [];
  let total = 0;
  const reader = res.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`image is over the ${maxBytes} byte limit`);
    }
    chunks.push(value);
  }
  const buf = Buffer.concat(chunks);
  if (!sniffImage(buf)) throw new Error("response is not a PNG, JPEG, GIF or WebP image");
  return buf;
}

async function fetchText(url) {
  const { response: res, finalUrl } = await safeFetch(url, { headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" }, signal: AbortSignal.timeout(TIMEOUT_MS) }, { schemes: ["https:", "http:"] });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { html: await res.text(), finalUrl };
}

/** The reason a converter run failed: the last line of its stderr, or the error message. */
export function convertFailure(err) {
  const last = err && err.stderr ? String(err.stderr).trim().split("\n").pop() : "";
  return `convert failed: ${last || (err && err.message) || "unknown error"}`;
}

/** Fetches one entry's preview. Returns { record, bytes } or throws with a reason. */
async function fetchOne(entry, { converter, tmpDir, today }) {
  if (!converter) throw new Error("no converter on PATH (ffmpeg or magick)");
  const pinned = /^https:\/\//.test(entry.preview || "");
  let image = entry.preview;
  if (!pinned) {
    // Relative og:image paths resolve against the page actually served, after redirects.
    const page = await fetchText(entry.url);
    image = imageUrlFromHtml(page.html, page.finalUrl);
  }
  if (!image) throw new Error("page has no og:image or twitter:image");
  const source = await fetchBytes(image);
  const hash = createHash("sha256").update(source).digest("hex").slice(0, 16);
  const input = path.join(tmpDir, `${entry.id}.src`);
  const output = path.join(tmpDir, `${entry.id}.webp`);
  fs.writeFileSync(input, source);
  try {
    convert(converter, input, output);
  } catch (err) {
    throw new Error(convertFailure(err));
  } finally {
    fs.rmSync(input, { force: true });
  }
  const bytes = fs.readFileSync(output);
  fs.rmSync(output, { force: true });
  const size = webpSize(bytes);
  if (!size) throw new Error("converter did not produce a readable WebP");
  const record = { source: entry.url, image, fetched: today, hash, width: size.width, height: size.height, license: entry.license };
  if (pinned) record.pinned = true;
  return { record, bytes };
}

async function pool(items, worker, size) {
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, run));
}

export function reportMarkdown(summary) {
  const lines = [`# Thumbnail run ${summary.today}`, ""];
  lines.push(`Converter: ${summary.converter || "none"}. Fetched ${summary.fetched.length}, kept ${summary.kept}, skipped ${summary.skipped.length}, failed ${summary.failed.length} (failure count raised on ${summary.bumped.length}), removed ${summary.removed.length}, dropped as shared images ${summary.dropped.length}.`, "");
  const list = (title, rows, fmt) => {
    if (!rows.length) return;
    lines.push(`## ${title}`, "");
    for (const r of rows) lines.push(`- ${fmt(r)}`);
    lines.push("");
  };
  list("Fetched", summary.fetched, (r) => `${r.id} (${r.width}x${r.height}, ${r.bytes} bytes)`);
  list("Failed", summary.failed, (r) => `${r.id}: ${r.reason}`);
  list("Removed (no longer eligible or gone)", summary.removed, (r) => `${r.id}: ${r.reason}`);
  list("Dropped as shared images", summary.dropped, (r) => `${r.id} (hash ${r.hash})`);
  list("Skipped by the gate", summary.skipped.filter((r) => r.kind === "gate"), (r) => `${r.id}: ${r.reason}`);
  return `${lines.join("\n")}\n`;
}

/**
 * The run's plan, before any fetch (pure; #264): drops records whose entry
 * is gone or no longer eligible, then sorts every entry into kept, skipped
 * (gate, shared, limit) or todo. `fileExists(id)` says whether the entry's
 * .webp is on disk. Returns `{ thumbs, shared, todo, summary }`; the maps
 * are copies of the manifest's.
 */
export function planRun({ entries, manifest, fileExists, opts, today, converter = null }) {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const thumbs = { ...manifest.thumbs };
  // Entries whose image turned out to be shared (a logo): remembered so they
  // are not fetched again until the record would be refreshed anyway.
  const shared = { ...manifest.shared };
  const summary = { today, converter, fetched: [], kept: 0, skipped: [], failed: [], bumped: [], removed: [], dropped: [] };

  // Records whose entry is gone or no longer eligible go first, so a licence
  // that changed to custom never survives a run.
  for (const [id, rec] of Object.entries(thumbs)) {
    const entry = byId.get(id);
    const gate = entry ? previewEligibility(entry) : { ok: false, reason: "entry no longer in the catalog" };
    if (!gate.ok) {
      summary.removed.push({ id, reason: gate.reason, hash: rec.hash });
      delete thumbs[id];
    }
  }
  for (const id of Object.keys(shared)) {
    const entry = byId.get(id);
    if (!entry || !previewEligibility(entry).ok) delete shared[id];
  }

  const todo = [];
  for (const entry of entries) {
    if (opts.only && !opts.only.has(entry.id)) continue;
    const gate = previewEligibility(entry);
    if (!gate.ok) {
      summary.skipped.push({ id: entry.id, reason: gate.reason, kind: "gate" });
      continue;
    }
    const rec = thumbs[entry.id];
    const fetchOpts = { license: entry.license, today, force: opts.force, url: entry.url, preview: entry.preview || "" };
    if (!rec && shared[entry.id] && !needsFetch(shared[entry.id], fetchOpts)) {
      summary.skipped.push({ id: entry.id, reason: "image shared with other entries", kind: "shared" });
      continue;
    }
    if (!needsFetch(rec, fetchOpts) && fileExists(entry.id)) {
      summary.kept += 1;
      continue;
    }
    if (todo.length >= opts.limit) {
      summary.skipped.push({ id: entry.id, reason: "over --limit", kind: "limit" });
      continue;
    }
    todo.push(entry);
  }
  return { thumbs, shared, todo, summary };
}

/**
 * A failed fetch (pure; mutates `thumbs` and `summary`). A source that keeps
 * failing does not keep its old image forever, and a record for a url or pin
 * the entry no longer has goes at once.
 */
export function recordFailure({ thumbs, summary, entry, reason, today, countFailure }) {
  summary.failed.push({ id: entry.id, reason });
  const old = thumbs[entry.id];
  if (!old) return;
  const kept = afterFailure(old, { today, url: entry.url, preview: entry.preview || "", countFailure });
  if (!kept) {
    summary.removed.push({ id: entry.id, reason: `refresh failed and the stored image is stale (${reason})`, hash: old.hash });
    delete thumbs[entry.id];
  } else if (kept !== old) {
    thumbs[entry.id] = kept;
    // A raised failure count is a change: without it the count never
    // reaches the repository and the MAX_FAILURES rule cannot fire.
    summary.bumped.push({ id: entry.id, failures: kept.failures });
  }
}

/**
 * After the fetches (pure; mutates `thumbs`, `shared`, `pending`, `summary`):
 * moves logos to `shared`, sorts both maps and counts the net change against
 * the manifest. Returns `{ sorted, sortedShared, changed }`.
 */
export function settleRun({ manifest, thumbs, shared, pending, summary }) {
  // A hash shared by three or more entries is a logo, not a preview. Logos
  // dropped in earlier runs (in `shared`) count toward the three.
  for (const id of sharedImageIds(thumbs, shared)) {
    summary.dropped.push({ id, hash: thumbs[id].hash });
    shared[id] = thumbs[id];
    delete thumbs[id];
    pending.delete(id);
  }
  for (const id of Object.keys(thumbs)) delete shared[id];

  const byKey = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const sorted = byKey(thumbs);
  const sortedShared = byKey(shared);
  // Only a net change to the manifest or the files counts, so a run that
  // refetches and re-drops the same shared images changes nothing.
  const changed = manifestChanges(manifest, { thumbs: sorted, shared: sortedShared }) + pending.size;
  return { sorted, sortedShared, changed };
}

/** Files in the thumbs folder to delete: a .webp with no manifest record. Other files stay. */
export function orphanThumbs(names, sorted) {
  return names.filter((name) => name.endsWith(".webp") && !sorted[name.replace(/\.webp$/, "")]);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const today = new Date().toISOString().slice(0, 10);
  const converter = detectConverter();
  const manifest = loadManifest();
  const fileExists = (id) => fs.existsSync(path.join(THUMBS_DIR, `${id}.webp`));
  const { thumbs, shared, todo, summary } = planRun({ entries: loadEntries(), manifest, fileExists, opts, today, converter });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "fgda-thumbs-"));
  const pending = new Map(); // id → bytes to write

  await pool(
    todo,
    async (entry) => {
      try {
        const { record, bytes } = await fetchOne(entry, { converter, tmpDir, today });
        thumbs[entry.id] = record;
        pending.set(entry.id, bytes);
        summary.fetched.push({ id: entry.id, width: record.width, height: record.height, bytes: bytes.length });
        process.stdout.write(`  + ${entry.id} ${record.width}x${record.height} ${bytes.length} B\n`);
      } catch (err) {
        recordFailure({ thumbs, summary, entry, reason: err.message, today, countFailure: Boolean(converter) });
        process.stdout.write(`  ! ${entry.id}: ${err.message}\n`);
      }
    },
    CONCURRENCY
  );

  const { sorted, sortedShared, changed } = settleRun({ manifest, thumbs, shared, pending, summary });

  if (!opts.dryRun) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true });
    for (const [id, bytes] of pending) fs.writeFileSync(path.join(THUMBS_DIR, `${id}.webp`), bytes);
    for (const name of orphanThumbs(fs.readdirSync(THUMBS_DIR), sorted)) fs.rmSync(path.join(THUMBS_DIR, name), { force: true });
    if (changed) {
      const out = { generated: today, thumbs: sorted, ...(Object.keys(sortedShared).length ? { shared: sortedShared } : {}) };
      fs.writeFileSync(MANIFEST, `${JSON.stringify(out, null, 2)}\n`);
    }
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const report = reportMarkdown(summary);
  if (opts.report) fs.writeFileSync(opts.report, report);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
  console.log(
    `thumbs: fetched ${summary.fetched.length}, kept ${summary.kept}, skipped ${summary.skipped.length}, failed ${summary.failed.length}, removed ${summary.removed.length}, dropped ${summary.dropped.length}${opts.dryRun ? " (dry run, nothing written)" : ""}; ${Object.keys(sorted).length} thumbnails in the manifest`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((err) => {
  console.error(`thumbs failed: ${err.stack || err.message}`);
  process.exit(1);
});

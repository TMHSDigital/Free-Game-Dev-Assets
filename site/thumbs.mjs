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
import { listEntryFiles, idMatchesFile } from "./lib/entry-files.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { imageUrlFromHtml, needsFetch, previewEligibility, sharedImageIds, webpSize } from "./lib/thumbs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const THUMBS_DIR = path.join(__dirname, "public", "thumbs");
const MANIFEST = path.join(__dirname, "thumbs.json");
const USER_AGENT = "Mozilla/5.0 (compatible; FreeGameDevAssets-thumbs; +https://github.com/TMHSDigital/Free-Game-Dev-Assets)";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const TIMEOUT_MS = 20000;
const CONCURRENCY = 4;

function parseArgs(argv) {
  const opts = { force: false, only: null, limit: Infinity, dryRun: false, report: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--force") opts.force = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--only") opts.only = new Set(String(argv[++i] || "").split(",").filter(Boolean));
    else if (a === "--limit") opts.limit = Number(argv[++i]);
    else if (a === "--report") opts.report = argv[++i];
    else throw new Error(`unknown argument ${a}`);
  }
  return opts;
}

function loadEntries() {
  const out = [];
  for (const file of listEntryFiles(CATALOG)) {
    const parsed = parseFrontmatter(fs.readFileSync(file, "utf8"));
    if (!parsed || parsed.errors.length || !idMatchesFile(parsed.meta.id, file)) continue;
    const m = parsed.meta;
    out.push({
      id: String(m.id),
      url: String(m.url || ""),
      license: String(m.license || ""),
      status: String(m.status || ""),
      publisher: m.publisher ? String(m.publisher) : undefined,
      category: String(m.category || ""),
      attribution_string: m.attribution_string ? String(m.attribution_string) : undefined,
      preview: m.preview === undefined || m.preview === null ? undefined : String(m.preview),
    });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST)) return { generated: null, thumbs: {} };
  const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  return { generated: m.generated || null, thumbs: m.thumbs || {} };
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
      { stdio: ["ignore", "ignore", "pipe"] }
    );
  } else {
    execFileSync("magick", [`${input}[0]`, "-resize", "640x>", "-quality", "78", output], { stdio: ["ignore", "ignore", "pipe"] });
  }
}

async function fetchBytes(url, { maxBytes = MAX_IMAGE_BYTES } = {}) {
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "*/*" }, signal: AbortSignal.timeout(TIMEOUT_MS), redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new Error(`image is ${declared} bytes, over the ${maxBytes} limit`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > maxBytes) throw new Error(`image is ${buf.length} bytes, over the ${maxBytes} limit`);
  return buf;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" }, signal: AbortSignal.timeout(TIMEOUT_MS), redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** Fetches one entry's preview. Returns { record, bytes } or throws with a reason. */
async function fetchOne(entry, { converter, tmpDir, today }) {
  if (!converter) throw new Error("no converter on PATH (ffmpeg or magick)");
  const pinned = /^https:\/\//.test(entry.preview || "");
  const image = pinned ? entry.preview : imageUrlFromHtml(await fetchText(entry.url), entry.url);
  if (!image) throw new Error("page has no og:image or twitter:image");
  const source = await fetchBytes(image);
  const hash = createHash("sha256").update(source).digest("hex").slice(0, 16);
  const input = path.join(tmpDir, `${entry.id}.src`);
  const output = path.join(tmpDir, `${entry.id}.webp`);
  fs.writeFileSync(input, source);
  try {
    convert(converter, input, output);
  } catch (err) {
    const stderr = err.stderr ? String(err.stderr).trim().split("\n").pop() : err.message;
    throw new Error(`convert failed: ${stderr}`);
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

function reportMarkdown(summary) {
  const lines = [`# Thumbnail run ${summary.today}`, ""];
  lines.push(`Converter: ${summary.converter || "none"}. Fetched ${summary.fetched.length}, kept ${summary.kept}, skipped ${summary.skipped.length}, failed ${summary.failed.length}, removed ${summary.removed.length}, dropped as shared images ${summary.dropped.length}.`, "");
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

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const today = new Date().toISOString().slice(0, 10);
  const converter = detectConverter();
  const entries = loadEntries();
  const byId = new Map(entries.map((e) => [e.id, e]));
  const manifest = loadManifest();
  const thumbs = { ...manifest.thumbs };
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "fgda-thumbs-"));
  const summary = { today, converter, fetched: [], kept: 0, skipped: [], failed: [], removed: [], dropped: [] };
  const pending = new Map(); // id → bytes to write

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

  const todo = [];
  for (const entry of entries) {
    if (opts.only && !opts.only.has(entry.id)) continue;
    const gate = previewEligibility(entry);
    if (!gate.ok) {
      summary.skipped.push({ id: entry.id, reason: gate.reason, kind: "gate" });
      continue;
    }
    const rec = thumbs[entry.id];
    const fileExists = fs.existsSync(path.join(THUMBS_DIR, `${entry.id}.webp`));
    if (!needsFetch(rec, { license: entry.license, today, force: opts.force }) && fileExists) {
      summary.kept += 1;
      continue;
    }
    if (todo.length >= opts.limit) {
      summary.skipped.push({ id: entry.id, reason: "over --limit", kind: "limit" });
      continue;
    }
    todo.push(entry);
  }

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
        summary.failed.push({ id: entry.id, reason: err.message });
        process.stdout.write(`  ! ${entry.id}: ${err.message}\n`);
      }
    },
    CONCURRENCY
  );

  // A hash shared by three or more entries is a logo, not a preview.
  for (const id of sharedImageIds(thumbs)) {
    summary.dropped.push({ id, hash: thumbs[id].hash });
    delete thumbs[id];
    pending.delete(id);
  }

  const sorted = Object.fromEntries(Object.entries(thumbs).sort(([a], [b]) => a.localeCompare(b)));
  const changed = summary.fetched.length + summary.removed.length + summary.dropped.length;

  if (!opts.dryRun) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true });
    for (const [id, bytes] of pending) fs.writeFileSync(path.join(THUMBS_DIR, `${id}.webp`), bytes);
    for (const name of fs.readdirSync(THUMBS_DIR)) {
      const id = name.replace(/\.webp$/, "");
      if (name.endsWith(".webp") && !sorted[id]) fs.rmSync(path.join(THUMBS_DIR, name), { force: true });
    }
    fs.writeFileSync(MANIFEST, `${JSON.stringify({ generated: today, thumbs: sorted }, null, 2)}\n`);
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const report = reportMarkdown(summary);
  if (opts.report) fs.writeFileSync(opts.report, report);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
  console.log(
    `thumbs: fetched ${summary.fetched.length}, kept ${summary.kept}, skipped ${summary.skipped.length}, failed ${summary.failed.length}, removed ${summary.removed.length}, dropped ${summary.dropped.length}${opts.dryRun ? " (dry run, nothing written)" : ""}; ${Object.keys(sorted).length} thumbnails in the manifest`
  );
}

main().catch((err) => {
  console.error(`thumbs failed: ${err.stack || err.message}`);
  process.exit(1);
});

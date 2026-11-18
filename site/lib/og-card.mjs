/**
 * Pure helpers for site/og-card.mjs, the script that retakes
 * docs/images/readme/og-card.png (the README screenshot and the social card),
 * and for site/entry-cards.mjs, which renders each entry page's own card (#117).
 */
import path from "node:path";

export const OG_CARD_WIDTH = 1200;
export const OG_CARD_HEIGHT = 630;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** `{ width, height }` from a PNG's IHDR chunk, or null when the bytes are not a PNG. */
export function pngSize(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 24) return null;
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  if (buf.toString("latin1", 12, 16) !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/**
 * Where to look for Chrome, Chromium or Edge, most specific first. `env.CHROME_PATH`
 * wins; bare names are looked up on PATH by the caller.
 */
export function chromeCandidates(platform, env = {}) {
  const list = [];
  if (env.CHROME_PATH) list.push(env.CHROME_PATH);
  if (platform === "win32") {
    for (const base of [env.PROGRAMFILES, env["PROGRAMFILES(X86)"], env.LOCALAPPDATA].filter(Boolean)) {
      list.push(path.win32.join(base, "Google", "Chrome", "Application", "chrome.exe"));
      list.push(path.win32.join(base, "Microsoft", "Edge", "Application", "msedge.exe"));
    }
  } else if (platform === "darwin") {
    list.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
    list.push("/Applications/Chromium.app/Contents/MacOS/Chromium");
    list.push("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge");
  } else {
    list.push("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge");
  }
  return list;
}

/**
 * The headless Chrome arguments for one 1200x630 light-mode capture of `url`
 * into `out`, with a fresh profile so no stored theme choice applies.
 */
export function chromeArgs({ url, out, profileDir }) {
  return [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--force-color-profile=srgb",
    "--force-device-scale-factor=1",
    "--blink-settings=preferredColorScheme=1",
    `--user-data-dir=${profileDir}`,
    `--window-size=${OG_CARD_WIDTH},${OG_CARD_HEIGHT}`,
    // Lets fonts, scripts and the lazy thumbnails finish before the capture.
    "--virtual-time-budget=10000",
    `--screenshot=${out}`,
    url,
  ];
}

/* --------------------------------------------------------- entry cards */

/** File name of an entry's own social card, next to its page (#117). */
export const ENTRY_CARD_NAME = "card.png";

const escCard = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Where an entry's card is served, and its alt text, for baseHeadHtml's `ownCard`. */
export function entryCardRef(entry) {
  return {
    path: `entry/${entry.id}/${ENTRY_CARD_NAME}`,
    alt: `${entry.name}: ${entry.license} licence, read at the source ${entry.verified || "(date not recorded)"}`,
  };
}

const COMMERCIAL_WORDS = { true: "Commercial use OK", false: "Not for commercial use", varies: "Commercial use varies per file", unknown: "Commercial use unclear" };

/**
 * The 1200x630 page site/entry-cards.mjs screenshots for one entry: its
 * name, category, licence, commercial verdict and the date the licence was
 * read. `fontRoot` is where the self-hosted fonts are served.
 */
export function entryCardHtml(entry, { siteTitle, categoryLabel = entry.category, fontRoot = "/" }) {
  const commercial = COMMERCIAL_WORDS[String(entry.commercial)] || COMMERCIAL_WORDS.unknown;
  const ok = entry.commercial === true;
  const long = String(entry.name).length > 38;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>${escCard(entry.name)}</title>
<style>
@font-face { font-family: "Public Sans"; src: url("${fontRoot}fonts/public-sans.woff2") format("woff2"); font-weight: 100 900; }
@font-face { font-family: "IBM Plex Mono"; src: url("${fontRoot}fonts/ibm-plex-mono-400.woff2") format("woff2"); }
html, body { margin: 0; width: ${OG_CARD_WIDTH}px; height: ${OG_CARD_HEIGHT}px; overflow: hidden; }
body { box-sizing: border-box; padding: 64px 72px; background: #eef1f4; color: #12151a; font-family: "Public Sans", sans-serif; display: flex; flex-direction: column; border-top: 14px solid #1a4d3e; }
.site { font: 500 26px "IBM Plex Mono", monospace; color: #5a6472; letter-spacing: 0.02em; }
.cat { margin-top: 44px; font: 600 28px "Public Sans", sans-serif; color: #1a4d3e; text-transform: uppercase; letter-spacing: 0.08em; }
h1 { margin: 12px 0 0; font-weight: 800; font-size: ${long ? 60 : 76}px; line-height: 1.05; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.facts { margin-top: auto; display: flex; gap: 18px; flex-wrap: wrap; }
.pill { font: 600 30px "Public Sans", sans-serif; padding: 12px 24px; border-radius: 999px; border: 3px solid #c5ccd6; background: #f7f8fa; }
.pill.ok { border-color: #1a4d3e; color: #1a4d3e; }
.pill.warn { border-color: #8a5a12; color: #8a5a12; }
.read { margin-top: 26px; font: 400 28px "IBM Plex Mono", monospace; color: #5a6472; }
</style></head>
<body>
<div class="site">${escCard(siteTitle)}</div>
<div class="cat">${escCard(categoryLabel)}</div>
<h1>${escCard(entry.name)}</h1>
<div class="facts"><span class="pill">Licence: ${escCard(entry.license)}</span><span class="pill ${ok ? "ok" : "warn"}">${escCard(commercial)}</span>${entry.status === "active" ? "" : `<span class="pill warn">${escCard(entry.status)}</span>`}</div>
<div class="read">Licence read at the source ${escCard(entry.verified || "(date not recorded)")}</div>
</body></html>
`;
}

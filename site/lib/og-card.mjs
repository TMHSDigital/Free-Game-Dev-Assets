/**
 * Pure helpers for site/og-card.mjs, the script that retakes
 * docs/images/readme/og-card.png (the README screenshot and the social card).
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

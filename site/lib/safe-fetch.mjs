/**
 * Outbound fetches for the CI scripts (thumbnails, link check) that cannot be
 * steered at the runner's own network. A catalog URL is contributor input and
 * an og:image is chosen by a third-party site, so every hop is checked:
 * the URL's host by name (isPrivateHost), then every address the name
 * resolves to, and redirects are followed by hand so each Location gets the
 * same checks before it is requested.
 *
 * Limit: fetch resolves the name again when it connects, so a DNS server that
 * answers differently the second time (rebinding) is not stopped here. That
 * needs a custom connector, which Node's built-in fetch does not expose
 * without a dependency.
 */
import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";
import { isPrivateHost } from "./thumbs.mjs";

export const MAX_REDIRECTS = 5;

function v4Parts(ip) {
  const p = ip.split(".").map(Number);
  return p.length === 4 && p.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) ? p : null;
}

/**
 * True for an IP address a CI fetch must not reach: loopback, private,
 * link-local, carrier-grade NAT, unspecified, multicast and reserved ranges,
 * in IPv4 and IPv6 (including IPv4-mapped IPv6).
 */
export function isPrivateAddress(ip) {
  const s = String(ip).toLowerCase().replace(/^\[|\]$/g, "");
  const kind = isIP(s);
  if (kind === 4) {
    const [a, b] = v4Parts(s);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  if (kind === 6) {
    if (s === "::" || s === "::1") return true;
    const mapped = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    if (/^::ffff:[0-9a-f]{1,4}:[0-9a-f]{1,4}$/.test(s)) return true; // mapped, hex form: refuse rather than decode
    const first = parseInt(s.split(":")[0] || "0", 16);
    return (first & 0xfe00) === 0xfc00 || (first & 0xffc0) === 0xfe80 || (first & 0xff00) === 0xff00;
  }
  return true; // not an address at all: refuse
}

/** The reason a URL may not be requested, or null when it may. */
export function refusalFor(raw, { schemes = ["https:"] } = {}) {
  let u;
  try {
    u = new URL(String(raw));
  } catch {
    return "not a valid URL";
  }
  if (!schemes.includes(u.protocol)) return `scheme ${u.protocol} is not allowed`;
  if (u.username || u.password) return "URL carries credentials";
  if (isPrivateHost(u.hostname)) return `host ${u.hostname} is private or an IP literal`;
  return null;
}

/** Throws a fetch-style TypeError (with `cause`) so callers can keep reading err.cause.code. */
function refuse(message, code = "EREFUSED") {
  const err = new TypeError(`fetch refused: ${message}`);
  err.cause = Object.assign(new Error(message), { code });
  return err;
}

/**
 * fetch(), with each hop's URL and resolved addresses checked first and at
 * most MAX_REDIRECTS redirects. Returns the final response; `response.url`
 * is not set for manual hops, so the final URL is returned as `finalUrl`.
 */
export async function safeFetch(url, init = {}, { schemes = ["https:"], maxRedirects = MAX_REDIRECTS, lookup = dnsLookup, fetchImpl = fetch } = {}) {
  let current = String(url);
  for (let hop = 0; ; hop += 1) {
    const reason = refusalFor(current, { schemes });
    if (reason) throw refuse(reason);
    const { hostname } = new URL(current);
    let addresses;
    try {
      addresses = await lookup(hostname, { all: true, verbatim: true });
    } catch (err) {
      const wrapped = new TypeError("fetch failed");
      wrapped.cause = err;
      throw wrapped;
    }
    const bad = addresses.find((a) => isPrivateAddress(a.address));
    if (bad) throw refuse(`${hostname} resolves to a private address`);
    const res = await fetchImpl(current, { ...init, redirect: "manual" });
    const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!location) return { response: res, finalUrl: current };
    res.body?.cancel().catch(() => {});
    if (hop >= maxRedirects) throw refuse(`more than ${maxRedirects} redirects`, "EREDIRECTS");
    current = new URL(location, current).href;
  }
}

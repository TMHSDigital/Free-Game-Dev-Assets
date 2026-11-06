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

/** A valid IPv6 address as eight 16-bit numbers (a dotted IPv4 tail is folded in). */
function v6Hextets(s) {
  let text = s.replace(/%.*$/, "");
  const tail = text.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (tail) {
    const p = v4Parts(tail[1]);
    text = `${text.slice(0, -tail[1].length)}${((p[0] << 8) | p[1]).toString(16)}:${((p[2] << 8) | p[3]).toString(16)}`;
  }
  const [head, rest] = text.split("::");
  const part = (x) => (x ? x.split(":").map((h) => parseInt(h, 16)) : []);
  const h = part(head);
  const r = rest === undefined ? [] : part(rest);
  return [...h, ...Array(8 - h.length - r.length).fill(0), ...r];
}

/** Two hextets as a dotted IPv4 address. */
const v4From = (hi, lo) => `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;

// Cloud platform addresses outside the reserved ranges that answer from inside
// a runner (Azure's wire server, which GitHub-hosted runners sit behind).
const PLATFORM_V4 = new Set(["168.63.129.16"]);

/**
 * True for an IP address a CI fetch must not reach: loopback, private,
 * link-local, carrier-grade NAT, unspecified, multicast, documentation and
 * reserved ranges, and known cloud platform addresses, in IPv4 and IPv6. An
 * IPv6 form that carries an IPv4 address (mapped, compatible, NAT64, 6to4) is
 * judged by that address; one that hides it (Teredo, SIIT) is refused.
 */
export function isPrivateAddress(ip) {
  const s = String(ip).toLowerCase().replace(/^\[|\]$/g, "");
  const kind = isIP(s);
  if (kind === 4) {
    const [a, b, c] = v4Parts(s);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113) ||
      PLATFORM_V4.has(s)
    );
  }
  if (kind === 6) {
    const h = v6Hextets(s);
    const zeros = (n) => h.slice(0, n).every((x) => x === 0);
    // ::/96 (unspecified, loopback, IPv4-compatible): deprecated, never public.
    if (zeros(6)) return true;
    // ::ffff:0:0/96 IPv4-mapped: judge the IPv4 address.
    if (zeros(5) && h[5] === 0xffff) return isPrivateAddress(v4From(h[6], h[7]));
    // ::ffff:0:0:0/96 SIIT and anything else under ::/64 or 100::/64: refuse.
    if (zeros(4) || (h[0] === 0x100 && h[1] === 0 && h[2] === 0 && h[3] === 0)) return true;
    // 64:ff9b::/96 NAT64: judge the IPv4 address; 64:ff9b:1::/48 local NAT64: refuse.
    if (h[0] === 0x64 && h[1] === 0xff9b) return h[2] === 1 || isPrivateAddress(v4From(h[6], h[7]));
    // 2002::/16 6to4: judge the IPv4 address in hextets 1 and 2.
    if (h[0] === 0x2002) return isPrivateAddress(v4From(h[1], h[2]));
    // 2001::/32 Teredo (obfuscated IPv4) and 2001:db8::/32 documentation.
    if (h[0] === 0x2001 && (h[1] === 0 || h[1] === 0xdb8)) return true;
    const first = h[0];
    // fc00::/7 unique local, fe80::/10 link-local, fec0::/10 site-local, ff00::/8 multicast.
    return (first & 0xfe00) === 0xfc00 || (first & 0xff80) === 0xfe80 || (first & 0xff00) === 0xff00;
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

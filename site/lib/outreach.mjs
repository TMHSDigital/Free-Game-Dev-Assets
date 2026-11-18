/**
 * Tracking of the catalog's pull requests to other repositories (#118):
 * curated lists and similar. Each one has a tracking issue here whose body
 * carries the last state seen, in a hidden marker; .github/workflows/
 * outreach-prs.yml reads the pull request every day and reports what changed.
 * Pure: the script (site/outreach-prs.mjs) does the fetching and writing.
 */

/** "owner/repo#123" -> { owner, repo, number }, or null. */
export function parsePrRef(ref) {
  const m = String(ref).match(/^([\w.-]+)\/([\w.-]+)#(\d+)$/);
  return m ? { owner: m[1], repo: m[2], number: Number(m[3]) } : null;
}

const MARKER = /<!-- outreach-state: (\{.*?\}) -->/s;

/** The state stored in a tracking issue's body, or null. */
export function readState(body) {
  const m = String(body || "").match(MARKER);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/** The body with its state marker replaced (or appended). */
export function writeState(body, state) {
  const marker = `<!-- outreach-state: ${JSON.stringify(state)} -->`;
  const text = String(body || "");
  return MARKER.test(text) ? text.replace(MARKER, marker) : `${text.replace(/\s*$/, "")}\n\n${marker}\n`;
}

/**
 * The current state of a pull request from its API data. `activity` is
 * every review and comment, as { id, user, kind, state?, url }; activity by
 * `self` (our own replies) is left out, since it needs no attention.
 */
export function currentState(pr, activity, self) {
  const others = activity.filter((a) => a.user && a.user.toLowerCase() !== String(self).toLowerCase());
  return {
    state: pr.merged_at ? "merged" : pr.state, // open | closed | merged
    seen: others.map((a) => a.id).sort((x, y) => x - y),
  };
}

/** Markdown-inert text: a code span, so a login or URL cannot ping or link. */
const code = (s) => `\`${String(s).replaceAll("`", "'")}\``;

/**
 * What to do about one tracked pull request: the comment to post (or null),
 * whether to close the tracking issue and with what reason, and the state to
 * store. `before` is null on the first run, which records the state quietly.
 */
export function plan(ref, pr, activity, before, self) {
  const now = currentState(pr, activity, self);
  if (!before) return { comment: null, close: null, state: now };
  const lines = [];
  const seen = new Set(before.seen || []);
  const fresh = activity.filter((a) => a.user && a.user.toLowerCase() !== String(self).toLowerCase() && !seen.has(a.id));
  if (fresh.length) {
    lines.push(`New activity on ${pr.html_url}:`);
    for (const a of fresh) {
      const what = a.kind === "review" ? `review (${String(a.state || "").toLowerCase().replace(/_/g, " ")})` : a.kind === "review-comment" ? "review comment" : "comment";
      lines.push(`- ${what} by ${code(a.user)}: ${a.url}`);
    }
  }
  let close = null;
  if (now.state !== before.state) {
    if (now.state === "merged") {
      lines.push(`${code(ref)} was merged. The listing is live; closing this tracking issue.`);
      close = "completed";
    } else if (now.state === "closed") {
      lines.push(`${code(ref)} was closed without merging. Read the thread for the reason; closing this tracking issue.`);
      close = "not_planned";
    } else {
      lines.push(`${code(ref)} is ${now.state} again.`);
    }
  }
  if (fresh.some((a) => a.kind === "review" && a.state === "CHANGES_REQUESTED")) {
    lines.push("", "Changes were requested: this needs a reply or an update to the pull request.");
  }
  return { comment: lines.length ? lines.join("\n") : null, close, state: now };
}

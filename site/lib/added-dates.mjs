/**
 * An entry's `added` date is when it joined the catalog, and it never
 * changes afterwards. Moving a file to another category is a rename in git,
 * not a new entry, so the date of the first commit that added the file, under
 * any earlier path, is the latest `added` may be. (A date before that commit
 * is fine: a contributor's pull request is often written before it merges.)
 * Pure; site/check-added.mjs runs git.
 */

/**
 * Repo path => YYYY-MM-DD the file was first added, following renames, from
 * `git log --reverse --format=%x00%at --name-status -M --diff-filter=AR`
 * output (oldest commit first). A Unix timestamp header is read as a UTC
 * date, the same clock new-entry.mjs writes `added` with (#247); a
 * YYYY-MM-DD header is taken as is.
 */
export function firstAddedFromLog(out) {
  const first = new Map();
  let date = null;
  for (const raw of String(out).split("\n")) {
    if (raw.startsWith("\0")) {
      date = commitDay(raw.slice(1).trim());
      continue;
    }
    const parts = raw.split("\t");
    if (!date || parts.length < 2) continue;
    if (parts[0] === "A") {
      if (!first.has(parts[1])) first.set(parts[1], date);
    } else if (/^R\d*$/.test(parts[0]) && parts.length >= 3) {
      first.set(parts[2], first.get(parts[1]) ?? date);
    }
  }
  return first;
}

/** Entries whose `added` is later than their file's first commit. `entries` is [{ rel, added }]. */
export function lateAddedDates(entries, firstAdded) {
  const errors = [];
  for (const { rel, added } of entries) {
    const first = firstAdded.get(rel);
    if (first && added && String(added) > first) {
      errors.push(`${rel} added ${added} is later than the file's first commit (${first}, following renames); set added: ${first}`);
    }
  }
  return errors;
}

/** "1730851200" (Unix seconds) => its UTC YYYY-MM-DD; anything else unchanged. */
export function commitDay(token) {
  return /^\d+$/.test(token) ? new Date(Number(token) * 1000).toISOString().slice(0, 10) : token;
}

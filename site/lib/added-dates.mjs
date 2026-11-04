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
 * `git log --reverse --format=%x00%as --name-status -M --diff-filter=AR`
 * output (oldest commit first).
 */
export function firstAddedFromLog(out) {
  const first = new Map();
  let date = null;
  for (const raw of String(out).split("\n")) {
    if (raw.startsWith("\0")) {
      date = raw.slice(1).trim();
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

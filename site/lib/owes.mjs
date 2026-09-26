/**
 * What a set of picked entries owes, shared by the stack pages (build time)
 * and the reader's shortlist (browser). No imports: the build copies this file
 * into site/dist as owes.js, and shortlist.js imports it there.
 */

/**
 * What the picks owe, one row per entry (an entry picked for two needs is
 * listed once with both). `picked` is [{ need, entry }] with payload entries.
 */
export function owes(picked) {
  const byId = new Map();
  for (const { need, entry } of picked) {
    if (byId.has(entry.id)) byId.get(entry.id).needs.push(need);
    else byId.set(entry.id, { entry, needs: [need] });
  }
  const items = [...byId.values()];
  const credit = (i) => i.entry.attribution_required;
  return {
    credits: items.filter((i) => credit(i) === true).map((i) => ({ ...i, line: i.entry.attribution_string || null })),
    // Licences that oblige you to carry their notice with the files (MIT, OFL,
    // Apache...), which is not a credits-screen line (license-vocabulary.json).
    notices: items.filter((i) => i.entry.attributionClass === "notice"),
    noCredit: items.filter((i) => credit(i) === false),
    unclear: items.filter((i) => credit(i) !== true && credit(i) !== false),
    perFile: items.filter((i) => i.entry.commercial === "varies"),
    openQuestions: items.filter((i) => i.entry.status === "needs-review"),
  };
}

/** Every canned credit line, one per line, in pick order. */
export function copyAllText(owed) {
  return owed.credits
    .filter((c) => c.line)
    .map((c) => c.line)
    .join("\n");
}

/**
 * A CREDITS file for what `owed` lists. `format` is "md" or "txt"; `pageUrl`
 * maps an entry to its catalog page; `date` is the YYYY-MM-DD it was made.
 * Every section a stack page shows is here, so nothing owed is dropped on the
 * way from the shortlist to the game's repository.
 */
export function creditsFile(owed, { format = "md", pageUrl = () => "", date = "", source = "Free Game Dev Assets" } = {}) {
  const md = format === "md";
  const out = [];
  const heading = (text) => {
    out.push("", md ? `## ${text}` : `${text}\n${"-".repeat(text.length)}`, "");
  };
  const name = (e) => (md && pageUrl(e) ? `[${e.name}](${pageUrl(e)})` : e.name);
  const ref = (e) => (!md && pageUrl(e) ? ` <${pageUrl(e)}>` : "");
  const list = (items, detail) => {
    for (const i of items) out.push(`- ${name(i.entry)} (${i.entry.license})${detail ? `: ${detail(i)}` : ""}${ref(i.entry)}`);
  };

  out.push(md ? "# Credits" : "CREDITS\n=======");
  out.push(
    "",
    `Made from a shortlist on ${source}${date ? ` on ${date}` : ""}. Each licence was checked at its source on the date its catalog entry shows; re-read the source before you ship.`
  );

  if (owed.credits.length) {
    heading("Credits to ship");
    for (const c of owed.credits) {
      if (c.line) out.push(md ? `- ${c.line}` : `  ${c.line}`);
      else out.push(`- ${name(c.entry)}${ref(c.entry)}: no canned credit line; see the entry.`);
    }
  }
  if (owed.notices.length) {
    heading("Notices to keep with the files");
    out.push("Carry each licence and copyright notice with what you redistribute. This is not a credits-screen line.", "");
    list(owed.notices);
  }
  if (owed.perFile.length) {
    heading("Check each file");
    out.push("Some files in these sources qualify and some do not. Check the licence of each file you take.", "");
    list(owed.perFile);
  }
  if (owed.openQuestions.length) {
    heading("Open questions");
    out.push("These entries are marked needs review: something about their terms is not settled.", "");
    list(owed.openQuestions);
  }
  if (owed.unclear.length) {
    heading("Unclear credit");
    out.push("Whether credit is required is not recorded. Read the entry's Notes.", "");
    list(owed.unclear);
  }
  if (owed.noCredit.length) {
    heading("No credit needed");
    list(owed.noCredit);
  }
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

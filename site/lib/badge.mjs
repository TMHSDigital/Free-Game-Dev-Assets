/**
 * The per-entry badge (#117): a static SVG at badge/<id>.svg saying the
 * catalog read the source's licence and when, for publishers to link back
 * with. Coloured by licence family. Pure.
 */
import { esc } from "./shared.mjs";

const FAMILY_COLOURS = {
  "public-domain": "#2e7d32",
  permissive: "#1565c0",
  "cc-by": "#00796b",
  copyleft: "#b26a00",
  "non-commercial": "#8b2e2e",
};

/** Approximate text width at 11px Verdana, as shields.io badges measure it. */
export function textWidth(text) {
  let w = 0;
  for (const ch of String(text)) w += /[mwMW@]/.test(ch) ? 10 : /[ijlI.,:;'|!·]/.test(ch) ? 3.5 : /[A-Z0-9]/.test(ch) ? 7.5 : 6.5;
  return Math.ceil(w);
}

/** The badge SVG: "Free Game Dev Assets | <licence> · read <date>". */
export function badgeSvg(entry) {
  const left = "Free Game Dev Assets";
  const right = `${entry.license}${entry.verified ? ` · read ${entry.verified}` : ""}`;
  const lw = textWidth(left) + 12;
  const rw = textWidth(right) + 12;
  const colour = FAMILY_COLOURS[entry.licenseFamily] || "#5a6472";
  const label = `${left}: ${right}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lw + rw}" height="20" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <rect width="${lw}" height="20" fill="#12151a"/>
  <rect x="${lw}" width="${rw}" height="20" fill="${colour}"/>
  <g fill="#fff" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11" text-anchor="middle">
    <text x="${lw / 2}" y="14">${esc(left)}</text>
    <text x="${lw + rw / 2}" y="14">${esc(right)}</text>
  </g>
</svg>
`;
}

/** Markdown and HTML a publisher can paste to show the badge, linking the entry page. */
export function badgeSnippets(entry, siteUrl) {
  const base = String(siteUrl).replace(/\/+$/, "");
  const page = `${base}/entry/${entry.id}/`;
  const img = `${base}/badge/${entry.id}.svg`;
  const alt = `Licence read by Free Game Dev Assets`;
  return {
    markdown: `[![${alt}](${img})](${page})`,
    html: `<a href="${page}"><img src="${img}" alt="${alt}" /></a>`,
  };
}

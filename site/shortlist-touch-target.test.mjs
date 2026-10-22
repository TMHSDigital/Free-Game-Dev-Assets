import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("./public/styles.css", import.meta.url), "utf8");
const touchRules = css.match(/@media\s*\(pointer:\s*coarse\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
const targetRule = touchRules.match(/([^{}]+)\{([^{}]*)\}/g)?.find((rule) =>
  rule.split("{")[0].includes(".entry-links button")
);
assert.ok(targetRule, "coarse-pointer styles must include .entry-links button");
const declarations = Object.fromEntries(
  [...targetRule.split("{")[1].matchAll(/([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()])
);
assert.equal(Number.parseFloat(declarations["min-height"]), 44, "shortlist hit area must be at least 44px tall");

const padding = declarations.padding?.match(/^(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px$/);
const margin = declarations.margin?.match(/^(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px$/);
assert.ok(padding && margin, "touch target padding and margin must use pixel values");
assert.equal(Number(padding[1]) + Number(margin[1]), 0, "vertical padding and margin must cancel to preserve layout");
assert.equal(Number(padding[2]) + Number(margin[2]), 0, "horizontal padding and margin must cancel to preserve layout");

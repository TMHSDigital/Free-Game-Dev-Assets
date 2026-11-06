/**
 * A small JSON Schema (draft 2020-12) checker for the keywords
 * site/data.schema.json uses, so the build can hold data.json to its
 * published schema with no dependency: type, enum, required, properties,
 * additionalProperties, unevaluatedProperties (false only, over properties
 * and one local $ref), items, pattern, minimum and local "#/$defs/..." $ref.
 * Any other keyword throws, so the schema cannot quietly use one this does
 * not enforce. Pure.
 */

const KNOWN = new Set([
  "$schema", "$id", "$defs", "$ref", "title", "description",
  "type", "enum", "required", "properties", "additionalProperties", "unevaluatedProperties",
  "items", "pattern", "minimum", "minLength",
]);

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  return typeof v;
}

function typeMatches(want, v) {
  const t = typeOf(v);
  return want === t || (want === "number" && t === "integer");
}

function resolve(root, ref) {
  if (!ref.startsWith("#/")) throw new Error(`schema-check: only local $ref is supported, got ${ref}`);
  let node = root;
  for (const part of ref.slice(2).split("/")) {
    node = node?.[part];
    if (node === undefined) throw new Error(`schema-check: $ref ${ref} does not resolve`);
  }
  return node;
}

const show = (v) => (typeof v === "string" ? JSON.stringify(v.length > 40 ? `${v.slice(0, 40)}…` : v) : JSON.stringify(v));

/** Errors as "path: message" strings; empty when `value` matches `schema`. */
export function schemaErrors(schema, value, { root = schema, path = "$" } = {}) {
  const errors = [];
  for (const key of Object.keys(schema)) {
    if (!KNOWN.has(key)) throw new Error(`schema-check: unsupported keyword "${key}" at ${path}`);
  }
  if (schema.unevaluatedProperties !== undefined && schema.unevaluatedProperties !== false) {
    throw new Error(`schema-check: unevaluatedProperties must be false at ${path}`);
  }
  const ref = schema.$ref ? resolve(root, schema.$ref) : null;
  if (ref) errors.push(...schemaErrors(ref, value, { root, path }));

  if (schema.type !== undefined) {
    const types = [].concat(schema.type);
    if (!types.some((t) => typeMatches(t, value))) {
      errors.push(`${path}: expected ${types.join(" or ")}, got ${typeOf(value)}`);
      return errors;
    }
  }
  if (schema.enum && !schema.enum.some((e) => e === value)) {
    errors.push(`${path}: ${show(value)} is not one of ${schema.enum.map((e) => JSON.stringify(e)).join(", ")}`);
  }
  if (typeof value === "string" && schema.pattern && !new RegExp(schema.pattern, "u").test(value)) {
    errors.push(`${path}: ${show(value)} does not match ${schema.pattern}`);
  }
  if (typeof value === "string" && schema.minLength !== undefined && [...value].length < schema.minLength) {
    errors.push(`${path}: ${show(value)} is shorter than ${schema.minLength}`);
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${path}: ${value} is below ${schema.minimum}`);
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, i) => errors.push(...schemaErrors(schema.items, item, { root, path: `${path}[${i}]` })));
  }
  if (typeOf(value) === "object") {
    for (const key of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(`${path}: missing required "${key}"`);
    }
    const props = schema.properties || {};
    for (const [key, sub] of Object.entries(props)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) errors.push(...schemaErrors(sub, value[key], { root, path: `${path}.${key}` }));
    }
    const extra = Object.keys(value).filter((k) => !Object.prototype.hasOwnProperty.call(props, k));
    if (schema.additionalProperties === false) {
      for (const k of extra) errors.push(`${path}: unexpected key "${k}"`);
    } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      for (const k of extra) errors.push(...schemaErrors(schema.additionalProperties, value[k], { root, path: `${path}.${k}` }));
    }
    if (schema.unevaluatedProperties === false) {
      const evaluated = new Set([...Object.keys(props), ...Object.keys(ref?.properties || {})]);
      for (const k of Object.keys(value)) if (!evaluated.has(k)) errors.push(`${path}: unexpected key "${k}"`);
    }
  }
  return errors;
}

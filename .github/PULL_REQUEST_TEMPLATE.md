## Type

- [ ] New catalog entry
- [ ] License / metadata correction
- [ ] Starter stack
- [ ] Docs or site

## Checklist

- [ ] Started from `node site/new-entry.mjs <category> <id>` or copied `catalog/TEMPLATE.md` (new entries)
- [ ] `id` is unique across the whole catalog
- [ ] Live license checked today; `## Evidence` has a dated line quoting it
- [ ] Row added to the category `README.md`, with the same licence as the frontmatter
- [ ] Ran `node site/sync-counts.mjs` after adding or removing entries
- [ ] Stacks: followed `stacks/README.md`; no licence named in a stack's own words
- [ ] `npm test && npm run validate` passes locally (CI runs the full `npm run check`, including the build)

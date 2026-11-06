/**
 * Command-line flags for the site scripts, through node:util parseArgs in
 * strict mode: an unknown or mistyped flag, or a value-taking flag with no
 * value, stops the script with its usage line instead of being ignored.
 */
import { parseArgs } from "node:util";

/** `{ values, positionals }` for argv (without node and the script), or throws a TypeError naming the problem. */
export function readArgs(argv, options, { positionals = false } = {}) {
  return parseArgs({ args: argv, options, strict: true, allowPositionals: positionals });
}

/** readArgs over process.argv; on a bad flag, prints the reason and `usage` and exits 2. */
export function cliArgs(options, usage, { positionals = false } = {}) {
  try {
    return readArgs(process.argv.slice(2), options, { positionals });
  } catch (err) {
    console.error(`${err.message}\nusage: ${usage}`);
    process.exit(2);
  }
}

# Fonts

Self-hosted WOFF2 files for the site, latin subset only. Fetched on 2026-10-23 from the Google Fonts CSS API (`https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400`) with a desktop Chrome user agent, which serves the `U+0000-00FF` latin subset. The `@font-face` rules live at the top of `../styles.css`; `baseHeadHtml` in `../../lib/shared.mjs` preloads the two files every page needs.

| File | Family | Weights | Licence |
| --- | --- | --- | --- |
| `public-sans.woff2` | Public Sans (variable) | 100 to 900, upright | SIL OFL 1.1 |
| `public-sans-italic.woff2` | Public Sans (variable) | 100 to 900, italic | SIL OFL 1.1 |
| `ibm-plex-mono-400.woff2` | IBM Plex Mono | 400 | SIL OFL 1.1 |
| `ibm-plex-mono-500.woff2` | IBM Plex Mono | 500 | SIL OFL 1.1 |

Licence text and copyright notices: `OFL.txt`. The validator allows binaries under this folder (`site/validate.mjs`, `ALLOWED_BINARY_PREFIXES`); the page checks fail any page that still references Google Fonts.

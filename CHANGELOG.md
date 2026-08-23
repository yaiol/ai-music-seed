# Changelog

## 1.0.4 — 2026-08-23

- The Load dialog reopens in the folder you last used instead of starting in Downloads, and remembers it across restarts
- The help button and the update banner's What's new / Download links open the page in the app's own language, instead of falling back to English for every language beyond English, French, Spanish and German
- Emit the per-language translation chunks into `src/i18n-gen/lang/` (English stays at the root, as the eagerly bundled fallback), which clears the bundler's variable-import and ineffective-dynamic-import warnings
- Update the dev toolchain — Electron 42 → 43, Vite 8.1 → 8.2, lucide-react 1.21 → 1.33, plus patch bumps to React, @vitejs/plugin-react, concurrently and wait-on
- Rename `vite.config.js` to `vite.config.mjs` — the package declares no `type: module`, so the ESM config has to announce itself by extension

## 1.0.3 — 2026-08-17

- Fix the release build failing on GitHub — the pre-build step reached outside the repository for the translation splitter, which exists only in the local workspace
- Ship the translation splitter inside the repository as scripts/i18n-split.mjs, so a clone builds with npm alone

## 1.0.2 — 2026-08-17

- Start up faster by loading only the active language's translations, instead of carrying all 52 in the initial bundle
- Generate the per-language translation chunks at build time (src/i18n-gen/, git-ignored)
- Add opt-in main-process startup timing, silent unless YAIOL_STARTUP_LOG is set

## 1.0.1 — 2026-07-28

- Add a Name field to every seed — the seed's own name, above the other fields
- Rename "Output name" to "Output" and make it a real, always-visible template instead of a blank "(auto)" field
- Add the `{name}` output token, and start new seeds at `{name}-{style}-{bpm}`
- Cap the `{chords}` token at the first 8 chords, so a full song chart no longer produces a several-hundred-character file name
- Bump the `.yams` format to schema v2 (`name` + `output` split); a v1 file's `name` migrates to `output` so legacy seeds keep rendering under the same file name
- Fix dropping a `.yams` onto the window opening an untitled tab that could neither Save nor Render — a dropped seed now behaves exactly like one opened with Load
- Update the seed panel translations in all 52 languages for the Name / Output split
- Update README.md and CLAUDE.md for the Name vs Output model and the preload bridge

## 1.0.0 — 2026-07-15

- Initial release

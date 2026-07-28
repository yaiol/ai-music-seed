# Changelog

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

# Changelog

## 2.0.0 — 2026-09-05

- Edit a style inside the app: the Music tab is now a step editor — a grid for each lane on one shared time axis, the chord progression on the same columns underneath, and a playhead that runs while you edit
- Notes are placed by chord degree, not by pitch: row 1 is the root of whatever chord is sounding, so one figure plays every chord in the progression
- A style is a pairing of two figures — one for the chords, one for the bass — each pickable on its own lane; changing either lane, or editing the grid, reads Custom
- An edited figure is saved into the .yams and travels with the seed, so reopening it plays exactly what you wrote even if the style it started from later changes; older .yams files open unchanged
- Beat division (B/2, B/3, B/4, B/6) is a seed-level control that re-times the figure instead of refusing it — eighths become triplets in one click
- Swing is now a control: None, Light, Shuffle or Hard
- The time signature is a picker of the meters the engine actually plays, not free text
- A chord can carry a weight — "2Am 2E G B" holds Am and E for two beats each, letting the chord ring while the figure runs over it, where writing the chord twice re-strikes it
- Per-note flags on the selected note: octave, scale step, accent and ghost, sustain and staccato, last-beat conditions, and the anticipation that voices the next chord early
- Mirror is a per-lane flag rather than a one-shot rewrite: the lane plays back to front, keeps its figure's name, and can be switched off again
- 16 more instruments, 97 in all: two grand pianos, three synth pads and a choir pad in a new Synth family, electric guitar, fingered and picked bass, accordion, bagpipe, ocarina, tenor saxophone, kalimba and jaw harp
- Every articulation of an instrument is a button on its lane row — one click, nothing hidden behind a list — and chevrons step to the previous or next instrument
- Fix a pad or drone playing only the first chord of a line and holding it through the rest
- Fix the fourth degree on a three-note chord repeating the root instead of sounding the octave above it, which made several arpeggios play duplicate notes
- Fix Play looping the first bar of a two-bar figure forever while the rendered file correctly alternated
- Bars per line moved onto the chords, where it belongs, as + / − beside the progression
- Volume, velocity, length and reverb knobs draw the swept arc from their minimum

## 1.5.0 — 2026-09-02

- A real instrument library: 83 sampled instrument packs compiled from openly-licensed sources (VSCO-2-CE, FreePats, Freesound sessions — CC0/CC BY), organized by family, loudness-matched and pitch-normalized to A440
- Live preview: Play runs the seed through a look-ahead scheduler — chords, style, instruments, tempo, meter and mix are all editable while it plays, changes landing on the next chord
- Two independent lanes: separate bass and treble instruments, each with its own volume, octave shift, mute and reverb send
- Reverb rooms (room / chamber / hall / church) fed per lane, plus master highpass/lowpass filters at the end of the chain
- A rebuilt style system on one data model: ten styles in three collections (Pads · Arpeggios · Grooves), with per-step dynamics, staccato/sustain, anticipated chords, turnaround conditions, scale-aware passing notes and polymeter figures
- Redesigned window: Music and Render tabs, compact per-lane instrument rows with knob controls, instruments listed once with articulation buttons, family icons that switch the lane's instrument in one click
- A piano keyboard strip that lights the playing notes per lane and auditions a note on click
- Output-name tokens for the render settings ({instrument-treble}, {instrument-bass}, {reverb-type}, {reverb-amount}, {highpass}, {lowpass})
- .yams files gain per-lane fields (instruments, volumes, octaves, reverb sends); older files load unchanged
- Ship the compiled sample packs in the repo (previously ignored during library curation)
- Update README, dev tooling and build configuration for the new architecture

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

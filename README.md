# AI Music Seed

Turn a chord progression into audio your AI music generator will actually follow.

---

## What it is

AI music generators like Suno don't read chord names typed into a prompt - they only follow harmony they can *hear*. AI Music Seed renders a chord progression to a short audio **seed** (plus a MIDI file) that you upload as a Cover or Extend, so the generator locks to your harmony instead of inventing its own.

It's a focused, single-purpose desktop app: type a progression, pick a texture, render, upload.

---

## Features

- **Harmony Suno can hear** - renders your chord progression to an audio seed you upload as a Cover or Extend, so the generator locks to your harmony instead of inventing its own.
- **Write real chords** - a full vocabulary: triads through 13ths, suspended, diminished and augmented chords, slash-bass, and rests.
- **Four seed textures** - pad, arp, drone or marker - choose how present the seed is, from a full harmonic bed to a near-silent skeleton that nudges without colouring.
- **MP3 or WAV** - export a small MP3 (selectable bitrate, the default for almost every upload) or an uncompressed WAV when you want the raw audio.
- **MIDI alongside** - every render also saves a MIDI of the progression, ready to drop into your DAW.

---

## Download

Pre-built installers are available on the [Releases](../../releases) page (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`).

> **Windows note:** SmartScreen may warn on first launch because the app is not code-signed. Click "More info", then "Run anyway".

---

## Build from source

```bash
npm install
npm run electron:dev   # React + Electron together (dev)
npm run dist           # Windows x64 installer
```

Requires Node.js 20+.

---

## Overview
A React front-end (Create React App) talks to an Electron + Express back-end over a local HTTP API - the standard yaiol Electron shape. There is no database and no seed persistence — the app opens with a single blank seed each launch; a seed is kept by saving it to a `.yams`. It is **multi-document**: several `.yams` seeds are open at once, one per tab, like markzen with `.md`.

### Components

| Layer | What it does |
|---|---|
| React UI (`src/`) | Tabbed multi-document shell (`App`) around one seed-generator form per tab (`SeedPanel`) - progression, BPM, bars, time signature, loops, texture, audio format + bitrate, output name. A seed is saved as a `.yams`; rendering writes the audio + MIDI into that file's folder. |
| Seed engine (`src/lib/seed-engine.js`) | Pure JS, runs in the renderer. Synthesises raw PCM by plain math, then encodes either a 16-bit mono WAV or a mono MP3 (via lamejs), and writes a type-0 MIDI. |
| Express back-end (`electron/main.mjs`) | Local HTTP API on a dynamic port (from 4000). Saves/loads `.yams` files via native dialogs, writes the rendered audio + MIDI to disk (into the seed's `.yams` folder), and reveals files in the OS file manager. |

### How a seed is made

The seed engine started as a JS port of a Python prototype (`chord-seed.py`); the chord vocabulary, render styles and encoders match it, but the **timing model now leads on the JS side** (see below). Each form control maps to an engine param:

| Prototype flag | Form control | Engine param |
|---|---|---|
| `progression` | multi-line textarea | `progression` |
| `--bpm` | number | `bpm` |
| `--bars` | number (0.25 step), "Bars per **line**" | `bars` |
| `--sig` | text (`4/4`, `3/4`, `6/8`...) | `sig` |
| `--loops` | number | `loops` |
| `--style` | select (pad / arp / drone / marker) | `style` |
| `--format` | select (mp3 / wav) + bitrate | `format`, `mp3Bitrate` |
| `--name` | text (blank -> default template) | save filename |

The prototype's `--outdir` flag has no form control: the output folder is the folder the seed's `.yams` lives in, so a seed must be **saved** before it can render (the Render button is disabled until then).

**Output-name tokens.** The name field accepts tokens resolved at render time: `{chords}` (a base name from the chord letters), `{style}`, `{bpm}`, `{loops}`. A blank name uses the default template **`{chords}-{style}-{bpm}`**.

**Timing — line = bar.** The progression is read line by line: each non-blank line is one timing unit of `bars` bars, and the chords on that line **split it evenly** (four chords on a line = a beat each in 4/4; a chord alone on a line holds the whole bar). `[Section]` headers, blank lines and `|` bar marks are stripped, so a chord chart pastes in almost verbatim. `parseLines` → `planEvents` build the timed event list, shared by `generateSeed` (render) and `analyzeSeed` (the render-free size/duration projection shown live under the form).

Supported chords: triads, sixths, sevenths and extensions (`maj7` / `m7` / `7` / `9` / `11` / `13` and their minor/major forms), `sus2` / `sus4`, `dim` / `dim7` / `m7b5`, `aug`, `add9`, slash bass (`D/E`, `Bm/F#`), and rests (`N.C.` / `N.C./B`). Anything the parser doesn't recognise falls back to a major triad on that root, so a typo never crashes the render. Filenames are NTFS-sanitised; the engine writes the audio (MP3 or WAV) alongside a type-0 MIDI of the same progression.

### Tech stack

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Bundler | Vite 8 |
| Desktop shell | Electron 41 |
| Local API | Express 5 |
| Audio synthesis / MIDI | in-house `seed-engine.js` |
| MP3 encoding | `@breezystack/lamejs` |
| Packaging | Electron Builder |

---

## License / links
AI Music Seed is part of [yaiol Applications](https://apps.yaiol.com).

Released under the [MIT License](LICENSE).

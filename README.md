# AI Music Seed

Turn a chord progression into an audio seed (plus MIDI) that your AI music generator follows instead of inventing its own harmony.
This is the Rust / Dioxus desktop version, part of [yaiol Applications](https://apps.yaiol.com).

## Install

Not distributed yet. Build the installer from source (below); it installs the app, its 97 sample packs next to the program, and
registers the `.yams` file type so a double-click opens the file in the app.

## What it is

You write chords (as text or on a step grid), shape each of the treble, bass and chords blocks with a small rhythm figure, pick an
instrument for each, and listen. The result is rendered to a WAV or MP3 audio file and a MIDI file, small enough to hand to an AI
generator as a harmonic guide. Everything is saved in a `.yams` file; several seeds can be open in tabs.

## Features

- Chord progressions as text, with a step grid and a chord strip for editing notes by hand.
- Three blocks (treble, bass, chords), each with its own figure, instrument, volume, tune and colour.
- 97 bundled instrument sample packs (and plain sine), played and rendered inside the app.
- Render to WAV, MP3 and MIDI; the progress and the result are shown in the Render tab.
- Open `.yams` files by dialog, by drag and drop, or by double-click; one window, one tab per file.
- 52 interface languages, light and dark theme.

## Build from source

Requires the Rust toolchain (stable) and, for the installer, the Dioxus CLI (`cargo install dioxus-cli --version 0.7.10 --locked`).

```bash
cargo run                                                       # run in development
cd app && dx bundle --desktop --release --package-types nsis    # Windows installer -> release/
```

## Architecture

A Cargo workspace:

- `engine/` - everything that is not the window: chord text, the figure grammar, the `.yams` document, output names, the sample-pack
  index, and the small local server the page's audio talks to. No UI dependency.
- `app/` - the Dioxus desktop shell: the tabs, the Music and Render form, the step grid, settings. The look comes from the shared
  stylesheets in `app/assets/`; strings come from `locales/<lang>.json`, embedded in the executable at build time.
- `audio/` - the page-side sound: the synthesis, sample playback and the WAV / MP3 / MIDI encoders, bundled into
  `app/assets/audio.js`. The shell pushes the active seed into the page and receives the playhead, the lit keys and finished renders.
- `packs/` - the compiled instrument sample packs, installed as a `packs` folder beside the executable.
- `locales/` - the interface strings, one JSON file per language.

## License

See the repository's license file.

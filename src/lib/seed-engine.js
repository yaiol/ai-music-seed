// ─────────────────────────────────────────────────────────────────────────────
// seed-engine.js - chord progression → harmonic seed (WAV + MIDI), in the browser.
//
// A faithful JS port of the workspace Python prototype (chord-seed.py). Pure
// functions, no DOM, no deps - runs in the Electron renderer. Generates raw
// PCM with plain math (mirrors the Python sample loops exactly), encodes a
// 16-bit WAV, and writes a type-0 MIDI of the same progression.
//
// Suno does not read chord names typed in a prompt - it only follows harmony it
// HEARS. The WAV is what you upload (Cover / Extend); the MIDI is for a DAW.
// ─────────────────────────────────────────────────────────────────────────────

import lamejs from '@breezystack/lamejs';
// Extension is explicit (not the bundler-only extensionless form) so the engine
// still imports under plain node - that is what lets the render output be
// diffed against a previous build outside Vite.
import { renderVoices } from './soundfont.js';
import { voicesOf } from './sample-pack.js';
import { applyReverb, applyReverbSend } from './reverb.js';
import { applyOutputFilter } from './output-filter.js';

const SR = 44100;
export const MP3_BITRATES = [128, 192, 256, 320];   // selectable MP3 "strength"

// Pitch class of the natural note letters; accidentals are applied in notePc().
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function notePc(tok) {
  tok = String(tok).trim();
  let pc = PC[tok[0].toUpperCase()];
  if (tok.length > 1) {
    if (tok[1] === '#') pc += 1;
    else if (tok[1].toLowerCase() === 'b') pc -= 1;
  }
  return ((pc % 12) + 12) % 12;
}

// Quality suffix → intervals above the root. Ordered most-specific first so a
// startsWith() match never fires early (e.g. m7b5 before m7 before m). Anything
// unmatched falls through to a major triad. ⚠ Keep in sync with chord-seed.py.
const CHORD_TABLE = [
  [['maj13', 'major13'],            [0, 4, 7, 11, 14, 21]],
  [['maj11', 'major11'],            [0, 4, 7, 11, 14, 17]],
  [['maj9',  'major9'],             [0, 4, 7, 11, 14]],
  [['maj7',  'major7', 'maj', 'major'], [0, 4, 7, 11]],
  [['m7b5',  'min7b5', 'm7-5'],     [0, 3, 6, 10]],   // half-diminished
  [['mmaj7', 'minmaj7'],            [0, 3, 7, 11]],   // minor-major 7
  [['madd9'],                       [0, 3, 7, 14]],
  [['m13', 'min13'],                [0, 3, 7, 10, 14, 21]],
  [['m11', 'min11'],                [0, 3, 7, 10, 14, 17]],
  [['m9',  'min9'],                 [0, 3, 7, 10, 14]],
  [['m7',  'min7'],                 [0, 3, 7, 10]],
  [['m6',  'min6'],                 [0, 3, 7, 9]],
  [['m', 'min', '-'],               [0, 3, 7]],       // minor triad (after all m-variants)
  [['add9'],                        [0, 4, 7, 14]],
  [['7sus4', '7sus'],               [0, 5, 7, 10]],
  [['7sus2'],                       [0, 2, 7, 10]],
  [['sus2'],                        [0, 2, 7]],
  [['sus4', 'sus'],                 [0, 5, 7]],
  [['dim7'],                        [0, 3, 6, 9]],
  [['dim', 'o'],                    [0, 3, 6]],
  [['aug', '+'],                    [0, 4, 8]],
  [['13'],                          [0, 4, 7, 10, 14, 21]],
  [['11'],                          [0, 4, 7, 10, 14, 17]],
  [['9'],                           [0, 4, 7, 10, 14]],
  [['6'],                           [0, 4, 7, 9]],
  [['7', 'dom'],                    [0, 4, 7, 10]],
];

function chordIntervals(qual) {
  const q = qual.toLowerCase().replace(/[\s()]/g, '');
  for (const [toks, iv] of CHORD_TABLE) {
    for (const tk of toks) if (q.startsWith(tk)) return iv;
  }
  return [0, 4, 7];                                                       // major triad
}

const placeRoot = (pc) => { const n = 60 + (pc % 12); return n > 66 ? n - 12 : n; }; // C4..F#4
const placeBass = (pc) => 36 + (pc % 12);                                            // C2..B2

// Voice a chord symbol into MIDI notes [bass, ...upper]. Handles minor / maj7 /
// 7 / sus / dim, slash bass (D/E, Bm/F#, Gmaj7) and N.C. / N.C./B. [] = rest.
export function voice(sym) {
  sym = String(sym).trim();
  const slash = sym.split('/');
  const head = slash[0].trim();
  const slashBass = slash.length > 1 ? notePc(slash[1]) : null;

  if (head.toUpperCase().replace(/\./g, '').startsWith('NC')) {       // no chord
    return slashBass !== null ? [placeBass(slashBass)] : [];
  }

  const m = head.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!m) throw new Error(`Unrecognised chord: "${sym}"`);
  const rootpc = notePc(m[1] + m[2]);
  const intervals = chordIntervals(m[3]);

  const root = placeRoot(rootpc);
  const upper = intervals.map((iv) => root + iv);
  const bass = placeBass(slashBass !== null ? slashBass : rootpc);
  return [bass, ...upper];
}

const midiToFreq = (n) => 440 * Math.pow(2, (n - 69) / 12);

// Tone: fundamental + harmonics. bright=more upper partials (guitar-ish).
function tone(f, t, bright) {
  const w = 2 * Math.PI * f * t;
  if (bright) {
    return Math.sin(w) + 0.5 * Math.sin(2 * w) + 0.32 * Math.sin(3 * w) + 0.18 * Math.sin(4 * w);
  }
  return Math.sin(w) + 0.35 * Math.sin(2 * w) + 0.15 * Math.sin(3 * w);
}

// ─── Gestures ────────────────────────────────────────────────────────────────
// A style is a GESTURE - how a chord moves inside its bar. It says nothing about
// timbre. Each gesture turns one chord's notes + duration into note events:
//
//   { midi, at, len, vel, synth: { amp, wave, env } }
//     at / len  - frames, relative to the chord's start
//     vel       - MIDI velocity, used when a SAMPLED instrument plays the event
//     synth     - how the BUILT-IN synth voices it (ignored by sampled instruments)
//
// Timbre is the other axis: `instrument`. 'sine' is this file's original synth;
// everything else is a SoundFont preset (see soundfont.js). Keeping gesture and
// timbre apart is what stops "N styles x M instruments" becoming NxM renderers.
//
// Suno absorbs a seed's texture, so the styles trade harmonic clarity against
// how much "sound" leaks: pads = continuous bed · arpeggios = motion ·
// marker = stab + silence · grooves = rhythm-forward lines.
//
// ⚠ EVERY style is a PATTERNS entry (user ruling 2026-09-02): ONE base, the
// same base a future style editor will edit — never a second, code-only kind
// of style. The four hard-coded textures were re-authored as pattern entries
// (pad/drone/marker keep their keys; arp became arpeggio1 in the rename to
// numbered arpeggios). That REVOKED the pre-instrument byte-identity guarantee
// for those styles: an old .yams still loads and plays the same music, but not
// sample-identically (their private waveforms and envelopes are gone; a .yams
// naming 'arp' or another gone key falls back to pad at load). check:parity
// re-baselines at the first commit after this; the guarantee holds from there.

const WAVES = {
  tone:   (f, t) => tone(f, t, false),
  bright: (f, t) => tone(f, t, true),
};

// ─── Two-lane patterns ───────────────────────────────────────────────────────
// A pattern lays the chord out on a beat grid, across TWO INDEPENDENT
// LANES: a bass and a chord part, each with its own subdivision, register and
// note length. That separation is what a single timeline cannot express, and
// what everything thin about a flat pattern comes back to - a bass that cannot
// hold under a moving chord, a chord that cannot move over a held bass.
//
// A lane is written as a SLOT STRING, one token per subdivision:
//
//   ".  .  1  2  .  3  2  1  432 ."
//
//   .        rest
//   1..9     a CHORD TONE by index - 1 root, 2 third, 3 fifth, 4 seventh …
//   432      those tones struck together
//   1+ / 1-  that tone an octave up / down
//
// ⚠ CLAUDE: there is deliberately NO hold/tie token. A note's LENGTH is a
// property of the note (`s` sustain, `'` staccato, the lane's `len`) and notes
// ring until re-struck anyway — a symbol occupying the next slot would be a
// third way to say the same thing. `_` existed here as documentation only: the
// gesture builder skipped it exactly like a rest, so it promised a behaviour
// the engine never had. Removed 2026-09-03; Chord Player has no equivalent
// either (it carries a per-note Duration).
//
// ⚠ CLAUDE: digits are DEGREES, never pitches. "1" is the root of whatever chord
// is sounding, so one string plays any progression. A pattern that stored
// pitches would only work in the key it was written in.
//
// Writing a style is therefore writing two short strings, which is the point:
// the old format was hand-built JS arrays that neither of us could author or
// correct quickly, and that - not the choice of grooves - is why the first
// sixteen came out thin.

// ⚠ Registers are chosen so the two lanes do not collide: the bass owns
// everything below the chord, and the chord sits in one octave around middle C.
// A wide spread is what makes an arrangement sound like separate instruments
// fighting rather than one player.
export const LANE_DEFAULTS = {
  bass:  { step: 8,  octave: 1, vel: 0.85, len: 4, hold: true },
  treble: { step: 16, octave: 3, vel: 0.70, len: 4, hold: false },
};

// Parse a slot string into per-slot note requests.
// Each slot is an array of note objects — `tone` is a 1-based chord-tone index,
// or 'f' (the perfect fifth above the root) or 'r' (the remaining/full upper
// voicing). `r` may carry a START digit: `r3` = the remaining tones FROM the
// third up — Chord Player's "Remaining" block drawn from C3 (2026-09-04); a
// digit right after `r` is that start, never a second note (no shipped
// style ever wrote one). Note starters: 1-9 f r. Suffixes on a note:
//   + / -   octave shift            ^ / v   one SCALE step up / down
//   !       accent   ? ghost        s       sustain to the chord end
//   '       staccato (fixed half-beat, opts out of ring-until-restruck)
//   L / l   only in the last beat of the chord / only when NOT
// Slot prefix @ = EARLY: the whole slot voices the NEXT chord (the push).
// The pre-2026-09 grammar (digits + octave marks) parses byte-identically.
export function parseSlots(str) {
  const slots = [];
  for (const tok of String(str).trim().split(/\s+/)) {
    if (tok === '.') { slots.push([]); continue; }
    const notes = [];
    for (let i = tok[0] === '@' ? 1 : 0; i < tok.length; i++) {
      const d = tok[i];
      let tone = null;
      if (d >= '1' && d <= '9') tone = Number(d);
      else if (d === 'f' || d === 'r') tone = d;
      else continue;
      const note = { tone, oct: 0, scale: 0 };
      if (tone === 'r' && i + 1 < tok.length && tok[i + 1] >= '2' && tok[i + 1] <= '9') { note.from = Number(tok[i + 1]); i++; }
      while (i + 1 < tok.length) {
        const c = tok[i + 1];
        if (c === '+') note.oct++;
        else if (c === '-') note.oct--;
        else if (c === '^') note.scale++;
        else if (c === 'v') note.scale--;
        else if (c === '!') note.acc = true;
        else if (c === '?') note.ghost = true;
        else if (c === 's') note.sus = true;
        else if (c === "'") note.stac = true;
        else if (c === 'L') note.cond = 'last';
        else if (c === 'l') note.cond = 'notLast';
        else break;
        i++;
      }
      notes.push(note);
    }
    if (tok[0] === '@') notes.early = true;
    slots.push(notes);
  }
  return slots;
}

// The inverse of parseSlots — the editor's write path. ⚠ CLAUDE: the grid is
// a PURE VIEW over the slot string, so serialize(parseSlots(s)) must give back
// `s` byte-for-byte for every shipped style (`npm run check:roundtrip`). That
// only holds because suffixes are emitted in ONE canonical order — tone,
// octave, scale step, level, sustain, staccato, condition — and the slot's
// `@` prefix first. If a hand-written style ever disagrees with that order,
// normalise the SOURCE once; never teach the serializer a second order.
export function serializeSlots(slots) {
  return slots.map((cell) => {
    if (!cell || !cell.length) return '.';
    let out = cell.early ? '@' : '';
    for (const nt of cell) {
      out += String(nt.tone);
      if (nt.tone === 'r' && nt.from > 1) out += nt.from;
      for (let k = 0; k < (nt.oct || 0); k++) out += '+';
      for (let k = 0; k > (nt.oct || 0); k--) out += '-';
      for (let k = 0; k < (nt.scale || 0); k++) out += '^';
      for (let k = 0; k > (nt.scale || 0); k--) out += 'v';
      if (nt.acc) out += '!';
      if (nt.ghost) out += '?';
      if (nt.sus) out += 's';
      if (nt.stac) out += "'";
      if (nt.cond === 'last') out += 'L';
      if (nt.cond === 'notLast') out += 'l';
    }
    return out;
  }).join(' ');
}

// The editor's row axis — what a slot can hold, top to bottom. DEGREES, never
// pitches (`1` is the root of whatever chord is sounding), so one grid plays
// any progression. `r` = the whole remaining voicing (Chord Player's tall
// block; `r3` starts it at the third — drawn as a block from that row up),
// `f` = the fifth above the root; `1..4` cover every shipped style.
export const GRID_ROWS = ['r', 4, 3, 2, 1, 'f'];

// A pattern read off disk, made safe. A `.yams` is a text file a user may
// have edited by hand, and the render must never crash on one — every field
// falls back to its lane default, and the two lane strings are normalised
// through parse → serialize, so anything loaded already obeys the round-trip
// law. Returns null for something that is not a pattern at all, and the seed
// then plays its named style.
export function sanitizePattern(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const num = (v, dflt, lo, hi) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
  };
  const lane = (l) => {
    const d = LANE_DEFAULTS[l], src = (p[`${l}Lane`] && typeof p[`${l}Lane`] === 'object') ? p[`${l}Lane`] : {};
    return { step: num(src.step, d.step, 1, 64), octave: num(src.octave, d.octave, 0, 8),
             vel: num(src.vel, d.vel, 0, 1), len: num(src.len, d.len, 1, 64), hold: !!src.hold };
  };
  const slots = (v) => (typeof v === 'string' && v.trim() ? serializeSlots(parseSlots(v)) : '.');
  return { meter: num(p.meter, 4, 0.25, 64),
           bass: slots(p.bass), treble: slots(p.treble),
           bassLane: lane('bass'), trebleLane: lane('treble') };
}

// The beat division, in the MUSICIAN's unit — how many slots per BEAT (Chord
// Player's B/x). A lane's `step` is slots per whole note, the engine's unit,
// so step = division × the meter's denominator (B/2 in x/4 → 8, in x/8 → 16).
// ONE division for the whole seed on screen (user ruling 2026-09-04: per-lane
// divisions still had to share one time axis, so they only bought a
// "disabled here, not there" surprise); the data stays per lane. B/3 and B/6
// are the triplet grids; expressible for as long as the grammar has existed,
// but no shipped style uses one, so their first use is also their first test.
export const BEAT_DIVISIONS = [1, 2, 3, 4, 6, 8];

// Swing as FOUR NAMED LANDMARKS, not a number on screen. The stored value is
// continuous (the odd slot's delay as a share of the slot, see makeGesture);
// these are Chord Player's ratios converted the way import-cp-style does:
// (a−b)/(a+b) — 3:2 → .2, 2:1 → .333 (the triplet feel), 3:1 → .5.
export const SWINGS = [
  { key: 'none', value: 0 }, { key: 'light', value: 0.2 },
  { key: 'shuffle', value: 1 / 3 }, { key: 'hard', value: 0.5 },
];

// Time signatures as a PICKER, not free text: the denominator is a note
// length (a power of two) so the set is closed. Simple + Complex ship;
// Compound (6/8 9/8 12/8) is deliberately absent — there the beat is a dotted
// quarter, so the last-beat condition and swing's every-other-slot rule are
// both wrong for it. Offering 12/8 would be a promise half-kept.
export const SIGNATURES = [
  { group: 'simple',  sigs: ['2/2', '4/2', '2/4', '3/4', '4/4', '3/8'] },
  { group: 'complex', sigs: ['5/4', '7/4', '5/8', '7/8'] },
];

// Move a midi note by whole SCALE steps. The scale is the progression's own
// pitch-class pool (progressionScalePcs) — the seed carries no key field, but
// the chords themselves span the scale the music is in, which is the only
// scale a passing note can belong to. Empty pool → chromatic fallback.
function stepScale(midi, steps, scalePcs) {
  if (!scalePcs || !scalePcs.size) return midi + steps;
  let m = midi;
  const dir = steps > 0 ? 1 : -1;
  for (let k = 0; k < Math.abs(steps); k++) {
    for (let j = 1; j <= 12; j++) {
      const cand = m + dir * j;
      if (scalePcs.has(((cand % 12) + 12) % 12)) { m = cand; break; }
    }
  }
  return m;
}

// The union of every chord's pitch classes — what stepScale steps through.
export function progressionScalePcs(chords) {
  const set = new Set();
  for (const c of chords) for (const nn of (c.notes || [])) set.add(nn % 12);
  return set;
}

// ⚠ CLAUDE: these are OURS, written from convention. Do not paste in another
// product's pattern data — the encoding is a representation, the patterns are
// someone's authored work. A style the USER authored in another product's
// editor and exported is the user's own work and imports fine (groove1).
// Adding a style means adding two strings here.
// ─── The two FIGURE libraries, and the styles that pair them ─────────────
//
// A FIGURE is ONE LANE's steps and the division they are written in — nothing
// else. A STYLE is a named PAIRING of a chord figure with a bass figure, plus
// the lane settings that pairing wants. Chord Player's model, adopted
// 2026-09-04: pick a style and both lanes change; change one lane and the
// style reads "Custom".
//
// ⚠ Velocity, length, hold and register live on the STYLE's lane settings, not
// on the figure. They are what you reach for while listening, and keeping them
// out of the figure is what stops `pad` and `drone` — the same held chord at
// two loudnesses — from being two identical entries in the chord list.
//
// The names are DATA and stay English, like the instruments and the
// articulations: a figure's name is its degree sequence, which is language-
// neutral, and a bass figure's is two or three words a musician already reads.

export const CHORD_FIGURES = {
  // the whole voicing, not a sequence
  chord:   { name: 'Chord',   step: 1,  steps: 'rs' },
  stab:    { name: 'Stab',    step: 1,  steps: "r'" },
  // the basics — short cycles over the chord's degrees, named by the degrees
  // themselves. ⚠ This list is a PALETTE and stays basic (user ruling
  // 2026-09-04): a figure nobody would pick from a list is not a library
  // figure, it is one style's own line, and it belongs inline on that style.
  up3:     { name: '1-2-3',   step: 8,  steps: '1 2 3 1 2 3 1 2' },
  down3:   { name: '3-2-1',   step: 8,  steps: '3 2 1 3 2 1 3 2' },
  up4:     { name: '1-2-3-4', step: 8,  steps: '1 2 3 4 1 2 3 4' },
  down4:   { name: '4-3-2-1', step: 8,  steps: '4 3 2 1 4 3 2 1' },
  updown:  { name: '1-2-3-2', step: 8,  steps: '1 2 3 2 1 2 3 2' },
  a132:    { name: '1-3-2',   step: 8,  steps: '1 3 2 1 3 2 1 3' },
  a1243:   { name: '1-2-4-3', step: 8,  steps: '1 2 4 3 1 2 4 3' },
  a1323:   { name: '1-3-2-3', step: 8,  steps: '1 3 2 3 1 3 2 3' },
  a1324:   { name: '1-3-2-4', step: 8,  steps: '1 3 2 4 1 3 2 4' },
  a1432:   { name: '1-4-3-2', step: 8,  steps: '1 4 3 2 1 4 3 2' },
  a2123:   { name: '2-1-2-3', step: 8,  steps: '2 1 2 3 2 1 2 3' },
};


export const BASS_FIGURES = {
  root:    { name: 'Root',        step: 1,  steps: '1s' },
  rootOct: { name: 'Root + 8',    step: 1,  steps: '1s1-s' },
  stab:    { name: 'Stab',        step: 1,  steps: "1'" },
  fifth:   { name: 'Root · 5th',  step: 8,  steps: '1s . . . f . . .' },
  twice:   { name: 'Root · root', step: 8,  steps: '1s . . . 1 . . .' },
};


// A style is the pairing. `chord` / `bass` either NAME a library figure or
// carry one inline — a style's own line, the kind nobody would pick out of a
// palette. The lane picker reads "Custom" for an inline one, exactly as it
// does for a grid edit. The lane blocks hold only what is NOT the figure's
// business.
export const STYLE_DEFS = {
  pad:        { group: 'pads',    chord: 'chord',   bass: 'root',
                trebleLane: { vel: 0.57, hold: false }, bassLane: { vel: 0.57, hold: false } },
  drone:      { group: 'pads',    chord: 'chord',   bass: 'rootOct',
                trebleLane: { vel: 0.5,  hold: false }, bassLane: { vel: 0.5,  hold: false } },
  marker:     { group: 'pads',    chord: 'stab',    bass: 'stab',
                trebleLane: { vel: 0.88, hold: false }, bassLane: { vel: 0.88, hold: false } },
  arpeggio1:  { group: 'arps',    bass: 'root',
                chord: { name: 'Arpeggio 1', step: 8, steps: '. 1 2 3 4 4 3 2' },
                trebleLane: { vel: 0.79, hold: false }, bassLane: { vel: 0.55, hold: false } },
  arpeggio2:  { group: 'arps',    bass: 'root',
                chord: { name: 'Arpeggio 2', step: 8, steps: '23 1 2 1 3 1 2 14' },
                trebleLane: { vel: 0.7,  hold: false }, bassLane: { vel: 0.7, hold: false, octave: 2 } },
  arpeggio3:  { group: 'arps',    bass: 'fifth',
                chord: { name: 'Arpeggio 3', step: 8, steps: '1 2 3 2 3 2 3 4' },
                trebleLane: { vel: 0.7,  hold: false }, bassLane: { vel: 0.7, hold: false, octave: 2 } },
  arpeggio4:  { group: 'arps',    bass: 'fifth',
                chord: { name: 'Arpeggio 4', step: 8, steps: '1 3 2 3 2 3 2 3 1 2 1 2 1 2 1 2' },
                trebleLane: { vel: 0.7,  hold: false }, bassLane: { vel: 0.7, hold: false, octave: 2 } },
  arpeggio5:  { group: 'arps',    bass: 'twice',
                chord: { name: 'Arpeggio 5', step: 8, steps: '1 2 3 2 1 4' },
                trebleLane: { vel: 0.7,  hold: false }, bassLane: { vel: 0.7, hold: false, octave: 2 } },
  arpeggio6:  { group: 'arps',
                chord: { name: 'Arpeggio 6', step: 16, steps: '. . 1 2 . 3 2 1 432 . . . 3 . 2 . . . 1 2 . 3 2 1 432 . . . . . . .' },
                bass: { name: 'Arpeggio 6', step: 8, steps: '11+ . . . . . . . 11+ . . . . . 2 3' },
                trebleLane: { vel: 0.7 }, bassLane: { vel: 0.7 } },
  groove1:    { group: 'grooves',
                chord: { name: 'Groove 1', step: 16, steps: '. . . . rs . . . . . . . rs . . .' },
                bass: { name: 'Groove 1', step: 16, steps: "1' . . . 1' . . . 1 . 2' . f' . @1v'L2'l . 1' . . . 1' . . . 1 . 1^' . 1' . 1v' . 1' . . . 1' . . . 1 . 2' . f' . 2' . 1' . . . 1' . . . 1 . 1+' . 1v . 1+v' ." },
                trebleLane: { vel: 0.7,  hold: false }, bassLane: { vel: 0.7, hold: false } },
};

// Compose a style into the flat spec the gesture builder consumes. ⚠ The
// figure supplies the lane's STEPS and its `step`; everything else comes from
// the style. Built once at load, so `PATTERNS` is byte-for-byte what it was
// before the split (`npm run check:parity`).
export const chordFigureOf = (v) => (typeof v === 'string' ? CHORD_FIGURES[v] : v);
export const bassFigureOf = (v) => (typeof v === 'string' ? BASS_FIGURES[v] : v);

export function composeStyle(def) {
  const c = chordFigureOf(def.chord), b = bassFigureOf(def.bass);
  return {
    meter: 4, group: def.group,
    bass: b.steps, treble: c.steps,
    bassLane: { step: b.step, ...def.bassLane },
    trebleLane: { step: c.step, ...def.trebleLane },
  };
}

const PATTERNS = Object.fromEntries(
  Object.entries(STYLE_DEFS).map(([k, def]) => [k, composeStyle(def)]));

// The Style menu's collections, in display order — each holds the PATTERNS
// keys tagged with its `group`.
export const STYLE_GROUPS = ['pads', 'arps', 'grooves'].map((g) => ({
  key: g, styles: Object.keys(PATTERNS).filter((k) => PATTERNS[k].group === g),
}));

// Place a chord tone in a lane's register. `notes` is [bass, ...upper] from
// voice(); intervals come from the chord itself so the shape holds in any key.
// ⚠ CLAUDE: chord tones are folded into a FIXED REGISTER, they are not stacked
// upward from the chord's own root. Stacking from the root makes the whole
// voicing swing with the progression — a chord rooted a fifth lower drops its
// entire voicing an octave, which measures as a low-mid pile-up around 250 Hz
// and is heard as "playing lower". Folding is what a keyboard player does
// without thinking: the hand stays put and the fingers change.
//
// The bass is the opposite and must NOT be folded — it follows the root. It
// picks the octave NEAREST the previous bass note, so the line steps rather
// than leaping an octave whenever the root crosses the fold.
function placeTone(notes, lane, tone, oct, octaveBase, tonicPc) {
  const upper = notes.length > 1 ? notes.slice(1) : notes;
  if (!upper.length) return null;
  const rootPc = (lane === 'bass' ? notes[0] : upper[0]) % 12;
  const intervals = upper.map((u) => u - upper[0]);
  const iv = intervals[(tone - 1) % intervals.length];
  // capped at ONE octave: a one-tone "chord" (N.C./B) must not fling degree 4 three octaves up
  const wrap = Math.min(12, 12 * Math.floor((tone - 1) / intervals.length));
  const pc = (rootPc + iv) % 12;

  if (lane === 'bass') {
    // ⚠ The bass window starts at the KEY'S TONIC, not at C. Measured from two
    // exports of one arrangement: in B minor the bass ran B1 F#2 A2, in A minor
    // A1 E2 G2 — each inside one octave beginning on the tonic. Anchoring at C
    // instead drops any root below the tonic a full octave (F#7 landing under
    // Bm), heard as the bass leaping about and measured as a low-mid pile-up.
    // We have no key field, so the first chord's root stands in for the tonic.
    const bbase = 12 * (octaveBase + 1) + (tonicPc == null ? pc : tonicPc);
    return bbase + (((pc - bbase) % 12) + 12) % 12 + wrap + 12 * oct;
  }

  // Chord tones fold into a fixed register; a tone index PAST the end of the
  // chord is that tone again an octave UP (`wrap`) — Chord Player's C4 row
  // on a triad is the root above, and the editor's rows must all sound
  // different (user 2026-09-04: rows 3 and 4 "play exactly the same note").
  // Until then the wrap was deliberately dropped here ("adding the octave
  // put the root a whole register above the voicing"), which made every
  // degree past the chord's size a duplicate of a lower row; the arpeggios
  // that use `4` (arpeggio1/2/3/5/6 — and arpeggio4 only on a one-tone N.C./B chord) changed with this — check:parity lists
  // them, and that change is the fix.
  const base = 12 * (octaveBase + 2);
  return base + (((pc - base) % 12) + 12) % 12 + wrap + 12 * oct;
}

// Envelope shapes, in the synth's per-frame form.
function hitSynth(amp, wave, len) {
  const atk = Math.floor(0.004 * SR);
  return { amp, wave, env: (j) => (j < atk ? j / atk : Math.exp(-3.2 * j / len)) };
}

function heldSynth(amp, wave, len) {
  const atk = Math.floor(0.012 * SR), rel = Math.floor(0.10 * SR);
  return { amp, wave, env: (j) => (j < atk ? j / atk : j > len - rel ? Math.max(0, (len - j) / rel) : 0.9) };
}

/**
 * Build a gesture from a pattern spec that is NOT in the PATTERNS table — a
 * benchmark fixture, not a style the app offers.
 */
export function customGesture(spec, mirror) {
  return makeGesture(spec, mirror);
}

function patternGesture(key) {
  return makeGesture(PATTERNS[key]);
}

function makeGesture(pattern, mirror = null) {

  return (notes, n, ctx) => {
    if (!ctx || !(ctx.barQ > 0) || !(ctx.durQ > 0)) {
      // No timing context: sound the chord once rather than nothing.
      return notes.map((midi) => ({ midi, at: 0, len: n, vel: 88, lane: 'treble',
        synth: heldSynth(0.15, 'tone', n) }));
    }

    const { startQ, durQ, barQ, qToFrames, nextNotes } = ctx;
    const endQ = startQ + durQ;
    const events = [];
    const swing = ctx.swing || 0;

    for (const lane of ['bass', 'treble']) {
      const cfg = { ...LANE_DEFAULTS[lane], ...(pattern[`${lane}Lane`] || {}) };
      // ⚠ MIRROR IS A FLAG, NOT AN EDIT (user ruling 2026-09-04, Chord
      // Player's checkbox). The lane's steps are read back to front here, at
      // play time; the stored figure is untouched, so "1-2-4-3, mirrored"
      // keeps its NAME instead of collapsing to Custom — which is what a
      // one-shot rewrite of the grid did. It also toggles off again, where a
      // baked rewrite cannot.
      const slots = mirror && mirror[lane]
        ? parseSlots(pattern[lane] || '.').reverse()
        : parseSlots(pattern[lane] || '.');
      if (!slots.length) continue;

      const slotQ = 4 / cfg.step;                       // slot length in quarter notes

      // The pattern's OWN length decides how it tiles — a lane written to eight
      // eighth-notes repeats every bar, one written to sixteen repeats every two,
      // and one written to SIX free-runs against the bar, realigning every
      // second bar: Chord Player's lanes, exactly (user ruling 2026-09-04 —
      // "all you need is to mimic"). Every SHIPPED pattern is a whole number
      // of bars (the CP importer unrolls polymeters to their LCM), so this is
      // byte-identical for them (check:parity); only editor-made lengths
      // free-run. Until 2026-09-04 the span was rounded to whole bars — meant
      // to keep a 4/4 pattern anchored in 3/4 — which silenced or wrapped the
      // leftover slots and made the editor's + / − impossible to draw.
      // ⚠ ONE exception, and it is what keeps the 3/4 renders byte-identical:
      // a pattern authored in ANOTHER meter (`meter`, quarters per authored
      // bar — every shipped pattern says 4) still gets the whole-bar rounding
      // in this one. It was written in bars, so it plays in bars: a pad hits
      // on each 3/4 bar instead of drifting a beat per bar. The editor stamps
      // the seed's meter on a lane the moment its steps are edited, so
      // anything the user authors is in the seed's meter and free-runs.
      const rawQ = Math.max(slotQ, slots.length * slotQ);
      const foreignMeter = pattern.meter != null && Math.abs(pattern.meter - barQ) > 1e-9;
      const patternQ = foreignMeter ? Math.max(1, Math.round(rawQ / barQ)) * barQ : rawQ;
      const firstRep = Math.floor(startQ / patternQ) - 1;
      const lastRep = Math.ceil(endQ / patternQ);

      // does a slot begin exactly on this chord's onset?
      const inPat = ((startQ % patternQ) + patternQ) % patternQ;
      const k = inPat / slotQ;
      const onBoundary = Math.abs(k - Math.round(k)) < 1e-9 && Math.round(k) < slots.length;

      for (let rep = firstRep; rep <= lastRep; rep++) {
        for (let s = 0; s < slots.length; s++) {
          const cell = slots[s];
          if (!cell || !cell.length) continue;

          // Swing: delay every odd slot, the shuffle their format stores as a ratio.
          const swung = (s % 2 === 1) ? swing * slotQ * 0.5 : 0;
          let atQ = rep * patternQ + s * slotQ + swung;
          // ⚠ CLAUDE: A CHORD ALWAYS SPEAKS ON ITS OWN ONSET. When the chord
          // starts INSIDE a slot rather than on one, the slot that is sounding
          // is re-voiced at the chord change instead of being skipped — the
          // chords are the content, the pattern is only how they are struck.
          // Without it a pad (one 4-quarter slot) plays the FIRST chord of a
          // line and nothing else: the default seed `Am C G Dm` on one line
          // was Am held for the whole bar (found 2026-09-04 while adding chord
          // weights). The rule was documented as `patternGesture`'s and was
          // lost when the textures became patterns; the sweep that was meant
          // to guard it put every chord on its OWN line, where each one lands
          // on a slot boundary and the gap cannot appear.
          if (atQ < startQ - 1e-9) {
            // ⚠ …but only when nothing already lands ON the onset. A slot can
            // be LONGER than the pattern's tiling period in a foreign meter (a
            // 4-quarter pad slot tiled every 3-quarter bar), and there the
            // in-progress slot and the next repetition's slot would BOTH land
            // on the chord — the same note twice, at the same instant.
            if (onBoundary || atQ + slotQ <= startQ + 1e-9) continue;
            atQ = startQ;                                  // still sounding — re-voice it here
          }
          if (atQ >= endQ) continue;

          const at = Math.max(0, Math.round(qToFrames(atQ - startQ)));
          if (at >= n) continue;
          // "Last beat" = the final quarter of the CURRENT chord — the L/l
          // conditions key off the chord change, so a turnaround fires before
          // any change however long the chord is. (A beat is a quarter note;
          // patterns are authored in x/4.)
          // ⚠ One beat is 4/denominator quarters — it comes from the meter
          // (ctx.beatQ), never a constant. A fixed quarter-note window was
          // right in x/4 and covered two thirds of a 3/8 bar, so an `L`
          // turnaround fired across most of it instead of at its end.
          const lastBeat = atQ >= endQ - (ctx.beatQ || 1) - 1e-9;
          // An @early slot voices the NEXT chord — the push. Falls back to the
          // current chord when there is no next (a one-chord seed).
          const srcNotes = (cell.early && ctx.nextNotes && ctx.nextNotes.length) ? ctx.nextNotes : notes;

          for (const nt of cell) {
            if (nt.cond === 'last' && !lastBeat) continue;
            if (nt.cond === 'notLast' && lastBeat) continue;

            const midis = [];
            if (nt.tone === 'r') {
              // remaining: the lane's upper voicing from `from` (default the
              // root) up, each tone folded the way a plain token would be — a
              // start past the chord's size still sounds that one tone
              const count = Math.max(1, srcNotes.length - 1);
              const from = nt.from || 1;
              for (let k = from; k <= Math.max(count, from); k++) {
                const m = placeTone(srcNotes, lane, k, nt.oct, cfg.octave, ctx.tonicPc);
                if (m !== null && !midis.includes(m)) midis.push(m);
              }
            } else if (nt.tone === 'f') {
              const m = placeTone(srcNotes, lane, 1, nt.oct, cfg.octave, ctx.tonicPc);
              if (m !== null) midis.push(m + 7);
            } else {
              const m = placeTone(srcNotes, lane, nt.tone, nt.oct, cfg.octave, ctx.tonicPc);
              if (m !== null) midis.push(m);
            }

            // How long the note rings — deliberately allowed to overlap what
            // follows, which is what stops a pattern sounding like separate blips.
            let ringQ = cfg.len * slotQ;
            if (cfg.hold) ringQ = Math.max(ringQ, endQ - atQ);
            if (nt.sus) ringQ = endQ - atQ;
            if (nt.stac) ringQ = Math.min(ringQ, 0.5);
            const len = Math.max(1, Math.min(n - at, Math.round(qToFrames(Math.min(ringQ, endQ - atQ)))));

            const v = Math.min(1, cfg.vel * (nt.acc ? 1.25 : nt.ghost ? 0.55 : 1));
            const vel = Math.round(127 * v);
            const amp = 0.20 * v;
            for (let m of midis) {
              if (nt.scale) m = stepScale(m, nt.scale, ctx.scalePcs);
              events.push({ midi: m, at, len, vel, lane, fixedLen: !!nt.stac,
                synth: cfg.hold || nt.sus ? heldSynth(amp * 0.85, 'tone', len) : hitSynth(amp, 'bright', len) });
            }
          }
        }
      }

      // The bar's last bass slot steps toward the next chord's root — the one
      // thing a self-contained pattern cannot express, and the engine already
      // knows what comes next.
      if (lane === 'bass' && pattern.approach && nextNotes && nextNotes.length) {
        const target = nextNotes[0] % 12;
        const here = placeTone(notes, 'bass', 1, 0, cfg.octave, ctx.tonicPc);
        if (here !== null) {
          const up = ((target - (here % 12)) + 12) % 12;
          const approach = here + (up <= 6 ? up - 1 : up - 12 + 1);   // a semitone shy
          const atQ = endQ - slotQ;
          const at = Math.max(0, Math.round(qToFrames(atQ - startQ)));
          const len = Math.max(1, Math.min(n - at, Math.round(qToFrames(slotQ))));
          if (at < n) {
            events.push({ midi: approach, at, len, vel: 96, lane: 'bass',
              synth: hitSynth(0.18, 'tone', len) });
          }
        }
      }
    }
    // ⚠ RING UNTIL RE-STRUCK. A note holds until that same pitch sounds again in
    // its own lane, or until the chord ends — it is never cut at a fixed length.
    // Measured off a reference arrangement, where all eight note lengths in a bar
    // matched this rule exactly. Cutting at a fixed length is what makes a
    // pattern sound like separate events rather than a player holding a chord.
    for (const lane of ['bass', 'treble']) {
      const inLane = events.filter((e) => e.lane === lane).sort((x, y) => x.at - y.at);
      for (let i = 0; i < inLane.length; i++) {
        const ev = inLane[i];
        // A staccato (') step's length is EXPLICIT — the one opt-out from the
        // ring rule. It still counts as a strike that cuts the previous note.
        if (ev.fixedLen) continue;
        const next = inLane.find((o, j) => j > i && o.midi === ev.midi && o.at > ev.at);
        const until = next ? next.at : n;
        ev.len = Math.max(1, Math.min(until - ev.at, n - ev.at));
        ev.synth = heldSynth(ev.synth.amp, ev.synth.wave, ev.len);   // envelope closes over len
      }
    }
    return events;
  };
}

const GESTURES = Object.fromEntries(Object.keys(PATTERNS).map((k) => [k, patternGesture(k)]));

// ONE flat style list (the Textures/Rhythms grouping was removed 2026-09-02 —
// a future regrouping will cut along different lines).
export const STYLES = Object.keys(GESTURES);

// Read access to the catalog for the editor — a COPY, so a working copy can
// never mutate the shipped table (copy-on-edit is the whole model: the ten
// shipped styles are read-only, "edit a built-in" means "start from it").
export function getPattern(key) {
  const p = PATTERNS[key] || PATTERNS.pad;
  return { meter: p.meter, group: p.group, bass: p.bass, treble: p.treble,
           bassLane: { ...(p.bassLane || {}) }, trebleLane: { ...(p.trebleLane || {}) },
           ...(p.approach ? { approach: true } : {}) };
}

// THE RESOLVER — the one answer to "the slot table for this seed", per lane:
//   1. the seed's OWN pattern (`pattern`) — the editor's copy-on-edit,
//      never persisted in phase 1 (it is a monitor field, like `lanes`)
//   2. the FIGURES the seed picked (chordFigure / bassFigure) over its style's —
//      '' means "the same style as the treble", the bassInstrument convention
//   3. PATTERNS, an unknown key falling back to pad (like an unknown room)
export function resolveStyleSpec({ style = 'pad', chordFigure = '', bassFigure = '', pattern = null } = {}) {
  if (pattern) return pattern;
  const def = STYLE_DEFS[style] || STYLE_DEFS.pad;
  return composeStyle({
    ...def,
    chord: CHORD_FIGURES[chordFigure] ? chordFigure : def.chord,
    bass: BASS_FIGURES[bassFigure] ? bassFigure : def.bass,
  });
}


// ⚠ CLAUDE: BOTH the render (planSeedEvents) and the live player go through
// this — never through gestureFor(style) directly — or the preview plays a
// different figure from the file it renders. A plain catalog style keeps its
// prebuilt gesture; only an edit or a mixed lane pair builds one on the fly.
export function gestureForSeed(seed) {
  const mirror = { treble: !!seed.trebleMirror, bass: !!seed.bassMirror };
  if (!seed.pattern && !seed.chordFigure && !seed.bassFigure && !mirror.treble && !mirror.bass) {
    return gestureFor(seed.style);   // the prebuilt gesture — nothing overrides it
  }
  return customGesture(resolveStyleSpec(seed), mirror);
}

// The built-in synth voice. `t` is measured from the CHORD start (at + j), which
// is what keeps a gesture's partials phase-continuous across the bar.
function synthVoice(ev, out, offset, gain = 1) {
  const f = midiToFreq(ev.midi);
  const wave = WAVES[ev.synth.wave];
  for (let j = 0; j < ev.len; j++) {
    const i = ev.at + j;
    const o = offset + i;
    if (o >= out.length) break;
    out[o] += gain * ev.synth.amp * ev.synth.env(j) * wave(f, i / SR);
  }
}


// Normalize float samples to 0.89 peak and convert to 16-bit PCM (shared by
// the WAV and MP3 encoders so both render identical audio).
function floatToInt16(samples) {
  let peak = 1e-9;
  for (let i = 0; i < samples.length; i++) { const a = Math.abs(samples[i]); if (a > peak) peak = a; }
  const scale = 0.89 / peak;
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = Math.round(Math.max(-1, Math.min(1, samples[i] * scale)) * 32767);
  }
  return out;
}

// ─── WAV (16-bit PCM mono) ───────────────────────────────────────────────────
function encodeWav(samples) {
  const pcm = floatToInt16(samples);
  const n = pcm.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const dv = new DataView(buf);
  const ws = (off, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(off + i, s.charCodeAt(i)); };

  ws(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE');
  ws(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * 2, true);
  dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  ws(36, 'data'); dv.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) dv.setInt16(44 + i * 2, pcm[i], true);
  return new Uint8Array(buf);
}

// ─── MP3 (mono, selectable bitrate) ──────────────────────────────────────────
// For a Suno upload seed, MP3 @ ~192 kbps is plenty - a fraction of WAV's size.
function encodeMp3(samples, bitrate) {
  const pcm = floatToInt16(samples);
  const enc = new lamejs.Mp3Encoder(1, SR, bitrate);
  const blockSize = 1152;
  const chunks = [];
  let total = 0;
  for (let i = 0; i < pcm.length; i += blockSize) {
    const buf = enc.encodeBuffer(pcm.subarray(i, i + blockSize));
    if (buf.length) { chunks.push(buf); total += buf.length; }
  }
  const end = enc.flush();
  if (end.length) { chunks.push(end); total += end.length; }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

// ─── MIDI (type-0) ───────────────────────────────────────────────────────────
function vlq(n) {
  const b = [n & 0x7f]; n >>= 7;
  while (n) { b.unshift((n & 0x7f) | 0x80); n >>= 7; }
  return b;
}

// events: [{ notes, quarters }] - each event carries its own length (chords on a
// busy line are shorter than a chord that owns a whole line). A rest (no notes)
// still consumes time: its ticks are carried into the next note-on's delta.
function writeMidi(events, bpm, numer, denom) {
  const TPQ = 480;
  const t = [];
  const push = (...xs) => { for (const x of xs) Array.isArray(x) ? t.push(...x) : t.push(x); };

  const mpqn = Math.floor(60000000 / bpm);
  push(vlq(0), 0xff, 0x51, 0x03, (mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff);
  const dd = Math.max(0, Math.round(Math.log2(denom)));
  push(vlq(0), 0xff, 0x58, 0x04, numer, dd, 24, 8);

  let pending = 0;                                   // unflushed rest ticks
  for (const { notes, quarters } of events) {
    const ticks = Math.floor(TPQ * quarters);
    if (!notes.length) { pending += ticks; continue; }
    notes.forEach((nn, i) => push(vlq(i === 0 ? pending : 0), 0x90, nn, 70));
    pending = 0;
    push(vlq(ticks), 0x80, notes[0], 0);
    for (const nn of notes.slice(1)) push(vlq(0), 0x80, nn, 0);
  }
  push(vlq(0), 0xff, 0x2f, 0x00);

  const u32 = (v) => [(v >> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
  const u16 = (v) => [(v >> 8) & 0xff, v & 0xff];
  const head = ['M', 'T', 'h', 'd'].map((c) => c.charCodeAt(0))
    .concat(u32(6), u16(0), u16(1), u16(TPQ));
  const trk = ['M', 'T', 'r', 'k'].map((c) => c.charCodeAt(0))
    .concat(u32(t.length), t);
  return new Uint8Array(head.concat(trk));
}

// ─── Timing model - line = bar, chords on a line split it ────────────────────
// Each non-blank line is one timing unit ("bar"). [Section] tags and | bar marks
// are ignored, so a chart can be pasted almost verbatim. The chords on a line
// share that unit equally: 4 chords on a line = a beat each (in 4/4); a chord
// alone on a line owns the whole bar.

function timeSig(sig) {
  const [numer, denom] = String(sig).split('/').map(Number);
  const bad = !numer || !denom || (denom & (denom - 1)) !== 0;
  return { numer, denom, bad, barQuarters: bad ? 0 : (numer * 4) / denom };
}

// A chord token may carry a leading WEIGHT — how long it lasts, in the line's
// own units: `2Am` holds Am for twice as long as a bare `G` beside it. Chord
// Player's notation, adopted 2026-09-04.
//
// ⚠ It is NOT the same as writing the chord twice. Every chord speaks on its
// own onset (see makeGesture), so `Am Am` strikes Am a second time where `2Am`
// lets the first strike ring on and the figure keep running over it. That
// extra attack is the whole reason the weight exists.
//
// A weight is a run of digits followed by a non-digit, so a token that is only
// digits stays a (bad) chord symbol and gets reported as unrecognised rather
// than silently becoming a weight with nothing to weigh.
const WEIGHT = /^(\d+)(?=\D)/;
export function chordToken(tok) {
  const m = WEIGHT.exec(tok);
  return m ? { sym: tok.slice(m[0].length), w: Math.max(1, Number(m[1])) } : { sym: tok, w: 1 };
}

// Split the progression text into lines of chord tokens. Drops [Section] tags,
// | bar separators, and blank lines. Returns { sym, w }[][].
export function parseLines(progression) {
  return String(progression)
    .split(/\r?\n/)
    .map((line) => line.replace(/\[[^\]]*\]/g, ' ').replace(/\|/g, ' ').trim())
    .map((line) => line.split(/\s+/).filter(Boolean).map(chordToken))
    .filter((toks) => toks.length > 0);
}

// Turn the text into a flat list of timed events. `bars` is bars-PER-LINE; each
// line's duration is split across its chords BY WEIGHT (a bare chord weighs 1,
// so a line with no weights still splits evenly, exactly as before). The single
// shared source of the timing math, used by both generateSeed and analyzeSeed.
function planEvents(progression, barQuarters, bars, bpm) {
  const events = [];
  for (const toks of parseLines(progression)) {
    const total = toks.reduce((a, t) => a + t.w, 0);
    const unit = (barQuarters * bars) / total;
    for (const { sym, w } of toks) {
      const quarters = unit * w;
      const durS = (quarters * 60) / bpm;
      events.push({ sym, quarters, durS, samples: Math.floor(SR * durS) });
    }
  }
  return events;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * planSeedEvents({ progression, bpm, bars, sig, loops, style })
 *   → { events, totalSamples, sampleRate, voiced }
 *
 * The seed as a flat, ordered stream of note events. Each event carries `at`
 * (frames from ITS CHORD's start) and `chordOffset` (that chord's absolute
 * position), so an absolute position is `chordOffset + at`.
 *
 * ⚠ CLAUDE: the two are kept separate on purpose. The built-in synth measures
 * its phase from the CHORD start, so collapsing them into one absolute number
 * silently changes every rendered waveform. See the gesture header.
 *
 * ⚠ CLAUDE: this is the ONE source of the timed event stream - generateSeed()
 * (export) and seed-player.js (live preview) both consume it. Do not re-derive
 * the ordering anywhere else: float addition is not associative, so even a
 * re-ordered mix stops being byte-identical to what shipped.
 */
export function planChords({ progression, bpm = 80, bars = 1, sig = '4/4' }) {
  const { numer, denom, bad, barQuarters } = timeSig(sig);
  if (bad) throw new Error(`Bad time signature: "${sig}" (denominator must be a power of 2)`);

  const planned = planEvents(progression, barQuarters, bars, bpm);
  if (!planned.length) throw new Error('Empty progression');

  return {
    chords: planned.map((e) => ({ sym: e.sym, notes: voice(e.sym), durS: e.durS, samples: e.samples, quarters: e.quarters })),
    // ⚠ CLAUDE: the BAR, from the time signature alone — NOT multiplied by
    // `bars`. "Bars per line" says how long a LINE lasts; it does not make the
    // bar longer. A rhythm pattern is written per bar and must repeat every bar,
    // so folding `bars` in here stretches the pattern across the whole line and
    // leaves every bar after the first silent.
    barQ: barQuarters,
    // Beats → frames. A rhythm pattern places hits against the bar, so it needs
    // the beat grid, not just the chord's own length.
    qToFrames: (q) => (q * 60 * SR) / bpm,
    numer, denom,
  };
}

/** The gesture for a style, or throws. Exposed so the live player can build one chord at a time. */
export function gestureFor(style) {
  if (!GESTURES[style]) throw new Error(`Unknown style: ${style}`);
  return GESTURES[style];
}

// ─── Lane monitor ────────────────────────────────────────────────────────────
// Soloing one lane, the way a mixer's solo button works: it changes what you
// HEAR, never what is played. Two notes an octave apart pile up in the same
// place on a spectrum, so the only way to tell whether a mix is too heavy low
// down is to take one of them away and listen again.
//
// ⚠ CLAUDE: this is the ONE filter — the exporter and the live player both call
// it, so a preview cannot solo a different set of notes from the render.
export const LANE_MODES = ['both', 'bass', 'treble', 'none'];

export function filterLanes(events, mode) {
  if (!mode || mode === 'both') return events;
  if (mode === 'none') return [];        // both lanes muted — silence, deliberately
  // An untagged event counts as 'treble': a gesture added later without a lane
  // stays audible in the default and in the chord solo, rather than vanishing
  // from both and looking like a bug in the gesture.
  return events.filter((e) => (e.lane || 'treble') === mode);
}

// Shift each lane by whole octaves, independently — some instruments simply
// live an octave away from where the voicing writes them. Uniform per lane,
// applied AFTER the gesture (so ring-until-restruck lengths were resolved on
// the real figure) — restrike relations survive a uniform shift untouched.
// 0/0 returns the events as-is, which keeps parity byte-exact.
export function shiftLaneOctaves(events, trebleOctave, bassOctave) {
  if (trebleOctave || bassOctave) {
    for (const e of events) e.midi += 12 * (e.lane === 'bass' ? bassOctave : trebleOctave);
  }
  return events;
}

export function planSeedEvents({ progression, bpm = 80, bars = 1, sig = '4/4', loops = 4, style = 'pad', swing = 0,
                                lanes = 'both', trebleOctave = 0, bassOctave = 0,
                                chordFigure = '', bassFigure = '', pattern = null, trebleMirror = false, bassMirror = false }) {
  const gesture = gestureForSeed({ style, chordFigure, bassFigure, pattern, trebleMirror, bassMirror });
  const { chords: voiced, barQ, qToFrames, numer, denom } = planChords({ progression, bpm, bars, sig });
  const beatQ = 4 / denom;
  const events = [];
  let offset = 0;
  let startQ = 0;
  // The first chord's root anchors the bass register for the whole seed — our
  // stand-in for a key signature, which the .yams does not carry.
  const tonicPc = voiced[0] && voiced[0].notes.length ? voiced[0].notes[0] % 12 : 0;
  const scalePcs = progressionScalePcs(voiced);
  for (let l = 0; l < loops; l++) {
    for (const e of voiced) {
      if (e.notes.length) {
        // `nextNotes` is what lets a bass line step INTO the chord that follows —
        // the one thing a self-contained pattern cannot know. It wraps at the end
        // so a looping seed walks back into its own first chord.
        const next = voiced[(voiced.indexOf(e) + 1) % voiced.length];
        const ctx = { startQ, durQ: e.quarters, barQ, beatQ, qToFrames, swing, tonicPc, scalePcs,
                      nextNotes: next ? next.notes : null };
        // ⚠ Filter AFTER the gesture has run, never before: note lengths are
        // resolved against the complete set (ring-until-restruck), so soloing a
        // lane must not change how long the notes in it ring. A solo is a
        // listening aid — the surviving notes have to be the same notes.
        const made = shiftLaneOctaves(filterLanes(gesture(e.notes, e.samples, ctx), lanes), trebleOctave, bassOctave);
        for (const ev of made) events.push({ ...ev, chordOffset: offset });
        // Remember where the bass landed, so the next root steps from here
        // instead of leaping an octave whenever it crosses the fold.
      }
      offset += e.samples;
      startQ += e.quarters;
    }
  }
  return { events, totalSamples: offset, sampleRate: SR, voiced, numer, denom };
}

// How many chords the {chords} token keeps. A full song chart holds hundreds of
// symbols; without a cap the derived file name runs to several hundred characters.
const NAME_CHORDS = 8;

// A safe default output filename from the progression: the first NAME_CHORDS chord
// symbols, alphanumerics only ([Section] tags and | marks already dropped by parseLines).
export function defaultName(progression) {
  return (parseLines(progression).flat().slice(0, NAME_CHORDS).map((t) => t.sym).join('').replace(/[^a-zA-Z0-9]/g, '') || 'seed');
}

/**
 * analyzeSeed({ progression, bpm, bars, sig, loops, format, mp3Bitrate })
 *   → { count, invalid: string[], sigBad: boolean, seconds, audioBytes }
 * A render-free projection used to tell the user up front how big the seed will
 * be. Shares planEvents with generateSeed so the duration is exact, but never
 * allocates the audio buffer.
 */
export function analyzeSeed({ progression, bpm = 80, bars = 1, sig = '4/4', loops = 4, format = 'wav', mp3Bitrate = 192 }) {
  const syms = parseLines(progression).flat().map((t) => t.sym);
  const invalid = [];
  for (const sym of syms) {
    try { voice(sym); } catch { invalid.push(sym); }
  }
  const count = syms.length;

  const { bad: sigBad, barQuarters } = timeSig(sig);
  if (sigBad || !count) return { count, invalid, sigBad, seconds: 0, audioBytes: 0 };

  const events = planEvents(progression, barQuarters, bars, bpm);
  const totalSamples = events.reduce((a, e) => a + e.samples, 0) * loops;
  const seconds = totalSamples / SR;

  // WAV = 44-byte header + 16-bit PCM. MP3 ≈ constant bitrate × duration.
  const audioBytes = format === 'mp3'
    ? Math.round((mp3Bitrate * 1000 / 8) * seconds)
    : 44 + totalSamples * 2;

  return { count, invalid, sigBad, seconds, audioBytes };
}

/**
 * generateSeed({ progression, bpm, bars, sig, loops, style, trebleInstrument, soundfont, format, mp3Bitrate })
 *   → { audio: Uint8Array, audioExt: 'wav'|'mp3', midi: Uint8Array, info: {...} }
 *
 * `style` picks the gesture; `trebleInstrument` picks the timbre. 'sine' is the
 * built-in synth and needs nothing else. Any other instrument needs
 * `soundfont` = { sf, presetIndex } with its samples already decoded
 * (soundfont.js → parseSoundFont + loadPreset, both async, so the caller does
 * that ahead of time and this stays synchronous).
 *
 * Throws on an unparseable chord or a malformed time signature.
 */
export function generateSeed({ progression, bpm = 80, bars = 1, sig = '4/4', loops = 4, style = 'pad',
                               trebleInstrument = 'sine', soundfont = null, bassSoundfont = null,
                               // Per-lane mix levels. 1 = untouched, which is why a .yams
                               // from before they existed renders byte-identically.
                               trebleVolume = 1, bassVolume = 1, trebleOctave = 0, bassOctave = 0,
                               // Per-lane reverb SENDS (multipliers, like reverbAmount; null =
                               // fall back to reverbAmount for that lane). Equal sends take the
                               // legacy single-buffer path, so old .yams render byte-identically.
                               swing = 0, reverb = 'none', reverbAmount = 1,
                               // Per-lane figure (chordFigure / bassFigure) and the
                               // editor's in-memory working copy — both resolve through
                               // gestureForSeed, the same way the live player does.
                               chordFigure = '', bassFigure = '', pattern = null, trebleMirror = false, bassMirror = false,
                               trebleReverb = null, bassReverb = null, lanes = 'both',
                               // ⚠ CLAUDE: OFF by default, and it must stay that way — a .yams
                               // written before the filters existed carries no cutoff and has to
                               // keep rendering byte-identically. The 100/10000 starting point is
                               // the APP's choice for a new seed, not the engine's.
                               highpass = 0, lowpass = 0,
                               format = 'wav', mp3Bitrate = 192 }) {
  const { events, totalSamples, voiced, numer, denom } = planSeedEvents({ progression, bpm, bars, sig, loops, style, swing, lanes, trebleOctave, bassOctave, chordFigure, bassFigure, pattern, trebleMirror, bassMirror });

  // A sampled instrument that never loaded falls back to the built-in synth
  // rather than rendering silence - a seed always comes out.
  const sampled = trebleInstrument !== 'sine' && soundfont && (soundfont.sf || soundfont.pack);
  const ts = trebleReverb == null ? reverbAmount : trebleReverb;
  const bs = bassReverb == null ? reverbAmount : bassReverb;
  // Differing sends need the bass lane's own sum to build the room's input.
  // ⚠ The main mix keeps accumulating in EVENT order regardless (the bass just
  // renders twice) — splitting it into lane buffers and summing would change
  // float order and break the byte-identity of every existing render.
  const splitSends = ts !== bs;
  const out = new Float32Array(totalSamples);
  const bassBuf = splitSends ? new Float32Array(totalSamples) : null;
  for (const ev of events) {
    // A pattern's two lanes can play different instruments; a texture has no
    // lanes and uses the chord instrument throughout.
    const provider = ev.lane === 'bass' && bassSoundfont ? bassSoundfont : soundfont;
    // The lane's mix level scales the whole voice, sampled or synth — never
    // ev.vel, which would also switch velocity layers and change the timbre.
    const laneGain = ev.lane === 'bass' ? bassVolume : trebleVolume;
    const voices = sampled || (ev.lane === 'bass' && bassSoundfont)
      ? voicesOf(provider, ev.midi, ev.vel) : [];
    const isBass = ev.lane === 'bass';
    if (voices.length) {
      const scaled = laneGain === 1 ? voices : voices.map((v) => ({ ...v, gain: v.gain * laneGain }));
      renderVoices(scaled, { durS: ev.len / SR, out, offset: ev.chordOffset + ev.at, sampleRate: SR });
      if (splitSends && isBass) renderVoices(scaled, { durS: ev.len / SR, out: bassBuf, offset: ev.chordOffset + ev.at, sampleRate: SR });
    } else {
      synthVoice(ev, out, ev.chordOffset, laneGain);
      if (splitSends && isBass) synthVoice(ev, bassBuf, ev.chordOffset, laneGain);
    }
  }

  // The room goes on over the finished mix — ONE space containing the whole
  // seed; what differs per lane is only how much each SENDS into it (the aux
  // model: bass classically sends little — low frequencies + reverb = mud).
  let wet;
  if (!splitSends) {
    wet = applyReverb(out, reverb, SR, ts);
  } else {
    const sendIn = new Float32Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) sendIn[i] = bs * bassBuf[i] + ts * (out[i] - bassBuf[i]);
    wet = applyReverbSend(out, sendIn, reverb, SR);
  }

  // The master filters go LAST, after the room. A room adds its own low rumble
  // and high fizz, so filtering before it would leave exactly what the filters
  // are there to remove.
  const filtered = applyOutputFilter(wet, { highpass, lowpass }, SR);

  const audio = format === 'mp3' ? encodeMp3(filtered, mp3Bitrate) : encodeWav(filtered);
  const midiEvents = [];
  for (let l = 0; l < loops; l++) for (const e of voiced) midiEvents.push({ notes: e.notes, quarters: e.quarters });
  const midi = writeMidi(midiEvents, bpm, numer, denom);

  return {
    audio,
    audioExt: format === 'mp3' ? 'mp3' : 'wav',
    midi,
    info: {
      progression: voiced.map((e) => e.sym).join(' '),
      voicings: voiced.map((e) => e.notes),
      // ⚠ `lanes` is reported because a soloed render is a PARTIAL file and
      // nothing else in it says so. The .mid alongside is unaffected — it
      // carries the harmony, not the arrangement, so it stays complete.
      bpm, sig, bars, loops, style, reverb, format, lanes, highpass, lowpass,
      trebleInstrument: sampled ? trebleInstrument : 'sine',
      mp3Bitrate: format === 'mp3' ? mp3Bitrate : null,
      seconds: out.length / SR,
    },
  };
}

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

// ─── Render styles ───────────────────────────────────────────────────────────
// Each returns a Float32Array of one chord's duration. Suno absorbs a seed's
// texture, so the styles trade off harmonic clarity vs how much "sound" leaks:
//   pad/drone = continuous bed · arp = motion + top-line · marker = stab + silence

function renderPad(notes, dur) {
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  if (!notes.length) return out;
  const atk = Math.floor(0.02 * SR), rel = Math.floor(0.30 * SR);
  for (const note of notes) {
    const f = midiToFreq(note), amp = 0.16;
    for (let i = 0; i < n; i++) {
      let e;
      if (i < atk) e = i / atk;
      else if (i > n - rel) e = Math.max(0, (n - i) / rel);
      else e = 0.85;
      out[i] += amp * e * tone(f, i / SR, false);
    }
  }
  return out;
}

function renderArp(notes, dur) {
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  if (!notes.length) return out;
  const bass = notes[0], upper = notes.slice(1);
  if (!upper.length) {                       // bass-only (N.C./B)
    const fb = midiToFreq(bass), rel = 0.3 * SR;
    for (let i = 0; i < n; i++) {
      const e = i < n - rel ? 1 : Math.max(0, (n - i) / rel);
      out[i] += 0.18 * e * tone(fb, i / SR, true);
    }
    return out;
  }
  const order = [bass, ...upper, upper[upper.length - 1], ...upper.slice().reverse()];
  const step = Math.floor(n / order.length);
  const pluckAtk = Math.floor(0.005 * SR);
  for (let k = 0; k < order.length; k++) {
    const f = midiToFreq(order[k]), amp = 0.22, start = k * step;
    const plen = Math.min(n - start, Math.floor(step * 2.2));
    for (let j = 0; j < plen; j++) {
      const i = start + j;
      if (i >= n) break;
      const e = j < pluckAtk ? j / pluckAtk : Math.exp(-3.0 * j / plen);
      out[i] += amp * e * tone(f, i / SR, true);
    }
  }
  const fb = midiToFreq(bass), rel = Math.floor(0.3 * SR);
  for (let i = 0; i < n; i++) {
    const e = i < n - rel ? 0.5 : Math.max(0, (n - i) / rel) * 0.5;
    out[i] += 0.10 * e * Math.sin(2 * Math.PI * fb * (i / SR));
  }
  return out;
}

function renderDrone(notes, dur) {
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  if (!notes.length) return out;
  const atk = Math.floor(0.15 * SR), rel = Math.floor(0.18 * SR);
  const droneNotes = [...notes, notes[0] - 12];   // sub-octave root for depth
  for (const note of droneNotes) {
    const f = midiToFreq(note), amp = 0.13;
    for (let i = 0; i < n; i++) {
      let e;
      if (i < atk) e = i / atk;
      else if (i > n - rel) e = Math.max(0, (n - i) / rel);
      else e = 1.0;                                // flat sustain = true drone
      const t = i / SR;
      out[i] += amp * e * (Math.sin(2 * Math.PI * f * t) + 0.22 * Math.sin(2 * Math.PI * 2 * f * t));
    }
  }
  return out;
}

function renderMarker(notes, dur) {
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  if (!notes.length) return out;
  const stab = Math.min(Math.floor(0.45 * SR), Math.floor(n * 0.35));   // blip, then silence
  const atk = Math.floor(0.004 * SR);
  for (const note of notes) {
    const f = midiToFreq(note), amp = 0.20;
    for (let j = 0; j < stab; j++) {
      const e = j < atk ? j / atk : Math.exp(-4.0 * j / stab);
      out[j] += amp * e * tone(f, j / SR, false);
    }
  }
  return out;
}

const RENDERERS = { pad: renderPad, arp: renderArp, drone: renderDrone, marker: renderMarker };
export const STYLES = Object.keys(RENDERERS);

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

// Split the progression text into lines of chord symbols. Drops [Section] tags,
// | bar separators, and blank lines. Returns string[][].
export function parseLines(progression) {
  return String(progression)
    .split(/\r?\n/)
    .map((line) => line.replace(/\[[^\]]*\]/g, ' ').replace(/\|/g, ' ').trim())
    .map((line) => line.split(/\s+/).filter(Boolean))
    .filter((toks) => toks.length > 0);
}

// Turn the text into a flat list of timed events. `bars` is bars-PER-LINE; each
// line's duration is split evenly across its chords. The single shared source of
// the timing math, used by both generateSeed and analyzeSeed.
function planEvents(progression, barQuarters, bars, bpm) {
  const events = [];
  for (const toks of parseLines(progression)) {
    const quarters = (barQuarters * bars) / toks.length;
    const durS = (quarters * 60) / bpm;
    const samples = Math.floor(SR * durS);
    for (const sym of toks) events.push({ sym, quarters, durS, samples });
  }
  return events;
}

// ─── Public API ──────────────────────────────────────────────────────────────

// How many chords the {chords} token keeps. A full song chart holds hundreds of
// symbols; without a cap the derived file name runs to several hundred characters.
const NAME_CHORDS = 8;

// A safe default output filename from the progression: the first NAME_CHORDS chord
// symbols, alphanumerics only ([Section] tags and | marks already dropped by parseLines).
export function defaultName(progression) {
  return (parseLines(progression).flat().slice(0, NAME_CHORDS).join('').replace(/[^a-zA-Z0-9]/g, '') || 'seed');
}

/**
 * analyzeSeed({ progression, bpm, bars, sig, loops, format, mp3Bitrate })
 *   → { count, invalid: string[], sigBad: boolean, seconds, audioBytes }
 * A render-free projection used to tell the user up front how big the seed will
 * be. Shares planEvents with generateSeed so the duration is exact, but never
 * allocates the audio buffer.
 */
export function analyzeSeed({ progression, bpm = 80, bars = 1, sig = '4/4', loops = 4, format = 'wav', mp3Bitrate = 192 }) {
  const syms = parseLines(progression).flat();
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
 * generateSeed({ progression, bpm, bars, sig, loops, style, format, mp3Bitrate })
 *   → { audio: Uint8Array, audioExt: 'wav'|'mp3', midi: Uint8Array, info: {...} }
 * Throws on an unparseable chord or a malformed time signature.
 */
export function generateSeed({ progression, bpm = 80, bars = 1, sig = '4/4', loops = 4, style = 'pad', format = 'wav', mp3Bitrate = 192 }) {
  if (!RENDERERS[style]) throw new Error(`Unknown style: ${style}`);

  const { numer, denom, bad, barQuarters } = timeSig(sig);
  if (bad) throw new Error(`Bad time signature: "${sig}" (denominator must be a power of 2)`);

  const events = planEvents(progression, barQuarters, bars, bpm);
  if (!events.length) throw new Error('Empty progression');
  const voiced = events.map((e) => ({ sym: e.sym, notes: voice(e.sym), durS: e.durS, samples: e.samples, quarters: e.quarters }));

  const render = RENDERERS[style];
  const oneLoopSamples = voiced.reduce((a, e) => a + e.samples, 0);
  const out = new Float32Array(oneLoopSamples * loops);
  let offset = 0;
  for (let l = 0; l < loops; l++) {
    for (const e of voiced) {
      out.set(render(e.notes, e.durS), offset);
      offset += e.samples;
    }
  }

  const audio = format === 'mp3' ? encodeMp3(out, mp3Bitrate) : encodeWav(out);
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
      bpm, sig, bars, loops, style, format,
      mp3Bitrate: format === 'mp3' ? mp3Bitrate : null,
      seconds: out.length / SR,
    },
  };
}

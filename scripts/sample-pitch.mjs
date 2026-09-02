// ─────────────────────────────────────────────────────────────────────────────
// sample-pitch.mjs - measure what pitch a sample file actually sounds.
//
// WHY: a sample library's filename is a CLAIM, not a fact. VSCO 2 CE is an
// aggregation of contributions and they did not agree on an octave convention:
// `KSHarp_A2_mf.wav` really is A2, while `Marimba_hit_Outrigger_C4_loud_01.wav`
// sounds C5 — named on the convention where middle C is called "C3". A compiler
// that trusts the filename produces a pack that is perfectly in tune with itself
// and an octave away from the score, which nothing downstream can detect.
//
// Autocorrelation rather than an FFT peak: it locks onto the PERIOD, which the
// harmonics reinforce instead of hiding. An FFT peak picks whichever partial is
// loudest, and on a struck bar or an organ pipe that is often not the
// fundamental.
//
// ⚠ CLAUDE: this is FALLIBLE, and the failure is always the same shape — a note
// whose fundamental is weak (a pizzicato contrabass, a glockenspiel) reports an
// octave or a fifth out. So a SINGLE measurement never decides anything: callers
// must require agreement across many samples. Do not add an "octave correction"
// heuristic here to paper over it — that was tried on the organ and reported the
// whole library an octave high.
// ─────────────────────────────────────────────────────────────────────────────

import { execFileSync } from 'node:child_process';

export const SR = 44100;

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const noteName = (m) => `${NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;

/** Decode any audio file ffmpeg understands to mono float32 at SR. */
export function pcmOf(file) {
  const raw = execFileSync('ffmpeg',
    ['-v', 'quiet', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'],
    { maxBuffer: 1 << 28 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
}

// ─── Harmonic-series fitting ─────────────────────────────────────────────────
// The second opinion, and the better one where autocorrelation fails.
//
// ⚠ CLAUDE: this exists because autocorrelation was WRONG on real files and the
// error was always an octave — the one error that matters here. Measured:
//   Oboe_Vib_F5_v3_Main.wav   autocorrelation said F5; its spectrum has NO peak
//                             at 700 Hz at all, and a series at 1392/2780/4195.
//                             It is F6. (Samulis's own upload page agrees.)
//   BKCtbss_Pizz_E1_v1_rr1    autocorrelation could not call it; the series is
//                             82/164/328 Hz — E2, an octave above its name.
//
// Fitting the SERIES rather than finding a fundamental is what makes it robust:
// peaks at 2f, 3f and 4f imply f even when f itself is missing, because no other
// candidate explains all three ratios as integers.
//
// ⚠ Among candidates that score alike, take the HIGHEST. f/2 always explains
// everything f does (its even multiples), so a "best score" rule silently drifts
// an octave down for ever. This tie-break IS the octave decision.
const HARMONIC_TOL = 0.045;                        // vibrato smears a partial
const MAX_HARMONIC = 16;

function spectrumPeaks(x) {
  const N = 32768;
  if (x.length < 4096) return [];
  const off = Math.min(Math.max(0, x.length - N), Math.round(0.25 * SR));
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let i = 0; i < N && off + i < x.length; i++) {
    re[i] = x[off + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
  }
  // In-place iterative radix-2 FFT.
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const nc = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nc;
      }
    }
  }

  const binHz = SR / N;
  const raw = [];
  for (let k = 2; k < N / 2 - 1; k++) {
    const m = Math.hypot(re[k], im[k]);
    if (m > Math.hypot(re[k - 1], im[k - 1]) && m >= Math.hypot(re[k + 1], im[k + 1])) {
      const hz = k * binHz;
      if (hz >= 20 && hz <= 8000) raw.push({ hz, m });
    }
  }
  raw.sort((a, b) => b.m - a.m);

  // ⚠ Merge near-neighbours FIRST. Vibrato spreads one partial across half a
  // dozen bins (the oboe showed four "peaks" all inside F6); left unmerged they
  // outvote every real harmonic and the fit locks onto the widest partial.
  const peaks = [];
  for (const p of raw) {
    if (peaks.some((q) => Math.abs(q.hz - p.hz) / q.hz < 0.03)) continue;
    peaks.push(p);
    if (peaks.length >= 12) break;
  }
  return peaks;
}

/** → { hz, midi, conf } from the harmonic series, or null. */
export function detectPitchHarmonic(x) {
  const peaks = spectrumPeaks(x);
  if (peaks.length < 2) return null;
  const total = peaks.reduce((a, p) => a + p.m, 0) || 1;

  const candidates = [];
  for (const p of peaks.slice(0, 6)) {
    for (let k = 1; k <= 8; k++) {
      const f = p.hz / k;
      if (f >= 25 && f <= 4200) candidates.push(f);
    }
  }

  // ⚠ CLAUDE: each matched partial is weighted 1/n, and that weight is doing
  // real work — do NOT "simplify" it to a plain sum of magnitudes.
  //
  // A LOW candidate offers a DENSER harmonic grid (a slot every f Hz), so it
  // catches unrelated peaks by accident and out-scores the true fundamental on
  // a raw sum. Measured on a pizzicato contrabass: an unweighted sum picked
  // 27.4 Hz (A0) over the correct 82.1 Hz (E2) — 82.1 was simply harmonic 3 of
  // the impostor. Weighting by 1/n says what is actually true of a pitched
  // sound: its energy sits in the FIRST few harmonics, not spread over the 12th.
  const scored = candidates.map((f) => {
    let score = 0;
    for (const p of peaks) {
      const n = p.hz / f;
      const near = Math.round(n);
      if (near >= 1 && near <= MAX_HARMONIC && Math.abs(n - near) / near < HARMONIC_TOL) score += p.m / near;
    }
    return { f, score };
  });

  const top = Math.max(...scored.map((s) => s.score));
  if (!(top > 0)) return null;
  // Every candidate within 8% of the best is a tie; the HIGHEST of those wins.
  const winner = scored.filter((s) => s.score >= top * 0.92).sort((a, b) => b.f - a.f)[0];
  if (winner.score / total < 0.25) return null;
  return { hz: winner.f, midi: Math.round(69 + 12 * Math.log2(winner.f / 440)), conf: winner.score / total };
}

/**
 * → { hz, midi, conf } or null when nothing periodic is there.
 *
 * Measured over the SUSTAIN, not the attack: a struck bar's first milliseconds
 * are mallet noise with no periodicity at all, and a bowed note's are scratch.
 */
export function detectPitchAuto(x) {
  const skip = Math.min(x.length >> 2, Math.round(0.05 * SR));
  const win = x.subarray(skip, Math.min(x.length, skip + Math.round(0.4 * SR)));
  if (win.length < 2048) return null;

  const minLag = Math.floor(SR / 4200);            // ~C8
  const maxLag = Math.floor(SR / 25);              // ~G0
  let zero = 0;
  for (let i = 0; i < win.length; i++) zero += win[i] * win[i];
  if (zero <= 0) return null;

  let best = -1, bestLag = 0;
  for (let lag = minLag; lag <= maxLag && lag < win.length / 2; lag++) {
    let sum = 0;
    for (let i = 0; i + lag < win.length; i++) sum += win[i] * win[i + lag];
    const norm = sum / zero;
    if (norm > best) { best = norm; bestLag = lag; }
  }
  if (bestLag === 0 || best < 0.3) return null;
  const hz = SR / bestLag;
  return { hz, midi: Math.round(69 + 12 * Math.log2(hz / 440)), conf: best };
}

/**
 * The measurement callers should use.
 *
 * ⚠ CLAUDE: this is AUTOCORRELATION ONLY, deliberately. `detectPitchHarmonic`
 * above is UNFINISHED and must not be wired in here until it passes the whole
 * fixture set — it currently scores 9/12, and two of its three failures are
 * files autocorrelation gets RIGHT:
 *
 *   Oboe_Vib_F4_v3_Main.wav    want F5   harmonic says F6   (fundamental is
 *                                                            14.9 dB under H2)
 *   BKCtbss_Pizz_E0_v3_rr2     want E1   harmonic says E2
 *   KSHarp_B1_mf.wav           want B1   harmonic says F#3
 *
 * Swapping it in would retune packs that are currently correct — the harp is in
 * that failing list and the harp is one of the seven packs that were right all
 * along. Finish it against the fixtures first; until then it is a second opinion
 * to consult by hand, not the default.
 */
export function detectPitch(x) {
  return detectPitchAuto(x);
}

/**
 * Given [{ file, midi }] where `midi` is the filename's CLAIM, measure each and
 * decide whether the whole set is uniformly transposed.
 *
 * → { shift, agree, measured, offsets }
 *
 * `shift` is 0 unless the evidence is strong, and the bar is deliberately high:
 *
 *  - the median offset must be a WHOLE NUMBER OF OCTAVES. An octave-convention
 *    mismatch is the failure this exists for; a median of 1 or 2 semitones is
 *    far more likely to be a transposing instrument (a B-flat trumpet written in
 *    concert pitch) or the detector drifting, and "correcting" that would
 *    retune a library that was right.
 *  - at least 3 samples must be measurable, and at least 60% of them must agree
 *    on the same offset. One confident reading is not evidence — see the header.
 */
export function measureShift(entries, read = pcmOf) {
  const read0 = [];
  for (const e of entries) {
    let d = null;
    try { d = detectPitch(read(e.file)); } catch { /* unreadable — counts as unmeasurable */ }
    read0.push({ entry: e, det: d, off: d ? d.midi - e.midi : null });
  }
  const offsets = read0.filter((r) => r.off !== null).map((r) => r.off);
  if (offsets.length < 3) return { shift: 0, agree: 0, measured: offsets.length, offsets, strays: [] };

  const sorted = [...offsets].sort((a, b) => a - b);
  const median = sorted[sorted.length >> 1];
  const agree = offsets.filter((o) => o === median).length;

  const solid = agree >= Math.ceil(offsets.length * 0.6);
  const octave = median !== 0 && median % 12 === 0;
  const shift = solid && octave ? median : 0;

  // ─── Individual strays ─────────────────────────────────────────────────────
  // ⚠ CLAUDE: a library can be wrong about ONE file rather than all of them.
  // Samulis's Freesound marimba names 16 of 17 samples correctly and calls the
  // 17th "g4" when it sounds G5 — Chord Player ships a hand-written correction
  // for exactly that sample. A uniform shift cannot express it, so without this
  // the pack compiles with one note an octave out.
  //
  // Trusting an INDIVIDUAL reading normally is forbidden here (see the header),
  // and the thing that makes it safe is the pack around it: when nearly every
  // other sample measures its declared note EXACTLY, the detector is
  // demonstrably working on this material, so a lone whole-octave disagreement
  // at high confidence is the name being wrong, not the measurement. Three
  // conditions, all required:
  //   - the pack agrees with itself (≥70% of measurable samples land on `shift`)
  //   - the stray is off by a WHOLE OCTAVE after `shift` — never 1-2 semitones
  //   - that one reading is confident (≥0.9)
  const agreeAfter = offsets.filter((o) => o === shift).length;
  const packReliable = agreeAfter >= Math.ceil(offsets.length * 0.7);
  const strays = !packReliable ? [] : read0
    .filter((r) => r.det && r.off !== shift && (r.off - shift) % 12 === 0 && r.det.conf >= 0.9)
    .map((r) => ({ file: r.entry.file, from: r.entry.midi + shift, to: r.det.midi, conf: r.det.conf }));

  return { shift, agree, measured: offsets.length, offsets, median, strays };
}

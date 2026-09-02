// ─────────────────────────────────────────────────────────────────────────────
// output-filter.js - the master highpass + lowpass, at the very end of the chain.
//
// WHY: a seed carries energy at both extremes that no instrument in it actually
// produced. Below ~100 Hz sits rumble and the stretched tail of notes placed
// under an instrument's real range; above ~10 kHz sits sample noise and codec
// fizz. Neither is heard as music, both eat headroom, and the peak normaliser
// then turns them into level the music does not get.
//
// Measured against a comparable tool on the same arrangement: it runs its whole
// output through a 100 Hz highpass and a 10 kHz lowpass, and the difference in
// the 31 Hz band was ours 1.2% of total energy against theirs 0.1%.
//
// ⚠ CLAUDE: the SAME cutoffs are applied twice — here in plain JS for the
// exported file, and as BiquadFilterNodes for live playback
// (buildOutputFilterGraph). They must stay in step: a preview filtered
// differently from the render is a preview that lies about the product.
//
// ⚠ CLAUDE: 0 means OFF, and that is load-bearing. Every .yams written before
// this existed carries no cutoff, loads as 0/0, and must keep rendering
// byte-identically — the same guarantee reverb 'none' carries. The engine's
// DEFAULT is therefore off; it is the app (makeSeed) that starts a NEW seed at
// 100 / 10000. Do not "tidy" that by moving the defaults into the engine.
// ─────────────────────────────────────────────────────────────────────────────

const REF_SR = 44100;

// Web Audio's BiquadFilterNode default. Matching it is what keeps the rendered
// file and the live preview the same filter rather than two similar ones.
const Q = Math.SQRT1_2;                            // 0.7071 — Butterworth, no resonant peak

// RBJ cookbook coefficients, normalised by a0. Same formulas the browser uses.
function biquad(kind, hz, sampleRate) {
  const w0 = (2 * Math.PI * hz) / sampleRate;
  const cos = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * Q);
  let b0, b1, b2;
  if (kind === 'highpass') {
    b0 = (1 + cos) / 2; b1 = -(1 + cos); b2 = (1 + cos) / 2;
  } else {
    b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = (1 - cos) / 2;
  }
  const a0 = 1 + alpha, a1 = -2 * cos, a2 = 1 - alpha;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
}

// Direct Form I. One pass = 12 dB/octave, the same slope as one BiquadFilterNode.
function run(samples, c) {
  const out = new Float32Array(samples.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = c.b0 * x + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[i] = y;
  }
  return out;
}

const usable = (hz, sampleRate) => Number.isFinite(hz) && hz > 0 && hz < sampleRate / 2;

/**
 * Apply the master filters to a mono buffer. Returns a NEW array, or the input
 * UNTOUCHED when neither cutoff is set — see the byte-identity note above.
 */
export function applyOutputFilter(samples, { highpass = 0, lowpass = 0 } = {}, sampleRate = REF_SR) {
  const hp = usable(highpass, sampleRate);
  const lp = usable(lowpass, sampleRate);
  if (!hp && !lp) return samples;

  let out = samples;
  if (hp) out = run(out, biquad('highpass', highpass, sampleRate));
  if (lp) out = run(out, biquad('lowpass', lowpass, sampleRate));
  return out;
}

/**
 * The same two filters as a Web Audio chain, for live playback.
 * Returns { input, output, setCutoffs } — built ONCE, then re-pointed.
 *
 * ⚠ CLAUDE: build once, set values — never rebuild. Same reason as the room
 * (see reverb.js): a replaced node that is still wired to the destination goes
 * on running, and the AudioContext is shared for the whole app session. Both
 * filters therefore stay in the chain permanently and "off" is expressed as a
 * cutoff that passes everything, not as an absent node.
 */
export function buildOutputFilterGraph(ctx) {
  // ⚠ CLAUDE: BiquadFilterNode's Q is in DECIBELS for lowpass/highpass — the
  // offline path above uses the LINEAR 0.707 in its own math, and the dB twin
  // of that value is -3.0103. Setting 0.707 here means +0.707 dB of boost at
  // each cutoff: harmless-sounding, but it is a resonant peak the render does
  // not have — and the same unit mismatch inside the reverb's feedback loop is
  // what made the room howl (see reverb.js).
  const Q_DB = -3.0103;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.Q.value = Q_DB;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = Q_DB;
  hp.connect(lp);

  const setCutoffs = ({ highpass = 0, lowpass = 0 } = {}) => {
    const sr = ctx.sampleRate || REF_SR;
    // Off = out of the way. A highpass at 10 Hz and a lowpass just under
    // Nyquist are inaudible, and keeping the nodes in place is what stops the
    // graph being rebuilt.
    hp.frequency.value = usable(highpass, sr) ? highpass : 10;
    lp.frequency.value = usable(lowpass, sr) ? lowpass : Math.min(20000, sr / 2 - 100);
  };
  setCutoffs();

  return { input: hp, output: lp, setCutoffs };
}

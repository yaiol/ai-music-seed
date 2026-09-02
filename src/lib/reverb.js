// ─────────────────────────────────────────────────────────────────────────────
// reverb.js - a room around the seed.
//
// WHY: a dry sampled instrument sounds like a sample; the same instrument in a
// room sounds like an instrument. Measured against a comparable tool, this was
// the single largest difference in perceived quality — larger than the sample
// library, larger than the groove.
//
// Schroeder/Freeverb topology: eight parallel damped comb filters build the
// density, four series allpass filters smear the result so it stops sounding
// like discrete echoes.
//
// ⚠ CLAUDE: the SAME topology and the SAME constants are used twice — here in
// plain JS for the exported file, and as a Web Audio node graph for live
// playback (buildReverbGraph). They must stay in step: a preview with a
// different room from the render is a preview that lies about the product.
//
// Not a convolution reverb. That would need an impulse response — a recording of
// a real room, which is someone's work to license — and an FFT to apply offline.
// This is generated from nothing and sounds like a room.
// ─────────────────────────────────────────────────────────────────────────────

// Freeverb's tunings, in samples at 44.1 kHz. Mutually prime-ish lengths are the
// point: they stop the combs reinforcing each other into a ringing pitch.
const COMB = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
const ALLPASS = [556, 441, 341, 225];
const REF_SR = 44100;

// ⚠ CLAUDE: the DRY signal is never attenuated — wet is ADDED on top of a
// full-level dry. Taken from a reference implementation, where the dry path runs
// to the master at unity and only the reverb return carries a gain. Ducking the
// dry as well (the obvious "crossfade" reading of a wet/dry control) makes the
// same wet value sound roughly twice as wet, which is heard as the room being
// too strong rather than merely present.
export const ROOMS = {
  none:    null,
  room:    { size: 0.62, damp: 0.42, wet: 0.11 },
  chamber: { size: 0.78, damp: 0.35, wet: 0.15 },
  hall:    { size: 0.89, damp: 0.28, wet: 0.19 },
  church:  { size: 0.94, damp: 0.20, wet: 0.24 },
};

// A seed's lowest musical note is around 40 Hz; everything under it is rumble
// that eats headroom and muddies the mix without being heard. The reference
// chain carries a highpass for the same reason — measured, it has 27 dB less
// energy below 45 Hz than ours did.
const HIGHPASS_HZ = 40;

// One-pole-per-stage highpass, run twice for a 12 dB/octave slope.
function highpass(samples, hz, sampleRate) {
  const rc = 1 / (2 * Math.PI * hz);
  const dt = 1 / sampleRate;
  const a = rc / (rc + dt);
  let out = samples;
  for (let pass = 0; pass < 2; pass++) {
    const y = new Float32Array(out.length);
    let prevX = 0, prevY = 0;
    for (let i = 0; i < out.length; i++) {
      const x = out[i];
      prevY = a * (prevY + x - prevX);
      prevX = x;
      y[i] = prevY;
    }
    out = y;
  }
  return out;
}

export const ROOM_KEYS = Object.keys(ROOMS);

const scaleLen = (n, sampleRate) => Math.max(4, Math.round((n * sampleRate) / REF_SR));

// One damped comb: a delay line fed back on itself through a lowpass, so each
// repeat is a little darker — which is what a real room does to a reflection.
function comb(len, feedback, damp) {
  const buf = new Float32Array(len);
  let i = 0, store = 0;
  return (x) => {
    const y = buf[i];
    store = y * (1 - damp) + store * damp;
    buf[i] = x + store * feedback;
    if (++i >= len) i = 0;
    return y;
  };
}

// Allpass: passes every frequency at equal level but scatters them in time.
function allpass(len, feedback) {
  const buf = new Float32Array(len);
  let i = 0;
  return (x) => {
    const y = buf[i];
    buf[i] = x + y * feedback;
    if (++i >= len) i = 0;
    return y - x;
  };
}

/**
 * Apply a room to a mono buffer, in place-safe fashion (returns a new array).
 * `amount` scales the room's own wet level, so a seed can be nudged drier or
 * wetter without changing which room it is.
 */
export function applyReverb(samples, roomKey, sampleRate = REF_SR, amount = 1) {
  const room = ROOMS[roomKey];
  // ⚠ No room means the buffer is returned UNTOUCHED — not even highpassed.
  // Every .yams written before rooms existed renders with reverb 'none', and
  // those files are guaranteed to render byte-identically forever. Filtering
  // them "for their own good" broke all 32 parity renders the moment it was
  // tried. Cleaning up the sub-40 Hz rumble is worth doing, but it is a
  // deliberate, versioned change — not a side effect of adding reverb.
  if (!room || amount <= 0) return samples;
  // ⚠ CLAUDE: sendIn === dry short-circuits inside applyReverbSend, so this
  // wrapper computes EXACTLY the pre-sends loop — legacy .yams stay byte-exact.
  return applyReverbSend(samples, samples, roomKey, sampleRate, amount);
}

/**
 * The mixer form: `dry` passes at unity; `sendIn` — the per-lane send mix
 * (each lane scaled by its own send level, summed) — feeds the room. One
 * space, per-instrument sends, like an aux bus. `wetScale` trims the room's
 * authored wet level (the legacy amount).
 */
export function applyReverbSend(dry, sendIn, roomKey, sampleRate = REF_SR, wetScale = 1) {
  const room = ROOMS[roomKey];
  if (!room) return dry;

  const cleaned = highpass(dry, HIGHPASS_HZ, sampleRate);
  const sendClean = sendIn === dry ? cleaned : highpass(sendIn, HIGHPASS_HZ, sampleRate);

  const feedback = 0.28 + 0.7 * room.size;
  const damp = 0.4 * room.damp;
  const wet = room.wet * wetScale;

  const combs = COMB.map((n) => comb(scaleLen(n, sampleRate), feedback, damp));
  const aps = ALLPASS.map((n) => allpass(scaleLen(n, sampleRate), 0.5));

  const out = new Float32Array(cleaned.length);
  for (let i = 0; i < cleaned.length; i++) {
    const x = cleaned[i];
    let y = 0;
    for (const c of combs) y += c(sendClean[i]);
    y /= combs.length;
    for (const a of aps) y = a(y);
    out[i] = x + y * wet;                      // dry at unity, wet added on top
  }
  return out;
}

/**
 * The same room as a Web Audio graph, for live playback.
 * Returns { input, output } to splice between a source and the destination.
 */
export function buildReverbGraph(ctx) {
  // ⚠ CLAUDE: this is built ONCE and never replaced. Returning null for `none`,
  // or rebuilding when the room changes, is what made this unfixable for an
  // afternoon: a reverb is a LIVE FEEDBACK NETWORK, so once it is wired to the
  // destination it keeps running with or without input, and the AudioContext is
  // shared for the whole app session. Every rebuild left the previous network
  // behind, so a howling one from a buggy build survived every stop, every
  // restart of playback, and every subsequent fix — audible proof that the fix
  // had not worked, when it had.
  //
  // Nothing about the topology depends on the room. COMB and ALLPASS are
  // constants; a room is only three NUMBERS (feedback, damping cutoff, wet), so
  // `setRoom` sets them on the existing nodes and there is never a second
  // network to leak. The reference implementation is built the same way — one
  // chain for the app, values changed on it.
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wetGain = ctx.createGain();
  dry.gain.value = 1;                          // unity, as above
  wetGain.gain.value = 0;                       // silent until setRoom says otherwise

  const feedbacks = [];                         // per-comb feedback gains
  const dampers = [];                           // per-comb lowpasses

  input.connect(dry).connect(output);
  // The SEND input feeds the room while `input` carries the dry path — the aux
  // bus split that makes per-lane sends possible. A caller that wants the old
  // everything-into-the-room behaviour connects its source to both.
  const sendInput = ctx.createGain();

  // Parallel combs. Each is a delay fed back through a lowpass — the node-graph
  // equivalent of the comb() above, with the same length and feedback.
  const sum = ctx.createGain();
  sum.gain.value = 1 / COMB.length;
  for (const n of COMB) {
    const d = ctx.createDelay(1);
    d.delayTime.value = n / REF_SR;
    const fb = ctx.createGain();
    fb.gain.value = 0;                         // set by setRoom
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 8000;                 // set by setRoom, along with Q
    sendInput.connect(d);
    d.connect(lp).connect(fb).connect(d);      // the feedback loop
    d.connect(sum);
    feedbacks.push(fb);
    dampers.push(lp);
  }

  // Series allpass. Web Audio has no allpass node, so it is built from a delay
  // fed back on itself — exactly the allpass() above, node for node.
  //
  // ⚠ CLAUDE: the direct path is SUBTRACTED, never added. That minus sign is
  // what makes this an allpass instead of an amplifier, and it is not cosmetic:
  // the delay settles at 1/(1 - 0.5) = 2x its input, so `delayed + direct` gives
  // 3x per stage — 3^4 = 81x across the four, which arrives as a roar the
  // limiter then pumps on. `delayed - direct` gives 2x - 1x = unity, which is
  // the entire point of an allpass: it moves energy in TIME and leaves the
  // level alone. Shipped wrong for about an hour on 2026-08-29; the offline
  // allpass() had it right all along (`return y - x`).
  let node = sum;
  for (const n of ALLPASS) {
    const d = ctx.createDelay(1);
    d.delayTime.value = n / REF_SR;
    const fb = ctx.createGain();
    fb.gain.value = 0.5;
    const invert = ctx.createGain();
    invert.gain.value = -1;
    const mix = ctx.createGain();
    node.connect(d);
    d.connect(fb).connect(d);            // the feedback loop
    d.connect(mix);                      // + delayed
    node.connect(invert).connect(mix);   // - direct
    node = mix;
  }
  node.connect(wetGain).connect(output);

  /**
   * Point the one network at a room. `none` (or amount 0) simply closes the wet
   * return — the combs keep spinning on silence, which costs nothing audible
   * and leaves nothing to leak.
   *
   * ⚠ CLAUDE: `feedback` is the loop gain, and the lowpass sits INSIDE that
   * loop. Anything with gain above 1 anywhere in its response makes the loop
   * oscillate — which is why Q is pinned at 1/sqrt(2) below. Web Audio's
   * DEFAULT lowpass Q is 1, a +1.25 dB resonant peak: `church` feeds back at
   * 0.938, and 0.938 x 1.15 = 1.079, so the room ran away and howled on one
   * narrow band. The offline comb damps with a one-pole, which cannot peak,
   * and was stable throughout for exactly that reason.
   */
  const setRoom = (roomKey, amount = 1) => {
    const room = ROOMS[roomKey];
    const wet = room ? room.wet * Math.max(0, amount) : 0;
    const feedback = room ? 0.28 + 0.7 * room.size : 0;
    const damp = room ? 0.4 * room.damp : 0;

    wetGain.gain.value = wet;
    for (const fb of feedbacks) fb.gain.value = feedback;
    for (const lp of dampers) {
      lp.frequency.value = 200 + (1 - damp) * 8000;
      // ⚠ CLAUDE: BiquadFilterNode's Q is in DECIBELS for lowpass/highpass —
      // not the linear ratio every DSP text uses. `Q.value = 0.707` therefore
      // means "+0.707 dB of resonant boost at the cutoff", a small amplifier
      // sitting INSIDE this feedback loop: church feeds back at 0.938, and
      // 0.938 x 1.085 > 1, so the room howled — measurably (the sim diverges at
      // 3.1 s with +1 dB, 3.7 s with +0.707 dB). -3.0103 dB IS linear 0.707,
      // the flat Butterworth response, and the loop decays. This one unit
      // mismatch survived two "fixes" because both set a positive-dB value.
      lp.Q.value = -3.0103;
    }
  };

  return { input, sendInput, output, setRoom };
}

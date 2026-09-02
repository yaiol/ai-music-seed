// ─────────────────────────────────────────────────────────────────────────────
// seed-player.js - live playback of a seed, through Web Audio.
//
// THE DIFFERENCE FROM THE EXPORT: seed-engine.js COMPUTES every sample in JS
// because it has to hand you a file. This SCHEDULES notes on the audio thread,
// which mixes in native code and materialises nothing. That is why it starts
// instantly and the render does not.
//
// ⚠ CLAUDE: this is a LOOK-AHEAD SCHEDULER, not a play-the-whole-thing call, and
// that is the entire reason edits apply while it is running. It keeps only the
// next ~250 ms scheduled and re-reads the seed at EVERY CHORD BOUNDARY, so a
// change to the chords, the style, the instrument, the tempo or the meter is
// picked up within a chord - without a stop, a restart, or a gap.
//
// Do NOT "simplify" this back into scheduling the whole progression at once: it
// is shorter, it is what the first version did, and it makes the player deaf to
// every edit until it is stopped and started again.
//
// Changes land on the next CHORD, not the next sample. That is deliberate -
// re-voicing mid-chord would click, and a musician changing a setting expects it
// on the next beat, not underneath the note currently sounding.
//
// It reads the SAME gestures (seed-engine.gestureFor) and the SAME SoundFont
// zone maths (soundfont.noteVoices) as the exporter, so a preview cannot drift
// from the rendered file.
// ─────────────────────────────────────────────────────────────────────────────

import { planChords, gestureFor, filterLanes, shiftLaneOctaves, progressionScalePcs } from './seed-engine.js';
import { buildOutputFilterGraph } from './output-filter.js';
import { buildReverbGraph } from './reverb.js';
import { FILTER_OPEN_HZ } from './soundfont.js';
import { voicesOf } from './sample-pack.js';

const SR = 44100;                      // the frame rate gestures are written in
const LOOKAHEAD_S = 0.25;              // how far ahead notes are scheduled
const TICK_MS = 40;                    // how often the scheduler wakes

// Measured, not guessed: a chord of level-matched samples peaks around 0.23-0.47
// and the built-in synth around 0.64, against a 1.0 ceiling. This brings the
// quiet end up to a normal listening level; the limiter below handles the rest.
const MAKEUP_GAIN = 2.2;

const midiToFreq = (n) => 440 * Math.pow(2, (n - 69) / 12);

// The built-in synth's four waveforms as harmonic amplitudes. A fundamental plus
// fixed partials is exactly what a PeriodicWave describes, so this is the real
// timbre rather than an approximation of it.
// ⚠ CLAUDE: keep in sync with WAVES in seed-engine.js - `npm run check:player`
// verifies both files still carry the same coefficients.
const PARTIALS = {
  tone:   [0, 1, 0.35, 0.15],
  bright: [0, 1, 0.5, 0.32, 0.18],
};

const waveCache = new WeakMap();

function periodicWave(ctx, name) {
  let byName = waveCache.get(ctx);
  if (!byName) { byName = {}; waveCache.set(ctx, byName); }
  if (!byName[name]) {
    const imag = Float32Array.from(PARTIALS[name] || PARTIALS.tone);
    byName[name] = ctx.createPeriodicWave(new Float32Array(imag.length), imag, { disableNormalization: true });
  }
  return byName[name];
}

// Cached on the PROVIDER, not on a SoundFont: a sample pack has no `.sf`, and
// hanging the cache there threw the moment a pack instrument played a note.
function audioBufferFor(ctx, provider, pcm, sampleRate) {
  if (!provider._buffers) provider._buffers = new WeakMap();
  let buf = provider._buffers.get(pcm);
  if (!buf) {
    buf = ctx.createBuffer(1, pcm.length, sampleRate);
    buf.copyToChannel(pcm, 0);
    provider._buffers.set(pcm, buf);
  }
  return buf;
}

/**
 * startSeed({ getSeed, getSoundFont, ctx, onError, autoTick }) → handle
 *
 * `getSeed()` is called fresh at every chord boundary and must return the CURRENT
 * form values: { progression, bpm, bars, sig, style, instrument, lanes }. That call is
 * the whole live-editing mechanism - whatever it returns is what plays next.
 *
 * `getSoundFont()` returns { sf, presetIndex } for the instrument that is ready
 * RIGHT NOW, or null for the built-in synth. Loading a new instrument is async
 * and belongs to the caller; until it resolves this keeps returning the previous
 * one, so switching instruments never drops a beat.
 *
 * Returns { stop(), tick(), isRunning() }. Playback loops until stopped.
 */
// Audition ONE note, outside any running seed — the keyboard's click-to-hear.
// Reuses this module's voice construction (never a copy elsewhere); dry, no
// master chain: an audition is a listening probe, not a mix.
export function playOnce(ctx, soundfont, midi, durS = 1.2) {
  const at = ctx.currentTime + 0.02;
  const voices = voicesOf(soundfont, midi, 100);
  if (voices.length) {
    for (const v of voices) {
      const src = ctx.createBufferSource();
      src.buffer = audioBufferFor(ctx, soundfont, v.pcm, v.sampleRate);
      src.playbackRate.value = Math.pow(2, v.cents / 1200);
      if (v.loop) {
        src.loop = true;
        src.loopStart = v.loop.start / v.sampleRate;
        src.loopEnd = v.loop.end / v.sampleRate;
      }
      const g = ctx.createGain();
      shapeEnvelope(g.gain, at, durS, v.gain * MAKEUP_GAIN, v.env);
      src.connect(g).connect(ctx.destination);
      src.start(at);
      src.stop(at + durS + v.env.relS);
    }
  } else {
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(periodicWave(ctx, 'tone'));
    osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(0.2, at + 0.01);
    g.gain.setTargetAtTime(0.0001, at + durS * 0.6, 0.15);
    osc.connect(g).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + durS + 0.6);
  }
}

export function startSeed({ getSeed, getSoundFont = () => null, getBassSoundFont = () => null,
                            ctx, onError, onNote = null, autoTick = true }) {
  // ⚠ CLAUDE: the OUTPUT STAGE. The exported file ends with a peak normalisation
  // (floatToInt16 scales to 0.89); live playback has no such stage, so without
  // this it plays several times quieter than the same seed sounds as a file —
  // and quieter than any other music the listener is comparing it against.
  //
  // Makeup gain lifts it, and the limiter catches what that would push over.
  // Both are needed: the built-in synth already sits near full scale while a
  // sampled instrument sits well below it, so a makeup big enough for the quiet
  // case would clip the loud one.
  const master = ctx.createGain();
  master.gain.value = 1;
  // Per-lane buses — every voice lands on its lane's bus. The bus carries the
  // makeup gain (not `master`) so the reverb SENDS tapped off the buses sit at
  // the same level as the dry path; scaling only the dry would thin the wet by
  // exactly the makeup factor and the preview would lie about the file's mix.
  const bassBus = ctx.createGain();
  const trebleBus = ctx.createGain();
  bassBus.gain.value = MAKEUP_GAIN;
  trebleBus.gain.value = MAKEUP_GAIN;
  const bassSend = ctx.createGain();
  const trebleSend = ctx.createGain();
  bassSend.gain.value = 0;              // set by applySettings
  trebleSend.gain.value = 0;

  const limiter = ctx.createDynamicsCompressor ? ctx.createDynamicsCompressor() : null;
  if (limiter) {
    limiter.threshold.value = -6;      // start holding back just under full scale
    limiter.knee.value = 0;            // hard: a limiter, not a compressor colouring the sound
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.12;
  }

  // ─── The output chain ──────────────────────────────────────────────────────
  // Built ONCE per startSeed. Both stages hold every node they will ever need;
  // a setting change re-points VALUES on them (applySettings, checked at each
  // chord boundary like every other field). See reverb.js and output-filter.js
  // for why rebuilding nodes is not an option.
  //
  // ⚠ CLAUDE: the ORDER is the render's order and must stay that way — room
  // first, master filters after it (see generateSeed). A room adds its own low
  // rumble and high fizz, so filtering ahead of it leaves exactly what the
  // filters exist to remove, and a preview built the other way round is a
  // preview that lies about the file.
  const room = buildReverbGraph(ctx);
  const filters = buildOutputFilterGraph(ctx);
  // Dry: buses → master → the room's dry path. Sends: each bus → its send
  // gain → the room's combs — the aux-bus model, matching the render's
  // per-lane reverb sends.
  bassBus.connect(master);
  trebleBus.connect(master);
  bassBus.connect(bassSend).connect(room.sendInput);
  trebleBus.connect(trebleSend).connect(room.sendInput);
  master.connect(room.input);
  room.output.connect(filters.input);
  if (limiter) filters.output.connect(limiter).connect(ctx.destination);
  else filters.output.connect(ctx.destination);

  let chainKey = null;
  const applySettings = (seed) => {
    // Per-lane sends (multipliers, like the engine's); the legacy reverbAmount
    // stands in for a missing lane value so an old seed previews unchanged.
    const ts = seed.trebleReverb != null ? Number(seed.trebleReverb) : (seed.reverbAmount ?? 1);
    const bs = seed.bassReverb != null ? Number(seed.bassReverb) : (seed.reverbAmount ?? 1);
    const key = `${seed.reverb || 'none'}|${ts}|${bs}|${seed.highpass || 0}|${seed.lowpass || 0}`;
    if (key === chainKey) return;
    chainKey = key;
    room.setRoom(seed.reverb, 1);       // the room at its authored wet; amounts live on the sends
    trebleSend.gain.value = Math.max(0, ts);
    bassSend.gain.value = Math.max(0, bs);
    filters.setCutoffs(seed);
  };
  applySettings(getSeed() || {});

  const teardownChain = () => {
    try { master.disconnect(); } catch { /* already gone */ }
    try { bassBus.disconnect(); } catch { /* already gone */ }
    try { trebleBus.disconnect(); } catch { /* already gone */ }
    try { room.output.disconnect(); } catch { /* already gone */ }
    try { filters.output.disconnect(); } catch { /* already gone */ }
  };

  let running = true;
  let timer = null;
  let live = [];                     // nodes still sounding, pruned as they end

  let nextChordTime = ctx.currentTime + 0.08;   // lead-in: scheduling at exactly now clicks
  let chordIndex = 0;
  let startQ = 0;                    // running position on the beat grid

  // laneGain is the lane's mix level (trebleVolume / bassVolume), matching the
  // render — applied to the voice gain, never to ev.vel, which would also
  // switch velocity layers and change the timbre.
  const scheduleNote = (ev, at, soundfont, laneGain = 1) => {
    const durS = ev.len / SR;
    // The voice lands on its LANE's bus, so the per-lane reverb send sees it.
    const bus = (ev.lane || 'treble') === 'bass' ? bassBus : trebleBus;
    // Tap for the UI (the keyboard's live highlights): what sounds, when, how long.
    onNote?.(ev.midi, ev.lane || 'treble', at, durS);
    const voices = voicesOf(soundfont, ev.midi, ev.vel);
    if (voices.length) {
      for (const v of voices) {
        const src = ctx.createBufferSource();
        src.buffer = audioBufferFor(ctx, soundfont, v.pcm, v.sampleRate);
        src.playbackRate.value = Math.pow(2, v.cents / 1200);
        if (v.loop) {
          src.loop = true;
          src.loopStart = v.loop.start / v.sampleRate;
          src.loopEnd = v.loop.end / v.sampleRate;
        }
        const g = ctx.createGain();
        shapeEnvelope(g.gain, at, durS, v.gain * laneGain, v.env);
        // Web Audio's lowpass Q is in dB, the unit SF2 stores it in.
        if (v.filterHz < FILTER_OPEN_HZ) {
          const f = ctx.createBiquadFilter();
          f.type = 'lowpass';
          f.frequency.value = v.filterHz;
          f.Q.value = v.filterQdB;
          src.connect(f).connect(g).connect(bus);
        } else {
          src.connect(g).connect(bus);
        }
        src.start(at);
        src.stop(at + durS + v.env.relS);
        live.push({ node: src, until: at + durS + v.env.relS });
      }
    } else {
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(periodicWave(ctx, ev.synth.wave));
      osc.frequency.value = midiToFreq(ev.midi);
      const g = ctx.createGain();
      shapeSynthEnvelope(g.gain, at, ev, laneGain);
      osc.connect(g).connect(bus);
      osc.start(at);
      osc.stop(at + durS + 0.05);
      live.push({ node: osc, until: at + durS + 0.05 });
    }
  };

  // Schedule one chord and advance the cursor. Everything it needs is read here,
  // which is what makes an edit audible on the next chord.
  const scheduleNextChord = () => {
    const seed = getSeed();
    // The room and the master filters are NODES, so they are rebuilt when they
    // change rather than re-read per note — but the CHECK belongs here, with
    // every other "what did the user just change" read. Leaving it out of this
    // function is what made the room dropdown do nothing until Play was
    // restarted.
    applySettings(seed);
    const { chords, barQ, qToFrames } = planChords(seed);
    const gesture = gestureFor(seed.style);
    const soundfont = getSoundFont();
    // A second instrument for the bass lane, mirroring generateSeed's
    // `bassSoundfont`. Null means "the bass plays whatever the chords play".
    const bassSoundfont = getBassSoundFont();

    if (chordIndex >= chords.length) { chordIndex = 0; startQ = 0; }   // loop, and absorb a shortened progression
    const chord = chords[chordIndex];

    if (chord.notes.length) {
      // ⚠ CLAUDE: this context must carry EVERYTHING planSeedEvents passes, or
      // the preview plays a different arrangement from the file it renders.
      // Three fields were missing until 2026-08-29 and each one was audible:
      //   tonicPc   — anchors the bass register on the key's tonic, so without
      //               it the preview's bass sat in a different octave
      //   nextNotes — the approach note that steps into the next chord; the
      //               walking style simply never played it live
      //   swing     — every odd slot's delay, silently ignored
      //   scalePcs  — the progression's pitch-class pool (2026-09-01): the
      //               ^/v passing notes resolve through it, so without it the
      //               preview plays chromatic neighbours where the render
      //               plays scale tones
      const first = chords.find((c) => c.notes.length);
      const ctxQ = {
        startQ, durQ: chord.quarters, barQ, qToFrames,
        swing: seed.swing || 0,
        tonicPc: first ? first.notes[0] % 12 : 0,
        scalePcs: progressionScalePcs(chords),
        nextNotes: chords[(chordIndex + 1) % chords.length]?.notes || null,
      };
      // Read at the chord boundary like everything else, so muting a lane takes
      // effect on the next chord without stopping playback — which is the whole
      // point of a solo button: flip it back and forth against the same bar.
      // Per-lane volumes, read at the chord boundary like every other field.
      const trebleVol = seed.trebleVolume != null ? Number(seed.trebleVolume) : 1;
      const bassVol = seed.bassVolume != null ? Number(seed.bassVolume) : 1;
      for (const ev of shiftLaneOctaves(filterLanes(gesture(chord.notes, chord.samples, ctxQ), seed.lanes),
                                        Number(seed.trebleOctave) || 0, Number(seed.bassOctave) || 0)) {
        scheduleNote(ev, nextChordTime + ev.at / SR,
          ev.lane === 'bass' && bassSoundfont ? bassSoundfont : soundfont,
          ev.lane === 'bass' ? bassVol : trebleVol);
      }
    }

    nextChordTime += chord.durS;
    startQ += chord.quarters;
    chordIndex++;
    if (chordIndex >= chords.length) { chordIndex = 0; startQ = 0; }
  };

  const tick = () => {
    if (!running) return;
    try {
      while (nextChordTime < ctx.currentTime + LOOKAHEAD_S) {
        // A tab left in the background can wake with a large backlog; jump the
        // cursor forward rather than scheduling minutes of audio at once.
        if (nextChordTime < ctx.currentTime - 1) nextChordTime = ctx.currentTime + 0.05;
        scheduleNextChord();
      }
      live = live.filter((n) => n.until > ctx.currentTime - 0.5);
    } catch (e) {
      // An unparseable chord or a bad time signature while typing must not kill
      // playback - hold the last good state and let the next edit recover.
      if (onError) onError(e);
    }
  };

  const stop = () => {
    if (!running) return;
    running = false;
    if (timer !== null) { clearInterval(timer); timer = null; }
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.04);      // a hard cut is an audible click
    for (const n of live) { try { n.node.stop(now + 0.05); } catch { /* already ended */ } }
    live = [];

    // ⚠ Tear the output chain down, or its feedback network outlives the
    // session that built it — see rebuildChain. Deferred past the 40 ms fade so
    // stopping still does not click; the room's tail is cut at that point,
    // which is what "stop" should mean.
    const drop = setTimeout(teardownChain, 250);
    if (drop && typeof drop.unref === 'function') drop.unref();   // never hold a process open
  };

  tick();
  if (autoTick && typeof setInterval === 'function') timer = setInterval(tick, TICK_MS);

  return { stop, tick, isRunning: () => running };
}

// SF2 volume envelope → Web Audio ramps.
function shapeEnvelope(param, startT, durS, peak, env) {
  const { atkS, holdS, decS, relS, susLevel } = env;
  const sus = Math.max(1e-4, peak * susLevel);
  param.setValueAtTime(0.0001, startT);
  if (atkS > 0.001) param.linearRampToValueAtTime(peak, startT + atkS);
  else param.setValueAtTime(peak, startT + 0.001);
  const decayFrom = startT + atkS + holdS;
  if (decS > 0.001) param.setTargetAtTime(sus, decayFrom, Math.max(0.005, decS / 3));
  else param.setValueAtTime(sus, decayFrom);
  param.setTargetAtTime(0.0001, startT + durS, Math.max(0.01, relS / 3));
}

// The synth gestures describe their envelope as env(j) over `len` frames. Sample
// that function and ramp between the points, so a change to a gesture's envelope
// shows up here for free instead of being reimplemented.
function shapeSynthEnvelope(param, startT, ev, gain = 1) {
  const { len, synth } = ev;
  const STEPS = 12;
  param.setValueAtTime(Math.max(1e-4, gain * synth.amp * synth.env(0)), startT);
  for (let k = 1; k <= STEPS; k++) {
    const j = Math.min(len - 1, Math.round((k / STEPS) * len));
    param.linearRampToValueAtTime(Math.max(1e-4, gain * synth.amp * synth.env(j)), startT + j / SR);
  }
  param.linearRampToValueAtTime(1e-4, startT + len / SR + 0.04);
}

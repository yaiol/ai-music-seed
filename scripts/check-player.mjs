// ─────────────────────────────────────────────────────────────────────────────
// check-player.mjs - verify the live preview schedules what it should.
//
// The preview (src/lib/seed-player.js) runs on Web Audio, which does not exist
// outside a browser - but the SCHEDULING is ordinary JS, and it is the part that
// can be wrong. This drives it with a recording stub for AudioContext, steps the
// clock by hand, and checks what came out.
//
// The assertion that matters most is the LIVE EDIT one: the player is a
// look-ahead scheduler specifically so that changing the chords, style,
// instrument or tempo takes effect while it plays. Nothing else in the codebase
// would notice if that regressed into scheduling everything up front.
//
//   node scripts/check-player.mjs
//
// The sampled-instrument sections need ffmpeg on PATH to stand in for the
// browser's OGG decoder; without it those sections are skipped, not failed.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const lib = (f) => import(pathToFileURL(path.join(ROOT, 'src', 'lib', f)).href);

const engine = await lib('seed-engine.js');
const sfMod = await lib('soundfont.js');
const player = await lib('seed-player.js');

let failed = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${!ok && detail ? '  — ' + detail : ''}`);
};

// ─── Recording stub for AudioContext ─────────────────────────────────────────
const param = () => {
  const p = { value: 0, calls: [] };
  for (const m of ['setValueAtTime', 'linearRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues']) {
    p[m] = (...a) => { p.calls.push([m, ...a]); return p; };
  }
  return p;
};

const made = { osc: [], src: [], gain: [], filter: [], comp: [], delay: [] };
const node = (kind) => {
  // ⚠ connect() RECORDS its target. Without that the stub can only prove a node
  // was built, never that it was built into the right place — and the master
  // chain's ORDER is the thing that matters: the room goes on before the master
  // filters, exactly as the render does it.
  const n = { kind, connections: [], connect: (d) => { n.connections.push(d); return d; },
              disconnect: () => { n.connections = []; },
              start: (t) => { n.startT = t; }, stop: (t) => { n.stopT = t; } };
  if (kind === 'delay') n.delayTime = param();
  if (kind === 'osc') { n.frequency = param(); n.setPeriodicWave = (w) => { n.wave = w; }; }
  if (kind === 'src') n.playbackRate = param();
  if (kind === 'gain') n.gain = param();
  if (kind === 'filter') { n.frequency = param(); n.Q = param(); n.type = ''; }
  if (kind === 'comp') { for (const k of ['threshold', 'knee', 'ratio', 'attack', 'release']) n[k] = param(); }
  made[kind].push(n);
  return n;
};
const reset = () => { made.osc = []; made.src = []; made.gain = []; made.filter = []; made.comp = []; made.delay = []; };

const ctx = {
  currentTime: 0, state: 'running', sampleRate: 44100, destination: { kind: 'destination' },
  createGain: () => node('gain'),
  createOscillator: () => node('osc'),
  createBufferSource: () => node('src'),
  createBiquadFilter: () => node('filter'),
  createDelay: () => node('delay'),
  createDynamicsCompressor: () => node('comp'),
  createPeriodicWave: (real, imag) => ({ real, imag }),
  createBuffer: (ch, len, rate) => ({ length: len, sampleRate: rate, copyToChannel: () => {} }),
};

// Step the clock and let the scheduler fill its look-ahead window, the way the
// real interval timer would.
const runFor = (handle, seconds, step = 0.1) => {
  for (let t = 0; t < seconds; t += step) {
    ctx.currentTime += step;
    handle.tick();
  }
};

// ⚠ The output chain (room + master filters) is built by startSeed BEFORE its
// first tick, so after a reset() the first CHAIN_FILTERS entries of made.filter
// are always the chain's own biquads — 8 comb dampers + master highpass +
// master lowpass — and everything after them is a voice's. Capturing the count
// AFTER startSeed returns does not work: the initial tick has already scheduled
// the first chord, so its voice filters land before the capture.
const CHAIN_FILTERS = 10;

const SEED = { progression: 'C\nEm7\nAm\nF', bpm: 100, bars: 1, sig: '4/4', style: 'pad' };
const seedOf = (over = {}) => ({ ...SEED, ...over });

// ─── 1. The shared event stream ──────────────────────────────────────────────
for (const style of engine.STYLES) {
  const { events, totalSamples } = engine.planSeedEvents({ ...SEED, loops: 1, style });
  const malformed = events.filter((e) =>
    !Number.isFinite(e.at) || !Number.isFinite(e.len) || e.len <= 0 ||
    !Number.isFinite(e.chordOffset) || e.chordOffset + e.at > totalSamples);
  check(`events ${style.padEnd(11)} ${String(events.length).padStart(4)}`, malformed.length === 0, `${malformed.length} malformed`);
}

// ─── 2. Every rhythm pattern sounds EVERY chord ──────────────────────────────
// A pattern places hits on a beat grid, so a chord shorter than the gap between
// hits would fall silent if the gesture did not also strike each chord on its
// own onset. Four chords per bar under a beats-1-and-3 pattern is the case that
// breaks; it must stay at 8 sounding chords out of 8 (4 chords x 2 loops).
for (const style of engine.STYLES) {
  const sig = style.toLowerCase().includes('waltz') ? '3/4' : '4/4';
  const plan = engine.planSeedEvents({ ...SEED, sig, loops: 2, style });
  const sounded = new Set(plan.events.map((e) => e.chordOffset)).size;
  check(`rhythm ${style.padEnd(11)} ${String(plan.events.length).padStart(4)} events, ${sounded}/8 chords`,
    sounded === 8 && plan.events.length > 0, `only ${sounded} of 8 chords produce a note`);
}

// ─── 3. Built-in synth playback ──────────────────────────────────────────────
// NOT asserted: ascending start times. Web Audio schedules by ABSOLUTE time, so
// the order start() is called in has no effect - and the arp gesture genuinely
// appends its sustained root (at 0) after the plucks.
for (const style of engine.STYLES) {
  reset();
  ctx.currentTime = 0;
  const h = player.startSeed({ ctx, getSeed: () => seedOf({ style }), autoTick: false });
  runFor(h, 3);
  const sane = made.osc.every((o) =>
    Number.isFinite(o.startT) && Number.isFinite(o.stopT) && o.stopT > o.startT && o.startT >= 0);
  check(`play ${style.padEnd(11)} ${String(made.osc.length).padStart(4)} oscillators`,
    made.osc.length > 0 && sane, made.osc.length === 0 ? 'nothing scheduled' : 'bad start/stop time');
  h.stop();
}

// ─── 4. LIVE EDITING - the reason this is a scheduler and not a one-shot ─────
// Changing the seed while it runs must change what gets scheduled next. If the
// player ever goes back to scheduling everything up front, this is what catches
// it: the frequencies after the edit would still be the old chord's.
{
  reset();
  ctx.currentTime = 0;
  const state = seedOf({ progression: 'C', style: 'pad' });
  const h = player.startSeed({ ctx, getSeed: () => ({ ...state }), autoTick: false });
  runFor(h, 2);
  const before = new Set(made.osc.map((o) => Math.round(o.frequency.value)));

  state.progression = 'F#';                     // C and F# share no notes at all
  const mark = made.osc.length;
  runFor(h, 3);
  const after = new Set(made.osc.slice(mark).map((o) => Math.round(o.frequency.value)));
  const overlap = [...after].filter((f) => before.has(f));

  check(`live edit: chords  ${before.size} → ${after.size} distinct pitches`,
    after.size > 0 && overlap.length === 0,
    after.size === 0 ? 'nothing scheduled after the edit' : `still playing the old chord (${overlap.length} shared pitches)`);
  h.stop();
}

{
  // Tempo is read per chord too, so a BPM change must tighten the spacing of
  // what gets scheduled next.
  //
  // ⚠ It lands on the NEXT chord, not instantly — at 60 bpm a 4/4 bar is four
  // seconds, so the already-scheduled chord has to finish first. Measuring
  // spacing (not a count over a fixed window) is what makes this test insensitive
  // to that latency, which is correct behaviour rather than lag.
  const gaps = (nodes) => {
    const onsets = [...new Set(nodes.map((o) => Math.round(o.startT * 1000) / 1000))].sort((a, b) => a - b);
    return onsets.slice(1).map((v, i) => v - onsets[i]);
  };
  const median = (a) => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : NaN);

  reset();
  ctx.currentTime = 0;
  const state = seedOf({ progression: 'C\nF', bpm: 60, style: 'groove1' });
  const h = player.startSeed({ ctx, getSeed: () => ({ ...state }), autoTick: false });
  runFor(h, 12);
  const slowGap = median(gaps(made.osc));

  state.bpm = 240;                              // four times faster → hits four times closer
  const mark = made.osc.length;
  runFor(h, 12);
  const fastGap = median(gaps(made.osc.slice(mark)));

  check(`live edit: tempo   gap ${slowGap.toFixed(2)}s at 60bpm → ${fastGap.toFixed(2)}s at 240bpm`,
    Number.isFinite(fastGap) && fastGap < slowGap * 0.6, 'tempo change did not reach the scheduler');
  h.stop();
}

{
  // Bars-per-line stretches how long each line lasts, so a chord's span - and
  // therefore the spacing of its hits - must change with it.
  const onsetGap = (nodes) => {
    const onsets = [...new Set(nodes.map((o) => Math.round(o.startT * 1000) / 1000))].sort((a, b) => a - b);
    const gaps = onsets.slice(1).map((v, i) => v - onsets[i]);
    return gaps.length ? gaps.slice().sort((x, y) => x - y)[Math.floor(gaps.length / 2)] : NaN;
  };

  // ⚠ NOT measured by hit spacing, and NOT by "the pitch set changed": a rhythm
  // repeats every BAR so its spacing is constant by design, and the two lanes
  // fire on different slots so the sounding pitches change WITHIN a chord. Both
  // of those read as false signals. What bars-per-line changes is how long each
  // CHORD holds, so the chords are identified by pitch class and timed directly.
  const chordHoldGap = (nodes) => {
    const PCS = { C: new Set([0, 4, 7]), FS: new Set([6, 10, 1]) };
    const which = (midi) => {
      const pc = ((Math.round(69 + 12 * Math.log2(midi / 440)) % 12) + 12) % 12;
      return PCS.C.has(pc) ? 'C' : PCS.FS.has(pc) ? 'FS' : '?';
    };
    const onsets = [...new Map(nodes.map((o) => [Math.round(o.startT * 1000) / 1000, o])).entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([t, o]) => [t, which(o.frequency.value)])
      .filter(([, w]) => w !== '?');
    const changes = onsets.filter(([, w], i) => i === 0 || w !== onsets[i - 1][1]).map(([t]) => t);
    const gaps = changes.slice(1).map((v, i) => v - changes[i]);
    return gaps.length ? gaps.slice().sort((x, y) => x - y)[Math.floor(gaps.length / 2)] : NaN;
  };

  reset();
  ctx.currentTime = 0;
  const state = seedOf({ progression: 'C\nF#', bpm: 120, bars: 1, style: 'pad' });
  const h = player.startSeed({ ctx, getSeed: () => ({ ...state }), autoTick: false });
  runFor(h, 12);
  const oneBar = chordHoldGap(made.osc);

  state.bars = 2;
  const mark = made.osc.length;
  runFor(h, 24);
  const twoBars = chordHoldGap(made.osc.slice(mark));
  check(`live edit: bars/line  chord holds ${oneBar.toFixed(1)}s at 1 bar → ${twoBars.toFixed(1)}s at 2 bars`,
    Number.isFinite(twoBars) && twoBars > oneBar * 1.5, 'bars-per-line change did not reach the scheduler');
  h.stop();

  // And the pattern must still repeat every BAR while a chord is held — the bug
  // the barQ fix addressed: folding `bars` into the bar length stretched the
  // pattern across the whole line and silenced every bar after the first.
  reset();
  ctx.currentTime = 0;
  const long = player.startSeed({ ctx, getSeed: () => seedOf({ progression: 'C', bpm: 120, bars: 4, style: 'groove1' }), autoTick: false });
  runFor(long, 12);
  const hitsPerBar = made.osc.length / 6;        // 12s at 120bpm 4/4 = 6 bars
  check(`pattern repeats every bar at 4 bars/line (${hitsPerBar.toFixed(1)} hits/bar)`,
    hitsPerBar > 1.5, 'the pattern was stretched across the line instead of repeating');
  long.stop();

  // Time signature changes the bar length, so 3/4 must run shorter than 4/4.
  reset();
  ctx.currentTime = 0;
  const s2 = seedOf({ progression: 'C\nF', bpm: 120, sig: '4/4', style: 'pad' });
  const h2 = player.startSeed({ ctx, getSeed: () => ({ ...s2 }), autoTick: false });
  runFor(h2, 8);
  const four = onsetGap(made.osc);

  s2.sig = '3/4';
  const mark2 = made.osc.length;
  runFor(h2, 10);
  const three = onsetGap(made.osc.slice(mark2));
  check(`live edit: time sig   bar ${four.toFixed(2)}s in 4/4 → ${three.toFixed(2)}s in 3/4`,
    Number.isFinite(three) && three < four * 0.9, 'time-signature change did not reach the scheduler');
  h2.stop();
}

{
  // A style change must swap the gesture on the next chord.
  reset();
  ctx.currentTime = 0;
  const state = seedOf({ progression: 'C\nEm7\nAm\nF', style: 'pad' });
  const h = player.startSeed({ ctx, getSeed: () => ({ ...state }), autoTick: false });
  runFor(h, 2);
  const padPerSecond = made.osc.length / 2;

  state.style = 'groove1';                       // far more hits per bar than a pad
  const mark = made.osc.length;
  runFor(h, 2);
  const rhythmPerSecond = (made.osc.length - mark) / 2;
  check(`live edit: style   pad ${padPerSecond.toFixed(1)}/s → groove1 ${rhythmPerSecond.toFixed(1)}/s`,
    rhythmPerSecond > padPerSecond, 'style change did not reach the scheduler');
  h.stop();
}

{
  // An unparseable chord while typing must not kill playback.
  reset();
  ctx.currentTime = 0;
  const state = seedOf({ progression: 'C' });
  let errors = 0;
  const h = player.startSeed({ ctx, getSeed: () => ({ ...state }), autoTick: false, onError: () => errors++ });
  runFor(h, 1);
  state.sig = '4/5';                            // invalid: denominator must be a power of 2
  runFor(h, 1);
  state.sig = '4/4';
  const mark = made.osc.length;
  runFor(h, 2);
  check(`bad input survives  (${errors} error(s) reported, recovered)`,
    h.isRunning() && made.osc.length > mark, 'playback died on a transient bad value');
  h.stop();
}

// ─── 5. Waveforms still match the exporter ───────────────────────────────────
reset();
ctx.currentTime = 0;
{
  const h = player.startSeed({ ctx, getSeed: () => seedOf({ style: 'arpeggio1' }), autoTick: false });
  runFor(h, 2);
  check('every oscillator gets a real waveform', made.osc.length > 0 && made.osc.every((o) => o.wave?.imag?.length >= 2));
  h.stop();
}

// A fundamental plus fixed partials is exactly what a PeriodicWave describes, so
// these numbers ARE the exporter's waveforms rather than an approximation - which
// only stays true if both files carry the same coefficients.
const engineSrc = fs.readFileSync(path.join(ROOT, 'src/lib/seed-engine.js'), 'utf8');
const playerSrc = fs.readFileSync(path.join(ROOT, 'src/lib/seed-player.js'), 'utf8');
const WAVEFORMS = { tone: [0.35, 0.15], bright: [0.5, 0.32, 0.18] };

for (const [name, partials] of Object.entries(WAVEFORMS)) {
  const declared = new RegExp(`${name}:\\s*\\[0,\\s*1(,\\s*[\\d.]+)*\\s*\\]`).exec(playerSrc);
  const listed = declared ? declared[0].replace(/[^\d.,]/g, '').split(',').filter(Boolean).slice(2).map(Number) : null;
  const matches = listed && listed.length === partials.length && listed.every((v, i) => v === partials[i]);
  const stillInEngine = partials.every((h) => engineSrc.includes(String(h)));
  check(`waveform ${name.padEnd(7)} preview matches exporter`, Boolean(matches && stillInEngine),
    !matches ? 'PARTIALS in seed-player.js drifted' : 'coefficient no longer in seed-engine.js WAVES');
}

// ─── 6. Sampled instruments ──────────────────────────────────────────────────
let haveFfmpeg = true;
try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch { haveFfmpeg = false; }

const sfFile = path.join(ROOT, 'public', 'soundfont', 'FluidR3Mono_GM.sf3');
if (!haveFfmpeg || !fs.existsSync(sfFile)) {
  console.log(`skip  sampled instruments — ${haveFfmpeg ? 'soundfont not found' : 'ffmpeg not on PATH'}`);
} else {
  const decoder = {
    async decodeAudioData(ab) {
      const tmp = path.join(os.tmpdir(), `amsd-check-${ab.byteLength}.ogg`);
      fs.writeFileSync(tmp, Buffer.from(ab));
      const raw = execFileSync('ffmpeg', ['-v', 'quiet', '-i', tmp, '-f', 'f32le', '-ac', '1', '-'], { maxBuffer: 1 << 28 });
      fs.unlinkSync(tmp);
      const d = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4).slice();
      return { getChannelData: () => d };
    },
  };

  const bytes = fs.readFileSync(sfFile);
  const sf = sfMod.parseSoundFont(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));

  const unresolved = sfMod.SOUNDFONT_INSTRUMENTS.filter((i) => sfMod.presetIndexForProgram(sf, i.program) === null);
  check(`all ${sfMod.SOUNDFONT_INSTRUMENTS.length} instruments resolve to a preset`, unresolved.length === 0,
    unresolved.map((i) => i.key).join(', '));

  const load = async (program) => {
    const idx = sfMod.presetIndexForProgram(sf, program);
    if (idx !== null) await sfMod.loadPreset(sf, idx, decoder);
    return idx;
  };

  const pianoIdx = await load(0);
  reset();
  ctx.currentTime = 0;
  const h = player.startSeed({ ctx, getSeed: () => seedOf({}), getSoundFont: () => ({ sf, presetIndex: pianoIdx }), autoTick: false });
  runFor(h, 3);
  const rates = made.src.map((s) => s.playbackRate.value);
  check(`play piano  ${String(made.src.length).padStart(4)} buffer sources`,
    made.src.length > 0 && rates.every((r) => Number.isFinite(r) && r > 0.05 && r < 20), 'nothing scheduled, or a wild playback rate');
  check('a sampled instrument uses no oscillators', made.osc.length === 0);

  // Piano declares a 300 Hz cutoff on its GLOBAL instrument zone - the zone that
  // applies to every note. Reading only the per-note zones misses it entirely.
  const voiceF = made.filter.slice(CHAIN_FILTERS);
  const cutoffs = [...new Set(voiceF.map((f) => Math.round(f.frequency.value)))];
  check('piano applies its 300 Hz cutoff', voiceF.length > 0 && cutoffs.every((c) => c > 250 && c < 350),
    voiceF.length === 0 ? 'global-zone cutoff ignored' : `cutoffs ${cutoffs.join(', ')}`);

  h.stop();

  // One NOTE must not mix the same sample with itself. A preset whose layers are
  // separated at PRESET level does exactly that if only the instrument-level
  // ranges are checked (Tine Electric Piano stacked 9 copies, +19 dB).
  //
  // ⚠ Counted per note via noteVoices, NOT by dividing scheduled sources by
  // distinct onsets: a pad strikes every note of the chord at the same instant,
  // so onsets undercount notes by a factor of four and every instrument looks
  // stacked. (2 is legitimate — a stereo pair.)
  for (const inst of sfMod.SOUNDFONT_INSTRUMENTS) {
    const idx = await load(inst.program);
    const counts = [36, 60, 64, 67].map((m) => sfMod.noteVoices(sf, idx, m, 72).length);
    check(`voices/note ${inst.key.padEnd(10)} ${counts.join(',')}`, counts.every((c) => c >= 1 && c <= 2),
      'zone lookup is matching duplicate layers');
  }

  // Switching instrument mid-flight must be picked up, like every other edit.
  const rhodesIdx = await load(4);
  reset();
  ctx.currentTime = 0;
  let current = { sf, presetIndex: pianoIdx };
  const h2 = player.startSeed({ ctx, getSeed: () => seedOf({}), getSoundFont: () => current, autoTick: false });
  runFor(h2, 3);
  const beforeFilters = made.filter.length;
  current = { sf, presetIndex: rhodesIdx };
  const mark = made.src.length;
  runFor(h2, 4);

  // Both instruments declare a cutoff, so the tell is its VALUE, not its
  // presence: piano asks for 300 Hz and Rhodes for ~16 kHz.
  const afterCutoffs = [...new Set(made.filter.slice(beforeFilters).map((f) => Math.round(f.frequency.value)))];
  check(`live edit: instrument  piano→Rhodes  cutoff ${afterCutoffs.join(', ')} Hz`,
    made.src.length > mark && afterCutoffs.length > 0 && afterCutoffs.every((c) => c > 10000),
    made.src.length === mark ? 'nothing scheduled after the switch' : 'still using the piano preset');
  h2.stop();

  // Clean electric guitar is the one instrument whose samples are stored brighter
  // than the intended tone, with the tone kept as a cutoff.
  const cleanIdx = await load(27);
  if (cleanIdx !== null) {
    reset();
    ctx.currentTime = 0;
    const g = player.startSeed({ ctx, getSeed: () => seedOf({}), getSoundFont: () => ({ sf, presetIndex: cleanIdx }), autoTick: false });
    runFor(g, 2);
    const gf = made.filter.slice(CHAIN_FILTERS);
    const c = gf.map((f) => f.frequency.value);
    check(`clean guitar applies its cutoff  (${gf.length} filters)`,
      gf.length > 0 && gf.every((f) => f.type === 'lowpass') && c.every((v) => v > 400 && v < 1600),
      gf.length === 0 ? 'zone cutoff ignored' : `unexpected cutoffs: ${[...new Set(c)].join(', ')}`);
    g.stop();
  }

  // Church organ declares no cutoff anywhere, so "no filter" must stay genuinely
  // absent rather than becoming a wide-open biquad on every voice.
  const organIdx = await load(19);
  if (organIdx !== null) {
    reset();
    ctx.currentTime = 0;
    const o = player.startSeed({ ctx, getSeed: () => seedOf({}), getSoundFont: () => ({ sf, presetIndex: organIdx }), autoTick: false });
    runFor(o, 2);
    check('organ builds no per-voice filter nodes', made.filter.length === CHAIN_FILTERS,
      `${made.filter.length - CHAIN_FILTERS} built`);
    o.stop();
  }
}

// ─── The lane monitor ────────────────────────────────────────────────────────
// A solo button that quietly drops the wrong notes is worse than no solo button:
// every comparison made with it is then wrong, and nothing says so. These check
// the three properties that make it trustworthy.
{
  for (const style of engine.STYLES) {
    const plan = (lanes) => engine.planSeedEvents({ ...SEED, loops: 1, style, lanes });
    const both = plan('both'), bass = plan('bass'), treble = plan('treble');

    // 1. A partition: nothing lost, nothing counted twice. This is also what
    //    catches a gesture added later that forgets to tag its events.
    check(`lanes ${style.padEnd(11)} ${String(bass.events.length).padStart(3)} bass +` +
          ` ${String(treble.events.length).padStart(3)} treble = ${String(both.events.length).padStart(3)}`,
      bass.events.length + treble.events.length === both.events.length,
      'events lost or duplicated by the lane filter');

    // 2. Neither solo may be silent — a style where "bass only" plays nothing
    //    looks like a broken button rather than a style with no bass part.
    check(`lanes ${style.padEnd(11)} both solos sound`,
      bass.events.length > 0 && treble.events.length > 0,
      bass.events.length === 0 ? 'no bass events' : 'no treble events');

    // 3. Soloing must not change the notes it keeps. Note lengths are resolved
    //    against the FULL set (ring-until-restruck), so filtering before the
    //    gesture runs would make a soloed bass ring differently from the same
    //    bass inside the mix — and the comparison would be against a phantom.
    const key = (e) => `${e.chordOffset + e.at}:${e.midi}:${e.len}:${e.vel}`;
    const inMix = new Set(both.events.filter((e) => e.lane === 'bass').map(key));
    check(`lanes ${style.padEnd(11)} soloed bass is unchanged`,
      bass.events.every((e) => inMix.has(key(e))) && inMix.size === bass.events.length,
      'a soloed note differs from the same note in the mix');
  }

  // The live path must solo the same notes as the render, or the preview lies.
  for (const lanes of ['bass', 'treble']) {
    reset();
    ctx.currentTime = 0;
    const h = player.startSeed({ ctx, getSeed: () => seedOf({ style: 'groove1', lanes }), autoTick: false });
    runFor(h, 2);
    const played = new Set(made.osc.map((o) => Math.round(o.frequency.value)));
    h.stop();

    const expected = new Set(engine.planSeedEvents({ ...SEED, loops: 1, style: 'groove1', lanes })
      .events.map((e) => Math.round(440 * Math.pow(2, (e.midi - 69) / 12))));
    const stray = [...played].filter((f) => !expected.has(f));
    check(`lanes live ${lanes.padEnd(6)} ${played.size} distinct pitches, none outside the solo`,
      played.size > 0 && stray.length === 0, `stray: ${stray.join(', ')}`);
  }

  // And muting one lane must actually remove work, not merely silence it.
  const count = (lanes) => {
    reset();
    ctx.currentTime = 0;
    const h = player.startSeed({ ctx, getSeed: () => seedOf({ style: 'groove1', lanes }), autoTick: false });
    runFor(h, 2);
    h.stop();
    return made.osc.length;
  };
  const nBoth = count('both'), nBass = count('bass'), nTreble = count('treble');
  check(`lanes live  both ${nBoth} = bass ${nBass} + treble ${nTreble}`,
    nBass + nTreble === nBoth, 'the live scheduler and the render disagree on the split');
}

// ─── The master output filter ────────────────────────────────────────────────
// Two independent things have to hold: the file and the preview must filter the
// SAME way, and a seed with no cutoffs must stay bit-for-bit untouched — that
// second one is what keeps every pre-filter .yams rendering as it always did.
{
  const of = await lib('output-filter.js');

  const dry = new Float32Array(4096);
  for (let i = 0; i < dry.length; i++) dry[i] = Math.sin((2 * Math.PI * 60 * i) / 44100);

  check('filter off returns the SAME buffer, not a copy',
    of.applyOutputFilter(dry, { highpass: 0, lowpass: 0 }) === dry,
    'a pre-filter .yams would stop rendering byte-identically');

  // A 60 Hz tone under a 100 Hz highpass must lose level; a 60 Hz tone under a
  // 10 kHz lowpass must not.
  const rms = (x) => { let s = 0; for (const v of x) s += v * v; return Math.sqrt(s / x.length); };
  const hp = rms(of.applyOutputFilter(dry, { highpass: 100, lowpass: 0 }).subarray(2048));
  const lp = rms(of.applyOutputFilter(dry, { highpass: 0, lowpass: 10000 }).subarray(2048));
  const base = rms(dry.subarray(2048));
  check(`highpass 100 Hz cuts a 60 Hz tone  ${(20 * Math.log10(hp / base)).toFixed(1)} dB`,
    hp < base * 0.6, 'the highpass is not filtering');
  check(`lowpass 10 kHz leaves a 60 Hz tone ${(20 * Math.log10(lp / base)).toFixed(1)} dB`,
    lp > base * 0.9, 'the lowpass is eating the passband');

  // The live graph must ask for the same cutoffs the render used.
  reset();
  ctx.currentTime = 0;
  const h = player.startSeed({ ctx, autoTick: false,
    getSeed: () => seedOf({ highpass: 100, lowpass: 10000 }) });
  runFor(h, 1);
  h.stop();
  const types = made.filter.map((f) => `${f.type}@${Math.round(f.frequency.value)}`);
  check(`live filter graph  ${types.join(' ') || 'none'}`,
    types.includes('highpass@100') && types.includes('lowpass@10000'),
    'the preview is not filtered like the render');

  // The chain is built ONCE and "off" is a parked value, not an absent node —
  // so with no cutoffs the two master filters must sit out of the audible band.
  reset();
  ctx.currentTime = 0;
  const h2 = player.startSeed({ ctx, autoTick: false, getSeed: () => seedOf({}) });
  runFor(h2, 1);
  h2.stop();
  const hpOff = made.filter.find((f) => f.type === 'highpass');
  const lpOff = made.filter.filter((f) => f.type === 'lowpass').map((f) => f.frequency.value);
  check(`no cutoffs parks the filters  (hp @${hpOff?.frequency.value} Hz, lp @${Math.max(...lpOff)} Hz)`,
    !!hpOff && hpOff.frequency.value <= 20 && Math.max(...lpOff) >= 20000,
    'an "off" filter is still filtering the audible band');
}

// ─── The room, and where it sits in the chain ────────────────────────────────
// `buildReverbGraph` existed for weeks and was never called — the render had a
// room and the preview had none, which is the exact "preview that lies about
// the product" this file is here to prevent. Order matters as much as presence:
// the render puts the room BEFORE the master filters.
{
  reset();
  ctx.currentTime = 0;
  const h = player.startSeed({ ctx, autoTick: false, getSeed: () => seedOf({ reverb: 'chamber' }) });
  runFor(h, 1);
  h.stop();
  check(`live room builds its delay lines  (${made.delay.length} combs + allpass)`,
    made.delay.length >= 8, 'the preview has no reverb while the render does');

  // ⚠ The allpass stages must SUBTRACT their direct path. Adding it instead
  // turns each stage into a 3x amplifier (the delay settles at 2x its input),
  // 81x across the four — which arrives as a roar the limiter pumps on. One
  // inverting gain per stage is the structural signature of the minus sign.
  //
  // ⚠ Count CONNECTED inverters, not created ones. A first version of this
  // check counted `gain.value === -1` and passed happily when the node was
  // built and then never wired in — which is the bug itself.
  const inverters = made.gain.filter((g) => g.gain.value === -1 && g.connections.length > 0).length;
  check(`allpass stages subtract their direct path  (${inverters} inverters wired)`,
    inverters === 4, 'the room is amplifying instead of smearing — expect a roar');

  reset();
  ctx.currentTime = 0;
  const h2 = player.startSeed({ ctx, autoTick: false, getSeed: () => seedOf({ reverb: 'none' }) });
  runFor(h2, 1);
  h2.stop();
  // ⚠ THE STABILITY CHECK. Each comb is a feedback loop with a lowpass inside
  // it, so the loop oscillates the moment anything in that loop has gain above
  // 1 at any frequency. BiquadFilterNode's Q is in DECIBELS for lowpass — so
  // ANY positive Q.value is a resonant boost at the cutoff, an amplifier inside
  // the loop. Q=1 (the default, +1 dB) and Q=0.707 (+0.707 dB — set believing
  // it was the LINEAR Butterworth value) both made church howl: 0.938 feedback
  // x ~1.09 peak > 1. The property to assert is Q strictly negative in dB;
  // -3.0103 dB is linear 0.707, the flat response.
  for (const room of ['room', 'chamber', 'hall', 'church']) {
    reset();
    ctx.currentTime = 0;
    const hr = player.startSeed({ ctx, autoTick: false, getSeed: () => seedOf({ reverb: room }) });
    runFor(hr, 1);
    hr.stop();
    const combLp = made.filter.filter((f) => f.type === 'lowpass');
    const worstQ = Math.max(...combLp.map((f) => f.Q.value));
    const fb = Math.max(...made.gain.map((g) => g.gain.value).filter((v) => v > 0 && v < 1));
    check(`room ${room.padEnd(8)} cannot oscillate  (feedback ${fb.toFixed(3)}, worst Q ${worstQ.toFixed(2)} dB)`,
      combLp.length > 0 && worstQ < 0 && fb < 1,
      'a positive-dB Q is a resonant boost inside the feedback loop — the room howls');
  }

  // The network is built once; `none` is expressed as CLOSED VALUES — wet gain
  // 0 and comb feedback 0 — never as absent nodes (see reverb.js for why a
  // rebuilt network leaks).
  reset();
  ctx.currentTime = 0;
  const h2b = player.startSeed({ ctx, autoTick: false, getSeed: () => seedOf({ reverb: 'none' }) });
  runFor(h2b, 1);
  h2b.stop();
  const closed = made.gain.filter((g) => g.gain.value === 0).length;
  check(`no room closes the wet path  (${made.delay.length} delays kept, ${closed} gains at 0)`,
    made.delay.length >= 12 && closed >= 9,     // wet + 8 comb feedbacks
    'the "none" room is not actually silent');

  // ⚠ Changing the room while it plays must actually change the VALUES. It did
  // not for the first hour: the chain was read once at Play, so the dropdown
  // sat there doing nothing until you stopped and started again.
  reset();
  ctx.currentTime = 0;
  const state = seedOf({ reverb: 'none' });
  const h4 = player.startSeed({ ctx, autoTick: false, getSeed: () => ({ ...state }) });
  runFor(h4, 1);
  const delaysBefore = made.delay.length;
  state.reverb = 'hall';
  runFor(h4, 3);
  h4.stop();
  const hallFb = 0.28 + 0.7 * 0.89;             // hall's feedback, from ROOMS
  const fbNow = made.gain.filter((g) => Math.abs(g.gain.value - hallFb) < 1e-3).length;
  check(`room change applies while playing  (${fbNow} combs at hall feedback, ${made.delay.length} delays — no rebuild)`,
    fbNow === 8 && made.delay.length === delaysBefore,
    fbNow === 0 ? 'the room dropdown does nothing until Play is restarted'
                : 'the change rebuilt the network instead of re-pointing it');

  // ⚠ PER-LANE SENDS (2026-09-01): the combs are fed from the room's
  // sendInput via each lane's send gain, not from the dry input. This check
  // walks the RECORDED connections — the earlier allpass bug proved that
  // counting created nodes passes while the wiring is absent — and asserts
  // every voice reaches BOTH the destination (dry) and a comb delay (send),
  // and that the two lanes' send gains carry their own distinct values.
  reset();
  ctx.currentTime = 0;
  const h3s = player.startSeed({ ctx, autoTick: false, getSeed: () =>
    seedOf({ style: 'groove1', reverb: 'chamber', trebleReverb: 1, bassReverb: 0.4 }) });
  runFor(h3s, 2);
  h3s.stop();
  const reaches = (from, want) => {          // BFS over recorded connect() edges
    const seen = new Set();
    const q = [from];
    while (q.length) {
      const cur = q.shift();
      if (seen.has(cur)) continue;
      seen.add(cur);
      if (want(cur)) return true;
      for (const nx of cur.connections || []) q.push(nx);
    }
    return false;
  };
  const voices = made.osc;
  const allDry = voices.every((o) => reaches(o, (nd) => nd.kind === 'destination'));
  const allSend = voices.every((o) => reaches(o, (nd) => nd.kind === 'delay'));
  const sendGains = made.gain.filter((g) => [1, 0.4].includes(g.gain.value) &&
    reaches(g, (nd) => nd.kind === 'delay') && g.connections.length === 1);
  check(`per-lane sends are WIRED  (${voices.length} voices reach dry + room; sends ${sendGains.map((g) => g.gain.value).join('/')})`,
    voices.length > 0 && allDry && allSend && new Set(sendGains.map((g) => g.gain.value)).size === 2,
    'a lane bus is not connected — that lane plays dry (or silent) while the render has its reverb');

  // And a stopped player must not leave its feedback network wired to the
  // output — a howling one would otherwise survive every restart of playback.
  reset();
  ctx.currentTime = 0;
  const h5 = player.startSeed({ ctx, autoTick: false, getSeed: () => seedOf({ reverb: 'church' }) });
  runFor(h5, 1);
  const masterGain = made.gain[0];
  h5.stop();
  await new Promise((r) => setTimeout(r, 400));
  check(`stop disconnects the chain  (master → ${masterGain.connections.length} live)`,
    masterGain.connections.length === 0,
    'the room outlives the session that built it and cannot be silenced');

  // The offline room, measured rather than inspected — the same runaway-gain
  // bug could grow here, and here it CAN be checked numerically.
  {
    const rv = await lib('reverb.js');
    const n = 44100;
    const tone = new Float32Array(n);
    for (let i = 0; i < n; i++) tone[i] = Math.sin((2 * Math.PI * 220 * i) / 44100);
    const rms = (x) => { let s = 0; for (const v of x) s += v * v; return Math.sqrt(s / x.length); };
    const dryRms = rms(tone);
    for (const room of rv.ROOM_KEYS.filter((k) => k !== 'none')) {
      const g = rms(rv.applyReverb(tone, room, 44100, 1)) / dryRms;
      check(`offline room ${room.padEnd(8)} gain ${g.toFixed(2)}x`, g > 0.9 && g < 2,
        g >= 2 ? 'the room is amplifying, not just adding a tail' : 'the room is eating the dry signal');
    }
  }

  // With BOTH on, the master must reach the room before it reaches a master
  // filter. Walk the recorded connections outward from master and see which
  // comes first.
  reset();
  ctx.currentTime = 0;
  const h3 = player.startSeed({ ctx, autoTick: false,
    getSeed: () => seedOf({ reverb: 'chamber', highpass: 100, lowpass: 10000 }) });
  runFor(h3, 1);
  const master = made.gain[0];
  const firstHop = master && master.connections[0];
  h3.stop();
  check(`room precedes the master filters  (master → ${firstHop ? firstHop.kind : 'nothing'})`,
    !!firstHop && firstHop.kind !== 'filter',
    'the mix is being filtered before the room, the opposite of the render');
}

// ─── The bass lane's own instrument ──────────────────────────────────────────
// The engine already routed `bassSoundfont`; the player has to agree, or the
// preview plays one instrument where the file plays two.
{
  // An empty pack yields no voices, so every note falls through to the synth.
  // That is enough to prove WHICH provider each lane consulted, without needing
  // a second real instrument decoded.
  const empty = { pack: { name: 'test-bass', zones: [], pcm: new Map(), gain: 1, lo: 0, hi: 127 } };
  let bassAsked = 0;

  reset();
  ctx.currentTime = 0;
  const h = player.startSeed({ ctx, autoTick: false,
    getSeed: () => seedOf({ style: 'groove1' }),
    getSoundFont: () => null,
    getBassSoundFont: () => { bassAsked++; return empty; } });
  runFor(h, 2);
  h.stop();
  check(`the bass lane consults its own provider  (asked ${bassAsked}x)`, bassAsked > 0,
    'getBassSoundFont was never called — the bass cannot have its own instrument');
}

// ─── The preview must play the arrangement the render writes ─────────────────
// The gesture context is the whole contract between the two. Three of its
// fields were absent from the player until 2026-08-29 — the bass register
// anchor, the approach note, and swing — so the preview quietly played a
// different arrangement. Compare pitches, which is what those fields move.
{
  const pitchesOf = (seed, seconds) => {
    reset();
    ctx.currentTime = 0;
    const h = player.startSeed({ ctx, getSeed: () => seed, autoTick: false });
    runFor(h, seconds);
    h.stop();
    return new Set(made.osc.map((o) => Math.round(69 + 12 * Math.log2(o.frequency.value / 440))));
  };

  for (const style of ['groove1', 'arpeggio1', 'pad']) {
    const seed = seedOf({ progression: 'Bm F#7 A E', bpm: 120, style });
    // ⚠ Long enough to cover EVERY chord — 4 bars at 120 bpm is 8 s. A shorter
    // run makes the comparison one-directional by accident, and groove1's early
    // turnaround (which needs nextNotes + the last-beat condition) lives on the
    // final slots of a bar.
    const live = pitchesOf(seed, 10);
    const rendered = new Set(engine.planSeedEvents({ ...seed, loops: 1 }).events.map((e) => e.midi));

    const extra = [...live].filter((m) => !rendered.has(m));
    const missing = [...rendered].filter((m) => !live.has(m));
    check(`preview matches render  ${style.padEnd(10)} ${live.size} live / ${rendered.size} rendered`,
      extra.length === 0 && missing.length === 0,
      [extra.length ? `preview plays ${extra.join(',')} the file does not` : '',
       missing.length ? `file plays ${missing.join(',')} the preview does not` : ''].filter(Boolean).join('; '));
  }
}

console.log(`\n${failed} failure(s)`);
process.exit(failed ? 1 : 0);

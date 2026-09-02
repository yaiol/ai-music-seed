// ─────────────────────────────────────────────────────────────────────────────
// soundfont.js - SF2/SF3 SoundFont reader for the renderer.
//
// Reads the bundled FluidR3Mono_GM.sf3 (MIT, see public/soundfont/) and turns a
// preset + MIDI note into playable sample data. Pure functions over an
// ArrayBuffer + a Web Audio decode; no DOM, no Node.
//
// WHY A SOUNDFONT: the four seed styles are gestures (how the chord moves). The
// instrument is the timbre they are played with. `sine` is the app's original
// built-in synth; every other instrument comes out of this file. Keeping the two
// axes apart is what stops "12 styles x 30 instruments" becoming 360 renderers.
//
// SCOPE: preset -> instrument -> zone resolution, key/velocity ranges, tuning,
// loop points and the volume envelope. Deliberately NOT implemented: the
// per-zone lowpass filter and the modulator matrix. Both shape the timbre (the
// filter especially, on soft velocity layers) - they are the next tier, not a
// correctness gap that makes notes come out wrong.
//
// SF3 vs SF2: .sf3 is .sf2 with each sample stored as an OGG Vorbis stream
// inside the `smpl` chunk (200 MB -> 23 MB). Chromium decodes OGG natively, so
// decodeAudioData does the decompression for free.
// ─────────────────────────────────────────────────────────────────────────────

// ─── SF2 generator opcodes ───────────────────────────────────────────────────
const GEN = {
  startAddrsOffset: 0, endAddrsOffset: 1, startloopAddrsOffset: 2, endloopAddrsOffset: 3,
  startloopAddrsCoarseOffset: 45, endloopAddrsCoarseOffset: 50,
  initialFilterFc: 8, initialFilterQ: 9,
  attackVolEnv: 34, holdVolEnv: 35, decayVolEnv: 36, sustainVolEnv: 37, releaseVolEnv: 38,
  instrument: 41, keyRange: 43, velRange: 44,
  initialAttenuation: 48, coarseTune: 51, fineTune: 52,
  sampleID: 53, sampleModes: 54, scaleTuning: 56, overridingRootKey: 58,
};

// The General MIDI programs offered in the UI. A curated subset, not all 128:
// these are the timbres that make sense under a harmonic seed. The order here is
// the order of the instrument dropdown.
// `family` is the musical grouping the instrument picker sections the list by
// (Keys / Guitars / Strings / …). VSCO packs derive theirs from the pack-name
// prefix; the GM subset has no such structure, so it is declared here. Plain
// EN literals for now, like the pack labels — naming/translation is batched
// once the instrument set settles.
// The families split STRINGS by mechanism (Plucked vs Bowed — which is why the
// guitars sit beside the harp, their organological sibling, not the violins)
// and PERCUSSION by pitch (Tuned vs Untuned).
// ⚠ CLAUDE: ALL GM presets were removed from this list on 2026-08-30 (user
// ruling): FluidR3's samples carry whistling overtone tails — the "larsen"
// after each note lives in the samples themselves (proven on nylon, heard on
// electric guitar and harp too) — so the GM bank is no longer trusted as an
// instrument source. Only the built-in synth and the library packs remain.
// The SOUNDFONT LAYER (parser, loader, noteVoices, the sf3 asset, /soundfont)
// is deliberately KEPT half-idle per the same ruling ("for now you can keep
// the soundfont layer") — it is NOT dead code to clean up; a better bank may
// use it. A .yams naming an old GM key falls back to the built-in synth.
export const INSTRUMENTS = [
  { key: 'sine',      program: null, i18n: 'Sine',     family: 'Synth'               },   // the app's original built-in synth
];

export const SOUNDFONT_INSTRUMENTS = INSTRUMENTS.filter((i) => i.program !== null);
export const isSampled = (key) => key !== 'sine' && INSTRUMENTS.some((i) => i.key === key);

// ─── RIFF walking ────────────────────────────────────────────────────────────
const ascii = (dv, at, len) => {
  let s = '';
  for (let i = 0; i < len; i++) s += String.fromCharCode(dv.getUint8(at + i));
  return s;
};

const cstr = (dv, at, len) => {
  const raw = ascii(dv, at, len);
  const z = raw.indexOf('\0');
  return (z === -1 ? raw : raw.slice(0, z)).trim();
};

function readChunks(dv, start, end) {
  const out = [];
  let p = start;
  while (p + 8 <= end) {
    const id = ascii(dv, p, 4);
    const size = dv.getUint32(p + 4, true);
    let dataStart = p + 8;
    let listType = null;
    if (id === 'LIST' || id === 'RIFF') {
      listType = ascii(dv, dataStart, 4);
      dataStart += 4;
    }
    out.push({ id, listType, start: dataStart, end: Math.min(p + 8 + size, end) });
    p += 8 + size + (size & 1);              // chunks are word-aligned
  }
  return out;
}

// ─── Record readers ──────────────────────────────────────────────────────────
const readRecords = (dv, c, stride, fn) => {
  const out = [];
  for (let p = c.start; p + stride <= c.end; p += stride) out.push(fn(p));
  return out;
};

const readPhdr = (dv, c) => readRecords(dv, c, 38, (p) => ({
  name: cstr(dv, p, 20),
  program: dv.getUint16(p + 20, true),
  bank: dv.getUint16(p + 22, true),
  bagNdx: dv.getUint16(p + 24, true),
}));

const readInst = (dv, c) => readRecords(dv, c, 22, (p) => ({
  name: cstr(dv, p, 20),
  bagNdx: dv.getUint16(p + 20, true),
}));

const readBag = (dv, c) => readRecords(dv, c, 4, (p) => ({ genNdx: dv.getUint16(p, true) }));

const readGen = (dv, c) => readRecords(dv, c, 4, (p) => ({
  op: dv.getUint16(p, true),
  u16: dv.getUint16(p + 2, true),
  s16: dv.getInt16(p + 2, true),
  lo: dv.getUint8(p + 2),
  hi: dv.getUint8(p + 3),
}));

const readShdr = (dv, c) => readRecords(dv, c, 46, (p) => ({
  name: cstr(dv, p, 20),
  start: dv.getUint32(p + 20, true),
  end: dv.getUint32(p + 24, true),
  startloop: dv.getUint32(p + 28, true),
  endloop: dv.getUint32(p + 32, true),
  sampleRate: dv.getUint32(p + 36, true),
  originalPitch: dv.getUint8(p + 40),
  pitchCorrection: dv.getInt8(p + 41),
  sampleType: dv.getUint16(p + 44, true),
}));

// A bag range → zones, each a Map of generator op → record.
function zonesOf(bags, gens, from, to) {
  const zones = [];
  for (let b = from; b < to && b < bags.length; b++) {
    const g0 = bags[b].genNdx;
    const g1 = b + 1 < bags.length ? bags[b + 1].genNdx : gens.length;
    const m = new Map();
    for (let g = g0; g < g1 && g < gens.length; g++) m.set(gens[g].op, gens[g]);
    zones.push(m);
  }
  return zones;
}

// ─── Parsing ─────────────────────────────────────────────────────────────────
/** Parse a .sf2/.sf3 ArrayBuffer into an index. Cheap - no sample decoding. */
export function parseSoundFont(arrayBuffer) {
  const dv = new DataView(arrayBuffer);
  const riff = readChunks(dv, 0, dv.byteLength)[0];
  if (!riff || riff.id !== 'RIFF' || riff.listType !== 'sfbk') {
    throw new Error('Not a SoundFont file (RIFF/sfbk expected)');
  }

  const top = readChunks(dv, riff.start, riff.end);
  const sdta = top.find((c) => c.listType === 'sdta');
  const pdta = top.find((c) => c.listType === 'pdta');
  if (!sdta || !pdta) throw new Error('SoundFont is missing its sdta/pdta chunk');

  const smpl = readChunks(dv, sdta.start, sdta.end).find((c) => c.id === 'smpl');
  if (!smpl) throw new Error('SoundFont has no sample chunk');
  const P = Object.fromEntries(readChunks(dv, pdta.start, pdta.end).map((c) => [c.id, c]));

  return {
    buffer: arrayBuffer,
    dv,
    smplStart: smpl.start,
    phdr: readPhdr(dv, P.phdr),
    pbag: readBag(dv, P.pbag),
    pgen: readGen(dv, P.pgen),
    inst: readInst(dv, P.inst),
    ibag: readBag(dv, P.ibag),
    igen: readGen(dv, P.igen),
    shdr: readShdr(dv, P.shdr),
    pcm: new Map(),            // sampleID → Float32Array, filled by loadPreset()
    presetGain: new Map(),     // presetIndex → level-matching gain, set by loadPreset()
  };
}

// The peak one note of a preset produces, before any level matching. Summed
// across the zones that note triggers, because they all sound together.
function referencePeak(sf, presetIndex, midi, vel) {
  let sum = 0;
  for (const v of noteVoices(sf, presetIndex, midi, vel)) {
    let peak = 0;
    for (const s of v.pcm) { const a = Math.abs(s); if (a > peak) peak = a; }
    sum += v.gain * peak;
  }
  return sum;
}

// What a single note of the built-in synth peaks at (gesturePad's amp). Sampled
// instruments are matched to it so that switching instrument changes the TIMBRE
// and not the volume.
const TARGET_NOTE_PEAK = 0.16;

/**
 * ⚠ CLAUDE: without this every instrument plays at whatever level its samples
 * happen to sit at, and a SoundFont does not promise those are comparable —
 * measured across this bank the spread is ~18 dB (grand piano peaked at 0.06
 * where strings hit 0.47). The exported file hides it behind peak
 * normalisation; LIVE PLAYBACK has no such stage, so it is audible immediately
 * as "the piano is much quieter than everything else".
 *
 * Matching happens per preset, once, at load — never per note, which would
 * flatten the dynamics the gestures deliberately create.
 */
function matchPresetLevel(sf, presetIndex) {
  const refs = [48, 60, 72].map((m) => referencePeak(sf, presetIndex, m, 100)).filter((v) => v > 1e-6);
  if (!refs.length) return;
  const loudest = Math.max(...refs);
  sf.presetGain.set(presetIndex, TARGET_NOTE_PEAK / loudest);
}

/** Melodic presets (bank 0), minus the terminal EOP record. */
export function listPresets(sf) {
  return sf.phdr.slice(0, -1)
    .map((p, index) => ({ index, name: p.name, bank: p.bank, program: p.program }))
    .filter((p) => p.bank === 0);
}

/** The preset index for a GM program number, or null when the bank has no such program. */
export function presetIndexForProgram(sf, program) {
  const hit = listPresets(sf).find((p) => p.program === program);
  return hit ? hit.index : null;
}

// ─── Zone resolution ─────────────────────────────────────────────────────────
// Every (instrument zone, sample) pair a preset can play.
function presetZones(sf, presetIndex) {
  const pzones = zonesOf(sf.pbag, sf.pgen, sf.phdr[presetIndex].bagNdx, sf.phdr[presetIndex + 1].bagNdx);

  const out = [];
  let pGlobal = new Map();
  for (const pz of pzones) {
    if (!pz.has(GEN.instrument)) { pGlobal = pz; continue; }   // global preset zone
    const instIdx = pz.get(GEN.instrument).u16;
    if (!sf.inst[instIdx] || !sf.inst[instIdx + 1]) continue;
    const izones = zonesOf(sf.ibag, sf.igen, sf.inst[instIdx].bagNdx, sf.inst[instIdx + 1].bagNdx);

    let iGlobal = new Map();
    for (const iz of izones) {
      if (!iz.has(GEN.sampleID)) { iGlobal = iz; continue; }   // global instrument zone
      out.push({ preset: pz, presetGlobal: pGlobal, inst: iz, instGlobal: iGlobal });
    }
  }
  return out;
}

// Generator lookup, SF2 precedence: instrument zone → instrument global → default.
const gen = (z, op) => z.inst.get(op) ?? z.instGlobal.get(op);
const genS = (z, op, dflt) => { const g = gen(z, op); return g === undefined ? dflt : g.s16; };
const genU = (z, op, dflt) => { const g = gen(z, op); return g === undefined ? dflt : g.u16; };
const inRange = (g, v) => g === undefined || (v >= g.lo && v <= g.hi);

// Preset-level generators. Key/velocity ranges here are FILTERS (like the
// instrument's); everything else is an OFFSET added on top of the instrument's
// value, which is what the SF2 spec means by a preset "layer".
const pGen = (z, op) => z.preset.get(op) ?? z.presetGlobal.get(op);
const pAdd = (z, op) => { const g = pGen(z, op); return g === undefined ? 0 : g.s16; };

// Filter resonance in dB (SF2 stores it in centibels).
const qDb = (z) => (genS(z, GEN.initialFilterQ, 0) + pAdd(z, GEN.initialFilterQ)) / 10;

/**
 * ⚠ CLAUDE: BOTH range pairs have to match - the instrument zone's AND the
 * preset zone's. Checking only the instrument's is not a subtle inaccuracy: a
 * preset whose layers are separated at PRESET level then matches every layer at
 * once, and the same sample is mixed on top of itself. Tine Electric Piano
 * stacked 9 identical copies that way (+19 dB, 40% of samples past full scale) -
 * it sounded saturated, and the cause looked like a bad sample rather than a
 * bad lookup.
 */
function pickZones(sf, presetIndex, midi, vel) {
  const all = sf.zoneCache?.get(presetIndex) ?? presetZones(sf, presetIndex);
  if (sf.zoneCache && !sf.zoneCache.has(presetIndex)) sf.zoneCache.set(presetIndex, all);
  return all.filter((z) =>
    inRange(gen(z, GEN.keyRange), midi) && inRange(gen(z, GEN.velRange), vel) &&
    inRange(pGen(z, GEN.keyRange), midi) && inRange(pGen(z, GEN.velRange), vel));
}

// ─── Sample decoding ─────────────────────────────────────────────────────────
const isOgg = (sf, sh) => ascii(sf.dv, sf.smplStart + sh.start, 4) === 'OggS';

/**
 * Decode every sample a preset can reach, into sf.pcm. Async (decodeAudioData);
 * call once per instrument, before rendering. Idempotent and cached.
 */
export async function loadPreset(sf, presetIndex, audioContext) {
  sf.zoneCache = sf.zoneCache || new Map();
  const zones = pickZonesAll(sf, presetIndex);
  const ids = [...new Set(zones.map((z) => genU(z, GEN.sampleID, -1)))].filter((id) => id >= 0);

  for (const id of ids) {
    if (sf.pcm.has(id)) continue;
    const sh = sf.shdr[id];
    if (!sh) continue;

    if (isOgg(sf, sh)) {
      // SF3: shdr start/end are BYTE offsets into smpl, framing an OGG stream.
      const blob = sf.buffer.slice(sf.smplStart + sh.start, sf.smplStart + sh.end);
      try {
        const buf = await audioContext.decodeAudioData(blob);
        sf.pcm.set(id, buf.getChannelData(0));
      } catch {
        sf.pcm.set(id, new Float32Array(0));       // unreadable sample → silent, never fatal
      }
    } else {
      // SF2: frame offsets into 16-bit PCM.
      const n = sh.end - sh.start;
      const out = new Float32Array(Math.max(0, n));
      for (let i = 0; i < n; i++) out[i] = sf.dv.getInt16(sf.smplStart + (sh.start + i) * 2, true) / 32768;
      sf.pcm.set(id, out);
    }
  }
  // Only once every sample is decoded can the preset's real peak be measured.
  if (!sf.presetGain.has(presetIndex)) matchPresetLevel(sf, presetIndex);
  return sf;
}

function pickZonesAll(sf, presetIndex) {
  sf.zoneCache = sf.zoneCache || new Map();
  if (!sf.zoneCache.has(presetIndex)) sf.zoneCache.set(presetIndex, presetZones(sf, presetIndex));
  return sf.zoneCache.get(presetIndex);
}

// ─── Note rendering ──────────────────────────────────────────────────────────
const tc2s = (tc) => (tc <= -12000 ? 0 : Math.pow(2, tc / 1200));    // timecents → seconds
const cb2gain = (cb) => Math.pow(10, -cb / 200);                     // centibels → linear
const absCents2hz = (c) => 8.176 * Math.pow(2, c / 1200);            // absolute cents → Hz

// Above this the filter is inaudible, so it is cheaper (and bit-safer) to skip
// it entirely than to run a no-op biquad over every sample.
export const FILTER_OPEN_HZ = 18000;

/**
 * A 2-pole resonant lowpass, matching what SF2 specifies (12 dB/octave).
 * Returned as a stateful step function - one instance per sounding voice,
 * because a biquad carries the last two input and output samples.
 */
function makeLowpass(hz, qDb, sampleRate) {
  const q = Math.max(0.5, Math.pow(10, qDb / 20));
  const w = 2 * Math.PI * Math.min(hz, sampleRate * 0.45) / sampleRate;
  const alpha = Math.sin(w) / (2 * q);
  const cosw = Math.cos(w);

  const a0 = 1 + alpha;
  const b0 = ((1 - cosw) / 2) / a0;
  const b1 = (1 - cosw) / a0;
  const b2 = b0;
  const a1 = (-2 * cosw) / a0;
  const a2 = (1 - alpha) / a0;

  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

/**
 * The playable voices for one note: every zone that matches (midi, vel),
 * resolved into a description with no rendering strategy baked in.
 *
 * ⚠ CLAUDE: this is the ONE place the SF2 zone maths lives. Both consumers read
 * it - renderNote() below (offline, hand-rolled DSP, for the exported file) and
 * seed-player.js (Web Audio, for live preview). Duplicating any of it means the
 * preview and the export can drift apart silently, which is the one bug a
 * preview must never have.
 *
 * `cents` and `sampleRate` are kept separate rather than pre-combined into a
 * ratio, because the two consumers need different combinations of them: the
 * offline renderer wants a step per OUTPUT frame, Web Audio wants a playbackRate
 * against a buffer that already carries the sample's own rate.
 */
export function noteVoices(sf, presetIndex, midi, vel) {
  const voices = [];
  for (const z of pickZones(sf, presetIndex, midi, vel)) {
    const sampleID = genU(z, GEN.sampleID, -1);
    const sh = sf.shdr[sampleID];
    const pcm = sf.pcm.get(sampleID);
    if (!sh || !pcm || !pcm.length) continue;

    // Pitch: sample root → requested note, plus the zone's and sample's tuning.
    const rootOverride = genS(z, GEN.overridingRootKey, -1);
    const root = rootOverride >= 0 ? rootOverride : sh.originalPitch;
    const cents = (midi - root) * genS(z, GEN.scaleTuning, 100)
      + (genS(z, GEN.coarseTune, 0) + pAdd(z, GEN.coarseTune)) * 100
      + genS(z, GEN.fineTune, 0) + pAdd(z, GEN.fineTune) + sh.pitchCorrection;

    // Loop window. SF3 loop points are already relative to the decoded sample;
    // SF2's are absolute frame offsets that must be rebased onto the sample.
    const base = isOgg(sf, sh) ? 0 : sh.start;
    const loopStart = sh.startloop - base
      + genS(z, GEN.startloopAddrsOffset, 0) + genS(z, GEN.startloopAddrsCoarseOffset, 0) * 32768;
    const loopEnd = sh.endloop - base
      + genS(z, GEN.endloopAddrsOffset, 0) + genS(z, GEN.endloopAddrsCoarseOffset, 0) * 32768;
    const canLoop = (genU(z, GEN.sampleModes, 0) & 1) === 1
      && loopEnd > loopStart + 8 && loopEnd <= pcm.length && loopStart >= 0;

    // Volume envelope (SF2 defaults where a generator is absent).
    const susCb = Math.max(0, genS(z, GEN.sustainVolEnv, 0));

    voices.push({
      pcm,
      sampleRate: sh.sampleRate,
      cents,
      loop: canLoop ? { start: loopStart, end: loopEnd } : null,
      env: {
        atkS: tc2s(genS(z, GEN.attackVolEnv, -12000)),
        holdS: tc2s(genS(z, GEN.holdVolEnv, -12000)),
        decS: tc2s(genS(z, GEN.decayVolEnv, -12000)),
        relS: Math.max(0.06, tc2s(genS(z, GEN.releaseVolEnv, -12000))),
        susLevel: susCb >= 1000 ? 0 : cb2gain(susCb),
      },
      // A resonant lowpass BOOSTS the region around its cutoff, so SF2 players
      // pull the level back by half the resonance to keep the patch's loudness
      // where its author set it. Without this a high-Q zone is both louder and
      // more peaky than intended.
      gain: cb2gain(genS(z, GEN.initialAttenuation, 0) + pAdd(z, GEN.initialAttenuation))
        * Math.pow(10, -qDb(z) / 40) * Math.pow(vel / 127, 1.1)
        * (sf.presetGain.get(presetIndex) ?? 1),
      // Lowpass. A zone's samples are often stored BRIGHTER than the instrument
      // is meant to sound, with the intended tone stored here instead - so
      // ignoring it does not play the instrument "neutrally", it plays it wrong.
      // The SF2 default (13500 cents ≈ 20 kHz) is above hearing, i.e. no filter,
      // which is how most zones opt out.
      filterHz: absCents2hz(genS(z, GEN.initialFilterFc, 13500) + pAdd(z, GEN.initialFilterFc)),
      filterQdB: qDb(z),
    });
  }
  return voices;
}

/**
 * Mix one note into `out` (Float32Array of output frames) starting at `offset`.
 * Additive, so chords are just several calls. Notes ring past `durS` by their
 * release and are clipped by the buffer end - which is what a loopable seed
 * wants (the tail belongs to the next repeat, not to a trailing pad).
 */
export function renderNote(sf, presetIndex, { midi, vel, durS, out, offset, sampleRate }) {
  renderVoices(noteVoices(sf, presetIndex, midi, vel), { durS, out, offset, sampleRate });
}

/**
 * Mix a note's voices into `out`. Takes DESCRIPTORS, not a source — so a
 * SoundFont preset and a compiled sample pack render through the same code.
 * ⚠ CLAUDE: keep this free of any knowledge of where the voices came from.
 */
export function renderVoices(voices, { durS, out, offset, sampleRate }) {
  for (const v of voices) {
    const { pcm, gain, loop } = v;
    const { atkS, holdS, decS, relS, susLevel } = v.env;
    const ratio = Math.pow(2, v.cents / 1200) * (v.sampleRate / sampleRate);
    const canLoop = loop !== null;
    const loopStart = loop ? loop.start : 0;
    const loopEnd = loop ? loop.end : 0;

    const total = Math.floor((durS + relS) * sampleRate);
    const lowpass = v.filterHz < FILTER_OPEN_HZ ? makeLowpass(v.filterHz, v.filterQdB, sampleRate) : null;
    let pos = 0;

    for (let i = 0; i < total; i++) {
      const o = offset + i;
      if (o >= out.length) break;

      const t = i / sampleRate;
      let env;
      if (t < atkS) env = atkS > 0 ? t / atkS : 1;
      else if (t < atkS + holdS) env = 1;
      else if (t < atkS + holdS + decS) env = 1 + ((t - atkS - holdS) / (decS || 1)) * (susLevel - 1);
      else env = susLevel;
      if (t > durS) env *= Math.max(0, 1 - (t - durS) / relS);
      if (env <= 0 && t > durS) break;

      const i0 = Math.floor(pos);
      if (i0 + 1 >= pcm.length) {
        if (!canLoop) break;
        pos = loopStart + (pos - loopEnd);
        continue;
      }
      const frac = pos - i0;
      // Filter the source, then apply the amplitude envelope - the SF2 signal
      // path order, and the one that keeps resonance from being re-shaped by
      // the envelope.
      let s = pcm[i0] * (1 - frac) + pcm[i0 + 1] * frac;
      if (lowpass) s = lowpass(s);
      out[o] += gain * env * s;

      pos += ratio;
      if (canLoop && pos >= loopEnd) pos -= (loopEnd - loopStart);
    }
  }
}

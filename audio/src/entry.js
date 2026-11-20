// The page's side of AI Music Seed: the audio. The sound is made here, in the page, by the very files the Electron app
// uses (src/lib: seed-engine, seed-player, soundfont, reverb, sample-pack, output-filter), so a seed sounds and renders
// the same in both. Everything below `window.amsd` is the part of the Electron app's App.jsx that touches audio, moved
// here unchanged in behaviour: the instrument loaders, live playback with its lit keys and playhead, the render, the
// audition and the tune probe. The window (Rust) pushes the active seed in and receives messages back through
// `dioxus.send`.

import { generateSeed } from './lib/seed-engine.js';
import { INSTRUMENTS } from './lib/soundfont.js';
import { loadPack } from './lib/sample-pack.js';
import { startSeed, playOnce } from './lib/seed-player.js';

let API = '';

// ⚠ ONE AudioContext for the whole session. Chromium caps a page at a handful of them, so a context per instrument
// would start throwing once enough instruments had been tried. It only decodes samples and plays the live preview.
let audioCtx = null;
const getAudioContext = () => (audioCtx ||= new (window.AudioContext || window.webkitAudioContext)());

// Compiled sample packs: each pack's samples are fetched and decoded only when that instrument is first used.
const PACK_PREFIX = 'vsco:';
const packLoaded = new Map();          // pack name -> Promise<pack>

// Resolve an instrument key to a VOICE PROVIDER, with its samples decoded and ready for a synchronous render.
// null for 'sine' (the built-in synth). The key's PREFIX picks the source: 'vsco:<pack>' is a compiled pack. The
// SoundFont bank is gone from the product (its samples carried overtone tails), so every other key is the synth.
async function getInstrument(key) {
  if (!key || key === 'sine') return null;
  if (key.startsWith(PACK_PREFIX)) {
    const name = key.slice(PACK_PREFIX.length);
    if (!packLoaded.has(name)) {
      packLoaded.set(name, loadPack(`${API}/pack/${name}`, name, getAudioContext())
        .then((pack) => ({ pack }))
        .catch(() => null));           // a missing pack falls back to the synth
    }
    return packLoaded.get(name);
  }
  const spec = INSTRUMENTS.find((i) => i.key === key);
  if (!spec || spec.program === null) return null;
  return null;
}

// ⚠ the BASS lane resolves through this wrapper, never getInstrument directly: for the bass, '' (inherit the chord
// instrument) and 'sine' (explicitly the built-in synth) are DIFFERENT choices, but getInstrument returns null for
// both. The sentinel carries neither .pack nor .sf, so voicesOf yields no voices and both renderers fall through to
// synthVoice, the synth itself.
const SYNTH_PROVIDER = { synth: true };
async function getBassInstrument(key) {
  return key === 'sine' ? SYNTH_PROVIDER : key ? getInstrument(key) : null;
}

const toB64 = (u8) => {
  let s = ''; const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) s += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
  return btoa(s);
};

// Let the page paint the next busy-stage message before the synchronous render (which blocks the UI thread) begins.
const repaint = () => new Promise((r) => setTimeout(r, 0));

const send = (m) => { try { window.amsd.sink(m); } catch { /* no window to tell */ } };

// ─── live playback ───────────────────────────────────────────────────────────────────────────────
// The player pulls the seed through `liveSeed` at every chord boundary, which is what makes chords, style, instrument,
// tempo and meter all editable WHILE it plays. A plain variable, not a captured value: the scheduler runs outside any
// render cycle, so a captured value would freeze at whatever it was when Play was pressed.
let liveSeed = null;
let playHandle = null;
let playing = false;
const liveInstrument = { key: 'sine', soundfont: null };
const liveBassInstrument = { key: '', soundfont: null };

// The keyboard's live highlights and the playhead, fed by the player's taps; ONE rAF loop reads the AUDIO clock each
// frame and reports only when something changed.
let litEvents = [];
let litRaf = 0;
let litSig = '';
let playChords = [];
let playSig = '';

const clearLit = () => {
  cancelAnimationFrame(litRaf);
  litEvents = [];
  litSig = '';
  playChords = [];
  playSig = '';
  send({ k: 'lit', map: {} });
  send({ k: 'pos', chord: -1, q: 0 });
};

const runLitLoop = (ctx) => {
  const tick = () => {
    const now = ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0);
    for (let i = litEvents.length - 1; i >= 0; i--) if (litEvents[i].off <= now) litEvents.splice(i, 1);
    const map = {};
    for (const e of litEvents) if (e.on <= now) map[e.midi] = e.lane === 'bass' ? 'b' : 'a';
    const sig = Object.keys(map).sort().map((k) => k + map[k]).join('|');
    if (sig !== litSig) { litSig = sig; send({ k: 'lit', map }); }
    for (let i = playChords.length - 1; i >= 0; i--) if (playChords[i].off <= now) playChords.splice(i, 1);
    const cur = playChords.find((c) => c.on <= now && now < c.off);
    if (cur) {
      const q = Math.floor((cur.startQ + ((now - cur.on) / (cur.off - cur.on)) * cur.quarters) * 8) / 8;
      const psig = cur.idx + ':' + q;
      if (psig !== playSig) { playSig = psig; send({ k: 'pos', chord: cur.idx, q }); }
    }
    litRaf = requestAnimationFrame(tick);
  };
  litRaf = requestAnimationFrame(tick);
};

function stopPlay() {
  if (playHandle) { playHandle.stop(); playHandle = null; }
  clearLit();
  if (playing) { playing = false; send({ k: 'playing', on: false }); }
}

async function play() {
  const s = liveSeed;
  if (!s) return;
  if (playing) { stopPlay(); return; }
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    liveInstrument.key = s.trebleInstrument;
    liveInstrument.soundfont = await getInstrument(s.trebleInstrument);
    liveBassInstrument.key = s.bassInstrument;
    liveBassInstrument.soundfont = await getBassInstrument(s.bassInstrument);
    playing = true;
    send({ k: 'playing', on: true });
    runLitLoop(ctx);
    playHandle = startSeed({
      ctx,
      onNote: (midi, lane, at, durS) => {
        litEvents.push({ midi, lane, on: at, off: at + Math.min(durS, 4) });
      },
      onChord: (idx, at, durS, startQ, quarters) => {
        playChords.push({ idx, on: at, off: at + durS, startQ, quarters });
      },
      getSeed: () => {
        const c = liveSeed;
        return { progression: c.progression, bpm: Number(c.bpm), bars: Number(c.bars), sig: c.sig,
                 style: c.style, chordFigure: c.chordFigure, bassFigure: c.bassFigure, pattern: c.pattern,
                 trebleMirror: c.trebleMirror, bassMirror: c.bassMirror,
                 swing: Number(c.swing) || 0, lanes: c.lanes,
                 trebleVolume: Number(c.trebleVolume) / 100, bassVolume: Number(c.bassVolume) / 100,
                 trebleOctave: Number(c.trebleOctave) || 0, bassOctave: Number(c.bassOctave) || 0,
                 // planChords reads it, at every chord boundary: audible on the next chord.
                 transpose: Number(c.transpose) || 0,
                 // Read once, when the graph is built: see startSeed.
                 highpass: Number(c.highpass), lowpass: Number(c.lowpass),
                 // percent -> the engine's multiplier scale (50% = 1)
                 reverb: c.reverb, trebleReverb: Number(c.trebleReverb) / 50, bassReverb: Number(c.bassReverb) / 50 };
      },
      getSoundFont: () => liveInstrument.soundfont,
      getBassSoundFont: () => liveBassInstrument.soundfont,
    });
  } catch (e) {
    stopPlay();
    send({ k: 'playFailed', e: String(e && e.message ? e.message : e) });
  }
}

// Instrument changes are async, so they are prepared here rather than inside the scheduler, which must never await.
// The previous one keeps playing until the new one has landed, so switching never drops a beat.
function prepareInstruments() {
  if (!playing || !liveSeed) return;
  const key = liveSeed.trebleInstrument;
  if (key && key !== liveInstrument.key) {
    getInstrument(key)
      .then((soundfont) => { if (liveSeed && liveSeed.trebleInstrument === key) { liveInstrument.key = key; liveInstrument.soundfont = soundfont; } })
      .catch(() => { liveInstrument.key = key; liveInstrument.soundfont = null; });
  }
  const bkey = liveSeed.bassInstrument ?? '';
  if (bkey !== liveBassInstrument.key) {
    // Empty clears at once (nothing to load), so the bass falls back to the chord sound on the next chord.
    if (!bkey) { liveBassInstrument.key = ''; liveBassInstrument.soundfont = null; return; }
    getBassInstrument(bkey)
      .then((soundfont) => { if (liveSeed && (liveSeed.bassInstrument ?? '') === bkey) { liveBassInstrument.key = bkey; liveBassInstrument.soundfont = soundfont; } })
      .catch(() => { liveBassInstrument.key = bkey; liveBassInstrument.soundfont = null; });
  }
}

// ─── render ────────────────────────────────────────────────────────────────────────────────────────
async function render(s, dir, name) {
  try {
    // A sampled instrument has to be fetched + decoded before the render, which is synchronous.
    let soundfont = null, bassSoundfont = null;
    if ((s.trebleInstrument && s.trebleInstrument !== 'sine') || s.bassInstrument) {
      send({ k: 'busy', m: 'instrument' });
      await repaint();
      soundfont = await getInstrument(s.trebleInstrument);
      // Empty means the bass plays the chord instrument; 'sine' means the built-in synth (the wrapper's sentinel).
      bassSoundfont = await getBassInstrument(s.bassInstrument);
    }
    send({ k: 'busy', m: 'render' });
    await repaint();
    const { audio, audioExt, midi } = generateSeed({
      progression: s.progression, bpm: Number(s.bpm), bars: Number(s.bars), sig: s.sig,
      loops: Number(s.loops), style: s.style, chordFigure: s.chordFigure, bassFigure: s.bassFigure, pattern: s.pattern,
      trebleMirror: s.trebleMirror, bassMirror: s.bassMirror,
      swing: Number(s.swing) || 0, trebleInstrument: s.trebleInstrument, soundfont, bassSoundfont,
      trebleVolume: Number(s.trebleVolume) / 100, bassVolume: Number(s.bassVolume) / 100,
      trebleOctave: Number(s.trebleOctave) || 0, bassOctave: Number(s.bassOctave) || 0,
      transpose: Number(s.transpose) || 0,
      lanes: s.lanes, highpass: Number(s.highpass), lowpass: Number(s.lowpass),
      reverb: s.reverb, trebleReverb: Number(s.trebleReverb) / 50, bassReverb: Number(s.bassReverb) / 50,
      format: s.format, mp3Bitrate: Number(s.mp3Bitrate),
    });
    send({ k: 'busy', m: 'save' });
    await repaint();
    const r = await fetch(`${API}/save-seed`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dir, name, audioB64: toB64(audio), audioExt, midiB64: toB64(midi) }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    send({ k: 'rendered', audioPath: d.audioPath, midiPath: d.midiPath });
  } catch (e) {
    send({ k: 'renderFailed', e: String(e && e.message ? e.message : e) });
  }
}

// ─── audition + tune probe ───────────────────────────────────────────────────────────────────────
// Click-to-hear on the keyboard: the clicked note, dry, with the current TREBLE instrument.
async function audition(midi) {
  const s = liveSeed;
  if (!s) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    playOnce(ctx, await getInstrument(s.trebleInstrument), midi);
  } catch { /* an audition that fails is silence, never an error dialog */ }
}

// TUNE trim: a live calibration probe (cents) on the current TREBLE pack, audible on the next chord. Transient.
let tuneToken = 0;
async function setTune(trim) {
  const mine = ++tuneToken;
  const key = liveSeed && liveSeed.trebleInstrument;
  const prov = key ? await getInstrument(key).catch(() => null) : null;
  if (mine === tuneToken && prov && prov.pack) prov.pack.tuneCents = (prov.pack.baseTune || 0) + trim;
}

window.amsd = {
  sink: () => {},
  init(base) { API = base; },
  // The active seed, pushed by the window on every change (the live player reads it at each chord boundary).
  setSeed(s) { liveSeed = s; prepareInstruments(); },
  play,
  stop: stopPlay,
  render,
  audition,
  setTune,
};

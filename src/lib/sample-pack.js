// ─────────────────────────────────────────────────────────────────────────────
// sample-pack.js - the second instrument source, beside the SoundFont.
//
// A "pack" is a small compiled instrument: one JSON note-map plus one OGG per
// sample, produced at authoring time by scripts/build-sample-pack.mjs from a raw
// library. The bundled SoundFont covers breadth (128 General MIDI presets in
// 23 MB, no velocity layers anywhere); a pack covers DEPTH - a handful of
// instruments that actually change timbre with how hard they are struck.
//
// ⚠ CLAUDE: both sources hand back the SAME voice descriptor (see
// soundfont.noteVoices), and everything downstream - the offline renderer, the
// live player - consumes only that. Adding a third source means writing one
// function that returns descriptors, and touching nothing else. Do not let a
// provider's own shape leak past this file.
// ─────────────────────────────────────────────────────────────────────────────

// A pack's samples are already the tone the instrument should have: they were
// recorded, not synthesised from a brighter source, so nothing here filters.
import { noteVoices } from './soundfont.js';

const NO_FILTER_HZ = 20000;

// Envelope for a struck, decaying sample. The recording carries its own decay,
// so this only opens cleanly and releases when the note ends.
const STRUCK_ENV = { atkS: 0.002, holdS: 0, decS: 0, relS: 0.25, susLevel: 1 };


/**
 * Fetch a pack's manifest and decode every sample it names.
 * `baseUrl` is the directory the manifest and its .ogg files sit in.
 */
export async function loadPack(baseUrl, name, audioContext) {
  const res = await fetch(`${baseUrl}/${name}.json`);
  if (!res.ok) throw new Error(`pack "${name}" not found (HTTP ${res.status})`);
  const manifest = await res.json();

  const pcm = new Map();
  await Promise.all(manifest.zones.map(async (z) => {
    if (pcm.has(z.file)) return;
    const r = await fetch(`${baseUrl}/${z.file}`);
    if (!r.ok) throw new Error(`pack sample "${z.file}" missing (HTTP ${r.status})`);
    const buf = await audioContext.decodeAudioData(await r.arrayBuffer());
    // The renderer is mono, so a stereo sample is summed rather than half-
    // discarded. ⚠ When the engine goes stereo this is the line to revisit.
    let data = buf.getChannelData(0);
    if (buf.numberOfChannels > 1) {
      const right = buf.getChannelData(1);
      const mixed = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) mixed[i] = (data[i] + right[i]) * 0.5;
      data = mixed;
    }
    pcm.set(z.file, { data, sampleRate: buf.sampleRate });
  }));

  // Per-pack MASTER TUNING (manifest `tuneCents`, from the library info.json):
  // some sessions were recorded off A440 (Violin Pizzicato measured −10¢
  // median); this pulls the whole pack back to concert pitch. 0 when absent.
  const pack = { name, zones: manifest.zones, pcm, gain: 1,
                 // baseTune = the manifest's stamped correction; tuneCents = what plays.
                 // The live TUNE knob writes tuneCents = baseTune + trim, so a
                 // calibration by ear rides on top of the stamped value.
                 baseTune: manifest.tuneCents || 0,
                 tuneCents: manifest.tuneCents || 0, ...playableRange(manifest.zones) };
  pack.gain = matchLevel(pack);
  return pack;
}

// One note's worth of peak, used to bring the pack to the same level as
// everything else. Measured across the middle of the range at a firm velocity.
// ⚠ CLAUDE: LOUDNESS-matched, not peak-matched (changed 2026-08-31). Peak
// matching under-levels spiky material by its crest factor: a staccato horn
// peak-normalised to the synth's peak is ~20 dB quieter to the EAR than the
// synth's sustained sine (the user had to drop the sine to 10% volume to hear
// the horn at 100%). So the target is the ACTIVE RMS — loudness over the part
// of the sample that actually sounds (|x| > 10% of its own peak), which reads
// a staccato's hit and a sustain's body alike. TARGET_NOTE_RMS ≈ the built-in
// synth's sustained per-note RMS. The peak CAP stays as a safety so an
// extremely spiky sample cannot be boosted into pre-limiter harshness.
const TARGET_NOTE_RMS = 0.11;
const NOTE_PEAK_CAP = 0.45;
function matchLevel(pack) {
  let loudestRms = 0, loudestPeak = 0;
  for (const midi of [48, 60, 72]) {
    let rmsSum = 0, peakSum = 0;
    for (const v of zonesFor(pack, midi, 100)) {
      const s = pack.pcm.get(v.file);
      if (!s) continue;
      let peak = 0;
      for (const x of s.data) { const a = Math.abs(x); if (a > peak) peak = a; }
      let sq = 0, n = 0;
      const floor = peak * 0.1;
      for (const x of s.data) { const a = Math.abs(x); if (a > floor) { sq += x * x; n++; } }
      rmsSum += n ? Math.sqrt(sq / n) : 0;
      peakSum += peak;
    }
    if (rmsSum > loudestRms) { loudestRms = rmsSum; }
    if (peakSum > loudestPeak) { loudestPeak = peakSum; }
  }
  if (loudestRms < 1e-6) return 1;
  const gain = TARGET_NOTE_RMS / loudestRms;
  return loudestPeak > 1e-6 ? Math.min(gain, NOTE_PEAK_CAP / loudestPeak) : gain;
}

/**
 * The one entry point both renderers use. A "provider" is whatever getInstrument
 * resolved to — a SoundFont preset or a compiled pack — and this is the only
 * place that knows the difference.
 *
 * ⚠ CLAUDE: neither seed-engine.js nor seed-player.js may branch on the source.
 * They take voices and render them; adding a third instrument source should mean
 * one more line HERE and nothing anywhere else.
 */
export function voicesOf(provider, midi, vel) {
  if (!provider) return [];
  // The explicit built-in-synth sentinel (App's SYNTH_PROVIDER): no voices, so
  // both renderers fall through to synthVoice — which IS the synth.
  if (provider.synth) return [];
  if (provider.pack) return packVoices(provider.pack, midi, vel);
  if (provider.sf) return noteVoices(provider.sf, provider.presetIndex, midi, vel);
  return [];
}

// ─── Playable range ──────────────────────────────────────────────────────────
// ⚠ CLAUDE: a pack's ZONE MAP is not its range. The compiler gives the lowest
// zone `lokey: 0` and the highest `hikey: 127` so no note ever falls through —
// which quietly claims a ten-sample marimba can play the whole keyboard. Asked
// for B1, it stretches its lowest bar (F2) six semitones down and produces a
// 62 Hz tone no marimba on earth has. Measured against a comparable tool on the
// same arrangement: +31 dB in the 63 Hz band, all of it from notes the
// instrument does not have.
//
// The real range is where actual RECORDINGS sit, extended by half the gap to
// the next sample — the same half-interval rule the compiler already uses to
// divide the keyboard between neighbours. Outside it, fold by octaves.
function playableRange(zones) {
  const roots = zones.map((z) => z.root).sort((a, b) => a - b);
  if (roots.length < 2) return { lo: roots[0] ?? 0, hi: roots[0] ?? 127 };
  return {
    lo: roots[0] - Math.floor((roots[1] - roots[0]) / 2),
    hi: roots[roots.length - 1] + Math.floor((roots[roots.length - 1] - roots[roots.length - 2]) / 2),
  };
}

// Move a note into the instrument's range by WHOLE OCTAVES, so it keeps its
// pitch class and the harmony still works — the note a player short of that bar
// would actually reach for. Returns the original when the range is unknown or
// too narrow to fold into.
export function foldToRange(midi, lo, hi) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi - lo < 12) return midi;
  let m = midi;
  while (m < lo) m += 12;
  while (m > hi) m -= 12;
  return m;
}

const zonesFor = (pack, midi, vel) =>
  pack.zones.filter((z) => midi >= z.lokey && midi <= z.hikey && vel >= z.lovel && vel <= z.hivel);

/**
 * The playable voices for one note — the same descriptor the SoundFont returns,
 * so the renderer and the live player need no knowledge of where it came from.
 */
export function packVoices(pack, note, vel) {
  const out = [];
  // Fold FIRST: everything below — which zone answers, and how far the sample is
  // stretched — has to be decided for the note actually being played.
  const midi = foldToRange(note, pack.lo, pack.hi);
  for (const z of zonesFor(pack, midi, vel)) {
    const s = pack.pcm.get(z.file);
    if (!s || !s.data.length) continue;
    out.push({
      pcm: s.data,
      sampleRate: s.sampleRate,
      cents: (midi - z.root) * 100 + (pack.tuneCents || 0),
      loop: null,                                  // struck and decaying; nothing to loop
      env: STRUCK_ENV,
      // Velocity still scales loudness WITHIN a layer — the layer changes the
      // timbre, the gain covers the range between the two.
      gain: pack.gain * Math.pow(vel / 127, 1.1),
      filterHz: NO_FILTER_HZ,
      filterQdB: 0,
    });
  }
  return out;
}

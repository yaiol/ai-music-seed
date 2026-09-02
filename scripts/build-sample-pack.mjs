// ─────────────────────────────────────────────────────────────────────────────
// build-sample-pack.mjs - compile raw sample folders into shippable packs.
//
// WHY THIS EXISTS: a real sample library is a studio master, not a delivery
// format. VSCO 2 CE's upright piano alone is 148 MB of 24-bit stereo WAV, each
// note ringing for ten seconds; the whole library is ~2.2 GB. Shipping that is
// absurd, shipping nothing costs the only instruments with real velocity layers.
// This does the reduction once, at authoring time, mechanically.
//
// The reduction, and why each step is safe:
//   - keep ONE round-robin      : alternate takes only matter for a performance,
//                                 and a harmonic seed is not one
//   - keep ONE dynamic layer    : enough to judge an instrument's character
//   - trim the tail             : a decaying note's last seconds sit under a mix
//   - WAV -> OGG                : ~3x smaller, and browsers decode it natively
//
// Output per instrument: <name>.json (note map + display label) and one .ogg per
// sample. The runtime (src/lib/sample-pack.js) never sees the source library.
//
//   node scripts/build-sample-pack.mjs --scan <root>
//       Report every instrument found, its notes, layers and display name.
//       ALWAYS DO THIS FIRST on a new library.
//
//   node scripts/build-sample-pack.mjs --all <root> --out <dir> [--pick a,b]
//   node scripts/build-sample-pack.mjs --src <dir> --out <dir> --name <key>
//
// Options: --layer middle|soft|loud  --trim 4  --q 3  --dry-run
// Requires ffmpeg on PATH.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { measureShift, noteName } from './sample-pitch.mjs';

const args = process.argv.slice(2);
const arg = (k, dflt) => { const i = args.indexOf(`--${k}`); return i === -1 ? dflt : args[i + 1]; };
const has = (k) => args.includes(`--${k}`);

const TRIM_S = Number(arg('trim', 4));
const QUALITY = Number(arg('q', 3));
const LAYER = arg('layer', 'middle');
const DRY = has('dry-run');
// Escape hatch for the pitch verification below - to rebuild a pack exactly as an
// earlier run made it, or to skip the decode cost when only the sizes matter.
const NO_VERIFY = has('no-verify');

// ─── Display names ───────────────────────────────────────────────────────────
// Libraries name folders for the archive, not for a menu: "Solo Contrabass",
// "F Horn", "Glock". These are the names a user sees.
const INSTRUMENT_NAMES = {
  'upright nr1': 'Upright Piano',
  'upright piano': 'Upright Piano 2',      // VSCO ships two; you will drop one
  organ: 'Pipe Organ',
  'f horn': 'Horn',
  'tenor trombone': 'Trombone',
  oldtrombone: 'Old Trombone',
  'solo contrabass': 'Double Bass',
  'solo violin': 'Violin',
  'violin section': 'Violins',
  'viola section': 'Viola',
  'cello section': 'Cello',
  glock: 'Glockenspiel',
  xylo: 'Xylophone',
};

// The articulation, in words. An unknown code shows through raw rather than
// hiding the instrument — an ugly label is a visible prompt to add a line here,
// a missing instrument is silent.
const FLAVOURS = {
  sus: 'Sustained',
  susvib: 'Sustained Vibrato',
  susnv: 'Sustained Non-Vibrato',
  suslong: 'Sustained Long',
  stac: 'Staccato',
  stacc: 'Staccato',
  pizz: 'Pizzicato',
  pizzt: 'Pizzicato',
  trem: 'Tremolo',
  spic: 'Spiccato',
  'arco vib': 'Arco Vibrato',
  expvib: 'Expressive Vibrato',
  vib: 'Vibrato',
  'harmonm-sus': 'Harmon Mute',
  'straightm-sus': 'Straight Mute',
  loud: 'Loud',
  quiet: 'Quiet',
};

const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  .replace(/\b\w/g, (c) => c.toUpperCase());

// A folder path under the library root becomes "Instrument (Flavour)".
// The LAST segment is the articulation when there is more than one segment.
function displayName(root, dir) {
  const parts = path.relative(root, dir).split(/[\\/]+/).filter(Boolean);
  // Drop the family folder (Brass / Strings / …) — it names a section, not an
  // instrument, and carries nothing a user needs.
  const meaningful = parts.length > 1 ? parts.slice(1) : parts;
  const instRaw = meaningful[0] || parts[parts.length - 1] || 'Instrument';
  const flavRaw = meaningful.length > 1 ? meaningful[meaningful.length - 1] : null;

  const name = INSTRUMENT_NAMES[instRaw.toLowerCase()] || titleCase(instRaw);
  if (!flavRaw) return { name, flavour: null, label: name };
  const flavour = FLAVOURS[flavRaw.toLowerCase()] || flavRaw;    // unknown → raw
  return { name, flavour, label: `${name} (${flavour})` };
}

// ─── Filename parsing ────────────────────────────────────────────────────────
// ⚠ CLAUDE: do NOT add a regex per library. Naming differs per instrument even
// inside one library — observed in VSCO 2 CE alone:
//   UR1_C4_mf_RR1        KSHarp_A2_mf         LLVln_ArcoVib_A3_f
//   Sum_SHTrumpet_sus_A#3_v1_rr1              LDFlute_susvib_A3_v1_1
// The stable anchor is the NOTE TOKEN, so tokens are classified rather than
// matched positionally.

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NOTE_RE = /^([A-Ga-g])([#b]?)(-?\d)$/;
const DYN_WORDS = ['ppp', 'pp', 'p', 'mp', 'mf', 'ff', 'fff', 'f'];
const RR_RE = /^rr(\d+)$/i;
const VEL_RE = /^(?:v|dyn|vl)(\d+)$/i;

function parseName(file, indexMap) {
  const stem = file.replace(/\.wav$/i, '');
  const tokens = stem.split(/[_\-\s]+/).filter(Boolean);

  let midi = null, dyn = null, rr = 1;
  for (const t of tokens) {
    const n = t.match(NOTE_RE);
    if (n && midi === null) {
      const base = PC[n[1].toUpperCase()] + (n[2] === '#' ? 1 : n[2] === 'b' ? -1 : 0);
      midi = base + (Number(n[3]) + 1) * 12;              // C4 = 60
      continue;
    }
    const r = t.match(RR_RE);
    if (r) { rr = Number(r[1]); continue; }
    const v = t.match(VEL_RE);
    if (v && dyn === null) { dyn = t.toLowerCase(); continue; }
    const w = DYN_WORDS.find((d) => t.toLowerCase() === d);
    if (w && dyn === null) dyn = w;
  }

  // No note in the name: fall back to the folder's index mapping, where the
  // trailing number is a position rather than a pitch.
  if (midi === null && indexMap) {
    // ⚠ Strip the round-robin / velocity suffix FIRST. "Man3Quiet_122_rr1" ends
    // in "1", so a naive trailing-number match reads every file in the folder as
    // index 1 and maps the whole instrument to a single note.
    const core = stem.replace(/[_-](?:rr|v|vl|dyn)\d+$/i, '');
    const m = core.match(/(\d+)$/);
    if (m) {
      const mapped = indexMap(file, Number(m[1]));
      if (mapped != null) midi = mapped;
    }
  }
  if (midi === null) return null;
  return { midi, dyn: dyn || 'single', rr };
}

// ─── Index-named folders ─────────────────────────────────────────────────────
// Some folders number their files by position. Two ways to resolve that, in
// order of trust:
//   1. a MappingChart.txt shipped alongside — read it, do not infer a formula
//      from it (VSCO's piano chart breaks its own pattern on the last entry)
//   2. a rule established by measuring pitch across the series
//      (see local/detect-pitch.mjs)
// ⚠ Each rank gets its OWN rule — the two organ ranks number their files from
// different bases (Loud starts at 1, Quiet at 122) even though both are C-rooted
// and three semitones apart. One rule for the folder would silently transpose an
// entire instrument.
// ⚠ Rules match the FILENAME, not the folder. One folder can hold several
// independently-numbered series — VSCO's organ has four across two folders, with
// three different bases. A folder-level rule silently transposes whole ranks,
// or drives them off the keyboard into negative note numbers.
//
// Every entry here was MEASURED with local/detect-pitch.mjs by fitting a line
// through the confident detections, never by reading one file or guessing.
const INDEX_RULES = [
  { match: /Rode_Man3Open|Rode_Pedal/i, map: (i) => 23 + i },   // organ, Loud
  { match: /NT5_Man3Quiet/i, map: (i) => i - 86 },              // organ, Quiet manual
  { match: /NT5_PedalQuiet/i, map: (i) => i - 28 },             // organ, Quiet pedal
];

// Returns (file, index) → midi, or null when the folder has no mapping at all.
function indexResolver(dir) {
  // A shipped chart wins: read it, never infer a formula from it. VSCO's piano
  // chart breaks its own pattern on the final entry (044=108, not 109).
  for (let d = dir, up = 0; up < 3; up++, d = path.dirname(d)) {
    const chart = path.join(d, 'MappingChart.txt');
    if (fs.existsSync(chart)) {
      const table = new Map();
      for (const line of fs.readFileSync(chart, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*(\d+)\s*=\s*(\d+)\s*$/);
        if (m) table.set(Number(m[1]), Number(m[2]));
      }
      if (table.size) return (_file, i) => table.get(i) ?? null;
    }
  }
  return (file, i) => {
    const rule = INDEX_RULES.find((r) => r.match.test(file));
    return rule ? rule.map(i) : null;
  };
}

// ─── Discovery ───────────────────────────────────────────────────────────────
function findInstruments(root) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    const wavs = entries.filter((e) => e.isFile() && /\.wav$/i.test(e.name)).map((e) => e.name);
    if (wavs.length) out.push({ dir, wavs });
    for (const e of entries) if (e.isDirectory()) walk(path.join(dir, e.name));
  };
  walk(root);
  return out;
}

const slug = (root, dir) => path.relative(root, dir).replace(/[\\/]+/g, '-')
  .replace(/[^A-Za-z0-9-]+/g, '').replace(/-+/g, '-').toLowerCase() || 'instrument';

// ─── Layer choice ────────────────────────────────────────────────────────────
const DYN_ORDER = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff',
                   'v1', 'v2', 'v3', 'v4', 'dyn1', 'dyn2', 'dyn3', 'quiet', 'loud', 'single'];
const dynRank = (d) => { const i = DYN_ORDER.indexOf(d); return i === -1 ? 99 : i; };

// One layer, chosen by position rather than by name — most of the library does
// not use pp/mf/f, so a literal lookup would skip instruments for spelling their
// dynamics differently.
function pickLayer(present) {
  const ordered = present.slice().sort((a, b) => dynRank(a) - dynRank(b));
  if (ordered.length === 1) return ordered[0];
  if (LAYER === 'soft') return ordered[0];
  if (LAYER === 'loud') return ordered[ordered.length - 1];
  return ordered[Math.floor((ordered.length - 1) / 2)];
}

// ─── Compile one ─────────────────────────────────────────────────────────────
function compile(src, outDir, name, label) {
  const indexMap = indexResolver(src);
  const wavs = fs.readdirSync(src).filter((f) => /\.wav$/i.test(f));
  const parsed = wavs.map((f) => ({ file: f, ...(parseName(f, indexMap) || {}) }))
    .filter((x) => x.midi !== undefined && x.midi !== null);
  if (!parsed.length) return { name, skipped: 'no note in filenames and no index mapping' };

  const present = [...new Set(parsed.map((p) => p.dyn))];
  const layer = pickLayer(present);
  const minRR = Math.min(...parsed.map((p) => p.rr));
  let chosen = parsed.filter((p) => p.dyn === layer && p.rr === minRR);

  // One sample per note: a folder can hold several ranks at the same pitch
  // (an organ's manual and pedal), and mixing them would double every note.
  const seen = new Set();
  chosen = chosen.filter((p) => (seen.has(p.midi) ? false : seen.add(p.midi)));
  if (!chosen.length) return { name, skipped: 'no samples after filtering' };

  // ⚠ CLAUDE: THE FILENAME IS A CLAIM, NOT A FACT — verify it against the
  // recording before writing a root note. VSCO 2 CE mixes octave conventions
  // between contributors: `KSHarp_A2_mf.wav` really is A2, but
  // `Marimba_hit_Outrigger_C4_loud_01.wav` sounds C5, named where middle C is
  // "C3". Taking the name at face value shipped 43 of 64 packs an octave high —
  // each one perfectly in tune with itself, so nothing downstream could tell.
  //
  // The check is deliberately hard to trigger (whole octaves only, 60% of at
  // least 3 samples agreeing): the detector is fallible on a weak fundamental,
  // and silently retuning a library that was right is worse than the bug.
  let shift = null;
  if (!NO_VERIFY) {
    shift = measureShift(chosen.map((p) => ({ file: path.join(src, p.file), midi: p.midi })));
    if (shift.shift) for (const p of chosen) p.midi += shift.shift;
    // A library can be wrong about one file rather than all of them — see
    // measureShift. Each correction is reported below, never applied silently.
    for (const s of shift.strays) {
      const p = chosen.find((c) => path.join(src, c.file) === s.file);
      if (p) p.midi = s.to;
    }
    // Re-dedupe: moving a stray can land it on a note another sample already
    // owns, and two zones with the same root would double that note.
    const kept = new Set();
    chosen = chosen.filter((p) => (kept.has(p.midi) ? false : kept.add(p.midi)));
  }

  const centres = chosen.map((p) => p.midi).sort((a, b) => a - b);
  const keyRange = (midi) => {
    const i = centres.indexOf(midi);
    return [i === 0 ? 0 : Math.floor((centres[i - 1] + midi) / 2) + 1,
            i === centres.length - 1 ? 127 : Math.floor((midi + centres[i + 1]) / 2)];
  };

  if (DRY) return { name, label, samples: chosen.length, notes: centres.length, layer, present, dry: true };

  fs.mkdirSync(outDir, { recursive: true });
  const zones = [];
  let srcBytes = 0, outBytes = 0;

  for (const p of chosen) {
    const outName = `${p.midi}.ogg`;
    srcBytes += fs.statSync(path.join(src, p.file)).size;
    execFileSync('ffmpeg', [
      '-v', 'error', '-y', '-i', path.join(src, p.file),
      '-t', String(TRIM_S),
      '-af', `afade=t=out:st=${Math.max(0, TRIM_S - 0.35)}:d=0.35`,   // no click at the cut
      '-c:a', 'libvorbis', '-q:a', String(QUALITY),
      path.join(outDir, outName),
    ]);
    outBytes += fs.statSync(path.join(outDir, outName)).size;
    const [lokey, hikey] = keyRange(p.midi);
    zones.push({ file: outName, root: p.midi, lokey, hikey, lovel: 0, hivel: 127 });
  }

  zones.sort((a, b) => a.root - b.root);

  // ⚠ CLAUDE: samples are named after the note they are mapped to, so a rebuild
  // that changes the mapping writes a NEW set and leaves the old one orphaned
  // beside it. The manifest stops referencing them, so nothing breaks and
  // nothing complains — they just ship, doubling the pack. Retuning the marimba
  // left all ten originals in place. Delete what this run did not write.
  const written = new Set(zones.map((z) => z.file));
  for (const f of fs.readdirSync(outDir)) {
    if (/\.ogg$/i.test(f) && !written.has(f)) fs.unlinkSync(path.join(outDir, f));
  }

  fs.writeFileSync(path.join(outDir, `${name}.json`),
    JSON.stringify({ name, label, format: 1, layer, zones }, null, 2));
  return { name, label, samples: zones.length, notes: centres.length, layer, present, srcBytes, outBytes, shift };
}

// ─── Entry ───────────────────────────────────────────────────────────────────
const mb = (b) => (b / 1048576).toFixed(1);

// A retune is the loudest thing this build can do to an instrument, so it is
// never silent: the line says which way it moved and on what evidence.
const shiftNote = (s) => {
  if (!s) return '';
  const parts = [];
  if (s.shift) {
    parts.push(`⚠ RETUNED ${s.shift > 0 ? 'down' : 'up'} ${Math.abs(s.shift) / 12} octave —` +
      ` filenames said ${noteName(60)} where ${s.agree}/${s.measured} samples measure ${noteName(60 + s.shift)}`);
  }
  for (const t of s.strays || []) {
    parts.push(`⚠ ${path.basename(t.file)} moved ${noteName(t.from)} → ${noteName(t.to)} (measured, conf ${t.conf.toFixed(2)})`);
  }
  return parts.length ? '\n      ' + parts.join('\n      ') : '';
};

if (has('scan')) {
  const root = arg('scan');
  const found = findInstruments(root);
  if (!found.length) { console.error(`No .wav files under ${root}`); process.exit(2); }
  console.log(`${found.length} instrument folder(s) under ${root}\n`);
  let usable = 0;
  for (const { dir, wavs } of found) {
    const { label } = displayName(root, dir);
    const indexMap = indexResolver(dir);
    const ok = wavs.map((f) => parseName(f, indexMap)).filter(Boolean);
    const notes = [...new Set(ok.map((p) => p.midi))].sort((a, b) => a - b);
    const dyns = [...new Set(ok.map((p) => p.dyn))];
    const bytes = wavs.reduce((a, w) => a + fs.statSync(path.join(dir, w)).size, 0);
    if (ok.length) usable++;
    console.log(`${ok.length ? ' ' : '!'} ${label}`);
    console.log(`    ${slug(root, dir)}`);
    console.log(`    ${wavs.length} wav, ${mb(bytes)} MB` + (ok.length
      ? `  |  ${notes.length} notes ${notes[0]}..${notes[notes.length - 1]}  |  layers [${dyns.join(', ')}] → ${pickLayer(dyns)}`
      : '  |  UNMAPPABLE — no note in filename, no chart, no rule'));
  }
  console.log(`\n${usable} of ${found.length} usable.`);
} else if (has('all')) {
  const root = arg('all');
  const out = arg('out');
  if (!out) { console.error('--all needs --out <dir>'); process.exit(1); }
  const pick = (arg('pick') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

  let totalSrc = 0, totalOut = 0, made = 0;
  const index = [];
  for (const { dir } of findInstruments(root)) {
    const name = slug(root, dir);
    if (pick.length && !pick.some((p) => name.includes(p))) continue;
    const { label } = displayName(root, dir);
    const r = compile(dir, path.join(out, name), name, label);
    if (r.skipped) { console.log(`skip  ${label.padEnd(34)} ${r.skipped}`); continue; }
    made++;
    if (r.dry) { console.log(`dry   ${label.padEnd(34)} ${r.samples} samples, layer ${r.layer} of [${r.present.join(', ')}]`); continue; }
    totalSrc += r.srcBytes; totalOut += r.outBytes;
    index.push({ name, label });
    console.log(`ok    ${label.padEnd(34)} ${String(r.samples).padStart(3)} notes  ${mb(r.srcBytes).padStart(6)} MB → ${mb(r.outBytes)} MB${shiftNote(r.shift)}`);
  }
  if (!DRY && index.length) {
    index.sort((a, b) => a.label.localeCompare(b.label));
    fs.writeFileSync(path.join(out, 'packs.json'), JSON.stringify({ format: 1, packs: index }, null, 2));
    console.log(`\n${made} pack(s) + packs.json: ${mb(totalSrc)} MB → ${mb(totalOut)} MB (${(totalSrc / totalOut).toFixed(1)}x smaller)`);
  }
} else if (has('src')) {
  const src = arg('src');
  const r = compile(src, arg('out'), arg('name'), arg('label') || titleCase(arg('name') || 'Instrument'));
  if (r.skipped) { console.error(r.skipped); process.exit(2); }
  console.log(r.dry ? `${r.samples} samples, layer ${r.layer}`
    : `wrote ${r.samples} notes + ${r.name}.json\nsize  ${mb(r.srcBytes)} MB → ${mb(r.outBytes)} MB${shiftNote(r.shift)}`);

  // ⚠ CLAUDE: the app reads packs.json, NOT the folder listing — so a pack built
  // on its own is invisible until it is in the index. Only --all used to write
  // that file, which meant "build one instrument" produced a pack nothing could
  // load, with no error anywhere. Update the index in place instead, so a single
  // build is complete on its own.
  if (!r.dry) {
    const indexPath = path.join(path.dirname(path.resolve(arg('out'))), 'packs.json');
    if (fs.existsSync(indexPath)) {
      const idx = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const packs = (idx.packs || []).filter((p) => p.name !== r.name);
      packs.push({ name: r.name, label: r.label });
      packs.sort((a, b) => a.label.localeCompare(b.label));
      fs.writeFileSync(indexPath, JSON.stringify({ ...idx, packs }, null, 2));
      console.log(`index ${path.basename(indexPath)} now lists ${packs.length} pack(s)`);
    }
  }
} else {
  console.error('Usage: --scan <root> | --all <root> --out <dir> | --src <dir> --out <dir> --name <key>');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// library-import.mjs - build the instrument LIBRARY from raw source drops.
//
// THE MODEL (decided 2026-08-30): correction is separated from compilation.
//   ext/       the sources, untouched, every naming disease intact
//   library/   every sound, ONE canonical naming scheme, corrected, auditable
//   compile    parses library names and trusts them — no special cases
//
// This is the CORRECTION step. It runs rarely — once per source import — and
// everything difficult lives here so the compiler never has to remember it:
// note-name conventions, octave lies, index-named files, per-file strays.
//
// Library layout (one info.json beside every set of wavs = one compiled pack):
//   library/<Family>/<Instrument>/<Articulation>/<NOTE>_<dyn>_<rrN>.wav
//   library/<Family>/<Instrument>/<Articulation>/info.json
// Single-articulation instruments collapse the articulation level.
// Folder names are DISPLAY LABELS (rename freely); info.json carries the
// FROZEN id (what .yams files store — never changes after first import).
//
// CAUTION RULES (each one earned during the 2026-08-29 octave hunt):
//  - Every VSCO articulation is COUNT-CHECKED against the matching Freesound
//    zip. A mismatch means the two publications may hold different recordings
//    (how the better marimba was found) → POSTPONED, never merged silently.
//  - Note names are verified by MEASUREMENT (sample-pitch.mjs). A pack only
//    imports when the measurements agree on a uniform whole-octave shift (or
//    none); an undecidable pack is POSTPONED, not guessed.
//  - Index-named folders import only via a chart the SOURCE shipped
//    (MappingChart.txt). Our own inferred index rules (the organ) are NOT
//    trusted here → postponed until ranks are given a proper home.
//
//   node scripts/library-import.mjs --ext <vsco-github-root> \
//        --freesound <freesound-root> --lib <library-root> [--dry-run]
//
// Requires ffmpeg + unzip on PATH.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { detectPitch, pcmOf, noteName } from './sample-pitch.mjs';

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(`--${k}`); return i === -1 ? null : args[i + 1]; };
const DRY = args.includes('--dry-run');

const EXT = arg('ext');
const FREESOUND = arg('freesound');
const LIB = arg('lib');
if (!EXT || !LIB) { console.error('need --ext <vsco-root> --lib <library-root> [--freesound <root>]'); process.exit(1); }

// ─── The mapping tables (they live HERE now, on their way out of the compiler) ─
// GitHub folder → { family, instrument label, articulation label }.
// Only families the app imports (decided 2026-08-30): no Untuned, no Misc.
const FLAVOURS = {
  sus: 'Sustained', susvib: 'Sustained Vibrato', susnv: 'Sustained Non-Vibrato',
  suslong: 'Sustained Long', stac: 'Staccato', stacc: 'Staccato',
  pizz: 'Pizzicato', pizzt: 'Pizzicato', trem: 'Tremolo', spic: 'Spiccato',
  'arco vib': 'Arco Vibrato', expvib: 'Expressive Vibrato', vib: 'Vibrato',
  'harmonm-sus': 'Harmon Mute', 'straightm-sus': 'Straight Mute',
  buzz: 'Buzz', fall: 'Fall', short: 'Short', sustain: 'Sustained', vibrato: 'Vibrato',
};
const INSTRUMENT_NAMES = {
  'upright nr1': 'Upright Piano', 'upright piano': 'Upright Piano 2',
  'f horn': 'Horn', 'tenor trombone': 'Trombone', oldtrombone: 'Old Trombone',
  'solo contrabass': 'Double Bass', 'solo violin': 'Violin',
  'violin section': 'Violins', 'viola section': 'Violas', 'cello section': 'Cellos',
  glock: 'Glockenspiel', xylo: 'Xylophone',
};
const FAMILY_OF = {
  Keys: 'Keys', Strings: 'Strings (Bowed)', Brass: 'Winds (Brass)',
  Woodwinds: 'Winds (Wood)', Percussion: 'Percussion (Tuned)',
};
// Freesound instrument-slug spellings that differ from the GitHub folder names.
const FS_INST = {
  xylo: 'xylophone', glock: 'glockenspiel', 'f horn': 'f-horn',
  'tenor trombone': 'tenor-trombone', 'solo contrabass': 'solo-contrabass',
  'solo violin': 'solo-violin', 'violin section': 'violin-section',
  'viola section': 'viola-section', 'cello section': 'cello-section',
  'upright nr1': 'upright-nr1', 'upright piano': 'upright-piano',
};
// Freesound articulation words, to find the matching zip for the count check.
const FS_ARTIC = {
  stac: 'staccato', stacc: 'staccato', sus: 'sustain', susvib: 'vibrato-sustain',
  susnv: 'non-vibrato-sustain', suslong: 'long-sustain', trem: 'tremolo',
  spic: 'spiccato', pizz: 'pizzicato', pizzt: 'tight-pizzicato', vib: 'vibrato',
  buzz: 'buzz', fall: 'fall', short: 'short', sustain: 'sustain', vibrato: 'vibrato',
  expvib: 'expressive-sustain', 'harmonm-sus': 'harmon-mute-sustain',
  'straightm-sus': 'straight-mute-sustain', 'mute-sus': 'muted-sustain',
  'arco vib': 'arco-vib',
};

const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  .replace(/\b\w/g, (c) => c.toUpperCase());
const slugOf = (rel) => rel.replace(/[\\/]+/g, '-').replace(/[^A-Za-z0-9-]+/g, '').replace(/-+/g, '-').toLowerCase();

// ─── Filename parsing (note / dynamic / round-robin tokens) ──────────────────
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NOTE_RE = /^([A-Ga-g])([#b]?)(-?\d)$/;
const DYN_WORDS = ['ppp', 'pp', 'p', 'mp', 'mf', 'ff', 'fff', 'f', 'loud', 'quiet'];

function parseName(file) {
  const stem = file.replace(/\.wav$/i, '');
  const tokens = stem.split(/[_\-\s]+/).filter(Boolean);
  let midi = null, dyn = null, rr = null;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const n = t.match(NOTE_RE);
    if (n && midi === null) {
      const base = PC[n[1].toUpperCase()] + (n[2] === '#' ? 1 : n[2] === 'b' ? -1 : 0);
      midi = base + (Number(n[3]) + 1) * 12;
      continue;
    }
    const r = t.match(/^rr(\d+)$/i);
    if (r && rr === null) { rr = Number(r[1]); continue; }
    const v = t.match(/^(?:v|dyn|vl)(\d+)$/i);
    if (v && dyn === null) { dyn = t.toLowerCase(); continue; }
    const w = DYN_WORDS.find((d) => t.toLowerCase() === d);
    if (w && dyn === null) { dyn = w; continue; }
    // ⚠ A trailing bare number after the note is a ROUND-ROBIN, VSCO's tersest
    // spelling: tenortbn_vib_G#2_v1_1 / _v1_2 are two takes. Unparsed, both
    // takes map to the same library name and the import dies on a collision.
    // Only after the note is known — an index-named file (organ "122.wav") must
    // stay unparsed so the chart path handles it.
    if (midi !== null && rr === null && i === tokens.length - 1) {
      const tail = t.match(/^(?:[a-z]+)?(\d+)$/i);
      if (tail && !NOTE_RE.test(t)) rr = Number(tail[1]);
    }
  }
  return { midi, dyn: dyn || '', rr: rr || 1 };
}

// A MappingChart.txt the SOURCE shipped is trusted; our own inferred rules are not.
function chartFor(dir) {
  for (let d = dir, up = 0; up < 3; up++, d = path.dirname(d)) {
    const chart = path.join(d, 'MappingChart.txt');
    if (fs.existsSync(chart)) {
      const table = new Map();
      for (const line of fs.readFileSync(chart, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*(\d+)\s*=\s*(\d+)\s*$/);
        if (m) table.set(Number(m[1]), Number(m[2]));
      }
      if (table.size) return table;
    }
  }
  return null;
}

// ─── Measurement: UNIFORM shift only ─────────────────────────────────────────
// ⚠ CLAUDE: no per-file "stray" corrections here, deliberately. The stray rule
// was tried first and it misfires exactly where the detector does — at range
// tops, where autocorrelation halves and reports the claimed note back, which
// the rule then "corrects" onto its neighbour's name (oboe D5 → D5 collision).
// The correction with a 43-pack track record is the uniform octave shift; a
// file whose measurement disagrees with it is far more likely a noisy reading
// than a mis-named file, so it keeps its claimed (shifted) name and the
// disagreement is RECORDED in info.json for a human ear, never acted on.
function measurePack(files) {
  const rows = [];
  for (const f of files) {
    let d = null;
    try { d = detectPitch(pcmOf(f.path)); } catch { /* unmeasurable */ }
    rows.push({ name: f.name, midi: f.midi, det: d, off: d ? d.midi - f.midi : null });
  }
  const offs = rows.filter((r) => r.off !== null).map((r) => r.off);
  if (offs.length < 3) return { ok: false, why: `only ${offs.length} sample(s) measurable`, rows };

  const sorted = [...offs].sort((a, b) => a - b);
  const median = sorted[sorted.length >> 1];
  const agree = offs.filter((o) => o === median).length;
  if (agree < Math.ceil(offs.length * 0.6)) return { ok: false, why: `no agreement (offsets ${[...new Set(offs)].join(',')})`, rows };
  if (median !== 0 && median % 12 !== 0) return { ok: false, why: `median offset ${median} is not a whole octave`, rows };

  const suspects = rows.filter((r) => r.det && r.off !== median)
    .map((r) => `${r.name}: claims ${noteName(r.midi + median)} after shift, measures ${noteName(r.det.midi)} (conf ${r.det.conf.toFixed(2)})`);
  return { ok: true, shift: median, agree, measured: offs.length, suspects };
}

// ─── Freesound zip lookup for the count cross-check ──────────────────────────
let fsZips = [];
if (FREESOUND) {
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/__sgossner__vsco-2-ce-.*\.zip$/i.test(e.name) && !/\(1\)/.test(e.name)) {
        fsZips.push({ path: p, slug: e.name.replace(/^\d+__sgossner__vsco-2-ce-/, '').replace(/\.zip$/i, '') });
      }
    }
  };
  walk(FREESOUND);
}
const zipWavCount = (zipPath) => {
  const out = execFileSync('unzip', ['-l', zipPath], { encoding: 'utf8', maxBuffer: 1 << 24 });
  return (out.match(/\.wav/gi) || []).length;
};

// ─── Discover GitHub articulation folders ────────────────────────────────────
const jobs = [];
for (const famDir of fs.readdirSync(EXT, { withFileTypes: true })) {
  if (!famDir.isDirectory() || !(famDir.name in FAMILY_OF)) continue;
  const famPath = path.join(EXT, famDir.name);
  for (const inst of fs.readdirSync(famPath, { withFileTypes: true })) {
    if (!inst.isDirectory() || inst.name === 'temp') continue;
    // The harp lives in the source's Strings folder but is PLUCKED — the one
    // per-instrument family exception (decided with the guitars, 2026-08-30).
    const family = inst.name.toLowerCase() === 'harp' ? 'Strings (Plucked)' : FAMILY_OF[famDir.name];
    const instPath = path.join(famPath, inst.name);
    const subdirs = fs.readdirSync(instPath, { withFileTypes: true }).filter((e) => e.isDirectory());
    const wavsHere = fs.readdirSync(instPath).filter((f) => /\.wav$/i.test(f));
    const instLabel = INSTRUMENT_NAMES[inst.name.toLowerCase()] || titleCase(inst.name);
    if (subdirs.length) {
      for (const a of subdirs) {
        jobs.push({ family, instLabel, articLabel: FLAVOURS[a.name.toLowerCase()] || titleCase(a.name),
                    articKey: a.name.toLowerCase(), instKey: inst.name.toLowerCase(),
                    dir: path.join(instPath, a.name), single: false });
      }
    }
    if (wavsHere.length) {
      jobs.push({ family, instLabel, articLabel: null, articKey: null, instKey: inst.name.toLowerCase(),
                  dir: instPath, single: true });
    }
  }
}

// ─── Import each job ─────────────────────────────────────────────────────────
const report = { imported: [], postponed: [], countMismatch: [] };
const relOf = (p) => path.relative(path.resolve(EXT, '..', '..'), p).replace(/\\/g, '/');

for (const job of jobs) {
  const label = `${job.instLabel}${job.articLabel ? ` (${job.articLabel})` : ''}`;
  const wavs = fs.readdirSync(job.dir).filter((f) => /\.wav$/i.test(f));
  const id = slugOf(path.relative(EXT, job.dir));
  const postpone = (why) => { report.postponed.push({ label, id, why }); console.log(`POSTPONE  ${label.padEnd(34)} ${why}`); };

  // The exists-guard comes FIRST: an already-imported pack (possibly imported
  // from a different source, with corrections applied since) must not even be
  // re-measured, let alone re-postponed in the log.
  const guardDir = path.join(LIB, job.family, job.instLabel, ...(job.single ? [] : [job.articLabel]));
  if (fs.existsSync(path.join(guardDir, 'info.json'))) {
    console.log(`kept      ${label.padEnd(34)} already in the library (delete its folder to re-import)`);
    continue;
  }

  // 1. Count cross-check against the matching Freesound zip — EXACT slug only.
  // ("sustain" suffix-matches "vibrato-sustain"; equality is the only safe test.)
  if (FREESOUND) {
    const famSlug = path.basename(path.dirname(job.single ? job.dir : path.dirname(job.dir))).toLowerCase();
    const instSlug = (FS_INST[job.instKey] || job.instKey).replace(/\s+/g, '-');
    const articWord = job.articKey ? (FS_ARTIC[job.articKey] || job.articKey) : null;
    const wanted = articWord ? `${famSlug}-${instSlug}-${articWord}` : `${famSlug}-${instSlug}`;
    const candidates = fsZips.filter((z) => z.slug === wanted);
    if (candidates.length === 1) {
      const zc = zipWavCount(candidates[0].path);
      if (zc !== wavs.length) {
        report.countMismatch.push({ label, github: wavs.length, freesound: zc, zip: path.basename(candidates[0].path) });
        postpone(`count mismatch — GitHub ${wavs.length} vs Freesound ${zc} (possible different recording)`);
        continue;
      }
    } else if (candidates.length === 0) {
      console.log(`  note    ${label.padEnd(34)} no Freesound twin (wanted "${wanted}") — importing on measurement alone`);
    }
  }

  // 2. Resolve each file's claimed note: filename token, or a source-shipped chart.
  const chart = chartFor(job.dir);
  const files = [];
  let unparseable = 0;
  for (const w of wavs) {
    const p = parseName(w);
    if (p.midi === null && chart) {
      const m = w.replace(/\.wav$/i, '').match(/(\d+)$/);
      const mapped = m ? chart.get(Number(m[1])) : null;
      if (mapped != null) p.midi = mapped;
    }
    if (p.midi === null) { unparseable++; continue; }
    files.push({ path: path.join(job.dir, w), name: w, ...p });
  }
  if (!files.length || unparseable > files.length) { postpone(`filenames carry no notes (${unparseable} unparseable) and no source chart`); continue; }
  if (unparseable) { postpone(`${unparseable} of ${wavs.length} files unparseable — mixed naming`); continue; }

  // 3. Measure. Undecidable → postponed, never guessed.
  const m = measurePack(files);
  if (!m.ok) { postpone(`measurement undecidable: ${m.why}`); continue; }

  // 4. Write into the library with corrected, sounding-pitch names — the
  //    uniform shift applied to every file, nothing per-file.
  const outDir = path.join(LIB, job.family, job.instLabel, ...(job.single ? [] : [job.articLabel]));

  // ⚠ NEVER overwrite an existing pack. The library accumulates corrections
  // AFTER import (the 192 title renames of 2026-08-30 live only there) — a
  // re-import would lay uncorrected names next to the corrected ones and
  // double the pack. Re-importing a pack is deliberate: delete its folder.
  if (fs.existsSync(path.join(outDir, 'info.json'))) {
    console.log(`kept      ${label.padEnd(34)} already in the library (delete its folder to re-import)`);
    continue;
  }
  const names = new Map();
  let collision = null;
  for (const f of files) {
    const out = `${noteName(f.midi + m.shift)}${f.dyn ? '_' + f.dyn : ''}_rr${f.rr}.wav`;
    if (names.has(out)) { collision = `${names.get(out)} and ${f.name} both map to ${out}`; break; }
    names.set(out, f.name);
    f.outName = out;
  }
  if (collision) { postpone(`name collision after correction: ${collision}`); continue; }

  if (!DRY) {
    fs.mkdirSync(outDir, { recursive: true });
    for (const f of files) fs.copyFileSync(f.path, path.join(outDir, f.outName));
    fs.writeFileSync(path.join(outDir, 'info.json'), JSON.stringify({
      id,
      author: 'Sam Gossner / Versilian Studios',
      license: 'CC0',
      url: 'https://vis.versilstudios.com/vsco-community.html',
      source: relOf(job.dir),
      imported: new Date().toISOString().slice(0, 10),
      correction: { octaveShift: m.shift / 12, agree: `${m.agree}/${m.measured}` },
      // Files whose individual measurement disagrees with the pack's uniform
      // shift. Detector noise far more often than a mis-named file — kept under
      // their claimed names, listed here for a human ear.
      suspectMeasurements: m.suspects,
    }, null, 2));
  }
  report.imported.push({ label, id, files: files.length, shift: m.shift, suspects: m.suspects.length });
  console.log(`ok        ${label.padEnd(34)} ${String(files.length).padStart(3)} files` +
    (m.shift ? `  (names corrected ${m.shift > 0 ? '+' : ''}${m.shift / 12} octave)` : '') +
    (m.suspects.length ? `  ${m.suspects.length} suspect measurement(s) logged` : ''));
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${report.imported.length} imported, ${report.postponed.length} postponed, ${report.countMismatch.length} count mismatch(es)`);
if (report.countMismatch.length) {
  console.log('\nCOUNT MISMATCHES (possible different recordings — the marimba case):');
  for (const c of report.countMismatch) console.log(`  ${c.label}: GitHub ${c.github} vs ${c.zip} ${c.freesound}`);
}
if (report.postponed.length) {
  console.log('\nPOSTPONED:');
  for (const p of report.postponed) console.log(`  ${p.label.padEnd(36)} ${p.why}`);
}

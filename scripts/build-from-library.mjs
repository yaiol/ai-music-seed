// ─────────────────────────────────────────────────────────────────────────────
// build-from-library.mjs - compile app packs FROM THE LIBRARY.
//
// The other half of the 2026-08-30 split (see library-import.mjs): the library
// holds corrected, canonically-named samples, so this compiler TRUSTS what it
// reads and knows nothing else. No note-name conventions, no octave
// measurement, no index charts, no display-name dictionaries — all of that
// happened once, at import, and its results are sitting in the folder names.
//
// What a pack is, in library terms: any folder holding an info.json + wavs.
//   library/<Family>/<Instrument>/<Articulation>/<NOTE>[_dyn]_rrN.wav
// - id     ← info.json (frozen — what .yams files reference)
// - label  ← the folder names: "Instrument (Articulation)", or just
//            "Instrument" when the articulation level is collapsed.
//            Rename a folder, recompile, and the app shows the new name.
// - family ← the top-level folder (carried into packs.json for the picker).
//
// Reduction at compile (same policy as before): ONE dynamic layer (middle of
// what exists), lowest round-robin, 4 s trim with a fade, OGG q3.
//
//   node scripts/build-from-library.mjs --lib <library-root> --out <packs-dir>
//        [--pick a,b] [--dry-run] [--force  re-encode even when outputs look fresh]
//
// Requires ffmpeg on PATH.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(`--${k}`); return i === -1 ? null : args[i + 1]; };
const DRY = args.includes('--dry-run');
const LIB = arg('lib');
const OUT = arg('out');
const PICK = (arg('pick') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
if (!LIB || !OUT) { console.error('need --lib <library-root> --out <packs-dir>'); process.exit(1); }

const TRIM_S = 4;
const QUALITY = 3;

// The ONE filename grammar. A library file that does not match it is a library
// bug and fails the build loudly — never silently skipped.
const NAME_RE = /^([A-G]#?)(-?\d+)(?:_([a-z0-9]+))?_rr(\d+)\.wav$/;
const PC = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

// Middle-of-what-exists layer choice, as before.
const DYN_ORDER = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff',
                   'v1', 'v2', 'v3', 'v4', 'quiet', 'loud', ''];
const dynRank = (d) => { const i = DYN_ORDER.indexOf(d); return i === -1 ? 99 : i; };
const pickLayer = (present) => {
  const ordered = [...present].sort((a, b) => dynRank(a) - dynRank(b));
  return ordered[Math.floor((ordered.length - 1) / 2)];
};

// ─── Find every pack (a folder holding info.json + wavs) ─────────────────────
const packs = [];
const walk = (dir, trail) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  if (entries.some((e) => e.name === 'info.json')) {
    packs.push({ dir, trail });
    return;                                        // packs do not nest
  }
  for (const e of entries) if (e.isDirectory()) walk(path.join(dir, e.name), [...trail, e.name]);
};
walk(LIB, []);

const mb = (b) => (b / 1048576).toFixed(1);
const results = [];
let failed = 0;

for (const pack of packs) {
  const [family, instrument, articulation] = pack.trail.slice(-3).length === pack.trail.length
    ? pack.trail : pack.trail.slice(-3);
  const fam = pack.trail[0];
  const info = JSON.parse(fs.readFileSync(path.join(pack.dir, 'info.json'), 'utf8'));
  const label = pack.trail.length >= 3
    ? `${pack.trail[1]} (${pack.trail[2]})`
    : pack.trail[1];
  if (PICK.length && !PICK.some((p) => info.id.includes(p) || label.toLowerCase().includes(p))) continue;

  const parsed = [];
  let bad = null;
  for (const f of fs.readdirSync(pack.dir)) {
    if (!/\.wav$/i.test(f)) continue;
    const m = f.match(NAME_RE);
    if (!m) { bad = f; break; }
    parsed.push({ file: f, midi: PC[m[1]] + (Number(m[2]) + 1) * 12, dyn: m[3] || '', rr: Number(m[4]) });
  }
  if (bad) { console.log(`FAIL  ${label.padEnd(34)} un-canonical filename "${bad}" — fix the library`); failed++; continue; }
  if (!parsed.length) { console.log(`skip  ${label.padEnd(34)} no wavs`); continue; }

  const layer = pickLayer(new Set(parsed.map((p) => p.dyn)));
  const inLayer = parsed.filter((p) => p.dyn === layer);
  const minRR = Math.min(...inLayer.map((p) => p.rr));
  const seen = new Set();
  const chosen = inLayer.filter((p) => p.rr === minRR && (seen.has(p.midi) ? false : seen.add(p.midi)))
    .sort((a, b) => a.midi - b.midi);

  const centres = chosen.map((p) => p.midi);
  const keyRange = (midi) => {
    const i = centres.indexOf(midi);
    return [i === 0 ? 0 : Math.floor((centres[i - 1] + midi) / 2) + 1,
            i === centres.length - 1 ? 127 : Math.floor((midi + centres[i + 1]) / 2)];
  };

  if (DRY) { console.log(`dry   ${label.padEnd(34)} ${chosen.length} notes, layer "${layer || 'single'}"`); continue; }

  const outDir = path.join(OUT, info.id);
  fs.mkdirSync(outDir, { recursive: true });
  const zones = [];
  let srcBytes = 0, outBytes = 0, encoded = 0, kept = 0;
  for (const p of chosen) {
    const outName = `${p.midi}.ogg`;
    const srcPath = path.join(pack.dir, p.file);
    const outPath = path.join(outDir, outName);
    srcBytes += fs.statSync(srcPath).size;
    // INCREMENTAL: encode only when the source is newer than the output —
    // adding one instrument (or renaming a folder, which changes labels, not
    // audio) must not re-encode the other five hundred samples. Manifests and
    // packs.json are always rewritten below; only the ffmpeg work is skipped.
    // ⚠ A change to TRIM_S or QUALITY is invisible to this check — that is
    // what --force is for. So is an OCTAVE-SHIFT RENAME sweep in the library:
    // renaming D4→D3 leaves mtimes alone, and the old D3's output already sits
    // at the new root's filename looking fresh — wrong audio under a right
    // label. After any library rename that moves notes onto other existing
    // notes, rebuild that pack with --force (bit on the 2026-08-30 cp-align).
    const fresh = !args.includes('--force') && fs.existsSync(outPath) &&
      fs.statSync(outPath).mtimeMs > fs.statSync(srcPath).mtimeMs;
    if (fresh) kept++;
    else {
      execFileSync('ffmpeg', [
        '-v', 'error', '-y', '-i', srcPath,
        '-t', String(TRIM_S),
        '-af', `afade=t=out:st=${Math.max(0, TRIM_S - 0.35)}:d=0.35`,
        '-c:a', 'libvorbis', '-q:a', String(QUALITY),
        outPath,
      ]);
      encoded++;
    }
    outBytes += fs.statSync(outPath).size;
    const [lokey, hikey] = keyRange(p.midi);
    zones.push({ file: outName, root: p.midi, lokey, hikey, lovel: 0, hivel: 127 });
  }

  // Stale samples from an earlier mapping would ship unreferenced — delete.
  const written = new Set(zones.map((z) => z.file));
  for (const f of fs.readdirSync(outDir)) {
    if (/\.ogg$/i.test(f) && !written.has(f)) fs.unlinkSync(path.join(outDir, f));
  }

  fs.writeFileSync(path.join(outDir, `${info.id}.json`),
    JSON.stringify({ name: info.id, label, format: 1, layer: layer || 'single',
      // per-pack master tuning correction in cents (info.json `tuneCents`) —
      // applied by the pack loader to every voice, render and live alike
      ...(info.tuneCents ? { tuneCents: info.tuneCents } : {}),
      zones }, null, 2));
  // instrument/articulation split (from the folder trail): the picker lists
  // each INSTRUMENT once and shows its articulations as variant buttons. A
  // two-level pack has no articulation — parens in ITS name are just the name
  // ("Hang (D minor)"), never a variation.
  // author / license / url ship in packs.json — the CC BY packs make
  // attribution a licence OBLIGATION of the built app, not a courtesy, so the
  // compiled index is where the trail lives (the library's info.json never
  // leaves the workspace).
  results.push({ name: info.id, label, family: fam, role: info.role, collection: info.collection,
                 instrument: pack.trail[1], articulation: pack.trail[2] || null,
                 author: info.author, license: info.license, url: info.url || '' });
  console.log(`ok    ${label.padEnd(34)} ${String(zones.length).padStart(3)} notes  ` +
    (encoded ? `${encoded} encoded` : 'unchanged') + (kept && encoded ? `, ${kept} kept` : '') +
    `  ${mb(srcBytes).padStart(6)} MB → ${mb(outBytes)} MB`);
}

// Merge into packs.json: replace the entries this run rebuilt, keep the rest
// (packs whose sources are still postponed keep their previous build) — but
// ⚠ DROP any entry whose compiled folder is no longer on disk. "Keep the rest"
// alone made an instrument REMOVED from the library immortal: nothing rebuilds
// it, so it survived every later run as an index entry pointing at samples that
// are gone, and the picker offered an instrument that could only fail to load.
// Presence of the folder is the right test, not presence in this run's results:
// a postponed pack still has its folder, a deleted one does not.
if (!DRY && results.length) {
  const indexPath = path.join(OUT, 'packs.json');
  const idx = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : { format: 1, packs: [] };
  const rebuilt = new Map(results.map((r) => [r.name, r]));
  // `family` comes from the library's top-level folder — the authoritative
  // classification, so the app's picker never has to guess it from the id.
  // `collection` (info.json) is the SOURCE tag the picker shows beside each
  // instrument (VSCO / FreePats / Freesound) — a source fact, so it lives in
  // info.json, never in the folder name (folders are display labels).
  const merged = idx.packs.filter((p) => !rebuilt.has(p.name) && fs.existsSync(path.join(OUT, p.name)))
    .concat(results.map((r) => ({ name: r.name, label: r.label, family: r.family, role: r.role,
                                  collection: r.collection, instrument: r.instrument, articulation: r.articulation,
                                  author: r.author, license: r.license, url: r.url })));
  merged.sort((a, b) => a.label.localeCompare(b.label));
  fs.writeFileSync(indexPath, JSON.stringify({ ...idx, packs: merged }, null, 2));
  console.log(`\n${results.length} pack(s) compiled from the library; packs.json lists ${merged.length}`);
}
if (failed) process.exit(1);

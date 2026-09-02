// ─────────────────────────────────────────────────────────────────────────────
// check-render-parity.mjs - prove the exporter still renders byte-identically.
//
// The four seed styles were split into gesture + timbre so that instruments
// could be added without multiplying renderers. The synth constants inside the
// gestures are therefore not free parameters: they reproduce the pre-split
// renderers sample-for-sample, so a .yams saved before instruments existed
// still renders the same file. This is what checks that.
//
// It renders every style x several progressions x both formats through the
// CURRENT engine and through an OLDER revision taken from git, and compares the
// bytes.
//
//   node scripts/check-render-parity.mjs            # against HEAD
//   node scripts/check-render-parity.mjs v1.0.4     # against a tag/commit
//
// Exits non-zero on any difference.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ENGINE = 'src/lib/seed-engine.js';
const REF = process.argv[2] || 'HEAD';

// The oracle has to sit beside the real engine: it imports its dependencies by
// bare specifier, which resolve from the importing file's own location.
const ORACLE = path.join(ROOT, 'src', 'lib', `__parity-oracle-${process.pid}.js`);

let oracleSrc;
try {
  oracleSrc = execFileSync('git', ['show', `${REF}:${ENGINE}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
} catch {
  console.error(`Could not read ${ENGINE} at "${REF}". Is this a git checkout, and does that revision exist?`);
  process.exit(2);
}

fs.writeFileSync(ORACLE, oracleSrc);
let before, after;
try {
  before = await import(pathToFileURL(ORACLE).href);
  after = await import(pathToFileURL(path.join(ROOT, ENGINE)).href);
} finally {
  fs.unlinkSync(ORACLE);
}

const CASES = [
  { progression: 'C\nEm7\nAm\nF', bpm: 80, bars: 1, sig: '4/4', loops: 2 },
  { progression: 'Am C G Dm', bpm: 120, bars: 1, sig: '4/4', loops: 4 },
  { progression: '[Verse]\nC Csus4 F/C G/D\nN.C.\nBbmaj7 Dm7b5', bpm: 96, bars: 2, sig: '3/4', loops: 1 },
  { progression: 'F#m11\nDbmaj13\nN.C./B\nG7sus4', bpm: 64, bars: 1, sig: '6/8', loops: 3 },
];

const identical = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

let checked = 0, failed = 0;
for (const style of after.STYLES) {
  if (!before.STYLES.includes(style)) {
    console.log(`skip  ${style} — not present at ${REF}`);
    continue;
  }
  for (const [i, c] of CASES.entries()) {
    for (const format of ['wav', 'mp3']) {
      // instrument: 'sine' is the built-in synth — the only path that has to
      // stay byte-stable. Sampled instruments did not exist at the baseline.
      const a = before.generateSeed({ ...c, style, format });
      const b = after.generateSeed({ ...c, style, format, instrument: 'sine' });
      checked++;

      const audioOk = identical(Array.from(a.audio), Array.from(b.audio));
      const midiOk = identical(Array.from(a.midi), Array.from(b.midi));
      if (!audioOk || !midiOk) {
        failed++;
        console.log(`DIFF  style=${style} case=${i} format=${format}` +
          `  audio=${audioOk ? 'ok' : `DIFF (${a.audio.length} vs ${b.audio.length} bytes)`}` +
          `  midi=${midiOk ? 'ok' : 'DIFF'}`);
      }
    }
  }
}

console.log(`\n${checked} renders compared against ${REF}, ${failed} difference(s)`);
process.exit(failed ? 1 : 0);

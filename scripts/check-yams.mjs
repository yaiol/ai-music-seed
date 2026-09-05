// check:yams — the .yams format's round trip: buildSeed → JSON → seedFromFile
// must give back every field the seed was holding, and a hand-mangled file
// must never reach the render as something that crashes it.
//
// Why it exists: the seed carries its OWN figure since v3 (2026-09-04), so the
// file is no longer described by a style NAME alone. A figure that does not
// survive a save is a seed that plays differently after a reopen — silently,
// because nothing throws. `npm run build` cannot see that, and check:render
// only proves the panel mounts.
//
// It loads App.jsx through Vite's own pipeline, the same way check-render does,
// because the format lives with the panel that writes it.
import { createServer } from 'vite';
globalThis.window = globalThis; globalThis.self = globalThis;
Object.defineProperty(globalThis, 'navigator', { value: { language: 'en-US', userAgent: 'node', platform: 'Win32' }, configurable: true });
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { documentElement: { setAttribute() {}, style: {} }, body: { classList: { add() {}, remove() {} } },
  addEventListener() {}, removeEventListener() {}, createElement: () => ({ style: {}, setAttribute() {} }), querySelector: () => null };
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.location = { search: '', href: 'http://localhost/', hash: '' };
globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};
globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);

let failed = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok || !detail ? '' : `  — ${detail}`}`);
  if (!ok) failed++;
};
const save = (seed, buildSeed) => JSON.parse(JSON.stringify(buildSeed(seed)));   // through the file, literally

const server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { buildSeed, seedFromFile } = await server.ssrLoadModule('/src/App.jsx');
  const engine = await server.ssrLoadModule('/src/lib/seed-engine.js');

  // An edited figure: both lanes rewritten, every lane setting off its default.
  const PATTERN = {
    meter: 4,
    treble: '1 . 3+ @2!s r3 . f . 4v',
    bass: "1s . . 2'",
    trebleLane: { step: 12, octave: 4, vel: 0.42, len: 7, hold: true },
    bassLane: { step: 8, octave: 2, vel: 0.9, len: 3, hold: false },
  };
  const seed = {
    ...JSON.parse(JSON.stringify({
      name: 'A seed', progression: '[Verse]\nAm C G Dm\nF F G7', bpm: 96, bars: 2, sig: '7/8', loops: 3,
      style: 'arpeggio4', chordFigure: 'a1243', bassFigure: 'twice', swing: 1 / 3,
      trebleInstrument: 'vsco:strings-guitar-nylon', bassInstrument: '',
      trebleVolume: 80, bassVolume: 55, trebleOctave: -1, bassOctave: 1,
      highpass: 120, lowpass: 9000, reverb: 'church', trebleReverb: 40, bassReverb: 15,
      format: 'wav', mp3Bitrate: 320, output: '{name}-{bpm}',
    })),
    pattern: PATTERN,
  };

  const file = save(seed, buildSeed);
  check('the file declares version 3', file.version === 3, `got ${file.version}`);
  check('the file carries the figure', !!file.pattern, 'no `pattern` key written');

  const back = seedFromFile(file, 'D:/seeds/x.yams');

  // 1. every field the user set comes back
  const FIELDS = ['name', 'progression', 'bpm', 'bars', 'sig', 'loops', 'style', 'chordFigure', 'bassFigure', 'swing',
                  'trebleInstrument', 'bassInstrument', 'trebleVolume', 'bassVolume', 'trebleOctave',
                  'bassOctave', 'highpass', 'lowpass', 'reverb', 'trebleReverb', 'bassReverb',
                  'format', 'mp3Bitrate', 'output'];
  const lost = FIELDS.filter((k) => JSON.stringify(back[k]) !== JSON.stringify(seed[k]));
  check(`every seed field survives the round trip (${FIELDS.length} fields)`, lost.length === 0,
    lost.map((k) => `${k}: ${JSON.stringify(seed[k])} → ${JSON.stringify(back[k])}`).join('; '));

  // 2. the figure comes back note for note
  check('the figure survives note for note',
    JSON.stringify(back.pattern) === JSON.stringify(engine.sanitizePattern(PATTERN)),
    `${JSON.stringify(back.pattern)} vs ${JSON.stringify(PATTERN)}`);

  // 3. and it still plays the same — the whole point of saving it
  const plan = (s) => engine.planSeedEvents({ ...s, loops: 1 }).events
    .map((e) => `${e.chordOffset}:${e.at}:${e.midi}:${e.len}:${e.lane}`).join('|');
  check('the reopened seed renders identically', plan(seed) === plan(back),
    'the figure plays differently after a save + reopen');

  // 4. a seed with no figure of its own writes no key, and reads back as none
  const plainFile = save({ ...seed, pattern: null }, buildSeed);
  check('a seed without its own figure writes no `pattern` key', !('pattern' in plainFile),
    `wrote ${JSON.stringify(plainFile.pattern)}`);
  check('… and reads back as none', seedFromFile(plainFile).pattern === null);

  // 5. a hand-mangled file must not reach the render as a crash. A .yams is a
  //    text file; every one of these has been a real shape someone can type.
  for (const [label, bad] of [
    ['a string where the figure should be', 'arpeggio4'],
    ['an array', [1, 2, 3]],
    ['nonsense lane settings', { treble: '1 2', bass: '1', trebleLane: { step: 'x', vel: 99 }, bassLane: null }],
    ['missing lanes', { meter: 4 }],
    ['a slot string of junk', { treble: '@@@ zzz ...', bass: 42 }],
  ]) {
    let ok = false, why = '';
    try {
      const s = seedFromFile({ ...plainFile, pattern: bad });
      engine.planSeedEvents({ ...s, loops: 1 });   // must not throw
      ok = s.pattern === null || typeof s.pattern.treble === 'string';
      why = JSON.stringify(s.pattern);
    } catch (e) { why = String(e && e.message); }
    check(`survives ${label}`, ok, why);
  }

  // 6. a v2 file (no figure at all) still opens — the format's own history
  check('a v2 file still opens', seedFromFile({ version: 2, chords: 'C G', style: 'pad', output: 'x' }).progression === 'C G');
} catch (e) {
  console.log('check:yams FAILED:', (e && e.stack) || e); failed++;
} finally { await server.close(); }

console.log(`\n${failed} failure(s)`);
process.exitCode = failed ? 1 : 0;

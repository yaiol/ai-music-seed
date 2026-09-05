// check-style-roundtrip.mjs — the round-trip law behind the style editor.
//
// The editor's grid is a PURE VIEW over the slot strings in PATTERNS: a cell
// is one entry of parseSlots' output, and writing a cell back is
// serializeSlots. That is only honest if the two are exact inverses — so this
// asserts serialize(parse(s)) === s for every lane string of every shipped
// style, and that parse(serialize(parse(s))) is structurally identical too.
//
// A failure here means the grid could rewrite a style the user never touched.
// If a SOURCE string disagrees with the canonical suffix order, normalise the
// source once — never teach the serializer a second order.
//
// Run:  npm run check:roundtrip
import { STYLES, getPattern, parseSlots, serializeSlots } from '../src/lib/seed-engine.js';

let failures = 0;
const ok = (msg) => console.log(`ok   ${msg}`);
const bad = (msg) => { failures++; console.log(`FAIL ${msg}`); };

for (const key of STYLES) {
  const p = getPattern(key);
  for (const lane of ['bass', 'treble']) {
    const src = String(p[lane] || '.').trim().replace(/\s+/g, ' ');
    const parsed = parseSlots(src);
    const out = serializeSlots(parsed);
    if (out !== src) {
      bad(`${key}.${lane}: serialize(parse(s)) !== s\n       s   = ${src}\n       out = ${out}`);
      continue;
    }
    const again = JSON.stringify(parseSlots(out));
    if (again !== JSON.stringify(parsed)) bad(`${key}.${lane}: parse is not stable across a round trip`);
    else ok(`${key.padEnd(10)} ${lane.padEnd(6)} ${parsed.length} slots round-trip byte-for-byte`);
  }
}

// The grammar's full flag set survives a round trip in one cell — every
// suffix, both conditions, and the slot-level push — so the editor can
// represent any note the importer can produce (read-fidelity).
const full = "@1+^!sL2-v?'l 43 . f+ r3s r";
const back = serializeSlots(parseSlots(full));
if (back === full) ok('every flag round-trips in one slot');
else bad(`flag set changed across a round trip:\n       in  = ${full}\n       out = ${back}`);

console.log(`\n${failures} failure(s)`);
process.exit(failures ? 1 : 0);

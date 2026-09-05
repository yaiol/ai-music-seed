// check:labels — the band captions, in every language.
//
// i18n holds the WHOLE word ("velocity"); the band shows what `shortLabel`
// makes of it ("vel"). Two things can go wrong silently, in a language nobody
// on the team reads:
//
//   · two captions shortening to the SAME thing — a knob row where two of the
//     six are both "vol", and nothing anywhere says so;
//   · a caption that comes back empty, or that the shortener cut in a script
//     where a prefix is meaningless (it must return those whole).
//
// It reads through the SHIPPED accessor (`getT`, the same one the panel calls)
// so it measures what the user will actually see, not a re-parse of the file.
import { createServer } from 'vite';

const CAPTIONS = ['lblSeedKnobVel', 'lblSeedKnobLen', 'lblSeedKnobVolume',
                  'lblSeedKnobOctave', 'lblSeedKnobTune', 'lblSeedKnobReverb'];
// scripts where a leading-letters abbreviation is NOT the convention: shortLabel
// must hand these back whole, whatever their length
const WHOLE_SCRIPT = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Thai}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

let failed = 0;
const fail = (msg) => { console.log(`FAIL ${msg}`); failed++; };

const server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { getT, LANGUAGES } = await server.ssrLoadModule('/src/i18n.js');
  const { shortLabels } = await server.ssrLoadModule('/src/lib/ui-text.js');

  let widest = { chars: 0 };
  for (const lang of LANGUAGES) {
    const key = lang.key ?? lang.code ?? lang;
    const t = getT(key);
    const seen = new Map();
    const fulls = CAPTIONS.map((c) => t(c));
    const shorts = shortLabels(fulls);   // the SHIPPED shortener, on the whole row at once
    for (const [i, cap] of CAPTIONS.entries()) {
      const full = fulls[i], short = shorts[i];
      if (!full || !short) { fail(`${key} ${cap}: empty caption`); continue; }
      if (WHOLE_SCRIPT.test(full) && short !== full) {
        fail(`${key} ${cap}: "${full}" was cut to "${short}" — that script must be shown whole`);
      }
      if (seen.has(short)) fail(`${key}: "${short}" is both ${seen.get(short)} and ${cap} ("${full}")`);
      else seen.set(short, cap);
      if (short.length > widest.chars) widest = { chars: short.length, key, cap, full, short };
    }
  }
  console.log(`${LANGUAGES.length} languages x ${CAPTIONS.length} captions checked`);
  console.log(`widest caption on screen: "${widest.short}" (${widest.chars} chars) — ${widest.key} ${widest.cap}, from "${widest.full}"`);
} catch (e) {
  console.log('check:labels FAILED:', (e && e.stack) || e); failed++;
} finally { await server.close(); }

console.log(`\n${failed} failure(s)`);
process.exitCode = failed ? 1 : 0;

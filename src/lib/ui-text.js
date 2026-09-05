// ui-text.js — text helpers shared by every yaiol electron app.
//
// ⚠ Do not edit an app's copy — this file is distributed by sync-shared.js;
// edit the canonical source and re-sync.

// Scripts where a leading-letters abbreviation IS the convention. Everything
// else is returned whole — see shortLabels.
const ABBREVIABLE = /^[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}\p{Script=Armenian}\p{M}\p{P}\p{Zs}\d]+$/u;

// Cut by GRAPHEME, never by code unit: an accented letter written as letter +
// combining mark is one thing on screen and must stay one thing here.
const graphemes = (s) => (typeof Intl !== 'undefined' && Intl.Segmenter
  ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s)].map((g) => g.segment)
  : [...s]);

const cut = (s, n) => { const g = graphemes(s); return g.length <= n ? s : g.slice(0, n).join(''); };
const len = (s) => graphemes(s).length;

// shortLabels(texts, max) — a SET of captions shortened for controls that have
// no room for the whole word: ["velocity","length","volume"] → ["vel","len","vol"].
// The caller keeps the whole word as each control's `title`.
//
// ⚠ CLAUDE: shortening is a property of the SET, not of one string, which is
// why this takes a list. `text.slice(0, 3)` on each is wrong twice over:
//
// 1. It collides. Hungarian "hangerő" (volume) and "hangolás" (tune) both cut
//    to "han"; Malay "kelajuan" and "kelantangan" both to "kel". Two knobs in
//    one row wearing the same caption, and nothing anywhere says so. So the cut
//    length GROWS until every caption in the set is distinct — one length for
//    the whole set, so the row stays visually even.
//
// 2. It cuts UTF-16 code units, which ships a rendering bug in every language
//    nobody on the team reads:
//      · Devanagari, Bengali, Tamil, Telugu, Thai — a vowel sign is its own code
//        point bound to the letter before it. Cut between them and the font
//        draws a dotted-circle placeholder.
//      · Arabic and Hebrew — a prefix is not an abbreviation in either script,
//        and a cut mid-word breaks the cursive joining.
//      · Japanese and Korean — ベロシ is not short for ベロシティ.
//      · Chinese — 音量 is already two characters; there is nothing to cut.
//    So only the ABBREVIABLE scripts are shortened at all; the rest come back
//    whole. A caption is wider in those languages: that is the correct trade,
//    because the alternative is text that looks broken.
//
// A word at, or one character over, the limit is returned whole — shortening
// "tune" to "tun" buys a pixel column and costs the word — unless keeping it
// whole would re-introduce a collision.
export function shortLabels(texts, max = 3) {
  const list = texts.map((t) => String(t ?? ''));
  const abbreviable = list.map((s) => s && ABBREVIABLE.test(s));
  const longest = Math.max(1, ...list.map(len));
  const at = (n) => list.map((s, i) => (abbreviable[i] ? cut(s, n) : s));
  const unique = (a) => new Set(a).size === a.length;

  let n = max;
  while (n < longest && !unique(at(n))) n++;
  const plain = at(n);

  // the "one character over" courtesy, kept only while it stays unambiguous
  const relaxed = list.map((s, i) => (abbreviable[i] && len(s) <= n + 1 ? s : plain[i]));
  return unique(relaxed) ? relaxed : plain;
}

// One caption on its own — the same rules, with no set to disambiguate against.
export function shortLabel(text, max = 3) {
  return shortLabels([text], max)[0];
}

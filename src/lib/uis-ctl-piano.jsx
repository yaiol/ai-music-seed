// uis-ctl-piano.jsx — the ONE piano keyboard for every yaiol electron app: a strip of white keys that share
// the row's width with the black keys riding the boundaries between them. A display + audition control:
// keys light to show notes that sound, and a press on a key reports it. Reference: ai-music-seed's Chord
// Player strip (a hand-built copy before this).
//
// `lo`..`hi` is the MIDI range, both included (default 24..96 = C1..C7). `lit` maps a MIDI number to the
// lit colour of that key: `'a'` or `'b'` (two colours, so a mixed chord reads — a treble note and a bass
// note at once). The two colours are the tokens `--uis-pno-lit-a` (default: the accent) and
// `--uis-pno-lit-b`; an app sets them on :root to its own two. `onPlay(midi)` runs on pointer-down.
//   <UisPiano lit={{ 60: 'a', 36: 'b' }} onPlay={(m) => audition(m)} />
//
// A piano's white and black are intrinsic (theme-invariant, like a fretboard's wood), so the key colours
// do not follow the theme. The black keys' left offsets are layout data from the note numbers, not styling.
//
// ⚠ Do not edit an app's copy — this file is distributed by sync-shared.js; edit the canonical source and re-sync.

import React from 'react';
import '../assets/uis-ctl-piano.css';

const BLACK_PC = new Set([1, 3, 6, 8, 10]);

export function UisPiano({ lo = 24, hi = 96, lit = {}, onPlay }) {
  const whites = [], blacks = [];
  let wIdx = 0;
  for (let m = lo; m <= hi; m++) {
    if (BLACK_PC.has(m % 12)) blacks.push({ m, at: wIdx });
    else { whites.push({ m }); wIdx++; }
  }
  const cls = (m, base) => `uis-pno-key ${base}${lit[m] ? ` on-${lit[m]}` : ''}`;
  return (
    <div className="uis-pno">
      {whites.map((k) => (
        <button key={k.m} type="button" className={cls(k.m, 'white')}
                onPointerDown={() => onPlay?.(k.m)} />
      ))}
      {blacks.map((k) => (
        <button key={k.m} type="button" className={cls(k.m, 'black')}
                style={{ left: `${(k.at / whites.length) * 100}%` }}
                onPointerDown={() => onPlay?.(k.m)} />
      ))}
    </div>
  );
}

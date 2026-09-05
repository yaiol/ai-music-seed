// ui-ctl-knob.jsx — the ONE compact instrument-style value control for every
// yaiol electron app: a label on top, a round drag body in the middle, and a
// directly-editable value underneath (the hardware-knob idiom of music tools).
//
// Drag the body vertically — up increases, down decreases, quantised to
// `step`; the full drag travel (~150 px) spans the whole [min..max] range.
// The value line is a real input: click it, type a number, Enter/blur commits
// (clamped + quantised), Escape reverts. `unit` is display-only ("%", "st").
//
// Geometry lives in the catalog (.knob* in the PAIRED ui-ctl-knob.css, which
// this file side-effect-imports so the skin travels with the control); colour
// flows from the container's surface tokens, per the UI colour-set model.
//
//   <Knob label="Volume" value={v} min={0} max={100} step={5} unit="%"
//         onChange={setV} />
//
// `title` is the control's tooltip — where the caption is SHORTENED to fit
// (shortLabel in ui-text.js), this is where the whole word stays readable.
//
// `arc` fills the travelled sweep, min → value, as a ring around the body —
// for a knob whose value is an AMOUNT measured from its minimum (a volume, a
// send, a length). Leave it off for a knob that sets a POSITION on a scale
// either side of a centre (a tuning trim, an octave shift): there the filled
// arc would read as "50% of something" instead of "one step above centre",
// and the tick alone says the true thing.
//
// `inline` is the ONE-CONTROL-HEIGHT tier: the same knob laid out across —
// body at the left, label over value beside it — 30px tall instead of three
// stacked lines, for a band whose height is a fixed row multiple. Body, tick,
// drag travel and fonts are unchanged; only the axis (.knob.inline).
//
// ⚠ Do not edit an app's copy — this file is distributed by sync-shared.js;
// edit the canonical source and re-sync.

import React, { useRef, useState } from 'react';
import '../assets/ui-ctl-knob.css';

export function Knob({ label, value, min = 0, max = 100, step = 1, unit = '', disabled = false, inline = false, arc = false, title = '', onChange }) {
  const [editing, setEditing] = useState(null);   // null = showing; string = the draft being typed
  const drag = useRef(null);                      // { startY, startValue } while the body is held

  const clampQ = (v) => {
    const q = Math.round((v - min) / step) * step + min;
    // float noise (0.30000000000000004) would leak into the value line
    const fixed = Number(q.toFixed(6));
    return Math.min(max, Math.max(min, fixed));
  };

  const onPointerDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startValue: value };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const travel = (drag.current.startY - e.clientY) / 150;   // full drag ≈ 150 px
    onChange?.(clampQ(drag.current.startValue + travel * (max - min)));
  };
  const onPointerUp = () => { drag.current = null; };

  const commit = () => {
    if (editing !== null) {
      const n = Number(String(editing).replace(',', '.').replace(/[^\d.+-]/g, ''));
      if (Number.isFinite(n)) onChange?.(clampQ(n));
    }
    setEditing(null);
  };

  // −135°..+135° over the range, the convention every hardware knob follows.
  const frac = max > min ? (value - min) / (max - min) : 0;
  const angle = -135 + 270 * frac;

  return (
    <div className={`knob${inline ? ' inline' : ''}${disabled ? ' disabled' : ''}`} title={title || undefined}>
      <span className="knob-label">{label}</span>
      <button type="button" className="knob-body" aria-label={label} disabled={disabled}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {/* `pathLength` re-scales the circle to 360 units so the dash IS the
            swept angle; the rotate puts unit 0 at the knob's minimum (−135°),
            which an SVG circle would otherwise place at 3 o'clock. */}
        {arc && <svg className="knob-arc" viewBox="0 0 30 30" aria-hidden="true">
          <circle cx="15" cy="15" r="9" pathLength="360"
                  strokeDasharray={`${270 * frac} 360`} transform="rotate(135 15 15)" />
        </svg>}
        {/* the two are alternatives, never both: the arc ALREADY ends at the
            value, so a tick there is the same statement drawn twice — and it
            reads as an overshoot wherever the two edges do not land on the
            same pixel. An empty ring is the minimum. */}
        {!arc && <span className="knob-tick" style={{ transform: `rotate(${angle}deg)` }} />}
      </button>
      <input className="knob-value" disabled={disabled}
        value={editing !== null ? editing : `${value}${unit ? ' ' + unit : ''}`}
        onFocus={(e) => {
          setEditing(String(value));
          // Select the whole value once the raw number is in the field — a click
          // means "replace this", not "insert into it".
          const el = e.target;
          requestAnimationFrame(() => el.select());
        }}
        onChange={(e) => setEditing(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { commit(); e.currentTarget.blur(); }
          else if (e.key === 'Escape') { setEditing(null); e.currentTarget.blur(); }
        }} />
    </div>
  );
}

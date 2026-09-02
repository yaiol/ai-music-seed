// ui-ctl-knob.jsx — the ONE compact instrument-style value control for every
// yaiol electron app: a label on top, a round drag body in the middle, and a
// directly-editable value underneath (the hardware-knob idiom of music tools).
//
// Drag the body vertically — up increases, down decreases, quantised to
// `step`; the full drag travel (~150 px) spans the whole [min..max] range.
// The value line is a real input: click it, type a number, Enter/blur commits
// (clamped + quantised), Escape reverts. `unit` is display-only ("%", "st").
//
// Geometry lives in the catalog (.knob* in ui-app.css); colour flows from the
// container's surface tokens, per the UI colour-set model.
//
//   <Knob label="Volume" value={v} min={0} max={100} step={5} unit="%"
//         onChange={setV} />
//
// ⚠ Do not edit an app's copy — this file is distributed by sync-shared.js;
// edit the canonical source and re-sync.

import React, { useRef, useState } from 'react';

export function Knob({ label, value, min = 0, max = 100, step = 1, unit = '', disabled = false, onChange }) {
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
  const angle = max > min ? -135 + 270 * ((value - min) / (max - min)) : 0;

  return (
    <div className={`knob${disabled ? ' disabled' : ''}`}>
      <span className="knob-label">{label}</span>
      <button type="button" className="knob-body" aria-label={label} disabled={disabled}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <span className="knob-tick" style={{ transform: `rotate(${angle}deg)` }} />
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

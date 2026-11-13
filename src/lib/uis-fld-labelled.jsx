// uis-fld-labelled.jsx — a LABELLED FIELD: a caption and the control it names.
//
// Normal: the caption sits above its control (a dialog / settings form). `compact`: the caption and the
// control share ONE line, so a dense tool panel fits many fields (the compact family, .uis-cmp-*, independent of
// .small - the two can be mixed, and neither implies the other).
//
// Geometry lives in the PAIRED uis-fld-labelled.css (side-effect-imported below, so the skin travels with the
// control; the normal field's base rule is in uis-app.css). The control inside is an ordinary select / input /
// number / button: it keeps its own look, only a compact field takes its height and type size from the compact tokens.
//
//   <UisFldLabelled compact label="Size" title="Largest picture the file may have">
//     <select className="uis-ddn-std">…</select>
//     <button className="uis-btn ico">…</button>
//   </UisFldLabelled>
//
// `label` is the already-translated caption; `title` is its tooltip (the label when omitted).
import '../assets/uis-fld-labelled.css';

export function UisFldLabelled({ label, title, compact = false, children }) {
  const caption = <span className="uis-fld-labelled-label" title={title || label}>{label}</span>;
  return compact
    ? <div className="uis-fld-labelled compact">{caption}<div className="uis-fld-labelled-ctl">{children}</div></div>
    : <div className="uis-fld-labelled">{caption}{children}</div>;
}

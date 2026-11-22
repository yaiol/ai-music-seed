//! The step grid and the chord strip: the Electron app's `StepGrid` and `ChordStrip`, element for element, on the
//! catalog's `.uis-grd-sequencer` column system.

use crate::i18n;
use dioxus::prelude::*;
use engine::chords::{chord_rows, transpose_chord};
use engine::seed::{StackGeom, lane_geom};
use engine::slots::{Cell, LaneCfg, Note, Tone, grid_rows, serialize_slots};
use std::collections::HashSet;

/// The note the flags act on: a lane, a slot and the note's index in it.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Sel {
    pub lane: &'static str,
    pub slot: usize,
    pub idx: usize,
}

/// A refinement asked by a click between two slots: the lane goes to `step`, the note lands on column `slot`.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Refine {
    pub step: f64,
    pub slot: usize,
    pub mirror: bool,
}

/// What a click on the grid means: `onCell(lane, slot, row, idx, refine, selectOnly)`; `slot` is -1 past the lane's end.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct CellHit {
    pub lane: &'static str,
    pub slot: i32,
    pub row: Tone,
    pub idx: i32,
    pub refine: Option<Refine>,
    pub select_only: bool,
}

/// What each beat division writes on the ruler between the beats.
fn ruler_sub(cpb: u32) -> Vec<&'static str> {
    match cpb {
        1 => vec![""],
        2 => vec!["", "+"],
        3 => vec!["", "&", "a"],
        4 => vec!["", "e", "+", "a"],
        6 => vec!["", "\u{b7}", "\u{b7}", "\u{b7}", "\u{b7}", "\u{b7}"],
        8 => vec!["", "\u{b7}", "\u{b7}", "\u{b7}", "\u{b7}", "\u{b7}", "\u{b7}", "\u{b7}"],
        _ => vec![],
    }
}

/// The flags a note carries, as the glyphs the grammar writes them with.
pub fn note_flags(nt: &Note, early: bool) -> String {
    let text = serialize_slots(&[Cell { notes: vec![nt.clone()], early: false }]);
    let skip = nt.tone.text().chars().count() + usize::from(nt.tone == Tone::Rest && nt.from.unwrap_or(0) > 1);
    let mut parts: Vec<String> = Vec::new();
    if early {
        parts.push("@".to_owned());
    }
    parts.extend(text.chars().skip(skip).map(|c| c.to_string()));
    parts.join(" ")
}

fn col_class(c: usize, cpb: usize, play_col: i64) -> String {
    format!("{}{}", if c % cpb == 0 { " beat" } else { "" }, if c as i64 == play_col { " active" } else { "" })
}

/// A lane on the axis. Rows are DEGREES, never pitches. A hit shows the note's flags; `.off` is a column past the
/// lane's own length; `.active` is the playhead at this lane's own phase.
#[component]
pub fn StepGrid(
    lang: String,
    lane: &'static str,
    slots: Vec<Cell>,
    cfg: LaneCfg,
    meter: Option<f64>,
    geom: StackGeom,
    sel: Option<Sel>,
    show_ruler: bool,
    play_col: i64,
    mirror: bool,
    on_cell: EventHandler<CellHit>,
) -> Element {
    let t = |key: &str| i18n::t(&lang, key);
    let (cols, cpb, col_q, numer) = (geom.cols, geom.cpb as usize, geom.col_q, geom.numer as usize);
    let lg = lane_geom(slots.len(), &cfg, meter, geom.bar_q);
    let (slot_q, pattern_q) = (lg.slot_q, lg.pattern_q);
    let sub = ruler_sub(geom.cpb);
    let rows = grid_rows();
    let n_slots = slots.len() as i64;
    // the slot a column shows, and whether the slot STARTS on it; past the lane's own length there is no slot (-1)
    let at = |c: usize| -> (i64, bool) {
        let tt = c as f64 * col_q;
        if tt >= pattern_q - 1e-6 {
            return (-1, false);
        }
        let i = (tt / slot_q + 1e-6).floor() as i64;
        if i >= n_slots {
            return (-1, false);
        }
        (if mirror { n_slots - 1 - i } else { i }, (tt - i as f64 * slot_q).abs() < 1e-6)
    };

    let mut out: Vec<Element> = Vec::new();
    if show_ruler {
        let corner = "rule-corner";
        out.push(rsx! { div { key: "{corner}" } });
        for c in 0..cols {
            let beat = c % cpb == 0;
            let text = if beat { format!("{}", (c / cpb) % numer.max(1) + 1) } else { sub.get(c % cpb).copied().unwrap_or("\u{b7}").to_owned() };
            let cls = format!("uis-grd-sequencer-ruler{}", col_class(c, cpb, play_col));
            out.push(rsx! { div { key: "rule-{c}", class: "{cls}", "{text}" } });
        }
    }
    let mut covered: HashSet<(usize, usize)> = HashSet::new();
    let row_line = |i: usize| usize::from(show_ruler) + 1 + i;
    for (ri, row) in rows.iter().copied().enumerate() {
        let tip = if row == Tone::Rest { t("tipSeedRowAll") } else if row == Tone::Fifth { t("tipSeedRowFifth") } else { t("tipSeedRowDegree") };
        let label = row.text();
        out.push(rsx! { div { key: "lab-{ri}", class: "uis-grd-sequencer-rowlabel", title: "{tip}", "{label}" } });
        for c in 0..cols {
            if covered.contains(&(ri, c)) {
                continue;
            }
            let (s, first) = at(c);
            let cell = if s >= 0 { slots.get(s as usize) } else { None };
            let idx = cell.and_then(|cl| cl.notes.iter().position(|n| n.tone == row)).map_or(-1, |i| i as i32);
            let nt = if first && idx >= 0 { cell.map(|cl| cl.notes[idx as usize].clone()) } else { None };
            let is_sel = nt.is_some() && sel.is_some_and(|sl| sl.lane == lane && sl.slot as i64 == s && sl.idx as i32 == idx);
            let is_r = nt.is_some() && row == Tone::Rest;
            let block_rows = if is_r {
                let from = nt.as_ref().and_then(|n| n.from).unwrap_or(1);
                rows.iter().position(|r| *r == Tone::Deg(from)).map_or(1, |p| p.max(1))
            } else {
                0
            };
            if is_r {
                for k in 1..=block_rows {
                    covered.insert((k, c));
                }
            }
            let early = cell.is_some_and(|cl| cl.early);
            let cls = format!(
                "uis-grd-sequencer-cell{}{}{}{}{}",
                col_class(c, cpb, play_col),
                if nt.is_some() && !is_r { " hit" } else { "" },
                if is_r { " mark" } else { "" },
                if is_sel && !is_r { " selected" } else { "" },
                if s < 0 { " off" } else { "" }
            );
            let flags = if nt.is_some() && !is_r { nt.as_ref().map(|n| note_flags(n, early)) } else { None };
            let hit = move |idx: i32, refine: Option<Refine>, select_only: bool, row: Tone| CellHit { lane, slot: s as i32, row, idx, refine, select_only };
            let refine = Refine { step: (geom.cpb as f64) * geom.denom, slot: c, mirror };
            out.push(rsx! {
                button {
                    key: "c-{ri}-{c}",
                    r#type: "button",
                    class: "{cls}",
                    disabled: s < 0,
                    oncontextmenu: move |e| {
                        e.prevent_default();
                        if first {
                            on_cell.call(hit(idx, None, true, row));
                        }
                    },
                    onclick: move |e| {
                        if first {
                            let m = e.modifiers();
                            on_cell.call(hit(idx, None, m.ctrl() || m.meta(), row));
                        } else {
                            // between two slots: refine the lane to this column's resolution and place the note on it
                            on_cell.call(hit(-1, Some(refine), false, row));
                        }
                    },
                    if let Some(f) = flags {
                        span { class: "uis-grd-sequencer-flags", "{f}" }
                    }
                }
            });
            if is_r {
                let block_cls = format!("uis-grd-sequencer-cell hit{}{}", col_class(c, cpb, play_col), if is_sel { " selected" } else { "" });
                let style = format!("--uis-rows: {block_rows}; grid-column: {}; grid-row: {} / span {block_rows};", c + 2, row_line(1));
                let flags = nt.as_ref().map(|n| note_flags(n, early)).unwrap_or_default();
                let bid = format!("amsd-rb-{lane}-{c}");
                let bid2 = bid.clone();
                out.push(rsx! {
                    button {
                        key: "b-{ri}-{c}",
                        id: "{bid}",
                        r#type: "button",
                        class: "{block_cls}",
                        style: "{style}",
                        oncontextmenu: move |e| {
                            e.prevent_default();
                            on_cell.call(hit(idx, None, true, Tone::Rest));
                        },
                        onclick: move |e| {
                            let m = e.modifiers();
                            // Ctrl+click selects the block for the flags; a plain click moves its start to the row pressed
                            if m.ctrl() || m.meta() {
                                on_cell.call(hit(idx, None, true, Tone::Rest));
                                return;
                            }
                            let y = e.element_coordinates().y;
                            let target = bid2.clone();
                            let rows_all = grid_rows();
                            spawn(async move {
                                let h = document::eval(&format!("dioxus.send(document.getElementById('{target}').offsetHeight)"))
                                    .recv::<f64>()
                                    .await
                                    .unwrap_or(1.0)
                                    .max(1.0);
                                let k = 1 + ((block_rows - 1) as f64).min(((y / h) * block_rows as f64).floor()).max(0.0) as usize;
                                on_cell.call(hit(-1, None, false, rows_all[k]));
                            });
                        },
                        span { class: "uis-grd-sequencer-flags", "{flags}" }
                    }
                });
            }
        }
    }
    rsx! {
        div { class: "uis-grd-sequencer", style: "--uis-grd-sequencer-cols: {cols}", {out.into_iter()} }
    }
}

struct Item {
    sym: String,
    row: i64,
    c0: i64,
    span: i64,
    key: String,
}

/// The progression as a computed VIEW of the text, on the same axis. `transpose` renames the chords to the key they
/// SOUND in; the text above stays as typed.
#[component]
pub fn ChordStrip(progression: String, transpose: i32, geom: StackGeom, play_q: Option<f64>) -> Element {
    let lines = chord_rows(&progression);
    let (cols, col_q) = (geom.cols as i64, geom.col_q);
    let line_c = (geom.line_q / col_q).round() as i64;
    let reach_c = ((geom.reach_q / col_q).round() as i64).max(1);
    let rows = ((reach_c as f64 / cols as f64).ceil() as i64).max(1);
    let mut items: Vec<Item> = Vec::new();
    let mut labels: Vec<(i64, String)> = Vec::new();
    for (k, ln) in lines.iter().enumerate() {
        let t0 = k as i64 * line_c;
        let row0 = t0.div_euclid(cols);
        if !ln.section.is_empty() && !labels.iter().any(|(r, _)| *r == row0) {
            labels.push((row0, ln.section.clone()));
        }
        let mut used = 0.0;
        for (j, tok) in ln.toks.iter().enumerate() {
            let c = t0 + ((used * line_c as f64) / ln.total).round() as i64;
            used += tok.w;
            let next = t0 + ((used * line_c as f64) / ln.total).round() as i64;
            let row = c.div_euclid(cols);
            let c0 = c - row * cols;
            items.push(Item { sym: transpose_chord(&tok.sym, transpose), row, c0, span: 1.max((next - c).min(cols - c0)), key: format!("{k}.{j}") });
        }
    }
    let pc: i64 = match play_q {
        Some(q) => (((q / col_q) % reach_c as f64 + reach_c as f64) % reach_c as f64).floor() as i64,
        None => -1,
    };
    let (p_row, p_col) = (pc.div_euclid(cols), pc - pc.div_euclid(cols) * cols);
    let label_of = |r: i64| labels.iter().find(|(lr, _)| *lr == r).map(|(_, s)| format!("[{s}]")).unwrap_or_default();
    rsx! {
        div { class: "uis-grd-sequencer", style: "--uis-grd-sequencer-cols: {cols}",
            for r in 0..rows {
                div { key: "l{r}", class: "uis-grd-sequencer-rowlabel", style: "grid-row: {r + 1}; grid-column: 1;", "{label_of(r)}" }
            }
            for i in items.iter() {
                div {
                    key: "{i.key}",
                    class: if pc >= 0 && i.row == p_row && p_col >= i.c0 && p_col < i.c0 + i.span { "uis-grd-sequencer-span active" } else { "uis-grd-sequencer-span" },
                    style: "grid-row: {i.row + 1}; grid-column: {2 + i.c0} / span {i.span};",
                    "{i.sym}"
                }
            }
        }
    }
}

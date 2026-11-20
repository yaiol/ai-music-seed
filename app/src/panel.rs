//! The seed panel: the Electron app's `SeedPanel`, element for element (the Music and Render tabs of the active seed).
//! A controlled view: it reads the seed and writes back through `on_edit`; the file actions live in `main.rs`.

use crate::catalog::{UisCboCategory, UisCboFilter, UisComboItem, UisKnob, UisNum, UisPiano};
use crate::grid::{CellHit, ChordStrip, Sel, StepGrid};
use crate::i18n;
use crate::icons::{
    FAMILY_KEYS, FAMILY_PERCUSSION_TUNED, FAMILY_STRINGS_BOWED, FAMILY_STRINGS_PLUCKED, FAMILY_SYNTH, FAMILY_VOICES, FAMILY_WINDS_BRASS,
    FAMILY_WINDS_WOOD, FileIcon,
};
use crate::labels::{self, FLAG_GROUPS};
use crate::catalog::use_lbl_short_set;
use dioxus::prelude::*;
use dioxus_free_icons::{
    Icon,
    icons::ld_icons::{
        LdArrowLeftRight, LdArrowRightToLine, LdAudioWaveform, LdChevronDown, LdChevronLeft, LdChevronRight, LdChevronUp, LdEraser, LdMinus,
        LdMusic, LdPencil, LdPenLine, LdPlay, LdPlus, LdSlidersHorizontal, LdSquare, LdVolume2, LdVolumeX,
    },
};
use engine::chords::analyze_seed;
use engine::packs::{FAMILY_ORDER, InstrumentOption, Pack, instrument_options};
use engine::seed::{OUTPUT_TOKEN_NAMES, Seed, StackGeom, js_round, lane_cfg_json, lane_geom, lane_velocity_percent, line_count, requant_lane, stack_geom, swing_key};
use engine::slots::{
    Cell, LaneCfg, Note, Slots, Spec, Tone, bass_figures, beat_divisions, chord_figures, mp3_bitrates, num, parse_slots, room_keys, serialize_slots, signatures,
    spec_meter, spec_str, style_def, style_groups, swings, transpose_range,
};
use serde_json::{Value, json};
use std::collections::HashMap;

pub type Edit = Box<dyn FnOnce(&mut Seed)>;

const CUSTOM_FIGURE: &str = "__custom";

fn fmt_duration(s: f64) -> String {
    let total = js_round(s) as i64;
    format!("{}:{:02}", total.div_euclid(60), total.rem_euclid(60))
}

fn fmt_size(bytes: f64) -> String {
    if bytes >= 1024.0 * 1024.0 {
        format!("{:.1} MB", bytes / (1024.0 * 1024.0))
    } else if bytes >= 1024.0 {
        format!("{} KB", js_round(bytes / 1024.0))
    } else {
        format!("{} B", js_round(bytes))
    }
}

fn family_icon(family: &str) -> Option<&'static str> {
    match family {
        "Keys" => Some(FAMILY_KEYS),
        "Percussion (Tuned)" => Some(FAMILY_PERCUSSION_TUNED),
        "Strings (Plucked)" => Some(FAMILY_STRINGS_PLUCKED),
        "Strings (Bowed)" => Some(FAMILY_STRINGS_BOWED),
        "Synth" => Some(FAMILY_SYNTH),
        "Voices" => Some(FAMILY_VOICES),
        "Winds (Brass)" => Some(FAMILY_WINDS_BRASS),
        "Winds (Wood)" => Some(FAMILY_WINDS_WOOD),
        _ => None,
    }
}

fn option_for<'a>(options: &'a [InstrumentOption], value: &str) -> Option<&'a InstrumentOption> {
    options.iter().find(|o| o.value == value || o.variants.iter().any(|v| v.value == value))
}

/// Picking an instrument keeps the current articulation when it already belongs to it, otherwise lands on the first.
fn pick_value(o: &InstrumentOption, current: &str) -> String {
    if o.variants.iter().any(|v| v.value == current) {
        current.to_owned()
    } else {
        o.variants.first().map(|v| v.value.clone()).unwrap_or_else(|| o.value.clone())
    }
}

/// The rows of a picker: filtered, then laid out family by family with a header row opening each non-empty section.
fn instrument_rows(options: &[InstrumentOption], search: &str) -> Vec<(Option<InstrumentOption>, String)> {
    let q = search.trim().to_lowercase();
    let kept: Vec<&InstrumentOption> = options
        .iter()
        .filter(|o| q.is_empty() || o.label.to_lowercase().contains(&q) || o.group.to_lowercase().contains(&q) || o.family.to_lowercase().contains(&q))
        .collect();
    let mut rows = Vec::new();
    for family in FAMILY_ORDER {
        let mut in_family: Vec<&InstrumentOption> = kept.iter().copied().filter(|o| o.family == family).collect();
        in_family.sort_by(|a, b| a.label.to_lowercase().cmp(&b.label.to_lowercase()));
        if in_family.is_empty() {
            continue;
        }
        rows.push((None, family.to_owned()));
        rows.extend(in_family.into_iter().map(|o| (Some(o.clone()), o.family.clone())));
    }
    rows
}

fn lane_slots(spec: &Spec, lane: &str) -> Slots {
    parse_slots(&spec_str(spec, lane))
}

fn spec_with_lane(spec: &Spec, meter: f64, lane: &str, slots: &Slots) -> Spec {
    let mut next = spec.clone();
    next.insert("meter".into(), num(meter));
    next.insert(lane.into(), json!(serialize_slots(slots)));
    next
}

fn spec_with_cfg(spec: &Spec, lane: &str, cfg: &LaneCfg) -> Spec {
    let mut next = spec.clone();
    next.insert(format!("{lane}Lane"), lane_cfg_json(cfg));
    next
}

fn tone_value(t: Tone) -> Option<u8> {
    match t {
        Tone::Deg(n) => Some(n),
        _ => None,
    }
}

#[derive(Clone, Copy, PartialEq)]
enum Which {
    Treble,
    Bass,
}

#[component]
pub fn SeedPanel(
    lang: String,
    seed: Seed,
    busy: bool,
    busy_msg: String,
    playing: bool,
    packs: Vec<Pack>,
    lit_keys: HashMap<u32, String>,
    play_pos: Option<(i64, f64)>,
    tune_trim: f64,
    on_audition: EventHandler<u32>,
    on_tune_trim: EventHandler<f64>,
    on_edit: EventHandler<Edit>,
    on_render: EventHandler<()>,
    on_play: EventHandler<()>,
    on_reveal: EventHandler<String>,
) -> Element {
    let t = |key: &str| i18n::t(&lang, key);
    let edit = move |f: Edit| on_edit.call(f);

    let mut panel_tab = use_signal(|| "music");
    let mut inst_search = use_signal(String::new);
    let mut inst_open = use_signal(|| false);
    let mut inst_family = use_signal(String::new);
    let mut bass_search = use_signal(String::new);
    let mut bass_open = use_signal(|| false);
    let mut bass_family = use_signal(String::new);
    let mut sel: Signal<Option<Sel>> = use_signal(|| None);
    let mut chords_as_text = use_signal(|| false);
    let mut note_mode = use_signal(|| "edit");

    // the three grids move as one, and the stack's own scrollbar drives them: the page does it (see `SCROLL_JS`)
    use_hook(|| {
        let _ = document::eval(SCROLL_JS);
    });

    let tune = t("lblSeedKnobTune");
    let captions = use_lbl_short_set(
        vec![
            t("lblSeedKnobVel"),
            t("lblSeedKnobLen"),
            tune.clone(),
            t("lblSeedKnobOctave"),
            t("lblSeedKnobReverb"),
            t("lblSeedKnobVolume"),
            t("lblSeedKnobTranspose"),
        ],
        3,
    );
    let fulls = [t("lblSeedKnobVel"), t("lblSeedKnobLen"), tune, t("lblSeedKnobOctave"), t("lblSeedKnobReverb"), t("lblSeedKnobVolume"), t("lblSeedKnobTranspose")];
    // (the caption shown, the whole word as the tooltip) in the order above
    let cap = |i: usize| (captions.get(i).cloned().unwrap_or_default(), fulls[i].clone());

    let sine_label = t("optSeedInstrumentSine");
    let options = instrument_options(&packs, &sine_label);
    let families: Vec<&'static str> = FAMILY_ORDER.iter().copied().filter(|f| options.iter().any(|o| o.family == *f)).collect();
    let by_family = |family: &str| -> Vec<InstrumentOption> { options.iter().filter(|o| family.is_empty() || o.family == family).cloned().collect() };

    let spec = seed.spec();
    let meter = spec_meter(&spec);
    let lanes_cfg = [seed.lane_cfg("treble"), seed.lane_cfg("bass")];
    let slots_t = lane_slots(&spec, "treble");
    let slots_b = lane_slots(&spec, "bass");
    let geom: StackGeom = stack_geom(
        &seed.sig,
        &[(slots_t.len(), lanes_cfg[0]), (slots_b.len(), lanes_cfg[1])],
        seed.bars,
        line_count(&seed.progression),
        meter,
        seed.beat_division(),
    );

    let summary = analyze_seed(&seed.progression, seed.bpm, seed.bars, &seed.sig, seed.loops, seed.format == "mp3", seed.mp3_bitrate);
    let saved = seed.file_path.is_some();
    let style_d = style_def(&seed.style).or_else(|| style_def("pad")).cloned().unwrap_or(Value::Null);
    let transpose = js_round(seed.transpose) as i32;

    let treble_muted = seed.lanes == "bass" || seed.lanes == "none";
    let bass_muted = seed.lanes == "treble" || seed.lanes == "none";
    let set_mutes = move |tm: bool, bm: bool| {
        let v = if tm && bm { "none" } else if tm { "bass" } else if bm { "treble" } else { "both" };
        edit(Box::new(move |s: &mut Seed| s.lanes = v.to_owned()));
    };

    let selected_note: Option<(Note, Cell)> = sel().and_then(|sl| {
        let slots = if sl.lane == "treble" { &slots_t } else { &slots_b };
        let cell = slots.get(sl.slot)?;
        let nt = cell.notes.get(sl.idx)?;
        Some((nt.clone(), cell.clone()))
    });
    // the selection is a VIEW of the working copy: a new style, or a copy that no longer holds the note, drops it
    if sel().is_some() && selected_note.is_none() {
        sel.set(None);
    }

    let play_col_for = |cfg: &LaneCfg, n: usize| -> i64 {
        match play_pos {
            None => -1,
            Some((_, q)) => {
                let pq = lane_geom(n, cfg, meter, geom.bar_q).pattern_q;
                ((((q % pq) + pq) % pq) / geom.col_q).floor() as i64
            }
        }
    };

    // The working copy the handlers below rewrite, held where a handler can reach it and stay Copy.
    let mut spec_sig = use_signal(|| spec.clone());
    if *spec_sig.peek() != spec {
        spec_sig.set(spec.clone());
    }
    // ── writing the working copy ────────────────────────────────────────────────────────────────────
    let write_spec = move |next: Spec| edit(Box::new(move |s: &mut Seed| s.pattern = Some(next)));
    // Editing a lane's STEPS stamps the seed's meter on the working copy: the lane is authored in this meter now.
    let edit_lane = {
        let bar_q = geom.bar_q;
        move |lane: &'static str, f: &dyn Fn(&mut Slots)| {
            let spec = spec_sig.peek().clone();
            let mut slots = lane_slots(&spec, lane);
            f(&mut slots);
            write_spec(spec_with_lane(&spec, bar_q, lane, &slots));
        }
    };
    let set_lane_cfg = {
        move |lane: &'static str, patch: &dyn Fn(&mut LaneCfg)| {
            let spec = spec_sig.peek().clone();
            let i = usize::from(lane == "bass");
            let mut cfg = lanes_cfg[i];
            patch(&mut cfg);
            write_spec(spec_with_cfg(&spec, lane, &cfg));
        }
    };
    let set_division = {
        let bar_q = geom.bar_q;
        let denom = geom.denom;
        move |div: u32| {
            let spec = spec_sig.peek().clone();
            let step = f64::from(div) * denom;
            let mut next = spec.clone();
            next.insert("meter".into(), num(bar_q));
            let mut any = false;
            for (i, lane) in ["treble", "bass"].into_iter().enumerate() {
                if lanes_cfg[i].step != step {
                    let mut cfg = lanes_cfg[i];
                    cfg.step = step;
                    next.insert(format!("{lane}Lane"), lane_cfg_json(&cfg));
                    any = true;
                }
            }
            if any {
                write_spec(next);
            }
        }
    };

    // A cell click: SETTINGS mode and Ctrl+click / right-click select; EDIT places and removes (a cell is a toggle).
    let on_cell = {
        let (bar_q, cpb_geom) = (geom.bar_q, geom);
        move |hit: CellHit| {
            let spec = spec_sig.peek().clone();
            let lane = hit.lane;
            let i_lane = usize::from(lane == "bass");
            let slots = lane_slots(&spec, lane);
            let slot = hit.slot;
            if hit.select_only || note_mode() == "settings" {
                let Some(cell) = (slot >= 0).then(|| slots.get(slot as usize)).flatten() else { return };
                let mut i = if hit.idx >= 0 { hit.idx } else { cell.notes.iter().position(|n| n.tone == hit.row).map_or(-1, |p| p as i32) };
                if i < 0 {
                    i = cell.notes.iter().position(|n| n.tone == Tone::Rest).map_or(-1, |p| p as i32);
                }
                if i >= 0 {
                    sel.set(Some(Sel { lane, slot: slot as usize, idx: i as usize }));
                }
                return;
            }
            // a degree row in a column that holds an `r`: the block STARTS there
            if hit.refine.is_none() && hit.idx < 0 {
                if let Some(deg) = tone_value(hit.row) {
                    let cell = (slot >= 0).then(|| slots.get(slot as usize)).flatten();
                    let ri = cell.and_then(|c| c.notes.iter().position(|n| n.tone == Tone::Rest));
                    if let Some(ri) = ri {
                        let mut s2 = slots.clone();
                        let r = &mut s2[slot as usize].notes[ri];
                        r.from = if deg > 1 { Some(deg) } else { None };
                        write_spec(spec_with_lane(&spec, bar_q, lane, &s2));
                        sel.set(Some(Sel { lane, slot: slot as usize, idx: ri }));
                        return;
                    }
                }
            }
            if let Some(refine) = hit.refine {
                let Some(mut s2) = requant_lane(&slots, lanes_cfg[i_lane].step, refine.step) else { return };
                let at = if refine.mirror { s2.len() as i64 - 1 - refine.slot as i64 } else { refine.slot as i64 };
                let Some(cell) = (at >= 0).then(|| s2.get_mut(at as usize)).flatten() else { return };
                let idx = cell.notes.len();
                cell.notes.push(Note::new(hit.row));
                let mut cfg = lanes_cfg[i_lane];
                cfg.step = refine.step;
                let mut next = spec_with_lane(&spec, bar_q, lane, &s2);
                next.insert(format!("{lane}Lane"), lane_cfg_json(&cfg));
                write_spec(next);
                sel.set(Some(Sel { lane, slot: at as usize, idx }));
                return;
            }
            let _ = cpb_geom;
            if slot < 0 {
                return;
            }
            let slot = slot as usize;
            if hit.idx < 0 {
                let at = slots.get(slot).map_or(0, |c| c.notes.len());
                let mut s2 = slots.clone();
                if let Some(c) = s2.get_mut(slot) {
                    c.notes.push(Note::new(hit.row));
                }
                write_spec(spec_with_lane(&spec, bar_q, lane, &s2));
                sel.set(Some(Sel { lane, slot, idx: at }));
                return;
            }
            let mut s2 = slots.clone();
            if let Some(c) = s2.get_mut(slot) {
                if (hit.idx as usize) < c.notes.len() {
                    c.notes.remove(hit.idx as usize);
                }
            }
            write_spec(spec_with_lane(&spec, bar_q, lane, &s2));
            sel.set(None);
        }
    };

    // The flags mutate the selected note (or, for the push, its slot).
    let apply_flag = {
        let edit_lane = edit_lane.clone();
        move |key: &'static str| {
            let Some(sl) = sel() else { return };
            let key = key.to_owned();
            edit_lane(sl.lane, &move |slots: &mut Slots| {
                let Some(cell) = slots.get_mut(sl.slot) else { return };
                if sl.idx >= cell.notes.len() {
                    return;
                }
                let clamp = |v: i32| v.clamp(-2, 2);
                match key.as_str() {
                    "Early" => cell.early = !cell.early,
                    k => {
                        let nt = &mut cell.notes[sl.idx];
                        match k {
                            "OctUp" => nt.oct = clamp(nt.oct + 1),
                            "OctDown" => nt.oct = clamp(nt.oct - 1),
                            "ScaleUp" => nt.scale = clamp(nt.scale + 1),
                            "ScaleDown" => nt.scale = clamp(nt.scale - 1),
                            "Accent" => {
                                nt.acc = !nt.acc;
                                if nt.acc {
                                    nt.ghost = false;
                                }
                            }
                            "Ghost" => {
                                nt.ghost = !nt.ghost;
                                if nt.ghost {
                                    nt.acc = false;
                                }
                            }
                            "Sustain" => {
                                nt.sus = !nt.sus;
                                if nt.sus {
                                    nt.stac = false;
                                }
                            }
                            "Staccato" => {
                                nt.stac = !nt.stac;
                                if nt.stac {
                                    nt.sus = false;
                                }
                            }
                            "Last" => nt.cond = if nt.cond == Some(engine::slots::Cond::Last) { None } else { Some(engine::slots::Cond::Last) },
                            "NotLast" => nt.cond = if nt.cond == Some(engine::slots::Cond::NotLast) { None } else { Some(engine::slots::Cond::NotLast) },
                            _ => {}
                        }
                    }
                }
            });
        }
    };

    // The lane's rewrite actions: one-shot rewrites that leave the result on the grid, editable.
    let lane_action = {
        let edit_lane = edit_lane.clone();
        move |lane: &'static str, what: &'static str| {
            edit_lane(lane, &move |slots: &mut Slots| match what {
                "left" if slots.len() > 1 => slots.rotate_left(1),
                "right" if slots.len() > 1 => slots.rotate_right(1),
                "clear" => {
                    for c in slots.iter_mut() {
                        *c = Cell::default();
                    }
                }
                "add" => slots.push(Cell::default()),
                "remove" if slots.len() > 1 => {
                    slots.pop();
                }
                _ => {}
            });
        }
    };

    // ── one lane block ──────────────────────────────────────────────────────────────────────────────
    let render_lane = |which: Which| -> Element {
        let is_t = which == Which::Treble;
        let lane: &'static str = if is_t { "treble" } else { "bass" };
        let cfg = lanes_cfg[usize::from(!is_t)];
        let slots = if is_t { slots_t.clone() } else { slots_b.clone() };
        let n_slots = slots.len();
        let styled_fig = style_d.get(if is_t { "chord" } else { "bass" }).and_then(Value::as_str).unwrap_or("").to_owned();
        let own_fig = if is_t { seed.chord_figure.clone() } else { seed.bass_figure.clone() };
        let fig_key = if own_fig.is_empty() { styled_fig } else { own_fig };
        let figures = if is_t { chord_figures() } else { bass_figures() };
        let muted = if is_t { treble_muted } else { bass_muted };
        let instrument = if is_t { seed.treble_instrument.clone() } else { seed.bass_instrument.clone() };
        let family = if is_t { inst_family() } else { bass_family() };
        let search = if is_t { inst_search() } else { bass_search() };
        let open = if is_t { inst_open() } else { bass_open() };
        let list: Vec<InstrumentOption> = by_family(&family).into_iter().filter(|o| !is_t || o.role != "bass").collect();
        let inst_at = list.iter().position(|o| o.value == instrument || o.variants.iter().any(|v| v.value == instrument));
        let rows = instrument_rows(&list, &search);
        let items: Vec<UisComboItem> = rows
            .iter()
            .map(|(o, hdr)| match o {
                None => UisComboItem { key: format!("h-{hdr}"), label: hdr.clone(), active: false, header: true },
                Some(o) => UisComboItem {
                    key: o.value.clone(),
                    label: o.label.clone(),
                    active: o.value == instrument || o.variants.iter().any(|v| v.value == instrument),
                    header: false,
                },
            })
            .collect();
        let rows_for_pick: Vec<Option<InstrumentOption>> = rows.iter().map(|(o, _)| o.clone()).collect();
        let rows_for_render = rows_for_pick.clone();
        let shown_label = if open {
            search.clone()
        } else if instrument.is_empty() {
            t("optSeedBassInstrumentSame")
        } else {
            option_for(&options, &instrument).map(|o| o.label.clone()).unwrap_or_else(|| instrument.clone())
        };
        let variants: Vec<(String, String, String)> = option_for(&options, &instrument)
            .map(|o| o.variants.iter().map(|v| (v.value.clone(), v.label.clone(), v.abbr.clone())).collect())
            .unwrap_or_default();
        let categories: Vec<UisCboCategory> = families
            .iter()
            .map(|f| UisCboCategory {
                id: (*f).to_owned(),
                title: (*f).to_owned(),
                icon: family_icon(f).map(|svg| rsx! { FileIcon { svg, size: 14 } }),
            })
            .collect();
        let set_inst = move |v: String| {
            edit(Box::new(move |s: &mut Seed| {
                if is_t {
                    s.treble_instrument = v;
                } else {
                    s.bass_instrument = v;
                }
            }))
        };
        let step_inst = {
            let list = list.clone();
            let instrument = instrument.clone();
            move |dir: i64| {
                if let Some(at) = inst_at {
                    if let Some(o) = list.get((at as i64 + dir) as usize).filter(|_| at as i64 + dir >= 0) {
                        set_inst(pick_value(o, &instrument));
                    }
                }
            }
        };
        let pick_family = {
            let list_all = options.clone();
            let instrument = instrument.clone();
            move |fam: String| {
                let first = list_all.iter().filter(|o| (fam.is_empty() || o.family == fam) && (!is_t || o.role != "bass")).next();
                if !fam.is_empty() {
                    if let Some(first) = first {
                        set_inst(pick_value(first, &instrument));
                    }
                }
            }
        };
        let (c_vel, c_len, c_tune, c_oct, c_rev, c_vol) = (cap(0), cap(1), cap(2), cap(3), cap(4), cap(5));
        let vel_pct = lane_velocity_percent(&cfg);
        let mirror = if is_t { seed.treble_mirror } else { seed.bass_mirror };
        let play_col = play_col_for(&cfg, n_slots);
        let cls_block = format!("amsr-seed-lane-block amsr-{lane}");
        let lane_name = if is_t { t("lblSeedInstrument") } else { t("lblSeedBassInstrument") };
        let figure_value = if seed.pattern.is_some() || fig_key.is_empty() { CUSTOM_FIGURE.to_owned() } else { fig_key.clone() };
        let show_custom = seed.pattern.is_some() || fig_key.is_empty();
        let pattern_set = seed.pattern.is_some();
        let _ = pattern_set;
        let lane_len = n_slots;
        let hold = cfg.hold;
        let reverb_none = seed.reverb == "none";
        let (oct_v, rev_v, vol_v) = if is_t {
            (seed.treble_octave, seed.treble_reverb, seed.treble_volume)
        } else {
            (seed.bass_octave, seed.bass_reverb, seed.bass_volume)
        };
        let slot_count = lane_len;
        rsx! {
            div { class: "{cls_block}",
                div { class: "amsr-seed-block",
                    div { class: "amsr-seed-band",
                        select {
                            class: "uis-ddn-std amsr-seed-figure",
                            onchange: move |e| {
                                let v = e.value();
                                edit(Box::new(move |s: &mut Seed| {
                                    if is_t { s.chord_figure = v } else { s.bass_figure = v }
                                    s.pattern = None;
                                }));
                            },
                            if show_custom {
                                option { value: "{CUSTOM_FIGURE}", selected: figure_value == CUSTOM_FIGURE, {t("optSeedStyleCustom")} }
                            }
                            for (k, f) in figures.iter() {
                                option { key: "{k}", value: "{k}", selected: *k == figure_value, "{f.name}" }
                            }
                        }
                        UisKnob {
                            inline: true,
                            arc: true,
                            label: c_vel.0.clone(),
                            title: c_vel.1.clone(),
                            min: 0.0,
                            max: 100.0,
                            step: 5.0,
                            unit: "%",
                            value: vel_pct,
                            on_change: move |v: f64| set_lane_cfg(lane, &|c: &mut LaneCfg| c.vel = v / 100.0),
                        }
                        UisKnob {
                            inline: true,
                            arc: true,
                            label: c_len.0.clone(),
                            title: c_len.1.clone(),
                            min: 1.0,
                            max: 16.0,
                            step: 1.0,
                            value: cfg.len,
                            on_change: move |v: f64| set_lane_cfg(lane, &|c: &mut LaneCfg| c.len = v),
                        }
                        button {
                            r#type: "button",
                            class: if hold { "uis-btn ico active" } else { "uis-btn ico" },
                            title: t("btnSeedHold"),
                            onclick: move |_| set_lane_cfg(lane, &|c: &mut LaneCfg| c.hold = !c.hold),
                            Icon { width: 14, height: 14, icon: LdArrowRightToLine }
                        }
                        button {
                            r#type: "button",
                            class: "uis-btn ico",
                            title: if muted { t("tipSeedUnmute") } else { t("tipSeedMute") },
                            onclick: move |_| if is_t { set_mutes(!treble_muted, bass_muted) } else { set_mutes(treble_muted, !bass_muted) },
                            if muted {
                                Icon { width: 14, height: 14, icon: LdVolumeX }
                            } else {
                                Icon { width: 14, height: 14, icon: LdVolume2 }
                            }
                        }
                        UisCboFilter {
                            weld: true,
                            class: "amsr-seed-picker-weld",
                            id: if is_t { "amsr-family-treble" } else { "amsr-family-bass" },
                            all_label: t("optSeedInstrumentFamilyAll"),
                            categories,
                            category: family.clone(),
                            on_category: move |f: String| {
                                if is_t { inst_family.set(f.clone()) } else { bass_family.set(f.clone()) }
                                pick_family(f);
                            },
                            after: Some(rsx! {
                                button {
                                    r#type: "button",
                                    class: "uis-btn ico",
                                    title: t("tipSeedInstrumentPrev"),
                                    disabled: inst_at.is_none_or(|a| a == 0),
                                    onclick: {
                                        let step_inst = step_inst.clone();
                                        move |_| step_inst(-1)
                                    },
                                    Icon { width: 14, height: 14, icon: LdChevronUp }
                                }
                                button {
                                    r#type: "button",
                                    class: "uis-btn ico",
                                    title: t("tipSeedInstrumentNext"),
                                    disabled: inst_at.is_none_or(|a| a + 1 >= list.len()),
                                    onclick: {
                                        let step_inst = step_inst.clone();
                                        move |_| step_inst(1)
                                    },
                                    Icon { width: 14, height: 14, icon: LdChevronDown }
                                }
                            }),
                            placeholder: t("plhSeedInstrumentFilter"),
                            value: shown_label,
                            on_change: move |v: String| if is_t { inst_search.set(v) } else { bass_search.set(v) },
                            on_focus: move |_| if is_t { inst_search.set(String::new()) } else { bass_search.set(String::new()) },
                            on_open_change: move |o: bool| if is_t { inst_open.set(o) } else { bass_open.set(o) },
                            items,
                            on_pick: {
                                let instrument = instrument.clone();
                                move |i: usize| {
                                    if let Some(Some(o)) = rows_for_pick.get(i) {
                                        set_inst(pick_value(o, &instrument));
                                        if is_t { inst_search.set(String::new()) } else { bass_search.set(String::new()) }
                                    }
                                }
                            },
                            render_item: Callback::new(move |i: usize| {
                                let (label, group) = match rows_for_render.get(i) {
                                    Some(Some(o)) => (o.label.clone(), o.group.clone()),
                                    _ => (String::new(), String::new()),
                                };
                                rsx! { "{label} " span { class: "uis-pop-dim", "{group}" } }
                            }),
                            render_header: if is_t {
                                None
                            } else {
                                Some(Callback::new({
                                    let same = instrument.is_empty();
                                    let lang = lang.clone();
                                    move |close: Callback<()>| {
                                        rsx! {
                                            button {
                                                r#type: "button",
                                                class: if same { "uis-pop-item active" } else { "uis-pop-item" },
                                                onmousedown: move |e| {
                                                    e.prevent_default();
                                                    edit(Box::new(|s: &mut Seed| s.bass_instrument = String::new()));
                                                    bass_search.set(String::new());
                                                    close.call(());
                                                },
                                                {i18n::t(&lang, "optSeedBassInstrumentSame")}
                                            }
                                        }
                                    }
                                }))
                            },
                        }
                        div { class: "amsr-seed-artics",
                            if !instrument.is_empty() && variants.len() > 1 {
                                for (value , label , abbr) in variants.iter().cloned() {
                                    button {
                                        key: "{value}",
                                        r#type: "button",
                                        title: "{label}",
                                        class: if value == instrument { "uis-btn small uis-opt active" } else { "uis-btn small uis-opt" },
                                        onclick: {
                                            let value = value.clone();
                                            move |_| set_inst(value.clone())
                                        },
                                        "{abbr}"
                                    }
                                }
                            }
                        }
                        if is_t {
                            UisKnob {
                                inline: true,
                                label: c_tune.0.clone(),
                                title: c_tune.1.clone(),
                                min: -50.0,
                                max: 50.0,
                                step: 1.0,
                                unit: "\u{a2}",
                                value: tune_trim,
                                on_change: move |v: f64| on_tune_trim.call(v),
                            }
                        }
                        UisKnob {
                            inline: true,
                            label: c_oct.0.clone(),
                            title: c_oct.1.clone(),
                            min: -1.0,
                            max: 1.0,
                            step: 1.0,
                            value: oct_v,
                            on_change: move |v: f64| edit(Box::new(move |s: &mut Seed| if is_t { s.treble_octave = v } else { s.bass_octave = v })),
                        }
                        UisKnob {
                            inline: true,
                            arc: true,
                            label: c_rev.0.clone(),
                            title: c_rev.1.clone(),
                            min: 0.0,
                            max: 100.0,
                            step: 5.0,
                            unit: "%",
                            disabled: reverb_none,
                            value: rev_v,
                            on_change: move |v: f64| edit(Box::new(move |s: &mut Seed| if is_t { s.treble_reverb = v } else { s.bass_reverb = v })),
                        }
                        UisKnob {
                            inline: true,
                            arc: true,
                            label: c_vol.0.clone(),
                            title: c_vol.1.clone(),
                            min: 0.0,
                            max: 100.0,
                            step: 5.0,
                            unit: "%",
                            value: vol_v,
                            on_change: move |v: f64| edit(Box::new(move |s: &mut Seed| if is_t { s.treble_volume = v } else { s.bass_volume = v })),
                        }
                        span { class: "amsr-seed-lane-name", "{lane_name}" }
                    }
                    div { class: "amsr-seed-gridwrap",
                        div { class: "amsr-seed-gridscroll", "data-gs": if is_t { "0" } else { "1" },
                            StepGrid {
                                lang: lang.clone(),
                                lane,
                                slots,
                                cfg,
                                meter,
                                geom,
                                sel: sel(),
                                show_ruler: is_t,
                                play_col,
                                mirror,
                                on_cell: EventHandler::new(on_cell.clone()),
                            }
                        }
                        div { class: "amsr-seed-strip",
                            button {
                                r#type: "button",
                                title: t("tipSeedLaneMirror"),
                                class: if mirror { "uis-btn ico small active" } else { "uis-btn ico small" },
                                onclick: move |_| edit(Box::new(move |s: &mut Seed| if is_t { s.treble_mirror = !s.treble_mirror } else { s.bass_mirror = !s.bass_mirror })),
                                Icon { width: 14, height: 14, icon: LdArrowLeftRight }
                            }
                            button {
                                r#type: "button",
                                class: "uis-btn ico small",
                                title: t("tipSeedLaneClear"),
                                onclick: move |_| lane_action(lane, "clear"),
                                Icon { width: 14, height: 14, icon: LdEraser }
                            }
                            button {
                                r#type: "button",
                                class: "uis-btn ico small",
                                title: t("tipSeedLaneShiftLeft"),
                                onclick: move |_| lane_action(lane, "left"),
                                Icon { width: 14, height: 14, icon: LdChevronLeft }
                            }
                            button {
                                r#type: "button",
                                class: "uis-btn ico small",
                                title: t("tipSeedLaneShiftRight"),
                                onclick: move |_| lane_action(lane, "right"),
                                Icon { width: 14, height: 14, icon: LdChevronRight }
                            }
                            button {
                                r#type: "button",
                                class: "uis-btn ico small",
                                title: t("tipSeedLaneAddStep"),
                                onclick: move |_| lane_action(lane, "add"),
                                Icon { width: 14, height: 14, icon: LdPlus }
                            }
                            button {
                                r#type: "button",
                                class: "uis-btn ico small",
                                title: t("tipSeedLaneRemoveStep"),
                                disabled: lane_len <= 1,
                                onclick: move |_| lane_action(lane, "remove"),
                                Icon { width: 14, height: 14, icon: LdMinus }
                            }
                            span { class: "amsr-seed-count amsr-seed-count-span mono", title: t("tipSeedSlots"), "{slot_count}" }
                        }
                    }
                }
            }
        }
    };

    // ── the page ────────────────────────────────────────────────────────────────────────────────────
    let t_ref: &dyn Fn(&str) -> String = &t;
    let style_value = if seed.pattern.is_some() || !seed.chord_figure.is_empty() || !seed.bass_figure.is_empty() { CUSTOM_FIGURE.to_owned() } else { seed.style.clone() };
    let style_custom = style_value == CUSTOM_FIGURE;
    let sig_groups = signatures();
    let sig_known = sig_groups.iter().any(|(_, sigs)| sigs.contains(&seed.sig.as_str()));
    let swing_k = swing_key(seed.swing);
    let swing_list = swings();
    let div_known = beat_divisions().contains(&geom.cpb);
    let tab = panel_tab();
    let (tr_min, tr_max) = transpose_range();
    let sig_current = seed.sig.clone();
    let progression = seed.progression.clone();
    let play_q = play_pos.map(|(_, q)| q);
    let (cap_transpose_l, _) = cap(6);
    let reverb_current = seed.reverb.clone();
    let play_blocked = busy || summary.count == 0 || summary.sig_bad || !summary.invalid.is_empty();
    let render_blocked = busy || !saved || summary.count == 0 || summary.sig_bad || !summary.invalid.is_empty();
    let invalid_text = summary.invalid.join(" ");
    let output_hint = format!("{} {}", t("hntSeedOutput"), OUTPUT_TOKEN_NAMES.iter().map(|k| format!("{{{k}}}")).collect::<Vec<_>>().join(", "));

    rsx! {
        div { class: "amsr-seed-panel uis-dlg-form",
            div { class: "uis-tab-set vertical",
                button {
                    r#type: "button",
                    class: if tab == "music" { "uis-tab active" } else { "uis-tab " },
                    onclick: move |_| panel_tab.set("music"),
                    {t("tabSeedMusic")}
                }
                button {
                    r#type: "button",
                    class: if tab == "render" { "uis-tab active" } else { "uis-tab " },
                    onclick: move |_| panel_tab.set("render"),
                    {t("tabSeedRender")}
                }
            }
            div { class: "amsr-seed-col amsr-seed-col-rest",
                if tab == "music" {
                    div { class: "amsr-seed-music",
                        UisPiano { lit: lit_keys.clone(), on_play: move |m: u32| on_audition.call(m) }
                        div { class: "amsr-seed-toprow",
                            div { class: "amsr-seed-field",
                                label { class: "uis-fld-labelled-label", {t("lblSeedBpm")} }
                                UisNum {
                                    min: 20.0,
                                    max: 300.0,
                                    step: 1.0,
                                    width: "76px",
                                    value: Some(seed.bpm),
                                    on_change: move |v: Option<f64>| if let Some(v) = v { edit(Box::new(move |s: &mut Seed| s.bpm = v)) },
                                }
                            }
                            div { class: "amsr-seed-field",
                                label { class: "uis-fld-labelled-label", {t("lblSeedStyle")} }
                                select {
                                    class: "uis-ddn-std",
                                    style: "width: 150px",
                                    onchange: move |e| {
                                        let v = e.value();
                                        edit(Box::new(move |s: &mut Seed| {
                                            s.style = v;
                                            s.chord_figure = String::new();
                                            s.bass_figure = String::new();
                                            s.pattern = None;
                                        }));
                                    },
                                    if style_custom {
                                        option { value: "{CUSTOM_FIGURE}", selected: true, {t("optSeedStyleCustom")} }
                                    }
                                    for (gk , styles) in style_groups() {
                                        optgroup { key: "{gk}", label: labels::style_group(t_ref, gk),
                                            for k in styles {
                                                option { key: "{k}", value: "{k}", selected: !style_custom && style_value == k, {labels::style(t_ref, k)} }
                                            }
                                        }
                                    }
                                }
                            }
                            div { class: "amsr-seed-field",
                                label { class: "uis-fld-labelled-label", {t("lblSeedSig")} }
                                select {
                                    class: "uis-ddn-std",
                                    onchange: move |e| {
                                        let v = e.value();
                                        edit(Box::new(move |s: &mut Seed| s.sig = v));
                                    },
                                    if !sig_known {
                                        option { value: "{sig_current}", selected: true, "{sig_current}" }
                                    }
                                    for (gk , sigs) in sig_groups.iter() {
                                        optgroup { key: "{gk}", label: labels::sig_group(t_ref, gk),
                                            for x in sigs.iter() {
                                                option { key: "{x}", value: "{x}", selected: *x == sig_current, "{x}" }
                                            }
                                        }
                                    }
                                }
                            }
                            div { class: "amsr-seed-field",
                                label { class: "uis-fld-labelled-label", {t("lblSeedBeatDiv")} }
                                select {
                                    class: "uis-ddn-std",
                                    title: t("tipSeedBeatDiv"),
                                    onchange: move |e| {
                                        if let Ok(d) = e.value().parse::<u32>() {
                                            set_division(d);
                                        }
                                    },
                                    if !div_known {
                                        option { value: "{geom.cpb}", selected: true, "B/{geom.cpb}" }
                                    }
                                    for d in beat_divisions().iter().copied() {
                                        option { key: "{d}", value: "{d}", selected: d == geom.cpb, "B/{d}" }
                                    }
                                }
                            }
                            div { class: "amsr-seed-field",
                                label { class: "uis-fld-labelled-label", {t("lblSeedSwing")} }
                                select {
                                    class: "uis-ddn-std",
                                    onchange: move |e| {
                                        let k = e.value();
                                        let v = swings().iter().find(|(key, _)| *key == k).map_or(0.0, |(_, v)| *v);
                                        edit(Box::new(move |s: &mut Seed| s.swing = v));
                                    },
                                    if swing_k == "custom" {
                                        option { value: "custom", selected: true, "{seed.swing:.2}" }
                                    }
                                    for (k , _) in swing_list.iter() {
                                        option { key: "{k}", value: "{k}", selected: swing_k == *k, {labels::swing(t_ref, k)} }
                                    }
                                }
                            }
                            div { class: "uis-barh-sep" }
                            div { class: "amsr-seed-field",
                                label { class: "uis-fld-labelled-label", {t("lblSeedReverb")} }
                                select {
                                    class: "uis-ddn-std",
                                    style: "width: 140px",
                                    onchange: move |e| {
                                        let v = e.value();
                                        edit(Box::new(move |s: &mut Seed| s.reverb = v));
                                    },
                                    for k in room_keys() {
                                        option { key: "{k}", value: "{k}", selected: reverb_current == k, {labels::reverb(t_ref, k)} }
                                    }
                                }
                            }
                            div { class: "amsr-seed-field",
                                label { class: "uis-fld-labelled-label", {t("lblSeedHighpass")} }
                                UisNum {
                                    min: 0.0,
                                    max: 2000.0,
                                    step: 10.0,
                                    width: "96px",
                                    value: Some(seed.highpass),
                                    on_change: move |v: Option<f64>| if let Some(v) = v { edit(Box::new(move |s: &mut Seed| s.highpass = v)) },
                                }
                            }
                            div { class: "amsr-seed-field",
                                label { class: "uis-fld-labelled-label", {t("lblSeedLowpass")} }
                                UisNum {
                                    min: 0.0,
                                    max: 20000.0,
                                    step: 500.0,
                                    width: "96px",
                                    value: Some(seed.lowpass),
                                    on_change: move |v: Option<f64>| if let Some(v) = v { edit(Box::new(move |s: &mut Seed| s.lowpass = v)) },
                                }
                            }
                            button { class: "uis-btn", disabled: play_blocked, onclick: move |_| on_play.call(()),
                                if playing {
                                    Icon { width: 14, height: 14, icon: LdSquare }
                                } else {
                                    Icon { width: 14, height: 14, icon: LdPlay }
                                }
                                {if playing { t("btnSeedStop") } else { t("btnSeedPlay") }}
                            }
                        }
                        div { class: "amsr-seed-stackrow",
                            div { class: "amsr-seed-flagcol",
                                div { class: "amsr-seed-flaggroup",
                                    span { class: "amsr-seed-flaglabel", {t("lblSeedMode")} }
                                    div { class: "amsr-seed-flagrow",
                                        button {
                                            r#type: "button",
                                            class: if note_mode() == "edit" { "uis-btn ico small active" } else { "uis-btn ico small" },
                                            title: t("tipSeedModeEdit"),
                                            onclick: move |_| note_mode.set("edit"),
                                            Icon { width: 14, height: 14, icon: LdPenLine }
                                        }
                                        button {
                                            r#type: "button",
                                            class: if note_mode() == "settings" { "uis-btn ico small active" } else { "uis-btn ico small" },
                                            title: t("tipSeedModeSettings"),
                                            onclick: move |_| note_mode.set("settings"),
                                            Icon { width: 14, height: 14, icon: LdSlidersHorizontal }
                                        }
                                    }
                                }
                                for (gk , flags) in FLAG_GROUPS {
                                    div { key: "{gk}", class: "amsr-seed-flaggroup",
                                        span { class: "amsr-seed-flaglabel", {labels::flag_group(t_ref, gk)} }
                                        div { class: "amsr-seed-flagrow",
                                            for (fk , glyph) in flags.iter().copied() {
                                                button {
                                                    key: "{fk}",
                                                    r#type: "button",
                                                    class: if selected_note.as_ref().is_some_and(|(n, c)| flag_on(fk, n, c)) { "uis-btn ico small active" } else { "uis-btn ico small" },
                                                    disabled: selected_note.is_none(),
                                                    title: labels::flag_tip(t_ref, fk),
                                                    onclick: move |_| apply_flag(fk),
                                                    "{glyph}"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            div { class: "amsr-seed-stack",
                                {render_lane(Which::Treble)}
                                {render_lane(Which::Bass)}
                                div { class: "amsr-seed-prog",
                                    div { class: "amsr-seed-block",
                                        div { class: "amsr-seed-band",
                                            UisKnob {
                                                inline: true,
                                                label: cap_transpose_l.clone(),
                                                title: t("tipSeedTranspose"),
                                                min: f64::from(tr_min),
                                                max: f64::from(tr_max),
                                                step: 1.0,
                                                value: f64::from(transpose),
                                                on_change: move |v: f64| edit(Box::new(move |s: &mut Seed| s.transpose = v)),
                                            }
                                            span { class: "amsr-seed-lane-name", {t("lblSeedChords")} }
                                        }
                                        div { class: "amsr-seed-gridwrap",
                                            if chords_as_text() {
                                                textarea {
                                                    class: "uis-txt-area mono amsr-seed-chordtext",
                                                    autofocus: true,
                                                    value: "{progression}",
                                                    placeholder: t("plhSeedProgression"),
                                                    oninput: move |e| {
                                                        let v = e.value();
                                                        edit(Box::new(move |s: &mut Seed| s.progression = v));
                                                    },
                                                    onkeydown: move |e| {
                                                        let m = e.modifiers();
                                                        if (e.key() == Key::Enter && (m.ctrl() || m.meta())) || e.key() == Key::Escape {
                                                            e.prevent_default();
                                                            chords_as_text.set(false);
                                                        }
                                                    },
                                                }
                                            } else {
                                                div { class: "amsr-seed-gridscroll", "data-gs": "2",
                                                    ChordStrip { progression: progression.clone(), transpose, geom, play_q }
                                                }
                                            }
                                            div { class: "amsr-seed-strip",
                                                button {
                                                    r#type: "button",
                                                    class: if chords_as_text() { "uis-btn ico small amsr-seed-strip-edit active" } else { "uis-btn ico small amsr-seed-strip-edit" },
                                                    title: t("tipSeedChordsEdit"),
                                                    onclick: move |_| chords_as_text.toggle(),
                                                    Icon { width: 14, height: 14, icon: LdPencil }
                                                }
                                                button {
                                                    r#type: "button",
                                                    class: "uis-btn ico small amsr-seed-strip-add",
                                                    title: t("tipSeedBarsAdd"),
                                                    onclick: move |_| edit(Box::new(|s: &mut Seed| s.bars += 0.25)),
                                                    Icon { width: 14, height: 14, icon: LdPlus }
                                                }
                                                button {
                                                    r#type: "button",
                                                    class: "uis-btn ico small amsr-seed-strip-sub",
                                                    title: t("tipSeedBarsRemove"),
                                                    disabled: seed.bars <= 0.25,
                                                    onclick: move |_| edit(Box::new(|s: &mut Seed| s.bars -= 0.25)),
                                                    Icon { width: 14, height: 14, icon: LdMinus }
                                                }
                                                span { class: "amsr-seed-count amsr-seed-count-span mono", title: t("lblSeedBars"), "{engine::seed::js_str(seed.bars)}" }
                                            }
                                        }
                                    }
                                }
                                div { class: "amsr-seed-scrollrow",
                                    div { class: "amsr-seed-scrollbar", "data-gs": "3",
                                        div { class: "amsr-seed-scrollspacer", style: "width: 0px" }
                                    }
                                }
                            }
                        }
                    }
                }
                if tab == "render" {
                    div { class: "amsr-seed-grid",
                        div { class: "amsr-seed-field amsr-seed-field-name",
                            label { class: "uis-fld-labelled-label", {t("lblSeedName")} }
                            input {
                                class: "uis-txt",
                                r#type: "text",
                                value: "{seed.name}",
                                oninput: move |e| {
                                    let v = e.value();
                                    edit(Box::new(move |s: &mut Seed| s.name = v));
                                },
                            }
                        }
                        div { class: "amsr-seed-field",
                            label { class: "uis-fld-labelled-label", {t("lblSeedLoops")} }
                            UisNum {
                                min: 1.0,
                                max: 32.0,
                                step: 1.0,
                                width: "76px",
                                value: Some(seed.loops),
                                on_change: move |v: Option<f64>| if let Some(v) = v { edit(Box::new(move |s: &mut Seed| s.loops = v)) },
                            }
                        }
                        div { class: "amsr-seed-field",
                            label { class: "uis-fld-labelled-label", {t("lblSeedFormat")} }
                            select {
                                class: "uis-ddn-std",
                                style: "width: 120px",
                                onchange: move |e| {
                                    let v = e.value();
                                    edit(Box::new(move |s: &mut Seed| s.format = v));
                                },
                                option { value: "mp3", selected: seed.format == "mp3", {t("optSeedFormatMp3")} }
                                option { value: "wav", selected: seed.format == "wav", {t("optSeedFormatWav")} }
                            }
                        }
                        div { class: "amsr-seed-field",
                            label { class: "uis-fld-labelled-label", {t("lblSeedMp3Bitrate")} }
                            select {
                                class: "uis-ddn-std",
                                disabled: seed.format != "mp3",
                                onchange: move |e| {
                                    if let Ok(v) = e.value().parse::<f64>() {
                                        edit(Box::new(move |s: &mut Seed| s.mp3_bitrate = v));
                                    }
                                },
                                for b in mp3_bitrates().iter().copied() {
                                    option { key: "{b}", value: "{b}", selected: f64::from(b) == seed.mp3_bitrate, "{b} kbps" }
                                }
                            }
                        }
                    }
                    div { class: "amsr-seed-field",
                        label { class: "uis-fld-labelled-label", {t("lblSeedOutput")} }
                        input {
                            class: "uis-txt",
                            r#type: "text",
                            value: "{seed.output}",
                            oninput: move |e| {
                                let v = e.value();
                                edit(Box::new(move |s: &mut Seed| s.output = v));
                            },
                        }
                        span { class: "uis-hnt", "{output_hint}" }
                    }
                    div { class: "amsr-seed-summary",
                        span { class: "amsr-seed-summary-stat",
                            span { class: "amsr-seed-summary-label", {t("lblSeedSummaryChords")} }
                            span { class: "amsr-seed-summary-value mono", "{summary.count}" }
                        }
                        span { class: "amsr-seed-summary-stat",
                            span { class: "amsr-seed-summary-label", {t("lblSeedSummaryDuration")} }
                            span { class: "amsr-seed-summary-value mono", {if summary.sig_bad { "-".to_owned() } else { fmt_duration(summary.seconds) }} }
                        }
                        span { class: "amsr-seed-summary-stat",
                            span { class: "amsr-seed-summary-label", {t("lblSeedSummarySize")} }
                            span { class: "amsr-seed-summary-value mono", {if summary.sig_bad { "-".to_owned() } else { fmt_size(summary.audio_bytes) }} }
                        }
                        if summary.sig_bad {
                            span { class: "amsr-seed-summary-warn", {t("msgSeedSummarySigBad")} }
                        }
                        if !summary.invalid.is_empty() {
                            span { class: "amsr-seed-summary-warn",
                                {t("msgSeedSummaryInvalid")}
                                " "
                                span { class: "mono", "{invalid_text}" }
                            }
                        }
                    }
                }
                div { class: "amsr-seed-actions",
                    if tab == "render" {
                        button { class: "uis-btn primary", disabled: render_blocked, onclick: move |_| on_render.call(()),
                            Icon { width: 14, height: 14, icon: LdAudioWaveform }
                            {if busy { if busy_msg.is_empty() { t("msgSeedBusy") } else { busy_msg.clone() } } else { t("btnSeedRender") }}
                        }
                    }
                    if tab == "render" && !saved {
                        span { class: "uis-hnt", {t("hntSeedRenderNeedsSave")} }
                    }
                    if !seed.error.is_empty() {
                        span { class: "amsr-seed-error", "{seed.error}" }
                    }
                }
                if let (Some((audio, midi)), true) = (seed.result.clone(), tab == "render") {
                    div { class: "amsr-seed-result",
                        div { class: "amsr-seed-result-head", {t("lblSeedResult")} }
                        button {
                            class: "amsr-seed-result-file",
                            onclick: {
                                let audio = audio.clone();
                                move |_| on_reveal.call(audio.clone())
                            },
                            Icon { class: "uis-ico-inline", width: 14, height: 14, icon: LdMusic }
                            span { class: "mono", "{audio}" }
                        }
                        button {
                            class: "amsr-seed-result-file",
                            onclick: {
                                let midi = midi.clone();
                                move |_| on_reveal.call(midi.clone())
                            },
                            Icon { class: "uis-ico-inline", width: 14, height: 14, icon: LdMusic }
                            span { class: "mono", "{midi}" }
                        }
                        span { class: "uis-hnt", {t("hntSeedResult")} }
                    }
                }
            }
        }
    }
}

fn flag_on(key: &str, nt: &Note, cell: &Cell) -> bool {
    match key {
        "OctUp" => nt.oct > 0,
        "OctDown" => nt.oct < 0,
        "ScaleUp" => nt.scale > 0,
        "ScaleDown" => nt.scale < 0,
        "Accent" => nt.acc,
        "Ghost" => nt.ghost,
        "Sustain" => nt.sus,
        "Staccato" => nt.stac,
        "Last" => nt.cond == Some(engine::slots::Cond::Last),
        "NotLast" => nt.cond == Some(engine::slots::Cond::NotLast),
        "Early" => cell.early,
        _ => false,
    }
}

/// The page's half of the stack: the three grids and the stack's own scrollbar move as ONE (a chord must stay over the
/// beats it owns), and that scrollbar's spacer is as wide as the widest grid.
const SCROLL_JS: &str = r#"
if (!window.__amsrScroll) {
  window.__amsrScroll = true;
  let syncing = false;
  document.addEventListener('scroll', (e) => {
    const el = e.target;
    if (syncing || !el || !el.getAttribute || el.getAttribute('data-gs') === null) return;
    syncing = true;
    const x = el.scrollLeft;
    document.querySelectorAll('[data-gs]').forEach((o) => { if (o !== el) o.scrollLeft = x; });
    syncing = false;
  }, true);
  setInterval(() => {
    const sp = document.querySelector('.amsr-seed-scrollspacer');
    if (!sp) return;
    let w = 0;
    document.querySelectorAll('[data-gs="0"],[data-gs="1"],[data-gs="2"]').forEach((g) => { w = Math.max(w, g.scrollWidth); });
    const v = w + 'px';
    if (sp.style.width !== v) sp.style.width = v;
  }, 250);
}
"#;


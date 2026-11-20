//! The slot grammar: a lane written as a string, read into notes and written back. The twin of `parseSlots` /
//! `serializeSlots` / `sanitizePattern` / `resolveStyleSpec` in the Electron app's seed engine; the tables
//! (figures, styles, constants) are GENERATED from that engine (`engine-data.json`, see `local/gen-engine-data.mjs`).

use serde::Deserialize;
use serde_json::{Map, Value, json};
use std::sync::LazyLock;

/// What a note plays: a chord tone by index (1-9), the fifth (`f`) or the whole remaining voicing (`r`).
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Tone {
    Deg(u8),
    Fifth,
    Rest, // 'r' - the remaining voicing
}

impl Tone {
    pub fn text(self) -> String {
        match self {
            Tone::Deg(n) => n.to_string(),
            Tone::Fifth => "f".to_owned(),
            Tone::Rest => "r".to_owned(),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Cond {
    Last,
    NotLast,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Note {
    pub tone: Tone,
    pub oct: i32,
    pub scale: i32,
    /// An `r` may start from a tone: `r3`.
    pub from: Option<u8>,
    pub acc: bool,
    pub ghost: bool,
    pub sus: bool,
    pub stac: bool,
    pub cond: Option<Cond>,
}

impl Note {
    pub fn new(tone: Tone) -> Note {
        Note { tone, oct: 0, scale: 0, from: None, acc: false, ghost: false, sus: false, stac: false, cond: None }
    }
}

/// One slot: the notes struck together (empty = a rest) and whether it voices the NEXT chord (the push, `@`).
#[derive(Clone, Debug, PartialEq, Default)]
pub struct Cell {
    pub notes: Vec<Note>,
    pub early: bool,
}

pub type Slots = Vec<Cell>;

pub fn parse_slots(text: &str) -> Slots {
    let trimmed = text.trim();
    let mut slots = Vec::new();
    // "".split(/\s+/) is [""] - one empty token - where split_whitespace yields none
    let tokens: Vec<&str> = if trimmed.is_empty() { vec![""] } else { trimmed.split_whitespace().collect() };
    for tok in tokens {
        if tok == "." {
            slots.push(Cell::default());
            continue;
        }
        let ch: Vec<char> = tok.chars().collect();
        let early = ch.first() == Some(&'@');
        let mut notes = Vec::new();
        let mut i = usize::from(early);
        while i < ch.len() {
            let d = ch[i];
            let tone = match d {
                '1'..='9' => Tone::Deg(d as u8 - b'0'),
                'f' => Tone::Fifth,
                'r' => Tone::Rest,
                _ => {
                    i += 1;
                    continue;
                }
            };
            let mut note = Note::new(tone);
            if tone == Tone::Rest && i + 1 < ch.len() && ('2'..='9').contains(&ch[i + 1]) {
                note.from = Some(ch[i + 1] as u8 - b'0');
                i += 1;
            }
            while i + 1 < ch.len() {
                match ch[i + 1] {
                    '+' => note.oct += 1,
                    '-' => note.oct -= 1,
                    '^' => note.scale += 1,
                    'v' => note.scale -= 1,
                    '!' => note.acc = true,
                    '?' => note.ghost = true,
                    's' => note.sus = true,
                    '\'' => note.stac = true,
                    'L' => note.cond = Some(Cond::Last),
                    'l' => note.cond = Some(Cond::NotLast),
                    _ => break,
                }
                i += 1;
            }
            notes.push(note);
            i += 1;
        }
        slots.push(Cell { notes, early });
    }
    slots
}

/// The inverse of `parse_slots`, in the one canonical suffix order.
pub fn serialize_slots(slots: &[Cell]) -> String {
    slots
        .iter()
        .map(|cell| {
            if cell.notes.is_empty() {
                return ".".to_owned();
            }
            let mut out = String::new();
            if cell.early {
                out.push('@');
            }
            for nt in &cell.notes {
                out.push_str(&nt.tone.text());
                if nt.tone == Tone::Rest {
                    if let Some(f) = nt.from.filter(|f| *f > 1) {
                        out.push_str(&f.to_string());
                    }
                }
                out.push_str(&"+".repeat(nt.oct.max(0) as usize));
                out.push_str(&"-".repeat((-nt.oct).max(0) as usize));
                out.push_str(&"^".repeat(nt.scale.max(0) as usize));
                out.push_str(&"v".repeat((-nt.scale).max(0) as usize));
                if nt.acc {
                    out.push('!');
                }
                if nt.ghost {
                    out.push('?');
                }
                if nt.sus {
                    out.push('s');
                }
                if nt.stac {
                    out.push('\'');
                }
                match nt.cond {
                    Some(Cond::Last) => out.push('L'),
                    Some(Cond::NotLast) => out.push('l'),
                    None => {}
                }
            }
            out
        })
        .collect::<Vec<_>>()
        .join(" ")
}

// ─── the generated tables ───────────────────────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct Figure {
    pub name: String,
    pub step: f64,
    pub steps: String,
}

#[derive(Deserialize)]
struct Group {
    key: String,
    styles: Vec<String>,
}

#[derive(Deserialize)]
struct SigGroup {
    group: String,
    sigs: Vec<String>,
}

#[derive(Deserialize)]
struct SwingDef {
    key: String,
    value: f64,
}

#[derive(Deserialize)]
struct Data {
    #[serde(rename = "chordFigures")]
    chord_figures: Vec<(String, Figure)>,
    #[serde(rename = "bassFigures")]
    bass_figures: Vec<(String, Figure)>,
    #[serde(rename = "styleDefs")]
    style_defs: Vec<(String, Value)>,
    #[serde(rename = "laneDefaults")]
    lane_defaults: Value,
    signatures: Vec<SigGroup>,
    swings: Vec<SwingDef>,
    #[serde(rename = "beatDivisions")]
    beat_divisions: Vec<u32>,
    #[serde(rename = "mp3Bitrates")]
    mp3_bitrates: Vec<u32>,
    #[serde(rename = "gridRows")]
    grid_rows: Vec<Value>,
    #[serde(rename = "transposeMin")]
    transpose_min: i32,
    #[serde(rename = "transposeMax")]
    transpose_max: i32,
    #[serde(rename = "styleGroups")]
    style_groups: Vec<Group>,
    #[serde(rename = "roomKeys")]
    room_keys: Vec<String>,
}

static DATA: LazyLock<Data> =
    LazyLock::new(|| serde_json::from_str(include_str!("engine-data.json")).expect("engine-data.json is valid"));

pub fn chord_figures() -> &'static [(String, Figure)] {
    &DATA.chord_figures
}
pub fn bass_figures() -> &'static [(String, Figure)] {
    &DATA.bass_figures
}
pub fn chord_figure(key: &str) -> Option<&'static Figure> {
    DATA.chord_figures.iter().find(|(k, _)| k == key).map(|(_, f)| f)
}
pub fn bass_figure(key: &str) -> Option<&'static Figure> {
    DATA.bass_figures.iter().find(|(k, _)| k == key).map(|(_, f)| f)
}
pub fn style_def(key: &str) -> Option<&'static Value> {
    DATA.style_defs.iter().find(|(k, _)| k == key).map(|(_, v)| v)
}
pub fn styles() -> Vec<&'static str> {
    DATA.style_defs.iter().map(|(k, _)| k.as_str()).collect()
}
/// The Style menu's collections: (group key, style keys), in display order.
pub fn style_groups() -> Vec<(&'static str, Vec<&'static str>)> {
    DATA.style_groups.iter().map(|g| (g.key.as_str(), g.styles.iter().map(String::as_str).collect())).collect()
}
pub fn signatures() -> Vec<(&'static str, Vec<&'static str>)> {
    DATA.signatures.iter().map(|g| (g.group.as_str(), g.sigs.iter().map(String::as_str).collect())).collect()
}
pub fn swings() -> Vec<(&'static str, f64)> {
    DATA.swings.iter().map(|s| (s.key.as_str(), s.value)).collect()
}
pub fn beat_divisions() -> &'static [u32] {
    &DATA.beat_divisions
}
pub fn mp3_bitrates() -> &'static [u32] {
    &DATA.mp3_bitrates
}
/// The editor's row axis, top to bottom: `r`, then the degrees 4 3 2 1, then `f`.
pub fn grid_rows() -> Vec<Tone> {
    DATA.grid_rows
        .iter()
        .map(|v| match v {
            Value::String(s) if s == "f" => Tone::Fifth,
            Value::String(_) => Tone::Rest,
            other => Tone::Deg(other.as_u64().unwrap_or(1) as u8),
        })
        .collect()
}
pub fn transpose_range() -> (i32, i32) {
    (DATA.transpose_min, DATA.transpose_max)
}

// ─── lane settings and the pattern (a JSON object, key order kept) ──────────────────────────────────

pub type Spec = Map<String, Value>;

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct LaneCfg {
    pub step: f64,
    pub octave: f64,
    pub vel: f64,
    pub len: f64,
    pub hold: bool,
}

pub fn lane_defaults(lane: &str) -> LaneCfg {
    let d = &DATA.lane_defaults[lane];
    LaneCfg {
        step: d["step"].as_f64().unwrap_or(8.0),
        octave: d["octave"].as_f64().unwrap_or(1.0),
        vel: d["vel"].as_f64().unwrap_or(0.7),
        len: d["len"].as_f64().unwrap_or(4.0),
        hold: d["hold"].as_bool().unwrap_or(false),
    }
}

/// A number the way JavaScript writes it: an integer without a decimal point.
pub fn num(v: f64) -> Value {
    if v.is_finite() && v.fract() == 0.0 && v.abs() < 1e15 { json!(v as i64) } else { json!(v) }
}

/// A lane's settings as a spec holds them over the lane defaults: `{...LANE_DEFAULTS[lane], ...spec.<lane>Lane}`.
pub fn lane_cfg_of(spec: &Spec, lane: &str) -> LaneCfg {
    let mut c = lane_defaults(lane);
    if let Some(Value::Object(o)) = spec.get(&format!("{lane}Lane")) {
        if let Some(v) = o.get("step").and_then(Value::as_f64) {
            c.step = v;
        }
        if let Some(v) = o.get("octave").and_then(Value::as_f64) {
            c.octave = v;
        }
        if let Some(v) = o.get("vel").and_then(Value::as_f64) {
            c.vel = v;
        }
        if let Some(v) = o.get("len").and_then(Value::as_f64) {
            c.len = v;
        }
        if let Some(v) = o.get("hold").and_then(Value::as_bool) {
            c.hold = v;
        }
    }
    c
}

/// The five settings as the object a pattern stores, in the stored order.
pub fn lane_cfg_value(c: &LaneCfg) -> Value {
    json!({ "step": num(c.step), "octave": num(c.octave), "vel": num(c.vel), "len": num(c.len), "hold": c.hold })
}

fn compose_lane(base: &Figure, over: &Value) -> Value {
    // `{ step: figure.step, ...def.<lane>Lane }`
    let mut m = Map::new();
    m.insert("step".into(), num(base.step));
    if let Value::Object(o) = over {
        for (k, v) in o {
            m.insert(k.clone(), v.clone());
        }
    }
    Value::Object(m)
}

fn figure_of(v: &Value, chord: bool) -> Option<Figure> {
    match v {
        Value::String(k) => {
            let f = if chord { chord_figure(k) } else { bass_figure(k) }?;
            Some(Figure { name: f.name.clone(), step: f.step, steps: f.steps.clone() })
        }
        Value::Object(o) => Some(Figure {
            name: o["name"].as_str().unwrap_or("").to_owned(),
            step: o["step"].as_f64().unwrap_or(8.0),
            steps: o["steps"].as_str().unwrap_or(".").to_owned(),
        }),
        _ => None,
    }
}

/// A style flattened into the spec the gesture builder consumes (`composeStyle`).
fn compose_style(def: &Value, chord: &Value, bass: &Value) -> Spec {
    let c = figure_of(chord, true).expect("a chord figure");
    let b = figure_of(bass, false).expect("a bass figure");
    let mut s = Map::new();
    s.insert("meter".into(), json!(4));
    s.insert("group".into(), def["group"].clone());
    s.insert("bass".into(), json!(b.steps));
    s.insert("treble".into(), json!(c.steps));
    s.insert("bassLane".into(), compose_lane(&b, &def["bassLane"]));
    s.insert("trebleLane".into(), compose_lane(&c, &def["trebleLane"]));
    s
}

/// The one answer to "the slot table for this seed": its own pattern, else the figures it picked over its
/// style's, else the style (an unknown one falling back to pad).
pub fn resolve_style_spec(style: &str, chord_figure_key: &str, bass_figure_key: &str, pattern: Option<&Spec>) -> Spec {
    if let Some(p) = pattern {
        return p.clone();
    }
    let def = style_def(style).or_else(|| style_def("pad")).expect("pad exists");
    let chord = if chord_figure(chord_figure_key).is_some() { json!(chord_figure_key) } else { def["chord"].clone() };
    let bass = if bass_figure(bass_figure_key).is_some() { json!(bass_figure_key) } else { def["bass"].clone() };
    compose_style(def, &chord, &bass)
}

/// A spec's lane string and the meter it was authored in.
pub fn spec_str(spec: &Spec, lane: &str) -> String {
    spec.get(lane).and_then(Value::as_str).unwrap_or(".").to_owned()
}
pub fn spec_meter(spec: &Spec) -> Option<f64> {
    spec.get("meter").and_then(Value::as_f64)
}

/// A pattern read off disk, made safe (`sanitizePattern`): every field falls back to its lane default and the
/// lane strings go through parse and serialize. None for something that is not a pattern at all.
pub fn sanitize_pattern(p: &Value) -> Option<Spec> {
    let obj = p.as_object()?;
    let numf = |v: Option<&Value>, dflt: f64, lo: f64, hi: f64| -> f64 {
        match v.and_then(js_number) {
            Some(n) if n.is_finite() => n.clamp(lo, hi),
            _ => dflt,
        }
    };
    let lane = |l: &str| -> Value {
        let d = lane_defaults(l);
        let empty = Map::new();
        let src = match obj.get(&format!("{l}Lane")) {
            Some(Value::Object(o)) => o,
            _ => &empty,
        };
        let hold = js_truthy(src.get("hold"));
        json!({
            "step": num(numf(src.get("step"), d.step, 1.0, 64.0)),
            "octave": num(numf(src.get("octave"), d.octave, 0.0, 8.0)),
            "vel": num(numf(src.get("vel"), d.vel, 0.0, 1.0)),
            "len": num(numf(src.get("len"), d.len, 1.0, 64.0)),
            "hold": hold,
        })
    };
    let slots = |v: Option<&Value>| -> String {
        match v {
            Some(Value::String(s)) if !s.trim().is_empty() => serialize_slots(&parse_slots(s)),
            _ => ".".to_owned(),
        }
    };
    let mut out = Map::new();
    out.insert("meter".into(), num(numf(obj.get("meter"), 4.0, 0.25, 64.0)));
    out.insert("bass".into(), json!(slots(obj.get("bass"))));
    out.insert("treble".into(), json!(slots(obj.get("treble"))));
    out.insert("bassLane".into(), lane("bass"));
    out.insert("trebleLane".into(), lane("treble"));
    Some(out)
}

/// JavaScript's `Number(v)` for a JSON value.
pub fn js_number(v: &Value) -> Option<f64> {
    match v {
        Value::Number(n) => n.as_f64(),
        Value::String(s) => {
            let t = s.trim();
            if t.is_empty() { Some(0.0) } else { t.parse::<f64>().ok() }
        }
        Value::Bool(b) => Some(f64::from(u8::from(*b))),
        Value::Null => Some(0.0),
        _ => None,
    }
}

/// JavaScript's `!!v` for a JSON value.
pub fn js_truthy(v: Option<&Value>) -> bool {
    match v {
        None | Some(Value::Null) => false,
        Some(Value::Bool(b)) => *b,
        Some(Value::Number(n)) => n.as_f64().is_some_and(|f| f != 0.0 && !f.is_nan()),
        Some(Value::String(s)) => !s.is_empty(),
        Some(_) => true,
    }
}

/// The rooms the reverb select lists, in order.
pub fn room_keys() -> Vec<&'static str> {
    DATA.room_keys.iter().map(String::as_str).collect()
}

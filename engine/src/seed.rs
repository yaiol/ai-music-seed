//! The seed document: every on-screen field of one open `.yams`, reading and writing the file, the output-name
//! tokens, and the time axis the grids are drawn on. The twin of `makeSeed` / `seedFromFile` / `buildSeed` /
//! `computeFileName` and the grid maths in the Electron app's `App.jsx`.

use crate::chords::{default_name, parse_lines};
use crate::slots::{
    LaneCfg, Spec, js_number, js_truthy, lane_cfg_of, lane_cfg_value, lane_defaults, num, resolve_style_spec,
    room_keys, sanitize_pattern, swings, styles, transpose_range,
};
use serde_json::{Map, Value, json};
use std::sync::atomic::{AtomicU64, Ordering};

pub const DEFAULT_OUTPUT: &str = "{name}-{style}-{bpm}";

/// JavaScript's `Math.round`: halves go up.
pub fn js_round(x: f64) -> f64 {
    (x + 0.5).floor()
}

/// A number written as JavaScript's `String(n)` does.
pub fn js_str(n: f64) -> String {
    if n.is_nan() {
        "NaN".to_owned()
    } else if n.fract() == 0.0 && n.abs() < 1e21 {
        format!("{}", n as i128)
    } else {
        format!("{n}")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct Seed {
    pub id: String,
    /// The `.yams` this tab is bound to (None = never saved or loaded).
    pub file_path: Option<String>,
    pub file_name: String,
    /// Edited since the last save / load / open.
    pub unsaved: bool,
    pub name: String,
    pub progression: String,
    pub bpm: f64,
    pub bars: f64,
    pub sig: String,
    pub loops: f64,
    pub style: String,
    pub treble_instrument: String,
    /// "" = the bass plays the chord instrument.
    pub bass_instrument: String,
    pub chord_figure: String,
    pub bass_figure: String,
    pub treble_mirror: bool,
    pub bass_mirror: bool,
    pub swing: f64,
    pub treble_volume: f64,
    pub bass_volume: f64,
    pub treble_octave: f64,
    pub bass_octave: f64,
    pub transpose: f64,
    pub highpass: f64,
    pub lowpass: f64,
    pub reverb: String,
    pub treble_reverb: f64,
    pub bass_reverb: f64,
    pub format: String,
    pub mp3_bitrate: f64,
    pub output: String,
    /// The lane monitor (never saved): both / bass / treble / none.
    pub lanes: String,
    /// The seed's own figure (copy-on-edit over a shipped style), saved whole.
    pub pattern: Option<Spec>,
    /// The files the last render wrote (never saved).
    pub result: Option<(String, String)>,
    pub error: String,
}

static NEXT_ID: AtomicU64 = AtomicU64::new(1);

impl Seed {
    /// A blank seed (`makeSeed`): a new one starts filtered, with a room, and with an output template.
    pub fn new() -> Seed {
        let n = NEXT_ID.fetch_add(1, Ordering::Relaxed);
        let t = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or(0);
        Seed {
            id: format!("{t:x}-{n}"),
            file_path: None,
            file_name: String::new(),
            unsaved: false,
            name: String::new(),
            progression: "Am C G Dm".to_owned(),
            bpm: 80.0,
            bars: 1.0,
            sig: "4/4".to_owned(),
            loops: 4.0,
            style: "pad".to_owned(),
            treble_instrument: "sine".to_owned(),
            bass_instrument: String::new(),
            chord_figure: String::new(),
            bass_figure: String::new(),
            treble_mirror: false,
            bass_mirror: false,
            swing: 0.0,
            treble_volume: 100.0,
            bass_volume: 100.0,
            treble_octave: 0.0,
            bass_octave: 0.0,
            transpose: 0.0,
            highpass: 100.0,
            lowpass: 10000.0,
            reverb: "chamber".to_owned(),
            treble_reverb: 50.0,
            bass_reverb: 20.0,
            format: "mp3".to_owned(),
            mp3_bitrate: 192.0,
            output: DEFAULT_OUTPUT.to_owned(),
            lanes: "both".to_owned(),
            pattern: None,
            result: None,
            error: String::new(),
        }
    }

    pub fn bound_to(path: &str) -> Seed {
        let mut s = Seed::new();
        s.file_path = Some(path.to_owned());
        s.file_name = basename(path);
        s
    }

    /// The slot table for this seed.
    pub fn spec(&self) -> Spec {
        resolve_style_spec(&self.style, &self.chord_figure, &self.bass_figure, self.pattern.as_ref())
    }

    /// One lane's settings: its resolved figure's, over the lane defaults (`seedLaneCfg`).
    pub fn lane_cfg(&self, lane: &str) -> LaneCfg {
        lane_cfg_of(&self.spec(), lane)
    }

    /// The seed's beat division: slots per beat, the finer of the two lanes over the meter's beat.
    pub fn beat_division(&self) -> u32 {
        let (_, denom) = sig_parts(&self.sig);
        ['t', 'b']
            .iter()
            .map(|l| js_round(self.lane_cfg(if *l == 't' { "treble" } else { "bass" }).step / denom))
            .fold(1.0, f64::max) as u32
    }
}

impl Default for Seed {
    fn default() -> Self {
        Seed::new()
    }
}

pub fn basename(p: &str) -> String {
    p.rsplit(['\\', '/']).next().unwrap_or("").to_owned()
}

pub fn dirname(p: &str) -> String {
    match p.rfind(['\\', '/']) {
        Some(i) => p[..i].to_owned(),
        None => p.to_owned(),
    }
}

/// A lane's velocity as the percent its knob shows (and `{<lane>-velocity}` writes).
pub fn lane_velocity_percent(cfg: &LaneCfg) -> f64 {
    js_round(cfg.vel * 100.0)
}

/// The swing landmark a value sits on, or `custom`.
pub fn swing_key(v: f64) -> String {
    let v = if v.is_nan() { 0.0 } else { v };
    swings().into_iter().find(|(_, val)| (val - v).abs() < 1e-6).map(|(k, _)| k.to_owned()).unwrap_or_else(|| "custom".to_owned())
}

// ─── the file ───────────────────────────────────────────────────────────────────────────────────────

fn field_num(s: &Value, key: &str) -> Option<f64> {
    s.get(key).filter(|v| !v.is_null()).and_then(js_number)
}

/// Map a parsed `.yams` onto a fresh seed (field by field, so a partial or future file never fails).
pub fn seed_from_file(s: &Value, file_path: Option<&str>) -> Seed {
    let mut seed = match file_path {
        Some(p) => Seed::bound_to(p),
        None => Seed::new(),
    };
    if let Some(v) = s.get("chords").and_then(Value::as_str) {
        seed.progression = v.to_owned();
    }
    if let Some(v) = field_num(s, "bpm") {
        seed.bpm = v;
    }
    if let Some(v) = field_num(s, "bars") {
        seed.bars = v;
    }
    if let Some(v) = s.get("sig").and_then(Value::as_str) {
        seed.sig = v.to_owned();
    }
    if let Some(v) = field_num(s, "loops") {
        seed.loops = v;
    }
    if let Some(v) = s.get("style").filter(|v| !v.is_null()) {
        seed.style = match v.as_str() {
            Some(k) if styles().contains(&k) => k.to_owned(),
            _ => "pad".to_owned(),
        };
    }
    seed.pattern = s.get("pattern").and_then(sanitize_pattern);
    seed.treble_instrument = s
        .get("trebleInstrument")
        .filter(|v| !v.is_null())
        .or_else(|| s.get("instrument").filter(|v| !v.is_null()))
        .and_then(Value::as_str)
        .unwrap_or("sine")
        .to_owned();
    seed.bass_instrument = s.get("bassInstrument").and_then(Value::as_str).unwrap_or("").to_owned();
    if let Some(k) = s.get("chordFigure").and_then(Value::as_str) {
        if crate::slots::chord_figure(k).is_some() {
            seed.chord_figure = k.to_owned();
        }
    }
    if let Some(k) = s.get("bassFigure").and_then(Value::as_str) {
        if crate::slots::bass_figure(k).is_some() {
            seed.bass_figure = k.to_owned();
        }
    }
    seed.treble_mirror = js_truthy(s.get("trebleMirror"));
    seed.bass_mirror = js_truthy(s.get("bassMirror"));
    seed.swing = field_num(s, "swing").filter(|v| v.is_finite()).unwrap_or(0.0);
    // Percent scale; absent = 100; a value of 2 or less is the few hours the field was a bare multiplier.
    let vol = |v: Option<f64>| match v {
        None => 100.0,
        Some(n) if n <= 2.0 => n * 100.0,
        Some(n) => n,
    };
    seed.treble_volume = vol(field_num(s, "trebleVolume").or_else(|| field_num(s, "chordVolume")));
    seed.bass_volume = vol(field_num(s, "bassVolume"));
    seed.treble_octave = field_num(s, "trebleOctave").unwrap_or(0.0);
    seed.bass_octave = field_num(s, "bassOctave").unwrap_or(0.0);
    let (lo, hi) = transpose_range();
    seed.transpose = match s.get("transpose").and_then(js_number).map(js_round) {
        Some(t) if t.is_finite() => t.clamp(lo as f64, hi as f64),
        _ => 0.0,
    };
    // Absent means OFF, not the new default: an old file renders as it always did.
    seed.highpass = field_num(s, "highpass").unwrap_or(0.0);
    seed.lowpass = field_num(s, "lowpass").unwrap_or(0.0);
    seed.reverb = match s.get("reverb").and_then(Value::as_str) {
        Some(r) if room_keys().contains(&r) => r.to_owned(),
        _ => "none".to_owned(),
    };
    let legacy_amount = field_num(s, "reverbAmount").map(|a| js_round(a * 50.0)).unwrap_or(50.0);
    seed.treble_reverb = field_num(s, "trebleReverb").unwrap_or(legacy_amount);
    seed.bass_reverb = field_num(s, "bassReverb").unwrap_or(legacy_amount);
    if let Some(v) = s.get("format").and_then(Value::as_str) {
        seed.format = v.to_owned();
    }
    if let Some(v) = field_num(s, "mp3Bitrate") {
        seed.mp3_bitrate = v;
    }
    let version = field_num(s, "version").unwrap_or(f64::NAN);
    let legacy = !s.get("output").is_some_and(Value::is_string) && version < 2.0;
    if let Some(o) = s.get("output").and_then(Value::as_str) {
        let kept = drop_unknown_tokens(o);
        seed.output = if kept.is_empty() { DEFAULT_OUTPUT.to_owned() } else { kept };
    } else if legacy {
        if let Some(n) = s.get("name").filter(|v| js_truthy(Some(v))) {
            seed.output = n.as_str().map(str::to_owned).unwrap_or_else(|| n.to_string());
        }
    }
    if !legacy {
        if let Some(n) = s.get("name").and_then(Value::as_str) {
            seed.name = n.to_owned();
        }
    }
    seed
}

/// The `.yams` payload: every on-screen field, so a seed reopens and re-renders identically.
pub fn build_seed(s: &Seed) -> Value {
    let mut m = Map::new();
    m.insert("version".into(), json!(3));
    m.insert("name".into(), json!(s.name));
    m.insert("chords".into(), json!(s.progression));
    m.insert("bpm".into(), num(s.bpm));
    m.insert("bars".into(), num(s.bars));
    m.insert("sig".into(), json!(s.sig));
    m.insert("loops".into(), num(s.loops));
    m.insert("style".into(), json!(s.style));
    m.insert("chordFigure".into(), json!(s.chord_figure));
    m.insert("bassFigure".into(), json!(s.bass_figure));
    m.insert("swing".into(), num(if s.swing.is_nan() { 0.0 } else { s.swing }));
    m.insert("trebleMirror".into(), json!(s.treble_mirror));
    m.insert("bassMirror".into(), json!(s.bass_mirror));
    if let Some(p) = &s.pattern {
        m.insert("pattern".into(), Value::Object(p.clone()));
    }
    m.insert("trebleInstrument".into(), json!(s.treble_instrument));
    m.insert("bassInstrument".into(), json!(s.bass_instrument));
    m.insert("trebleVolume".into(), num(s.treble_volume));
    m.insert("bassVolume".into(), num(s.bass_volume));
    m.insert("trebleOctave".into(), num(s.treble_octave));
    m.insert("bassOctave".into(), num(s.bass_octave));
    m.insert("transpose".into(), num(if s.transpose.is_nan() { 0.0 } else { s.transpose }));
    m.insert("highpass".into(), num(s.highpass));
    m.insert("lowpass".into(), num(s.lowpass));
    m.insert("reverb".into(), json!(s.reverb));
    m.insert("trebleReverb".into(), num(s.treble_reverb));
    m.insert("bassReverb".into(), num(s.bass_reverb));
    m.insert("format".into(), json!(s.format));
    m.insert("mp3Bitrate".into(), num(s.mp3_bitrate));
    m.insert("output".into(), json!(s.output));
    Value::Object(m)
}

// ─── the output name ────────────────────────────────────────────────────────────────────────────────

fn chords_token(s: &Seed) -> String {
    default_name(&s.progression, s.transpose as i32)
}

fn name_token(s: &Seed) -> String {
    let cleaned: String = s.name.chars().filter(|c| !matches!(c, '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*') && *c >= ' ').collect();
    let cleaned = cleaned.trim();
    if cleaned.is_empty() { chords_token(s) } else { cleaned.to_owned() }
}

fn instrument_token(key: &str) -> String {
    let key = if key.is_empty() { "sine" } else { key };
    key.strip_prefix("vsco:").unwrap_or(key).to_owned()
}

/// A signed offset as a musician writes it: +2, 0, -3.
fn signed(n: f64) -> String {
    let v = if n.is_nan() { 0.0 } else { n };
    if v > 0.0 { format!("+{}", js_str(v)) } else { js_str(v) }
}

/// The tokens of the Output template, in the one order every list of them keeps.
pub const OUTPUT_TOKEN_NAMES: [&str; 27] = [
    "name", "loops", "bitrate", "bpm", "style", "sig", "beat", "swing", "reverb", "highpass", "lowpass",
    "treble-velocity", "treble-length", "treble-hold", "treble-instrument", "treble-octave", "treble-reverb", "treble-volume",
    "bass-velocity", "bass-length", "bass-hold", "bass-instrument", "bass-octave", "bass-reverb", "bass-volume",
    "transpose", "chords",
];

fn token_value(s: &Seed, key: &str) -> Option<String> {
    let lane = |l: &str, field: &str| -> Option<String> {
        let cfg = s.lane_cfg(l);
        let (octave, reverb, volume, instrument) = if l == "treble" {
            (s.treble_octave, s.treble_reverb, s.treble_volume, instrument_token(&s.treble_instrument))
        } else {
            let inst = if s.bass_instrument.is_empty() { &s.treble_instrument } else { &s.bass_instrument };
            (s.bass_octave, s.bass_reverb, s.bass_volume, instrument_token(inst))
        };
        Some(match field {
            "velocity" => js_str(lane_velocity_percent(&cfg)),
            "length" => js_str(cfg.len),
            "hold" => (if cfg.hold { "hold" } else { "nohold" }).to_owned(),
            "instrument" => instrument,
            "octave" => signed(octave),
            "reverb" => js_str(reverb),
            "volume" => js_str(volume),
            _ => return None,
        })
    };
    Some(match key {
        "name" => name_token(s),
        "loops" => js_str(s.loops),
        // a WAV has no bitrate: the token writes nothing
        "bitrate" => if s.format == "mp3" { js_str(s.mp3_bitrate) } else { String::new() },
        "bpm" => js_str(s.bpm),
        "style" => s.style.clone(),
        "sig" => s.sig.replace('/', "-"),
        "beat" => format!("B-{}", s.beat_division()),
        "swing" => {
            let k = swing_key(s.swing);
            if k == "custom" { format!("{:.2}", s.swing) } else { k }
        }
        "reverb" => s.reverb.clone(),
        "highpass" => js_str(s.highpass),
        "lowpass" => js_str(s.lowpass),
        "transpose" => signed(s.transpose),
        "chords" => chords_token(s),
        other => {
            let (l, f) = other.split_once('-')?;
            if l != "treble" && l != "bass" {
                return None;
            }
            return lane(l, f);
        }
    })
}

/// Replace every `{token}` the table knows with the seed's value; unknown ones stay (`resolveName`).
pub fn resolve_name(s: &Seed, raw: &str) -> String {
    replace_tokens(raw, |key| if OUTPUT_TOKEN_NAMES.contains(&key) { token_value(s, key) } else { None })
}

/// A token not in the current list is removed when a file loads (`dropUnknownTokens`).
pub fn drop_unknown_tokens(raw: &str) -> String {
    replace_tokens(raw, |key| if OUTPUT_TOKEN_NAMES.contains(&key) { Some(format!("{{{key}}}")) } else { Some(String::new()) })
}

/// JS `raw.replace(/\{([^{}]*)\}/g, ...)`: a match is a `{`, then no brace, then `}`.
fn replace_tokens(raw: &str, mut f: impl FnMut(&str) -> Option<String>) -> String {
    let mut out = String::new();
    let mut rest = raw;
    while let Some(open) = rest.find('{') {
        let after = &rest[open + 1..];
        match after.find(['{', '}']) {
            Some(i) if after.as_bytes()[i] == b'}' => {
                let key = &after[..i];
                out.push_str(&rest[..open]);
                match f(key) {
                    Some(v) => out.push_str(&v),
                    None => out.push_str(&rest[open..open + 1 + i + 1]),
                }
                rest = &after[i + 1..];
            }
            _ => {
                out.push_str(&rest[..open + 1]);
                rest = after;
            }
        }
    }
    out.push_str(rest);
    out
}

fn lane_suffix(s: &Seed) -> &'static str {
    match s.lanes.as_str() {
        "bass" => "-bass",
        "treble" => "-treble",
        "none" => "-muted",
        _ => "",
    }
}

/// The base name of the rendered files and of a new `.yams`.
pub fn compute_file_name(s: &Seed) -> String {
    let raw = s.output.trim();
    let raw = if raw.is_empty() { DEFAULT_OUTPUT } else { raw };
    let resolved = resolve_name(s, raw);
    let resolved = resolved.trim();
    let base = if resolved.is_empty() { chords_token(s) } else { resolved.to_owned() };
    format!("{base}{}", lane_suffix(s))
}

// ─── the time axis of the grids ─────────────────────────────────────────────────────────────────────

/// A time signature's two numbers; 4/4 when unreadable.
pub fn sig_parts(sig: &str) -> (f64, f64) {
    let mut it = sig.split('/').map(|p| p.trim().parse::<f64>().unwrap_or(f64::NAN));
    let n = it.next().unwrap_or(f64::NAN);
    let d = it.next().unwrap_or(f64::NAN);
    (if n > 0.0 { n } else { 4.0 }, if d > 0.0 { d } else { 4.0 })
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct LaneGeom {
    pub slot_q: f64,
    pub pattern_q: f64,
}

pub fn lane_geom(slots: usize, cfg: &LaneCfg, meter: Option<f64>, bar_q: f64) -> LaneGeom {
    let slot_q = 4.0 / cfg.step;
    let raw_q = slot_q.max(slots as f64 * slot_q);
    let foreign = meter.is_some_and(|m| (m - bar_q).abs() > 1e-9);
    LaneGeom { slot_q, pattern_q: if foreign { js_round(raw_q / bar_q).max(1.0) * bar_q } else { raw_q } }
}

/// Re-quantise a lane to a finer division KEEPING TIME; None when a slot would not land on the new grid.
pub fn requant_lane(slots: &[crate::slots::Cell], step: f64, new_step: f64) -> Option<Vec<crate::slots::Cell>> {
    let n = ((slots.len() as f64 * new_step) / step - 1e-9).ceil().max(0.0) as usize;
    let mut out = vec![crate::slots::Cell::default(); n];
    for (i, cell) in slots.iter().enumerate() {
        if cell.notes.is_empty() && !cell.early {
            continue;
        }
        let j = (i as f64 * new_step) / step;
        if (j - js_round(j)).abs() > 1e-9 {
            return None;
        }
        *out.get_mut(js_round(j) as usize)? = cell.clone();
    }
    Some(out)
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct StackGeom {
    pub numer: f64,
    pub denom: f64,
    pub bar_q: f64,
    pub line_q: f64,
    pub reach_q: f64,
    pub cpb: u32,
    pub col_q: f64,
    pub cols: usize,
}

pub fn stack_geom(sig: &str, lanes: &[(usize, LaneCfg)], bars: f64, lines: usize, meter: Option<f64>, cpb: u32) -> StackGeom {
    let (numer, denom) = sig_parts(sig);
    let beat_q = 4.0 / denom;
    let bar_q = numer * beat_q;
    let line_q = bars.max(0.0) * bar_q;
    let reach_q = lines as f64 * line_q;
    let mut span = (2.0 * bar_q).max(line_q);
    for (n, cfg) in lanes {
        span = span.max(lane_geom(*n, cfg, meter, bar_q).pattern_q);
    }
    let view_q = (span / bar_q - 1e-9).ceil() * bar_q; // whole bars, two at least
    let col_q = beat_q / f64::from(cpb);
    let cols = js_round(view_q / col_q).max(1.0) as usize;
    StackGeom { numer, denom, bar_q, line_q, reach_q, cpb, col_q, cols }
}

/// The number of chord lines of a progression (the chord strip's reach).
pub fn line_count(progression: &str) -> usize {
    parse_lines(progression).len()
}

/// The lane settings written back as a spec holds them.
pub fn lane_cfg_json(c: &LaneCfg) -> Value {
    lane_cfg_value(c)
}

/// The defaults of a lane, for callers that want the untouched table.
pub fn lane_default(lane: &str) -> LaneCfg {
    lane_defaults(lane)
}

/// The seed the page-side audio reads (`amsd.setSeed` / `amsd.render`): the Electron app's own field names, which is
/// the object its player and its render were written against. Numbers are plain; the percent-to-multiplier maths is
/// the page's, as in Electron.
pub fn to_js_seed(s: &Seed) -> Value {
    json!({
        "progression": s.progression, "bpm": s.bpm, "bars": s.bars, "sig": s.sig, "loops": s.loops,
        "style": s.style, "chordFigure": s.chord_figure, "bassFigure": s.bass_figure,
        "pattern": s.pattern.as_ref().map(|p| Value::Object(p.clone())).unwrap_or(Value::Null),
        "trebleMirror": s.treble_mirror, "bassMirror": s.bass_mirror, "swing": s.swing, "lanes": s.lanes,
        "trebleVolume": s.treble_volume, "bassVolume": s.bass_volume,
        "trebleOctave": s.treble_octave, "bassOctave": s.bass_octave, "transpose": s.transpose,
        "highpass": s.highpass, "lowpass": s.lowpass,
        "reverb": s.reverb, "trebleReverb": s.treble_reverb, "bassReverb": s.bass_reverb,
        "trebleInstrument": s.treble_instrument, "bassInstrument": s.bass_instrument,
        "format": s.format, "mp3Bitrate": s.mp3_bitrate,
    })
}

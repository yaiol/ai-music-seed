//! The chord text: how a progression is read, named and measured. The twin of the text half of the
//! Electron app's seed engine (`parseLines`, `chordToken`, `transposeChord`, `defaultName`, `analyzeSeed`);
//! the tests compare it with what that engine answers (`tests/fixtures.json`). The sound itself (voicing,
//! gestures, render) stays in the page, as in Electron.

/// One chord of a line: its symbol and its weight (`2Am` holds Am twice as long as a bare chord).
#[derive(Clone, Debug, PartialEq)]
pub struct ChordTok {
    pub sym: String,
    pub w: f64,
}

/// A leading run of digits followed by a non-digit is a weight; a token of only digits stays a (bad) symbol.
pub fn chord_token(tok: &str) -> ChordTok {
    let digits = tok.chars().take_while(|c| c.is_ascii_digit()).count();
    if digits > 0 && digits < tok.chars().count() {
        let (num, rest) = tok.split_at(digits);
        let w: f64 = num.parse().unwrap_or(1.0);
        return ChordTok { sym: rest.to_owned(), w: w.max(1.0) };
    }
    ChordTok { sym: tok.to_owned(), w: 1.0 }
}

/// Remove every `[...]` run (JS `/\[[^\]]*\]/g`) and replace it by a space.
fn strip_brackets(line: &str) -> String {
    let mut out = String::new();
    let mut rest = line;
    while let Some(open) = rest.find('[') {
        match rest[open..].find(']') {
            Some(close) => {
                out.push_str(&rest[..open]);
                out.push(' ');
                rest = &rest[open + close + 1..];
            }
            None => break,
        }
    }
    out.push_str(rest);
    out
}

fn lines_of(text: &str) -> impl Iterator<Item = &str> {
    text.split('\n').map(|l| l.strip_suffix('\r').unwrap_or(l))
}

/// The progression as lines of chord tokens; `[Section]` tags, `|` marks and blank lines are dropped.
pub fn parse_lines(progression: &str) -> Vec<Vec<ChordTok>> {
    lines_of(progression)
        .map(|line| strip_brackets(line).replace('|', " "))
        .map(|line| line.split_whitespace().map(chord_token).collect::<Vec<_>>())
        .filter(|toks| !toks.is_empty())
        .collect()
}

/// A line of the chord strip: the section tag that opens it (if any), its chords and their total weight.
#[derive(Clone, Debug, PartialEq)]
pub struct ChordRow {
    pub section: String,
    pub toks: Vec<ChordTok>,
    pub total: f64,
}

/// The progression as the strip draws it: like `parse_lines`, plus the section tag each row starts.
pub fn chord_rows(progression: &str) -> Vec<ChordRow> {
    let mut rows = Vec::new();
    let mut section = String::new();
    for raw in lines_of(progression) {
        if let Some(open) = raw.find('[') {
            if let Some(close) = raw[open..].find(']') {
                section = raw[open + 1..open + close].to_owned();
            }
        }
        let toks: Vec<ChordTok> = strip_brackets(raw).replace('|', " ").split_whitespace().map(chord_token).collect();
        if !toks.is_empty() {
            let total = toks.iter().map(|t| t.w).sum();
            rows.push(ChordRow { section: std::mem::take(&mut section), toks, total });
        }
    }
    rows
}

const SHARP_NAMES: [&str; 12] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NAMES: [&str; 12] = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const CHART_NAMES: [&str; 12] = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

fn natural_pc(letter: char) -> Option<i32> {
    Some(match letter.to_ascii_uppercase() {
        'C' => 0,
        'D' => 2,
        'E' => 4,
        'F' => 5,
        'G' => 7,
        'A' => 9,
        'B' => 11,
        _ => return None,
    })
}

/// The pitch class of a note name written as a letter and an optional `#` / `b`.
fn note_pc(note: &str) -> i32 {
    let mut chars = note.chars();
    let mut pc = natural_pc(chars.next().unwrap_or('C')).unwrap_or(0);
    match chars.next() {
        Some('#') => pc += 1,
        Some('b') | Some('B') => pc -= 1,
        _ => {}
    }
    pc.rem_euclid(12)
}

fn transpose_note(note: &str, transpose: i32) -> &'static str {
    let names = match note.chars().nth(1) {
        Some('b') => &FLAT_NAMES,
        Some('#') => &SHARP_NAMES,
        _ => &CHART_NAMES,
    };
    names[(note_pc(note) + transpose + 120).rem_euclid(12) as usize]
}

/// `[A-Ga-g][#b]?` at the start of `s`: the length of the note name, or None.
fn note_len(s: &str) -> Option<usize> {
    let mut chars = s.chars();
    let first = chars.next()?;
    if !matches!(first.to_ascii_uppercase(), 'A'..='G') {
        return None;
    }
    Some(if matches!(chars.next(), Some('#') | Some('b')) { 2 } else { 1 })
}

/// A chord symbol moved by `transpose` semitones: only the root and the slash bass change, a flat root stays
/// flat and a natural one lands on the chart spelling. Anything that is not a chord comes back untouched.
pub fn transpose_chord(sym: &str, transpose: i32) -> String {
    if transpose == 0 {
        return sym.to_owned();
    }
    // /^([A-Ga-g][#b]?)([^/]*)(?:\/([A-Ga-g][#b]?)(.*))?$/
    let Some(n) = note_len(sym) else { return sym.to_owned() };
    let (root, rest) = sym.split_at(n);
    let (quality, tail) = match rest.find('/') {
        Some(i) => (&rest[..i], Some(&rest[i + 1..])),
        None => (rest, None),
    };
    let mut out = format!("{}{}", transpose_note(root, transpose), quality);
    if let Some(tail) = tail {
        match note_len(tail) {
            Some(m) => {
                let (bass, after) = tail.split_at(m);
                out.push('/');
                out.push_str(transpose_note(bass, transpose));
                out.push_str(after);
            }
            // the optional slash group did not match, so the whole pattern fails: untouched
            None => return sym.to_owned(),
        }
    }
    out
}

/// Whether the Electron engine's `voice()` would accept the symbol (it throws on the others).
pub fn is_valid_chord(sym: &str) -> bool {
    let sym = sym.trim();
    let mut parts = sym.split('/');
    let head = parts.next().unwrap_or("").trim();
    if let Some(bass) = parts.next() {
        if bass.trim().is_empty() {
            return false; // notePc("") throws in the engine
        }
    }
    if head.to_uppercase().replace('.', "").starts_with("NC") {
        return true;
    }
    note_len(head).is_some() || head.chars().next().is_some_and(|c| matches!(c.to_ascii_uppercase(), 'A'..='G'))
}

const NAME_CHORDS: usize = 8;

/// A safe base name from the progression: the first eight chord symbols (in the key they sound in), letters,
/// digits and `#` only.
pub fn default_name(progression: &str, transpose: i32) -> String {
    let name: String = parse_lines(progression)
        .into_iter()
        .flatten()
        .take(NAME_CHORDS)
        .map(|t| transpose_chord(&t.sym, transpose))
        .collect::<String>()
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '#')
        .collect();
    if name.is_empty() { "seed".to_owned() } else { name }
}

/// A time signature's numerator, denominator, and bar length in quarters; `bad` when the denominator is not a
/// power of two or a number is missing.
pub struct TimeSig {
    pub numer: f64,
    pub denom: f64,
    pub bad: bool,
    pub bar_quarters: f64,
}

pub fn time_sig(sig: &str) -> TimeSig {
    let mut it = sig.split('/').map(|p| p.trim().parse::<f64>().unwrap_or(f64::NAN));
    let numer = it.next().unwrap_or(f64::NAN);
    let denom = it.next().unwrap_or(f64::NAN);
    let missing = |v: f64| v.is_nan() || v == 0.0;
    let bad = missing(numer) || missing(denom) || (denom as i64 & (denom as i64 - 1)) != 0;
    TimeSig { numer, denom, bad, bar_quarters: if bad { 0.0 } else { numer * 4.0 / denom } }
}

const SR: f64 = 44100.0;

/// What a form will render, before it is rendered.
#[derive(Clone, Debug, PartialEq)]
pub struct Summary {
    pub count: usize,
    pub invalid: Vec<String>,
    pub sig_bad: bool,
    pub seconds: f64,
    pub audio_bytes: f64,
}

pub fn analyze_seed(progression: &str, bpm: f64, bars: f64, sig: &str, loops: f64, mp3: bool, mp3_bitrate: f64) -> Summary {
    let lines = parse_lines(progression);
    let syms: Vec<&str> = lines.iter().flatten().map(|t| t.sym.as_str()).collect();
    let invalid: Vec<String> = syms.iter().filter(|s| !is_valid_chord(s)).map(|s| (*s).to_owned()).collect();
    let count = syms.len();
    let ts = time_sig(sig);
    if ts.bad || count == 0 {
        return Summary { count, invalid, sig_bad: ts.bad, seconds: 0.0, audio_bytes: 0.0 };
    }
    let mut samples = 0.0;
    for toks in &lines {
        let total: f64 = toks.iter().map(|t| t.w).sum();
        let unit = (ts.bar_quarters * bars) / total;
        for t in toks {
            let dur_s = (unit * t.w * 60.0) / bpm;
            samples += (SR * dur_s).floor();
        }
    }
    let total_samples = samples * loops;
    let seconds = total_samples / SR;
    let audio_bytes = if mp3 { ((mp3_bitrate * 1000.0 / 8.0) * seconds).round() } else { 44.0 + total_samples * 2.0 };
    Summary { count, invalid, sig_bad: false, seconds, audio_bytes }
}

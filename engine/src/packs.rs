//! The compiled sample packs (the VSCO / FreePats / Freesound instruments): the index `packs.json` and where the pack
//! folders live. The twin of `getPackIndex` / `packFamily` / `instrumentOptions` / the credits list in the Electron
//! app's `App.jsx`; the samples themselves are fetched and decoded by the page-side audio, through the local server.

use serde::Deserialize;
use std::path::{Path, PathBuf};

#[derive(Clone, Debug, Default, PartialEq, Deserialize)]
#[serde(default)]
pub struct Pack {
    pub name: String,
    pub label: String,
    pub family: Option<String>,
    pub role: Option<String>,
    pub collection: Option<String>,
    pub instrument: Option<String>,
    pub articulation: Option<String>,
    pub author: Option<String>,
    pub license: Option<String>,
}

#[derive(Deserialize, Default)]
struct Index {
    #[serde(default)]
    packs: Vec<Pack>,
}

/// `getPackIndex`: no packs installed is a normal state (an empty list).
pub fn read_index(packs_dir: &Path) -> Vec<Pack> {
    std::fs::read_to_string(packs_dir.join("packs.json"))
        .ok()
        .and_then(|t| serde_json::from_str::<Index>(&t).ok())
        .map(|i| i.packs)
        .unwrap_or_default()
}

/// Where the pack folders are: `packs` beside the executable, and in a debug build the app's own `main/packs`.
pub fn find_dir(manifest_dir: &str) -> PathBuf {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(d) = exe.parent() {
            let beside = d.join("packs");
            if beside.join("packs.json").exists() {
                return beside;
            }
        }
    }
    Path::new(manifest_dir).join("..").join("packs")
}

const TUNED_PERCUSSION: [&str; 8] = ["marimba", "xylo", "glock", "bell", "chime", "timpani", "vibra", "celest"];

/// The family of a pack whose index entry predates the `family` field (`packFamily`).
pub fn pack_family(name: &str) -> &'static str {
    let prefix = name.split('-').next().unwrap_or("");
    match prefix {
        "keys" => "Keys",
        "strings" => {
            if name.contains("harp") {
                "Strings (Plucked)"
            } else {
                "Strings (Bowed)"
            }
        }
        "brass" => "Winds (Brass)",
        "woodwinds" => "Winds (Wood)",
        "percussion" | "vsco1percussion" => {
            if TUNED_PERCUSSION.iter().any(|t| name.contains(t)) { "Percussion (Tuned)" } else { "Percussion (Untuned)" }
        }
        _ => "Misc",
    }
}

/// The fixed section order of the instrument list.
pub const FAMILY_ORDER: [&str; 10] = [
    "Keys", "Strings (Plucked)", "Strings (Bowed)", "Winds (Wood)", "Winds (Brass)", "Percussion (Tuned)",
    "Percussion (Untuned)", "Voices", "Synth", "Misc",
];

/// The articulation short names (the pills): three characters, keyed by the articulation's name.
pub fn artic_abbr(name: &str) -> String {
    let known = match name {
        "Buzz" => "Buz",
        "Fall" => "Fal",
        "Fingered" => "Fng",
        "Hits" => "Hit",
        "Medium" => "Med",
        "Mute" => "Mut",
        "Harmon Mute" => "MuH",
        "Straight Mute" => "MuS",
        "Pizzicato" => "Piz",
        "Processed" => "Prc",
        "Rolls" => "Rol",
        "Short" => "Sht",
        "Spiccato" => "Spc",
        "Stabs" => "Stb",
        "Staccato" => "Stc",
        "Sustained" | "Sustained Long" => "Sus",
        "Sustained Non-Vibrato" => "SuN",
        "Sustained Vibrato" => "SuV",
        "Sweeps" => "Swe",
        "Tremolo" => "Trm",
        "Vibrato" | "Arco Vibrato" | "Expressive Vibrato" => "Vib",
        "Loud" => "L",
        "Loud Pedal" => "PdL",
        "Quiet" => "Q",
        "Quiet Pedal" => "PdQ",
        _ => "",
    };
    if known.is_empty() { name.chars().take(3).collect() } else { known.to_owned() }
}

/// One articulation of an instrument: the value the seed stores, its name, and its pill.
#[derive(Clone, Debug, PartialEq)]
pub struct Variant {
    pub value: String,
    pub label: String,
    pub abbr: String,
}

/// One list entry per INSTRUMENT (`instrumentOptions`): the built-in synth first, then each instrument with its
/// articulations as `variants`. The seed still stores the concrete `vsco:<id>` value.
#[derive(Clone, Debug, PartialEq)]
pub struct InstrumentOption {
    pub value: String,
    pub label: String,
    /// The source tag shown dim beside the row: `Yaiol` for the synth, else the pack's collection.
    pub group: String,
    pub family: String,
    /// `bass` hides the instrument from the treble picker when every variant is bass-only.
    pub role: String,
    pub variants: Vec<Variant>,
}

/// `sine_label` is the translated name of the built-in synth.
pub fn instrument_options(packs: &[Pack], sine_label: &str) -> Vec<InstrumentOption> {
    let mut out = vec![InstrumentOption {
        value: "sine".to_owned(),
        label: sine_label.to_owned(),
        group: "Yaiol".to_owned(),
        family: "Synth".to_owned(),
        role: String::new(),
        variants: Vec::new(),
    }];
    let mut keys: Vec<String> = Vec::new();
    let mut groups: Vec<InstrumentOption> = Vec::new();
    for p in packs {
        let family = p.family.clone().unwrap_or_else(|| pack_family(&p.name).to_owned());
        let instrument = p.instrument.clone().filter(|s| !s.is_empty()).unwrap_or_else(|| p.label.clone());
        let key = format!("{family}|{instrument}");
        let i = match keys.iter().position(|k| *k == key) {
            Some(i) => i,
            None => {
                keys.push(key);
                groups.push(InstrumentOption {
                    value: format!("vsco:{}", p.name),
                    label: instrument.clone(),
                    group: p.collection.clone().unwrap_or_else(|| "VSCO".to_owned()),
                    family,
                    role: "bass".to_owned(),
                    variants: Vec::new(),
                });
                groups.len() - 1
            }
        };
        let art = p.articulation.clone().filter(|s| !s.is_empty()).unwrap_or_else(|| instrument.clone());
        groups[i].variants.push(Variant { value: format!("vsco:{}", p.name), abbr: artic_abbr(&art), label: art });
        if p.role.as_deref() != Some("bass") {
            groups[i].role = p.role.clone().unwrap_or_default();
        }
    }
    out.extend(groups);
    out
}

/// The credits of the About tab: per author, the instruments (a CC BY one carries its licence), most instruments first.
pub fn credits(packs: &[Pack]) -> Vec<(String, String)> {
    let mut by_author: Vec<(String, Vec<(String, Option<String>)>)> = Vec::new();
    for p in packs {
        let Some(author) = p.author.clone().filter(|a| !a.is_empty()) else { continue };
        let inst = p.instrument.clone().unwrap_or_default();
        let a = match by_author.iter().position(|(n, _)| *n == author) {
            Some(i) => i,
            None => {
                by_author.push((author, Vec::new()));
                by_author.len() - 1
            }
        };
        if !by_author[a].1.iter().any(|(n, _)| *n == inst) {
            by_author[a].1.push((inst, p.license.clone()));
        }
    }
    let mut rows: Vec<(String, String, usize)> = by_author
        .into_iter()
        .map(|(author, mut insts)| {
            insts.sort_by(|x, y| x.0.to_lowercase().cmp(&y.0.to_lowercase()));
            let text = insts
                .iter()
                .map(|(n, lic)| match lic {
                    Some(l) if !l.is_empty() && l != "CC0" => format!("{n} ({l})"),
                    _ => n.clone(),
                })
                .collect::<Vec<_>>()
                .join(", ");
            let len = text.encode_utf16().count();
            (author, text, len)
        })
        .collect();
    // `b.instruments.length - a.instruments.length`: the longer text first, a stable sort
    rows.sort_by(|a, b| b.2.cmp(&a.2));
    rows.into_iter().map(|(a, t, _)| (a, t)).collect()
}

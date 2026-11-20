//! The texts the Electron app asks for by a key it builds (`t('optSeedStyle' + cap(k))`). A key passed through a variable
//! is invisible to the i18n audit, so each family is a table of literal `t("...")` calls: one arm per key, nothing built.

pub type T<'a> = &'a dyn Fn(&str) -> String;

pub fn style(t: T, key: &str) -> String {
    match key {
        "pad" => t("optSeedStylePad"),
        "drone" => t("optSeedStyleDrone"),
        "marker" => t("optSeedStyleMarker"),
        "arpeggio1" => t("optSeedStyleArpeggio1"),
        "arpeggio2" => t("optSeedStyleArpeggio2"),
        "arpeggio3" => t("optSeedStyleArpeggio3"),
        "arpeggio4" => t("optSeedStyleArpeggio4"),
        "arpeggio5" => t("optSeedStyleArpeggio5"),
        "arpeggio6" => t("optSeedStyleArpeggio6"),
        "groove1" => t("optSeedStyleGroove1"),
        _ => t("optSeedStyleCustom"),
    }
}

pub fn style_group(t: T, key: &str) -> String {
    match key {
        "pads" => t("lblSeedStyleGroupPads"),
        "arps" => t("lblSeedStyleGroupArps"),
        _ => t("lblSeedStyleGroupGrooves"),
    }
}

pub fn sig_group(t: T, key: &str) -> String {
    match key {
        "simple" => t("lblSeedSigGroupSimple"),
        _ => t("lblSeedSigGroupComplex"),
    }
}

pub fn swing(t: T, key: &str) -> String {
    match key {
        "light" => t("optSeedSwingLight"),
        "shuffle" => t("optSeedSwingShuffle"),
        "hard" => t("optSeedSwingHard"),
        _ => t("optSeedSwingNone"),
    }
}

pub fn reverb(t: T, key: &str) -> String {
    match key {
        "room" => t("optSeedReverbRoom"),
        "chamber" => t("optSeedReverbChamber"),
        "hall" => t("optSeedReverbHall"),
        "church" => t("optSeedReverbChurch"),
        _ => t("optSeedReverbNone"),
    }
}

/// The group labels of the flag column (`lblSeedFlag` + the group key).
pub fn flag_group(t: T, key: &str) -> String {
    match key {
        "octave" => t("lblSeedFlagOctave"),
        "scaleStep" => t("lblSeedFlagScaleStep"),
        "level" => t("lblSeedFlagLevel"),
        "length" => t("lblSeedFlagLength"),
        "condition" => t("lblSeedFlagCondition"),
        _ => t("lblSeedFlagPush"),
    }
}

/// The tooltip of a flag button (`tipSeedFlag` + the flag key).
pub fn flag_tip(t: T, key: &str) -> String {
    match key {
        "OctUp" => t("tipSeedFlagOctUp"),
        "OctDown" => t("tipSeedFlagOctDown"),
        "ScaleUp" => t("tipSeedFlagScaleUp"),
        "ScaleDown" => t("tipSeedFlagScaleDown"),
        "Accent" => t("tipSeedFlagAccent"),
        "Ghost" => t("tipSeedFlagGhost"),
        "Sustain" => t("tipSeedFlagSustain"),
        "Staccato" => t("tipSeedFlagStaccato"),
        "Last" => t("tipSeedFlagLast"),
        "NotLast" => t("tipSeedFlagNotLast"),
        _ => t("tipSeedFlagEarly"),
    }
}

/// The flag buttons: (group key, [(flag key, glyph)]) in the order of the column.
pub const FLAG_GROUPS: [(&str, &[(&str, &str)]); 6] = [
    ("octave", &[("OctUp", "+"), ("OctDown", "\u{2013}")]),
    ("scaleStep", &[("ScaleUp", "^"), ("ScaleDown", "v")]),
    ("level", &[("Accent", "!"), ("Ghost", "?")]),
    ("length", &[("Sustain", "s"), ("Staccato", "'")]),
    ("condition", &[("Last", "L"), ("NotLast", "l")]),
    ("push", &[("Early", "@")]),
];

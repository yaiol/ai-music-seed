//! The page's side of the sound. The sound is made in the page, by the Electron app's own audio files (bundled into
//! `assets/audio.js` and exposed as `window.amsd`), so what is heard and what is rendered are the same samples as there.
//! Rust pushes the active seed in and receives what the page reports (lit keys, the playhead, busy, a finished render).

use dioxus::prelude::*;
use serde::Deserialize;
use serde_json::Value;
use std::collections::HashMap;

/// A message from the page. `k` says what happened; the other fields are filled as that kind needs.
#[derive(Deserialize, Debug, Default)]
#[serde(default)]
pub struct Msg {
    pub k: String,
    /// `lit`: the keys sounding now, midi -> the lane's token.
    pub map: HashMap<String, String>,
    /// `pos`: the chord under the playhead and the quarter in the progression.
    pub chord: i64,
    pub q: f64,
    /// `playing`
    pub on: bool,
    /// an error text
    pub e: String,
    /// `busy`: instrument / render / save
    pub m: String,
    #[serde(rename = "audioPath")]
    pub audio_path: String,
    #[serde(rename = "midiPath")]
    pub midi_path: String,
}

/// The bundle, then the one line that makes the page send its messages to Rust.
pub fn bridge_js() -> String {
    format!("{}\nwindow.amsd.sink = (m) => dioxus.send(m);", include_str!("../assets/audio.js"))
}

fn run(script: String) {
    let _ = document::eval(&script);
}

fn json_str(s: &str) -> String {
    serde_json::to_string(s).unwrap_or_else(|_| "\"\"".to_owned())
}

pub fn init(base_url: &str) {
    run(format!("window.amsd.init({});", json_str(base_url)));
}

pub fn set_seed(seed: &Value) {
    run(format!("window.amsd.setSeed({seed});"));
}

pub fn play(seed: &Value) {
    run(format!("window.amsd.setSeed({seed}); window.amsd.play();"));
}

pub fn stop() {
    run("window.amsd.stop();".to_owned());
}

pub fn render(seed: &Value, dir: &str, name: &str) {
    run(format!("window.amsd.render({seed}, {}, {});", json_str(dir), json_str(name)));
}

pub fn audition(midi: u32) {
    run(format!("window.amsd.audition({midi});"));
}

pub fn set_tune(trim: f64) {
    run(format!("window.amsd.setTune({trim});"));
}

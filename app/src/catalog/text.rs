// twin: uis-text.js jsx@6b0ccb44785e rsx@ac5b0f0bd140
//! Text helpers — twin of `uis-text.js`: `LbsLblShortSet` / `LbsLblShort`, a caption shortened for a control
//! with no room for the whole word ("velocity" -> "vel"). There is NO second implementation: the rules
//! (the abbreviable scripts, the cut by GRAPHEME not by code unit, the cut length that grows until every
//! caption in the set is distinct) are the shared `uis-text.js` itself - the file is copied beside the app's
//! CSS and run by the WebView's own engine, whose `Intl.Segmenter` and Unicode script classes are exactly
//! the ones the electron apps use. Rust has neither in its standard library.
//!
//! The answer is therefore asked of the page, so it arrives a moment after the first render: until then
//! the captions are returned whole, which is only ever wider, never wrong.
//! Differs: none - it IS the JS file, run by the page; the answer arrives one beat after the first render (the
//! captions are whole until then).

use dioxus::prelude::*;

/// The same file the electron apps import.
const TEXT_JS: &str = include_str!("../../assets/uis-text.js");

fn script(texts: &[String], max: usize) -> String {
    // The file is an ES module; run as a plain script its `export` keywords are dropped.
    let module = TEXT_JS.replace("export function", "function");
    let payload = serde_json::to_string(texts).unwrap_or_else(|_| "[]".into());
    format!("{module}\ndioxus.send(LbsLblShortSet({payload}, {max}));")
}

/// A SET of captions shortened together (shortening is a property of the set, so two captions never end
/// up identical). `max` is the target length, 3 by convention.
pub async fn lbl_short_set(texts: Vec<String>, max: usize) -> Vec<String> {
    match document::eval(&script(&texts, max)).recv::<Vec<String>>().await {
        Ok(short) if short.len() == texts.len() => short,
        _ => texts,
    }
}

/// Hook form: the shortened captions, whole until the page has answered.
pub fn use_lbl_short_set(texts: Vec<String>, max: usize) -> Vec<String> {
    let fallback = texts.clone();
    let short = use_resource(use_reactive!(|(texts, max)| async move { lbl_short_set(texts, max).await }));
    short.read().clone().unwrap_or(fallback)
}

/// One caption on its own - the same rules, with no set to disambiguate against.
pub fn use_lbl_short(text: &str, max: usize) -> String {
    use_lbl_short_set(vec![text.to_string()], max).into_iter().next().unwrap_or_default()
}

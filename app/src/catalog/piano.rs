// twin: uis-ctl-piano.jsx jsx@7c9b4bc8e110 rsx@b4d9bc57ccaa
//! UisPiano - twin of `uis-ctl-piano.jsx`: a strip of white keys sharing the row's width, black keys riding
//! the boundaries between them. A display + audition control: keys light to show notes that sound, a press
//! on a key reports it. Same classes and element order, so the paired `uis-ctl-piano.css` skins it.
//!
//! `lo`..`hi` is the MIDI range, both included (default 24..96 = C1..C7). `lit` maps a MIDI number to the
//! lit colour of that key, `"a"` or `"b"` (the tokens `--uis-pno-lit-a` / `--uis-pno-lit-b`, which an app
//! points at its own two colours). `on_play` runs on pointer-down.
//! Differs: the stylesheet is added to the page once by id through `document::eval` (the JSX imports its CSS), because a `document::Style` inside a control logs a warning on every re-render.

use dioxus::prelude::*;
use std::collections::HashMap;

const CSS: &str = include_str!("../../assets/uis-ctl-piano.css");
const BLACK_PC: [u32; 5] = [1, 3, 6, 8, 10];

#[component]
pub fn UisPiano(
    #[props(default = 24)] lo: u32,
    #[props(default = 96)] hi: u32,
    #[props(default)] lit: HashMap<u32, String>,
    #[props(default)] on_play: EventHandler<u32>,
) -> Element {
    let mut whites: Vec<u32> = Vec::new();
    let mut blacks: Vec<(u32, usize)> = Vec::new();
    for m in lo..=hi {
        if BLACK_PC.contains(&(m % 12)) {
            blacks.push((m, whites.len()));
        } else {
            whites.push(m);
        }
    }
    let total = whites.len() as f64;
    let cls = |m: u32, base: &str| match lit.get(&m) {
        Some(c) => format!("uis-pno-key {base} on-{c}"),
        None => format!("uis-pno-key {base}"),
    };

    // the stylesheet goes into the page once; a `document::Style` here logs a warning on every re-render
    use_hook(|| {
        let _ = document::eval(&format!(
            "if (!document.getElementById({id:?})) {{ const s = document.createElement('style'); s.id = {id:?}; s.textContent = {css:?}; document.head.appendChild(s); }}",
            id = "uis-pno-css",
            css = CSS
        ));
    });
    rsx! {
        div { class: "uis-pno",
            for m in whites.iter().copied() {
                button {
                    key: "{m}",
                    r#type: "button",
                    class: "{cls(m, \"white\")}",
                    onpointerdown: move |_| on_play.call(m),
                }
            }
            for (m , at) in blacks.iter().copied() {
                button {
                    key: "{m}",
                    r#type: "button",
                    class: "{cls(m, \"black\")}",
                    style: "left: {at as f64 / total * 100.0}%",
                    onpointerdown: move |_| on_play.call(m),
                }
            }
        }
    }
}

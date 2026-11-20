// twin: uis-ctl-knob.jsx jsx@9223e76a4dfa rsx@670f3c11830d
//! UisKnob — twin of `uis-ctl-knob.jsx`: the compact instrument-style value control. A label on top, a round
//! drag body in the middle, and a directly-editable value underneath (the hardware-knob idiom of music
//! tools). Same classes and element order, so the paired `uis-ctl-knob.css` (carried by this control, like
//! the JSX imports it) skins it.
//!
//! Drag the body vertically - up increases, down decreases, quantised to `step`; the full drag travel
//! (~150 px) spans the whole range. The value line is a real input: click it, type a number, Enter/blur
//! commits (clamped + quantised), Escape reverts. `unit` is display-only. `arc` fills the travelled sweep
//! as a ring (for an AMOUNT measured from its minimum); `inline` is the one-control-height tier.
//!
//! Pointer capture and "select the whole value on focus" have no Rust API, so they go through
//! `document::eval` by element id - the one place this control touches the JS bridge.
//! Differs: none.

use dioxus::prelude::*;
use std::sync::atomic::{AtomicU32, Ordering};

const CSS: &str = include_str!("../../assets/uis-ctl-knob.css");
static NEXT_ID: AtomicU32 = AtomicU32::new(1);

#[component]
pub fn UisKnob(
    label: String,
    value: f64,
    #[props(default = 0.0)] min: f64,
    #[props(default = 100.0)] max: f64,
    #[props(default = 1.0)] step: f64,
    #[props(default)] unit: String,
    #[props(default = false)] disabled: bool,
    #[props(default = false)] inline: bool,
    #[props(default = false)] arc: bool,
    /// The tooltip - where the caption is SHORTENED to fit, this is where the whole word stays readable.
    #[props(default)] title: String,
    on_change: EventHandler<f64>,
) -> Element {
    let id = use_hook(|| format!("knob-{}", NEXT_ID.fetch_add(1, Ordering::Relaxed)));
    // None = showing; Some = the draft being typed.
    let mut editing = use_signal(|| Option::<String>::None);
    // (pointer start y, value at the start) while the body is held.
    let mut drag = use_signal(|| Option::<(f64, f64)>::None);

    let clamp_q = move |v: f64| {
        let q = ((v - min) / step).round() * step + min;
        // float noise (0.30000000000000004) would leak into the value line
        let fixed = (q * 1e6).round() / 1e6;
        fixed.clamp(min, max)
    };

    let mut commit = move || {
        if let Some(text) = editing() {
            let cleaned: String = text
                .replace(',', ".")
                .chars()
                .filter(|c| c.is_ascii_digit() || matches!(c, '.' | '+' | '-'))
                .collect();
            if let Ok(n) = cleaned.parse::<f64>() {
                if n.is_finite() {
                    on_change.call(clamp_q(n));
                }
            }
        }
        editing.set(None);
    };

    // -135deg..+135deg over the range, the convention every hardware knob follows.
    let frac = if max > min { (value - min) / (max - min) } else { 0.0 };
    let angle = -135.0 + 270.0 * frac;

    let class = {
        let mut c = String::from("uis-knb");
        if inline {
            c.push_str(" inline");
        }
        if disabled {
            c.push_str(" disabled");
        }
        c
    };
    let shown = match editing() {
        Some(text) => text,
        None if unit.is_empty() => format!("{value}"),
        None => format!("{value} {unit}"),
    };
    let body_id = format!("{id}-body");
    let value_id = format!("{id}-value");
    let (body_for_down, value_for_focus, value_for_key) = (body_id.clone(), value_id.clone(), value_id.clone());

    rsx! {
        document::Style { "{CSS}" }
        div { class: "{class}", title: if title.is_empty() { None } else { Some(title.clone()) },
            span { class: "uis-knb-label", "{label}" }
            button {
                id: "{body_id}",
                r#type: "button",
                class: "uis-knb-body",
                "aria-label": "{label}",
                disabled,
                onpointerdown: move |e| {
                    if disabled {
                        return;
                    }
                    e.prevent_default();
                    let pointer = e.pointer_id();
                    drag.set(Some((e.client_coordinates().y, value)));
                    let _ = document::eval(&format!(
                        "document.getElementById('{body_for_down}')?.setPointerCapture({pointer});"
                    ));
                },
                onpointermove: move |e| {
                    if let Some((start_y, start_value)) = drag() {
                        let travel = (start_y - e.client_coordinates().y) / 150.0; // full drag ~ 150 px
                        on_change.call(clamp_q(start_value + travel * (max - min)));
                    }
                },
                onpointerup: move |_| drag.set(None),
                onpointercancel: move |_| drag.set(None),
                // `pathLength` re-scales the circle to 360 units so the dash IS the swept angle; the
                // rotate puts unit 0 at the knob's minimum (-135deg), which an SVG circle would
                // otherwise place at 3 o'clock.
                if arc {
                    svg { class: "uis-knb-arc", view_box: "0 0 30 30", "aria-hidden": "true",
                        circle {
                            cx: "15",
                            cy: "15",
                            r: "9",
                            "pathLength": "360",
                            stroke_dasharray: "{270.0 * frac} 360",
                            transform: "rotate(135 15 15)",
                        }
                    }
                }
                // The two are alternatives, never both: the arc ALREADY ends at the value, so a tick
                // there is the same statement drawn twice. An empty ring is the minimum.
                if !arc {
                    span { class: "uis-knb-tick", style: "transform: rotate({angle}deg)" }
                }
            }
            input {
                id: "{value_id}",
                class: "uis-knb-value",
                disabled,
                value: "{shown}",
                onfocus: move |_| {
                    editing.set(Some(format!("{value}")));
                    // Select the whole value once the raw number is in the field - a click means
                    // "replace this", not "insert into it".
                    let _ = document::eval(&format!(
                        "requestAnimationFrame(() => document.getElementById('{value_for_focus}')?.select());"
                    ));
                },
                oninput: move |e| editing.set(Some(e.value())),
                onblur: move |_| commit(),
                onkeydown: move |e| match e.key() {
                    Key::Enter => {
                        commit();
                        let _ = document::eval(&format!("document.getElementById('{value_for_key}')?.blur();"));
                    }
                    Key::Escape => {
                        editing.set(None);
                        let _ = document::eval(&format!("document.getElementById('{value_for_key}')?.blur();"));
                    }
                    _ => {}
                },
            }
        }
    }
}

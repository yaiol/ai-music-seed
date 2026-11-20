//! Icons the `dioxus-free-icons` release does not have (lucide `save-plus`, same view box, stroke and caps as the crate's
//! own) and the icons that are files of ours (`FileIcon`: the instrument families).

use dioxus::prelude::*;
use dioxus_free_icons::IconShape;

/// lucide `save-plus` (the Save As button).
#[derive(Clone, Copy, PartialEq)]
pub struct LdSavePlus;

impl IconShape for LdSavePlus {
    fn view_box(&self) -> &str {
        "0 0 24 24"
    }
    fn xmlns(&self) -> &str {
        "http://www.w3.org/2000/svg"
    }
    fn fill_and_stroke<'a>(&self, user_color: &'a str) -> (&'a str, &'a str, &'a str) {
        ("none", user_color, "2")
    }
    fn stroke_linecap(&self) -> &str {
        "round"
    }
    fn stroke_linejoin(&self) -> &str {
        "round"
    }
    fn child_elements(&self) -> Element {
        rsx! {
            path { d: "M12.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10.2a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V12" }
            path { d: "M16 13H8a1 1 0 0 0-1 1v7" }
            path { d: "M19 22v-6" }
            path { d: "M22 19h-6" }
            path { d: "M7 3v4a1 1 0 0 0 1 1h7" }
        }
    }
}

pub const FAMILY_KEYS: &str = include_str!("../assets/icon-yaiol-family-keys.svg");
pub const FAMILY_PERCUSSION_TUNED: &str = include_str!("../assets/icon-yaiol-family-percussion-tuned.svg");
pub const FAMILY_STRINGS_PLUCKED: &str = include_str!("../assets/icon-yaiol-family-strings-plucked.svg");
pub const FAMILY_STRINGS_BOWED: &str = include_str!("../assets/icon-yaiol-family-strings-bowed.svg");
pub const FAMILY_SYNTH: &str = include_str!("../assets/icon-yaiol-family-synth.svg");
pub const FAMILY_VOICES: &str = include_str!("../assets/icon-yaiol-family-voices.svg");
pub const FAMILY_WINDS_BRASS: &str = include_str!("../assets/icon-yaiol-family-winds-brass.svg");
pub const FAMILY_WINDS_WOOD: &str = include_str!("../assets/icon-yaiol-family-winds-wood.svg");

/// An icon that is a file: its shapes are put in the page as real elements, so it takes the button's colour.
#[component]
pub fn FileIcon(svg: &'static str, #[props(default = 14)] size: u32) -> Element {
    let (view_box, shapes) = file_icon_parts(svg);
    rsx! {
        svg {
            width: "{size}",
            height: "{size}",
            view_box: "{view_box}",
            xmlns: "http://www.w3.org/2000/svg",
            "aria-hidden": "true",
            dangerous_inner_html: "{shapes}",
        }
    }
}

fn file_icon_parts(svg: &str) -> (&str, &str) {
    let open = svg.find("<svg").unwrap_or(0);
    let head_end = svg[open..].find('>').map_or(svg.len(), |i| open + i);
    let head = &svg[open..head_end];
    let view_box = head
        .find("viewBox=\"")
        .map(|i| &head[i + 9..])
        .and_then(|rest| rest.find('"').map(|end| &rest[..end]))
        .unwrap_or("0 0 24 24");
    let body_start = (head_end + 1).min(svg.len());
    let body_end = svg.rfind("</svg>").unwrap_or(svg.len()).max(body_start);
    (view_box, &svg[body_start..body_end])
}

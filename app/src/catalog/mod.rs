//! The yaiol UI catalog, Dioxus implementation.
//!
//! One catalog, two implementations: the CSS in `assets/` is the shared contract (copied from the
//! shared catalog, never edited here), and each control below emits the SAME class names and
//! element structure as its JSX twin in the shared catalog. Only the controls this app uses are
//! ported; the rest are `pending` — see the project's CLAUDE.md for the status table.

mod bar_window;
mod cbo_filter;
mod cbo_standard;
mod filedrop;
mod knob;
mod num;
mod piano;
mod pkr_color;
mod popover;
mod header;
mod icons;
pub mod news;
mod dlg_news;
mod news_loader;
mod markdown_renderer;
mod stg_view;
mod text;

pub use bar_window::UisBarWindow;
pub use header::UisAppHeader;
pub use icons::UisIcoGithub;
pub use news_loader::{UisBtnNews, UisBtnUpdate, UisNewsLoader};
pub use stg_view::UisStgView;
pub use text::use_lbl_short_set;
pub use cbo_filter::{UisCboCategory, UisCboFilter};
pub use cbo_standard::UisComboItem;
pub use filedrop::LbsDropZone;
pub use knob::UisKnob;
pub use num::UisNum;
pub use piano::UisPiano;
pub use pkr_color::UisPkrColor;

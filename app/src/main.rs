// data-icon="yaiol:ai-music-seed"
// ⚠ NO HARDCODED UI STRINGS IN THIS FILE.
//   Every string a user can read - text, title, aria-label - MUST go through the t() lookup, and
//   the key MUST be a string literal at the call site. Add the key to locales/en.json, then
//   translate, sort and audit every language with the i18n scripts. Never paste translations by hand.

mod audio;
mod catalog;
mod grid;
mod i18n;
mod icons;
mod instance;
mod labels;
mod panel;
mod settings;
mod site;
mod window_accent;
mod window_menu;

use catalog::{LbsDropZone, UisAppHeader, UisBarWindow, UisBtnNews, UisBtnUpdate, UisIcoGithub, UisNewsLoader, UisPkrColor, UisStgView, news};
use dioxus::prelude::*;
use dioxus_free_icons::{
    Icon,
    icons::ld_icons::{LdCircleHelp, LdFilePlus, LdFolderOpen, LdSave, LdSettings, LdX},
};
use engine::{
    files, packs,
    seed::{Seed, basename, build_seed, compute_file_name, dirname, seed_from_file, to_js_seed},
};
use icons::LdSavePlus;
use panel::{Edit, SeedPanel};
use serde_json::Value;
use settings::Settings;
use std::{collections::HashMap, time::Duration};

const CSS: [&str; 5] = [
    include_str!("../assets/uis-colors.css"),
    include_str!("../assets/uis-app.css"),
    include_str!("../assets/uis-bar-window.css"),
    include_str!("../assets/uis-ctl-grd-sequencer.css"),
    include_str!("../assets/app.css"),
];

// ─── App identity - single source of truth: Cargo.toml (see build.rs) ───────────────────────────
const APP_NAME: &str = env!("YAIOL_PRODUCT_NAME");
const APP_ID: &str = env!("CARGO_PKG_NAME");
const APP_VERSION: &str = env!("CARGO_PKG_VERSION");

/// This build's identity, `<version>.<counter>`, as ONE contiguous string that survives into the
/// executable. The apps-cockpit finds it by its `yaiol-build:` prefix to tell a buffered build from
/// the release it follows - the counter cannot ride in Cargo's three-part version, and `dx bundle`
/// writes its own Windows version resource, so this is the one channel that is entirely ours.
/// ⚠ keep it a single `concat!` of literals, and read it through `black_box` (as
/// app_version_build does). A plain `BUILD_ID["yaiol-build:".len()..]` is constant-folded and the
/// optimiser keeps only the suffix - the PREFIX the cockpit searches for disappears from the exe and
/// every build reads as the bare release (found 2026-10-12 by grepping the staged exe).
const BUILD_ID: &str = concat!("yaiol-build:", env!("YAIOL_BUILD_ID"));

/// The full build identity shown to the user: the release version plus the build counter (the 4th
/// segment a buffered commit bumps), or just the release version on a clean build.
/// ⚠ DISPLAY ONLY. The release version (`CARGO_PKG_VERSION`) stays plain three-part semver
/// and must not absorb the counter: an update check compares it against the published version, and
/// four parts is not semver.
fn app_version_build() -> String {
    let full = std::hint::black_box(BUILD_ID);
    let id = &full["yaiol-build:".len()..];
    id.strip_suffix(".0").unwrap_or(id).to_owned()
}

/// The window's place. Only a debug build needs it written out: see main().
#[cfg(debug_assertions)]
fn explicit_placement(window: dioxus::desktop::WindowBuilder) -> dioxus::desktop::WindowBuilder {
    window.with_position(dioxus::desktop::LogicalPosition::new(120.0, 80.0))
}

#[cfg(not(debug_assertions))]
fn explicit_placement(window: dioxus::desktop::WindowBuilder) -> dioxus::desktop::WindowBuilder {
    window
}

/// The window has no system frame: the app draws its own bar (`UisBarWindow`), which moves it and holds the three
/// window buttons. The system still resizes it from its edges, and on Windows it keeps its shadow.
fn frameless(window: dioxus::desktop::WindowBuilder) -> dioxus::desktop::WindowBuilder {
    let window = window.with_decorations(false);
    #[cfg(windows)]
    let window = {
        use dioxus::desktop::tao::platform::windows::WindowBuilderExtWindows;
        window.with_undecorated_shadow(true)
    };
    window
}

fn main() {
    // ⚠ ONE window. A second launch hands the `.yams` it was asked to open to the window already open and
    // ends here (see instance.rs).
    if !instance::claim() {
        return;
    }
    // ⚠ in a DEBUG build Dioxus writes the window's position and size to `window-state.json` in
    // the temp folder when the app ends and puts the window back there on the next launch - for EVERY
    // Dioxus app on the machine, from the one shared file. A session that ended while the window was
    // MINIMIZED saved (-32000, -32000) and a 200 px square, so the next `cargo run` opened off screen
    // at that size and could not be brought back. Dioxus restores only what the app did NOT set
    // explicitly, so a debug build sets both, here. A release build never restores anything.
    // The size is the Electron app's own: 1200 x 760, no smaller than 1120 x 665.
    let window = frameless(explicit_placement(
        dioxus::desktop::WindowBuilder::new()
            .with_title(APP_NAME)
            .with_inner_size(dioxus::desktop::LogicalSize::new(1200.0, 760.0))
            .with_min_inner_size(dioxus::desktop::LogicalSize::new(1120.0, 665.0)),
    ));

    dioxus::LaunchBuilder::desktop()
        .with_cfg(
            dioxus::desktop::Config::new()
                // ⚠ the browser's own right-click menu (Back, Reload, Save as, Print, Inspect) is
                // never offered. Dioxus keeps it in a debug build by default - which is how it reached the
                // list on 2026-10-13 - and an app that wants a context menu draws its own.
                .with_disable_context_menu(true)
                .with_window(window)
                .with_menu(None::<dioxus::desktop::muda::Menu>),
        )
        .launch(App);
}

/// The open seeds (one tab each) and everything the window does with them. All fields are signals, so the whole
/// struct is `Copy` and a handler takes it by value.
#[derive(Clone, Copy)]
struct Doc {
    seeds: Signal<Vec<Seed>>,
    active: Signal<String>,
    lang: Signal<String>,
    busy: Signal<bool>,
    busy_msg: Signal<String>,
    playing: Signal<bool>,
    lit: Signal<HashMap<u32, String>>,
    pos: Signal<Option<(i64, f64)>>,
    tune: Signal<f64>,
    /// The tab a render in progress belongs to.
    render_id: Signal<String>,
}

impl Doc {
    fn t(self, key: &str) -> String {
        i18n::t(&self.lang.peek(), key)
    }

    fn current(self) -> Option<Seed> {
        let id = self.active.peek().clone();
        self.seeds.peek().iter().find(|s| s.id == id).cloned()
    }

    /// Change one seed without marking it unsaved (render result, error, save bookkeeping).
    fn patch(self, id: &str, f: impl FnOnce(&mut Seed)) {
        let mut seeds = self.seeds;
        if let Some(s) = seeds.write().iter_mut().find(|s| s.id == id) {
            f(s);
        }
    }

    fn set_error(self, id: &str, text: String) {
        self.patch(id, |s| s.error = text);
    }

    /// A user edit of the active seed: it marks the seed unsaved, except a change of the lane monitor, which is not in
    /// the `.yams` (an edit dot over a change no Save could capture would be a lie).
    fn edit(self, f: Edit) {
        let id = self.active.peek().clone();
        let mut seeds = self.seeds;
        let mut all = seeds.write();
        if let Some(s) = all.iter_mut().find(|s| s.id == id) {
            let mut before = s.clone();
            f(s);
            before.lanes = s.lanes.clone();
            if *s != before {
                s.unsaved = true;
            }
        }
    }

    fn new_seed(self) {
        let s = Seed::new();
        let mut active = self.active;
        let mut seeds = self.seeds;
        active.set(s.id.clone());
        seeds.write().push(s);
    }

    /// Open a parsed `.yams`: focus the tab already bound to the same path (refreshing it from the file), else add one.
    fn open_seed(self, value: &Value, path: Option<&str>) {
        let doc = seed_from_file(value, path);
        let mut active = self.active;
        let mut seeds = self.seeds;
        if let Some(p) = path {
            let mut all = seeds.write();
            if let Some(existing) = all.iter_mut().find(|x| x.file_path.as_deref() == Some(p)) {
                let id = existing.id.clone();
                *existing = Seed { id: id.clone(), ..doc };
                drop(all);
                active.set(id);
                return;
            }
        }
        active.set(doc.id.clone());
        seeds.write().push(doc);
    }

    /// Read a `.yams` from disk and open it; a failure is told on the tab in front.
    fn open_path(self, path: &str) {
        match files::read_yams(path) {
            Ok(v) if v.is_object() => self.open_seed(&v, Some(path)),
            Ok(_) => self.load_failed("invalid".to_owned()),
            Err(e) => self.load_failed(e),
        }
    }

    fn load_failed(self, e: String) {
        if let Some(s) = self.current() {
            let text = format!("{}: {e}", self.t("msgSeedLoadFailed"));
            self.set_error(&s.id, text);
        }
    }

    /// Close a tab. The app never sits with zero seeds: closing the last one drops a blank in its place.
    fn close_seed(self, id: &str) {
        let mut active = self.active;
        let mut seeds = self.seeds;
        let mut all = seeds.write();
        let Some(idx) = all.iter().position(|s| s.id == id) else { return };
        all.remove(idx);
        if all.is_empty() {
            let s = Seed::new();
            active.set(s.id.clone());
            all.push(s);
        } else if *active.peek() == id {
            active.set(all[idx.min(all.len() - 1)].id.clone());
        }
    }

    async fn load(self) {
        let window = dioxus::desktop::window();
        let dirs = settings::folder().map(|f| files::DialogDirs::new(&f));
        let mut dialog = rfd::AsyncFileDialog::new().set_parent(&window.window).set_title(self.t("ttlSeedLoad")).add_filter(self.t("lblSeedLoadFilter"), &["yams"]);
        if let Some(dir) = dirs.as_ref().and_then(|d| d.last("load-seed")) {
            dialog = dialog.set_directory(native_path(&dir.to_string_lossy()));
        }
        let Some(file) = dialog.pick_file().await else { return };
        let path = file.path().to_string_lossy().into_owned();
        if let Some(d) = &dirs {
            d.remember("load-seed", &path);
        }
        self.open_path(&path);
    }

    async fn save(self) {
        let Some(s) = self.current() else { return };
        let Some(path) = s.file_path.clone() else {
            self.save_as().await;
            return;
        };
        self.set_error(&s.id, String::new());
        match files::write_yams(&path, &build_seed(&s)) {
            Ok(()) => self.patch(&s.id, |x| x.unsaved = false),
            Err(e) => {
                let text = format!("{}: {e}", self.t("msgSeedSaveFailed"));
                self.set_error(&s.id, text);
            }
        }
    }

    async fn save_as(self) {
        let Some(s) = self.current() else { return };
        self.set_error(&s.id, String::new());
        let window = dioxus::desktop::window();
        let name = format!("{}.yams", compute_file_name(&s));
        let mut dialog = rfd::AsyncFileDialog::new()
            .set_parent(&window.window)
            .set_title(self.t("ttlSeedSaveAs"))
            .add_filter(self.t("lblSeedLoadFilter"), &["yams"])
            .set_file_name(name);
        if let Some(path) = &s.file_path {
            dialog = dialog.set_directory(native_path(&dirname(path)));
        }
        let Some(file) = dialog.save_file().await else { return };
        let path = file.path().to_string_lossy().into_owned();
        match files::write_yams(&path, &build_seed(&s)) {
            Ok(()) => self.patch(&s.id, |x| {
                x.file_name = basename(&path);
                x.file_path = Some(path.clone());
                x.unsaved = false;
            }),
            Err(e) => {
                let text = format!("{}: {e}", self.t("msgSeedSaveFailed"));
                self.set_error(&s.id, text);
            }
        }
    }

    fn toggle_play(self) {
        let Some(s) = self.current() else { return };
        if *self.playing.peek() {
            audio::stop();
            return;
        }
        if s.progression.trim().is_empty() {
            let text = self.t("msgSeedEmpty");
            self.set_error(&s.id, text);
            return;
        }
        self.set_error(&s.id, String::new());
        audio::play(&to_js_seed(&s));
    }

    fn render(self) {
        let Some(s) = self.current() else { return };
        let Some(path) = s.file_path.clone() else { return };
        self.patch(&s.id, |x| {
            x.error = String::new();
            x.result = None;
        });
        if s.progression.trim().is_empty() {
            let text = self.t("msgSeedEmpty");
            self.set_error(&s.id, text);
            return;
        }
        let (mut busy, mut render_id) = (self.busy, self.render_id);
        busy.set(true);
        render_id.set(s.id.clone());
        audio::render(&to_js_seed(&s), &dirname(&path), &compute_file_name(&s));
    }

    fn finish_render(self) {
        let (mut busy, mut busy_msg) = (self.busy, self.busy_msg);
        busy.set(false);
        busy_msg.set(String::new());
    }

    /// What the page reports: the keys sounding, the playhead, whether it plays, the render's stages and its end.
    fn on_page(self, m: audio::Msg) {
        let (mut lit, mut pos, mut playing, mut busy_msg) = (self.lit, self.pos, self.playing, self.busy_msg);
        match m.k.as_str() {
            "lit" => lit.set(m.map.iter().filter_map(|(k, v)| Some((k.parse().ok()?, v.clone()))).collect()),
            "pos" => pos.set(if m.chord < 0 { None } else { Some((m.chord, m.q)) }),
            "playing" => playing.set(m.on),
            "playFailed" => {
                playing.set(false);
                if let Some(s) = self.current() {
                    let text = format!("{}: {}", self.t("msgSeedPlayFailed"), m.e);
                    self.set_error(&s.id, text);
                }
            }
            "busy" => busy_msg.set(match m.m.as_str() {
                "instrument" => self.t("msgSeedBusyInstrument"),
                "render" => self.t("msgSeedBusyRender"),
                _ => self.t("msgSeedBusySave"),
            }),
            "rendered" => {
                let id = self.render_id.peek().clone();
                self.patch(&id, |x| x.result = Some((m.audio_path.clone(), m.midi_path.clone())));
                self.finish_render();
            }
            "renderFailed" => {
                let id = self.render_id.peek().clone();
                let text = format!("{}: {}", self.t("msgSeedFailed"), m.e);
                self.set_error(&id, text);
                self.finish_render();
            }
            _ => {}
        }
    }
}

/// Open the file manager with the finished file selected (its folder where the platform cannot select).
fn show_in_folder(file: &str) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        let arg = format!("/select,\"{file}\"");
        if std::process::Command::new("explorer").raw_arg(arg).spawn().is_ok() {
            return;
        }
    }
    if let Some(dir) = std::path::Path::new(file).parent() {
        let _ = open::that(dir);
    }
}

/// The three blocks of the stack whose colour the user can pick, in stack order: the CSS token (`--seed-<key>`).
const BLOCK_KEYS: [&str; 3] = ["treble", "bass", "chords"];

#[component]
fn App() -> Element {
    let saved = use_hook(settings::load);
    let mut lang = use_signal(|| saved.lang.clone());
    let mut theme = use_signal(|| saved.theme.clone());
    // The picked colour of each block (treble, bass, chords); None = the stylesheet's default.
    let mut colors = use_signal(|| [saved.treble_color.clone(), saved.bass_color.clone(), saved.chords_color.clone()]);
    // What each block is painted with by default, read back from the page (the swatch shows it until a colour is picked).
    let mut defaults = use_signal(|| [String::new(), String::new(), String::new()]);
    let mut settings_open = use_signal(|| false);
    // The window bar shows maximize or restore: the window says which, and says so again whenever its size
    // changes (the bar's own button is one way among several: a snap, Win+Up, a double click).
    let mut maximized = use_signal(|| dioxus::desktop::window().is_maximized());
    // The bar is painted like the system's own title bars: the accent colour when the system colours them, and only
    // while this window is the active one (an inactive title bar is neutral). Read again each time the window comes
    // to the front, so a colour changed in the system's settings shows on return.
    let mut bar_colour = use_signal(window_accent::title_bar);
    dioxus::desktop::use_wry_event_handler(move |event, _| {
        if let dioxus::desktop::tao::event::Event::WindowEvent { event, .. } = event {
            match event {
                dioxus::desktop::WindowEvent::Resized(_) => {
                    let now = dioxus::desktop::window().is_maximized();
                    if *maximized.peek() != now {
                        maximized.set(now);
                    }
                }
                dioxus::desktop::WindowEvent::Focused(active) => {
                    let now = if *active { window_accent::title_bar() } else { None };
                    if *bar_colour.peek() != now {
                        bar_colour.set(now);
                    }
                }
                _ => {}
            }
        }
    });
    use_effect(move || {
        let script = match bar_colour() {
            Some(rgb) => {
                let (bgd, text, hov) = window_accent::bar_colours(rgb);
                format!("const s=document.documentElement.style; s.setProperty('--uis-win-bar-bgd','{bgd}'); s.setProperty('--uis-win-bar-text','{text}'); s.setProperty('--uis-win-bar-hov','{hov}');")
            }
            None => "const s=document.documentElement.style; s.removeProperty('--uis-win-bar-bgd'); s.removeProperty('--uis-win-bar-text'); s.removeProperty('--uis-win-bar-hov');".to_owned(),
        };
        let _ = document::eval(&script);
    });
    // "Show news from yaiol": ONE switch per MACHINE, shared by every yaiol app (a small file in the yaiol
    // app-data folder), so it is read from there rather than from this app's own settings.
    let mut news_on = use_signal(|| news::read_state().enabled);

    // <html> carries the language and the theme: the catalog CSS keys off `data-theme`. No `dir`: the Electron app leaves every
    // language left to right (the catalog has no right-to-left layer), and this app draws the same page.
    use_effect(move || {
        let code = lang();
        let _ = document::eval(&format!(
            "const r=document.documentElement; r.setAttribute('lang','{}'); r.setAttribute('data-theme','{}');",
            code.replace('_', "-"),
            theme()
        ));
    });

    // A picked block colour overrides the stylesheet's token on <html>; none removes the override, so the default (and
    // its theme-following) comes back.
    use_effect(move || {
        let picked = colors();
        let mut script = String::from("const s=document.documentElement.style;");
        for (key, color) in BLOCK_KEYS.iter().zip(picked.iter()) {
            match color {
                Some(c) => script.push_str(&format!("s.setProperty('--seed-{key}', {});", serde_json::to_string(c).unwrap_or_default())),
                None => script.push_str(&format!("s.removeProperty('--seed-{key}');")),
            }
        }
        let _ = document::eval(&script);
    });

    // The swatch of an unpicked block shows what the block is painted with right now: the stylesheet's resolved default.
    use_effect(move || {
        let _ = (theme(), colors(), settings_open());
        spawn(async move {
            let mut page = document::eval("dioxus.send(['treble','bass','chords'].map(k => getComputedStyle(document.documentElement).getPropertyValue('--seed-' + k).trim()));");
            if let Ok(found) = page.recv::<Vec<String>>().await {
                if let [a, b, c] = found.as_slice() {
                    let now = [a.clone(), b.clone(), c.clone()];
                    if *defaults.peek() != now {
                        defaults.set(now);
                    }
                }
            }
        });
    });

    // Every change persists immediately, so leaving the settings page is plain navigation.
    use_effect(move || {
        let [treble_color, bass_color, chords_color] = colors();
        settings::save(&Settings { lang: lang(), theme: theme(), treble_color, bass_color, chords_color });
    });

    // ── The seeds ──
    let first = use_hook(Seed::new);
    let seeds = use_signal(|| vec![first.clone()]);
    let active = use_signal(|| first.id.clone());
    let doc = Doc {
        seeds,
        active,
        lang,
        busy: use_signal(|| false),
        busy_msg: use_signal(String::new),
        playing: use_signal(|| false),
        lit: use_signal(HashMap::new),
        pos: use_signal(|| None),
        tune: use_signal(|| 0.0),
        render_id: use_signal(String::new),
    };

    // The compiled sample packs: the index the instrument lists are built from, and the local server the page's audio
    // fetches them from (and writes a render through).
    let (pack_list, base_url) = use_hook(|| {
        let dir = packs::find_dir(env!("CARGO_MANIFEST_DIR"));
        let list = packs::read_index(&dir);
        let base = engine::server::Server::start(dir).map(|s| s.base_url()).unwrap_or_default();
        (list, base)
    });

    // The page's audio and what it reports, installed once; then the file this launch was asked to open. What later
    // launches ask to open: the window comes to the front and opens it.
    use_hook(|| {
        spawn(async move {
            let mut page = document::eval(&audio::bridge_js());
            audio::init(&base_url);
            if let Some(cur) = doc.current() {
                audio::set_seed(&to_js_seed(&cur));
            }
            if let Some(file) = instance::first() {
                doc.open_path(&file.to_string_lossy());
            }
            while let Ok(msg) = page.recv::<audio::Msg>().await {
                doc.on_page(msg);
            }
        });
        spawn(async move {
            loop {
                tokio::time::sleep(Duration::from_millis(250)).await;
                while let Some(asked) = instance::next() {
                    let window = dioxus::desktop::window();
                    window.set_minimized(false);
                    window.set_focus();
                    if !asked.is_empty() {
                        doc.open_path(&asked);
                    }
                }
            }
        });
    });

    // The live player reads the seed in front at every chord, so every change of it is pushed to the page.
    use_effect(move || {
        let id = (doc.active)();
        if let Some(s) = (doc.seeds)().iter().find(|s| s.id == id) {
            audio::set_seed(&to_js_seed(s));
        }
    });
    // Switching tabs must not leave a seed playing under a different seed's form.
    use_effect(move || {
        let _ = (doc.active)();
        audio::stop();
    });
    // The tune trim is a probe on the treble instrument and starts again from zero whenever that changes.
    let treble_instrument = use_memo(move || {
        let id = (doc.active)();
        (doc.seeds)().iter().find(|s| s.id == id).map(|s| s.treble_instrument.clone()).unwrap_or_default()
    });
    use_effect(move || {
        let _ = treble_instrument();
        let mut tune = doc.tune;
        tune.set(0.0);
    });
    use_effect(move || audio::set_tune((doc.tune)()));

    let code = lang();
    let t = |key: &str| i18n::t(&code, key);
    let tip_help = t("tipHdrHelp");
    let tip_settings = t("tipHdrSettings");
    let (tip_minimize, tip_maximize, tip_restore, tip_close) = (t("tipWinMinimize"), t("tipWinMaximize"), t("tipWinRestore"), t("tipWinClose"));
    let lbl_news = t("lblStgGeneralNews");
    let (tip_new, tip_load, tip_save, tip_save_as) = (t("tipSeedNew"), t("tipSeedLoad"), t("tipSeedSave"), t("tipSeedSaveAs"));
    let tip_tab_close = t("tipSeedTabClose");
    let lbl_untitled = t("lblSeedUntitled");
    let drop_label = t("msgSeedDropHere");
    let block_names = [t("lblSeedInstrument"), t("lblSeedBassInstrument"), t("lblSeedChords")];
    let (lbl_colors, lbl_reset, lbl_cancel, lbl_apply, lbl_pick) = (t("lblStgGeneralColors"), t("btnStgGeneralColorReset"), t("btnGlobalCancel"), t("btnGlobalApply"), t("tipGlobalPickFromScreen"));
    let (lbl_credits, lbl_credits_intro) = (t("lblStgAboutCredits"), t("msgStgAboutCreditsIntro"));
    let credits = packs::credits(&pack_list);

    let version = app_version_build();
    // The app's own icon, shown at the start of the window bar: the file the executable carries, as a page picture.
    let app_icon = use_hook(|| {
        use base64::{Engine, engine::general_purpose::STANDARD};
        format!("data:image/png;base64,{}", STANDARD.encode(include_bytes!("../assets/app.png")))
    });
    let help_url = site::site_url(APP_ID, &code, "help");
    let github_url = format!("https://github.com/yaiol/{APP_ID}");

    let all_seeds = seeds();
    let active_id = active();
    let active_seed = all_seeds.iter().find(|s| s.id == active_id).cloned();

    rsx! {
        for css in CSS {
            style { "{css}" }
        }
        div { class: "uis-app-root",
            // A new version (first) and the yaiol news, in one dialog; what is shown is decided inside.
            UisNewsLoader { app_id: APP_ID, app_version: APP_VERSION, lang: lang() }
            UisBarWindow {
                app_name: APP_NAME,
                app_version: version.clone(),
                icon_src: app_icon,
                maximized: maximized(),
                tip_minimize,
                tip_maximize,
                tip_restore,
                tip_close,
                on_minimize: move |_| dioxus::desktop::window().set_minimized(true),
                on_maximize: move |_| dioxus::desktop::window().toggle_maximized(),
                on_close: move |_| dioxus::desktop::window().close(),
                on_drag: move |_| dioxus::desktop::window().drag(),
                on_menu: move |_| window_menu::show(),
                button {
                    class: if settings_open() { "uis-barh-window-btn uis-stg-toggle active" } else { "uis-barh-window-btn uis-stg-toggle" },
                    title: "{tip_settings}",
                    "aria-label": "{tip_settings}",
                    "aria-pressed": "{settings_open()}",
                    onclick: move |_| settings_open.toggle(),
                    Icon { width: 14, height: 14, icon: LdSettings }
                }
                button {
                    class: "uis-barh-window-btn",
                    title: "{tip_help}",
                    "aria-label": "{tip_help}",
                    onclick: move |_| {
                        let _ = open::that(&help_url);
                    },
                    Icon { width: 14, height: 14, icon: LdCircleHelp }
                }
                button {
                    class: "uis-barh-window-btn",
                    title: "GitHub",
                    "aria-label": "GitHub",
                    onclick: move |_| {
                        let _ = open::that(&github_url);
                    },
                    UisIcoGithub {}
                }
                // A newer version is out: the reminder, drawn only then; a click reopens the update card.
                UisBtnUpdate { lang: lang() }
                // yaiol has news for this app: the second reminder, drawn only then; a click reopens the announcements.
                UisBtnNews { lang: lang() }
            }
            // The name and the version are in the window bar, so the header holds the work buttons only.
            UisAppHeader { app_name: APP_NAME, app_version: version.clone(), bare: true,
                // File actions (.yams): New, Load, Save, Save As - a welded group.
                div { class: "uis-barh-grp",
                    button {
                        class: "uis-btn ico",
                        title: "{tip_new}",
                        "aria-label": "{tip_new}",
                        onclick: move |_| doc.new_seed(),
                        Icon { width: 14, height: 14, icon: LdFilePlus }
                    }
                    button {
                        class: "uis-btn ico",
                        title: "{tip_load}",
                        "aria-label": "{tip_load}",
                        onclick: move |_| {
                            spawn(async move { doc.load().await });
                        },
                        Icon { width: 14, height: 14, icon: LdFolderOpen }
                    }
                    button {
                        class: "uis-btn ico",
                        title: "{tip_save}",
                        "aria-label": "{tip_save}",
                        onclick: move |_| {
                            spawn(async move { doc.save().await });
                        },
                        Icon { width: 14, height: 14, icon: LdSave }
                    }
                    button {
                        class: "uis-btn ico",
                        title: "{tip_save_as}",
                        "aria-label": "{tip_save_as}",
                        onclick: move |_| {
                            spawn(async move { doc.save_as().await });
                        },
                        Icon { width: 14, height: 14, icon: LdSavePlus }
                    }
                }
            }
            // The seed tab strip: one tab per open .yams. Part of the view, so hidden while the settings page covers it.
            if !settings_open() {
                div { style: "display:flex; align-items:stretch; flex-shrink:0; background:var(--uis-bar-bgd); border-bottom:1px solid var(--uis-border); overflow-x:auto; overflow-y:hidden;",
                    for s in all_seeds.iter() {
                        {
                            let is_active = s.id == active_id;
                            let id = s.id.clone();
                            let close_id = s.id.clone();
                            let tab_style = format!(
                                "display:flex; align-items:center; flex-shrink:0; gap:6px; height:30px; padding:0 6px 0 12px; cursor:pointer; background:{}; border-right:1px solid var(--uis-border); border-bottom:{}; color:{}; font-size:13px; min-width:90px; max-width:200px;",
                                if is_active { "var(--uis-dlg-bgd)" } else { "transparent" },
                                if is_active { "2px solid var(--uis-accent)" } else { "2px solid transparent" },
                                if is_active { "var(--uis-text)" } else { "var(--uis-text-mute)" },
                            );
                            let title = s.file_path.clone().unwrap_or_default();
                            let name = if s.file_name.is_empty() { lbl_untitled.clone() } else { s.file_name.clone() };
                            let mut active_w = active;
                            rsx! {
                                // ⚠ the key carries the active state: a changed inline style keeps the old values in the webview.
                                div {
                                    key: "{s.id}-{is_active}",
                                    style: "{tab_style}",
                                    title: if title.is_empty() { None } else { Some(title) },
                                    onclick: move |_| active_w.set(id.clone()),
                                    if s.unsaved {
                                        span { style: "color:var(--uis-accent); font-size:10px; line-height:1; flex-shrink:0;", "●" }
                                    }
                                    span { style: "flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;", "{name}" }
                                    button {
                                        class: "uis-btn ico small subtle",
                                        title: "{tip_tab_close}",
                                        "aria-label": "{tip_tab_close}",
                                        onclick: move |e| {
                                            e.stop_propagation();
                                            doc.close_seed(&close_id);
                                        },
                                        Icon { width: 14, height: 14, icon: LdX, class: "uis-ico-inline" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // .uis-app-main = the growable content region, also the file-drop zone; the overlay is scoped here so the
            // blur covers only this area, not the header bar above it.
            LbsDropZone {
                class: "uis-app-main",
                label: drop_label,
                accept: vec![".yams".to_owned()],
                on_file: move |(_, path): (String, String)| doc.open_path(&path),
                if settings_open() {
                    UisStgView {
                        app_name: APP_NAME,
                        app_version: version.clone(),
                        lang: lang(),
                        theme: theme(),
                        on_set_lang: move |l| lang.set(l),
                        on_set_theme: move |th| theme.set(th),
                        on_close: move |_| settings_open.set(false),
                        general_extra: Some(rsx! {
                            div { class: "uis-fld-labelled divider",
                                label { class: "uis-fld-labelled-label", "{lbl_colors}" }
                                for (i, key) in BLOCK_KEYS.iter().enumerate() {
                                    div { class: "amsd-seed-colors-row",
                                        span { class: "amsd-seed-colors-name amsd-{key}", "{block_names[i]}" }
                                        UisPkrColor {
                                            color: colors()[i].clone().unwrap_or_else(|| defaults()[i].clone()),
                                            on_change: move |c: String| colors.write()[i] = Some(c),
                                            cancel_label: lbl_cancel.clone(),
                                            apply_label: lbl_apply.clone(),
                                            pick_title: lbl_pick.clone(),
                                        }
                                        button {
                                            class: "uis-btn subtle amsd-seed-colors-reset",
                                            disabled: colors()[i].is_none(),
                                            onclick: move |_| colors.write()[i] = None,
                                            "{lbl_reset}"
                                        }
                                    }
                                }
                            }
                            div { class: "uis-fld-labelled divider",
                                label { class: "uis-chk-lbl",
                                    input {
                                        r#type: "checkbox",
                                        class: "uis-chk-box",
                                        checked: news_on(),
                                        onchange: move |e| {
                                            news::set_enabled(e.checked());
                                            news_on.set(e.checked());
                                        },
                                    }
                                    "{lbl_news}"
                                }
                            }
                        }),
                        about_extra: if credits.is_empty() {
                            None
                        } else {
                            Some(rsx! {
                                div { class: "amsd-seed-credits",
                                    div { class: "uis-dlg-about-id", "{lbl_credits}" }
                                    div { class: "dlg-hint", "{lbl_credits_intro}" }
                                    for (author, instruments) in credits.iter() {
                                        div { class: "amsd-seed-credits-row",
                                            b { "{author}" }
                                            " — {instruments}"
                                        }
                                    }
                                }
                            })
                        },
                    }
                }
                div { class: "uis-app-scroll uis-app-scroll-y workspace",
                    if let Some(s) = active_seed {
                        SeedPanel {
                            lang: lang(),
                            seed: s,
                            busy: (doc.busy)(),
                            busy_msg: (doc.busy_msg)(),
                            playing: (doc.playing)(),
                            packs: pack_list.clone(),
                            lit_keys: (doc.lit)(),
                            play_pos: (doc.pos)(),
                            tune_trim: (doc.tune)(),
                            on_audition: move |m: u32| audio::audition(m),
                            on_tune_trim: move |v: f64| {
                                let mut tune = doc.tune;
                                tune.set(v);
                            },
                            on_edit: move |f: Edit| doc.edit(f),
                            on_render: move |_| doc.render(),
                            on_play: move |_| doc.toggle_play(),
                            on_reveal: move |p: String| show_in_folder(&p),
                        }
                    }
                }
            }
        }
    }
}

/// A folder the way the system's file dialog wants it: on Windows its shell parser refuses a path written with `/` and the dialog
/// then opens in Documents. A file handed over by a launcher or a script can carry either separator.
fn native_path(p: &str) -> String {
    if cfg!(windows) { p.replace('/', "\\") } else { p.to_owned() }
}

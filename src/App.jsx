// ⚠ CLAUDE - NO HARDCODED UI STRINGS IN THIS FILE.
//   Every string a user can read - JSX text, title=, placeholder=, aria-label=,
//   confirm/alert/setMsg arguments - MUST go through t('keyName'). No exceptions.
//   Workflow: add keys to src/i18n.js EN, then translate, sort and audit every
//   language via the i18n key workflow. Full procedure: see CLAUDE-i18n.md.
//   Never paste translations by hand. The scripts ARE the work.
import React, { useEffect, useMemo, useState } from 'react';
import { Settings, HelpCircle, Sun, Moon, X, ScrollText, FolderOpen, Music, AudioWaveform, Save, SavePlus, FilePlus } from 'lucide-react';
import pkg from '../package.json';
import { useT, LANGUAGES } from './i18n-gen';
import { checkForUpdate, getUrl } from './lib/update-check';
import { UpdateBanner } from './lib/ui-update-banner';
import { AppHeader } from './lib/ui-header';
import { NumberField } from './lib/ui-ctl-numberfield';
import { useFileDrop } from './lib/ui-fx-filedrop';
import { GithubIcon } from './lib/ui-icons';
import { generateSeed, analyzeSeed, defaultName, STYLES, MP3_BITRATES } from './lib/seed-engine';
import yaiolLogo from './assets/yaiol-logo.svg';
// Storage namespace - single source: package.json `storagePrefix`. Never hardcode a prefix.
const STORAGE_PREFIX = pkg.storagePrefix;

// Express API base - main process passes its dynamic port as ?apiPort=NNNN.
const API = `http://localhost:${new URLSearchParams(window.location.search).get('apiPort') || ''}`;

// ─── App identity - single source of truth ──────────────────────────────────
const APP_NAME    = pkg.productName;
const APP_VERSION = pkg.version;
// The full build IDENTITY shown to the user: the release version plus the build counter (the 4th
// segment a buffered commit bumps), or just the release version on a clean release build.
// ⚠ CLAUDE: APP_VERSION itself stays plain 3-part semver and must NOT absorb this - the update
// check compares it against the published beacon, and a 4-part string is not semver. Display only.
const APP_VERSION_BUILD = pkg.build?.buildNumber ? `${pkg.version}.${pkg.build.buildNumber}` : pkg.version;

// localStorage keys - prefix uses the app alias (see CLAUDE.md Settings table)
const LS_LANG     = `${STORAGE_PREFIX}-lang`;
const LS_THEME    = `${STORAGE_PREFIX}-theme`;
const DEFAULT_LANG  = 'en';
const DEFAULT_THEME = 'light';

// GitHub source - owner is constant (yaiol); repo name is the app id (pkg.name).
const GITHUB_URL = `https://github.com/yaiol/${pkg.name}`;

// ─── Seed document model ─────────────────────────────────────────────────────
// The app is multi-document, like markzen with .md: several .yams seeds are open at
// once, one per tab. A seed doc holds every on-screen field plus its file association
// (filePath / fileName), a dirty flag (unsaved), and the transient render error/result.
// A seed must be saved as a .yams before it can render — Render writes the audio + MIDI
// into the folder the .yams lives in (so there is no separate "output folder" control).
const basename = (p) => (p || '').replace(/.*[\\/]/, '');
const dirname  = (p) => (p || '').replace(/[\\/][^\\/]*$/, '');

// The Output template a seed starts with, and what a .yams without an `output` field
// falls back to. It is a real template the user can see and edit — there is no
// implicit "(auto)" mode behind a blank field.
const DEFAULT_OUTPUT = '{name}-{style}-{bpm}';

function makeSeed(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    filePath: null,   // the .yams this doc is bound to (null = never saved/loaded)
    fileName: '',     // tab label — basename(filePath), or the Untitled placeholder
    unsaved: false,   // edited since the last save / load / open
    // form fields (mirror the .yams payload)
    name: '',                 // the seed's own name (feeds the {name} output token)
    progression: 'Am C G Dm',
    bpm: 80, bars: 1, sig: '4/4', loops: 4,
    style: 'pad', format: 'mp3', mp3Bitrate: 192,
    output: DEFAULT_OUTPUT,   // the rendered file's base name (a token template)
    // transient (never persisted)
    result: null, error: '',
    ...overrides,
  };
}

// Map a parsed .yams object onto a fresh seed doc (field-by-field with guards so a
// partial or future file never throws). The chord text lives under `chords` in the
// file; the engine's field is `progression`.
//
// ⚠ CLAUDE: schema v1 had ONE `name` field, and it meant the OUTPUT file name. v2 split
// it in two — `name` (the seed's own name) + `output` (the file-name template) — so a v1
// file's `name` must migrate to `output`, never to `name`. A file is legacy only when it
// carries no `output` AND declares version < 2; a hand-written .yams with no version at
// all is read as current (its `name` is the seed's name), which is the safe default now
// that every Save writes v2.
function seedFromFile(s, filePath = null) {
  const seed = makeSeed({ filePath, fileName: basename(filePath) });
  if (typeof s.chords === 'string') seed.progression = s.chords;
  if (s.bpm        != null) seed.bpm        = s.bpm;
  if (s.bars       != null) seed.bars       = s.bars;
  if (s.sig        != null) seed.sig        = s.sig;
  if (s.loops      != null) seed.loops      = s.loops;
  if (s.style      != null) seed.style      = s.style;
  if (s.format     != null) seed.format     = s.format;
  if (s.mp3Bitrate != null) seed.mp3Bitrate = Number(s.mp3Bitrate);
  const legacy = typeof s.output !== 'string' && Number(s.version) < 2;
  if (typeof s.output === 'string') seed.output = s.output || DEFAULT_OUTPUT;
  else if (legacy && s.name) seed.output = String(s.name);
  if (!legacy && typeof s.name === 'string') seed.name = s.name;
  return seed;
}

// The .yams payload — every on-screen field, so a seed reopens + re-renders
// identically. Written by Save / Save As (the .yams is the seed's primary file).
const buildSeed = (s) => ({
  version: 2,
  name: s.name,
  chords: s.progression,
  bpm: Number(s.bpm), bars: Number(s.bars), sig: s.sig, loops: Number(s.loops),
  style: s.style, format: s.format, mp3Bitrate: Number(s.mp3Bitrate),
  output: s.output,
});

// The {chords} token — a safe base name derived from the chord names (capped at the
// engine's first-NAME_CHORDS chords, so a whole song chart can't name the file).
const chordsToken = (s) => defaultName(s.progression);

// The {name} token — the seed's name, stripped of characters no file system accepts.
// A nameless seed falls back to the chord-derived base, so the default template can
// never resolve to a headless "-arp-80".
const nameToken = (s) => (s.name || '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '').trim() || chordsToken(s);

// Resolve the output tokens against a seed: {name} → the seed name, {chords} → the
// chord-derived base, {style} → the style key, {bpm} → the BPM, {loops} → the loop
// count. The raw template (tokens kept) is what lives in the .yams, so re-rendering
// after a parameter change renames the file.
const resolveName = (s, raw) => raw
  .replace(/\{name\}/g,   nameToken(s))
  .replace(/\{chords\}/g, chordsToken(s))
  .replace(/\{style\}/g,  s.style)
  .replace(/\{bpm\}/g,    String(s.bpm))
  .replace(/\{loops\}/g,  String(s.loops));

// The output file base name — the Output template (emptied by hand → the default),
// with tokens resolved; falls back to the bare chord name if that yields nothing.
const computeFileName = (s) => resolveName(s, (s.output || '').trim() || DEFAULT_OUTPUT).trim() || chordsToken(s);

const toB64 = (u8) => {
  let s = ''; const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) s += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
  return btoa(s);
};

// Let React paint the next busy-stage message before the synchronous render
// (which blocks the UI thread) begins.
const repaint = () => new Promise((r) => setTimeout(r, 0));

export default function App() {
  const [lang,         setLang]         = useState(() => localStorage.getItem(LS_LANG)  || DEFAULT_LANG);
  const [theme,        setTheme]        = useState(() => localStorage.getItem(LS_THEME) || DEFAULT_THEME);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updateInfo,   setUpdateInfo]   = useState(null);

  // ── Multi-document tabs: the open seed docs + the active one. Not persisted —
  // a fresh blank seed each launch; save a .yams to keep one. (seeds is already
  // resolved when activeId's initializer runs, so they share the same first id.) ──
  const [seeds,    setSeeds]    = useState(() => [makeSeed()]);
  const [activeId, setActiveId] = useState(() => seeds[0].id);
  // Render is synchronous and blocks the UI thread, so only one runs at a time — a
  // single app-level busy flag, not per-doc.
  const [busy,    setBusy]    = useState(false);
  const [busyMsg, setBusyMsg] = useState('');

  const active = seeds.find(s => s.id === activeId) || null;

  const t = useT(lang);

  useEffect(() => {
    localStorage.setItem(LS_LANG, lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(LS_THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for a new version once on launch (silent if up to date / offline / skipped)
  useEffect(() => {
    checkForUpdate({ appId: pkg.name, alias: STORAGE_PREFIX, currentVersion: APP_VERSION })
      .then(u => { if (u) setUpdateInfo(u); });
  }, []);

  // ── Seed-doc mutation + tab lifecycle ──
  // Patch one doc's fields. Any user field edit marks the doc unsaved; programmatic
  // updates (render result/error, save/load bookkeeping) pass markUnsaved=false.
  const updateSeed = (id, patch, markUnsaved = true) =>
    setSeeds(prev => prev.map(s => s.id === id ? { ...s, ...patch, ...(markUnsaved ? { unsaved: true } : {}) } : s));

  const newSeed = () => setSeeds(prev => {
    const s = makeSeed();
    setActiveId(s.id);
    return [...prev, s];
  });

  // Open a parsed .yams: focus an already-open tab bound to the same path (refreshing
  // it from the file), else add a new tab. Used by the header Load button, drag-and-drop,
  // and the OS file association — the single entry point for "a .yams became available".
  // A tab only ever opens untitled when the caller has no path at all (never in Electron).
  const openSeedFile = (s, path = null) => setSeeds(prev => {
    if (path) {
      const existing = prev.find(x => x.filePath === path);
      if (existing) {
        setActiveId(existing.id);
        return prev.map(x => x.id === existing.id ? { ...seedFromFile(s, path), id: existing.id } : x);
      }
    }
    const doc = seedFromFile(s, path);
    setActiveId(doc.id);
    return [...prev, doc];
  });

  // Close a tab. The app never sits with zero seeds — closing the last one drops a
  // fresh blank in its place, so a form is always on screen.
  const closeSeed = (id) => setSeeds(prev => {
    const remaining = prev.filter(s => s.id !== id);
    if (remaining.length === 0) {
      const s = makeSeed();
      setActiveId(s.id);
      return [s];
    }
    if (activeId === id) {
      const idx = prev.findIndex(s => s.id === id);
      setActiveId(remaining[Math.min(idx, remaining.length - 1)].id);
    }
    return remaining;
  });

  // OS file association (.yams double-click / "Open with"): the main process delivers
  // the file two ways — the launch file as a ?startSeed=<base64 path> query param, and
  // any file opened while running via the /pending-seed queue (polled). Both parse to a
  // seed object opened through openSeedFile (a new tab, or focus if already open).
  useEffect(() => {
    const startSeed = new URLSearchParams(window.location.search).get('startSeed');
    if (startSeed) {
      fetch(`${API}/read-seed?path=${encodeURIComponent(startSeed)}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.seed) openSeedFile(d.seed, d.path); })
        .catch(() => {});
    }
    const id = setInterval(() => {
      fetch(`${API}/pending-seed`)
        .then(r => r.json())
        .then(d => { if (d?.seed) openSeedFile(d.seed, d.path); })
        .catch(() => {});
    }, 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── File actions (operate on the active tab) ──
  // Render the active seed to audio + MIDI, written into the folder its .yams lives in.
  // The seed must be saved first (that .yams path is where the output goes) — the Render
  // button is disabled until then, so this only runs with a filePath in hand.
  const render = async () => {
    const s = active;
    if (!s || !s.filePath) return;
    updateSeed(s.id, { error: '', result: null }, false);
    if (!s.progression.trim()) { updateSeed(s.id, { error: t('msgSeedEmpty') }, false); return; }
    setBusy(true);
    try {
      setBusyMsg(t('msgSeedBusyRender'));
      await repaint();
      const { audio, audioExt, midi } = generateSeed({
        progression: s.progression, bpm: Number(s.bpm), bars: Number(s.bars), sig: s.sig,
        loops: Number(s.loops), style: s.style, format: s.format, mp3Bitrate: Number(s.mp3Bitrate),
      });
      setBusyMsg(t('msgSeedBusySave'));
      await repaint();
      const r = await fetch(`${API}/save-seed`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dir: dirname(s.filePath), name: computeFileName(s), audioB64: toB64(audio), audioExt, midiB64: toB64(midi) }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      updateSeed(s.id, { result: d }, false);
    } catch (e) {
      updateSeed(s.id, { error: `${t('msgSeedFailed')}: ${e.message}` }, false);
    } finally {
      setBusy(false);
      setBusyMsg('');
    }
  };

  // Save — overwrite the active tab's .yams; with no file yet, fall back to Save As.
  const save = async () => {
    const s = active;
    if (!s) return;
    if (!s.filePath) return saveAs();
    updateSeed(s.id, { error: '' }, false);
    try {
      const r = await fetch(`${API}/save-yams`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: s.filePath, seed: buildSeed(s) }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      updateSeed(s.id, { unsaved: false }, false);
    } catch (e) {
      updateSeed(s.id, { error: `${t('msgSeedSaveFailed')}: ${e.message}` }, false);
    }
  };

  // Save As — pick a .yams path via the native dialog; that file becomes the tab's.
  const saveAs = async () => {
    const s = active;
    if (!s) return;
    updateSeed(s.id, { error: '' }, false);
    try {
      const r = await fetch(`${API}/save-yams-as`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed: buildSeed(s), defaultName: computeFileName(s), dir: dirname(s.filePath),
          title: t('ttlSeedSaveAs'), filterName: t('lblSeedLoadFilter'),
        }),
      });
      const d = await r.json();
      if (d.canceled) return;
      if (d.error || !d.path) throw new Error(d.error || 'invalid');
      updateSeed(s.id, { filePath: d.path, fileName: basename(d.path), unsaved: false }, false);
    } catch (e) {
      updateSeed(s.id, { error: `${t('msgSeedSaveFailed')}: ${e.message}` }, false);
    }
  };

  // Load — native open dialog; the picked .yams opens in a new tab (or focuses it).
  const load = async () => {
    try {
      const r = await fetch(`${API}/load-seed`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t('ttlSeedLoad'), filterName: t('lblSeedLoadFilter') }),
      });
      const d = await r.json();
      if (d.canceled) return;
      if (d.error || !d.seed) throw new Error(d.error || 'invalid');
      openSeedFile(d.seed, d.path);
    } catch (e) {
      if (active) updateSeed(active.id, { error: `${t('msgSeedLoadFailed')}: ${e.message}` }, false);
    }
  };

  // Load a .yams from a dropped File. The JSON content comes from FileReader, and the OS
  // path from the preload's webUtils bridge — Electron strips File.path in the renderer,
  // so without that bridge a dropped seed would open as an untitled tab that can neither
  // Save nor Render. With a path in hand the drop behaves exactly like the Load button
  // (named tab, re-drop focuses the tab already bound to that file).
  const loadFromFile = (file) => {
    let osPath = null;
    try { osPath = window.electronAPI?.getFilePath?.(file) || null; } catch { /* no bridge (browser dev) */ }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const seed = JSON.parse(ev.target.result);
        if (!seed || typeof seed !== 'object') throw new Error('invalid');
        openSeedFile(seed, osPath);
      } catch (e) {
        if (active) updateSeed(active.id, { error: `${t('msgSeedLoadFailed')}: ${e.message}` }, false);
      }
    };
    reader.onerror = () => { if (active) updateSeed(active.id, { error: t('msgSeedLoadFailed') }, false); };
    reader.readAsText(file);
  };

  const reveal = (path) => fetch(`${API}/reveal`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }),
  }).catch(() => {});

  // Drag a .yams file onto the content area to load it (same result as the header
  // Load button — opens a new tab). Shared behaviour + overlay via useFileDrop.
  const { dropProps, overlay: dropOverlay } = useFileDrop({
    accept: ['.yams'],
    onFile: (file) => loadFromFile(file),
    label: t('msgSeedDropHere'),
  });

  return (
    <div className="app-root">
      {/* ── Update banner - notify-only, dismissible. See ../CLAUDE.md → "Update feed". ── */}
      <UpdateBanner info={updateInfo} appId={pkg.name} lang={lang} storagePrefix={STORAGE_PREFIX} t={t} onClose={() => setUpdateInfo(null)} />
      <AppHeader appName={APP_NAME} appVersion={APP_VERSION_BUILD}>
        {/* File actions (.yams): New · Load · Save · Save As — welded group, detached from
            the standard source·help·settings group per the header-group rule (CLAUDE-ui-standards). */}
        <div className="barh-grp">
          <button
            className="btn icon"
            onClick={newSeed}
            title={t('tipSeedNew')}
            aria-label={t('tipSeedNew')}
          >
            <FilePlus />
          </button>
          <button
            className="btn icon"
            onClick={load}
            title={t('tipSeedLoad')}
            aria-label={t('tipSeedLoad')}
          >
            <FolderOpen />
          </button>
          <button
            className="btn icon"
            onClick={save}
            title={t('tipSeedSave')}
            aria-label={t('tipSeedSave')}
          >
            <Save />
          </button>
          <button
            className="btn icon"
            onClick={saveAs}
            title={t('tipSeedSaveAs')}
            aria-label={t('tipSeedSaveAs')}
          >
            <SavePlus />
          </button>
        </div>
        <span className="bar-spacer" />
        {/* Standard header group — source · help · settings; never joined by any other icon. */}
        <div className="barh-grp">
          <button
            className="btn icon"
            onClick={() => window.open(GITHUB_URL, '_blank')}
            title="GitHub"
            aria-label="GitHub"
          >
            <GithubIcon />
          </button>
          <button
            className="btn icon"
            onClick={() => window.open(getUrl(pkg.name, lang.replace(/_/g, '-'), 'help'), '_blank')}
            title={t('tipHdrHelp')}
            aria-label={t('tipHdrHelp')}
          >
            <HelpCircle />
          </button>
          <button
            className="btn icon"
            onClick={() => setSettingsOpen(true)}
            title={t('tipHdrSettings')}
            aria-label={t('tipHdrSettings')}
          >
            <Settings />
          </button>
        </div>
      </AppHeader>

      {/* ── Seed tab strip — one tab per open .yams (markzen-style multi-document). Sits
          below the identity separator; the active tab's surface matches the content
          area (.workspace = --dlg-bgd). Horizontal-scrolls, never wraps. ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch', flexShrink: 0,
        background: 'var(--bar-bgd)', borderBottom: '1px solid var(--border)',
        overflowX: 'auto', overflowY: 'hidden',
      }}>
        {seeds.map(s => {
          const isActive = s.id === activeId;
          return (
            <div key={s.id} onClick={() => setActiveId(s.id)} title={s.filePath || undefined} style={{
              display: 'flex', alignItems: 'center', flexShrink: 0, gap: 6,
              height: 30, padding: '0 6px 0 12px', cursor: 'pointer',
              background: isActive ? 'var(--dlg-bgd)' : 'transparent',
              borderRight: '1px solid var(--border)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              color: isActive ? 'var(--text)' : 'var(--text-mute)',
              fontSize: 13, minWidth: 90, maxWidth: 200,
            }}>
              {s.unsaved && <span style={{ color: 'var(--accent)', fontSize: 10, lineHeight: 1, flexShrink: 0 }}>●</span>}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.fileName || t('lblSeedUntitled')}
              </span>
              <button
                className="btn icon small subtle"
                onClick={e => { e.stopPropagation(); closeSeed(s.id); }}
                title={t('tipSeedTabClose')} aria-label={t('tipSeedTabClose')}
              >
                <X className="icon-inline" />
              </button>
            </div>
          );
        })}
      </div>

      {settingsOpen && (
        <SettingsDialog
          t={t}
          lang={lang} setLang={setLang}
          theme={theme} setTheme={setTheme}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* .app-main content region = also the file-drop zone; the overlay is scoped
          here so the blur covers only this area, not the header bar above it. */}
      <div className="app-main" {...dropProps}>
        <div className="app-scroll app-scroll-y workspace">
          {active && (
            <SeedPanel
              t={t}
              seed={active}
              busy={busy} busyMsg={busyMsg}
              onField={(patch) => updateSeed(active.id, patch)}
              onRender={render}
              onReveal={reveal}
            />
          )}
        </div>
        {dropOverlay}
      </div>
    </div>
  );
}

// Format a seconds count as m:ss (the projected seed length).
const fmtDuration = (s) => {
  const total = Math.round(s);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

// Human file size from a byte count (projected audio output).
const fmtSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

// ─── Seed generator panel - a controlled view of the active seed doc ──────────
// Every field reads from `seed` and writes back via `onField(patch)`; the parent
// (App) owns the seed array, the file actions (render / save / load), and the busy
// flag. This panel is pure presentation + the live projection summary.
function SeedPanel({ t, seed, busy, busyMsg, onField, onRender, onReveal }) {
  const { progression, bpm, bars, sig, loops, style, format, mp3Bitrate, name, output, filePath, error, result } = seed;

  // Live projection of what the current form will render - chord count, total
  // duration, estimated file size, and any unparseable chord. Recomputed as the
  // user edits, so a runaway size (e.g. a full song × Loops) is visible up front
  // instead of surfacing as a multi-minute freeze + a server error.
  const summary = useMemo(
    () => analyzeSeed({ progression, bpm: Number(bpm), bars: Number(bars), sig, loops: Number(loops), format, mp3Bitrate: Number(mp3Bitrate) }),
    [progression, bpm, bars, sig, loops, format, mp3Bitrate]
  );

  // A seed can only render once it is saved to a .yams — that file's folder is where
  // the audio + MIDI are written (there is no separate output-folder control).
  const saved = !!filePath;

  // dlg-form: this body panel is a dialog-style form, so its .numfield + .btn
  // follow the same dialog field rules as the sibling .input/.select.
  // Two-column split: chord progression on the left, everything else on the right.
  return (
    <div className="seed-panel dlg-form">
      {/* ── Left column: chord progression — a tall multi-line text zone ── */}
      <div className="seed-col seed-col-chords">
        <div className="seed-field seed-field-grow">
          <label className="dlg-field-label">{t('lblSeedProgression')}</label>
          <textarea
            className="textarea"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
            value={progression}
            placeholder={t('plhSeedProgression')}
            onChange={e => onField({ progression: e.target.value })}
          />
          <span className="hint">{t('hntSeedProgression')}</span>
        </div>
      </div>

      {/* ── Right column: all the rest (parameters, output, summary, actions) ── */}
      <div className="seed-col seed-col-rest">
      {/* Name — the seed's own name, above every other field. Feeds the {name} token
          the default Output template is built from. */}
      <div className="seed-field">
        <label className="dlg-field-label">{t('lblSeedName')}</label>
        <input className="input" type="text"
               value={name} onChange={e => onField({ name: e.target.value })} />
      </div>

      {/* Numeric / select parameters */}
      <div className="seed-grid">
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedBpm')}</label>
          <NumberField min={20} max={300} step={1} width="76px"
                 value={bpm} onChange={v => onField({ bpm: v })} />
        </div>
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedBars')}</label>
          <NumberField min={0.25} step={0.25} width="76px"
                 value={bars} onChange={v => onField({ bars: v })} />
        </div>
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedSig')}</label>
          <input className="input" type="text" style={{ width: '76px' }}
                 value={sig} onChange={e => onField({ sig: e.target.value })} />
        </div>
        {/* Loops breaks onto its own row to sit beside Style (per the field-order layout). */}
        <div className="seed-field seed-field-break">
          <label className="dlg-field-label">{t('lblSeedLoops')}</label>
          <NumberField min={1} max={32} step={1} width="76px"
                 value={loops} onChange={v => onField({ loops: v })} />
        </div>
        <div className="seed-field seed-field-wide">
          <label className="dlg-field-label">{t('lblSeedStyle')}</label>
          <select className="select" value={style} onChange={e => onField({ style: e.target.value })}>
            {STYLES.map(s => (
              <option key={s} value={s}>{t('optSeedStyle' + s.charAt(0).toUpperCase() + s.slice(1))}</option>
            ))}
          </select>
        </div>
        <div className="seed-field seed-field-break">
          <label className="dlg-field-label">{t('lblSeedFormat')}</label>
          <select className="select" style={{ width: '120px' }} value={format} onChange={e => onField({ format: e.target.value })}>
            <option value="mp3">{t('optSeedFormatMp3')}</option>
            <option value="wav">{t('optSeedFormatWav')}</option>
          </select>
        </div>
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedMp3Bitrate')}</label>
          <select className="select" value={mp3Bitrate} disabled={format !== 'mp3'}
                  onChange={e => onField({ mp3Bitrate: Number(e.target.value) })}>
            {MP3_BITRATES.map(b => <option key={b} value={b}>{b} kbps</option>)}
          </select>
        </div>
      </div>

      {/* Output — own full-width row. The rendered file's base name: tokens {name}, {chords},
          {style}, {bpm} and {loops} are replaced with the current form values at render time
          (see resolveName()). Emptied by hand → the DEFAULT_OUTPUT template. */}
      <div className="seed-field">
        <label className="dlg-field-label">{t('lblSeedOutput')}</label>
        <input className="input" type="text"
               value={output} onChange={e => onField({ output: e.target.value })} />
        <span className="hint">{t('hntSeedOutput')}</span>
      </div>

      {/* Live projection - what this form will render before you click */}
      <div className="seed-summary">
        <span className="seed-summary-stat">
          <span className="seed-summary-label">{t('lblSeedSummaryChords')}</span>
          <span className="seed-summary-value mono">{summary.count}</span>
        </span>
        <span className="seed-summary-stat">
          <span className="seed-summary-label">{t('lblSeedSummaryDuration')}</span>
          <span className="seed-summary-value mono">{summary.sigBad ? '-' : fmtDuration(summary.seconds)}</span>
        </span>
        <span className="seed-summary-stat">
          <span className="seed-summary-label">{t('lblSeedSummarySize')}</span>
          <span className="seed-summary-value mono">{summary.sigBad ? '-' : fmtSize(summary.audioBytes)}</span>
        </span>
        {summary.sigBad && <span className="seed-summary-warn">{t('msgSeedSummarySigBad')}</span>}
        {summary.invalid.length > 0 && (
          <span className="seed-summary-warn">{t('msgSeedSummaryInvalid')} <span className="mono">{summary.invalid.join(' ')}</span></span>
        )}
      </div>

      {/* Action — a seed must be saved to a .yams before it can render (that file's
          folder is the output location). */}
      <div className="seed-actions">
        <button className="btn primary" onClick={onRender} disabled={busy || !saved || summary.count === 0 || summary.sigBad || summary.invalid.length > 0}>
          <AudioWaveform />{busy ? (busyMsg || t('msgSeedBusy')) : t('btnSeedRender')}
        </button>
        {!saved && <span className="hint">{t('hntSeedRenderNeedsSave')}</span>}
        {error && <span className="seed-error">{error}</span>}
      </div>

      {/* Result */}
      {result && (
        <div className="seed-result">
          <div className="seed-result-head">{t('lblSeedResult')}</div>
          <button className="seed-result-file" onClick={() => onReveal(result.audioPath)}>
            <Music className="icon-inline" /><span className="mono">{result.audioPath}</span>
          </button>
          <button className="seed-result-file" onClick={() => onReveal(result.midiPath)}>
            <Music className="icon-inline" /><span className="mono">{result.midiPath}</span>
          </button>
          <span className="hint">{t('hntSeedResult')}</span>
        </div>
      )}
      </div>{/* /seed-col-rest */}
    </div>
  );
}

function SettingsDialog({ t, lang, setLang, theme, setTheme, onClose }) {
  const [activeTab, setActiveTab] = useState('display');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Family convention: each tab carries its own lucide icon. For the empty
  // template we only ship Display; downstream apps add Time / Meta / About
  // following the same { key, label, icon } shape.
  const TABS = [
    { key: 'display', label: t('tabDlgSettingsDisplay'), icon: Sun },
    { key: 'about',   label: t('tabDlgSettingsAbout'),   icon: ScrollText },
  ];

  return (
    <div className="dl-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dlg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="dlg-head">
          <span className="dlg-title"><Settings />{t('ttlDlgSettings')}</span>
          <button className="dl-close" onClick={onClose} title={t('btnGlobalCancel')} aria-label={t('btnGlobalCancel')}>
            <X />
          </button>
        </div>

        {/* Tab bar */}
        <div className="tabs">
          {TABS.map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              className={`tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <TabIcon />{label}
            </button>
          ))}
        </div>

        {/* Body */}
        {/* All tab panels stacked in one grid cell → dialog sizes to the tallest (Display), no yoyo on tab switch. Rule DLG-8. */}
        <div className="dlg-body" style={{ display: 'grid' }}>
          <div style={{ gridArea: '1/1', visibility: activeTab === 'display' ? 'visible' : 'hidden', zIndex: activeTab === 'display' ? 1 : 0, background: 'var(--dlg-bgd)' }}>
              {/* Language */}
              <div className="dlg-field">
                <label className="dlg-field-label">{t('lblDlgSettingsDisplayLang')}</label>
                <select className="select" value={lang} onChange={e => setLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
              </div>
              {/* Theme */}
              <div className="dlg-field divider">
                <label className="dlg-field-label">{t('lblDlgSettingsDisplayTheme')}</label>
                <div className="opt-btns">
                  {[
                    { key: 'dark',  Icon: Moon, label: t('btnDlgSettingsDisplayThemeDark') },
                    { key: 'light', Icon: Sun,  label: t('btnDlgSettingsDisplayThemeLight') },
                  ].map(({ key, Icon, label }) => {
                    const active = theme === key;
                    return (
                      <button
                        key={key}
                        className={`opt-btn ${active ? 'active' : ''}`}
                        onClick={() => setTheme(key)}
                      >
                        <Icon />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
          </div>

          <div style={{ gridArea: '1/1', visibility: activeTab === 'about' ? 'visible' : 'hidden', zIndex: activeTab === 'about' ? 1 : 0, background: 'var(--dlg-bgd)' }}>
            <div className="dlg-about">
              <img src={yaiolLogo} alt="Yaiol" style={{ width: 120, height: 'auto', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                <div className="dlg-about-id">{APP_NAME} <b>v{APP_VERSION_BUILD}</b> by yaiol</div>
                <div className="dlg-about-desc">{t('msgDlgSettingsAboutDesc')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

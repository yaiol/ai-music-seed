// ⚠ CLAUDE - NO HARDCODED UI STRINGS IN THIS FILE.
//   Every string a user can read - JSX text, title=, placeholder=, aria-label=,
//   confirm/alert/setMsg arguments - MUST go through t('keyName'). No exceptions.
//   Workflow: add keys to src/i18n.js EN, then translate, sort and audit every
//   language via the i18n key workflow. Full procedure: see CLAUDE-i18n.md.
//   Never paste translations by hand. The scripts ARE the work.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Settings, HelpCircle, Sun, Moon, X, ScrollText, FolderOpen, Music, AudioWaveform, Save, SavePlus, FilePlus, Play, Square, Volume2, VolumeX } from 'lucide-react';
import pkg from '../package.json';
import { useT, LANGUAGES } from './i18n-gen';
import { checkForUpdate, getUrl } from './lib/update-check';
import { UpdateBanner } from './lib/ui-update-banner';
import { AppHeader } from './lib/ui-header';
import { NumberField } from './lib/ui-ctl-numberfield';
import { Knob } from './lib/ui-ctl-knob';
import { Popover } from './lib/ui-ctl-popover';
// Family icons (user-picked, SVG Repo) — real .svg files via ?react so they
// follow the button's colour. Keyed by the exact family names below.
import IconFamilyKeys from './assets/icon-yaiol-family-keys.svg?react';
import IconFamilyPercTuned from './assets/icon-yaiol-family-percussion-tuned.svg?react';
import IconFamilyStrPlucked from './assets/icon-yaiol-family-strings-plucked.svg?react';
import IconFamilyStrBowed from './assets/icon-yaiol-family-strings-bowed.svg?react';
import IconFamilySynth from './assets/icon-yaiol-family-synth.svg?react';
import IconFamilyVoices from './assets/icon-yaiol-family-voices.svg?react';
import IconFamilyWindsBrass from './assets/icon-yaiol-family-winds-brass.svg?react';
import IconFamilyWindsWood from './assets/icon-yaiol-family-winds-wood.svg?react';
import { Combobox } from './lib/ui-ctl-combobox';
import { useFileDrop } from './lib/ui-fx-filedrop';
import { GithubIcon } from './lib/ui-icons';
import { generateSeed, analyzeSeed, defaultName, STYLES, STYLE_GROUPS, MP3_BITRATES } from './lib/seed-engine';
import { INSTRUMENTS, parseSoundFont, loadPreset, presetIndexForProgram } from './lib/soundfont';
import { loadPack } from './lib/sample-pack';
import { ROOM_KEYS } from './lib/reverb';
import { startSeed, playOnce } from './lib/seed-player';
import yaiolLogo from './assets/yaiol-logo.svg';
// Storage namespace - single source: package.json `storagePrefix`. Never hardcode a prefix.
const STORAGE_PREFIX = pkg.storagePrefix;

// Express API base - main process passes its dynamic port as ?apiPort=NNNN.
const API = `http://localhost:${new URLSearchParams(window.location.search).get('apiPort') || ''}`;

// ─── SoundFont (sampled instruments) ─────────────────────────────────────────
// The .sf3 is 23 MB and its samples decode once per instrument, so both are
// cached for the whole session and shared by every open tab. Nothing is fetched
// until a seed actually asks for a sampled instrument - a session that only ever
// renders on 'sine' never touches the file.
let sfPromise = null;                      // Promise<parsed soundfont>, created on first use
const presetLoaded = new Map();            // instrument key → Promise<presetIndex|null>

// ⚠ CLAUDE: ONE AudioContext for the whole session. Chromium caps a page at a
// handful of them, so a context per instrument would start throwing once enough
// instruments had been tried. It is only ever used to decode OGG samples - the
// app never plays audio through it.
let audioCtx = null;
const getAudioContext = () => (audioCtx ||= new (window.AudioContext || window.webkitAudioContext)());

function getSoundFont() {
  if (!sfPromise) {
    sfPromise = fetch(`${API}/soundfont`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
      .then(parseSoundFont)
      .catch((e) => { sfPromise = null; throw e; });   // let a failed load be retried
  }
  return sfPromise;
}

// Compiled sample packs (the VSCO group). The index is tiny; each pack's samples
// are fetched and decoded only when that instrument is first used.
const PACK_PREFIX = 'vsco:';
let packIndexPromise = null;
const packLoaded = new Map();          // pack name → Promise<pack>

function getPackIndex() {
  if (!packIndexPromise) {
    packIndexPromise = fetch(`${API}/packs`)
      .then((r) => (r.ok ? r.json() : { packs: [] }))
      .then((d) => d.packs || [])
      .catch(() => []);                // no packs installed is a normal state
  }
  return packIndexPromise;
}

// Resolve an instrument key to a VOICE PROVIDER, with its samples decoded and
// ready for a synchronous render. Returns null for 'sine' (the built-in synth).
//
// ⚠ CLAUDE: the key's PREFIX picks the source — 'vsco:<pack>' is a compiled
// pack, anything else is a SoundFont preset. Unprefixed keys are what every
// .yams written before packs existed contains, so they must keep resolving to
// the SoundFont exactly as they did.
async function getInstrument(key) {
  if (!key || key === 'sine') return null;

  if (key.startsWith(PACK_PREFIX)) {
    const name = key.slice(PACK_PREFIX.length);
    if (!packLoaded.has(name)) {
      packLoaded.set(name, loadPack(`${API}/pack/${name}`, name, getAudioContext())
        .then((pack) => ({ pack }))
        .catch(() => null));           // a missing pack falls back to the synth
    }
    return packLoaded.get(name);
  }

  const spec = INSTRUMENTS.find((i) => i.key === key);
  if (!spec || spec.program === null) return null;

  const sf = await getSoundFont();
  if (!presetLoaded.has(key)) {
    const index = presetIndexForProgram(sf, spec.program);
    presetLoaded.set(key, index === null ? Promise.resolve(null) : loadPreset(sf, index, getAudioContext()).then(() => index));
  }
  const presetIndex = await presetLoaded.get(key);
  return presetIndex === null ? null : { sf, presetIndex };
}

// ⚠ CLAUDE: the BASS lane resolves through this wrapper, never getInstrument
// directly. For the bass, '' (inherit the chord instrument) and 'sine'
// (explicitly the built-in synth) are DIFFERENT choices — but getInstrument
// returns null for both, which made an explicit synth bass silently play the
// chord instrument (found 2026-08-30: organ chords + sine bass played organ on
// both lanes). The sentinel carries neither .pack nor .sf, so voicesOf yields
// no voices and both renderers fall through to synthVoice — the synth itself.
const SYNTH_PROVIDER = { synth: true };
async function getBassInstrument(key) {
  return key === 'sine' ? SYNTH_PROVIDER : key ? getInstrument(key) : null;
}

// ─── App identity - single source of truth ──────────────────────────────────
const APP_NAME    = pkg.productName;
const APP_VERSION = pkg.version;

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

// Form fields that live only for this session — they change what you hear now,
// they are never written to the .yams, and they never mark a seed unsaved.
const MONITOR_FIELDS = new Set(['lanes']);

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
    style: 'pad', trebleInstrument: 'sine',
    // '' = the bass plays the same instrument as the chords. A pattern's two
    // lanes are independent parts, so they can be two players.
    bassInstrument: '',
    // Per-lane mix levels as PERCENT (0–100, 100 = untouched). The engine takes
    // a gain multiplier, so the /100 happens at the call sites. "Treble", not
    // "chord": BOTH lanes play chord material — the axis is register.
    trebleVolume: 100, bassVolume: 100,
    // Whole-octave shift per lane (−1/0/+1) — some instruments live an octave
    // away from where the voicing writes them.
    trebleOctave: 0, bassOctave: 0,
    // ⚠ CLAUDE: a NEW seed starts filtered; an OLD .yams does not (seedFromFile
    // below). The engine's own default is off, so a file written before these
    // existed still renders byte-identically. 100 Hz / 10 kHz is where a
    // comparable tool sets them.
    highpass: 100, lowpass: 10000,
    // Same rule as the filters: a NEW seed gets a room, an old .yams keeps
    // 'none' so it still renders the file it always rendered. Per-lane reverb
    // SENDS (percent; 50 = the room's authored wet): the bass sends little —
    // low frequencies into a room is where the mud comes from.
    reverb: 'chamber', trebleReverb: 50, bassReverb: 20,
    format: 'mp3', mp3Bitrate: 192,
    output: DEFAULT_OUTPUT,   // the rendered file's base name (a token template)
    // transient (never persisted)
    // ⚠ CLAUDE: `lanes` is a MONITOR control, like solo on a mixer — it belongs
    // with the transient fields on purpose. Persisting it would let a seed be
    // saved with its bass muted and reopened weeks later still muted, and every
    // render from then on would quietly be missing half the arrangement. It is
    // reset to 'both' by every open, so a file always renders whole unless the
    // solo is chosen deliberately, in this session, right now.
    lanes: 'both',
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
  // A style that no longer ships (the 2026-09-01 rhythm-table purge) falls
  // back to the default texture rather than crashing the render — same
  // graceful degradation as an unknown room or a gone GM instrument key.
  if (s.style != null) seed.style = STYLES.includes(s.style) ? s.style : 'pad';
  // Absent in a pre-instrument .yams, which is exactly right: it falls back to
  // 'sine', the built-in synth those seeds were rendered with. `instrument` is
  // the field's pre-rename .yams key (2026-08-30: → trebleInstrument, since
  // both lanes play chords and the axis is register) — kept as a legacy read.
  seed.trebleInstrument = s.trebleInstrument ?? s.instrument ?? 'sine';
  seed.bassInstrument = typeof s.bassInstrument === 'string' ? s.bassInstrument : '';
  // Percent scale (0–100); absent = 100 = untouched. A value ≤ 2 is a file from
  // the few hours the field was a bare gain multiplier — read it back as %.
  // `chordVolume` is the field's day-one name, read as a fallback.
  const vol = (v) => v == null ? 100 : Number(v) <= 2 ? Number(v) * 100 : Number(v);
  seed.trebleVolume = vol(s.trebleVolume ?? s.chordVolume);
  seed.bassVolume   = vol(s.bassVolume);
  seed.trebleOctave = s.trebleOctave != null ? Number(s.trebleOctave) : 0;
  seed.bassOctave   = s.bassOctave   != null ? Number(s.bassOctave)   : 0;
  // ⚠ CLAUDE: ABSENT means OFF, not "use the new default". A .yams written
  // before the master filters existed was rendered without them, and opening it
  // must not silently re-render it as a different file. Only makeSeed() starts
  // at 100 / 10000, and only for a seed that never existed before.
  seed.highpass = s.highpass != null ? Number(s.highpass) : 0;
  seed.lowpass  = s.lowpass  != null ? Number(s.lowpass)  : 0;
  seed.reverb = ROOM_KEYS.includes(s.reverb) ? s.reverb : 'none';
  // Per-lane reverb sends (percent). A pre-sends .yams carries the single
  // reverbAmount multiplier (1 = 50%) — both lanes inherit it, so the old
  // file keeps its exact wet level. Absent entirely → the old default, 50/50.
  const legacyAmount = s.reverbAmount != null ? Math.round(Number(s.reverbAmount) * 50) : 50;
  seed.trebleReverb = s.trebleReverb != null ? Number(s.trebleReverb) : legacyAmount;
  seed.bassReverb   = s.bassReverb   != null ? Number(s.bassReverb)   : legacyAmount;
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
  style: s.style, trebleInstrument: s.trebleInstrument, bassInstrument: s.bassInstrument,
  trebleVolume: Number(s.trebleVolume), bassVolume: Number(s.bassVolume),
  trebleOctave: Number(s.trebleOctave), bassOctave: Number(s.bassOctave),
  highpass: Number(s.highpass), lowpass: Number(s.lowpass),
  reverb: s.reverb, trebleReverb: Number(s.trebleReverb), bassReverb: Number(s.bassReverb),
  format: s.format, mp3Bitrate: Number(s.mp3Bitrate),
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
// An instrument key as a filename part: the 'vsco:' prefix is dropped — a ':'
// is illegal in a Windows filename, so the raw pack key must never reach disk.
const instrumentToken = (key) => (key || 'sine').replace(/^vsco:/, '');
const resolveName = (s, raw) => raw
  .replace(/\{name\}/g,   nameToken(s))
  .replace(/\{chords\}/g, chordsToken(s))
  .replace(/\{style\}/g,  s.style)
  // {instrument-treble} = the treble lane's player; {instrument-bass} = the
  // bass lane's (falls back to the treble instrument, which is what an empty
  // bass field means). The order matters: '{instrument}' is a prefix of both.
  .replace(/\{instrument-treble\}/g, instrumentToken(s.trebleInstrument))
  .replace(/\{instrument-bass\}/g,   instrumentToken(s.bassInstrument || s.trebleInstrument))
  .replace(/\{instrument\}/g, instrumentToken(s.trebleInstrument))
  .replace(/\{bpm\}/g,    String(s.bpm))
  .replace(/\{loops\}/g,  String(s.loops))
  // Settings tokens — so a test render's filename carries the exact knobs it
  // was made with (the user reads them back when reporting an artefact).
  .replace(/\{reverb-type\}/g,   s.reverb)
  // treble-bass send percents, e.g. "50-20"
  .replace(/\{reverb-amount\}/g, `${s.trebleReverb}-${s.bassReverb}`)
  .replace(/\{highpass\}/g,      String(s.highpass))
  .replace(/\{lowpass\}/g,       String(s.lowpass));

// The output file base name — the Output template (emptied by hand → the default),
// with tokens resolved; falls back to the bare chord name if that yields nothing.
//
// ⚠ CLAUDE: a soloed render is a PARTIAL file, and the suffix is not decoration —
// it is the only thing on disk that says so. Without it a bass-only export sits
// next to a full one under the same name, and the wrong one gets fed to Suno.
// The suffix is appended AFTER the template resolves, so it cannot be templated
// away by a user who has customised the Output field.
const laneSuffix = (s) =>
  (s.lanes === 'bass' ? '-bass' : s.lanes === 'treble' ? '-treble' : s.lanes === 'none' ? '-muted' : '');
const computeFileName = (s) =>
  (resolveName(s, (s.output || '').trim() || DEFAULT_OUTPUT).trim() || chordsToken(s)) + laneSuffix(s);

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
  const [playing, setPlaying] = useState(false);
  const [packs,   setPacks]   = useState([]);   // compiled sample packs (the VSCO group)
  const playHandle = useRef(null);      // the live playSeed() handle, or null

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

  // ── Live playback ──
  // Play needs no saved .yams — it writes nothing — and it loops until stopped.
  //
  // ⚠ CLAUDE: the player pulls the seed through `liveSeed` at every chord
  // boundary, which is what makes chords, style, instrument, tempo and meter all
  // editable WHILE it plays. A ref, not state: the scheduler runs outside React's
  // render cycle, so a captured value would freeze at whatever it was when Play
  // was pressed and every edit would be silently ignored.
  const liveSeed = useRef(null);
  liveSeed.current = active;

  // The instrument that is decoded and ready right now. Loading is async, so the
  // player keeps using the previous one until the new one lands — switching
  // instruments never drops a beat.
  const liveInstrument = useRef({ key: 'sine', soundfont: null });
  const liveBassInstrument = useRef({ key: '', soundfont: null });

  // The keyboard's live highlights — midi → lane while the note sounds. Fed by
  // the player's onNote tap into a schedule list; ONE rAF loop reads the AUDIO
  // clock each frame and updates the map only when it actually changed.
  // ⚠ CLAUDE: not per-note setTimeout — that shipped first and lagged visibly:
  // timers drift under main-thread load (every on/off re-renders the panel,
  // each late render delays the next timer), and a restruck key went dark when
  // the old note's OFF fired after the new note's ON. The audio clock cannot
  // drift, and the loop is ordering-proof because it recomputes the whole map.
  // `outputLatency` shifts the frame to what is AUDIBLE now, not scheduled now.
  const [litKeys, setLitKeys] = useState({});
  const litEvents = useRef([]);          // { midi, lane, on, off } in ctx time
  const litRaf = useRef(0);
  const litSig = useRef('');
  const clearLit = () => {
    cancelAnimationFrame(litRaf.current);
    litEvents.current = [];
    litSig.current = '';
    setLitKeys({});
  };
  const runLitLoop = (ctx) => {
    const tick = () => {
      const now = ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0);
      const evs = litEvents.current;
      for (let i = evs.length - 1; i >= 0; i--) if (evs[i].off <= now) evs.splice(i, 1);
      const map = {};
      for (const e of evs) if (e.on <= now) map[e.midi] = e.lane;
      const sig = Object.keys(map).sort().map((k) => k + map[k]).join('|');
      if (sig !== litSig.current) { litSig.current = sig; setLitKeys(map); }
      litRaf.current = requestAnimationFrame(tick);
    };
    litRaf.current = requestAnimationFrame(tick);
  };

  const stopPlay = () => {
    if (playHandle.current) { playHandle.current.stop(); playHandle.current = null; }
    clearLit();
    setPlaying(false);
  };

  // TUNE trim — a live calibration probe (¢) on the current TREBLE pack: the
  // knob writes pack.tuneCents = baseTune + trim, audible on the next chord.
  // Transient by design (like `lanes`): a probe for finding a pack's true
  // offset by ear, which then gets stamped into info.json for good. Resets
  // when the treble instrument changes.
  const [tuneTrim, setTuneTrim] = useState(0);
  useEffect(() => { setTuneTrim(0); }, [active?.trebleInstrument]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const prov = active?.trebleInstrument ? await getInstrument(active.trebleInstrument).catch(() => null) : null;
      if (!cancelled && prov?.pack) prov.pack.tuneCents = (prov.pack.baseTune || 0) + tuneTrim;
    })();
    return () => { cancelled = true; };
  }, [tuneTrim, active?.trebleInstrument]);

  // Click-to-hear on the keyboard: the clicked note, dry, with the current
  // TREBLE instrument (async — first use of an instrument decodes it).
  const auditionKey = async (midi) => {
    const s = active;
    if (!s) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      playOnce(ctx, await getInstrument(s.trebleInstrument), midi);
    } catch { /* an audition that fails is silence, never an error dialog */ }
  };

  const togglePlay = async () => {
    const s = active;
    if (!s) return;
    if (playing) { stopPlay(); return; }
    if (!s.progression.trim()) { updateSeed(s.id, { error: t('msgSeedEmpty') }, false); return; }

    updateSeed(s.id, { error: '' }, false);
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      liveInstrument.current = { key: s.trebleInstrument, soundfont: await getInstrument(s.trebleInstrument) };
      liveBassInstrument.current = { key: s.bassInstrument,
        soundfont: await getBassInstrument(s.bassInstrument) };
      setPlaying(true);
      runLitLoop(ctx);
      playHandle.current = startSeed({
        ctx,
        onNote: (midi, lane, at, durS) => {
          litEvents.current.push({ midi, lane, on: at, off: at + Math.min(durS, 4) });
        },
        getSeed: () => {
          const c = liveSeed.current;
          return { progression: c.progression, bpm: Number(c.bpm), bars: Number(c.bars), sig: c.sig,
                   style: c.style, lanes: c.lanes,
                   trebleVolume: Number(c.trebleVolume) / 100, bassVolume: Number(c.bassVolume) / 100,
                   trebleOctave: Number(c.trebleOctave) || 0, bassOctave: Number(c.bassOctave) || 0,
                   // Read once, when the graph is built — see startSeed.
                   highpass: Number(c.highpass), lowpass: Number(c.lowpass),
                   // percent → the engine's multiplier scale (50% = 1)
                   reverb: c.reverb, trebleReverb: Number(c.trebleReverb) / 50, bassReverb: Number(c.bassReverb) / 50 };
        },
        getSoundFont: () => liveInstrument.current.soundfont,
        getBassSoundFont: () => liveBassInstrument.current.soundfont,
      });
    } catch (e) {
      stopPlay();
      updateSeed(s.id, { error: `${t('msgSeedPlayFailed')}: ${e.message}` }, false);
    }
  };

  // Instrument changes are async, so they are prepared here rather than inside
  // the scheduler — which must never await.
  useEffect(() => {
    const key = active?.trebleInstrument;
    if (!playing || !key || key === liveInstrument.current.key) return;
    let cancelled = false;
    getInstrument(key)
      .then((soundfont) => { if (!cancelled) liveInstrument.current = { key, soundfont }; })
      .catch(() => { if (!cancelled) liveInstrument.current = { key, soundfont: null }; });
    return () => { cancelled = true; };
  }, [active?.trebleInstrument, playing]);

  // The bass lane's own instrument, prepared the same way. Empty clears it
  // immediately (nothing to load), so the bass falls back to the chord sound on
  // the next chord rather than waiting for a fetch that will never happen.
  useEffect(() => {
    const key = active?.bassInstrument ?? '';
    if (!playing || key === liveBassInstrument.current.key) return;
    if (!key) { liveBassInstrument.current = { key: '', soundfont: null }; return; }
    let cancelled = false;
    getBassInstrument(key)
      .then((soundfont) => { if (!cancelled) liveBassInstrument.current = { key, soundfont }; })
      .catch(() => { if (!cancelled) liveBassInstrument.current = { key, soundfont: null }; });
    return () => { cancelled = true; };
  }, [active?.bassInstrument, playing]);

  // The pack index is small and static; the samples behind each pack load only
  // when that instrument is first used.
  useEffect(() => { getPackIndex().then(setPacks); }, []);

  // Switching tabs or leaving the app must not leave a seed playing under a
  // different seed's form.
  useEffect(() => stopPlay, []);              // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { stopPlay(); }, [activeId]);  // eslint-disable-line react-hooks/exhaustive-deps

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
      // A sampled instrument has to be fetched + decoded before the render, which
      // is synchronous. First use of the session pulls the 23 MB SoundFont; after
      // that both it and each decoded preset are cached, so this is instant.
      let soundfont = null, bassSoundfont = null;
      if ((s.trebleInstrument && s.trebleInstrument !== 'sine') || s.bassInstrument) {
        setBusyMsg(t('msgSeedBusyInstrument'));
        await repaint();
        soundfont = await getInstrument(s.trebleInstrument);
        // Empty means the bass plays the chord instrument (null → the engine
        // falls through to `soundfont`); 'sine' means the built-in synth (the
        // wrapper's sentinel) — two different choices, see getBassInstrument.
        bassSoundfont = await getBassInstrument(s.bassInstrument);
      }

      setBusyMsg(t('msgSeedBusyRender'));
      await repaint();
      const { audio, audioExt, midi } = generateSeed({
        progression: s.progression, bpm: Number(s.bpm), bars: Number(s.bars), sig: s.sig,
        loops: Number(s.loops), style: s.style, trebleInstrument: s.trebleInstrument, soundfont, bassSoundfont,
        trebleVolume: Number(s.trebleVolume) / 100, bassVolume: Number(s.bassVolume) / 100,
        trebleOctave: Number(s.trebleOctave) || 0, bassOctave: Number(s.bassOctave) || 0,
        lanes: s.lanes, highpass: Number(s.highpass), lowpass: Number(s.lowpass),
        reverb: s.reverb, trebleReverb: Number(s.trebleReverb) / 50, bassReverb: Number(s.bassReverb) / 50,
        format: s.format, mp3Bitrate: Number(s.mp3Bitrate),
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
      <AppHeader appName={APP_NAME} appVersion={APP_VERSION}>
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
              playing={playing}
              litKeys={litKeys} onAudition={auditionKey}
              tuneTrim={tuneTrim} onTuneTrim={setTuneTrim}
              packs={packs}
              // ⚠ MONITOR_FIELDS are not part of the .yams, so touching one must
              // NOT flag the document unsaved — an edit dot over a change that
              // no Save could ever capture is a lie the user has to act on.
              onField={(patch) => updateSeed(active.id, patch,
                Object.keys(patch).some((k) => !MONITOR_FIELDS.has(k)))}
              onRender={render}
              onPlay={togglePlay}
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
// The instrument list, grouped by SOURCE — mirroring the style menu's Textures /
// Rhythms. Two instruments can share a name across groups ("Harp" under GM and
// under VSCO); the group header is what tells them apart, which is exactly the
// side-by-side needed to judge one against the other.
//
// One component because two selects use it — the chord instrument and the bass
// instrument. A second hand-written copy is a list that silently goes stale the
// next time a source is added.
// The instrument list as DATA — one flat array both Combobox pickers share.
// Each entry carries two orthogonal facts about the instrument:
//   family — the MUSICAL grouping (Keys / Guitars / …): what sections the list
//   group  — the SOURCE (Yaiol / GM / VSCO): rides each row as a muted trailing
//            tag (`.pop-dim`), the way ampl's language picker carries the code —
//            it is what tells the GM Harp from the VSCO Harp during the
//            audition pass.
// A VSCO pack's family starts from its name's first segment (the library's own
// folder structure: brass-fhorn-stac, woodwinds-oboe-sus, …), then two families
// split further: STRINGS by mechanism — the harp is plucked, everything else in
// the string folder is bowed (pizzicato stays with its instrument: it is a
// technique, not a different instrument) — and PERCUSSION by pitch, where a
// bar-or-skin that sounds a definite note (marimba, xylophone, glockenspiel,
// bells, timpani) is Tuned and the drum kit material is not. The GM subset
// declares its family directly (soundfont.js INSTRUMENTS).
const TUNED_PERCUSSION = /marimba|xylo|glock|bell|chime|timpani|vibra|celest/;
const packFamily = (name) => {
  const prefix = name.split('-')[0];
  if (prefix === 'keys') return 'Keys';
  if (prefix === 'strings') return name.includes('harp') ? 'Strings (Plucked)' : 'Strings (Bowed)';
  if (prefix === 'brass') return 'Winds (Brass)';
  if (prefix === 'woodwinds') return 'Winds (Wood)';
  if (prefix === 'percussion' || prefix === 'vsco1percussion') {
    return TUNED_PERCUSSION.test(name) ? 'Percussion (Tuned)' : 'Percussion (Untuned)';
  }
  return 'Misc';
};

// Fixed section order — musical convention (score order-ish), not alphabetical.
const FAMILY_ORDER = ['Keys', 'Strings (Plucked)', 'Strings (Bowed)', 'Winds (Wood)', 'Winds (Brass)',
                      'Percussion (Tuned)', 'Percussion (Untuned)', 'Voices', 'Synth', 'Misc'];

// One list entry per INSTRUMENT; its articulations ride as `variants` and the
// panel shows them as mini buttons under the picker. The seed still stores the
// concrete pack value (`vsco:<id>`) — the grouping is pure view, .yams intact.
// family comes from the library's top-level folder (authoritative; packFamily
// is the fallback for an index predating it); `group` = the source tag
// (collection from info.json, 'VSCO' fallback).
const instrumentOptions = (t, packs) => {
  const out = INSTRUMENTS.map(i => ({
    value: i.key, label: t('optSeedInstrument' + i.i18n),
    group: i.program === null ? 'Yaiol' : 'GM', family: i.family,
  }));
  const groups = new Map();
  for (const p of packs) {
    const family = p.family || packFamily(p.name);
    const instrument = p.instrument || p.label;
    const key = `${family}|${instrument}`;
    if (!groups.has(key)) {
      groups.set(key, { value: `vsco:${p.name}`, label: instrument,
        group: p.collection || 'VSCO', family, role: 'bass', variants: [] });
    }
    const g = groups.get(key);
    g.variants.push({ value: `vsco:${p.name}`, label: p.articulation || instrument });
    // `role` gates the TREBLE picker: hide the instrument only when EVERY
    // variant is bass-only (one treble-able articulation keeps it listed).
    if (p.role !== 'bass') g.role = p.role;
  }
  return [...out, ...groups.values()];
};

// The rows the picker shows: filtered, then laid out family by family with a
// header row ({ header }) opening each non-empty section. Empty search shows the
// WHOLE list — clicking into the field is "open the menu", typing narrows it.
// Matching includes the family and the source tag, so "wood", "keys" or "vsco"
// all filter — and a family with no survivors contributes no header, because a
// bare section label reads as a broken list.
const instrumentItems = (options, search) => {
  const q = search.trim().toLowerCase();
  const kept = q
    ? options.filter(o => o.label.toLowerCase().includes(q) || o.group.toLowerCase().includes(q) ||
                          o.family.toLowerCase().includes(q))
    : options;
  const rows = [];
  for (const family of FAMILY_ORDER) {
    const inFamily = kept.filter(o => o.family === family)
      .sort((a, b) => a.label.localeCompare(b.label));
    if (!inFamily.length) continue;
    rows.push({ header: family });
    rows.push(...inFamily);
  }
  return rows;
};

// ─── Family picker — one ICON when closed, icon + name rows when open ────────
// Screen space: the closed control is a single .btn.icon showing the selected
// family's icon (blank for All — no icon by design), which leaves the row's
// width to the instrument name. Composition of catalog pieces (.btn.icon +
// Popover + .pop-item), the Combobox's own dropdown idiom.
const FAMILY_ICONS = {
  'Keys': IconFamilyKeys,
  'Percussion (Tuned)': IconFamilyPercTuned,
  'Strings (Plucked)': IconFamilyStrPlucked,
  'Strings (Bowed)': IconFamilyStrBowed,
  'Synth': IconFamilySynth,
  'Voices': IconFamilyVoices,
  'Winds (Brass)': IconFamilyWindsBrass,
  'Winds (Wood)': IconFamilyWindsWood,
};
function FamilyPicker({ t, value, families, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const Icon = FAMILY_ICONS[value];
  const pick = (f) => { onChange(f); setOpen(false); };
  return (
    <>
      <button type="button" ref={btnRef} className="btn icon"
              title={value || t('optSeedInstrumentFamilyAll')}
              onClick={() => setOpen((o) => !o)}>
        {Icon ? <Icon /> : null}
      </button>
      <Popover anchorRef={btnRef} open={open} onClose={() => setOpen(false)}>
        <button type="button" className={`pop-item${!value ? ' active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); pick(''); }}>
          {t('optSeedInstrumentFamilyAll')}
        </button>
        {families.map((f) => {
          const FIcon = FAMILY_ICONS[f];
          return (
            <button key={f} type="button" className={`pop-item${value === f ? ' active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); pick(f); }}>
              {FIcon ? <FIcon /> : null}{f}
            </button>
          );
        })}
      </Popover>
    </>
  );
}

// ─── The keyboard — Chord Player's piano strip ───────────────────────────────
// A display + audition control: keys light while the seed plays (treble and
// bass in their own colours, via the player's onNote tap) and clicking a key
// hears it with the current treble instrument. C1..C7; white keys share the
// row's width, black keys ride the boundaries (their left offsets are computed
// layout data, not styling).
const KBD_LO = 24, KBD_HI = 96;                       // C1 .. C7
const BLACK_PC = new Set([1, 3, 6, 8, 10]);
function Keyboard({ lit, onPlay }) {
  const whites = [], blacks = [];
  let wIdx = 0;
  for (let m = KBD_LO; m <= KBD_HI; m++) {
    if (BLACK_PC.has(m % 12)) blacks.push({ m, at: wIdx });
    else { whites.push({ m }); wIdx++; }
  }
  const cls = (m, base) => `kbd-key ${base}${lit[m] ? ` on-${lit[m]}` : ''}`;
  return (
    <div className="kbd">
      {whites.map((k) => (
        <button key={k.m} type="button" className={cls(k.m, 'white')}
                onPointerDown={() => onPlay?.(k.m)} />
      ))}
      {blacks.map((k) => (
        <button key={k.m} type="button" className={cls(k.m, 'black')}
                style={{ left: `${(k.at / whites.length) * 100}%` }}
                onPointerDown={() => onPlay?.(k.m)} />
      ))}
    </div>
  );
}

function SeedPanel({ t, seed, busy, busyMsg, playing, packs, litKeys, onAudition, tuneTrim, onTuneTrim, onField, onRender, onPlay, onReveal }) {
  const { progression, bpm, bars, sig, loops, style, trebleInstrument, bassInstrument, lanes,
          trebleVolume, bassVolume, trebleOctave, bassOctave,
          highpass, lowpass, reverb, trebleReverb, bassReverb,
          format, mp3Bitrate, name, output, filePath, error, result } = seed;

  // Combobox view state — pure view, never written to the .yams. Each picker
  // shows the SELECTED label while closed and the search text while open (the
  // ampl language-picker pattern), so it needs its own search + open pair.
  // Which of the two form tabs is showing — Music (what plays) vs Render (how
  // the file is produced). Pure view state, never persisted.
  const [panelTab, setPanelTab] = useState('music');
  const [instSearch, setInstSearch] = useState('');
  const [instOpen, setInstOpen] = useState(false);
  const [instFamily, setInstFamily] = useState('');       // '' = all families
  const [bassSearch, setBassSearch] = useState('');
  const [bassOpen, setBassOpen] = useState(false);
  const [bassFamily, setBassFamily] = useState('');
  // (the library-audit review system lived here 2026-08-30..31 — removed once
  // the audit tooling had done its job; the collected verdicts remain in
  // local/instrument-review.json)
  const renderInstrumentRow = (o) => <>{o.label} <span className="pop-dim">{o.group}</span></>;
  const renderBassRow = renderInstrumentRow;
  // The lane monitor as two MUTE buttons (one per lane) — a view over the same
  // `lanes` monitor field the old Hear select set: both/bass/treble/none.
  const trebleMuted = lanes === 'bass' || lanes === 'none';
  const bassMuted = lanes === 'treble' || lanes === 'none';
  const setMutes = (tM, bM) =>
    onField({ lanes: tM && bM ? 'none' : tM ? 'bass' : bM ? 'treble' : 'both' });
  const options = useMemo(() => instrumentOptions(t, packs), [t, packs]);
  // An option matches a value directly OR through one of its variants (the
  // instrument-level entry stands for all its articulations).
  const optionFor = (value) =>
    options.find(o => o.value === value || o.variants?.some(v => v.value === value));
  const labelOf = (value) => optionFor(value)?.label ?? value;
  const variantsOf = (value) => optionFor(value)?.variants || [];
  // Picking an instrument keeps the current articulation when it already
  // belongs to it, otherwise lands on the first one.
  const pickValue = (o, current) =>
    o.variants?.some(v => v.value === current) ? current : (o.variants?.[0]?.value ?? o.value);
  // The family pre-filter feeding each picker's left-hand select — only
  // families that actually hold instruments, in the fixed musical order.
  const families = useMemo(
    () => FAMILY_ORDER.filter(f => options.some(o => o.family === f)), [options]);
  const byFamily = (family) => family ? options.filter(o => o.family === family) : options;
  // Picking a FAMILY also picks that family's first instrument for the lane —
  // the icon is a real selector, not just a list filter: the sound follows the
  // click, no second pick needed (user, 2026-09-02). '' (all) filters only.
  const pickFamily = (family, field, current, extraFilter = () => true) => {
    const first = byFamily(family).filter(extraFilter)[0];
    if (family && first) onField({ [field]: pickValue(first, current) });
  };

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
      {/* Two tabs (the catalog .tabs/.tab pair, same as the Settings dialog):
          MUSIC = what plays (both live and in the file); RENDER = how the file
          is produced (loops, format, bitrate, output name). The summary and
          the action row stay below both. */}
      <div className="tabs">
        <button type="button" className={`tab ${panelTab === 'music' ? 'active' : ''}`}
                onClick={() => setPanelTab('music')}>{t('tabSeedMusic')}</button>
        <button type="button" className={`tab ${panelTab === 'render' ? 'active' : ''}`}
                onClick={() => setPanelTab('render')}>{t('tabSeedRender')}</button>
      </div>
      {panelTab === 'music' && <>
      {/* Name — the seed's own name, above every other field. Feeds the {name} token
          the default Output template is built from. */}
      <div className="seed-field">
        <label className="dlg-field-label">{t('lblSeedName')}</label>
        <input className="input" type="text"
               value={name} onChange={e => onField({ name: e.target.value })} />
      </div>

      {/* Numeric / select parameters */}
      <div className="seed-grid">
        {/* Row one shares the instrument line's 50/50 skeleton so Style's left
            edge aligns with the treble lane below it. */}
        <div className="seed-field seed-field-full">
          <div className="seed-instrument-line">
            <div className="seed-lane">
              {/* four EQUAL columns (BPM / bars / sig / spare) — each control
                  fills its cell, so the fields line up with nothing content-sized */}
              <div className="seed-params">
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedBpm')}</label>
          <NumberField min={20} max={300} step={1} width="100%"
                 value={bpm} onChange={v => onField({ bpm: v })} />
        </div>
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedBars')}</label>
          <NumberField min={0.25} step={0.25} width="100%"
                 value={bars} onChange={v => onField({ bars: v })} />
        </div>
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedSig')}</label>
          <input className="input" type="text"
                 value={sig} onChange={e => onField({ sig: e.target.value })} />
        </div>
              </div>
            </div>
            <div className="seed-lane">
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedStyle')}</label>
          {/* Three collections by FIGURE TYPE (user taxonomy 2026-09-02):
              Pads state the harmony, Arpeggios break it, Grooves rhythm it.
              The old Textures/Rhythms split (implementation history) is gone. */}
          <select className="select" value={style} onChange={e => onField({ style: e.target.value })}>
            {STYLE_GROUPS.map(g => (
              <optgroup key={g.key} label={t('lblSeedStyleGroup' + g.key.charAt(0).toUpperCase() + g.key.slice(1))}>
                {g.styles.map(s => (
                  <option key={s} value={s}>{t('optSeedStyle' + s.charAt(0).toUpperCase() + s.slice(1))}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
            </div>
          </div>
        </div>
        {/* The lane monitor lives as the per-lane MUTE buttons on the
            instrument line below (first control of each lane) — the old Hear
            select is gone, but the internal `lanes` monitor field is the same:
            both / bass / treble / none, never saved to the .yams. */}
        {/* ── The instrument line: 8 controls on ONE row — per lane (treble
            then bass): Volume knob, Octave knob, Family select, Instrument
            Combobox. The Knob is the catalog's compact instrument-style
            control (ui-ctl-knob); the pickers are the same catalog pieces as
            before (.select + Combobox), laid out on a single line. */}
        <div className="seed-field seed-field-full">
          {/* BASS on the left, TREBLE on the right — the keyboard's own
              left-low / right-high order. */}
          <div className="seed-instrument-line">
            {/* The bass lane's own player — empty = same as the treble
                instrument, pinned above the filtered list. */}
            <div className="seed-lane">
              <label className="dlg-field-label">{t('lblSeedBassInstrument')}</label>
              <div className="seed-row">
                <button type="button" className="btn icon"
                        title={t(bassMuted ? 'tipSeedUnmute' : 'tipSeedMute')}
                        onClick={() => setMutes(trebleMuted, !bassMuted)}>
                  {bassMuted ? <VolumeX /> : <Volume2 />}
                </button>
                <Knob label={t('lblSeedKnobVolume')} min={0} max={100} step={5} unit="%"
                      value={bassVolume} onChange={v => onField({ bassVolume: v })} />
                <Knob label={t('lblSeedKnobOctave')} min={-1} max={1} step={1}
                      value={bassOctave} onChange={v => onField({ bassOctave: v })} />
                {/* This lane's reverb SEND — how much bass feeds the room
                    picked on the Render tab. Kept low by default: mud lives here. */}
                <Knob label={t('lblSeedKnobReverb')} min={0} max={100} step={5} unit="%"
                      disabled={reverb === 'none'}
                      value={bassReverb} onChange={v => onField({ bassReverb: v })} />
                <div className="barh-grp seed-picker-weld">
                <FamilyPicker t={t} value={bassFamily} families={families}
                  onChange={f => { setBassFamily(f); pickFamily(f, 'bassInstrument', bassInstrument); }} />
                <div className="seed-combo">
                <Combobox
                  placeholder={t('plhSeedInstrumentFilter')}
                  value={bassOpen ? bassSearch : (bassInstrument ? labelOf(bassInstrument) : t('optSeedBassInstrumentSame'))}
                  onChange={setBassSearch}
                  onFocus={() => setBassSearch('')}
                  onOpenChange={setBassOpen}
                  items={instrumentItems(byFamily(bassFamily), bassSearch)}
                  itemKey={(o, i) => o.header ? `h-${o.header}` : o.value}
                  itemHeader={o => o.header ?? null}
                  itemActive={o => o.value === bassInstrument || o.variants?.some(v => v.value === bassInstrument)}
                  renderItem={renderBassRow}
                  onPick={o => { onField({ bassInstrument: pickValue(o, bassInstrument) }); setBassSearch(''); }}
                  renderHeader={({ close }) => (
                    <button type="button" className={`pop-item${bassInstrument === '' ? ' active' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); onField({ bassInstrument: '' }); setBassSearch(''); close(); }}>
                      {t('optSeedBassInstrumentSame')}
                    </button>
                  )}
                />
                </div>
                </div>
              </div>
              {bassInstrument && variantsOf(bassInstrument).length > 1 && (
                <div className="seed-artics">
                  {variantsOf(bassInstrument).map(v => (
                    <button key={v.value} type="button"
                      className={`btn small opt-btn${v.value === bassInstrument ? ' active' : ''}`}
                      onClick={() => onField({ bassInstrument: v.value })}>{v.label}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="seed-lane">
              <label className="dlg-field-label">{t('lblSeedInstrument')}</label>
              <div className="seed-row">
                <button type="button" className="btn icon"
                        title={t(trebleMuted ? 'tipSeedUnmute' : 'tipSeedMute')}
                        onClick={() => setMutes(!trebleMuted, bassMuted)}>
                  {trebleMuted ? <VolumeX /> : <Volume2 />}
                </button>
                <Knob label={t('lblSeedKnobVolume')} min={0} max={100} step={5} unit="%"
                      value={trebleVolume} onChange={v => onField({ trebleVolume: v })} />
                <Knob label={t('lblSeedKnobOctave')} min={-1} max={1} step={1}
                      value={trebleOctave} onChange={v => onField({ trebleOctave: v })} />
                {/* Live tuning probe on the treble pack — calibration by ear,
                    never saved; the found value gets stamped in the library. */}
                <Knob label={t('lblSeedKnobTune')} min={-50} max={50} step={1} unit="¢"
                      value={tuneTrim} onChange={onTuneTrim} />
                {/* This lane's reverb SEND into the shared room. */}
                <Knob label={t('lblSeedKnobReverb')} min={0} max={100} step={5} unit="%"
                      disabled={reverb === 'none'}
                      value={trebleReverb} onChange={v => onField({ trebleReverb: v })} />
                <div className="barh-grp seed-picker-weld">
                <FamilyPicker t={t} value={instFamily} families={families}
                  onChange={f => { setInstFamily(f); pickFamily(f, 'trebleInstrument', trebleInstrument, o => o.role !== 'bass'); }} />
                <div className="seed-combo">
                <Combobox
                  placeholder={t('plhSeedInstrumentFilter')}
                  value={instOpen ? instSearch : labelOf(trebleInstrument)}
                  onChange={setInstSearch}
                  onFocus={() => setInstSearch('')}
                  onOpenChange={setInstOpen}
                  items={instrumentItems(byFamily(instFamily).filter(o => o.role !== 'bass'), instSearch)}
                  itemKey={(o, i) => o.header ? `h-${o.header}` : o.value}
                  itemHeader={o => o.header ?? null}
                  itemActive={o => o.value === trebleInstrument || o.variants?.some(v => v.value === trebleInstrument)}
                  renderItem={renderInstrumentRow}
                  onPick={o => { onField({ trebleInstrument: pickValue(o, trebleInstrument) }); setInstSearch(''); }}
                />
                </div>
                </div>
              </div>
              {/* The selected instrument's articulations, as mini buttons
                  under the picker — exactly one active. */}
              {variantsOf(trebleInstrument).length > 1 && (
                <div className="seed-artics">
                  {variantsOf(trebleInstrument).map(v => (
                    <button key={v.value} type="button"
                      className={`btn small opt-btn${v.value === trebleInstrument ? ' active' : ''}`}
                      onClick={() => onField({ trebleInstrument: v.value })}>{v.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* The room. Generated, not recorded — a set of delays tuned to behave
            like a space, applied over the finished mix rather than per note.
            ONE room for the whole seed; how much each lane sends into it is
            the per-lane reverb knob on the instrument line (the aux model). */}
        <div className="seed-field-full seed-mix-line">
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedReverb')}</label>
          <select className="select" style={{ width: '140px' }} value={reverb}
                  onChange={e => onField({ reverb: e.target.value })}>
            {ROOM_KEYS.map(k => (
              <option key={k} value={k}>{t('optSeedReverb' + k.charAt(0).toUpperCase() + k.slice(1))}</option>
            ))}
          </select>
        </div>
        {/* The master filters — the last thing the whole mix passes through.
            Below the highpass sits rumble and the stretched tail of notes placed
            under an instrument's real range; above the lowpass sits sample noise
            and codec fizz. Neither is music, both eat headroom. 0 turns one off. */}
        {/* No break: the whole output chain — room, amount, and the two master
            cutoffs — reads as ONE row of four. */}
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedHighpass')}</label>
          <NumberField min={0} max={2000} step={10} width="96px"
                 value={highpass} onChange={v => onField({ highpass: v })} />
        </div>
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedLowpass')}</label>
          {/* Max 20000: "off" (0) parks the live filter at 20 kHz, so a settable
              value ABOVE the park point would filter less than off does. */}
          <NumberField min={0} max={20000} step={500} width="96px"
                 value={lowpass} onChange={v => onField({ lowpass: v })} />
        </div>
        {/* Play lives with the sound controls — the whole line is "what am I
            hearing". Preview needs no saved file; it writes nothing. */}
        <button className="btn seed-mix-play" onClick={onPlay}
                disabled={busy || summary.count === 0 || summary.sigBad || summary.invalid.length > 0}>
          {playing ? <Square /> : <Play />}{playing ? t('btnSeedStop') : t('btnSeedPlay')}
        </button>
        </div>
      </div>

      {/* The keyboard — lights with the playing notes, clicks audition the
          treble instrument. */}
      <Keyboard lit={litKeys} onPlay={onAudition} />
      </>}

      {/* ── RENDER tab: everything about producing the file. `loops` sets the
          rendered length (playback loops forever regardless), format/bitrate
          the encoding, Output the file's base name. */}
      {panelTab === 'render' && <>
      <div className="seed-grid">
        <div className="seed-field">
          <label className="dlg-field-label">{t('lblSeedLoops')}</label>
          <NumberField min={1} max={32} step={1} width="76px"
                 value={loops} onChange={v => onField({ loops: v })} />
        </div>
        <div className="seed-field">
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
          {style}, {instrument}, {instrument-treble}, {instrument-bass}, {bpm}, {loops},
          {reverb-type}, {reverb-amount}, {highpass} and {lowpass} are replaced with the current
          form values at render time (see resolveName()). Emptied by hand → the DEFAULT_OUTPUT
          template. */}
      <div className="seed-field">
        <label className="dlg-field-label">{t('lblSeedOutput')}</label>
        <input className="input" type="text"
               value={output} onChange={e => onField({ output: e.target.value })} />
        <span className="hint">{t('hntSeedOutput')}</span>
      </div>
      </>}

      {/* Live projection - what this form will render before you click.
          Render information, so it lives on the RENDER tab only. */}
      {panelTab === 'render' && <div className="seed-summary">
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
      </div>}

      {/* Action — per tab: MUSIC gets Play (writes nothing), RENDER gets the
          Render button (needs a saved .yams — that file's folder is the
          output location). */}
      <div className="seed-actions">
        {panelTab === 'render' && (
          <button className="btn primary" onClick={onRender} disabled={busy || !saved || summary.count === 0 || summary.sigBad || summary.invalid.length > 0}>
            <AudioWaveform />{busy ? (busyMsg || t('msgSeedBusy')) : t('btnSeedRender')}
          </button>
        )}
        {/* Play moved onto the sound-controls line (seed-mix-line) above. */}
        {panelTab === 'render' && !saved && <span className="hint">{t('hntSeedRenderNeedsSave')}</span>}
        {error && <span className="seed-error">{error}</span>}
      </div>

      {/* Result */}
      {/* The saved-files panel is RENDER information — it never shows on Music. */}
      {result && panelTab === 'render' && (
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
                <div className="dlg-about-id">{APP_NAME} <b>v{APP_VERSION}</b> by yaiol</div>
                <div className="dlg-about-desc">{t('msgDlgSettingsAboutDesc')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

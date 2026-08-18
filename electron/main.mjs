// data-icon="yaiol:ai-music-seed"
process.noDeprecation = true;
import { app, BrowserWindow, Menu, dialog, shell } from "electron";
import path from "path";
import fs from "fs";
import net from "net";
import express from "express";
import { fileURLToPath } from "node:url";
import pkg from "../package.json" with { type: "json" };
import { mark, dumpStartupTiming } from "./startup-timing.mjs";
mark("electron boot + module imports");

// ESM has no __dirname - derive it from import.meta.url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = !app.isPackaged;
const DEV_PORT = pkg.devPort;
const APP_NAME = pkg.productName;

app.setPath('userData', path.join(app.getPath('appData'), 'yaiol', isDev ? `${APP_NAME} (Dev)` : APP_NAME));

// ⚠ CLAUDE: Always use this module-level mainWindow for all dialog calls.
// Never use BrowserWindow.fromWebContents(event.sender) - silently breaks in packaged .exe.
let mainWindow = null;

// ── File association (.yams) — open a seed by double-click / "Open with". ──────
// A .yams passed on the command line: argv[1] in the packaged app, argv[2]+ under
// the dev electron launcher. The first-launch file rides in via a query param; a
// file opened while the app is already running is queued for the renderer to poll.
const isYams    = (a) => /\.yams$/i.test(a) && fs.existsSync(a);
const startFile = process.argv.slice(isDev ? 2 : 1).find(isYams) || null;
const pendingFiles = [];   // second-instance (Windows/Linux) + open-file (macOS) queue

// Single-instance: a second double-click forwards its path to the running window
// instead of opening a duplicate. ⚠ Must run before app.whenReady().
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', (_e, argv) => {
  if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
  const fp = argv.slice(isDev ? 2 : 1).find(isYams);
  if (fp) pendingFiles.push(fp);
});
// macOS delivers the path via this event (argv carries nothing there).
app.on('open-file', (e, fp) => { e.preventDefault(); if (isYams(fp)) pendingFiles.push(fp); });

function startServer(callback) {
  function findFreePort(port, cb) {
    const tester = net.createServer();
    tester.once("error", () => findFreePort(port + 1, cb));
    tester.once("listening", () => { tester.close(() => cb(port)); });
    tester.listen(port);
  }

  const api = express();
  // ⚠ CLAUDE: a seed is base64-encoded into a JSON body. A long progression × loops
  // can render 20+ min of WAV (~100 MB → ~150 MB base64); a small limit makes Express
  // reject it with an HTML 413, which the renderer then fails to parse as JSON. Keep
  // this generous. (The live seed-summary warns the user before they hit a huge size.)
  api.use(express.json({ limit: "512mb" }));
  api.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") { res.sendStatus(204); return; }
    next();
  });

  api.get("/version", (_req, res) => res.json({ version: app.getVersion() }));

  // Write the rendered seed's audio + MIDI to <dir>/<name>.{wav|mp3,mid}. `dir` is the
  // folder of the seed's saved .yams (the renderer derives it from the file path); a
  // seed must be saved before it can render, so there is no separate output-folder pick.
  api.post("/save-seed", (req, res) => {
    try {
      const { dir, name, audioB64, audioExt, midiB64 } = req.body || {};
      if (!dir || !name) return res.status(400).json({ error: "dir and name required" });
      const ext = audioExt === "mp3" ? "mp3" : "wav";
      fs.mkdirSync(dir, { recursive: true });
      const audioPath = path.join(dir, `${name}.${ext}`);
      const midiPath  = path.join(dir, `${name}.mid`);
      fs.writeFileSync(audioPath, Buffer.from(audioB64, "base64"));
      fs.writeFileSync(midiPath,  Buffer.from(midiB64,  "base64"));
      res.json({ audioPath, midiPath });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Open a .yams seed file and return its parsed fields (the inverse of save).
  api.post("/load-seed", async (req, res) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: (req.body && req.body.title) || "Open seed",
      properties: ["openFile"],
      filters: [{ name: (req.body && req.body.filterName) || "AI Music Seed", extensions: ["yams"] }],
    });
    if (result.canceled || !result.filePaths.length) return res.json({ canceled: true });
    try {
      const seed = JSON.parse(fs.readFileSync(result.filePaths[0], "utf8"));
      res.json({ seed, path: result.filePaths[0] });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // Save the .yams config to an explicit path (Save → the current file, overwrite).
  api.post("/save-yams", (req, res) => {
    try {
      const { path: p, seed } = req.body || {};
      if (!p || !seed) return res.status(400).json({ error: "path and seed required" });
      fs.writeFileSync(p, JSON.stringify(seed, null, 2));
      res.json({ path: p });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Save As — pick a .yams path via the native save dialog, write the config there.
  api.post("/save-yams-as", async (req, res) => {
    const { seed, defaultName, dir, title, filterName } = req.body || {};
    if (!seed) return res.status(400).json({ error: "seed required" });
    const base = `${defaultName || "seed"}.yams`;
    const result = await dialog.showSaveDialog(mainWindow, {
      title: title || "Save seed as",
      defaultPath: dir ? path.join(dir, base) : base,
      filters: [{ name: filterName || "AI Music Seed", extensions: ["yams"] }],
    });
    if (result.canceled || !result.filePath) return res.json({ canceled: true });
    try {
      fs.writeFileSync(result.filePath, JSON.stringify(seed, null, 2));
      res.json({ path: result.filePath });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // File-association open — read + parse a .yams by absolute path (base64 in the
  // query so any path survives). Used for the first-launch file (startSeed query param).
  api.get("/read-seed", (req, res) => {
    try {
      const p = Buffer.from(req.query.path || "", "base64").toString();
      const seed = JSON.parse(fs.readFileSync(p, "utf8"));
      res.json({ seed, path: p });
    } catch (e) { res.status(404).json({ error: e.message }); }
  });

  // Poll — a .yams opened while the app was already running (second instance /
  // macOS open-file). Returns the next queued seed, or { seed: null } when idle.
  api.get("/pending-seed", (_req, res) => {
    const p = pendingFiles.shift();
    if (!p) return res.json({ seed: null });
    try { res.json({ seed: JSON.parse(fs.readFileSync(p, "utf8")), path: p }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  });

  // Reveal a saved file in the OS file manager.
  api.post("/reveal", (req, res) => {
    const p = req.body && req.body.path;
    if (p) shell.showItemInFolder(p);
    res.json({ ok: true });
  });

  findFreePort(4000, (port) => {
    api.listen(port, () => {
      mark("express listening");
      console.log(`${APP_NAME} API on http://localhost:${port}`);
      if (callback) callback(port);
    });
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    title: APP_NAME,
    width: 1200,
    height: 760,
    minWidth: 1120,
    minHeight: 665,
    frame: true,
    icon: path.join(__dirname, isDev ? '../public/app.ico' : '../dist/app.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const query = { apiPort: String(port) };
  if (startFile) query.startSeed = Buffer.from(startFile).toString("base64");
  if (isDev) {
    const qs = new URLSearchParams(query).toString();
    mainWindow.loadURL(`http://localhost:${DEV_PORT}?${qs}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"), { query });
  }
  mark("BrowserWindow created");
  mainWindow.webContents.once('did-finish-load', () => { mark("renderer did-finish-load"); dumpStartupTiming({ appName: APP_NAME, isDev, userDataPath: app.getPath("userData") }); });
  mainWindow.webContents.on('did-finish-load', () => mainWindow.setTitle(isDev ? `${APP_NAME} (Dev)` : APP_NAME));

  // ⚠ CLAUDE: Ctrl+Shift+I is dead because Menu.setApplicationMenu(null) removes the default shortcut.
  // This restores it in dev only - do NOT remove.
  if (isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.shift && input.key === 'I') {
        mainWindow.webContents.toggleDevTools();
        event.preventDefault();
      }
    });
  }

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const appUrl = isDev ? `http://localhost:${DEV_PORT}` : `file://`;
    if (!url.startsWith(appUrl)) { event.preventDefault(); shell.openExternal(url); }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

app.whenReady().then(() => { mark("app.whenReady");
  Menu.setApplicationMenu(null);
  startServer((port) => createWindow(port));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) startServer((port) => createWindow(port));
});

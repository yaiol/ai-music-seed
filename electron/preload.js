// The ONE sanctioned preload for this app — everything else goes through the Express
// HTTP API. See ../../CLAUDE.md → "Electron IPC / Preload" for why this exception exists.
//
// ⚠ CLAUDE: do not delete. Electron 32+ removed File.path from the renderer sandbox, so a
// .yams DROPPED on the window arrives with no OS path — the tab opens untitled and can
// neither Save nor Render. webUtils.getPathForFile is the only official replacement: it
// reads a path from a File the user already chose (no extra filesystem access), needs no
// IPC round-trip, and touches only the built-in electron module (no ASAR path resolution).
const { contextBridge, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getFilePath: (file) => webUtils.getPathForFile(file),
});

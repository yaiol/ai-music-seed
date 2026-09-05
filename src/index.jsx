import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import pkg from '../package.json';
import { loadLang } from './i18n-gen';
import './assets/ui-colors.css'; // canonical color-token palette — MUST be first (synced from .common/shared)
import './styles.css';
import './assets/ui-app.css';    // shared canonical header-bar + button chrome (synced from .common/shared)
// The step grid is a catalog control with no component of its own — the markup
// is this app's — so it is named here, and that import is what tells the sync
// this app uses it. The Knob's skin needs no line: it rides with the component.
import './assets/ui-ctl-stepgrid.css';

// ⚠ CLAUDE: the active language chunk is awaited BEFORE the first render, so a non-English
// user never sees a flash of English. `.finally` (not `.then`) so a failed or unknown language
// still renders, in English. src/i18n-gen/ is GENERATED — see scripts/i18n-split.mjs.
const root = ReactDOM.createRoot(document.getElementById('root'));
loadLang(localStorage.getItem(`${pkg.storagePrefix}-lang`) || 'en')
  .finally(() => root.render(<App />));

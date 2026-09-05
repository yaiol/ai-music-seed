// check:render — a headless render of App.jsx through Vite's own pipeline
// (svgr, jsx), so a runtime exception surfaces here instead of as a blank
// Electron window. `npm run build` only proves the code COMPILES: a reference
// to a name that was never destructured builds clean and crashes on first
// render (2026-09-03, `pattern`). Run it after every App.jsx change.
// Asserts the render succeeds and the Music tab's editor markup is present.
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
globalThis.window = globalThis; globalThis.self = globalThis;
Object.defineProperty(globalThis, 'navigator', { value: { language: 'en-US', userAgent: 'node', platform: 'Win32' }, configurable: true });
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { documentElement: { setAttribute() {}, style: {} }, body: { classList: { add() {}, remove() {} } },
  addEventListener() {}, removeEventListener() {}, createElement: () => ({ style: {}, setAttribute() {} }), querySelector: () => null };
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.location = { search: '', href: 'http://localhost/', hash: '' };
globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};
globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
const server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const mod = await server.ssrLoadModule('/src/App.jsx');
  const App = mod.default;
  const html = renderToString(React.createElement(App));
  const missing = ['stepgrid', 'seed-band', 'seed-flagcol', 'seed-prog'].filter((c) => !html.includes(c));
  if (missing.length) { console.log('check:render FAILED — markup missing:', missing.join(', ')); process.exitCode = 1; }

  // ⚠ A RAW i18n KEY ON SCREEN. `t()` returns the key itself when it cannot
  // resolve one, so a bad lookup renders as its own name instead of throwing —
  // the app looks fine to every other check. It happens when a key is built by
  // concatenation (`t('optSeedStyle' + cap(k))`) and the helper is wrong: a
  // local `cap` shadowed the module-level key-capitaliser on 2026-09-04 and
  // every style, swing and flag label became `optSeedStyleundefined`. Build,
  // render and the engine checks were all green.
  const text = html.replace(/<[^>]*>/g, ' ');
  const leaked = [...new Set((text.match(/(?:lbl|opt|btn|tip|msg|plh|tab|hnt|ttl|unit)[A-Z][A-Za-z0-9]*/g) || []))];
  if (leaked.length) {
    console.log(`check:render FAILED — ${leaked.length} raw i18n key(s) on screen:`, leaked.slice(0, 8).join(', '));
    process.exitCode = 1;
  }
  const undef = [...new Set((text.match(/\S*undefined\S*/gi) || []))];
  if (undef.length) {
    console.log('check:render FAILED — "undefined" rendered as text:', undef.slice(0, 8).join(', '));
    process.exitCode = 1;
  }
  if (!missing.length && !leaked.length && !undef.length) console.log(`check:render OK (${html.length} chars)`);
} catch (e) {
  console.log('check:render FAILED:', (e && e.stack) || e); process.exitCode = 1;
} finally { await server.close(); }

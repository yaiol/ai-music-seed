// ui-fx-filedrop.jsx — the ONE canonical "drag a file onto the window to open it"
// behaviour for every yaiol electron app. Reference look: ai-music-seed (drop a
// .yams), markzen (drop a .md). Whenever an app can open/load a file, it should
// ALSO accept that file by drag-and-drop through this hook — same feature, one
// implementation, so no app hand-rolls its own drop wiring.
//
// The look (the dashed accent, blurred overlay) is the shared `.drop-overlay` /
// `.drop-overlay-label` CSS in ui-app.css; the behaviour (the dragover/dragleave/
// drop handlers + the flicker-proof leave guard + extension filter) is here.
//
// The overlay is position:absolute, so it covers its nearest POSITIONED ancestor.
// Attach `dropProps` to a position:relative CONTENT region (not the app root) so the
// blur covers only that area and the header bar stays un-blurred; with no positioned
// ancestor it falls back to the whole window.
//
// Usage — spread `dropProps` on the region that accepts drops and render `overlay`
// inside it (that region must be position:relative):
//   const { dropProps, overlay } = useFileDrop({
//     accept: ['.yams'],                       // extensions to accept (case-insensitive)
//     onFile: (file) => loadFromFile(file),    // called with the first matching File
//     label:  t('msgSeedDropHere'),            // overlay text (already localized)
//   });
//   return <div className="app-root" {...dropProps}> … {overlay} </div>;
//
// Only the file's `File` object is handed back — reading it (FileReader for JSON/text,
// or webUtils.getPathForFile for a path to save back) is the caller's job, exactly as
// with the app's Open button. Non-matching files are ignored. Single file by design
// (the common "open a document" case); a caller needing every dropped file can read
// them itself in onFile via the shared filter — extend here when a real consumer needs it.
//
// Distributed into each app's src/lib/ui-fx-filedrop.jsx by sync-shared — ⚠ SYNCED
// FILE, never edit the per-app copy; edit this canonical source and re-sync.
// Import: `import { useFileDrop } from './lib/ui-fx-filedrop';`
import React, { useState } from 'react';

export function useFileDrop({ accept = [], onFile, label }) {
  const [dragOver, setDragOver] = useState(false);
  const exts = accept.map((e) => e.toLowerCase());
  const matches = (f) => exts.length === 0 || exts.some((x) => f.name.toLowerCase().endsWith(x));

  const dropProps = {
    onDragOver: (e) => { e.preventDefault(); setDragOver(true); },
    // Only clear when the cursor leaves the drop element entirely — not on every
    // crossing between its children (relatedTarget = where the pointer went next).
    onDragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false); },
    onDrop: (e) => {
      e.preventDefault(); e.stopPropagation();
      setDragOver(false);
      const file = Array.from(e.dataTransfer.files).find(matches);
      if (file) onFile?.(file);
    },
  };

  // pointer-events:none (in the .drop-overlay CSS) lets the drop fall through to the
  // element carrying dropProps, so the overlay is purely visual.
  const overlay = dragOver ? (
    <div className="drop-overlay">
      <span className="drop-overlay-label">{label}</span>
    </div>
  ) : null;

  return { dropProps, overlay };
}

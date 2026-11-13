// uis-cbo-filter.jsx — a search box with a CATEGORY FILTER in front of it, drawn as one compact line.
//
// An icon button opens a short list of categories ("All" first); the choice narrows what the search box
// below offers. The control owns the button, the category list and its open/close; the CONSUMER owns the
// data - it filters `items` by the category and the text, exactly as it does for a plain UisCboStandard.
//
//   <UisCboFilter
//     icon={<ListFilter size={14} />} allLabel="All"
//     categories={[{ id: 'colour', title: 'Colour' }, …]} category={category} onCategory={setCategory}
//     value={query} onChange={setQuery} placeholder="Add an effect" items={rows} onPick={add} />
//
// The line is a label-less compact field (.uis-fld-labelled.compact > .uis-fld-labelled-ctl), so it takes the whole width of its
// panel and the controls are the compact height. Two other drawings: `roomy` = a welded bar group
// (.uis-barh-grp) inside a .uis-fld-labelled, for a normal form; `weld` = the same welded group on its own, for a bar
// or a toolbar. `className` is added to the weld, so the APP can place it (its width in a row) - never restyle it.
//
// `categories` is [{ id, title, icon? }]; `category` is the chosen id ('' = all). A category that carries an `icon`
// is drawn on its row, and the button shows the chosen category's icon (the `icon` prop stands for "all").
// `after` is extra controls (e.g. previous / next buttons) drawn inside the weld, after the search box.
// Everything else (`value`, `onChange`, `items`, `renderItem`, `itemKey`, `itemActive`, `onPick`, and every other
// option of UisCboStandard: `itemHeader`, `renderHeader`, `onFocus`, `onOpenChange`, ...) is the UisCboStandard's, passed
// straight through.
import React, { useRef, useState } from 'react';
import { UisPopover } from './uis-ctl-popover';
import { UisCboStandard } from './uis-cbo-standard';
import '../assets/uis-fld-labelled.css';

export function UisCboFilter({
  icon, allLabel, roomy = false, weld = false, className = '', after, categories = [], category = '', onCategory,
  value, onChange, placeholder = '', items = [], itemKey, renderItem, itemActive, onPick, ...rest
}) {
  const anchor = useRef(null);
  const [open, setOpen] = useState(false);
  const current = categories.find((c) => c.id === category);
  const title = current ? current.title : allLabel;
  const choose = (id) => (e) => {
    e.preventDefault();
    onCategory(id);
    setOpen(false);
  };
  const button = (
    <button ref={anchor} type="button" className="uis-btn ico" title={title} aria-label={title} onClick={() => setOpen(!open)}>{current && current.icon ? current.icon : icon}</button>
  );
  const search = (
    <UisCboStandard
      value={value} onChange={onChange} placeholder={placeholder}
      items={items} itemKey={itemKey} renderItem={renderItem} itemActive={itemActive} onPick={onPick} {...rest}
    />
  );
  const welded = (
    <div className={('uis-barh-grp uis-cbo-weld ' + className).trim()}>{button}<div className="uis-cbo-cell">{search}</div>{after}</div>
  );
  return (
    <>
      {roomy ? (
        <div className="uis-fld-labelled">{welded}</div>
      ) : weld ? (
        welded
      ) : (
        <div className="uis-fld-labelled compact"><div className="uis-fld-labelled-ctl">{button}{search}{after}</div></div>
      )}
      <UisPopover anchorRef={anchor} open={open} onClose={() => setOpen(false)}>
        <button type="button" className={category === '' ? 'uis-pop-item active' : 'uis-pop-item'} onMouseDown={choose('')}>{allLabel}</button>
        {categories.map((c) => (
          <button key={c.id} type="button" className={category === c.id ? 'uis-pop-item active' : 'uis-pop-item'} onMouseDown={choose(c.id)}>{c.icon}{c.title}</button>
        ))}
      </UisPopover>
    </>
  );
}

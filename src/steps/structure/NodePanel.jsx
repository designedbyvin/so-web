import { useState } from "react";
import Icon from "../../components/Icon.jsx";

/** The side panel: edit whatever is selected in the sitemap, or show a summary when nothing is. */
export default function NodePanel({ structure, selected, source, onUpdateSection, onUpdateScreen, onMoveSection, onMoveScreen, onDeleteSection, onDeleteScreen, onAddScreen, onClose }) {
  const [confirming, setConfirming] = useState(null);
  const sections = structure;
  const screenCount = sections.reduce((n, s) => n + s.children.length, 0);
  const dialogCount = sections.reduce((n, s) => n + s.children.filter((c) => c.type === "dialog").length, 0);

  if (!selected) {
    return (
      <aside className="panel" aria-label="Details">
        <div className="panel-head"><h2>Overview</h2></div>
        <dl className="panel-stats">
          <div><dt>Sections</dt><dd>{sections.length}</dd></div>
          <div><dt>Screens</dt><dd>{screenCount - dialogCount}</dd></div>
          <div><dt>Dialogs</dt><dd>{dialogCount}</dd></div>
        </dl>
        {source && <p className="hint">{source}</p>}
        <div className="panel-tip">
          <b>Click any box</b> in the sitemap to rename it, describe what it's for, move it, or delete it.
        </div>
      </aside>
    );
  }

  if (selected.type === "section") {
    const index = sections.findIndex((s) => s.id === selected.id);
    const section = sections[index];
    if (!section) return null;
    return (
      <aside className="panel" aria-label="Edit section">
        <div className="panel-head">
          <span className="panel-kind">Section</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" small /></button>
        </div>
        <div className="field">
          <label className="label" htmlFor={`sec-name-${section.id}`}>Name</label>
          <input key={section.id} id={`sec-name-${section.id}`} className="input" value={section.name} autoFocus={!section.name || section.name === "New section"} onChange={(e) => onUpdateSection(section.id, { name: e.target.value })} />
        </div>
        <div className="field">
          <label className="label" htmlFor={`sec-purpose-${section.id}`}>What it's for</label>
          <textarea id={`sec-purpose-${section.id}`} className="textarea" style={{ minHeight: 80 }} value={section.purpose} onChange={(e) => onUpdateSection(section.id, { purpose: e.target.value })} placeholder="One sentence about this part of the product" />
        </div>
        <div className="field">
          <span className="label">Position</span>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-secondary btn-sm" disabled={index === 0} onClick={() => onMoveSection(section.id, -1)}>Move left</button>
            <button className="btn btn-secondary btn-sm" disabled={index === sections.length - 1} onClick={() => onMoveSection(section.id, 1)}>Move right</button>
          </div>
        </div>
        <div className="panel-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onAddScreen(section.id)}><Icon name="plus" small />Add screen</button>
          {confirming === section.id ? (
            <div className="confirm">
              <span>Delete “{section.name}”{section.children.length ? ` and its ${section.children.length} screens` : ""}?</span>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-danger btn-sm" onClick={() => { onDeleteSection(section.id); setConfirming(null); }}>Delete</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm danger-text" onClick={() => setConfirming(section.id)}>Delete section</button>
          )}
        </div>
      </aside>
    );
  }

  // A screen
  const owner = sections.find((s) => s.children.some((c) => c.id === selected.id));
  if (!owner) return null;
  const index = owner.children.findIndex((c) => c.id === selected.id);
  const screen = owner.children[index];
  return (
    <aside className="panel" aria-label="Edit screen">
      <div className="panel-head">
        <span className="panel-kind">{screen.type === "dialog" ? "Dialog" : "Screen"} · {owner.name}</span>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" small /></button>
      </div>
      <div className="field">
        <label className="label" htmlFor={`scr-name-${screen.id}`}>Name</label>
        <input key={screen.id} id={`scr-name-${screen.id}`} className="input" value={screen.name} autoFocus={screen.name === "New screen"} onChange={(e) => onUpdateScreen(screen.id, { name: e.target.value })} />
      </div>
      <div className="field">
        <label className="label" htmlFor={`scr-purpose-${screen.id}`}>What the user does here</label>
        <textarea id={`scr-purpose-${screen.id}`} className="textarea" style={{ minHeight: 80 }} value={screen.purpose} onChange={(e) => onUpdateScreen(screen.id, { purpose: e.target.value })} placeholder="One sentence, e.g. Patients pick a doctor and an open time." />
      </div>
      <div className="field">
        <span className="label">Type</span>
        <div className="seg" role="group" aria-label="Type">
          <button aria-pressed={screen.type === "screen"} onClick={() => onUpdateScreen(screen.id, { type: "screen" })}>Screen</button>
          <button aria-pressed={screen.type === "dialog"} onClick={() => onUpdateScreen(screen.id, { type: "dialog" })}>Dialog</button>
        </div>
        <span className="hint">{screen.type === "dialog" ? "Opens over another screen." : "A full page."}</span>
      </div>
      <div className="field">
        <label className="label" htmlFor={`scr-section-${screen.id}`}>Section</label>
        <select id={`scr-section-${screen.id}`} className="input select" value={owner.id} onChange={(e) => onMoveScreen(screen.id, { toSection: e.target.value })}>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.name || "Untitled section"}</option>)}
        </select>
      </div>
      <div className="field">
        <span className="label">Order</span>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-secondary btn-sm" disabled={index === 0} onClick={() => onMoveScreen(screen.id, { by: -1 })}>Move up</button>
          <button className="btn btn-secondary btn-sm" disabled={index === owner.children.length - 1} onClick={() => onMoveScreen(screen.id, { by: 1 })}>Move down</button>
        </div>
      </div>
      <div className="panel-actions">
        <button className="btn btn-ghost btn-sm danger-text" onClick={() => onDeleteScreen(screen.id)}>Delete {screen.type === "dialog" ? "dialog" : "screen"}</button>
      </div>
    </aside>
  );
}

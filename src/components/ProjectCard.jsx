import { useState } from "react";
import Icon from "./Icon.jsx";
import Blueprint from "./Blueprint.jsx";
import ProgressRing from "./ProgressRing.jsx";
import { STEP_NAMES, PLATFORM_NAMES, timeAgo } from "../data/projects.js";

/** Full card on the Projects page; `compact` is the smaller one under Home's textarea. */
export default function ProjectCard({ project: p, onOpen, onDelete, compact = false }) {
  const [menu, setMenu] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const exported = p.step > 5;
  const step = Math.min(p.step, 5);
  const stepLabel = exported ? "Exported · ready to build" : `Step ${step} of 5 · ${STEP_NAMES[step - 1]}`;
  const platform = PLATFORM_NAMES[p.details.platform];

  if (compact) {
    return (
      <button className="recent" onClick={onOpen}>
        <span className="blueprint compact"><Blueprint structure={p.structure} compact /></span>
        <span className="recent-body">
          <span className="recent-name">{p.name}</span>
          <span className="recent-status">
            <ProgressRing step={step} size={32} done={exported} />
            <span className="status-text">
              <span className="status-step">{stepLabel}</span>
              <span className="status-meta">Edited {timeAgo(p.updatedAt)}</span>
            </span>
          </span>
        </span>
      </button>
    );
  }

  return (
    <article className="pcard">
      <button className="blueprint" onClick={onOpen} tabIndex={-1} aria-hidden="true">
        {platform && <span className="bp-tag">{platform}</span>}
        {exported && <span className="bp-ready"><Icon name="check" small />Ready to build</span>}
        <Blueprint structure={p.structure} />
      </button>
      <div className="pcard-body">
        <div className="pcard-head">
          <div className="pcard-text">
            <h2><button className="pcard-title" onClick={onOpen}>{p.name}</button></h2>
            <p className="pcard-desc">{p.description}</p>
          </div>
          <div className="menu-wrap">
            <button className="kebab" aria-label={`More options for ${p.name}`} aria-expanded={menu} onClick={() => { setMenu(!menu); setConfirming(false); }}>
              <Icon name="more" small />
            </button>
            {menu && (
              <div className="menu" role="menu">
                {confirming ? (
                  <>
                    <span className="menu-note">Delete “{p.name}”? This can't be undone.</span>
                    <button role="menuitem" className="menu-item danger" onClick={onDelete}>Delete project</button>
                    <button role="menuitem" className="menu-item" onClick={() => { setMenu(false); setConfirming(false); }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button role="menuitem" className="menu-item" onClick={onOpen}>Open</button>
                    <button role="menuitem" className="menu-item danger" onClick={() => setConfirming(true)}>Delete…</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="pcard-status">
          <ProgressRing step={step} done={exported} />
          <span className="status-text">
            <span className="status-step" style={exported ? { color: "var(--success)" } : undefined}>{stepLabel}</span>
            <span className="status-meta">Edited {timeAgo(p.updatedAt)}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

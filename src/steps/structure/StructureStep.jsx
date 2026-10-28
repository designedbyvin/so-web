import { useRef, useState } from "react";
import Icon from "../../components/Icon.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Sitemap from "./Sitemap.jsx";
import NodePanel from "./NodePanel.jsx";
import { newId, PLATFORM_NAMES, timeAgo } from "../../data/projects.js";
import { generateStructure, buildPrompt, parseStructure, errorMessage } from "../../data/ai.js";

const newSection = () => ({ id: newId(), name: "New section", purpose: "", children: [] });
const newScreen = () => ({ id: newId(), name: "New screen", purpose: "", type: "screen" });

/** Step 2: draft the information architecture with Gemini (once), then edit it as a sitemap. */
export default function StructureStep({ project, onChange, onBack, onContinue }) {
  const [running, setRunning] = useState(null); // { count } while Gemini drafts
  const [error, setError] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [selected, setSelected] = useState(null);
  const abortRef = useRef(null);

  const structure = project.structure || [];
  const hasStructure = structure.length > 0;
  const screenCount = structure.reduce((n, s) => n + s.children.length, 0);

  /* ---------- Creating the first structure ---------- */
  const applyStructure = (sections, source) => {
    onChange({ structure: sections, structureSource: source, structureAt: Date.now() });
    setError("");
    setShowPaste(false);
    setSelected(null);
  };

  const generate = async () => {
    setError("");
    setRunning({ count: 0 });
    abortRef.current = new AbortController();
    try {
      const sections = await generateStructure(project, {
        signal: abortRef.current.signal,
        onProgress: (count) => setRunning({ count }),
      });
      applyStructure(sections, "gemini");
    } catch (e) {
      if (e?.code !== "cancelled") setError(errorMessage(e));
    }
    setRunning(null);
  };

  /* ---------- Editing (each edit replaces the structure with an updated copy) ---------- */
  const save = (next) => onChange({ structure: next });
  const updateSection = (id, patch) => save(structure.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const updateScreen = (id, patch) =>
    save(structure.map((s) => ({ ...s, children: s.children.map((c) => (c.id === id ? { ...c, ...patch } : c)) })));
  const moveSection = (id, by) => {
    const i = structure.findIndex((s) => s.id === id);
    const next = [...structure];
    const [item] = next.splice(i, 1);
    next.splice(i + by, 0, item);
    save(next);
  };
  const moveScreen = (id, { by, toSection }) => {
    const from = structure.find((s) => s.children.some((c) => c.id === id));
    const screen = from.children.find((c) => c.id === id);
    if (toSection && toSection !== from.id) {
      save(structure.map((s) =>
        s.id === from.id ? { ...s, children: s.children.filter((c) => c.id !== id) }
        : s.id === toSection ? { ...s, children: [...s.children, screen] }
        : s));
      return;
    }
    const i = from.children.indexOf(screen);
    const kids = [...from.children];
    kids.splice(i, 1);
    kids.splice(i + by, 0, screen);
    save(structure.map((s) => (s.id === from.id ? { ...s, children: kids } : s)));
  };
  const addSection = () => {
    const s = newSection();
    save([...structure, s]);
    setSelected({ type: "section", id: s.id });
  };
  const addScreen = (sectionId) => {
    const c = newScreen();
    save(structure.map((s) => (s.id === sectionId ? { ...s, children: [...s.children, c] } : s)));
    setSelected({ type: "screen", id: c.id });
  };
  const deleteSection = (id) => {
    save(structure.filter((s) => s.id !== id));
    setSelected(null);
  };
  const deleteScreen = (id) => {
    save(structure.map((s) => ({ ...s, children: s.children.filter((c) => c.id !== id) })));
    setSelected(null);
  };

  const sourceLine =
    project.structureSource === "gemini" ? `Drafted by Gemini ${timeAgo(project.structureAt)}. It's yours to edit now.`
    : project.structureSource === "pasted" ? `Pasted from an AI chat ${timeAgo(project.structureAt)}. It's yours to edit now.`
    : project.structureSource === "manual" ? "Built by hand." : "";

  const header = (
    <PageHeader
      badge="02"
      eyebrow="Step 2 of 5 · Information architecture"
      title={hasStructure ? "Shape the structure" : "Map the structure"}
      subtitle={hasStructure
        ? "These are your product's sections and screens. Click any box to edit it."
        : "Turn your brief into sections and screens. Gemini drafts it once; after that you shape it by hand."}
      stats={hasStructure ? [{ label: "Sections", value: structure.length }, { label: "Screens", value: screenCount }] : []}
    />
  );

  /* ---------- Before there's a structure ---------- */
  if (!hasStructure) {
    const d = project.details;
    const sends = [
      `Project name and description`,
      `Primary objective`,
      `${d.users.filter((u) => u.role.trim()).length || "No"} user group${d.users.filter((u) => u.role.trim()).length === 1 ? "" : "s"}`,
      `Platform: ${PLATFORM_NAMES[d.platform] || "not chosen"}`,
      `${d.requirements.filter((r) => r.text.trim()).length} requirement${d.requirements.filter((r) => r.text.trim()).length === 1 ? "" : "s"}`,
      "Constraints",
    ];
    return (
      <main className="form-page">
        <div className="form-wrap">
          {header}
          {error && <div className="notice danger" role="alert">{error}</div>}

          {running ? (
            <section className="card drafting" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <div className="drafting-text">
                <h2 className="card-title">Gemini is drafting your structure</h2>
                <p className="hint">{running.count ? `${running.count} sections and screens so far…` : "Reading your brief… this usually takes 20 to 60 seconds."}</p>
              </div>
              <button className="btn btn-secondary" onClick={() => abortRef.current?.abort()}>Stop</button>
            </section>
          ) : (
            <div className="start-grid">
              <section className="card start-main">
                <div className="card-head">
                  <span className="card-icon" aria-hidden="true"><Icon name="layers" /></span>
                  <div className="card-heading">
                    <h2 className="card-title">Generate with Gemini</h2>
                    <p className="card-sub">Gemini reads your Step 1 brief and drafts sections and screens.</p>
                  </div>
                </div>
                <div className="sends">
                  <span className="label">What gets sent</span>
                  <ul>{sends.map((x) => <li key={x}><Icon name="check" small />{x}</li>)}</ul>
                  <p className="hint">Your brief is sent to Google Gemini through a secure backend. Your API key stays on the server. Gemini drafts it once; after that you edit by hand, so your changes are never overwritten.</p>
                </div>
                <p className="hint">Your Gemini connection is managed securely by the app. No API key entry is needed here.</p>
                <button className="btn btn-primary start-btn" onClick={generate}>
                  Generate structure with Gemini
                </button>
              </section>

              <div className="start-side">
                <section className="card">
                  <div className="card-head">
                    <span className="card-icon" aria-hidden="true"><Icon name="list" /></span>
                    <div className="card-heading">
                      <h2 className="card-title">Use any AI chat</h2>
                      <p className="card-sub">Copy a prompt into Gemini, ChatGPT or another assistant, then paste its answer here.</p>
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ alignSelf: "flex-start" }} onClick={() => setShowPaste(!showPaste)}>{showPaste ? "Hide" : "Copy prompt and paste answer"}</button>
                </section>
                <section className="card">
                  <div className="card-head">
                    <span className="card-icon" aria-hidden="true"><Icon name="plus" /></span>
                    <div className="card-heading">
                      <h2 className="card-title">Build it yourself</h2>
                      <p className="card-sub">Start with one empty section and add the rest by hand.</p>
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ alignSelf: "flex-start" }} onClick={() => { const s = newSection(); applyStructure([s], "manual"); setSelected({ type: "section", id: s.id }); }}>Start blank</button>
                </section>
              </div>
            </div>
          )}

          {showPaste && !running && <PasteBox project={project} onUse={(sections) => applyStructure(sections, "pasted")} />}

          <div className="form-footer">
            <button className="btn btn-secondary" onClick={onBack}>Back</button>
            <span className="spacer" />
            <span className="hint">Create the structure to continue.</span>
            <button className="btn btn-primary" disabled>Continue to Layouts</button>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- Editing the structure ---------- */
  return (
    <main className="form-page">
      <div className="form-wrap wide">
        {header}
        <div className="structure-layout">
          <section className="card sitemap-card" aria-label="Sitemap">
            <div className="card-head">
              <span className="card-icon" aria-hidden="true"><Icon name="layers" /></span>
              <div className="card-heading">
                <h2 className="card-title">Sitemap</h2>
                <p className="card-sub">{sourceLine || "Sections across the top, their screens below."}</p>
              </div>
              <span className="spacer" />
              <button className="btn btn-secondary btn-sm" onClick={addSection}><Icon name="plus" small />Add section</button>
            </div>
            <Sitemap
              projectName={project.name}
              structure={structure}
              selected={selected}
              onSelect={setSelected}
              onAddSection={addSection}
              onAddScreen={addScreen}
            />
          </section>
          <NodePanel
            structure={structure}
            selected={selected}
            source={sourceLine}
            onUpdateSection={updateSection}
            onUpdateScreen={updateScreen}
            onMoveSection={moveSection}
            onMoveScreen={moveScreen}
            onDeleteSection={deleteSection}
            onDeleteScreen={deleteScreen}
            onAddScreen={addScreen}
            onClose={() => setSelected(null)}
          />
        </div>

        <div className="form-footer">
          <button className="btn btn-secondary" onClick={onBack}>Back</button>
          <span className="spacer" />
          {screenCount === 0 && <span className="hint">Add at least one screen to continue.</span>}
          <button className="btn btn-primary" disabled={screenCount === 0} onClick={onContinue}>Continue to Layouts</button>
        </div>
      </div>
    </main>
  );
}

/** Copy the prompt into any AI chat, then paste the JSON answer back. */
function PasteBox({ project, onUse }) {
  const prompt = buildPrompt(project);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(prompt).then(() => setCopied(true), () => document.getElementById("ai-prompt")?.select());
  };
  return (
    <section className="card paste-box" aria-label="Paste an AI answer">
      <div className="paste-grid">
        <div className="field">
          <span className="label">1. Copy this prompt into the AI chat</span>
          <textarea id="ai-prompt" className="textarea mono" readOnly value={prompt} />
          <button className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }} onClick={copy}>{copied ? "Copied" : "Copy prompt"}</button>
        </div>
        <div className="field">
          <label className="label" htmlFor="ai-answer">2. Paste the AI's whole answer here</label>
          <textarea id="ai-answer" className="textarea mono" value={answer} onChange={(e) => { setAnswer(e.target.value); setError(""); }} placeholder='{"sections": [ … ]}' />
          {error && <span className="hint danger-text" role="alert">{error}</span>}
          <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }} disabled={!answer.trim()} onClick={() => { try { onUse(parseStructure(answer)); } catch (e) { setError(e.message); } }}>Use this structure</button>
        </div>
      </div>
    </section>
  );
}

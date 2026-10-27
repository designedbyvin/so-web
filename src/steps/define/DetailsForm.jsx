// Step 1 form: appears after Continue. Starts empty except the suggested project name.
import Icon from "../../components/Icon.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { emptyUser, emptyRequirement } from "../../data/projects.js";

export const PLATFORMS = [
  { id: "web", name: "Web app", hint: "Desktop browser first" },
  { id: "responsive", name: "Responsive web", hint: "Desktop, tablet and phone" },
  { id: "mobile", name: "Mobile app", hint: "iOS and Android" },
  { id: "desktop", name: "Desktop app", hint: "Installed application" },
];

/** Why the user can't continue yet, or "" when they can. */
export function missingReason(project) {
  const d = project.details;
  const missing = [];
  if (!project.name.trim()) missing.push("a project name");
  if (!d.objective.trim()) missing.push("the objective");
  if (!d.requirements.some((r) => r.text.trim())) missing.push("at least one requirement");
  if (!missing.length) return "";
  const list = missing.length > 1 ? `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}` : missing[0];
  return `Add ${list} to continue.`;
}

const Req = () => <span className="req" aria-hidden="true">*</span>;

function Card({ icon, title, subtitle, children }) {
  return (
    <section className="card" aria-label={title}>
      <div className="card-head">
        <span className="card-icon" aria-hidden="true"><Icon name={icon} /></span>
        <div className="card-heading">
          <h2 className="card-title">{title}</h2>
          {subtitle && <p className="card-sub">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function DetailsForm({ project, onChange, onEditDescription, onContinue }) {
  const details = project.details;
  const setDetails = (patch) => onChange({ details: { ...details, ...patch } });
  const setUser = (id, patch) => setDetails({ users: details.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
  const setRequirement = (id, text) => setDetails({ requirements: details.requirements.map((r) => (r.id === id ? { ...r, text } : r)) });
  const addRequirementAfter = (index) => {
    const next = [...details.requirements];
    const fresh = emptyRequirement();
    next.splice(index + 1, 0, fresh);
    setDetails({ requirements: next });
    setTimeout(() => document.getElementById(`req-${fresh.id}`)?.focus(), 0);
  };

  const why = missingReason(project);

  return (
    <main className="form-page">
      <div className="form-wrap">
        <PageHeader
          badge="01"
          eyebrow="Step 1 of 5 · Define the project"
          title="Tell us a bit more"
          subtitle="Sō builds the structure of your product from these answers. You can change them later."
          actions={<span className="ph-note"><Req /> Required</span>}
        />

        <section className="summary" aria-label="Your product">
          <div className="field">
            <label className="summary-label" htmlFor="project-name">Project name<Req /></label>
            <input
              id="project-name"
              className="input name-input"
              aria-required="true"
              value={project.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
            <span className="hint muted">Suggested from your description. Change it if you like.</span>
          </div>
          <div className="summary-desc">
            <div className="summary-text">
              <span className="summary-label">Description</span>
              <p>{project.description}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onEditDescription}>Edit</button>
          </div>
        </section>

        <div className="form-grid">
          <Card icon="target" title="Primary objective" subtitle="The outcome this product exists to deliver.">
            <div className="field">
              <label className="label" htmlFor="objective">What should people be able to achieve with it?<Req /></label>
              <textarea
                id="objective"
                className="textarea"
                aria-required="true"
                value={details.objective}
                onChange={(e) => setDetails({ objective: e.target.value })}
                placeholder="e.g. Let patients book a visit in under a minute and cut front-desk phone calls in half."
              />
              <span className="hint">One or two sentences with an outcome you could check.</span>
            </div>
          </Card>
          <Card icon="device" title="Platform" subtitle="Where people will use it. This shapes screen sizes and layouts.">
            <div className="tiles" role="group" aria-label="Platform">
              {PLATFORMS.map((p) => (
                <button key={p.id} type="button" className="tile" aria-pressed={details.platform === p.id} onClick={() => setDetails({ platform: details.platform === p.id ? null : p.id })}>
                  <span className="tile-name">{p.name}</span>
                  <span className="tile-hint">{p.hint}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="form-grid">
          <Card icon="users" title="Target users" subtitle="Who uses it, and what each group needs to get done.">
            {details.users.map((u, i) => (
              <div key={u.id} className="user-row">
                <div className="field">
                  <label className="label" htmlFor={`role-${u.id}`}>User group{details.users.length > 1 ? ` ${i + 1}` : ""}</label>
                  <input id={`role-${u.id}`} className="input" value={u.role} onChange={(e) => setUser(u.id, { role: e.target.value })} placeholder="e.g. Patient" />
                </div>
                <div className="field needs">
                  <label className="label" htmlFor={`needs-${u.id}`}>What they need to do</label>
                  <input id={`needs-${u.id}`} className="input" value={u.needs} onChange={(e) => setUser(u.id, { needs: e.target.value })} placeholder="e.g. Book, reschedule or cancel a visit" />
                </div>
                <button type="button" className="remove" aria-label={`Remove user group ${i + 1}`} disabled={details.users.length < 2} onClick={() => setDetails({ users: details.users.filter((x) => x.id !== u.id) })}>
                  <Icon name="x" small />
                </button>
              </div>
            ))}
            <button type="button" className="add" onClick={() => setDetails({ users: [...details.users, emptyUser()] })}>
              <Icon name="plus" small /> Add a user group
            </button>
          </Card>
          <Card icon="list" title="Requirements and constraints" subtitle="What it must do, and any limits to work within.">
            <div className="field" style={{ gap: 2 }}>
              <span className="label">What must it do?<Req /></span>
              <span className="hint">One capability per line. These become numbered requirements in the spec.</span>
            </div>
            {details.requirements.map((r, i) => (
              <div key={r.id} className="req-row">
                <span className="req-num">{String(i + 1).padStart(2, "0")}</span>
                <input
                  id={`req-${r.id}`}
                  className="input"
                  aria-label={`Requirement ${i + 1}`}
                  aria-required={i === 0 ? "true" : undefined}
                  value={r.text}
                  onChange={(e) => setRequirement(r.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && r.text.trim()) {
                      e.preventDefault();
                      addRequirementAfter(i);
                    }
                  }}
                  placeholder={i === 0 ? "e.g. Patients book an available time with a chosen doctor" : "Another requirement"}
                />
                <button type="button" className="remove" aria-label={`Remove requirement ${i + 1}`} disabled={details.requirements.length < 2} onClick={() => setDetails({ requirements: details.requirements.filter((x) => x.id !== r.id) })}>
                  <Icon name="x" small />
                </button>
              </div>
            ))}
            <div className="row">
              <button type="button" className="add" onClick={() => addRequirementAfter(details.requirements.length - 1)}>
                <Icon name="plus" small /> Add a requirement
              </button>
              <span className="hint">Tip: press Enter to add the next one.</span>
            </div>
            <div className="divider" />
            <div className="field">
              <label className="label" htmlFor="constraints">Constraints and special considerations <span className="optional">(optional)</span></label>
              <textarea id="constraints" className="textarea" style={{ minHeight: 88 }} value={details.constraints} onChange={(e) => setDetails({ constraints: e.target.value })} placeholder="Deadlines, technical limits, privacy rules, accessibility needs…" />
            </div>
          </Card>
        </div>

        <div className="form-footer">
          <button type="button" className="btn btn-secondary" onClick={onEditDescription}>Back</button>
          <span className="spacer" />
          {why && <span className="hint">{why}</span>}
          <button type="button" className="btn btn-primary" disabled={!!why} onClick={onContinue}>Continue to Structure</button>
        </div>
      </div>
    </main>
  );
}

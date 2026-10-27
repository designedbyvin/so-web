import Icon from "./Icon.jsx";
import { STEP_NAMES } from "../data/projects.js";

/**
 * Breadcrumb on the left; the five-step indicator on the right, only inside a project.
 * crumbs: [{ label, onClick? }] — the last one is the current page.
 */
export default function Header({ crumbs, currentStep }) {
  const ancestors = crumbs.slice(0, -1);
  const current = crumbs[crumbs.length - 1];
  return (
    <header className="header">
      <nav aria-label="Breadcrumb">
        <ol className="crumbs">
          <li><span className="crumb-home"><Icon name="home" small label="Home" /></span></li>
          {ancestors.map((c) => (
            <li key={c.label}>
              <span className="crumb-sep" aria-hidden="true">/</span>
              <button className="crumb-link" onClick={c.onClick}>{c.label}</button>
            </li>
          ))}
          <li>
            <span className="crumb-sep" aria-hidden="true">/</span>
            <span className="crumb-current" aria-current="page">{current.label}</span>
          </li>
        </ol>
      </nav>

      {currentStep && (
        <ol className="steps" aria-label="Steps">
          {STEP_NAMES.map((name, i) => (
            <li key={name} style={{ display: "contents" }}>
              {i > 0 && <span className="step-line" aria-hidden="true" />}
              <span className="step" aria-current={i + 1 === currentStep ? "step" : undefined}>
                <span className="step-num">{i + 1 < currentStep ? <Icon name="check" small /> : i + 1}</span>
                <span className="step-label">{name}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </header>
  );
}

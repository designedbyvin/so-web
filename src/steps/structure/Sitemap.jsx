import Icon from "../../components/Icon.jsx";

/**
 * Top-down sitemap: the project at the top, sections in a row, screens stacked under each section.
 * Every box is a button; clicking one selects it for editing.
 */
export default function Sitemap({ projectName, structure, selected, onSelect, onAddSection, onAddScreen }) {
  const isSel = (type, id) => selected && selected.type === type && selected.id === id;

  return (
    <div className="sitemap-scroll">
      <div className="sitemap">
        <div className="sm-root">{projectName}</div>
        <div className="sm-stem" aria-hidden="true" />
        <ol className="sm-sections" aria-label="Sections">
          {structure.map((section) => (
            <li key={section.id} className="sm-col">
              <button
                className={`sm-section${isSel("section", section.id) ? " selected" : ""}`}
                onClick={() => onSelect({ type: "section", id: section.id })}
                aria-pressed={isSel("section", section.id)}
              >
                <span className="sm-kind">Section</span>
                <span className="sm-name">{section.name || "Untitled section"}</span>
                <span className="sm-count">{section.children.length} {section.children.length === 1 ? "screen" : "screens"}</span>
              </button>
              <ol className="sm-screens" aria-label={`Screens in ${section.name}`}>
                {section.children.map((screen) => (
                  <li key={screen.id}>
                    <button
                      className={`sm-screen${screen.type === "dialog" ? " dialog" : ""}${isSel("screen", screen.id) ? " selected" : ""}`}
                      onClick={() => onSelect({ type: "screen", id: screen.id })}
                      aria-pressed={isSel("screen", screen.id)}
                    >
                      <span className="sm-name">{screen.name || "Untitled screen"}</span>
                      {screen.type === "dialog" && <span className="sm-tag">Dialog</span>}
                    </button>
                  </li>
                ))}
                <li>
                  <button className="sm-add" onClick={() => onAddScreen(section.id)}>
                    <Icon name="plus" small /> Add screen
                  </button>
                </li>
              </ol>
            </li>
          ))}
          <li className="sm-col sm-col-add">
            <button className="sm-add-section" onClick={onAddSection}>
              <Icon name="plus" small /> Add section
            </button>
          </li>
        </ol>
      </div>
    </div>
  );
}

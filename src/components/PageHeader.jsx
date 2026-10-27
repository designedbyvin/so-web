import Icon from "./Icon.jsx";

/**
 * The opening of every module page: a deep maroon band with a white blueprint grid,
 * the icon tile, title and subtitle, optional figures, actions, and a large
 * decorative mark on the right (the Sō "foundation + block", or a big step number).
 *   icon: an Icon name, or `badge` to show text in the tile (e.g. "01" for Step 1)
 *   stats: [{ value, label }]
 */
export default function PageHeader({ icon, badge, eyebrow, title, subtitle, stats = [], actions }) {
  return (
    <header className="page-header">
      {badge ? (
        stats.length === 0 && !actions ? <span className="ph-mark-number" aria-hidden="true">{badge}</span> : null
      ) : (
        <span className="ph-mark" aria-hidden="true">
          <span className="ph-mark-block" />
          <span className="ph-mark-bar" />
        </span>
      )}

      <div className="ph-main">
        <span className="ph-tile" aria-hidden="true">
          {badge ? <span className="ph-badge">{badge}</span> : <Icon name={icon} />}
        </span>
        <div className="ph-text">
          {eyebrow && <span className="ph-eyebrow"><span className="ph-bar" aria-hidden="true" />{eyebrow}</span>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      {(stats.length > 0 || actions) && (
        <div className="ph-side">
          {stats.length > 0 && (
            <dl className="ph-stats">
              {stats.map((s) => (
                <div key={s.label} className="ph-stat">
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {actions && <div className="ph-actions">{actions}</div>}
        </div>
      )}
    </header>
  );
}

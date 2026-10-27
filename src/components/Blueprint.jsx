/**
 * The card thumbnail: a miniature of the project's structure on a light grid.
 * Before Step 2 there's no structure yet, so it shows a dashed outline.
 */
export default function Blueprint({ structure, compact = false }) {
  const s = compact
    ? { root: [44, 10], head: [28, 8], kid: [24, 6], gap: 8, line: 7 }
    : { root: [64, 14], head: [40, 11], kid: [34, 8], gap: 12, line: 10 };

  if (!structure || structure.length === 0) {
    return (
      <span className="bp-empty">
        <span className="bp-tree" aria-hidden="true" style={{ gap: 6 }}>
          <span className="bp-dash strong" style={{ width: s.root[0], height: s.root[1] }} />
          <span style={{ display: "flex", gap: s.gap }}>
            {[0, 1, 2].map((i) => <span key={i} className="bp-dash" style={{ width: s.head[0], height: s.head[1] }} />)}
          </span>
        </span>
        {!compact && <span className="bp-note">Structure comes in Step 2</span>}
      </span>
    );
  }

  return (
    <span className="bp-tree" aria-hidden="true">
      <span className="bp-root" style={{ width: s.root[0], height: s.root[1] }} />
      <span className="bp-v" style={{ height: s.line }} />
      <span className="bp-cols" style={{ gap: s.gap }}>
        {structure.slice(0, 5).map((group, i) => (
          <span key={i} className="bp-col">
            <span className="bp-v" style={{ height: s.line - 2 }} />
            <span className="bp-head" style={{ width: s.head[0], height: s.head[1] }} />
            {(group.children || []).slice(0, 4).map((_, k) => (
              <span key={k} className="bp-kid" style={{ width: s.kid[0], height: s.kid[1] }} />
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

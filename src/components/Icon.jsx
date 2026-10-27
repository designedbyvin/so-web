// Icons from the Sō Design System: 24px grid, 1.75px stroke, square caps, mitered joins.
const PATHS = {
  home: "M3 10 12 3l9 7v11h-6v-6H9v6H3z",
  layers: "M12 2 2 7l10 5 10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  sliders: "M4 7h9 M17 7h3 M4 17h3 M11 17h9 M15 5v4 M9 15v4",
  plus: "M12 5v14 M5 12h14",
  x: "M6 6l12 12 M18 6 6 18",
  check: "m5 12.5 4.5 4.5L19 7.5",
  target: "M7 7h10v10H7z M11 11h2v2h-2z M12 2v5 M12 17v5 M2 12h5 M17 12h5",
  device: "M3 4h18v12H3z M8 20h8 M12 16v4",
  users: "M5 4h6v6H5z M2 20v-6h12v6 M16 6h4v4h-4z M17 14h5v6h-5",
  list: "M11 6h10 M11 12h10 M11 18h10 M3 6l2 2 3-3 M3 12l2 2 3-3 M3 18l2 2 3-3",
};

export default function Icon({ name, small = false, label }) {
  if (name === "more") {
    return (
      <svg className={`icon${small ? " icon-sm" : ""}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="10.5" y="4" width="3" height="3" />
        <rect x="10.5" y="10.5" width="3" height="3" />
        <rect x="10.5" y="17" width="3" height="3" />
      </svg>
    );
  }
  return (
    <svg
      className={`icon${small ? " icon-sm" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

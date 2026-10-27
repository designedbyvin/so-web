/** A ring that fills one fifth per step, with "3/5" in the middle. */
export default function ProgressRing({ step, total = 5, size = 40, done = false }) {
  const stroke = size >= 40 ? 4 : 3;
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  return (
    <span className="ring" style={{ width: size, height: size }} role="img" aria-label={`Step ${step} of ${total}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--chip)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={done ? "var(--success)" : "var(--primary)"} strokeWidth={stroke} strokeDasharray={`${(c * step) / total} ${c}`} />
      </svg>
      <span className="ring-label" style={{ fontSize: size >= 40 ? 11 : 9 }}>{step}/{total}</span>
    </span>
  );
}

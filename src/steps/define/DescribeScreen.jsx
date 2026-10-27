// The big "What are you building?" textarea. Used on Home and when editing a project's description.
export const MAX_LENGTH = 1000;

export default function DescribeScreen({ eyebrow, description, onChange, onContinue, continueLabel = "Continue", children }) {
  const length = description.length;
  const ready = description.trim().length > 0 && length <= MAX_LENGTH;

  return (
    <main className="describe-page">
      <div className="describe-wrap">
        <div className="describe-head">
          <span className="eyebrow">{eyebrow}</span>
          <h1 id="ask">What are you building?</h1>
          <p className="lead">Describe your product in a few sentences: what it does, who it's for, and the main thing they need to get done.</p>
        </div>

        <form
          className="describe-box"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) onContinue();
          }}
        >
          <textarea
            id="product"
            aria-labelledby="ask"
            aria-required="true"
            value={description}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              // Ctrl/⌘ + Enter continues; plain Enter adds a new line.
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && ready) onContinue();
            }}
            placeholder="e.g. A clinic booking app where patients book, reschedule and cancel appointments, and front-desk staff manage each doctor's daily schedule."
            autoFocus
          />
          <div className="describe-bar">
            <span className="hint">Tip: mention who uses it and what they do most.</span>
            <span className={`counter${length > MAX_LENGTH ? " over" : ""}`}>
              {length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
            </span>
            <button type="submit" className="btn btn-primary" disabled={!ready}>{continueLabel}</button>
          </div>
        </form>

        {children}
      </div>
    </main>
  );
}

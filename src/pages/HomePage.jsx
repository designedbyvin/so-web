import DescribeScreen from "../steps/define/DescribeScreen.jsx";
import ProjectCard from "../components/ProjectCard.jsx";

const EXAMPLES = {
  "Clinic booking app":
    "A clinic booking app where patients book, reschedule and cancel appointments online, and front-desk staff manage each doctor's daily schedule. Patients get a reminder the day before their visit.",
  "HR leave system":
    "An HR leave system where employees file leave requests, managers approve or reject them, and HR admins see who is on leave and each employee's remaining balance.",
  "Expense tracker":
    "An expense tracker for small teams where members submit receipts, finance reviews and approves claims, and everyone sees monthly spending by category.",
};

/** Home: start a new project, with recent projects (or examples, the first time) underneath. */
export default function HomePage({ draft, onDraftChange, onCreate, projects, onOpen, onViewAll }) {
  const recent = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);

  return (
    <DescribeScreen eyebrow="Start a new project" description={draft} onChange={onDraftChange} onContinue={onCreate}>
      {recent.length > 0 ? (
        <section className="recents" aria-labelledby="recent-title">
          <div className="recents-head">
            <h2 id="recent-title">Recent projects</h2>
            <button className="link-btn" onClick={onViewAll}>View all</button>
          </div>
          <div className="recents-grid">
            {recent.map((p) => <ProjectCard key={p.id} project={p} compact onOpen={() => onOpen(p.id)} />)}
          </div>
        </section>
      ) : draft.trim() ? (
        <p className="hint after-note">Next, you'll name the project and add the objective, users, platform and requirements.</p>
      ) : (
        <div className="examples">
          <span className="hint">Need a starting point?</span>
          {Object.entries(EXAMPLES).map(([name, text]) => (
            <button key={name} type="button" className="example" onClick={() => onDraftChange(text)}>{name}</button>
          ))}
        </div>
      )}
    </DescribeScreen>
  );
}

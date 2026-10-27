import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProjectCard from "../components/ProjectCard.jsx";

/** All projects, newest first. */
export default function ProjectsPage({ projects, onOpen, onDelete, onNew }) {
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);
  const ready = projects.filter((p) => p.step > 5).length;
  const stats = projects.length
    ? [
        { label: "Projects", value: projects.length },
        { label: "In progress", value: projects.length - ready },
        { label: "Ready to build", value: ready },
      ]
    : [];

  return (
    <main className="projects-page">
      <PageHeader
        icon="layers"
        eyebrow="Workspace"
        title="Projects"
        subtitle="Pick up where you left off, or start something new."
        stats={stats}
        actions={<button className="btn btn-primary" onClick={onNew}><Icon name="plus" small />New project</button>}
      />

      {sorted.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p className="lead">Describe what you're building and Sō will set up your first project.</p>
          <button className="btn btn-primary" onClick={onNew}>Start a project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {sorted.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={() => onOpen(p.id)} onDelete={() => onDelete(p.id)} />
          ))}
        </div>
      )}
    </main>
  );
}

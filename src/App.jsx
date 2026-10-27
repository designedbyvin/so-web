import { useEffect, useState } from "react";
import SideNav from "./components/SideNav.jsx";
import Header from "./components/Header.jsx";
import PageHeader from "./components/PageHeader.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import DescribeScreen from "./steps/define/DescribeScreen.jsx";
import DetailsForm from "./steps/define/DetailsForm.jsx";
import StructureStep from "./steps/structure/StructureStep.jsx";
import { loadProjects, saveProjects, newProject } from "./data/projects.js";

const DRAFT_KEY = "so.home-draft";
const readDraft = () => {
  try {
    return localStorage.getItem(DRAFT_KEY) || "";
  } catch {
    return "";
  }
};

export default function App() {
  const [projects, setProjects] = useState(loadProjects);
  const [draft, setDraft] = useState(readDraft); // the Home textarea, kept until a project is created
  // view: "home" | "projects" | "settings" | "project"; inside a project, screen: "details" | "describe"
  const [route, setRoute] = useState({ view: "home" });

  useEffect(() => saveProjects(projects), [projects]);
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, draft);
    } catch {
      /* storage blocked */
    }
  }, [draft]);

  const go = (next) => {
    setRoute(next);
    window.scrollTo({ top: 0 });
  };
  const project = route.view === "project" ? projects.find((p) => p.id === route.id) : null;
  const updateProject = (patch) =>
    setProjects((list) => list.map((p) => (p.id === project.id ? { ...p, ...patch, updatedAt: Date.now() } : p)));

  const createProject = () => {
    const p = newProject(draft.trim());
    setProjects((list) => [...list, p]);
    setDraft("");
    go({ view: "project", id: p.id, screen: "details" });
    setTimeout(() => document.getElementById("objective")?.focus(), 0);
  };
  const openProject = (id) => go({ view: "project", id, screen: "details" });
  const deleteProject = (id) => setProjects((list) => list.filter((p) => p.id !== id));

  /* ---------- What to show ---------- */
  let crumbs = [{ label: "Home" }];
  let currentStep = null;
  let content = null;

  if (route.view === "projects") {
    crumbs = [{ label: "Projects" }];
    content = <ProjectsPage projects={projects} onOpen={openProject} onDelete={deleteProject} onNew={() => go({ view: "home" })} />;
  } else if (route.view === "settings") {
    crumbs = [{ label: "Settings" }];
    content = (
      <main className="projects-page">
        <PageHeader icon="sliders" eyebrow="Workspace" title="Settings" subtitle="Preferences for Sō on this device. Nothing to set yet." />
      </main>
    );
  } else if (project) {
    const toProjects = { label: "Projects", onClick: () => go({ view: "projects" }) };
    const projectCrumb = { label: project.name || "Untitled project", onClick: () => { updateProject({ step: 1 }); go({ ...route, screen: "details" }); } };
    const toStep = (step) => { updateProject({ step }); window.scrollTo({ top: 0 }); };
    if (project.step >= 3) {
      crumbs = [toProjects, projectCrumb, { label: "Layouts" }];
      currentStep = 3;
      content = (
        <main className="projects-page">
          <PageHeader
            badge="03"
            eyebrow="Step 3 of 5 · Low-fi layouts"
            title="Layouts come next"
            subtitle="Step 3 isn't built yet. Your brief and structure are saved."
            actions={<button className="btn btn-secondary" onClick={() => toStep(2)}>Back to Structure</button>}
          />
        </main>
      );
    } else if (project.step === 2) {
      crumbs = [toProjects, projectCrumb, { label: "Structure" }];
      currentStep = 2;
      content = (
        <StructureStep
          key={project.id}
          project={project}
          onChange={updateProject}
          onBack={() => toStep(1)}
          onContinue={() => toStep(3)}
        />
      );
    } else {
      crumbs = [toProjects, { label: project.name || "Untitled project" }, { label: "Define" }];
      currentStep = 1;
      content =
        route.screen === "describe" ? (
          <DescribeScreen
            eyebrow="Step 1 of 5 · Edit the description"
            description={project.description}
            onChange={(description) => updateProject({ description })}
            onContinue={() => go({ ...route, screen: "details" })}
            continueLabel="Save and continue"
          />
        ) : (
          <DetailsForm
            project={project}
            onChange={updateProject}
            onEditDescription={() => go({ ...route, screen: "describe" })}
            onContinue={() => { updateProject({ step: 2 }); window.scrollTo({ top: 0 }); }}
          />
        );
    }
  } else {
    content = (
      <HomePage
        draft={draft}
        onDraftChange={setDraft}
        onCreate={createProject}
        projects={projects}
        onOpen={openProject}
        onViewAll={() => go({ view: "projects" })}
      />
    );
  }

  const railActive = route.view === "project" ? "projects" : route.view;

  return (
    <div className="shell">
      <SideNav active={railActive} onNavigate={(view) => go({ view })} />
      <div className="main-col">
        <Header crumbs={crumbs} currentStep={currentStep} />
        {content}
      </div>
    </div>
  );
}

// Projects are saved in this browser (localStorage) so they survive a refresh.
const KEY = "so.projects";

export const STEP_NAMES = ["Define", "Structure", "Layouts", "Specs", "Export"];

export const newId = () => Math.random().toString(36).slice(2, 10);
export const emptyUser = () => ({ id: newId(), role: "", needs: "" });
export const emptyRequirement = () => ({ id: newId(), text: "" });

export function loadProjects() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveProjects(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage blocked: projects last for this visit only */
  }
}

/** "A clinic booking app where patients…" → "Clinic booking app" */
export function suggestName(description) {
  let text = description.trim().split(/[.!?\n]/)[0];
  text = text.split(/\s+(?:where|that|which|for|to|so|with|in which|allowing|letting)\s+/i)[0];
  text = text.replace(/^(?:a|an|the|my|our|we(?:'re| are)? building)\s+/i, "").replace(/[,;:].*$/, "").trim();
  const words = text.split(/\s+/).slice(0, 5).join(" ");
  if (!words) return "Untitled project";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function newProject(description) {
  const now = Date.now();
  return {
    id: newId(),
    name: suggestName(description),
    description,
    step: 1,
    createdAt: now,
    updatedAt: now,
    details: {
      objective: "",
      users: [emptyUser()],
      platform: null,
      requirements: [emptyRequirement()],
      constraints: "",
    },
    structure: null, // filled in Step 2: [{ name, children: [...] }]
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function timeAgo(t) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} hr${Math.round(s / 3600) === 1 ? "" : "s"} ago`;
  if (s < 172800) return "yesterday";
  const d = new Date(t);
  return `${String(d.getDate()).padStart(2, "0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}

export const PLATFORM_NAMES = { web: "Web app", responsive: "Responsive web", mobile: "Mobile app", desktop: "Desktop app" };

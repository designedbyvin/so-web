// Drafting the structure (Step 2) with Claude.
// Inside Claude (the published page), Sō uses the viewer's own Claude through window.claude.
// Anywhere else (e.g. `npm run dev`), Claude isn't available, so people paste an answer from any AI chat.
import { newId, PLATFORM_NAMES } from "./projects.js";

let samplePromise = null;
/** Resolves to Claude's sample function, or null when Claude isn't available here. */
export function getClaude() {
  if (!samplePromise) {
    const c = typeof window !== "undefined" ? window.claude : null;
    samplePromise = c && c.use ? c.use("sample").catch(() => null) : Promise.resolve(null);
  }
  return samplePromise;
}

export function buildPrompt(p) {
  const d = p.details;
  const users = d.users.filter((u) => u.role.trim()).map((u) => `- ${u.role.trim()}: ${u.needs.trim() || "(needs not given)"}`).join("\n") || "- (not given)";
  const reqs = d.requirements.filter((r) => r.text.trim()).map((r, i) => `${i + 1}. ${r.text.trim()}`).join("\n") || "(none)";
  return `You are a senior information architect. Draft the information architecture (the sections of the product and the screens inside each) for the product below. A designer will edit your draft afterwards.

PRODUCT
Name: ${p.name}
Description: ${p.description}
Primary objective: ${d.objective || "(not given)"}
Platform: ${PLATFORM_NAMES[d.platform] || "(not given)"}
Target users:
${users}
Requirements:
${reqs}
Constraints: ${d.constraints || "(none)"}

RULES
- Group screens into 3 to 7 sections that would appear in the main navigation.
- Each section has 1 to 6 screens. Use type "dialog" for things that open over a screen (confirmations, quick forms); otherwise "screen".
- Cover every requirement with at least one screen. Don't add features the brief doesn't imply.
- Include sign-in or account screens only if the brief implies accounts or roles.
- Names are short and sentence case, e.g. "Book appointment", "Leave requests".
- purpose is one plain sentence saying what the user does there.

OUTPUT
Reply with only this JSON, no other text:
{"sections":[{"name":"Appointments","purpose":"Everything about booking and managing visits.","screens":[{"name":"Book appointment","purpose":"Patients pick a doctor and an open time.","type":"screen"}]}]}`;
}

/** Turn an AI answer (parsed JSON or raw text) into Sō's structure. Throws a readable Error if it can't. */
export function parseStructure(answer) {
  let data = answer;
  if (typeof answer === "string") {
    const text = answer.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < start) throw new Error("That answer doesn't contain JSON. Paste the AI's whole reply, starting with {.");
    try {
      data = JSON.parse(text.slice(start, end + 1));
    } catch {
      throw new Error("The JSON in that answer is incomplete. Ask the AI to send the full JSON again.");
    }
  }
  const raw = Array.isArray(data?.sections) ? data.sections : [];
  const sections = raw
    .slice(0, 10)
    .map((s) => ({
      id: newId(),
      name: String(s?.name || "").trim().slice(0, 60),
      purpose: String(s?.purpose || "").trim().slice(0, 300),
      children: (Array.isArray(s?.screens) ? s.screens : []).slice(0, 12).map((c) => ({
        id: newId(),
        name: String(c?.name || "").trim().slice(0, 60),
        purpose: String(c?.purpose || "").trim().slice(0, 300),
        type: c?.type === "dialog" ? "dialog" : "screen",
      })).filter((c) => c.name),
    }))
    .filter((s) => s.name);
  if (!sections.length || !sections.some((s) => s.children.length)) {
    throw new Error("The answer didn't include any screens. Add more detail to Step 1 and try again.");
  }
  return sections;
}

/** Ask Claude for the structure. onProgress(n) reports how many names it has written so far. */
export async function generateStructure(project, { signal, onProgress }) {
  const sample = await getClaude();
  if (!sample) throw { code: "unavailable" };
  const data = await sample.json(buildPrompt(project), {
    signal,
    onText: ({ text }) => onProgress?.((text.match(/"name"\s*:/g) || []).length),
  });
  return parseStructure(data);
}

const MESSAGES = {
  unavailable: "Claude isn't available here. Build the structure yourself or paste an answer from any AI chat.",
  not_granted: "Claude wasn't allowed to run for this page. Build the structure yourself or paste an answer from any AI chat.",
  sampling_disabled: "Claude isn't available for this account. Build the structure yourself or paste an answer from any AI chat.",
  rate_limited: "You've reached a usage limit for now. Wait a little and try again.",
  session_expired: "Your Claude session expired. Sign in again, then try again.",
  invalid_json: "Claude's answer couldn't be read as a structure. Try again.",
  refused: "Claude declined to draft this. Reword the Step 1 brief and try again.",
  prompt_too_large: "The brief is too long to send. Shorten the requirements or constraints.",
};
export const errorMessage = (e) => MESSAGES[e?.code] || e?.message || "Something went wrong while drafting. Try again.";
export const isPermanent = (e) => ["unavailable", "not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e?.code);

// Draft the information architecture through a Cloudflare Worker proxy. The Gemini key stays server-side.
import { newId, PLATFORM_NAMES } from "./projects.js";

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

/** Ask the private Worker proxy to generate the structure. */
export async function generateStructure(project, { signal, onProgress }) {
  const proxyUrl = (import.meta.env.VITE_GEMINI_PROXY_URL || "").trim().replace(/\/$/, "");
  if (!proxyUrl || proxyUrl.includes("YOUR-WORKER")) {
    throw new Error("Gemini backend is not configured yet. Set VITE_GEMINI_PROXY_URL to your deployed Cloudflare Worker URL and redeploy.");
  }
  let response;
  try {
    response = await fetch(`${proxyUrl}/generate`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: buildPrompt(project) }),
    });
  } catch (e) {
    if (e?.name === "AbortError") throw { code: "cancelled" };
    throw new Error("Could not connect to the Gemini backend. Check the Worker URL and try again.");
  }
  if (!response.ok) {
    let detail = "";
    try { detail = (await response.json())?.error || ""; } catch {}
    if (response.status === 429) throw { code: "rate_limited" };
    throw new Error(detail || `Gemini request failed (HTTP ${response.status}).`);
  }
  const data = await response.json();
  const answer = String(data?.answer || "").trim();
  if (!answer) throw new Error("Gemini returned an empty answer. Try again.");
  onProgress?.((answer.match(/"name"\s*:/g) || []).length);
  return parseStructure(answer);
}

const MESSAGES = {
  rate_limited: "You've reached a Gemini usage limit. Wait a little and try again, or check your quota in Google AI Studio.",
};
export const errorMessage = (e) => MESSAGES[e?.code] || e?.message || "Something went wrong while drafting. Try again.";
export const isPermanent = () => false;

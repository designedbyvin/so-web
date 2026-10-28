// Draft the information architecture with Google Gemini. API keys are entered by the user
// and kept in sessionStorage; never commit a real key to source code.
import { newId, PLATFORM_NAMES } from "./projects.js";

/** Read the user's Gemini key from this browser tab's session. */
export function getGeminiKey() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage.getItem("so_gemini_api_key") || "" : "";
  } catch {
    return "";
  }
}

export function saveGeminiKey(key) {
  try {
    if (typeof window !== "undefined") {
      if (key.trim()) window.sessionStorage.setItem("so_gemini_api_key", key.trim());
      else window.sessionStorage.removeItem("so_gemini_api_key");
    }
  } catch {
    // If session storage is unavailable, the current UI can still hold the key in memory.
  }
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

/** Ask Gemini for the structure. */
export async function generateStructure(project, { signal, onProgress, apiKey }) {
  const key = (apiKey || getGeminiKey()).trim();
  if (!key) throw { code: "missing_api_key" };
  let response;
  try {
    response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(project) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    });
  } catch (e) {
    if (e?.name === "AbortError") throw { code: "cancelled" };
    throw new Error("Could not connect to Gemini. Check your internet connection and try again.");
  }
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error?.message || "";
    } catch {}
    if (response.status === 401 || response.status === 403) {
      throw new Error("Gemini rejected the API key. Check the key and your Google AI Studio project.");
    }
    if (response.status === 429) throw { code: "rate_limited" };
    throw new Error(detail || `Gemini request failed (HTTP ${response.status}).`);
  }
  const data = await response.json();
  const answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!answer) {
    const reason = data?.candidates?.[0]?.finishReason;
    throw new Error(reason ? `Gemini did not return a usable answer (${reason}). Try again.` : "Gemini returned an empty answer. Try again.");
  }
  onProgress?.((answer.match(/"name"\\s*:/g) || []).length);
  return parseStructure(answer);
}

const MESSAGES = {
  missing_api_key: "Enter your Gemini API key first.",
  rate_limited: "You've reached a Gemini usage limit. Wait a little and try again, or check your quota in Google AI Studio.",
};
export const errorMessage = (e) => MESSAGES[e?.code] || e?.message || "Something went wrong while drafting. Try again.";
export const isPermanent = (e) => ["missing_api_key"].includes(e?.code);

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

function corsHeaders(origin, allowedOrigin) {
  const allow = allowedOrigin || "*";
  return {
    "Access-Control-Allow-Origin": allow === "*" ? "*" : (origin === allow ? allow : "null"),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...cors } });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (url.pathname !== "/generate" || request.method !== "POST") {
      return json({ error: "Not found" }, 404, cors);
    }
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) {
      return json({ error: "Origin not allowed" }, 403, cors);
    }
    if (!env.GEMINI_API_KEY) return json({ error: "The Gemini API key is not configured on the backend." }, 500, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON request." }, 400, cors); }
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    if (!prompt || prompt.length > 30000) return json({ error: "Prompt is missing or too long." }, 400, cors);

    try {
      const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
        }),
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        const status = upstream.status === 429 ? 429 : 502;
        return json({ error: data?.error?.message || `Gemini request failed (${upstream.status}).` }, status, cors);
      }
      const answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
      if (!answer) return json({ error: "Gemini returned an empty answer. Try again." }, 502, cors);
      return json({ answer }, 200, cors);
    } catch {
      return json({ error: "Could not connect to Gemini. Try again." }, 502, cors);
    }
  },
};

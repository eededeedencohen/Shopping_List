import { DOMAIN } from "../constants";

/* The research log of the bottom-nav voice assistant (server: AiSession).
   Lifecycle calls are fire-and-forget and never throw — logging must not get
   in the way of the voice flow. Reading/review calls throw on failure so the
   review page can show an error. */

const BASE = `${DOMAIN}/api/v1/general-ai/sessions`;

const json = (method, body, extra = {}) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body ? JSON.stringify(body) : undefined,
  ...extra,
});

async function quiet(promise) {
  try {
    const res = await promise;
    if (!res || !res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function strict(promise) {
  const res = await promise;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

/* ── lifecycle (voice engine) ── */

/** Open a session → sessionId (null on failure). */
export async function startAiSession({ mode, version, ttsLanguage, ttsVoice }) {
  const data = await quiet(
    fetch(
      BASE,
      json("POST", {
        mode,
        client: {
          version: version || "",
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "",
        },
        ttsLanguage,
        ttsVoice,
      })
    )
  );
  return data && data.sessionId ? data.sessionId : null;
}

/** Close a session. `keepalive` lets it survive a page unload. */
export function endAiSession(sessionId, reason = "user") {
  if (!sessionId) return Promise.resolve(null);
  return quiet(
    fetch(
      `${BASE}/${sessionId}/end`,
      json("PATCH", { reason }, { keepalive: true })
    )
  );
}

/** What the client did with a turn's command (+ where the user was). */
export function reportAiTurn(sessionId, turnId, payload) {
  if (!sessionId || !turnId) return Promise.resolve(null);
  return quiet(fetch(`${BASE}/${sessionId}/turns/${turnId}`, json("PATCH", payload)));
}

/* ── reading / review (the research page) ── */

export function listAiSessions({ limit = 30, skip = 0, filter = "all", q = "" } = {}) {
  const params = new URLSearchParams({ limit, skip, filter });
  if (q) params.set("q", q);
  return strict(fetch(`${BASE}?${params.toString()}`));
}

export function getAiSessionStats() {
  return strict(fetch(`${BASE}/stats`));
}

export function getAiSession(sessionId) {
  return strict(fetch(`${BASE}/${sessionId}`));
}

export function reviewAiSession(sessionId, review) {
  return strict(fetch(`${BASE}/${sessionId}/review`, json("PATCH", review)));
}

export function reviewAiTurn(sessionId, turnId, review) {
  return strict(
    fetch(`${BASE}/${sessionId}/turns/${turnId}/review`, json("PATCH", review))
  );
}

const SESSION_KEY = "raio_x_soft_skills_session_v1";
const ANALYTICS_KEY = "raio_x_soft_skills_events_v1";

export function createSessionId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadSession() {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // O fluxo continua mesmo quando o navegador bloqueia o armazenamento local.
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function storeLocalEvent(event) {
  try {
    const current = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "[]");
    localStorage.setItem(
      ANALYTICS_KEY,
      JSON.stringify([...current.slice(-99), event])
    );
  } catch {
    // Analytics nunca deve interromper a avaliação.
  }
}

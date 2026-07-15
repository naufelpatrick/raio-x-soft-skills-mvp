const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const STORAGE_KEY = "raio_x_admin_auth_v1";

export function isAdminAuthConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getStoredAdminSession() {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function storeAdminSession(session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function signInAdmin(email, password) {
  if (!isAdminAuthConfigured()) {
    throw new Error("Supabase Auth não está configurado no frontend.");
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description || result.msg || "E-mail ou senha inválidos.");
  }

  const session = {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    expiresAt: result.expires_at,
    user: result.user,
  };

  storeAdminSession(session);
  return session;
}

export async function signOutAdmin() {
  const session = getStoredAdminSession();
  clearAdminSession();

  if (!session?.accessToken || !isAdminAuthConfigured()) return;

  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).catch(() => {});
}

export async function fetchAdminDashboard(rangeKey) {
  const session = getStoredAdminSession();
  if (!session?.accessToken) {
    throw new Error("Sessão administrativa não encontrada.");
  }

  const params = new URLSearchParams({ range: rangeKey || "last_7_days" });
  const response = await fetch(`/api/admin-dashboard?${params.toString()}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const result = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 403) {
    clearAdminSession();
  }

  if (!response.ok) {
    throw new Error(result.error || "Não foi possível carregar o dashboard.");
  }

  return result;
}

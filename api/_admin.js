const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isAdminBackendConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function getAccessToken(req) {
  const authorization = req.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

async function supabaseFetch(path, { method = "GET", token = SUPABASE_SERVICE_ROLE_KEY, body, query = "" } = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}${query}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase admin request failed ${response.status}: ${details}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function getAuthenticatedAdmin(req) {
  if (!isAdminBackendConfigured()) {
    return { error: "ADMIN_BACKEND_NOT_CONFIGURED", status: 503 };
  }

  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return { error: "MISSING_TOKEN", status: 401 };
  }

  try {
    const user = await supabaseFetch("/auth/v1/user", { token: accessToken });
    const email = user?.email || "";
    const userId = user?.id || "";

    if (!userId) {
      return { error: "INVALID_USER", status: 401 };
    }

    const query = `?user_id=eq.${encodeURIComponent(userId)}&active=eq.true&select=id,user_id,email,role,active`;
    const admins = await supabaseFetch("/rest/v1/admin_users", { query });
    const admin = admins?.[0];

    if (!admin || !["owner", "admin", "viewer"].includes(admin.role)) {
      return { error: "NOT_ADMIN", status: 403, user: { id: userId, email } };
    }

    return { user: { id: userId, email }, admin };
  } catch (error) {
    console.error("Admin auth error", error);
    return { error: "ADMIN_AUTH_FAILED", status: 401 };
  }
}

export async function adminSelect(table, { select = "*", filters = [], order, limit } = {}) {
  const params = new URLSearchParams();
  params.set("select", select);
  filters.forEach(([column, operator, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(column, `${operator}.${value}`);
    }
  });
  if (order) params.set("order", order);
  if (limit) params.set("limit", String(limit));

  return supabaseFetch(`/rest/v1/${table}`, { query: `?${params.toString()}` });
}

export async function insertAdminAuditLog(record) {
  try {
    await supabaseFetch("/rest/v1/admin_audit_logs", {
      method: "POST",
      body: record,
    });
  } catch (error) {
    console.error("Admin audit log error", error);
  }
}

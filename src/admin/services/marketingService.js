import { clearAdminSession, getStoredAdminSession } from "./adminAuthService";

async function request(path = "", options = {}) {
  const token = getStoredAdminSession()?.accessToken;
  if (!token) throw new Error("Sessão administrativa não encontrada.");
  const separator = path ? `${path}&` : "?";
  const response = await fetch(`/api/admin-dashboard${separator}scope=marketing`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...options.headers },
  });
  const result = await response.json().catch(() => ({}));
  if (response.status === 401 || response.status === 403 && result.error !== "Seu perfil possui acesso somente para leitura.") clearAdminSession();
  if (!response.ok) throw new Error(result.error || "Não foi possível concluir a operação.");
  return result;
}

export const fetchMarketing = () => request();
export const saveMarketing = (resource, data, id) => request(`?resource=${resource}${id ? `&id=${id}` : ""}`, { method: id ? "PATCH" : "POST", body: JSON.stringify(data) });
export const deleteMarketing = (resource, id) => request(`?resource=${resource}&id=${id}`, { method: "DELETE" });

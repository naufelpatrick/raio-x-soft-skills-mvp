import { applySecurityHeaders, requireAllowedOrigin } from "./_security.js";
import { adminDelete, adminInsert, adminSelect, adminUpdate, getAuthenticatedAdmin, insertAdminAuditLog } from "./_admin.js";

const resources = { content: "marketing_content", ideas: "marketing_ideas", campaigns: "marketing_campaigns", metrics: "marketing_metrics" };
const writable = new Set(["owner", "admin"]);
const fields = {
  content: ["title","headline","summary","objective","series","format","platform","theme","caption","cta","script","art_text","visual_direction","hashtags","destination_url","planned_date","published_date","owner_name","priority","status","notes","ice_impact","ice_confidence","ice_ease"],
  ideas: ["type","title","insight","theme","series","suggested_format","objective","priority","status","ice_impact","ice_confidence","ice_ease"],
  campaigns: ["name","objective","description","start_date","end_date","status","channels","audience","offer","destination_url","budget","attributed_revenue","notes","learnings"],
  metrics: ["content_id","reach","impressions","likes","comments","saves","shares","clicks","followers","diagnostics_started","diagnostics_completed","sales","revenue"],
};

function clean(resource, input = {}) {
  return Object.fromEntries(fields[resource].filter((key) => Object.hasOwn(input, key)).map((key) => [key, input[key] === "" ? null : input[key]]));
}

async function overview() {
  const [content, ideas, campaigns, metrics, links] = await Promise.all([
    adminSelect("marketing_content", { order: "created_at.desc", limit: 1000 }),
    adminSelect("marketing_ideas", { order: "ice_score.desc", limit: 1000 }),
    adminSelect("marketing_campaigns", { order: "created_at.desc", limit: 1000 }),
    adminSelect("marketing_metrics", { order: "updated_at.desc", limit: 1000 }),
    adminSelect("marketing_content_campaigns", { limit: 2000 }),
  ]);
  return { content, ideas, campaigns, metrics, links };
}

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (!requireAllowedOrigin(req, res)) return;
  const auth = await getAuthenticatedAdmin(req);
  if (auth.error) return res.status(auth.status || 401).json({ error: auth.error });
  const method = req.method || "GET";
  const resource = req.query?.resource || "all";
  try {
    if (method === "GET") return res.status(200).json({ ...(await overview()), admin: { email: auth.user.email, role: auth.admin.role } });
    if (!writable.has(auth.admin.role)) return res.status(403).json({ error: "Seu perfil possui acesso somente para leitura." });
    if (resource === "links") {
      const { content_id, campaign_id } = req.body || {};
      if (method === "POST") await adminInsert("marketing_content_campaigns", { content_id, campaign_id });
      else if (method === "DELETE") await adminDelete("marketing_content_campaigns", null, [["content_id","eq",content_id],["campaign_id","eq",campaign_id]]);
      else return res.status(405).json({ error: "Operação não suportada." });
      return res.status(200).json({ ok: true });
    }
    const table = resources[resource];
    if (!table) return res.status(400).json({ error: "Recurso inválido." });
    const payload = clean(resource, req.body);
    let result;
    if (method === "POST") {
      if (resource === "metrics" && payload.content_id) {
        const existing = await adminSelect(table, { filters: [["content_id","eq",payload.content_id]], limit: 1 });
        result = existing[0] ? await adminUpdate(table, existing[0].id, { ...payload, updated_by: auth.user.id, updated_at: new Date().toISOString() }) : await adminInsert(table, { ...payload, created_by: auth.user.id, updated_by: auth.user.id });
      } else result = await adminInsert(table, { ...payload, created_by: auth.user.id, updated_by: auth.user.id });
    } else if (method === "PATCH" && req.query?.id) result = await adminUpdate(table, req.query.id, { ...payload, updated_by: auth.user.id, updated_at: new Date().toISOString() });
    else if (method === "DELETE" && req.query?.id) result = await adminDelete(table, req.query.id);
    else return res.status(405).json({ error: "Operação não suportada." });
    await insertAdminAuditLog({ admin_user_id: auth.admin.id, action: `marketing_${method.toLowerCase()}`, resource: table, resource_id: req.query?.id, metadata: { resource } });
    return res.status(200).json({ data: Array.isArray(result) ? result[0] : result, ok: true });
  } catch (error) {
    console.error("Admin marketing error", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação de marketing." });
  }
}

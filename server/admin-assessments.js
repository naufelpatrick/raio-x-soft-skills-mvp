import { adminSelect, insertAdminAuditLog } from "./_admin.js";

const pageSize = 20;
const scoreFields = "id,completed_at,instrument_version,general_score,competency_scores";
const leadFields = "lead_id,session_id,name,email,purchase_completed,purchased_at";

function selectMatches(table, select, column, values) {
  const unique = [...new Set(values.filter(Boolean))];
  if (!unique.length) return [];
  const list = unique.map((value) => JSON.stringify(value)).join(",");
  return adminSelect(table, { select, filters: [[column, "in", `(${list})`]] });
}

function toResult(assessment, lead) {
  return {
    id: assessment?.id || lead.lead_id,
    name: lead?.name,
    email: lead?.email,
    purchased: lead?.purchase_completed === true,
    purchasedAt: lead?.purchased_at,
    completedAt: assessment?.completed_at,
    instrumentVersion: assessment?.instrument_version,
    generalScore: assessment?.general_score,
    competencies: Array.isArray(assessment?.competency_scores)
      ? assessment.competency_scores.map(({ id, name, score, level }) => ({ id, name, score, level }))
      : [],
  };
}

export async function getAdminAssessments(query, adminId) {
  const paid = query.filter === "paid";
  const email = typeof query.email === "string" ? query.email.trim().toLowerCase().slice(0, 254) : "";
  const page = Math.max(0, Math.min(100000, Number.parseInt(query.page, 10) || 0));
  const pagination = { limit: pageSize + 1, offset: page * pageSize };
  let results;

  if (paid || email) {
    const filters = paid ? [["purchase_completed", "eq", true]] : [["diagnostic_completed", "eq", true]];
    if (email) filters.push(["email", "eq", email]);
    const leads = await adminSelect("admin_conversion_leads", {
      select: `${leadFields},assessment_id`,
      filters,
      order: paid ? "purchased_at.desc.nullslast,lead_id.desc" : "assessment_completed_at.desc,lead_id.desc",
      ...pagination,
    });
    const assessments = await selectMatches("assessments", scoreFields, "id", leads.map((lead) => lead.assessment_id));
    const byId = new Map(assessments.map((assessment) => [assessment.id, assessment]));
    results = leads.map((lead) => toResult(byId.get(lead.assessment_id), lead));
  } else {
    const assessments = await adminSelect("assessments", {
      select: `${scoreFields},lead_id,session_id`,
      order: "completed_at.desc,id.desc",
      ...pagination,
    });
    const [linked, legacy] = await Promise.all([
      selectMatches("admin_conversion_leads", leadFields, "lead_id", assessments.map((item) => item.lead_id)),
      selectMatches("admin_conversion_leads", leadFields, "session_id", assessments.filter((item) => !item.lead_id).map((item) => item.session_id)),
    ]);
    const byId = new Map(linked.map((lead) => [lead.lead_id, lead]));
    const bySession = new Map(legacy.map((lead) => [lead.session_id, lead]));
    results = assessments.map((item) => toResult(item, item.lead_id ? byId.get(item.lead_id) : bySession.get(item.session_id)));
  }

  await insertAdminAuditLog({
    admin_user_id: adminId,
    action: "assessments_viewed",
    resource: "assessments",
    metadata: { paid, page, email_search: Boolean(email) },
  });
  return { results: results.slice(0, pageSize), hasNext: results.length > pageSize };
}

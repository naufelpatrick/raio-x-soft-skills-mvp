import { applySecurityHeaders, requireAllowedOrigin } from "../server/_security.js";
import { adminSelect, getAuthenticatedAdmin, insertAdminAuditLog } from "../server/_admin.js";

const PRODUCT_PRICE = 49.9;

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getDateRange(key = "last_7_days", query = {}) {
  const now = new Date();
  const today = startOfDay(now);
  let start = addDays(today, -6);
  let end = addDays(today, 1);

  if (key === "today") {
    start = today;
    end = addDays(today, 1);
  } else if (key === "yesterday") {
    start = addDays(today, -1);
    end = today;
  } else if (key === "last_30_days") {
    start = addDays(today, -29);
    end = addDays(today, 1);
  } else if (key === "this_month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = addDays(today, 1);
  } else if (key === "previous_month") {
    start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    end = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (key === "custom" && query.start && query.end) {
    start = startOfDay(new Date(query.start));
    end = addDays(startOfDay(new Date(query.end)), 1);
  }

  const durationMs = Math.max(24 * 60 * 60 * 1000, end.getTime() - start.getTime());
  const previousEnd = start;
  const previousStart = new Date(start.getTime() - durationMs);

  return { start, end, previousStart, previousEnd };
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

function variation(current, previous) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function uniqueCount(items, key = "session_id") {
  return new Set(items.map((item) => item[key]).filter(Boolean)).size;
}

function groupEventsByName(events) {
  return events.reduce((acc, event) => {
    acc[event.event_name] = acc[event.event_name] || new Set();
    acc[event.event_name].add(event.session_id);
    return acc;
  }, {});
}

function eventCount(groups, eventName) {
  return groups[eventName]?.size || 0;
}

function publicProductEvents(events) {
  return events.filter((event) => {
    const path = String(event.page_path || "");
    return !path.startsWith("/admin") && !path.startsWith("/preview");
  });
}

function buildFunnel(events, leads) {
  const groups = groupEventsByName(events);
  const visitors = uniqueCount(events);
  const purchasedSessions = new Set(
    leads
      .filter((lead) => lead.purchased_package || lead.purchase_status === "purchased")
      .map((lead) => lead.session_id)
      .filter(Boolean)
  );

  const steps = [
    ["Visitantes", visitors],
    ["Diagnóstico iniciado", eventCount(groups, "assessment_started")],
    ["Diagnóstico concluído", eventCount(groups, "assessment_completed")],
    ["Relatório visualizado", eventCount(groups, "free_report_viewed")],
    ["Clique no Premium", eventCount(groups, "premium_cta_clicked")],
    ["Pagamento iniciado", eventCount(groups, "checkout_started")],
    ["Pagamento aprovado", purchasedSessions.size || eventCount(groups, "payment_approved")],
  ];

  let biggestDropIndex = -1;
  let biggestDrop = -1;

  const rows = steps.map(([label, count], index) => {
    const previous = index === 0 ? count : steps[index - 1][1];
    const drop = index === 0 ? 0 : Math.max(0, previous - count);
    if (index > 0 && drop > biggestDrop) {
      biggestDrop = drop;
      biggestDropIndex = index;
    }
    return {
      label,
      count,
      stepConversion: index === 0 ? 100 : pct(count, previous),
      totalConversion: index === 0 ? 100 : pct(count, steps[0][1]),
      drop,
      biggestDrop: false,
    };
  });

  if (rows[biggestDropIndex]) rows[biggestDropIndex].biggestDrop = true;
  return rows;
}

function buildMetrics({ events, leads, previousEvents, previousLeads }) {
  const groups = groupEventsByName(events);
  const previousGroups = groupEventsByName(previousEvents);
  const visitors = uniqueCount(events);
  const leadsCount = leads.length;
  const purchases = leads.filter((lead) => lead.purchased_package || lead.purchase_status === "purchased").length;
  const revenue = purchases * PRODUCT_PRICE;
  const previousVisitors = uniqueCount(previousEvents);
  const previousLeadsCount = previousLeads.length;
  const previousPurchases = previousLeads.filter((lead) => lead.purchased_package || lead.purchase_status === "purchased").length;
  const previousRevenue = previousPurchases * PRODUCT_PRICE;

  const assessmentStarted = eventCount(groups, "assessment_started");
  const assessmentCompleted = eventCount(groups, "assessment_completed");
  const previousAssessmentStarted = eventCount(previousGroups, "assessment_started");
  const previousAssessmentCompleted = eventCount(previousGroups, "assessment_completed");

  return [
    { key: "visitors", label: "Visitantes", value: visitors, change: variation(visitors, previousVisitors), help: "Sessões únicas registradas nas visualizações e eventos do produto." },
    { key: "leads", label: "Leads", value: leadsCount, change: variation(leadsCount, previousLeadsCount), help: "Registros criados na tabela de leads." },
    { key: "assessmentStarted", label: "Diagnósticos iniciados", value: assessmentStarted, change: variation(assessmentStarted, previousAssessmentStarted), help: "Sessões que entraram na avaliação." },
    { key: "assessmentCompleted", label: "Diagnósticos concluídos", value: assessmentCompleted, change: variation(assessmentCompleted, previousAssessmentCompleted), help: "Sessões que finalizaram a avaliação." },
    { key: "purchases", label: "Compras aprovadas", value: purchases, change: variation(purchases, previousPurchases), help: "Leads marcados como compra aprovada." },
    { key: "revenue", label: "Receita", value: revenue, change: variation(revenue, previousRevenue), currency: true, help: "Receita estimada com base no preço atual do produto." },
    { key: "conversion", label: "Taxa de conversão", value: pct(purchases, visitors), suffix: "%", change: variation(pct(purchases, visitors), pct(previousPurchases, previousVisitors)), help: "Compras aprovadas / visitantes únicos." },
    { key: "ticket", label: "Ticket médio", value: purchases ? revenue / purchases : 0, currency: true, change: variation(purchases ? revenue / purchases : 0, previousPurchases ? previousRevenue / previousPurchases : 0), help: "Receita / compras aprovadas." },
  ];
}

function buildDailyRevenue(leads) {
  const grouped = leads.reduce((acc, lead) => {
    if (!(lead.purchased_package || lead.purchase_status === "purchased")) return acc;
    const rawDate = lead.payment_confirmed_at || lead.package_purchased_at || lead.last_seen_at || lead.created_at;
    const day = String(rawDate || "").slice(0, 10);
    if (!day) return acc;
    acc[day] = (acc[day] || 0) + PRODUCT_PRICE;
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
}

function buildAlerts({ metrics, funnel, leads }) {
  const alerts = [];
  const purchases = metrics.find((metric) => metric.key === "purchases")?.value || 0;
  const visitors = metrics.find((metric) => metric.key === "visitors")?.value || 0;
  const biggestDrop = funnel.find((step) => step.biggestDrop);
  const pendingPayments = leads.filter((lead) => lead.purchase_status === "requested" || lead.payment_status === "PENDING").length;

  if (visitors > 0 && purchases === 0) {
    alerts.push({ title: "Nenhuma venda no período", description: "Critério: houve visitantes registrados, mas nenhuma compra aprovada." });
  }
  if (biggestDrop && biggestDrop.drop > 0) {
    alerts.push({ title: `Maior queda em ${biggestDrop.label}`, description: `Critério: perda de ${biggestDrop.drop} sessão(ões) em relação à etapa anterior.` });
  }
  if (pendingPayments > 0) {
    alerts.push({ title: "Pagamentos pendentes", description: `Critério: ${pendingPayments} lead(s) com pagamento solicitado ou pendente.` });
  }

  return alerts;
}

function leadStatus(lead) {
  if (lead.purchased_package || lead.purchase_status === "purchased") return "Comprou";
  if (lead.purchase_status === "requested") return "Pagamento iniciado";
  return "Lead";
}

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (!requireAllowedOrigin(req, res)) return;

  const auth = await getAuthenticatedAdmin(req);
  if (auth.error) {
    return res.status(auth.status || 401).json({ error: auth.error });
  }
  if (req.query?.scope === "session") {
    return res.status(200).json({ admin: { email: auth.user.email, role: auth.admin.role } });
  }

  const query = req.query || {};
  const { start, end, previousStart, previousEnd } = getDateRange(query.range, query);
  const periodFilters = [["created_at", "gte", start.toISOString()], ["created_at", "lt", end.toISOString()]];
  const previousFilters = [["created_at", "gte", previousStart.toISOString()], ["created_at", "lt", previousEnd.toISOString()]];

  try {
    const [events, previousEvents, leads, previousLeads, nps] = await Promise.all([
      adminSelect("product_events", { select: "session_id,event_name,page_path,metadata,created_at", filters: periodFilters, limit: 10000 }),
      adminSelect("product_events", { select: "session_id,event_name,page_path,metadata,created_at", filters: previousFilters, limit: 10000 }),
      adminSelect("leads", { select: "session_id,name,email,main_area,professional_level,purchase_status,purchased_package,payment_status,payment_confirmed_at,package_purchased_at,last_seen_at,created_at", filters: periodFilters, order: "created_at.desc", limit: 1000 }),
      adminSelect("leads", { select: "session_id,purchase_status,purchased_package,created_at", filters: previousFilters, limit: 1000 }),
      adminSelect("nps_responses", { select: "score,category,created_at", filters: periodFilters, limit: 1000 }),
    ]);

    const publicEvents = publicProductEvents(events);
    const previousPublicEvents = publicProductEvents(previousEvents);
    const metrics = buildMetrics({ events: publicEvents, leads, previousEvents: previousPublicEvents, previousLeads });
    const funnel = buildFunnel(publicEvents, leads);
    const recentLeads = leads.slice(0, 8).map((lead) => ({
      name: lead.name,
      email: lead.email,
      createdAt: lead.created_at,
      source: "site",
      status: leadStatus(lead),
      assessmentCompleted: publicEvents.some((event) => event.session_id === lead.session_id && event.event_name === "assessment_completed"),
      purchased: Boolean(lead.purchased_package || lead.purchase_status === "purchased"),
    }));
    const recentSales = leads
      .filter((lead) => lead.purchased_package || lead.purchase_status === "purchased" || lead.purchase_status === "requested")
      .slice(0, 8)
      .map((lead) => ({
        date: lead.payment_confirmed_at || lead.package_purchased_at || lead.created_at,
        customer: lead.name,
        product: "Relatório completo",
        value: lead.purchased_package || lead.purchase_status === "purchased" ? PRODUCT_PRICE : 0,
        status: leadStatus(lead),
        provider: "Asaas",
      }));

    await insertAdminAuditLog({
      admin_user_id: auth.admin.id,
      action: "dashboard_viewed",
      resource: "admin_dashboard",
      metadata: { range: query.range || "last_7_days" },
    });

    return res.status(200).json({
      admin: { email: auth.user.email, role: auth.admin.role },
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        previousStart: previousStart.toISOString(),
        previousEnd: previousEnd.toISOString(),
      },
      metrics,
      funnel,
      revenueByDay: buildDailyRevenue(leads),
      recentLeads,
      recentSales,
      nps: {
        responses: nps.length,
        average: nps.length ? Number((nps.reduce((sum, item) => sum + item.score, 0) / nps.length).toFixed(1)) : null,
        promoters: nps.filter((item) => item.category === "promoter").length,
        neutrals: nps.filter((item) => item.category === "neutral").length,
        detractors: nps.filter((item) => item.category === "detractor").length,
      },
      competencies: {
        available: false,
        sampleSize: 0,
        message: "As pontuações por competência ainda não são persistidas em tabela de diagnósticos. Este bloco será ativado quando o armazenamento agregado for implementado.",
      },
      integrations: {
        ga4: { connected: false, message: "Google Analytics Data API ainda não conectada." },
        clarity: { connected: Boolean(process.env.VITE_CLARITY_PROJECT_URL), url: process.env.VITE_CLARITY_PROJECT_URL || "" },
      },
      alerts: buildAlerts({ metrics, funnel, leads }),
    });
  } catch (error) {
    console.error("Admin dashboard error", error);
    return res.status(500).json({ error: "Não foi possível carregar o dashboard." });
  }
}

import { adminInsert, adminSelect } from "./_admin.js";

const CLARITY_ENDPOINT = "https://www.clarity.ms/export-data/api/v1/project-live-insights";
const CACHE_ACTION = "clarity_snapshot_refreshed";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function normalizedKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findMetric(payload, name) {
  const expected = normalizedKey(name);
  return payload.find((item) => normalizedKey(item?.metricName) === expected)?.information || [];
}

function numericValue(record, aliases) {
  if (!record) return 0;
  const entries = Object.entries(record);
  for (const alias of aliases) {
    const match = entries.find(([key]) => normalizedKey(key) === normalizedKey(alias));
    if (match) return Number(match[1]) || 0;
  }
  return 0;
}

function sumMetric(rows, aliases) {
  return rows.reduce((total, row) => total + numericValue(row, aliases), 0);
}

function firstMetric(rows, aliases) {
  return numericValue(rows[0], aliases);
}

function normalizeClarityPayload(payload) {
  const traffic = findMetric(payload, "Traffic");
  const engagement = findMetric(payload, "Engagement Time");
  const scroll = findMetric(payload, "Scroll Depth");
  const friction = (name) => findMetric(payload, name);

  return {
    connected: true,
    periodDays: 3,
    fetchedAt: new Date().toISOString(),
    summary: {
      sessions: sumMetric(traffic, ["totalSessionCount"]),
      botSessions: sumMetric(traffic, ["totalBotSessionCount"]),
      distinctUsers: sumMetric(traffic, ["distinctUserCount", "distantUserCount"]),
      pagesPerSession: firstMetric(traffic, ["pagesPerSessionPercentage", "pagesPerSession"]),
      activeTime: firstMetric(engagement, ["activeTime", "activeTimeSeconds", "averageActiveTime"]),
      engagementTime: firstMetric(engagement, ["totalTime", "engagementTime", "averageEngagementTime"]),
      scrollDepth: firstMetric(scroll, ["averageScrollDepth", "scrollDepth", "scrollDepthPercentage"]),
      deadClicks: sumMetric(friction("Dead Click Count"), ["subTotal", "deadClickCount", "count"]),
      rageClicks: sumMetric(friction("Rage Click Count"), ["subTotal", "rageClickCount", "count"]),
      quickbacks: sumMetric(friction("Quickback Click"), ["subTotal", "quickbackClickCount", "count"]),
      scriptErrors: sumMetric(friction("Script Error Count"), ["subTotal", "scriptErrorCount", "count"]),
      errorClicks: sumMetric(friction("Error Click Count"), ["subTotal", "errorClickCount", "count"]),
    },
  };
}

async function cachedSnapshot() {
  try {
    const rows = await adminSelect("admin_audit_logs", {
      select: "metadata,created_at",
      filters: [["action", "eq", CACHE_ACTION]],
      order: "created_at.desc",
      limit: 1,
    });
    const cached = rows[0];
    if (!cached?.metadata?.snapshot) return null;
    if (Date.now() - new Date(cached.created_at).getTime() >= CACHE_TTL_MS) return null;
    return { ...cached.metadata.snapshot, cached: true };
  } catch (error) {
    console.error("Clarity cache read error", error);
    return null;
  }
}

async function saveSnapshot(snapshot) {
  try {
    await adminInsert("admin_audit_logs", {
      action: CACHE_ACTION,
      resource: "microsoft_clarity",
      metadata: { snapshot },
    });
  } catch (error) {
    console.error("Clarity cache write error", error);
  }
}

export async function fetchClarityReport() {
  const token = process.env.CLARITY_API_TOKEN;
  if (!token) return { connected: false, message: "Token da API do Microsoft Clarity não configurado." };

  const cached = await cachedSnapshot();
  if (cached) return cached;

  const url = new URL(CLARITY_ENDPOINT);
  url.searchParams.set("numOfDays", "3");
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Clarity API ${response.status}: ${details.slice(0, 300)}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error("Clarity API retornou um formato inesperado.");

  console.info("Clarity response shape", payload.map((item) => ({
    metricName: item?.metricName,
    keys: Object.keys(item?.information?.[0] || {}),
  })));

  const snapshot = normalizeClarityPayload(payload);
  await saveSnapshot(snapshot);
  return snapshot;
}

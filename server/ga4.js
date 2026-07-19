import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createPrivateKey } from "node:crypto";

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

function normalizePrivateKey(rawValue = "") {
  let value = String(rawValue).trim();
  if (!value) return "";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "string") {
        value = parsed.trim();
        continue;
      }
      if (parsed?.private_key) value = parsed.private_key;
      break;
    } catch {
      break;
    }
  }

  value = value
    .replace(/^GA4_PRIVATE_KEY\s*=\s*/i, "")
    .replace(/^['"]?private_key['"]?\s*:\s*/i, "")
    .replace(/,$/, "")
    .trim();

  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      value = JSON.parse(value);
    } catch {
      value = value.slice(1, -1);
    }
  } else if (value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1);
  }

  value = value.replace(/\\+n/g, "\n").replace(/\r\n/g, "\n").trim();
  const pem = value.match(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/);
  return (pem?.[0] || value).trim();
}

function config() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.GA4_PRIVATE_KEY);
  return { propertyId, clientEmail, privateKey, ready: Boolean(propertyId && clientEmail && privateKey) };
}

function privateKeyShape(value) {
  return {
    length: value.length,
    beginsWithPemHeader: value.startsWith("-----BEGIN PRIVATE KEY-----"),
    endsWithPemFooter: value.endsWith("-----END PRIVATE KEY-----"),
    lineCount: value ? value.split("\n").length : 0,
    containsEscapedNewlines: value.includes("\\n"),
  };
}

function assertValidPrivateKey(value) {
  try {
    createPrivateKey(value);
  } catch (error) {
    const diagnostic = privateKeyShape(value);
    console.error("GA4 private key validation failed", diagnostic);
    const invalidKeyError = new Error(`GA4_PRIVATE_KEY_INVALID ${JSON.stringify(diagnostic)}`);
    invalidKeyError.cause = error;
    throw invalidKeyError;
  }
}

function gaDate(date) {
  return date.toISOString().slice(0, 10);
}

function inclusiveEnd(exclusiveEnd) {
  return new Date(exclusiveEnd.getTime() - 24 * 60 * 60 * 1000);
}

function metric(row, index) {
  return Number(row?.metricValues?.[index]?.value || 0);
}

function summaryFrom(response) {
  const row = response.rows?.[0];
  return {
    activeUsers: metric(row, 0),
    totalUsers: metric(row, 1),
    newUsers: metric(row, 2),
    sessions: metric(row, 3),
    views: metric(row, 4),
    events: metric(row, 5),
    engagedSessions: metric(row, 6),
    engagementRate: Number((metric(row, 7) * 100).toFixed(1)),
    averageSessionDuration: Number(metric(row, 8).toFixed(1)),
  };
}

function dailyFrom(response) {
  return (response.rows || []).map((row) => ({
    date: row.dimensionValues?.[0]?.value || "",
    sessions: metric(row, 0),
    views: metric(row, 1),
  }));
}

export function isGa4Configured() {
  return config().ready;
}

export async function fetchGa4Report({ start, end }) {
  const credentials = config();
  if (!credentials.ready) {
    return { connected: false, message: "Credenciais do Google Analytics Data API não configuradas." };
  }

  assertValidPrivateKey(credentials.privateKey);

  const startDate = gaDate(start);
  const endDate = gaDate(inclusiveEnd(end));
  const cacheKey = `${credentials.propertyId}:${startDate}:${endDate}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return cached.value;

  const client = new BetaAnalyticsDataClient({
    credentials: { client_email: credentials.clientEmail, private_key: credentials.privateKey },
  });
  const property = `properties/${credentials.propertyId}`;
  const dateRanges = [{ startDate, endDate }];
  const metricNames = ["activeUsers", "totalUsers", "newUsers", "sessions", "screenPageViews", "eventCount", "engagedSessions", "engagementRate", "averageSessionDuration"];

  const [summaryResponse, dailyResponse] = await Promise.all([
    client.runReport({ property, dateRanges, metrics: metricNames.map((name) => ({ name })) }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }, { name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
  ]);

  const value = {
    connected: true,
    propertyId: credentials.propertyId,
    period: { startDate, endDate },
    summary: summaryFrom(summaryResponse[0]),
    daily: dailyFrom(dailyResponse[0]),
    message: "Dados oficiais da propriedade GA4.",
  };
  cache.set(cacheKey, { createdAt: Date.now(), value });
  return value;
}

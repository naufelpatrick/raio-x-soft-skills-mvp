import {
  applySecurityHeaders,
  checkRateLimit,
  cleanText,
  parseBody,
  requireAllowedOrigin,
  requireJson,
  requirePost,
} from "../server/_security.js";
import { insertSupabaseRecord } from "../server/_supabase.js";

const allowedEvents = new Set([
  "page_view",
  "landing_page_view",
  "assessment_started",
  "assessment_progress",
  "assessment_completed",
  "free_report_viewed",
  "premium_offer_viewed",
  "premium_cta_clicked",
  "checkout_started",
  "payment_pending",
  "payment_approved",
  "payment_failed",
]);

function cleanMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => (
        ["string", "number", "boolean"].includes(typeof entryValue) ||
        entryValue === null
      ))
      .slice(0, 30)
      .map(([key, entryValue]) => [
        cleanText(key, 60),
        typeof entryValue === "string" ? cleanText(entryValue, 250) : entryValue,
      ])
      .filter(([key]) => Boolean(key))
  );
}

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, "product-event", 80, 10 * 60 * 1000)
  ) {
    return;
  }

  try {
    const body = parseBody(req);
    const eventName = cleanText(body.eventName, 80);
    const event = {
      eventName,
      anonymousUserId: cleanText(body.anonymousUserId, 100),
      userId: cleanText(body.userId, 100) || null,
      assessmentId: cleanText(body.assessmentId, 100),
      sessionId: cleanText(body.sessionId, 100),
      source: cleanText(body.source, 120),
      medium: cleanText(body.medium, 120),
      campaign: cleanText(body.campaign, 180),
      pagePath: cleanText(body.pagePath, 250),
      metadata: cleanMetadata(body.metadata),
    };

    if (!event.sessionId || !allowedEvents.has(event.eventName)) {
      return res.status(400).json({ error: "Evento de produto inválido." });
    }

    const supabaseResult = await insertSupabaseRecord("product_events", event);
    if (!supabaseResult.saved) {
      return res.status(503).json({ error: "Evento não salvo. Verifique a configuração do Supabase." });
    }

    return res.status(201).json({ received: true, saved: true });
  } catch (error) {
    console.error("Product event error", error);
    return res.status(500).json({ error: "Não foi possível registrar o evento." });
  }
}

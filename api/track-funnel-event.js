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
  "profile_started",
  "profile_field_started",
  "profile_submitted",
  "assessment_started",
  "assessment_completed",
  "free_report_viewed",
  "payment_started",
  "payment_completed",
  "paid_report_generated",
  "nps_submitted",
]);

function cleanMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => (
        ["string", "number", "boolean"].includes(typeof entryValue) ||
        entryValue === null
      ))
      .slice(0, 20)
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
    !checkRateLimit(req, res, "funnel", 60, 10 * 60 * 1000)
  ) {
    return;
  }

  try {
    const body = parseBody(req);
    const eventName = cleanText(body.eventName, 80);
    const event = {
      sessionId: cleanText(body.sessionId, 100),
      eventName,
      step: cleanText(body.step, 80),
      metadata: cleanMetadata(body.metadata),
    };

    if (!event.sessionId || !allowedEvents.has(event.eventName)) {
      return res.status(400).json({ error: "Evento de funil inválido." });
    }

    const supabaseResult = await insertSupabaseRecord("funnel_events", event);
    if (!supabaseResult.saved) {
      return res.status(503).json({ error: "Evento não salvo. Verifique a configuração do Supabase." });
    }

    return res.status(201).json({ received: true, saved: true });
  } catch (error) {
    console.error("Funnel event error", error);
    return res.status(500).json({ error: "Não foi possível registrar o evento." });
  }
}

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

const allowedInterests = new Set([
  "individual_guidance",
  "advanced_report",
  "teams",
  "progress_tracking",
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, "interest", 5, 10 * 60 * 1000)
  ) {
    return;
  }

  try {
    const body = parseBody(req);
    const interest = {
      sessionId: cleanText(body.sessionId, 100),
      interest: cleanText(body.interest, 80),
      name: cleanText(body.name, 120),
      email: cleanText(body.email, 254).toLowerCase(),
      contactConsent: body.contactConsent === true,
      recommendation: Number(body.recommendation),
      source: cleanText(body.source, 50),
      submittedAt: new Date().toISOString(),
    };

    if (
      !interest.sessionId ||
      !allowedInterests.has(interest.interest) ||
      !interest.name ||
      !emailPattern.test(interest.email) ||
      !interest.contactConsent ||
      interest.source !== "post_feedback"
    ) {
      return res.status(400).json({ error: "Dados de interesse incompletos ou inválidos." });
    }

    if (
      !Number.isInteger(interest.recommendation) ||
      interest.recommendation < 0 ||
      interest.recommendation > 10
    ) {
      delete interest.recommendation;
    }

    let saved = false;
    try {
      const supabaseResult = await insertSupabaseRecord("validation_interest", interest);
      saved = Boolean(supabaseResult.saved);
    } catch (storageError) {
      console.error("Interest Supabase error", storageError);
    }

    let forwarded = false;
    if (process.env.INTEREST_WEBHOOK_URL) {
      const webhookResponse = await fetch(process.env.INTEREST_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interest),
      });

      if (!webhookResponse.ok) {
        console.error("Interest webhook error", webhookResponse.status);
      } else {
        forwarded = true;
      }
    }

    return res.status(201).json({ received: true, forwarded, saved });
  } catch (error) {
    console.error("Interest error", error);
    return res.status(400).json({ error: "Não foi possível registrar o interesse." });
  }
}

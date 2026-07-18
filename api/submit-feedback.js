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

const allowedUsefulParts = new Set([
  "Perfil predominante",
  "Forças e oportunidades",
  "Plano de desenvolvimento",
  "Análise completa com IA",
  "Ainda não encontrei valor",
]);

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, "feedback", 10, 10 * 60 * 1000)
  ) {
    return;
  }

  try {
    const body = parseBody(req);
    const feedback = {
      sessionId: cleanText(body.sessionId, 100),
      accuracy: Number(body.accuracy),
      recommendation: Number(body.recommendation),
      usefulPart: cleanText(body.usefulPart, 100),
      comments: cleanText(body.comments, 1000),
      usedAI: Boolean(body.usedAI),
      submittedAt: new Date().toISOString(),
    };

    if (
      !feedback.sessionId ||
      !Number.isInteger(feedback.accuracy) ||
      feedback.accuracy < 1 ||
      feedback.accuracy > 5 ||
      !Number.isInteger(feedback.recommendation) ||
      feedback.recommendation < 0 ||
      feedback.recommendation > 10 ||
      !allowedUsefulParts.has(feedback.usefulPart)
    ) {
      return res.status(400).json({ error: "Feedback incompleto ou inválido." });
    }

    let saved = false;
    try {
      const supabaseResult = await insertSupabaseRecord("validation_feedback", feedback);
      saved = Boolean(supabaseResult.saved);
    } catch (storageError) {
      console.error("Feedback Supabase error", storageError);
    }

    let forwarded = false;
    if (process.env.FEEDBACK_WEBHOOK_URL) {
      const webhookResponse = await fetch(process.env.FEEDBACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      if (!webhookResponse.ok) {
        console.error("Feedback webhook error", webhookResponse.status);
      } else {
        forwarded = true;
      }
    }

    return res.status(201).json({ received: true, forwarded, saved });
  } catch (error) {
    console.error("Feedback error", error);
    return res.status(400).json({ error: "Não foi possível processar o feedback." });
  }
}

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getNpsCategory(score) {
  if (score <= 6) return "detractor";
  if (score <= 8) return "neutral";
  return "promoter";
}

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, "nps", 5, 10 * 60 * 1000)
  ) {
    return;
  }

  try {
    const body = parseBody(req);
    const score = Number(body.score);
    const nps = {
      sessionId: cleanText(body.sessionId, 100),
      name: cleanText(body.name, 120),
      email: cleanText(body.email, 254).toLowerCase(),
      score,
      category: Number.isInteger(score) ? getNpsCategory(score) : "",
      comment: cleanText(body.comment, 1200),
      source: cleanText(body.source, 50) || "paid_report",
      reportType: cleanText(body.reportType, 30) || "paid",
      submittedAt: new Date().toISOString(),
    };

    if (
      !nps.sessionId ||
      !nps.name ||
      !emailPattern.test(nps.email) ||
      !Number.isInteger(nps.score) ||
      nps.score < 0 ||
      nps.score > 10 ||
      nps.source !== "paid_report" ||
      nps.reportType !== "paid"
    ) {
      return res.status(400).json({ error: "NPS incompleto ou inválido." });
    }

    const supabaseResult = await insertSupabaseRecord("nps_responses", nps);
    if (!supabaseResult.saved) {
      return res.status(503).json({ error: "NPS não salvo. Verifique a configuração do Supabase." });
    }

    return res.status(201).json({ received: true, saved: true });
  } catch (error) {
    console.error("NPS error", error);
    return res.status(500).json({ error: "Não foi possível registrar seu feedback agora." });
  }
}

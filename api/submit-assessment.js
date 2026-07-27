import { randomUUID } from "node:crypto";
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
import { INSTRUMENT_VERSION } from "../src/data/questions.js";
import { calculateVersionedAssessment } from "../src/services/scoringService.js";

function cleanExperiments(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([id, variant]) => /^[a-z0-9_]{1,80}$/.test(id) && ["A", "B"].includes(variant))
    .slice(0, 10));
}

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, "assessment", 10, 10 * 60 * 1000)
  ) return;

  try {
    const body = parseBody(req);
    const sessionId = cleanText(body.sessionId, 100);
    const instrumentVersion = cleanText(body.instrumentVersion, 20);
    if (!sessionId || instrumentVersion !== INSTRUMENT_VERSION || !Array.isArray(body.answers)) {
      return res.status(400).json({ error: "Avaliação inválida ou incompatível." });
    }

    const originalAnswers = Object.fromEntries(
      body.answers.map((answer) => [cleanText(answer.statementId, 20), answer.value])
    );
    const assessment = calculateVersionedAssessment(originalAnswers, instrumentVersion);
    const openAnswers = Object.fromEntries(
      Object.entries(body.openAnswers || {})
        .filter(([key]) => /^open_[1-3]$/.test(key))
        .map(([key, value]) => [key, cleanText(value, 2000)])
    );
    const assessmentId = randomUUID();
    const supabaseResult = await insertSupabaseRecord("assessments", {
      id: assessmentId,
      sessionId,
      instrumentVersion,
      answers: assessment.answers,
      openAnswers,
      competencyScores: assessment.scores,
      generalScore: assessment.generalScore,
      completedAt: new Date().toISOString(),
      experiments: cleanExperiments(body.experiments),
    });

    if (!supabaseResult.saved) {
      return res.status(503).json({ error: "Avaliação não salva. Verifique a configuração do Supabase." });
    }
    return res.status(201).json({ saved: true, assessmentId });
  } catch (error) {
    console.error("Assessment submit error", error);
    return res.status(400).json({ error: "Respostas da avaliação inválidas." });
  }
}

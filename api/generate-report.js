import { buildReportPrompt } from "../src/services/reportPrompt.js";
import {
  applySecurityHeaders,
  checkRateLimit,
  cleanText,
  parseBody,
  requireAllowedOrigin,
  requireJson,
  requirePost,
} from "./_security.js";

const profileFields = [
  "name",
  "age",
  "experience",
  "currentRole",
  "professionalLevel",
  "mainArea",
  "careerGoal",
  "currentChallenge",
];

function cleanProfile(profile = {}) {
  return Object.fromEntries(
    profileFields.map((field) => [field, cleanText(profile[field], 500)])
  );
}

function cleanCompetency(item = {}) {
  return {
    id: cleanText(item.id, 80),
    name: cleanText(item.name, 120),
    score: Math.max(0, Math.min(100, Number(item.score) || 0)),
    level: cleanText(item.level, 80),
  };
}

function cleanScores(scores = {}) {
  const strengths = Array.isArray(scores.strengths)
    ? scores.strengths.slice(0, 3).map(cleanCompetency)
    : [];
  const opportunities = Array.isArray(scores.opportunities)
    ? scores.opportunities.slice(0, 3).map(cleanCompetency)
    : [];
  const crossAnalysis = Array.isArray(scores.crossAnalysis)
    ? scores.crossAnalysis.slice(0, 4).map((item) => ({
        title: cleanText(item?.title, 150),
        interpretation: cleanText(item?.interpretation, 800),
      }))
    : [];
  const pdi = Array.isArray(scores.pdi)
    ? scores.pdi.slice(0, 3).map((item) => ({
        competency: cleanText(item?.competency, 120),
        score: Math.max(0, Math.min(100, Number(item?.score) || 0)),
        actions: {
          days30: cleanActions(item?.actions?.days30),
          days60: cleanActions(item?.actions?.days60),
          days90: cleanActions(item?.actions?.days90),
        },
      }))
    : [];

  return {
    generalScore: Math.max(0, Math.min(100, Number(scores.generalScore) || 0)),
    generalLevel: cleanText(scores.generalLevel, 80),
    profile: {
      name: cleanText(scores.profile?.name, 150),
      description: cleanText(scores.profile?.description, 800),
    },
    strengths,
    opportunities,
    crossAnalysis,
    pdi,
  };
}

function cleanActions(actions) {
  return Array.isArray(actions)
    ? actions.slice(0, 4).map((action) => cleanText(action, 300)).filter(Boolean)
    : [];
}

function cleanOpenAnswers(openAnswers = {}) {
  return {
    open_1: cleanText(openAnswers.open_1, 2000),
    open_2: cleanText(openAnswers.open_2, 2000),
    open_3: cleanText(openAnswers.open_3, 2000),
  };
}

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, "gemini", 5, 10 * 60 * 1000)
  ) {
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: "Serviço de análise não configurado." });
  }

  try {
    const body = parseBody(req);
    const profile = cleanProfile(body.profile);
    const scores = cleanScores(body.scores);
    const openAnswers = cleanOpenAnswers(body.openAnswers);

    if (!profile.name || !scores.generalLevel || scores.strengths.length === 0) {
      return res.status(400).json({ error: "Dados da avaliação incompletos." });
    }

    const prompt = buildReportPrompt({ profile, scores, openAnswers });
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error", response.status, data?.error?.message);
      return res.status(502).json({ error: "A análise está indisponível no momento." });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: "A IA não retornou uma análise válida." });
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Generate report error", error);
    return res.status(400).json({ error: "Não foi possível processar a avaliação." });
  }
}

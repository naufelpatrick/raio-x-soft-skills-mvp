import { competencies } from "../data/competencies";
import { calculateProfile } from "./profileService";
import { calculateCrossAnalysis } from "./crossAnalysisService";
import { generatePDI } from "./pdiService";

export function getMaturityLevel(score) {
  if (score <= 20) return "Inicial";
  if (score <= 40) return "Emergente";
  if (score <= 60) return "Consistente";
  if (score <= 80) return "Avançado";
  return "Referência";
}

export function calculateCompetencyScore(answers, competencyId) {
  let rawScore = 0;

  for (let index = 1; index <= 5; index++) {
    rawScore += Number(answers[`${competencyId}_${index}`] || 0);
  }

  const score = Math.round(((rawScore - 5) / 20) * 100);

  return {
    rawScore,
    score,
    level: getMaturityLevel(score),
  };
}

export function calculateAssessmentResults(answers) {
  const competencyResults = competencies.map((competency) => {
    const result = calculateCompetencyScore(answers, competency.id);

    return {
      ...competency,
      ...result,
    };
  });

  const generalScore = Math.round(
    competencyResults.reduce((sum, item) => sum + item.score, 0) /
      competencyResults.length
  );

  const generalLevel = getMaturityLevel(generalScore);

  const sortedByScore = [...competencyResults].sort(
    (a, b) => b.score - a.score
  );

  const profile = calculateProfile(competencyResults);

const crossAnalysis = calculateCrossAnalysis(competencyResults);

const pdi = generatePDI(
  sortedByScore.slice(-3).reverse()
);

  return {
    generalScore,
    generalLevel,
    profile,
    crossAnalysis,
    pdi,
    competencies: competencyResults,
    strengths: sortedByScore.slice(0, 3),
    opportunities: sortedByScore.slice(-3).reverse(),
  };
}
import { crossAnalysisRules } from "../data/crossAnalysis";

function getCompetencyScore(competencies, id) {
  return competencies.find((item) => item.id === id)?.score || 0;
}

export function calculateCrossAnalysis(competencies) {
  return crossAnalysisRules
    .filter((rule) => {
      const highMatches = rule.high.every(
        (id) => getCompetencyScore(competencies, id) >= 60
      );

      const lowMatches = rule.low
        ? rule.low.every((id) => getCompetencyScore(competencies, id) <= 50)
        : true;

      return highMatches && lowMatches;
    })
    .slice(0, 4);
}
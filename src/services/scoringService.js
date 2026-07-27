import { competencies } from "../data/competencies.js";
import {
  INSTRUMENT_VERSION,
  getStatementsForCompetency,
  statements,
} from "../data/questions.js";

export function getAdjustedScore(answer, isReverseScored) {
  if (!Number.isInteger(answer) || answer < 1 || answer > 5) {
    throw new Error("Resposta inválida: o valor deve estar entre 1 e 5.");
  }
  return isReverseScored ? 6 - answer : answer;
}

export function getMaturityLevel(score) {
  if (score <= 20) return "Inicial";
  if (score <= 40) return "Emergente";
  if (score <= 60) return "Consistente";
  if (score <= 80) return "Avançado";
  return "Referência";
}

export function calculateCompetencyScore(answers, competencyId) {
  const competencyStatements = getStatementsForCompetency(competencyId);
  if (competencyStatements.length !== 5) {
    throw new Error(`Competência inválida ou incompleta: ${competencyId}.`);
  }

  const rawScore = competencyStatements.reduce((sum, statement) => {
    const answer = answers[statement.id];
    return sum + getAdjustedScore(answer, statement.isReverseScored);
  }, 0);
  const score = Math.round(((rawScore - 5) / 20) * 100);

  return { rawScore, score, level: getMaturityLevel(score) };
}

export function calculateScores(answers) {
  return competencies.map((competency) => ({
    id: competency.id,
    name: competency.name,
    ...calculateCompetencyScore(answers, competency.id),
  }));
}

export function calculateGeneralScore(answers) {
  const scores = calculateScores(answers);
  return Math.round(
    scores.reduce((sum, competency) => sum + competency.score, 0) /
      scores.length
  );
}

export function buildStoredAnswers(answers) {
  return statements.map((statement) => {
    const value = answers[statement.id];
    return {
      statementId: statement.id,
      competencyId: statement.competencyId,
      order: statement.order,
      isReverseScored: statement.isReverseScored,
      value,
      adjustedValue: getAdjustedScore(value, statement.isReverseScored),
    };
  });
}

export function calculateVersionedAssessment(answers, instrumentVersion) {
  if (instrumentVersion !== INSTRUMENT_VERSION) {
    throw new Error(
      `A avaliação ${instrumentVersion || "1.0"} não pode ser recalculada com o instrumento ${INSTRUMENT_VERSION}.`
    );
  }
  const scores = calculateScores(answers);
  const generalScore = Math.round(
    scores.reduce((sum, item) => sum + item.score, 0) / scores.length
  );
  return {
    instrumentVersion,
    answers: buildStoredAnswers(answers),
    scores,
    generalScore,
  };
}

import * as v1 from "./questions.v1.js";
import * as v2 from "./questions.v2.js";

export const instrumentVersion = v2.instrumentVersion;
export const INSTRUMENT_VERSION = instrumentVersion;
export const statements = v2.statements;
export const openQuestions = v2.openQuestions;
export const likertOptions = v2.frequencyOptions;
export const frequencyOptions = v2.frequencyOptions;

export const questions = Object.keys(v2.statements.reduce((groups, item) => ({ ...groups, [item.competencyId]: true }), {})).map(
  (competencyId) => ({ competencyId, items: v2.statements.filter((item) => item.competencyId === competencyId) })
);

export function getInstrument(version = INSTRUMENT_VERSION) {
  if (version === v1.instrumentVersion) return v1;
  if (version === v2.instrumentVersion) return v2;
  throw new Error(`Versão de instrumento desconhecida: ${version || "sem versão"}.`);
}

export function getStatementsForCompetency(competencyId, version = INSTRUMENT_VERSION) {
  return getInstrument(version).statements.filter((item) => item.competencyId === competencyId);
}

// Intercala competências para evitar blocos previsíveis sem mudar a composição do instrumento.
export const assessmentSteps = Array.from({ length: 10 }, (_, stepIndex) =>
  statements.filter((_, itemIndex) => itemIndex % 10 === stepIndex)
);

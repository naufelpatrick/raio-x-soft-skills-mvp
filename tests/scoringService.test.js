import test from "node:test";
import assert from "node:assert/strict";
import { competencies } from "../src/data/competencies.js";
import {
  INSTRUMENT_VERSION,
  statements,
} from "../src/data/questions.js";
import {
  calculateCompetencyScore,
  calculateGeneralScore,
  calculateVersionedAssessment,
  getAdjustedScore,
} from "../src/services/scoringService.js";

function answersWith(value) {
  return Object.fromEntries(statements.map((statement) => [statement.id, value]));
}

test("pontuação direta preserva respostas 1, 3 e 5", () => {
  assert.equal(getAdjustedScore(1, false), 1);
  assert.equal(getAdjustedScore(3, false), 3);
  assert.equal(getAdjustedScore(5, false), 5);
});

test("pontuação invertida aplica 6 - resposta", () => {
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((value) => getAdjustedScore(value, true)),
    [5, 4, 3, 2, 1]
  );
});

test("competência usa valores corrigidos", () => {
  const answers = answersWith(5);
  assert.deepEqual(calculateCompetencyScore(answers, "comunicacao"), {
    rawScore: 25,
    score: 100,
    level: "Referência",
    behavioralScore: 100,
    situationalScore: 100,
  });
});

test("score geral usa valores corrigidos", () => {
  assert.equal(calculateGeneralScore(answersWith(5)), 100);
});

test("avaliação 1.0 não é recalculada como 2.0", () => {
  assert.throws(
    () => calculateVersionedAssessment(answersWith(3), "1.0"),
    /não pode ser recalculada/
  );
});

test("instrumento tem 50 afirmações, cinco por competência", () => {
  assert.equal(statements.length, 50);
  for (const competency of competencies) {
    assert.equal(
      statements.filter((item) => item.competencyId === competency.id).length,
      5
    );
  }
});

test("cada competência tem três questões comportamentais e duas situacionais", () => {
  for (const competency of competencies) {
    const items = statements.filter((item) => item.competencyId === competency.id);
    assert.equal(items.filter((item) => item.type === "behavioral").length, 3);
    assert.equal(items.filter((item) => item.type === "situational").length, 2);
  }
});

test("todos os identificadores são únicos", () => {
  assert.equal(new Set(statements.map((item) => item.id)).size, statements.length);
});

test("rejeita qualquer resposta fora do intervalo inteiro de 1 a 5", () => {
  for (const value of [0, 6, 2.5, "3", null, undefined, Number.NaN]) {
    assert.throws(() => getAdjustedScore(value, false), /Resposta inválida/);
  }
});

test("avaliação 2.0 preserva tipo, valor original e valor corrigido", () => {
  const result = calculateVersionedAssessment(answersWith(5), INSTRUMENT_VERSION);
  const situational = result.answers.find((item) => item.statementId === "comunicacao_04");
  assert.equal(situational.value, 5);
  assert.equal(situational.questionType, "situational");
  assert.equal(situational.adjustedValue, 5);
});

test("todas as alternativas situacionais têm valores únicos de 1 a 5", () => {
  for (const item of statements.filter((question) => question.type === "situational")) {
    assert.deepEqual([...item.options.map((option) => option.value)].sort(), [1, 2, 3, 4, 5]);
  }
});

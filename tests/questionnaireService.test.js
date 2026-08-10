import test from "node:test";
import assert from "node:assert/strict";
import { statements } from "../src/data/questions.js";
import { stableShuffle } from "../src/services/questionnaireService.js";

test("a ordem das alternativas permanece estável durante a mesma avaliação", () => {
  const question = statements.find((item) => item.type === "situational");
  const first = stableShuffle(question.options, `session-1:${question.id}`);
  const second = stableShuffle(question.options, `session-1:${question.id}`);
  assert.deepEqual(first, second);
});

test("embaralhar alternativas preserva o valor associado a cada texto", () => {
  const question = statements.find((item) => item.type === "situational");
  const original = Object.fromEntries(question.options.map((option) => [option.text, option.value]));
  const shuffled = stableShuffle(question.options, `session-2:${question.id}`);
  assert.deepEqual(Object.fromEntries(shuffled.map((option) => [option.text, option.value])), original);
});

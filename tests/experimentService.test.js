import assert from "node:assert/strict";
import test from "node:test";
import {
  HOME_EXPERIMENT_ID,
  HOME_EXPERIMENT_STORAGE_KEY,
  assignExperimentVariant,
  clearExperimentVariant,
  getExperimentVariant,
  resetExperimentMemoryForTests,
  resolveHomeExperiment,
  getExperimentParameters,
} from "../src/services/experimentService.js";

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test.beforeEach(() => {
  resetExperimentMemoryForTests();
  globalThis.localStorage = storage();
});

test.after(() => {
  delete globalThis.localStorage;
});

test("novo visitante recebe somente A ou B em uma divisão 50/50", () => {
  assert.equal(assignExperimentVariant(HOME_EXPERIMENT_ID, ["A", "B"], () => 0.1), "A");
  clearExperimentVariant(HOME_EXPERIMENT_ID);
  assert.equal(assignExperimentVariant(HOME_EXPERIMENT_ID, ["A", "B"], () => 0.9), "B");
});

test("variante persiste entre leituras, recarregamentos e navegação", () => {
  const first = assignExperimentVariant(HOME_EXPERIMENT_ID, ["A", "B"], () => 0.1);
  assert.equal(getExperimentVariant(HOME_EXPERIMENT_ID), first);
  assert.equal(assignExperimentVariant(HOME_EXPERIMENT_ID, ["A", "B"], () => 0.9), first);
});

test("visitante antigo mantém sua variante", () => {
  globalThis.localStorage = storage({ [HOME_EXPERIMENT_STORAGE_KEY]: "B" });
  assert.equal(assignExperimentVariant(HOME_EXPERIMENT_ID, ["A", "B"], () => 0), "B");
});

test("QA força A ou B sem sobrescrever a atribuição persistente", () => {
  globalThis.localStorage = storage({ [HOME_EXPERIMENT_STORAGE_KEY]: "A" });
  assert.deepEqual(resolveHomeExperiment("?gclid=123&utm_source=google&ab_variant=B"), {
    experimentId: HOME_EXPERIMENT_ID,
    variant: "B",
    debug: true,
  });
  assert.equal(getExperimentVariant(HOME_EXPERIMENT_ID), "A");
  assert.deepEqual(getExperimentParameters(resolveHomeExperiment("?ab_variant=B")), {
    experiment_id: HOME_EXPERIMENT_ID,
    experiment_variant: "B",
    experiment_debug: true,
    debug_mode: true,
  });
});

test("QA ignora valores inválidos", () => {
  globalThis.localStorage = storage({ [HOME_EXPERIMENT_STORAGE_KEY]: "A" });
  assert.equal(resolveHomeExperiment("?ab_variant=C").variant, "A");
  assert.equal(resolveHomeExperiment("?ab_variant=C").debug, false);
});

test("falha no localStorage não quebra a atribuição", () => {
  globalThis.localStorage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); },
  };
  assert.equal(assignExperimentVariant(HOME_EXPERIMENT_ID, ["A", "B"], () => 0.9), "B");
  assert.equal(getExperimentVariant(HOME_EXPERIMENT_ID), "B");
});

test("atribuição não modifica gclid, UTMs ou a URL", () => {
  const original = "?gclid=abc&utm_campaign=paid&ab_variant=B";
  resolveHomeExperiment(original);
  assert.equal(original, "?gclid=abc&utm_campaign=paid&ab_variant=B");
});

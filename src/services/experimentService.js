export const HOME_EXPERIMENT_ID = "home_value_proposition_v1";
export const HOME_EXPERIMENT_STORAGE_KEY = "ab_home_value_proposition_v1";
const ALLOWED_VARIANTS = new Set(["A", "B"]);
let memoryVariants = new Map();

function storageKey(experimentId) {
  return experimentId === HOME_EXPERIMENT_ID
    ? HOME_EXPERIMENT_STORAGE_KEY
    : `ab_${experimentId}`;
}

export function getExperimentVariant(experimentId) {
  try {
    const stored = globalThis.localStorage?.getItem(storageKey(experimentId));
    return ALLOWED_VARIANTS.has(stored) ? stored : memoryVariants.get(experimentId) || null;
  } catch {
    return memoryVariants.get(experimentId) || null;
  }
}

export function assignExperimentVariant(experimentId, variants = ["A", "B"], random = Math.random) {
  const existing = getExperimentVariant(experimentId);
  if (existing && variants.includes(existing)) return existing;
  const allowed = variants.filter((variant) => ALLOWED_VARIANTS.has(variant));
  const variant = allowed[Math.floor(random() * allowed.length)] || "A";
  memoryVariants.set(experimentId, variant);
  try {
    globalThis.localStorage?.setItem(storageKey(experimentId), variant);
  } catch {
    // A atribuição em memória mantém a página funcional quando storage é bloqueado.
  }
  return variant;
}

export function clearExperimentVariant(experimentId) {
  memoryVariants.delete(experimentId);
  try {
    globalThis.localStorage?.removeItem(storageKey(experimentId));
  } catch {
    // Ferramenta de QA não deve quebrar em navegadores com storage bloqueado.
  }
}

export function resolveHomeExperiment(search = globalThis.location?.search || "") {
  const persistedVariant = assignExperimentVariant(HOME_EXPERIMENT_ID, ["A", "B"]);
  const forcedVariant = new URLSearchParams(search).get("ab_variant");
  const debug = ALLOWED_VARIANTS.has(forcedVariant);
  return {
    experimentId: HOME_EXPERIMENT_ID,
    variant: debug ? forcedVariant : persistedVariant,
    debug,
  };
}

export function getExperimentParameters(experiment) {
  if (!experiment?.experimentId || !ALLOWED_VARIANTS.has(experiment.variant)) return {};
  return {
    experiment_id: experiment.experimentId,
    experiment_variant: experiment.variant,
    ...(experiment.debug ? { experiment_debug: true, debug_mode: true } : {}),
  };
}

export function resetExperimentMemoryForTests() {
  memoryVariants = new Map();
}

import assert from "node:assert/strict";
import test from "node:test";
import {
  initializeAnalytics,
  resetAnalyticsForTests,
  setAnalyticsExperiment,
  trackPurchase,
} from "../src/services/analyticsService.js";

test("purchase preserva os dados existentes e acrescenta a variante", () => {
  const values = new Map([["raio_x_cookie_preferences_v1", JSON.stringify({ analytics: true })]]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
  globalThis.window = { dataLayer: [] };
  globalThis.document = {
    createElement: () => ({ set async(_) {}, set src(_) {} }),
    head: { appendChild() {} },
    querySelector: () => null,
  };
  resetAnalyticsForTests();
  initializeAnalytics("session-1");
  setAnalyticsExperiment({
    experiment_id: "home_value_proposition_v1",
    experiment_variant: "B",
  });
  const items = [{ item_id: "diagnostico-completo", price: 49.9, quantity: 1 }];
  assert.equal(trackPurchase({ transactionId: "pay-1", value: 49.9, currency: "BRL", items }), true);
  const purchase = globalThis.window.dataLayer.find((entry) => entry[0] === "event" && entry[1] === "purchase");
  assert.deepEqual(purchase[2], {
    session_id: "session-1",
    experiment_id: "home_value_proposition_v1",
    experiment_variant: "B",
    transaction_id: "pay-1",
    value: 49.9,
    currency: "BRL",
    items,
  });
  assert.equal(trackPurchase({ transactionId: "pay-1", value: 49.9, items }), false);
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.localStorage;
});

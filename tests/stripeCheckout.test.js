import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import test from "node:test";

import { isPaidStripeSession, verifyStripeWebhook } from "../server/_stripe.js";

test("reconhece somente sessões Stripe com pagamento concluído", () => {
  assert.equal(isPaidStripeSession({ payment_status: "paid" }), true);
  assert.equal(isPaidStripeSession({ payment_status: "no_payment_required" }), true);
  assert.equal(isPaidStripeSession({ payment_status: "unpaid" }), false);
});

test("valida a assinatura e preserva o corpo original do webhook", () => {
  const secret = "whsec_test";
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ id: "evt_test", type: "checkout.session.completed" }));
  const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");

  const event = verifyStripeWebhook(payload, `t=${timestamp},v1=${signature}`, secret);
  assert.equal(event.id, "evt_test");
});

test("rejeita webhook com assinatura inválida", () => {
  const payload = Buffer.from("{}");
  const timestamp = Math.floor(Date.now() / 1000);
  assert.throws(() => verifyStripeWebhook(payload, `t=${timestamp},v1=deadbeef`, "whsec_test"), /inválida/i);
});

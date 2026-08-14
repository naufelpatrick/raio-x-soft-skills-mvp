import crypto from "node:crypto";

const STRIPE_API_URL = "https://api.stripe.com/v1";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export function isStripeConfigured() {
  return Boolean(STRIPE_SECRET_KEY);
}

async function requestStripe(path, { method = "GET", params } = {}) {
  if (!isStripeConfigured()) throw new Error("STRIPE_SECRET_KEY não configurada.");

  const body = params ? new URLSearchParams(params) : undefined;
  const response = await fetch(`${STRIPE_API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Stripe API error (${response.status}): ${data?.error?.message || response.statusText}`);
  }
  return data;
}

export function createStripeCheckoutSession({ sessionId, name, email, value, appUrl }) {
  const successUrl = `${appUrl}/?payment=success&sessionId=${encodeURIComponent(sessionId)}`;
  const cancelUrl = `${appUrl}/?payment=cancelled&sessionId=${encodeURIComponent(sessionId)}`;
  return requestStripe("/checkout/sessions", {
    method: "POST",
    params: {
      mode: "payment",
      client_reference_id: sessionId,
      customer_email: email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      "metadata[session_id]": sessionId,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "brl",
      "line_items[0][price_data][unit_amount]": String(Math.round(value * 100)),
      "line_items[0][price_data][product_data][name]": "Raio-X do Designer — Diagnóstico Completo",
      "line_items[0][price_data][product_data][description]": `Diagnóstico completo de ${name}`,
    },
  });
}

export function getStripeCheckoutSession(sessionId) {
  return requestStripe(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

export function isPaidStripeSession(session) {
  return ["paid", "no_payment_required"].includes(String(session?.payment_status || "").toLowerCase());
}

export function verifyStripeWebhook(rawBody, signatureHeader, secret = process.env.STRIPE_WEBHOOK_SECRET) {
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET não configurada.");
  const parts = String(signatureHeader || "").split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) throw new Error("Assinatura Stripe ausente.");
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) throw new Error("Assinatura Stripe expirada.");

  const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
  const signedPayload = Buffer.concat([Buffer.from(`${timestamp}.`), payload]);
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest();
  const valid = signatures.some((signature) => {
    const received = Buffer.from(signature, "hex");
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  });
  if (!valid) throw new Error("Assinatura Stripe inválida.");
  return JSON.parse(payload.toString("utf8"));
}

export async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

import {
  applySecurityHeaders,
  checkRateLimit,
  cleanText,
  parseBody,
  requireAllowedOrigin,
  requireJson,
  requirePost,
} from "../server/_security.js";
import { createStripeCheckoutSession } from "../server/_stripe.js";
import { adminSelect, adminUpdateWhere } from "../server/_admin.js";

const PRODUCT_VALUE = 49.9;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function cleanExperiments(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([id, variant]) => /^[a-z0-9_]{1,80}$/.test(id) && ["A", "B"].includes(variant))
    .slice(0, 10));
}

function getAppUrl(req) {
  const configuredUrl = process.env.APP_URL || process.env.VITE_APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, "payment", 8, 10 * 60 * 1000)
  ) {
    return;
  }

  try {
    const body = parseBody(req);
    const now = new Date().toISOString();
    const lead = {
      sessionId: cleanText(body.sessionId, 100),
      name: cleanText(body.name, 120),
      email: cleanText(body.email, 254).toLowerCase(),
      whatsapp: cleanText(body.whatsapp, 40),
      contactConsent: body.contactConsent === true,
      age: cleanText(body.age, 20),
      experience: cleanText(body.experience, 80),
      currentRole: cleanText(body.currentRole, 120),
      professionalLevel: cleanText(body.professionalLevel, 80),
      mainArea: cleanText(body.mainArea, 80),
      careerGoal: cleanText(body.careerGoal, 1000),
      currentChallenge: cleanText(body.currentChallenge, 1000),
      purchaseStatus: "requested",
      paymentStatus: "created",
      packageRequestedAt: now,
      lastSeenAt: now,
      experiments: cleanExperiments(body.experiments),
    };
    if (!lead.sessionId || !lead.name || !emailPattern.test(lead.email) || !lead.contactConsent) {
      return res.status(400).json({ error: "Dados incompletos para criar o pagamento." });
    }

    const linkedLeads = await adminSelect("leads", {
      select: "id",
      filters: [["session_id", "eq", lead.sessionId]],
      limit: 1,
    });
    if (!linkedLeads?.length) {
      return res.status(409).json({ error: "Diagnóstico não identificado para este pagamento." });
    }

    const payment = await createStripeCheckoutSession({
      sessionId: lead.sessionId,
      name: lead.name,
      email: lead.email,
      value: PRODUCT_VALUE,
      appUrl: getAppUrl(req),
    });

    const paymentUrl = payment.url;

    if (!payment.id || !paymentUrl) {
      return res.status(502).json({ error: "A Stripe não retornou um link de pagamento válido." });
    }

    const paymentLead = {
      ...lead,
      stripeCustomerId: payment.customer || null,
      stripeCheckoutSessionId: payment.id,
      stripePaymentIntentId: payment.payment_intent || null,
      paymentStatus: payment.payment_status || payment.status || "unpaid",
      paymentUrl,
      paymentCreatedAt: now,
    };

    try {
      const updatedLeads = await adminUpdateWhere("leads", [["session_id", "eq", lead.sessionId]], paymentLead);
      if (!updatedLeads?.length) throw new Error("Lead do checkout não encontrado.");
    } catch (error) {
      console.error("Lead payment update error", error);
      return res.status(503).json({ error: "Pagamento criado, mas o checkout ainda está sendo sincronizado." });
    }

    return res.status(201).json({
      paymentId: payment.id,
      paymentUrl,
      status: payment.payment_status || payment.status,
      value: PRODUCT_VALUE,
    });
  } catch (error) {
    console.error("Create payment error", error);
    return res.status(500).json({ error: "Não foi possível criar o pagamento agora." });
  }
}

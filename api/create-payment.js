import {
  applySecurityHeaders,
  checkRateLimit,
  cleanText,
  parseBody,
  requireAllowedOrigin,
  requireJson,
  requirePost,
} from "../server/_security.js";
import { createAsaasCustomer, createAsaasPayment, sanitizeCpfCnpj } from "../server/_asaas.js";
import { updateSupabaseRecord } from "../server/_supabase.js";

const PRODUCT_VALUE = 49.9;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    };
    const cpfCnpj = sanitizeCpfCnpj(body.cpfCnpj);

    if (!lead.sessionId || !lead.name || !emailPattern.test(lead.email) || !lead.contactConsent || ![11, 14].includes(cpfCnpj.length)) {
      return res.status(400).json({ error: "Dados incompletos para criar o pagamento." });
    }

    const customer = await createAsaasCustomer({ ...lead, cpfCnpj });
    const payment = await createAsaasPayment({
      customerId: customer.id,
      sessionId: lead.sessionId,
      name: lead.name,
      value: PRODUCT_VALUE,
      appUrl: getAppUrl(req),
    });

    const paymentUrl = payment.invoiceUrl || payment.bankSlipUrl;

    if (!payment.id || !paymentUrl) {
      return res.status(502).json({ error: "O Asaas não retornou um link de pagamento válido." });
    }

    const paymentLead = {
      ...lead,
      asaasCustomerId: customer.id,
      asaasPaymentId: payment.id,
      paymentStatus: payment.status || "PENDING",
      paymentUrl,
      paymentCreatedAt: now,
    };

    try {
      await updateSupabaseRecord("leads", paymentLead, "session_id", lead.sessionId);
    } catch (error) {
      console.error("Lead payment update error", error);
    }

    return res.status(201).json({
      paymentId: payment.id,
      paymentUrl,
      status: payment.status,
      value: PRODUCT_VALUE,
    });
  } catch (error) {
    console.error("Create payment error", error);
    return res.status(500).json({ error: "Não foi possível criar o pagamento agora." });
  }
}

import { Resend } from "resend";
import { applySecurityHeaders, cleanText } from "../server/_security.js";
import { adminInsert, adminSelect, adminUpdateWhere } from "../server/_admin.js";
import {
  cancelLeadSequence,
  enrollTestAssessment,
  getResultByToken,
  makeTestStepDue,
  processDueTestDeliveries,
} from "../server/email-sequence.js";

export const config = { api: { bodyParser: false } };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function rawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function authorized(req) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.authorization === `Bearer ${secret}`);
}

async function handleWebhook(req, res) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_WEBHOOK_SECRET) {
    return res.status(503).json({ error: "Webhook não configurado." });
  }
  const payload = await rawBody(req);
  let event;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers["svix-id"],
        timestamp: req.headers["svix-timestamp"],
        signature: req.headers["svix-signature"],
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    });
  } catch {
    return res.status(400).json({ error: "Assinatura inválida." });
  }

  const svixId = cleanText(req.headers["svix-id"], 200);
  const existing = await adminSelect("email_webhook_events", { select: "id", filters: [["svix_id", "eq", svixId]], limit: 1 });
  if (existing?.length) return res.status(200).json({ received: true, duplicate: true });
  const providerMessageId = cleanText(event?.data?.email_id, 200);
  await adminInsert("email_webhook_events", {
    svixId,
    eventType: cleanText(event?.type, 100),
    providerMessageId: providerMessageId || null,
    payload: event,
  });
  if (!providerMessageId) return res.status(200).json({ received: true });

  const deliveries = await adminSelect("email_deliveries", {
    select: "id,lead_id,status", filters: [["provider_message_id", "eq", providerMessageId]], limit: 1,
  });
  const delivery = deliveries?.[0];
  if (!delivery) return res.status(200).json({ received: true, unmatched: true });
  const now = new Date().toISOString();
  if (event.type === "email.delivered") {
    await adminUpdateWhere("email_deliveries", [["id", "eq", delivery.id]], { status: "delivered", deliveredAt: now, updatedAt: now });
  } else if (event.type === "email.bounced") {
    await adminUpdateWhere("email_deliveries", [["id", "eq", delivery.id]], { status: "bounced", bouncedAt: now, error: event?.data?.bounce?.message || "bounce", updatedAt: now });
    if (event?.data?.bounce?.type === "Permanent") {
      await adminUpdateWhere("leads", [["id", "eq", delivery.lead_id]], { emailSuppressedAt: now, emailSuppressionReason: "hard_bounce", marketingConsent: false, lastSeenAt: now });
      await cancelLeadSequence(delivery.lead_id, "hard_bounce");
    }
  } else if (event.type === "email.complained") {
    await adminUpdateWhere("email_deliveries", [["id", "eq", delivery.id]], { status: "complained", complainedAt: now, error: "complaint", updatedAt: now });
    await adminUpdateWhere("leads", [["id", "eq", delivery.lead_id]], { emailSuppressedAt: now, emailSuppressionReason: "complaint", marketingConsent: false, lastSeenAt: now });
    await cancelLeadSequence(delivery.lead_id, "complaint");
  } else if (event.type === "email.failed") {
    await adminUpdateWhere("email_deliveries", [["id", "eq", delivery.id]], { status: "failed", failedAt: now, error: "provider_failed", updatedAt: now });
  }
  return res.status(200).json({ received: true });
}

export default async function handler(req, res) {
  applySecurityHeaders(res);
  const action = cleanText(req.query?.action, 40);
  try {
    if (req.method === "GET" && action === "result") {
      const token = cleanText(req.query?.token, 80);
      if (!uuidPattern.test(token)) return res.status(400).json({ error: "Link inválido." });
      const result = await getResultByToken(token);
      return result ? res.status(200).json(result) : res.status(404).json({ error: "Resultado não encontrado." });
    }
    if (req.method === "POST" && action === "webhook") return handleWebhook(req, res);
    if (!authorized(req)) return res.status(401).json({ error: "Não autorizado." });
    if (req.method === "GET" && (!action || action === "process")) {
      return res.status(200).json({ processed: await processDueTestDeliveries(10) });
    }
    if (req.method === "POST" && action === "test-enroll") {
      const body = JSON.parse(await rawBody(req) || "{}");
      return res.status(200).json(await enrollTestAssessment(cleanText(body.assessmentId, 80)));
    }
    if (req.method === "POST" && action === "test-step") {
      const body = JSON.parse(await rawBody(req) || "{}");
      const step = Number(body.step);
      if (!Number.isInteger(step) || step < 0 || step > 3) return res.status(400).json({ error: "Step inválido." });
      return res.status(200).json({ processed: await makeTestStepDue(cleanText(body.assessmentId, 80), step) });
    }
    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error("Email sequence error", error);
    return res.status(500).json({ error: String(error.message || error).slice(0, 2000) });
  }
}

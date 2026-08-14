import {
  applySecurityHeaders,
  checkRateLimit,
  cleanText,
  parseBody,
  requireAllowedOrigin,
  requireJson,
  requirePost,
} from "../server/_security.js";
import { getStripeCheckoutSession, isPaidStripeSession } from "../server/_stripe.js";
import { adminRpc, adminUpdateWhere } from "../server/_admin.js";

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, "payment-status", 20, 10 * 60 * 1000)
  ) {
    return;
  }

  try {
    const body = parseBody(req);
    const paymentId = cleanText(body.paymentId, 100);
    const sessionId = cleanText(body.sessionId, 100);

    if (!paymentId || !sessionId) {
      return res.status(400).json({ error: "Pagamento não identificado." });
    }

    const payment = await getStripeCheckoutSession(paymentId);

    if ((payment.client_reference_id || payment.metadata?.session_id) !== sessionId) {
      return res.status(403).json({ error: "Pagamento não corresponde a esta sessão." });
    }

    const paid = isPaidStripeSession(payment);
    const now = new Date().toISOString();
    const leadUpdate = {
      sessionId,
      stripeCheckoutSessionId: payment.id,
      stripeCustomerId: payment.customer || null,
      stripePaymentIntentId: payment.payment_intent || null,
      paymentStatus: payment.payment_status || payment.status,
      paymentUrl: payment.url || "",
      lastSeenAt: now,
    };

    if (paid) {
      leadUpdate.purchaseStatus = "purchased";
      leadUpdate.purchasedPackage = true;
      leadUpdate.packagePurchasedAt = now;
      leadUpdate.paymentConfirmedAt = now;
    }

    try {
      const updatedLeads = await adminUpdateWhere("leads", [["session_id", "eq", sessionId]], leadUpdate);
      if (!updatedLeads?.length) throw new Error("Lead do pagamento não encontrado.");
      if (paid) await Promise.all(updatedLeads.map((lead) => adminRpc("cancel_post_diagnostic_for_lead", { p_lead_id: lead.id, p_reason: "purchase" })));
    } catch (error) {
      console.error("Payment status lead update error", error);
      return res.status(503).json({ error: "Pagamento confirmado, mas a liberação ainda está sendo sincronizada." });
    }

    return res.status(200).json({
      paid,
      status: payment.payment_status || payment.status,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Payment status error", error);
    return res.status(500).json({ error: "Não foi possível verificar o pagamento agora." });
  }
}

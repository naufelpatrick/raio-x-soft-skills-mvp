import {
  applySecurityHeaders,
  checkRateLimit,
  cleanText,
  parseBody,
  requireAllowedOrigin,
  requireJson,
  requirePost,
} from "../server/_security.js";
import { getAsaasPayment, isPaidAsaasStatus } from "../server/_asaas.js";
import { updateSupabaseRecord } from "../server/_supabase.js";

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

    const payment = await getAsaasPayment(paymentId);

    if (payment.externalReference && payment.externalReference !== sessionId) {
      return res.status(403).json({ error: "Pagamento não corresponde a esta sessão." });
    }

    const paid = isPaidAsaasStatus(payment.status);
    const now = new Date().toISOString();
    const leadUpdate = {
      sessionId,
      asaasPaymentId: payment.id,
      asaasCustomerId: payment.customer,
      paymentStatus: payment.status,
      paymentUrl: payment.invoiceUrl || payment.bankSlipUrl || "",
      lastSeenAt: now,
    };

    if (paid) {
      leadUpdate.purchaseStatus = "purchased";
      leadUpdate.purchasedPackage = true;
      leadUpdate.packagePurchasedAt = now;
      leadUpdate.paymentConfirmedAt = now;
    }

    try {
      await updateSupabaseRecord("leads", leadUpdate, "session_id", sessionId);
      await updateSupabaseRecord("leads", leadUpdate, "asaas_payment_id", payment.id);
    } catch (error) {
      console.error("Payment status lead update error", error);
    }

    return res.status(200).json({
      paid,
      status: payment.status,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Payment status error", error);
    return res.status(500).json({ error: "Não foi possível verificar o pagamento agora." });
  }
}

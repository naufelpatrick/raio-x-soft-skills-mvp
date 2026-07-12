import { applySecurityHeaders, parseBody, requirePost } from "./_security.js";
import { extractWebhookToken, isPaidAsaasStatus } from "./_asaas.js";
import { updateSupabaseRecord } from "./_supabase.js";

const paidEvents = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "PAYMENT_RECEIVED_IN_CASH"]);

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (!requirePost(req, res)) {
    return;
  }

  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (expectedToken) {
    const receivedToken = extractWebhookToken(req);
    if (receivedToken !== expectedToken) {
      return res.status(401).json({ error: "Webhook não autorizado." });
    }
  }

  try {
    const body = parseBody(req);
    const event = String(body.event || "").toUpperCase();
    const payment = body.payment || {};
    const paymentId = payment.id;
    const sessionId = payment.externalReference;
    const status = payment.status || event;

    if (!paymentId) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const now = new Date().toISOString();
    const paid = paidEvents.has(event) || isPaidAsaasStatus(status);
    const leadUpdate = {
      sessionId,
      asaasPaymentId: paymentId,
      asaasCustomerId: payment.customer,
      paymentStatus: status,
      paymentUrl: payment.invoiceUrl || payment.bankSlipUrl || "",
      lastSeenAt: now,
    };

    if (paid) {
      leadUpdate.purchaseStatus = "purchased";
      leadUpdate.purchasedPackage = true;
      leadUpdate.packagePurchasedAt = now;
      leadUpdate.paymentConfirmedAt = now;
    }

    const updateTargets = [
      ["asaas_payment_id", paymentId],
      ["session_id", sessionId],
    ].filter(([, value]) => Boolean(value));

    for (const [column, value] of updateTargets) {
      try {
        await updateSupabaseRecord("leads", leadUpdate, column, value);
      } catch (error) {
        console.error("Asaas webhook lead update error", { column, error });
      }
    }

    return res.status(200).json({ received: true, paid, event, status });
  } catch (error) {
    console.error("Asaas webhook error", error);
    return res.status(200).json({ received: true, error: "Webhook recebido, mas não processado." });
  }
}

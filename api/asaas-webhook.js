import { applySecurityHeaders, parseBody, requirePost } from "../server/_security.js";
import { extractWebhookToken, isPaidAsaasStatus } from "../server/_asaas.js";
import { adminInsert, adminRpc, adminUpdateWhere } from "../server/_admin.js";

const paidEvents = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "PAYMENT_RECEIVED_IN_CASH"]);

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (!requirePost(req, res)) {
    return;
  }

  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expectedToken) {
    return res.status(503).json({ error: "Webhook não configurado." });
  }
  const receivedToken = extractWebhookToken(req);
  if (receivedToken !== expectedToken) {
    return res.status(401).json({ error: "Webhook não autorizado." });
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
      paymentCreatedAt: payment.dateCreated || now,
      packageRequestedAt: payment.dateCreated || now,
      lastSeenAt: now,
    };

    if (paid) {
      leadUpdate.purchaseStatus = "purchased";
      leadUpdate.purchasedPackage = true;
      leadUpdate.packagePurchasedAt = now;
      leadUpdate.paymentConfirmedAt = now;
    }

    try {
      await adminInsert("payment_webhook_events", {
        provider: "asaas",
        external_event_id: body.id || null,
        event_type: event || status,
        payment_id: paymentId,
        payload: {
          event,
          payment: {
            id: paymentId,
            status,
            externalReference: sessionId || null,
            customer: payment.customer || null,
            value: payment.value || null,
            billingType: payment.billingType || null,
            confirmedDate: payment.confirmedDate || null,
            paymentDate: payment.paymentDate || null,
          },
        },
        processed: false,
      });
    } catch (error) {
      // Eventos repetidos são idempotentes pelo external_event_id.
      if (!String(error).includes("409")) console.error("Asaas webhook audit error", error);
    }

    try {
      const filters = sessionId
        ? [["session_id", "eq", sessionId]]
        : [["asaas_payment_id", "eq", paymentId]];
      const updatedLeads = await adminUpdateWhere("leads", filters, leadUpdate);
      if (!updatedLeads?.length) throw new Error("Nenhum lead corresponde ao pagamento do ASAAS.");
      if (paid) await Promise.all(updatedLeads.map((lead) => adminRpc("cancel_post_diagnostic_for_lead", { p_lead_id: lead.id, p_reason: "purchase" })));
      if (body.id) {
        await adminUpdateWhere("payment_webhook_events", [["external_event_id", "eq", body.id]], {
          processed: true,
          processed_at: now,
          processing_error: null,
        });
      }
    } catch (error) {
      console.error("Asaas webhook lead update error", error);
      if (body.id) {
        try {
          await adminUpdateWhere("payment_webhook_events", [["external_event_id", "eq", body.id]], {
            processed: false,
            processing_error: String(error).slice(0, 500),
          });
        } catch (auditError) {
          console.error("Asaas webhook processing audit error", auditError);
        }
      }
      return res.status(500).json({ received: true, processed: false });
    }

    return res.status(200).json({ received: true, paid, event, status });
  } catch (error) {
    console.error("Asaas webhook error", error);
    return res.status(200).json({ received: true, error: "Webhook recebido, mas não processado." });
  }
}

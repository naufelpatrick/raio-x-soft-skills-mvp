import { applySecurityHeaders, requirePost } from "../server/_security.js";
import { isPaidStripeSession, readRawBody, verifyStripeWebhook } from "../server/_stripe.js";
import { adminInsert, adminRpc, adminUpdateWhere } from "../server/_admin.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (!requirePost(req, res)) return;

  let event;
  try {
    event = verifyStripeWebhook(await readRawBody(req), req.headers["stripe-signature"]);
  } catch (error) {
    console.error("Stripe webhook signature error", error);
    return res.status(400).json({ error: "Assinatura do webhook inválida." });
  }

  const checkoutEvents = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ]);
  if (!checkoutEvents.has(event.type)) return res.status(200).json({ received: true, ignored: true });

  const session = event.data?.object || {};
  const sessionId = session.client_reference_id || session.metadata?.session_id;
  const paid = isPaidStripeSession(session) || event.type === "checkout.session.async_payment_succeeded";
  const now = new Date().toISOString();
  const status = paid ? "paid" : (session.payment_status || session.status || event.type);
  const leadUpdate = {
    stripeCheckoutSessionId: session.id,
    stripeCustomerId: session.customer || null,
    stripePaymentIntentId: session.payment_intent || null,
    paymentStatus: status,
    paymentUrl: session.url || "",
    paymentCreatedAt: session.created ? new Date(session.created * 1000).toISOString() : now,
    packageRequestedAt: session.created ? new Date(session.created * 1000).toISOString() : now,
    lastSeenAt: now,
  };
  if (paid) Object.assign(leadUpdate, {
    purchaseStatus: "purchased",
    purchasedPackage: true,
    packagePurchasedAt: now,
    paymentConfirmedAt: now,
  });

  try {
    await adminInsert("payment_webhook_events", {
      provider: "stripe",
      externalEventId: event.id,
      eventType: event.type,
      paymentId: session.id,
      payload: {
        eventType: event.type,
        checkoutSession: {
          id: session.id,
          paymentStatus: session.payment_status || null,
          status: session.status || null,
          clientReferenceId: sessionId || null,
          customer: session.customer || null,
          paymentIntent: session.payment_intent || null,
          amountTotal: session.amount_total || null,
          currency: session.currency || null,
        },
      },
      processed: false,
    });
  } catch (error) {
    if (!String(error).includes("409")) console.error("Stripe webhook audit error", error);
  }

  try {
    const filters = sessionId
      ? [["session_id", "eq", sessionId]]
      : [["stripe_checkout_session_id", "eq", session.id]];
    const updatedLeads = await adminUpdateWhere("leads", filters, leadUpdate);
    if (!updatedLeads?.length) throw new Error("Nenhum lead corresponde à sessão da Stripe.");
    if (paid) await Promise.all(updatedLeads.map((lead) => adminRpc("cancel_post_diagnostic_for_lead", { p_lead_id: lead.id, p_reason: "purchase" })));
    await adminUpdateWhere("payment_webhook_events", [["external_event_id", "eq", event.id]], {
      processed: true,
      processedAt: now,
      processingError: null,
    });
  } catch (error) {
    console.error("Stripe webhook processing error", error);
    await adminUpdateWhere("payment_webhook_events", [["external_event_id", "eq", event.id]], {
      processed: false,
      processingError: String(error).slice(0, 500),
    }).catch(() => {});
    return res.status(500).json({ received: true, processed: false });
  }

  return res.status(200).json({ received: true, paid, event: event.type, status });
}

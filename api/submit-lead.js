import {
  applySecurityHeaders,
  checkRateLimit,
  cleanText,
  parseBody,
  requireAllowedOrigin,
  requireJson,
  requirePost,
} from "../server/_security.js";
import { adminSelect, adminUpdateWhere, adminUpsert } from "../server/_admin.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedPurchaseStatus = new Set(["not_purchased", "requested", "purchased"]);
function cleanExperiments(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([id, variant]) => /^[a-z0-9_]{1,80}$/.test(id) && ["A", "B"].includes(variant))
    .slice(0, 10));
}

export default async function handler(req, res) {
  applySecurityHeaders(res);

  const isUnsubscribe = req.query?.action === "unsubscribe";

  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, isUnsubscribe ? "unsubscribe" : "lead", isUnsubscribe ? 10 : 15, 10 * 60 * 1000)
  ) {
    return;
  }

  try {
    const body = parseBody(req);
    if (isUnsubscribe) {
      const token = cleanText(body.token, 80);
      if (!uuidPattern.test(token)) {
        return res.status(400).json({ error: "Link de descadastro inválido." });
      }

      const matches = await adminSelect("leads", {
        select: "email",
        filters: [["unsubscribe_token", "eq", token]],
        limit: 1,
      });
      const email = matches?.[0]?.email;
      if (!email) return res.status(200).json({ unsubscribed: true });

      const unsubscribedAt = new Date().toISOString();
      await adminUpdateWhere("leads", [["email", "eq", email.toLowerCase()]], {
        marketing_consent: false,
        unsubscribe_at: unsubscribedAt,
        last_seen_at: unsubscribedAt,
      });
      return res.status(200).json({ unsubscribed: true });
    }

    const purchaseStatus = cleanText(body.purchaseStatus, 40) || "not_purchased";
    const now = new Date().toISOString();
    const lead = {
      sessionId: cleanText(body.sessionId, 100),
      name: cleanText(body.name, 120),
      email: cleanText(body.email, 254).toLowerCase(),
      whatsapp: cleanText(body.whatsapp, 40),
      contactConsent: body.contactConsent === true,
      marketingConsent: body.marketingConsent === true,
      marketingConsentAt: body.marketingConsent === true ? now : null,
      marketingConsentSource: body.marketingConsent === true ? "profile_form" : null,
      instrumentVersion: cleanText(body.instrumentVersion, 20) || null,
      assessmentStartedAt: now,
      age: cleanText(body.age, 20),
      experience: cleanText(body.experience, 80),
      currentRole: cleanText(body.currentRole, 120),
      professionalLevel: cleanText(body.professionalLevel, 80),
      mainArea: cleanText(body.mainArea, 80),
      careerGoal: cleanText(body.careerGoal, 1000),
      currentChallenge: cleanText(body.currentChallenge, 1000),
      purchaseStatus,
      experiments: cleanExperiments(body.experiments),
      lastSeenAt: now,
    };

    if (purchaseStatus === "requested") {
      lead.packageRequestedAt = now;
    }

    if (purchaseStatus === "purchased") {
      lead.purchasedPackage = true;
      lead.packagePurchasedAt = now;
    }

    if (
      !lead.sessionId ||
      !lead.name ||
      !emailPattern.test(lead.email) ||
      !lead.contactConsent ||
      !allowedPurchaseStatus.has(lead.purchaseStatus)
    ) {
      return res.status(400).json({ error: "Lead incompleto ou inválido." });
    }

    try {
      const records = await adminUpsert("leads", lead, "session_id");
      return res.status(201).json({ received: true, saved: true, leadId: records?.[0]?.id || null });
    } catch (storageError) {
      console.error("Lead Supabase error", storageError);
      return res.status(503).json({ error: "Não foi possível registrar o lead." });
    }
  } catch (error) {
    console.error("Lead error", error);
    return res.status(400).json({ error: "Não foi possível registrar o lead." });
  }
}

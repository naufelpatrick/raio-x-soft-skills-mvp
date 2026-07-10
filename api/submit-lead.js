import {
  applySecurityHeaders,
  checkRateLimit,
  cleanText,
  parseBody,
  requireAllowedOrigin,
  requireJson,
  requirePost,
} from "./_security.js";
import { insertSupabaseRecord, updateSupabaseRecord } from "./_supabase.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPurchaseStatus = new Set(["not_purchased", "requested", "purchased"]);

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (
    !requirePost(req, res) ||
    !requireJson(req, res) ||
    !requireAllowedOrigin(req, res) ||
    !checkRateLimit(req, res, "lead", 15, 10 * 60 * 1000)
  ) {
    return;
  }

  try {
    const body = parseBody(req);
    const purchaseStatus = cleanText(body.purchaseStatus, 40) || "not_purchased";
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
      purchaseStatus,
      purchasedPackage: purchaseStatus === "purchased",
      lastSeenAt: now,
    };

    if (purchaseStatus === "requested") {
      lead.packageRequestedAt = now;
    }

    if (purchaseStatus === "purchased") {
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

    let saved = false;
    try {
      const supabaseResult =
        purchaseStatus === "not_purchased"
          ? await insertSupabaseRecord("leads", lead)
          : await updateSupabaseRecord("leads", lead, "session_id", lead.sessionId);
      saved = Boolean(supabaseResult.saved);
    } catch (storageError) {
      if (purchaseStatus === "not_purchased" && String(storageError).includes("409")) {
        try {
          const supabaseResult = await updateSupabaseRecord("leads", lead, "session_id", lead.sessionId);
          saved = Boolean(supabaseResult.saved);
        } catch (updateError) {
          console.error("Lead Supabase update error", updateError);
        }
      } else {
        console.error("Lead Supabase error", storageError);
      }
    }

    return res.status(201).json({ received: true, saved });
  } catch (error) {
    console.error("Lead error", error);
    return res.status(400).json({ error: "Não foi possível registrar o lead." });
  }
}

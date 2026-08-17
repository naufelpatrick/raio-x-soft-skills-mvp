import { Resend } from "resend";
import {
  adminInsert,
  adminInsertIgnore,
  adminRpc,
  adminSelect,
  adminUpdateWhere,
  adminUpsert,
} from "./_admin.js";
import { buildPostDiagnosticEmail } from "./email-templates.js";

export const SEQUENCE_KEY = "post_diagnostic_v1";
export const AUTHORIZED_TEST_EMAIL = "patricknaufel@hotmail.com";
const OFFSETS_MS = [0, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000];

function exactTestRecipient() {
  return String(process.env.TEST_EMAIL_RECIPIENT || "").trim().toLowerCase();
}

function normalizedEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function findExistingEnrollmentByEmail(recipientEmail) {
  const matchingLeads = await adminSelect("leads", {
    select: "id",
    filters: [["email", "eq", recipientEmail]],
    limit: 100,
  });
  const enrollmentGroups = await Promise.all((matchingLeads || []).map((matchingLead) => adminSelect("email_sequence_enrollments", {
    select: "id,lead_id,assessment_id,status",
    filters: [["lead_id", "eq", matchingLead.id], ["sequence_key", "eq", SEQUENCE_KEY]],
    limit: 1,
  })));
  return enrollmentGroups.flat().find(Boolean) || null;
}

export function assertSafeEmailMode({ testOnly = false } = {}) {
  const mode = process.env.EMAIL_SEQUENCE_MODE;
  if (!new Set(["test", "live"]).has(mode)) throw new Error("EMAIL_SEQUENCE_MODE_DISABLED");
  if (process.env.EMAIL_SEQUENCE_DEDUPE_READY !== "true") throw new Error("EMAIL_SEQUENCE_DEDUPE_NOT_READY");
  if (testOnly && mode !== "test") throw new Error("TEST_OPERATION_BLOCKED");
  if (mode === "test") {
    if (exactTestRecipient() !== AUTHORIZED_TEST_EMAIL) throw new Error("TEST_EMAIL_RECIPIENT_NOT_AUTHORIZED");
    return AUTHORIZED_TEST_EMAIL;
  }
  return null;
}

function isPurchased(lead) {
  return lead.purchased_package === true
    || lead.purchase_status === "purchased"
    || Boolean(lead.payment_confirmed_at)
    || Boolean(lead.package_purchased_at);
}

function isCommerciallyEligible(lead, assessment) {
  return Boolean(
    assessment?.completed_at
    && lead?.email
    && lead.marketing_consent === true
    && lead.marketing_consent_at
    && !lead.unsubscribe_at
    && !lead.email_suppressed_at
    && !isPurchased(lead)
  );
}

async function recordSequenceEvent(lead, assessment, eventName, step, metadata = {}) {
  await adminInsert("product_events", {
    eventName,
    anonymousUserId: lead.session_id,
    assessmentId: assessment.id,
    sessionId: lead.session_id,
    pagePath: "/email/post-diagnostic",
    metadata: { sequence: SEQUENCE_KEY, step, instrument_version: assessment.instrument_version, ...metadata },
  }).catch(() => {});
}

export async function enrollAssessment(assessmentId, { testOnly = false } = {}) {
  const allowedEmail = assertSafeEmailMode({ testOnly });
  const assessments = await adminSelect("assessments", {
    select: "id,lead_id,session_id,instrument_version,completed_at",
    filters: [["id", "eq", assessmentId]],
    limit: 1,
  });
  const assessment = assessments?.[0];
  if (!assessment?.completed_at || !assessment.lead_id) throw new Error("ASSESSMENT_NOT_ELIGIBLE");

  const leads = await adminSelect("leads", {
    select: "id,session_id,name,email,marketing_consent,marketing_consent_at,unsubscribe_at,result_access_token,email_suppressed_at,purchased_package,purchase_status,payment_confirmed_at,package_purchased_at",
    filters: [["id", "eq", assessment.lead_id], ...(allowedEmail ? [["email", "eq", allowedEmail]] : [])],
    limit: 1,
  });
  const lead = leads?.[0];
  if (!lead || isPurchased(lead) || lead.unsubscribe_at || lead.email_suppressed_at) throw new Error("TEST_LEAD_NOT_ELIGIBLE");

  const recipientEmail = normalizedEmail(lead.email);
  const dedupeKey = `${SEQUENCE_KEY}:${recipientEmail}`;
  const existingEnrollment = await findExistingEnrollmentByEmail(recipientEmail);
  if (existingEnrollment) {
    await recordSequenceEvent(lead, assessment, "post_diagnostic_email_duplicate_blocked", -1, { recipient_email: recipientEmail });
    return { enrollmentId: existingEnrollment.id, lead, assessment, steps: [], duplicate: true };
  }

  const enrollments = await adminInsertIgnore("email_sequence_enrollments", {
    leadId: lead.id,
    assessmentId: assessment.id,
    sequenceKey: SEQUENCE_KEY,
    recipientEmail,
    dedupeKey,
    status: "active",
    updatedAt: new Date().toISOString(),
  }, "dedupe_key");
  const enrollment = enrollments?.[0];
  if (!enrollment?.id) {
    await recordSequenceEvent(lead, assessment, "post_diagnostic_email_duplicate_blocked", -1, { recipient_email: recipientEmail });
    return { enrollmentId: null, lead, assessment, steps: [], duplicate: true };
  }

  const completedAt = new Date(assessment.completed_at).getTime();
  const steps = lead.marketing_consent === true && lead.marketing_consent_at ? [0, 1, 2, 3] : [0];
  for (const step of steps) {
    await adminUpsert("email_deliveries", {
      enrollmentId: enrollment.id,
      leadId: lead.id,
      assessmentId: assessment.id,
      sequenceKey: SEQUENCE_KEY,
      step,
      scheduledAt: new Date(completedAt + OFFSETS_MS[step]).toISOString(),
      status: "pending",
      provider: "resend",
      updatedAt: new Date().toISOString(),
    }, "assessment_id,sequence_key,step");
    await recordSequenceEvent(lead, assessment, "post_diagnostic_email_scheduled", step);
  }

  return { enrollmentId: enrollment.id, lead, assessment, steps, duplicate: false };
}

export function enrollTestAssessment(assessmentId) {
  return enrollAssessment(assessmentId, { testOnly: true });
}

async function cancelDelivery(delivery, lead, reason) {
  const status = reason === "purchase" ? "cancelled_purchase" : "cancelled_unsubscribe";
  await adminUpdateWhere("email_deliveries", [["id", "eq", delivery.id]], {
    status,
    error: reason,
    processingStartedAt: null,
    updatedAt: new Date().toISOString(),
  });
  await adminRpc("cancel_post_diagnostic_for_lead", { p_lead_id: lead.id, p_reason: reason });
  return { id: delivery.id, step: delivery.step, status };
}

async function cancelDuplicateDelivery(delivery) {
  const now = new Date().toISOString();
  await adminUpdateWhere("email_deliveries", [["id", "eq", delivery.id]], {
    status: "cancelled_duplicate",
    error: "duplicate_recipient_sequence_step",
    processingStartedAt: null,
    updatedAt: now,
  });
  return { id: delivery.id, step: delivery.step, status: "cancelled_duplicate" };
}

async function sendClaimedDelivery(delivery) {
  const allowedEmail = assertSafeEmailMode();
  const [leads, assessments, enrollments] = await Promise.all([
    adminSelect("leads", {
      select: "id,session_id,name,email,marketing_consent,marketing_consent_at,unsubscribe_at,unsubscribe_token,result_access_token,email_suppressed_at,purchased_package,purchase_status,payment_confirmed_at,package_purchased_at",
      filters: [["id", "eq", delivery.lead_id], ...(allowedEmail ? [["email", "eq", allowedEmail]] : [])], limit: 1,
    }),
    adminSelect("assessments", {
      select: "id,instrument_version,completed_at", filters: [["id", "eq", delivery.assessment_id]], limit: 1,
    }),
    adminSelect("email_sequence_enrollments", {
      select: "id,status,recipient_email,dedupe_key", filters: [["id", "eq", delivery.enrollment_id]], limit: 1,
    }),
  ]);
  const lead = leads?.[0];
  const assessment = assessments?.[0];
  const enrollment = enrollments?.[0];
  if (!lead || !assessment?.completed_at) throw new Error("DELIVERY_RELATION_NOT_FOUND");
  const recipientEmail = normalizedEmail(lead.email);
  if (!enrollment || enrollment.status !== "active" || enrollment.dedupe_key !== `${SEQUENCE_KEY}:${recipientEmail}`) {
    return cancelDuplicateDelivery(delivery);
  }
  if (isPurchased(lead)) return cancelDelivery(delivery, lead, "purchase");
  if (lead.unsubscribe_at || lead.email_suppressed_at) return cancelDelivery(delivery, lead, "unsubscribe");
  if (delivery.step > 0 && !isCommerciallyEligible(lead, assessment)) return cancelDelivery(delivery, lead, "unsubscribe");
  if (allowedEmail && lead.email.toLowerCase() !== AUTHORIZED_TEST_EMAIL) throw new Error("RECIPIENT_BLOCKED_BY_TEST_MODE");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("RESEND_NOT_CONFIGURED");
  const template = buildPostDiagnosticEmail({
    step: delivery.step,
    name: lead.name,
    resultToken: lead.result_access_token,
    unsubscribeToken: lead.unsubscribe_token,
  });
  const resend = new Resend(apiKey);
  const idempotencyKey = `raiox:${SEQUENCE_KEY}:${recipientEmail}:${delivery.step}`;
  const { data, error } = await resend.emails.send({
    from,
    to: [allowedEmail || lead.email],
    replyTo: "info@raioxdodesigner.com",
    subject: template.subject,
    html: template.html,
    tags: [
      { name: "sequence", value: SEQUENCE_KEY },
      { name: "step", value: String(delivery.step) },
      { name: "instrument_version", value: String(assessment.instrument_version || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_") },
    ],
  }, { idempotencyKey });
  if (error || !data?.id) throw new Error(`RESEND_SEND_ERROR: ${JSON.stringify(error || {})}`);

  const now = new Date().toISOString();
  await adminUpdateWhere("email_deliveries", [["id", "eq", delivery.id]], {
    status: "sent",
    sentAt: now,
    providerMessageId: data.id,
    error: null,
    processingStartedAt: null,
    updatedAt: now,
  });
  await recordSequenceEvent(lead, assessment, "post_diagnostic_email_sent", delivery.step, { provider: "resend" });
  return { id: delivery.id, step: delivery.step, status: "sent", providerMessageId: data.id, subject: template.subject, sentAt: now };
}

export async function processDueTestDeliveries(limit = 10) {
  const allowedEmail = assertSafeEmailMode();
  const claimed = await adminRpc("claim_due_email_deliveries", { p_limit: limit, p_allowed_email: allowedEmail }) || [];
  const results = [];
  for (const delivery of claimed) {
    try {
      results.push(await sendClaimedDelivery(delivery));
    } catch (error) {
      const terminal = Number(delivery.attempt_count || 0) >= 3;
      const nextStatus = terminal ? "failed" : "pending";
      const now = new Date();
      await adminUpdateWhere("email_deliveries", [["id", "eq", delivery.id]], {
        status: nextStatus,
        scheduledAt: terminal ? delivery.scheduled_at : new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        failedAt: terminal ? now.toISOString() : null,
        error: String(error.message || error).slice(0, 2000),
        processingStartedAt: null,
        updatedAt: now.toISOString(),
      });
      results.push({ id: delivery.id, step: delivery.step, status: nextStatus, error: String(error.message || error) });
    }
  }
  return results;
}

export async function makeTestStepDue(assessmentId, step) {
  assertSafeEmailMode({ testOnly: true });
  const deliveries = await adminUpdateWhere("email_deliveries", [
    ["assessment_id", "eq", assessmentId], ["sequence_key", "eq", SEQUENCE_KEY], ["step", "eq", step],
  ], { scheduledAt: new Date().toISOString(), status: "pending", error: null, updatedAt: new Date().toISOString() });
  if (!deliveries?.length) throw new Error("TEST_DELIVERY_NOT_FOUND");
  return processDueTestDeliveries(1);
}

export async function getResultByToken(token) {
  const leads = await adminSelect("leads", {
    select: "id,session_id,name,email,whatsapp,contact_consent,age,experience,current_role,professional_level,main_area,career_goal,current_challenge,purchase_status,purchased_package",
    filters: [["result_access_token", "eq", token]], limit: 1,
  });
  const lead = leads?.[0];
  if (!lead) return null;
  const assessments = await adminSelect("assessments", {
    select: "id,instrument_version,answers,open_answers,competency_scores,general_score,completed_at",
    filters: [["lead_id", "eq", lead.id]], order: "completed_at.desc", limit: 1,
  });
  const assessment = assessments?.[0];
  if (!assessment) return null;
  const answers = Object.fromEntries((assessment.answers || []).map((item) => [item.statementId || item.statement_id, item.rawValue ?? item.raw_value ?? item.value]));
  Object.assign(answers, assessment.open_answers || {});
  return {
    assessmentId: assessment.id,
    instrumentVersion: assessment.instrument_version,
    profileData: {
      sessionId: lead.session_id, name: lead.name, email: lead.email, whatsapp: lead.whatsapp,
      contactConsent: lead.contact_consent, age: lead.age, experience: lead.experience,
      currentRole: lead.current_role, professionalLevel: lead.professional_level, mainArea: lead.main_area,
      careerGoal: lead.career_goal, currentChallenge: lead.current_challenge,
      purchaseStatus: lead.purchase_status, purchasedPackage: lead.purchased_package,
    },
    answers,
    scores: assessment.competency_scores || [],
  };
}

export async function cancelLeadSequence(leadId, reason) {
  return adminRpc("cancel_post_diagnostic_for_lead", { p_lead_id: leadId, p_reason: reason });
}

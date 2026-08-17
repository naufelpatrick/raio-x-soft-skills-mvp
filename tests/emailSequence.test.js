import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildPostDiagnosticEmail, POST_DIAGNOSTIC_SUBJECTS } from "../server/email-templates.js";

const migrationUrl = new URL("../supabase/migrations/202608103-post-diagnostic-email-sequence.sql", import.meta.url);
const sequenceUrl = new URL("../server/email-sequence.js", import.meta.url);
const recipientDedupeMigrationUrl = new URL("../supabase/migrations/202608104-email-sequence-recipient-dedupe.sql", import.meta.url);
const appUrl = new URL("../src/App.jsx", import.meta.url);
const submitAssessmentUrl = new URL("../api/submit-assessment.js", import.meta.url);
const supabaseUrl = new URL("../server/_supabase.js", import.meta.url);

test("quatro templates possuem assuntos, CTAs seguros e unsubscribe comercial", () => {
  const token = "11111111-1111-4111-8111-111111111111";
  POST_DIAGNOSTIC_SUBJECTS.forEach((subject, step) => {
    const email = buildPostDiagnosticEmail({ step, name: "Patrick Naufel", resultToken: token, unsubscribeToken: token });
    assert.equal(email.subject, subject);
    assert.match(email.html, /Olá, Patrick\./);
    assert.match(email.html, /raio-x-logo-email\.png/);
    assert.match(email.ctaUrl, /^https:\/\/www\.raioxdodesigner\.com\/resultado\?token=/);
    if (step === 0) assert.doesNotMatch(email.html, /Não quero mais receber/);
    else assert.match(email.html, /Não quero mais receber estes e-mails/);
  });
});

test("fallback de nome nunca produz undefined ou null", () => {
  for (const name of [undefined, null, ""]) {
    const email = buildPostDiagnosticEmail({ step: 0, name, resultToken: "token", unsubscribeToken: "token" });
    assert.match(email.html, />Olá\.<\/p>/);
    assert.doesNotMatch(email.html, /Olá, (undefined|null)/);
  }
});

test("banco impede duplicidade por assessment, sequência e step", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /unique \(assessment_id, sequence_key, step\)/i);
  assert.match(sql, /for update of delivery skip locked/i);
  assert.match(sql, /email_suppressed_at is null/i);
});

test("modo de teste bloqueia destinatários diferentes do autorizado", async () => {
  const source = await readFile(sequenceUrl, "utf8");
  assert.match(source, /patricknaufel@hotmail\.com/);
  assert.match(source, /TEST_EMAIL_RECIPIENT_NOT_AUTHORIZED/);
  assert.match(source, /RECIPIENT_BLOCKED_BY_TEST_MODE/);
  assert.match(source, /EMAIL_SEQUENCE_DEDUPE_NOT_READY/);
  assert.match(source, /IdempotencyKey|idempotencyKey/);
  assert.doesNotMatch(source, /VITE_RESEND_API_KEY/);
});

test("régua bloqueia nova inscrição para o mesmo e-mail", async () => {
  const [sql, source] = await Promise.all([
    readFile(recipientDedupeMigrationUrl, "utf8"),
    readFile(sequenceUrl, "utf8"),
  ]);
  assert.match(sql, /create unique index[\s\S]*dedupe_key/i);
  assert.match(sql, /lower\(btrim\(lead\.email\)\)/i);
  assert.match(source, /adminInsertIgnore\("email_sequence_enrollments"/);
  assert.match(source, /findExistingEnrollmentByEmail\(recipientEmail\)/);
  assert.match(source, /filters: \[\["email", "eq", recipientEmail\]\]/);
  assert.match(source, /post_diagnostic_email_duplicate_blocked/);
  assert.match(source, /duplicate: true/);
  assert.doesNotMatch(source, /schema cache[\s\S]*adminUpsert\("email_sequence_enrollments"/i);
  assert.match(source, /raiox:\$\{SEQUENCE_KEY\}:\$\{recipientEmail\}:\$\{delivery\.step\}/);
});

test("conclusão da avaliação bloqueia cliques repetidos enquanto salva", async () => {
  const source = await readFile(appUrl, "utf8");
  assert.match(source, /completionInFlight\.current/);
  assert.match(source, /disabled=\{!stepAnswered\(\) \|\| completing\}/);
  assert.match(source, /Gerando diagnóstico\.\.\./);
});

test("a mesma conclusão reutiliza um identificador idempotente", async () => {
  const [app, api, supabase] = await Promise.all([
    readFile(appUrl, "utf8"),
    readFile(submitAssessmentUrl, "utf8"),
    readFile(supabaseUrl, "utf8"),
  ]);
  assert.match(app, /assessmentSubmissionId/);
  assert.match(app, /submissionId: assessmentSubmissionId/);
  assert.match(api, /requestedSubmissionId/);
  assert.match(api, /insertSupabaseRecordIgnore\("assessments"/);
  assert.match(supabase, /resolution=ignore-duplicates/);
});

test("migração cancela fila duplicada e o claim aceita apenas a inscrição canônica", async () => {
  const sql = await readFile(recipientDedupeMigrationUrl, "utf8");
  assert.match(sql, /cancelled_duplicate/i);
  assert.match(sql, /duplicate_recipient_sequence_step/i);
  assert.match(sql, /delivery\.status in \('pending','processing'\)/i);
  assert.match(sql, /enrollment\.status = 'active'/i);
  assert.match(sql, /enrollment\.dedupe_key = enrollment\.sequence_key \|\| ':' \|\| lower\(btrim\(lead\.email\)\)/i);
});

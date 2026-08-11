import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildPostDiagnosticEmail, POST_DIAGNOSTIC_SUBJECTS } from "../server/email-templates.js";

const migrationUrl = new URL("../supabase/migrations/202608103-post-diagnostic-email-sequence.sql", import.meta.url);
const sequenceUrl = new URL("../server/email-sequence.js", import.meta.url);

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
  assert.match(source, /IdempotencyKey|idempotencyKey/);
  assert.doesNotMatch(source, /VITE_RESEND_API_KEY/);
});

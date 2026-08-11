import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL("../supabase/migrations/202608101-lead-recovery-infrastructure.sql", import.meta.url);
const checkoutMigrationUrl = new URL("../supabase/migrations/202608102-checkout-started-lifecycle.sql", import.meta.url);

test("consentimento começa desativado e nunca é promovido automaticamente", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /marketing_consent boolean not null default false/i);
  assert.doesNotMatch(sql, /set\s+marketing_consent\s*=\s*true/i);
});

test("view expõe todas as etapas do lifecycle futuro", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  for (const field of [
    "as diagnostic_started",
    "as diagnostic_completed",
    "as result_viewed",
    "as checkout_started",
    "as purchase_completed",
    "as completed_not_purchased",
    "as unsubscribed",
  ]) assert.ok(sql.includes(field), `Etapa ausente: ${field}`);
});

test("compra ou unsubscribe retiram imediatamente da elegibilidade", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  const eligibility = sql.slice(sql.indexOf("assessment.completed_at is not null", sql.indexOf("end as conversion_status")));
  assert.match(eligibility, /lead\.unsubscribe_at is null/i);
  assert.match(eligibility, /not coalesce\(lead\.purchased_package, false\)/i);
  assert.match(eligibility, /lead\.payment_confirmed_at is null/i);
  assert.match(eligibility, /lead\.package_purchased_at is null/i);
});

test("view exige conclusão, consentimento, ausência de compra e unsubscribe", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  for (const requirement of [
    "assessment.completed_at is not null",
    "lead.marketing_consent = true",
    "lead.unsubscribe_at is null",
    "coalesce(lead.purchase_status, 'not_purchased') <> 'purchased'",
  ]) assert.ok(sql.includes(requirement), `Requisito ausente: ${requirement}`);
  assert.match(sql, /as communication_eligible/i);
});

test("migration futura não executa backfill de assessments históricos", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.doesNotMatch(sql, /update\s+public\.assessments/i);
});

test("checkout iniciado é persistido antes da criação da cobrança", async () => {
  const [sql, productEvent, funnelEvent] = await Promise.all([
    readFile(checkoutMigrationUrl, "utf8"),
    readFile(new URL("../api/track-product-event.js", import.meta.url), "utf8"),
    readFile(new URL("../api/track-funnel-event.js", import.meta.url), "utf8"),
  ]);
  assert.match(sql, /add column if not exists checkout_started_at timestamptz/i);
  assert.match(sql, /coalesce\(lead\.checkout_started_at, lead\.payment_created_at, lead\.package_requested_at\)/i);
  assert.match(productEvent, /eventName === "checkout_started"/);
  assert.match(productEvent, /checkoutStartedAt/);
  assert.match(funnelEvent, /payment_started: \["checkout_started_at"/);
});

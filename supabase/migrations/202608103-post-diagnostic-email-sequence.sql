-- Régua de pós-diagnóstico. A ativação permanece controlada pelo backend e,
-- nesta fase, restrita ao destinatário de teste configurado no ambiente.

alter table public.leads
  add column if not exists result_access_token uuid not null default gen_random_uuid(),
  add column if not exists email_suppressed_at timestamptz,
  add column if not exists email_suppression_reason text;

create unique index if not exists leads_result_access_token_uidx
on public.leads (result_access_token);

create table if not exists public.email_sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  sequence_key text not null,
  status text not null default 'active'
    check (status in ('active','completed','cancelled_purchase','cancelled_unsubscribe','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, sequence_key)
);

create table if not exists public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.email_sequence_enrollments(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  sequence_key text not null,
  step smallint not null check (step between 0 and 3),
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  delivered_at timestamptz,
  bounced_at timestamptz,
  complained_at timestamptz,
  failed_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending','processing','sent','delivered','cancelled_purchase','cancelled_unsubscribe','failed','bounced','complained')),
  provider text not null default 'resend',
  provider_message_id text,
  error text,
  attempt_count integer not null default 0,
  processing_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, sequence_key, step)
);

create index if not exists email_deliveries_due_idx
on public.email_deliveries (scheduled_at, status);

create unique index if not exists email_deliveries_provider_message_uidx
on public.email_deliveries (provider_message_id)
where provider_message_id is not null;

create table if not exists public.email_webhook_events (
  id uuid primary key default gen_random_uuid(),
  svix_id text not null unique,
  event_type text not null,
  provider_message_id text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.email_sequence_enrollments enable row level security;
alter table public.email_deliveries enable row level security;
alter table public.email_webhook_events enable row level security;

revoke all on public.email_sequence_enrollments from public, anon, authenticated;
revoke all on public.email_deliveries from public, anon, authenticated;
revoke all on public.email_webhook_events from public, anon, authenticated;
grant all on public.email_sequence_enrollments to service_role;
grant all on public.email_deliveries to service_role;
grant all on public.email_webhook_events to service_role;

create or replace function public.claim_due_email_deliveries(
  p_limit integer,
  p_allowed_email text
)
returns setof public.email_deliveries
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.email_deliveries
  set status = 'pending', processing_started_at = null, updated_at = now(),
      error = coalesce(error, 'Processamento anterior expirou e foi liberado para retry.')
  where status = 'processing'
    and processing_started_at < now() - interval '15 minutes'
    and attempt_count < 3;

  return query
  with candidates as (
    select delivery.id
    from public.email_deliveries delivery
    join public.leads lead on lead.id = delivery.lead_id
    where delivery.status = 'pending'
      and delivery.scheduled_at <= now()
      and (p_allowed_email is null or lower(lead.email) = lower(p_allowed_email))
    order by delivery.scheduled_at, delivery.step
    for update of delivery skip locked
    limit greatest(1, least(coalesce(p_limit, 10), 25))
  )
  update public.email_deliveries delivery
  set status = 'processing', processing_started_at = now(),
      attempt_count = delivery.attempt_count + 1, updated_at = now()
  from candidates
  where delivery.id = candidates.id
  returning delivery.*;
end;
$$;

create or replace function public.cancel_post_diagnostic_for_lead(
  p_lead_id uuid,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
  next_status text;
begin
  next_status := case when p_reason = 'purchase' then 'cancelled_purchase' else 'cancelled_unsubscribe' end;
  update public.email_deliveries
  set status = next_status, error = p_reason, processing_started_at = null, updated_at = now()
  where lead_id = p_lead_id and status in ('pending','processing');
  get diagnostics affected = row_count;

  update public.email_sequence_enrollments
  set status = next_status, updated_at = now()
  where lead_id = p_lead_id and sequence_key = 'post_diagnostic_v1' and status = 'active';
  return affected;
end;
$$;

revoke all on function public.claim_due_email_deliveries(integer, text) from public, anon, authenticated;
revoke all on function public.cancel_post_diagnostic_for_lead(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_due_email_deliveries(integer, text) to service_role;
grant execute on function public.cancel_post_diagnostic_for_lead(uuid, text) to service_role;

create or replace view public.admin_conversion_leads
with (security_invoker = true)
as
select
  lead.id as lead_id,
  assessment.id as assessment_id,
  lead.session_id,
  lead.name,
  lead.email,
  lead.assessment_started_at,
  assessment.completed_at as assessment_completed_at,
  lead.result_viewed_at,
  coalesce(lead.checkout_started_at, lead.payment_created_at, lead.package_requested_at) as checkout_started_at,
  coalesce(lead.payment_confirmed_at, lead.package_purchased_at) as purchased_at,
  lead.marketing_consent,
  lead.marketing_consent_at,
  lead.marketing_consent_source,
  lead.unsubscribe_at,
  coalesce(assessment.instrument_version, lead.instrument_version, '1.0') as instrument_version,
  (lead.assessment_started_at is not null) as diagnostic_started,
  (assessment.completed_at is not null) as diagnostic_completed,
  (lead.result_viewed_at is not null) as result_viewed,
  (
    lead.checkout_started_at is not null or lead.payment_created_at is not null
    or lead.package_requested_at is not null or lead.purchase_status = 'requested'
  ) as checkout_started,
  (
    coalesce(lead.purchased_package, false) or lead.purchase_status = 'purchased'
    or lead.payment_confirmed_at is not null or lead.package_purchased_at is not null
  ) as purchase_completed,
  (
    assessment.completed_at is not null
    and not coalesce(lead.purchased_package, false)
    and coalesce(lead.purchase_status, 'not_purchased') <> 'purchased'
    and lead.payment_confirmed_at is null and lead.package_purchased_at is null
  ) as completed_not_purchased,
  (lead.unsubscribe_at is not null) as unsubscribed,
  case
    when coalesce(lead.purchased_package, false) or lead.purchase_status = 'purchased'
      or lead.payment_confirmed_at is not null or lead.package_purchased_at is not null then 'purchased'
    when lead.checkout_started_at is not null or lead.payment_created_at is not null
      or lead.package_requested_at is not null or lead.purchase_status = 'requested' then 'checkout_started'
    when lead.result_viewed_at is not null then 'result_viewed'
    when assessment.completed_at is not null then 'completed'
    else 'started'
  end as conversion_status,
  (
    assessment.completed_at is not null
    and lead.email is not null and btrim(lead.email) <> ''
    and lead.marketing_consent = true and lead.marketing_consent_at is not null
    and lead.unsubscribe_at is null and lead.email_suppressed_at is null
    and not coalesce(lead.purchased_package, false)
    and coalesce(lead.purchase_status, 'not_purchased') <> 'purchased'
    and lead.payment_confirmed_at is null and lead.package_purchased_at is null
  ) as communication_eligible
from public.leads lead
left join lateral (
  select candidate.* from public.assessments candidate
  where candidate.lead_id = lead.id
     or (candidate.lead_id is null and candidate.session_id = lead.session_id)
  order by candidate.completed_at desc, candidate.created_at desc
  limit 1
) assessment on true;

revoke all on public.admin_conversion_leads from public, anon, authenticated;
grant select on public.admin_conversion_leads to service_role;

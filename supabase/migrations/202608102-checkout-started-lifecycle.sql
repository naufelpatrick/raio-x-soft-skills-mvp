-- Registra a intenção de checkout no momento do clique, independentemente da
-- criação posterior de uma cobrança no provedor de pagamentos.

alter table public.leads
  add column if not exists checkout_started_at timestamptz;

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
    lead.checkout_started_at is not null
    or lead.payment_created_at is not null
    or lead.package_requested_at is not null
    or lead.purchase_status = 'requested'
  ) as checkout_started,
  (
    coalesce(lead.purchased_package, false)
    or lead.purchase_status = 'purchased'
    or lead.payment_confirmed_at is not null
    or lead.package_purchased_at is not null
  ) as purchase_completed,
  (
    assessment.completed_at is not null
    and not coalesce(lead.purchased_package, false)
    and coalesce(lead.purchase_status, 'not_purchased') <> 'purchased'
    and lead.payment_confirmed_at is null
    and lead.package_purchased_at is null
  ) as completed_not_purchased,
  (lead.unsubscribe_at is not null) as unsubscribed,
  case
    when coalesce(lead.purchased_package, false)
      or lead.purchase_status = 'purchased'
      or lead.payment_confirmed_at is not null
      or lead.package_purchased_at is not null then 'purchased'
    when lead.checkout_started_at is not null
      or lead.payment_created_at is not null
      or lead.package_requested_at is not null
      or lead.purchase_status = 'requested' then 'checkout_started'
    when lead.result_viewed_at is not null then 'result_viewed'
    when assessment.completed_at is not null then 'completed'
    else 'started'
  end as conversion_status,
  (
    assessment.completed_at is not null
    and lead.email is not null
    and btrim(lead.email) <> ''
    and lead.marketing_consent = true
    and lead.marketing_consent_at is not null
    and lead.unsubscribe_at is null
    and not coalesce(lead.purchased_package, false)
    and coalesce(lead.purchase_status, 'not_purchased') <> 'purchased'
    and lead.payment_confirmed_at is null
    and lead.package_purchased_at is null
  ) as communication_eligible
from public.leads lead
left join lateral (
  select candidate.*
  from public.assessments candidate
  where candidate.lead_id = lead.id
     or (candidate.lead_id is null and candidate.session_id = lead.session_id)
  order by candidate.completed_at desc, candidate.created_at desc
  limit 1
) assessment on true;

revoke all on public.admin_conversion_leads from public, anon, authenticated;
grant select on public.admin_conversion_leads to service_role;

comment on view public.admin_conversion_leads is
'Visão administrativa do lifecycle futuro. communication_eligible exige conclusão, consentimento explícito, ausência de compra e unsubscribe.';

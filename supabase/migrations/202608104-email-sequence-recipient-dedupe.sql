-- Torna a régua única por destinatário e cancela cópias históricas pendentes.
-- A régua deve permanecer desativada até esta migração ser aplicada e validada.

alter table public.email_sequence_enrollments
  drop constraint if exists email_sequence_enrollments_status_check;

alter table public.email_sequence_enrollments
  add constraint email_sequence_enrollments_status_check
  check (status in ('active','completed','cancelled_purchase','cancelled_unsubscribe','cancelled_duplicate','failed'));

alter table public.email_deliveries
  drop constraint if exists email_deliveries_status_check;

alter table public.email_deliveries
  add constraint email_deliveries_status_check
  check (status in ('pending','processing','sent','delivered','cancelled_purchase','cancelled_unsubscribe','cancelled_duplicate','failed','bounced','complained'));

alter table public.email_sequence_enrollments
  add column if not exists recipient_email text,
  add column if not exists dedupe_key text;

with ranked as (
  select
    enrollment.id,
    enrollment.sequence_key,
    lower(btrim(lead.email)) as recipient_email,
    row_number() over (
      partition by enrollment.sequence_key, lower(btrim(lead.email))
      order by enrollment.created_at, enrollment.id
    ) as recipient_rank
  from public.email_sequence_enrollments enrollment
  join public.leads lead on lead.id = enrollment.lead_id
  where lead.email is not null and btrim(lead.email) <> ''
)
update public.email_sequence_enrollments enrollment
set
  recipient_email = ranked.recipient_email,
  dedupe_key = case
    when ranked.recipient_rank = 1 then enrollment.sequence_key || ':' || ranked.recipient_email
    else null
  end,
  updated_at = now()
from ranked
where enrollment.id = ranked.id;

create unique index if not exists email_sequence_enrollments_dedupe_key_uidx
on public.email_sequence_enrollments (dedupe_key);

create index if not exists email_sequence_enrollments_recipient_idx
on public.email_sequence_enrollments (recipient_email, sequence_key);

with duplicate_enrollments as (
  select id
  from public.email_sequence_enrollments
  where recipient_email is not null and dedupe_key is null
)
update public.email_deliveries delivery
set
  status = 'cancelled_duplicate',
  error = 'duplicate_recipient_sequence_step',
  processing_started_at = null,
  updated_at = now()
from duplicate_enrollments duplicate
where delivery.enrollment_id = duplicate.id
  and delivery.status in ('pending','processing');

update public.email_sequence_enrollments
set status = 'cancelled_duplicate', updated_at = now()
where recipient_email is not null
  and dedupe_key is null
  and status = 'active';

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
    join public.email_sequence_enrollments enrollment on enrollment.id = delivery.enrollment_id
    join public.leads lead on lead.id = delivery.lead_id
    where delivery.status = 'pending'
      and delivery.scheduled_at <= now()
      and enrollment.status = 'active'
      and enrollment.dedupe_key = enrollment.sequence_key || ':' || lower(btrim(lead.email))
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

revoke all on function public.claim_due_email_deliveries(integer, text) from public, anon, authenticated;
grant execute on function public.claim_due_email_deliveries(integer, text) to service_role;

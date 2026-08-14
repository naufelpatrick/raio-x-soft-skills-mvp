alter table public.leads
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text;

create unique index if not exists leads_stripe_checkout_session_id_idx
  on public.leads (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists leads_stripe_payment_intent_id_idx
  on public.leads (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

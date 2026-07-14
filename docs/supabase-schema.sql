create table if not exists public.validation_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  accuracy integer not null check (accuracy between 1 and 5),
  recommendation integer not null check (recommendation between 0 and 10),
  useful_part text not null,
  comments text,
  used_ai boolean not null default false,
  submitted_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.validation_interest (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  interest text not null,
  name text not null,
  email text not null,
  contact_consent boolean not null default false,
  recommendation integer check (recommendation between 0 and 10),
  source text,
  submitted_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.nps_responses (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  name text not null,
  email text not null,
  score integer not null check (score between 0 and 10),
  category text not null check (category in ('detractor', 'neutral', 'promoter')),
  comment text,
  source text not null default 'paid_report',
  report_type text not null default 'paid',
  submitted_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null,
  step text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  name text not null,
  email text not null,
  whatsapp text,
  contact_consent boolean not null default false,
  age text,
  experience text,
  "current_role" text,
  professional_level text,
  main_area text,
  career_goal text,
  current_challenge text,
  purchase_status text not null default 'not_purchased'
    check (purchase_status in ('not_purchased', 'requested', 'purchased')),
  purchased_package boolean not null default false,
  package_requested_at timestamptz,
  package_purchased_at timestamptz,
  asaas_customer_id text,
  asaas_payment_id text,
  payment_status text,
  payment_url text,
  payment_created_at timestamptz,
  payment_confirmed_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.leads
  add column if not exists asaas_customer_id text,
  add column if not exists asaas_payment_id text,
  add column if not exists payment_status text,
  add column if not exists payment_url text,
  add column if not exists payment_created_at timestamptz,
  add column if not exists payment_confirmed_at timestamptz;

create index if not exists leads_asaas_payment_id_idx
on public.leads (asaas_payment_id);

alter table public.validation_feedback enable row level security;
alter table public.validation_interest enable row level security;
alter table public.nps_responses enable row level security;
alter table public.funnel_events enable row level security;
alter table public.leads enable row level security;

create policy "Allow anonymous feedback insert"
on public.validation_feedback
for insert
to anon
with check (true);

create policy "Allow anonymous interest insert"
on public.validation_interest
for insert
to anon
with check (true);

drop policy if exists "Allow anonymous nps insert" on public.nps_responses;

create policy "Allow anonymous nps insert"
on public.nps_responses
for insert
to anon
with check (true);

drop policy if exists "Allow anonymous funnel event insert" on public.funnel_events;

create policy "Allow anonymous funnel event insert"
on public.funnel_events
for insert
to anon
with check (true);

drop policy if exists "Allow anonymous lead insert" on public.leads;
drop policy if exists "Allow anonymous lead update" on public.leads;

create policy "Allow public lead insert"
on public.leads
for insert
to public
with check (true);

create policy "Allow public lead update"
on public.leads
for update
to public
using (true)
with check (true);

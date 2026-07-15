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

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'viewer' check (role in ('owner', 'admin', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  anonymous_user_id text,
  user_id uuid references auth.users(id) on delete set null,
  assessment_id text,
  session_id text,
  source text,
  medium text,
  campaign text,
  page_path text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text,
  event_type text not null,
  payment_id text,
  payload jsonb,
  processed boolean not null default false,
  processing_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, external_event_id)
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  resource text,
  resource_id text,
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
create index if not exists admin_users_user_id_idx on public.admin_users (user_id);
create index if not exists admin_users_email_idx on public.admin_users (email);
create index if not exists product_events_event_name_idx on public.product_events (event_name);
create index if not exists product_events_created_at_idx on public.product_events (created_at);
create index if not exists product_events_user_id_idx on public.product_events (user_id);
create index if not exists product_events_assessment_id_idx on public.product_events (assessment_id);
create index if not exists product_events_session_id_idx on public.product_events (session_id);
create index if not exists payment_webhook_events_payment_id_idx on public.payment_webhook_events (payment_id);
create index if not exists payment_webhook_events_created_at_idx on public.payment_webhook_events (created_at);
create index if not exists admin_audit_logs_admin_user_id_idx on public.admin_audit_logs (admin_user_id);
create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at);

alter table public.validation_feedback enable row level security;
alter table public.validation_interest enable row level security;
alter table public.nps_responses enable row level security;
alter table public.funnel_events enable row level security;
alter table public.admin_users enable row level security;
alter table public.product_events enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.admin_audit_logs enable row level security;
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

drop policy if exists "Admin can read own admin profile" on public.admin_users;

create policy "Admin can read own admin profile"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid() and active = true);

drop policy if exists "Allow public product event insert" on public.product_events;

create policy "Allow public product event insert"
on public.product_events
for insert
to anon, authenticated
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

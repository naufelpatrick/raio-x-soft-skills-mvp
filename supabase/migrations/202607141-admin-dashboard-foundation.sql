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

alter table public.admin_users enable row level security;
alter table public.product_events enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.admin_audit_logs enable row level security;

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

-- No public SELECT policies are intentionally created for product_events,
-- payment_webhook_events or admin_audit_logs. Administrative reads must go
-- through protected backend routes using the service role key.

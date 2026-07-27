create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  instrument_version text not null default '1.0',
  answers jsonb not null,
  open_answers jsonb not null default '{}'::jsonb,
  competency_scores jsonb not null,
  general_score integer not null check (general_score between 0 and 100),
  completed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists assessments_session_id_idx
on public.assessments (session_id);

create index if not exists assessments_instrument_version_idx
on public.assessments (instrument_version);

comment on column public.assessments.instrument_version is
'Versão metodológica imutável usada no cálculo. Registros legados sem versão devem ser tratados como 1.0.';

alter table public.assessments enable row level security;

drop policy if exists "Allow public assessment insert" on public.assessments;
create policy "Allow public assessment insert"
on public.assessments
for insert
to anon, authenticated
with check (instrument_version = '2.0');

-- Nenhuma policy pública de SELECT: respostas só podem ser consultadas por rotas
-- administrativas protegidas com service role ou diretamente no painel Supabase.

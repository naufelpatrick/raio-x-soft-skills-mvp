-- Contexto opcional e extensível de experimentos. Registros antigos permanecem válidos.
alter table public.leads
  add column if not exists experiments jsonb not null default '{}'::jsonb;

alter table public.assessments
  add column if not exists experiments jsonb not null default '{}'::jsonb;

comment on column public.leads.experiments is
'Mapa versionado experiment_id -> variante, persistido desde a aquisição até o pagamento.';

comment on column public.assessments.experiments is
'Mapa versionado experiment_id -> variante vigente na conclusão do diagnóstico.';

create index if not exists leads_experiments_gin_idx
on public.leads using gin (experiments);

create index if not exists assessments_experiments_gin_idx
on public.assessments using gin (experiments);

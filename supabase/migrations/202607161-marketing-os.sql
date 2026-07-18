-- Marketing OS MVP. All access is intentionally mediated by authenticated admin APIs.
create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(), name text not null, objective text, description text,
  start_date date, end_date date, status text not null default 'planning' check (status in ('planning','active','paused','completed')),
  channels text[] not null default '{}', audience text, offer text, destination_url text,
  budget numeric(12,2) not null default 0, attributed_revenue numeric(12,2) not null default 0,
  notes text, learnings text, created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.marketing_content (
  id uuid primary key default gen_random_uuid(), title text not null, headline text, summary text,
  objective text check (objective in ('attract','educate','authority','conversion')),
  series text, format text, platform text, theme text, caption text, cta text, script text, art_text text,
  visual_direction text, hashtags text, destination_url text, planned_date date, published_date date,
  owner_name text, priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'ideas' check (status in ('ideas','prioritized','production','design','review','scheduled','published','results','repurpose')),
  notes text, ice_impact smallint not null default 5 check (ice_impact between 1 and 10),
  ice_confidence smallint not null default 5 check (ice_confidence between 1 and 10),
  ice_ease smallint not null default 5 check (ice_ease between 1 and 10),
  ice_score numeric(4,2) generated always as ((ice_impact + ice_confidence + ice_ease)::numeric / 3) stored,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.marketing_ideas (
  id uuid primary key default gen_random_uuid(), type text not null default 'idea' check (type in ('idea','headline','hook','cta')),
  title text not null, insight text, theme text, series text, suggested_format text, objective text,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'new' check (status in ('new','prioritized','used','archived')),
  ice_impact smallint not null default 5 check (ice_impact between 1 and 10),
  ice_confidence smallint not null default 5 check (ice_confidence between 1 and 10),
  ice_ease smallint not null default 5 check (ice_ease between 1 and 10),
  ice_score numeric(4,2) generated always as ((ice_impact + ice_confidence + ice_ease)::numeric / 3) stored,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.marketing_metrics (
  id uuid primary key default gen_random_uuid(), content_id uuid not null unique references public.marketing_content(id) on delete cascade,
  reach integer not null default 0, impressions integer not null default 0, likes integer not null default 0,
  comments integer not null default 0, saves integer not null default 0, shares integer not null default 0,
  clicks integer not null default 0, followers integer not null default 0, diagnostics_started integer not null default 0,
  diagnostics_completed integer not null default 0, sales integer not null default 0, revenue numeric(12,2) not null default 0,
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.marketing_content_campaigns (
  content_id uuid not null references public.marketing_content(id) on delete cascade,
  campaign_id uuid not null references public.marketing_campaigns(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (content_id, campaign_id)
);

create index if not exists marketing_content_status_idx on public.marketing_content(status);
create index if not exists marketing_content_planned_date_idx on public.marketing_content(planned_date);
create index if not exists marketing_ideas_type_idx on public.marketing_ideas(type);
create index if not exists marketing_campaigns_status_idx on public.marketing_campaigns(status);

alter table public.marketing_content enable row level security;
alter table public.marketing_ideas enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.marketing_metrics enable row level security;
alter table public.marketing_content_campaigns enable row level security;

insert into public.marketing_content (title, headline, objective, series, format, platform, priority, status, ice_impact, ice_confidence, ice_ease)
select seed.title, seed.title, seed.objective, seed.series, seed.format, 'Instagram', seed.priority, seed.status, seed.impact, seed.confidence, seed.ease
from (values
 ('Sua carreira não cresce apenas com ferramentas.','educate','Além das Ferramentas','Carrossel','high','prioritized',9,9,7),
 ('Ser um excelente designer não garante uma excelente carreira.','authority','Ponto Cego','Carrossel','high','production',9,8,7),
 ('Seu portfólio mostra o que você faz. Sua carreira mostra quem você é.','attract','Raio X da Carreira','Post estático','high','ideas',8,8,9),
 ('Você sabe explicar uma decisão de design?','educate','Competência da Semana','Carrossel','high','prioritized',8,9,8),
 ('Competência da Semana: Comunicação.','educate','Competência da Semana','Carrossel','high','scheduled',8,9,8),
 ('O erro de quem acredita que IA vai resolver tudo.','authority','Ponto Cego','Reel','medium','ideas',8,7,6),
 ('Como nasceu o Raio X do Designer.','authority','Por Dentro do Raio X','Reel','medium','production',7,9,6),
 ('Cinco sinais de que sua carreira está estagnada.','attract','Raio X da Carreira','Carrossel','high','review',9,8,7),
 ('Pensamento crítico vale mais do que velocidade.','authority','Além das Ferramentas','Post estático','medium','ideas',8,8,9),
 ('Por que designers inteligentes continuam invisíveis?','attract','Ponto Cego','Carrossel','high','prioritized',9,8,7),
 ('O que o diagnóstico realmente mede?','educate','Diagnóstico','Carrossel','high','design',8,9,7),
 ('Veja um trecho do relatório.','conversion','Diagnóstico','Carrossel','urgent','scheduled',9,9,8)
) as seed(title, objective, series, format, priority, status, impact, confidence, ease)
where not exists (select 1 from public.marketing_content);

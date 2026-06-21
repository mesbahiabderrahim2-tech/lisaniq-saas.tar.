-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 005: Reports Table
-- Persists generated executive intelligence reports.
-- KPI snapshot is stored as JSONB at generation time so reports
-- remain stable even if the underlying dataset is re-uploaded.
-- ══════════════════════════════════════════════════════════════

create table if not exists public.reports (
  id               uuid        primary key default uuid_generate_v4(),
  owner_id         uuid        not null references public.users(id)    on delete cascade,
  project_id       uuid        not null references public.projects(id)  on delete cascade,
  dataset_id       uuid        not null references public.datasets(id)  on delete cascade,
  name             text        not null check (char_length(name) between 1 and 200),
  -- Full KPI snapshot at generation time (immutable after save)
  kpis             jsonb       not null,
  health_score     integer     not null check (health_score between 0 and 100),
  business_status  text        not null
                               check (business_status in ('Elite','Strong','Average','Critical')),
  -- Computed arrays stored for fast retrieval (no re-computation needed)
  insights         jsonb       not null default '[]'::jsonb,
  risks            jsonb       not null default '[]'::jsonb,
  recommendations  jsonb       not null default '[]'::jsonb,
  opportunities    jsonb       not null default '[]'::jsonb,
  -- User annotations
  notes            text        check (char_length(notes) <= 2000),
  is_starred       boolean     not null default false,
  -- PDF export tracking
  pdf_exported_at  timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Indexes
create index if not exists reports_owner_idx      on public.reports(owner_id);
create index if not exists reports_project_idx    on public.reports(project_id);
create index if not exists reports_dataset_idx    on public.reports(dataset_id);
create index if not exists reports_starred_idx    on public.reports(owner_id, is_starred)
  where is_starred = true;
create index if not exists reports_created_at_idx on public.reports(created_at desc);

-- Updated-at trigger
create trigger reports_updated_at
  before update on public.reports
  for each row execute function public.handle_updated_at();

-- ── Row Level Security ──────────────────────────────────────
alter table public.reports enable row level security;

create policy "reports: select own"
  on public.reports for select
  using (auth.uid() = owner_id);

create policy "reports: insert own"
  on public.reports for insert
  with check (auth.uid() = owner_id);

create policy "reports: update own"
  on public.reports for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "reports: delete own"
  on public.reports for delete
  using (auth.uid() = owner_id);

-- ── Usage limit helper ──────────────────────────────────────
create or replace function public.count_user_reports(p_user_id uuid)
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select count(*)::integer
  from public.reports
  where owner_id = p_user_id;
$$;

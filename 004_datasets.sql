-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 004: Datasets Table
-- Stores metadata for every uploaded CSV/XLSX file.
-- The actual file lives in Supabase Storage at file_path.
-- ══════════════════════════════════════════════════════════════

create table if not exists public.datasets (
  id            uuid        primary key default uuid_generate_v4(),
  owner_id      uuid        not null references public.users(id)    on delete cascade,
  project_id    uuid        not null references public.projects(id)  on delete cascade,
  name          text        not null check (char_length(name) between 1 and 150),
  file_name     text        not null,
  -- Path in Supabase Storage: {owner_id}/datasets/{uuid}/{file_name}
  file_path     text        not null,
  file_size     bigint      not null check (file_size > 0),
  file_type     text        not null check (file_type in ('csv','xlsx','xls')),
  row_count     integer     not null default 0 check (row_count >= 0),
  -- JSONB snapshot of which source columns mapped to canonical fields
  column_map    jsonb       not null default '{}'::jsonb,
  -- Serialised campaign rows — stored compressed for quick retrieval
  -- Large datasets should be fetched from Storage and re-parsed on demand
  cached_rows   jsonb,
  status        text        not null default 'processing'
                            check (status in ('processing','ready','error')),
  error_message text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes
create index if not exists datasets_owner_idx      on public.datasets(owner_id);
create index if not exists datasets_project_idx    on public.datasets(project_id);
create index if not exists datasets_status_idx     on public.datasets(status);
create index if not exists datasets_created_at_idx on public.datasets(created_at desc);

-- Updated-at trigger
create trigger datasets_updated_at
  before update on public.datasets
  for each row execute function public.handle_updated_at();

-- ── Row Level Security ──────────────────────────────────────
alter table public.datasets enable row level security;

create policy "datasets: select own"
  on public.datasets for select
  using (auth.uid() = owner_id);

create policy "datasets: insert own"
  on public.datasets for insert
  with check (auth.uid() = owner_id);

create policy "datasets: update own"
  on public.datasets for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "datasets: delete own"
  on public.datasets for delete
  using (auth.uid() = owner_id);

-- ── Usage limit helper ──────────────────────────────────────
-- Returns the number of ready datasets for a given user.
-- Used by API routes to enforce plan limits before inserting.
create or replace function public.count_user_datasets(p_user_id uuid)
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select count(*)::integer
  from public.datasets
  where owner_id = p_user_id
    and status != 'error';
$$;

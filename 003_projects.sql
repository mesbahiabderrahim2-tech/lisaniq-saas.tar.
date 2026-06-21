-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 003: Projects Table
-- ══════════════════════════════════════════════════════════════

create table if not exists public.projects (
  id          uuid        primary key default uuid_generate_v4(),
  owner_id    uuid        not null references public.users(id) on delete cascade,
  name        text        not null check (char_length(name) between 1 and 100),
  description text        check (char_length(description) <= 500),
  color       text        not null default '#3d6fe8'
                          check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indexes
create index if not exists projects_owner_idx      on public.projects(owner_id);
create index if not exists projects_created_at_idx on public.projects(created_at desc);

-- Updated-at trigger
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ── Row Level Security ──────────────────────────────────────
alter table public.projects enable row level security;

create policy "projects: select own"
  on public.projects for select
  using (auth.uid() = owner_id);

create policy "projects: insert own"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "projects: update own"
  on public.projects for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "projects: delete own"
  on public.projects for delete
  using (auth.uid() = owner_id);

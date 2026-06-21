-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 007: Activity Logs Table
-- Immutable append-only audit trail for all user actions.
-- Rows are never updated or deleted (by policy).
-- ══════════════════════════════════════════════════════════════

create table if not exists public.activity_logs (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references public.users(id) on delete cascade,
  action        text        not null check (action in (
                              'project.created','project.updated','project.deleted',
                              'dataset.uploaded','dataset.processed','dataset.deleted',
                              'report.generated','report.starred','report.deleted','report.exported'
                            )),
  resource_type text        not null check (resource_type in ('project','dataset','report')),
  resource_id   uuid        not null,
  -- Arbitrary metadata (file names, sizes, KPI summaries, etc.)
  metadata      jsonb       not null default '{}'::jsonb,
  -- IP address for security audit (optional, nullable)
  ip_address    inet,
  created_at    timestamptz not null default now()
);

-- Indexes (queries are always filtered by user_id + ordered by time)
create index if not exists activity_user_idx        on public.activity_logs(user_id, created_at desc);
create index if not exists activity_resource_idx    on public.activity_logs(resource_type, resource_id);
create index if not exists activity_action_idx      on public.activity_logs(action);

-- Partition hint: consider range partitioning by created_at month
-- for tables expected to exceed 10M rows in high-volume environments.

-- ── Row Level Security ──────────────────────────────────────
alter table public.activity_logs enable row level security;

-- Users can only read their own activity
create policy "activity_logs: select own"
  on public.activity_logs for select
  using (auth.uid() = user_id);

-- Users can insert their own activity (server-side inserts use service role)
create policy "activity_logs: insert own"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

-- No UPDATE or DELETE — this is an immutable audit log

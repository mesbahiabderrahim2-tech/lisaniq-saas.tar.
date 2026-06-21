-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 002: Users Table
-- ══════════════════════════════════════════════════════════════

create table if not exists public.users (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        not null unique,
  full_name     text,
  avatar_url    text,
  role          text        not null default 'owner'
                            check (role in ('owner','admin','analyst','viewer')),
  plan          text        not null default 'free'
                            check (plan in ('free','pro','enterprise')),
  -- Stripe identifiers (nullable until subscription created)
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes
create index if not exists users_email_idx     on public.users(email);
create index if not exists users_stripe_cid_idx on public.users(stripe_customer_id)
  where stripe_customer_id is not null;

-- Updated-at trigger
create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- Mirror auth sign-up into public.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ──────────────────────────────────────
alter table public.users enable row level security;

-- Users can only read their own profile
create policy "users: select own"
  on public.users for select
  using (auth.uid() = id);

-- Users can only update their own profile
create policy "users: update own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No direct INSERT — handled by handle_new_user() trigger (security definer)
-- No direct DELETE — handled by cascade from auth.users

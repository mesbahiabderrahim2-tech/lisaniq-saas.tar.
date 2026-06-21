-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 001: Bootstrap
-- Extensions and shared helper functions used by all tables.
-- ══════════════════════════════════════════════════════════════

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Updated-at trigger function ─────────────────────────────
-- Automatically stamps updated_at on every UPDATE.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Auth user sync function ─────────────────────────────────
-- Mirrors auth.users into public.users on first sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

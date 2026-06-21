-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 006: Subscriptions Table
-- Tracks Stripe subscription state per user.
-- The webhook handler keeps this table in sync with Stripe events.
-- ══════════════════════════════════════════════════════════════

create table if not exists public.subscriptions (
  id                      uuid        primary key default uuid_generate_v4(),
  user_id                 uuid        not null unique references public.users(id) on delete cascade,
  -- Stripe identifiers
  stripe_subscription_id  text        unique,
  stripe_customer_id      text,
  stripe_price_id         text,
  -- Plan mirrors users.plan — kept in sync by webhook
  plan                    text        not null default 'free'
                                      check (plan in ('free','pro','enterprise')),
  status                  text        not null default 'active'
                                      check (status in ('active','trialing','past_due','canceled','incomplete','incomplete_expired','unpaid')),
  -- Billing period
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean     not null default false,
  canceled_at             timestamptz,
  trial_end               timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Indexes
create index if not exists subscriptions_user_idx          on public.subscriptions(user_id);
create index if not exists subscriptions_stripe_sub_idx    on public.subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;
create index if not exists subscriptions_stripe_cust_idx   on public.subscriptions(stripe_customer_id)
  where stripe_customer_id is not null;

-- Updated-at trigger
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ── Keep users.plan in sync with subscriptions.plan ────────
-- When subscription plan or status changes, mirror it to users table
create or replace function public.sync_user_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Active or trialing → set plan from subscription
  if new.status in ('active','trialing') then
    update public.users
    set plan = new.plan, updated_at = now()
    where id = new.user_id;
  -- Canceled / expired → downgrade to free
  elsif new.status in ('canceled','incomplete_expired') then
    update public.users
    set plan = 'free', updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger subscriptions_sync_plan
  after insert or update of plan, status on public.subscriptions
  for each row execute function public.sync_user_plan();

-- ── Row Level Security ──────────────────────────────────────
alter table public.subscriptions enable row level security;

create policy "subscriptions: select own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Subscriptions are managed exclusively by the service role (webhook handler)
-- No direct INSERT/UPDATE/DELETE from the client

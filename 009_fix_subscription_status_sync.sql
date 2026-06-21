-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 009: Fix subscription status sync
--
-- Problem: sync_user_plan() only downgraded users on 'canceled'
-- and 'incomplete_expired'. Users on 'past_due' or 'unpaid'
-- retained Pro access after payment failure (revenue leak).
--
-- Fix: extend the downgrade condition to include 'past_due'
-- and 'unpaid' so Pro access is revoked on any payment failure.
--
-- This replaces the function defined in 006_subscriptions.sql.
-- The trigger subscriptions_sync_plan is unchanged and continues
-- to fire on insert or update of plan/status.
-- ══════════════════════════════════════════════════════════════

create or replace function public.sync_user_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  if new.status in ('active', 'trialing') then

    update public.users
    set plan       = new.plan,
        updated_at = now()
    where id = new.user_id;

  elsif new.status in (
    'canceled',
    'incomplete_expired',
    'past_due',
    'unpaid'
  ) then

    update public.users
    set plan       = 'free',
        updated_at = now()
    where id = new.user_id;

  end if;

  return new;
end;
$$;

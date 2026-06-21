-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 011: Fix subscription sync for 'incomplete' status
--
-- Problem: sync_user_plan() (as of 009) downgrades users on
-- 'canceled', 'incomplete_expired', 'past_due', 'unpaid' — but not
-- on 'incomplete'. A subscription can sit in 'incomplete' status
-- when the first payment requires additional authentication (e.g.
-- 3D Secure) and hasn't completed yet. Without this fix, a user
-- whose very first checkout produces an 'incomplete' subscription
-- keeps whatever users.plan value they already had (typically
-- 'free', since they were never upgraded) — so in practice this
-- is a no-op for new users, but for any user re-subscribing after
-- a previous cancellation, the trigger would silently fail to act
-- and leave their plan in whatever state it was previously, rather
-- than reflecting the fact that they do not yet have a paid plan.
--
-- Fix: add 'incomplete' to the downgrade-to-free branch. This is
-- the only behavioural change; no other logic in the function is
-- modified.
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
    'incomplete',
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

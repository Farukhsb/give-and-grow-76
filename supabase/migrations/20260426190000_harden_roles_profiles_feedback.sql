-- Security hardening for Lovable scanner findings.
-- Purpose:
-- 1. Prevent authenticated users from assigning themselves an admin role.
-- 2. Restrict profile visibility and role updates.
-- 3. Restrict feedback visibility to owners/admins where table exists.
-- 4. Keep donor recommendation history scoped to the signed-in donor.

create extension if not exists pgcrypto;

-- Shared admin helper. This assumes profiles.role exists.
-- If your project later moves to a separate user_roles table, update this helper only.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Prevent client-side role escalation through profiles updates.
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.role is distinct from old.role and not public.is_admin() then
      raise exception 'Only admins can change profile roles';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if coalesce(new.role, 'donor') = 'admin' and not public.is_admin() then
      new.role := 'donor';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_profile_role_escalation() from public;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) then
    alter table public.profiles enable row level security;

    drop trigger if exists prevent_profile_role_escalation_trigger on public.profiles;
    create trigger prevent_profile_role_escalation_trigger
    before insert or update on public.profiles
    for each row execute function public.prevent_profile_role_escalation();

    drop policy if exists "Profiles are viewable by everyone" on public.profiles;
    drop policy if exists "Public profiles are readable" on public.profiles;
    drop policy if exists "Users can view all profiles" on public.profiles;
    drop policy if exists "Authenticated users can read profiles" on public.profiles;
    drop policy if exists "Users can read own profile" on public.profiles;
    create policy "Users can read own profile"
    on public.profiles
    for select
    to authenticated
    using (id = auth.uid() or public.is_admin());

    drop policy if exists "Users can update own profile" on public.profiles;
    create policy "Users can update own profile"
    on public.profiles
    for update
    to authenticated
    using (id = auth.uid() or public.is_admin())
    with check (id = auth.uid() or public.is_admin());
  end if;
end $$;

-- Optional user_roles hardening if a user_roles table exists.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'user_roles'
  ) then
    alter table public.user_roles enable row level security;

    drop policy if exists "Users can assign own roles" on public.user_roles;
    drop policy if exists "Authenticated users can insert roles" on public.user_roles;
    drop policy if exists "Users can read own roles" on public.user_roles;
    create policy "Users can read own roles"
    on public.user_roles
    for select
    to authenticated
    using (user_id = auth.uid() or public.is_admin());

    drop policy if exists "Only admins can manage roles" on public.user_roles;
    create policy "Only admins can manage roles"
    on public.user_roles
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
  end if;
end $$;

-- Feedback hardening if a feedback table exists.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'feedback'
  ) then
    alter table public.feedback enable row level security;

    drop policy if exists "Feedback is readable by everyone" on public.feedback;
    drop policy if exists "Authenticated users can read feedback" on public.feedback;
    drop policy if exists "Users can read own feedback" on public.feedback;
    create policy "Users can read own feedback"
    on public.feedback
    for select
    to authenticated
    using (
      public.is_admin()
      or user_id = auth.uid()
    );

    drop policy if exists "Anyone can submit feedback" on public.feedback;
    drop policy if exists "Authenticated users can submit feedback" on public.feedback;
    create policy "Authenticated users can submit own feedback"
    on public.feedback
    for insert
    to authenticated
    with check (user_id = auth.uid());
  end if;
end $$;

-- Recommendation history hardening if already created.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'donor_recommendation_history'
  ) then
    alter table public.donor_recommendation_history enable row level security;

    drop policy if exists "Donors can read own recommendation history" on public.donor_recommendation_history;
    create policy "Donors can read own recommendation history"
    on public.donor_recommendation_history
    for select
    to authenticated
    using (donor_id = auth.uid() or public.is_admin());

    drop policy if exists "Donors can insert own recommendation history" on public.donor_recommendation_history;
    create policy "Donors can insert own recommendation history"
    on public.donor_recommendation_history
    for insert
    to authenticated
    with check (donor_id = auth.uid());
  end if;
end $$;

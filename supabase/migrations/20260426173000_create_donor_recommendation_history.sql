create table if not exists public.donor_recommendation_history (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references auth.users(id) on delete cascade,
  campaign_id text not null,
  campaign_name text not null,
  category text,
  match_score integer not null check (match_score >= 0 and match_score <= 100),
  reason text not null,
  match_factors text[] not null default '{}',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.donor_recommendation_history enable row level security;

drop policy if exists "Donors can read own recommendation history" on public.donor_recommendation_history;
create policy "Donors can read own recommendation history"
on public.donor_recommendation_history
for select
to authenticated
using (donor_id = auth.uid());

drop policy if exists "Donors can insert own recommendation history" on public.donor_recommendation_history;
create policy "Donors can insert own recommendation history"
on public.donor_recommendation_history
for insert
to authenticated
with check (donor_id = auth.uid());

create index if not exists donor_recommendation_history_donor_created_idx
on public.donor_recommendation_history (donor_id, created_at desc);

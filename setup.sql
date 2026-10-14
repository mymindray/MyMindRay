-- Run once in Supabase → SQL Editor
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  personal_phone text,
  family_phone text,
  friend_phone text,
  created_at timestamptz default now()
);

-- Safe to re-run on an existing database: adds the phone columns if missing.
alter table public.profiles add column if not exists personal_phone text;
alter table public.profiles add column if not exists family_phone text;
alter table public.profiles add column if not exists friend_phone text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists state text;

create table if not exists public.user_state (
  id uuid primary key references auth.users(id) on delete cascade,
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create unique index if not exists profiles_username_lower on public.profiles (lower(username));

alter table public.profiles enable row level security;
alter table public.user_state enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "state select own" on public.user_state;
create policy "state select own" on public.user_state for select using (auth.uid() = id);
drop policy if exists "state insert own" on public.user_state;
create policy "state insert own" on public.user_state for insert with check (auth.uid() = id);
drop policy if exists "state update own" on public.user_state;
create policy "state update own" on public.user_state for update using (auth.uid() = id);

create or replace function public.username_taken(name text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where lower(username) = lower(name)
  );
$$;

grant execute on function public.username_taken(text) to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.user_state to authenticated;

-- ============================================================
-- LEADERBOARD (run this block once in Supabase → SQL Editor)
-- Stores ONLY the public score info (name, avatar, score, streak).
-- Private data (moods, journal, check-ins) stays in user_state.
-- ============================================================
create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null default 'Member',
  avatar text default 'Luna',
  score integer not null default 0 check (score >= 0),
  streak integer not null default 0 check (streak >= 0),
  updated_at timestamptz default now()
);

create index if not exists leaderboard_score_idx on public.leaderboard (score desc, updated_at asc);

alter table public.leaderboard enable row level security;

-- every logged-in user can read the board
drop policy if exists "leaderboard read all" on public.leaderboard;
create policy "leaderboard read all" on public.leaderboard for select to authenticated using (true);
-- users can only write their own row
drop policy if exists "leaderboard insert own" on public.leaderboard;
create policy "leaderboard insert own" on public.leaderboard for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "leaderboard update own" on public.leaderboard;
create policy "leaderboard update own" on public.leaderboard for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.leaderboard to authenticated;

-- turn on realtime so the board updates live
do $$
begin
  alter publication supabase_realtime add table public.leaderboard;
exception when duplicate_object then null;
end $$;

-- refresh the API cache so the new tables are found straight away
notify pgrst, 'reload schema';

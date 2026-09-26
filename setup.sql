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

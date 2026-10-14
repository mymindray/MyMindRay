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

-- ============================================================
-- PERSON-TO-PERSON MESSAGES (run this block once in Supabase → SQL Editor)
-- chat_directory: the ONLY thing other people can see about you
--                 (name, username, profile picture). No email, no phone.
-- chat_messages:  text only. Visible only to the sender and the recipient.
-- ============================================================
create table if not exists public.chat_directory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null default 'Member',
  display_name text default '',
  avatar text default 'Luna',
  updated_at timestamptz default now()
);

alter table public.chat_directory enable row level security;

drop policy if exists "directory read all" on public.chat_directory;
create policy "directory read all" on public.chat_directory for select to authenticated using (true);
drop policy if exists "directory insert own" on public.chat_directory;
create policy "directory insert own" on public.chat_directory for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "directory update own" on public.chat_directory;
create policy "directory update own" on public.chat_directory for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.chat_directory to authenticated;

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

create index if not exists chat_messages_pair_idx on public.chat_messages (sender_id, recipient_id, created_at desc);
create index if not exists chat_messages_inbox_idx on public.chat_messages (recipient_id, read_at, created_at desc);

alter table public.chat_messages enable row level security;

drop policy if exists "chat read mine" on public.chat_messages;
create policy "chat read mine" on public.chat_messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists "chat send as me" on public.chat_messages;
create policy "chat send as me" on public.chat_messages for insert to authenticated
  with check (auth.uid() = sender_id);
drop policy if exists "chat mark read" on public.chat_messages;
create policy "chat mark read" on public.chat_messages for update to authenticated
  using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- the recipient may only change read_at, nothing else
grant select, insert on public.chat_messages to authenticated;
grant update (read_at) on public.chat_messages to authenticated;

-- realtime so new messages and notifications arrive instantly
do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';

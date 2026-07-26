-- Half-Formed: Complete Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query → Paste → Run)

-- ============================================================
-- 1. PROFILES (links to Supabase auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (length(handle) >= 3 and handle ~ '^[a-zA-Z0-9_]+$'),
  avatar_url text,
  trust_score int default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are publicly readable"
  on profiles for select using (true);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up via a trigger
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle)
  values (
    new.id,
    'user_' || substr(new.id::text, 1, 8)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ============================================================
-- 2. TOPICS (the 4 verticals, seeded once)
-- ============================================================
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  accent_hex text not null,
  discussion_mode text not null check (discussion_mode in ('threaded','bridging','open')),
  default_capacity int default 8,
  created_at timestamptz default now()
);

alter table topics enable row level security;
create policy "Topics are publicly readable" on topics for select using (true);

-- Seed
insert into topics (name, slug, accent_hex, discussion_mode, default_capacity) values
  ('Sociology',  'sociology',  '#C17F56', 'open',     8),
  ('Psychology', 'psychology', '#9C8CA8', 'threaded',  6),
  ('Politics',   'politics',  '#4F8583', 'bridging', 12),
  ('Philosophy', 'philosophy', '#B8A46E', 'open',      8)
on conflict (slug) do nothing;


-- ============================================================
-- 3. PODS (conversation rooms)
-- ============================================================
create table if not exists pods (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id),
  title text not null check (length(title) >= 3),
  seed_prompt text,
  capacity int not null default 8 check (capacity >= 2 and capacity <= 20),
  status text not null default 'active' check (status in ('active','fully_formed','archived')),
  created_by uuid not null references profiles(id),
  created_at timestamptz default now()
);

alter table pods enable row level security;

create policy "Pods are publicly readable"
  on pods for select using (true);

create policy "Authenticated users can create pods"
  on pods for insert with check (auth.uid() = created_by);

create policy "Pod creator can update"
  on pods for update using (auth.uid() = created_by);


-- ============================================================
-- 4. POD MEMBERSHIPS
-- ============================================================
create table if not exists pod_memberships (
  pod_id uuid not null references pods(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (pod_id, user_id)
);

alter table pod_memberships enable row level security;

create policy "Memberships are publicly readable"
  on pod_memberships for select using (true);

create policy "Authenticated can join pods"
  on pod_memberships for insert with check (auth.uid() = user_id);

create policy "Users can leave pods"
  on pod_memberships for delete using (auth.uid() = user_id);


-- ============================================================
-- 5. MESSAGES
-- ============================================================
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references pods(id) on delete cascade,
  author_id uuid not null references profiles(id),
  parent_id uuid references messages(id),
  reply_mode text not null default 'add' check (reply_mode in ('add','question','steelman')),
  content text not null check (length(content) > 0),
  moderation_status text not null default 'ok' check (moderation_status in ('ok','flagged','blocked')),
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Messages are readable by all"
  on messages for select using (true);

create policy "Authenticated can post messages"
  on messages for insert with check (auth.uid() = author_id);


-- ============================================================
-- 6. REACTIONS
-- ============================================================
create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('resonates','changed_my_mind','curious')),
  created_at timestamptz default now(),
  unique (message_id, user_id, type)
);

alter table reactions enable row level security;

create policy "Reactions are readable by all"
  on reactions for select using (true);

create policy "Authenticated can react"
  on reactions for insert with check (auth.uid() = user_id);

create policy "Users can remove own reactions"
  on reactions for delete using (auth.uid() = user_id);


-- ============================================================
-- 7. ARCHIVE SUMMARIES
-- ============================================================
create table if not exists archive_summaries (
  pod_id uuid primary key references pods(id),
  summary_text text not null,
  key_threads jsonb,
  generated_at timestamptz default now()
);

alter table archive_summaries enable row level security;

create policy "Archive summaries are publicly readable"
  on archive_summaries for select using (true);


-- ============================================================
-- 8. VIEWS (for convenience queries)
-- ============================================================

-- Pod with member count and topic info
create or replace view pods_with_details as
select
  p.*,
  t.name as topic_name,
  t.slug as topic_slug,
  t.accent_hex as topic_color,
  t.discussion_mode,
  coalesce(mc.member_count, 0) as member_count
from pods p
join topics t on t.id = p.topic_id
left join (
  select pod_id, count(*) as member_count
  from pod_memberships
  group by pod_id
) mc on mc.pod_id = p.id;


-- ============================================================
-- 9. REALTIME
-- ============================================================
alter publication supabase_realtime add table pods;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table reactions;
alter publication supabase_realtime add table pod_memberships;

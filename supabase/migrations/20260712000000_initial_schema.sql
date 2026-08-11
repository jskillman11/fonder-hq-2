-- Fonder HQ initial schema
-- Hierarchy: clients -> programs -> initiatives -> projects
-- RLS is enabled with permissive read-only policies for now (anon/authenticated
-- can select everything). Per-client isolation policies land in the auth step;
-- this interim state keeps the app working end-to-end without exposing writes.

create extension if not exists pgcrypto;

-- ─── lookups ────────────────────────────────────────────────────────────────

create table services (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  tag_class text not null, -- css pill class suffix, e.g. 't-brand'
  created_at timestamptz not null default now()
);

create table data_sources (
  id uuid primary key default gen_random_uuid(),
  key text unique not null, -- shopify | ga4 | klaviyo | manual
  label text not null,
  live boolean, -- true = live, false = wiring, null = manual/no dot
  created_at timestamptz not null default now()
);

-- ─── core hierarchy ─────────────────────────────────────────────────────────

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sub text, -- e.g. "Formerly Raw Eddy's"
  created_at timestamptz not null default now()
);

create table programs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  timeframe_label text, -- "Q4 2025 – Q4 2027"
  stage text, -- "Launch → Traction"
  health text, -- on-track | at-risk | ...
  updated_on date,
  next_review date,
  current_week text, -- "Week 2 of 13"
  current_quarter_code text, -- "Q3 '26"
  headline text[], -- two-line headline
  thesis text,
  north_star jsonb, -- { value, hero:{...}, drivers:[...] }
  window_start date,
  window_end date,
  window_label text,
  arc_start date,
  arc_end date,
  created_at timestamptz not null default now()
);

create table initiatives (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  code text not null, -- "0","1","2","3"
  name text not null,
  description text,
  timeframe_start date,
  timeframe_end date,
  timeframe_label text,
  status text not null, -- complete | in-progress | upcoming
  why text,
  bench jsonb, -- [{l,v}, ...]
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid not null references initiatives(id) on delete cascade,
  code text not null, -- "0A","1B"...
  name text not null,
  timeframe_label text, -- "Apr – May '26"
  start_date date,
  end_date date,
  status text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table project_services (
  project_id uuid not null references projects(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (project_id, service_id)
);

-- ─── scorecard ──────────────────────────────────────────────────────────────

create table metrics (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  group_name text not null, -- Growth | Acquisition | Retention | Economics
  label text not null,
  now_value text,
  target_value text,
  spark jsonb, -- array of numbers, or null
  status text not null, -- on-track | at-risk | pending
  source_id uuid references data_sources(id),
  warn_note text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── decisions & gates ──────────────────────────────────────────────────────

create table decisions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  date_label text, -- "Jul '26" (display label; exact day not tracked in source)
  sort_date date, -- best-effort date for ordering
  title text not null,
  body text,
  status text not null, -- active | standing
  created_at timestamptz not null default now()
);

create table gates (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  after_initiative_id uuid references initiatives(id) on delete set null,
  label text not null,
  body text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── pulse (needs-you / flags / up-next / activity) ────────────────────────

create table action_items (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  type text not null check (type in ('needs_you', 'flag', 'up_next', 'activity')),
  title text, -- needs_you
  body text, -- main text content for any type
  kind text, -- needs_you: approve | confirm | logistics
  label text, -- flag: "Flag · open question"
  due_date date, -- needs_you
  date_label text, -- up_next / activity display date, e.g. "Jul 21"
  lane text, -- up_next: Web | Creative | Program
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── quarter ────────────────────────────────────────────────────────────────

create table quarters (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  code text not null, -- "Q3 '26"
  name text not null,
  date_label text, -- "July – September 2026"
  focus text,
  priorities jsonb, -- [{pri,title,scope,why}, ...]
  matrix jsonb, -- lane matrix data
  bench jsonb, -- [{l,v}, ...] exit benchmarks
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── change log ─────────────────────────────────────────────────────────────

create table change_log (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references programs(id) on delete cascade,
  table_name text not null,
  record_id uuid,
  field_name text,
  old_value text,
  new_value text,
  changed_by uuid references auth.users(id) on delete set null,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

-- ─── profiles (auth user -> client + role) ─────────────────────────────────

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

-- ─── RLS: interim permissive read policies ─────────────────────────────────
-- Locked down to real per-client isolation once auth (profiles-driven RLS) lands.

alter table clients enable row level security;
alter table programs enable row level security;
alter table initiatives enable row level security;
alter table projects enable row level security;
alter table project_services enable row level security;
alter table services enable row level security;
alter table data_sources enable row level security;
alter table metrics enable row level security;
alter table decisions enable row level security;
alter table gates enable row level security;
alter table action_items enable row level security;
alter table quarters enable row level security;
alter table change_log enable row level security;
alter table profiles enable row level security;

create policy "public read" on clients for select using (true);
create policy "public read" on programs for select using (true);
create policy "public read" on initiatives for select using (true);
create policy "public read" on projects for select using (true);
create policy "public read" on project_services for select using (true);
create policy "public read" on services for select using (true);
create policy "public read" on data_sources for select using (true);
create policy "public read" on metrics for select using (true);
create policy "public read" on decisions for select using (true);
create policy "public read" on gates for select using (true);
create policy "public read" on action_items for select using (true);
create policy "public read" on quarters for select using (true);
-- change_log and profiles are not exposed for public read; only service_role
-- (used server-side / in the seed script) can access them until auth lands.

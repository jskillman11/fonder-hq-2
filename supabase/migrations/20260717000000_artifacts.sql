-- Light v1 of the Artifacts tab: a place to store rendered research/strategy
-- docs per client (e.g. Channel Strategy, growth-assumption research) outside
-- the roadmap tables. Admin-authored only for now — no client-facing editor.

create table artifacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  content text not null, -- markdown, rendered client-side
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table artifacts enable row level security;

create policy "select own or admin" on artifacts for select to authenticated
  using (current_profile_role() = 'admin' or client_id = current_profile_client_id());
create policy "admin insert" on artifacts for insert to authenticated
  with check (current_profile_role() = 'admin');
create policy "admin update" on artifacts for update to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');
create policy "admin delete" on artifacts for delete to authenticated
  using (current_profile_role() = 'admin');

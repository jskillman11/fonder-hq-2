-- 1. Give quarterly priorities their own table (was a single JSON blob on
--    quarters) so title/scope/why can be inline-edited like everything else.
create table priorities (
  id uuid primary key default gen_random_uuid(),
  quarter_id uuid not null references quarters(id) on delete cascade,
  pri_label text not null,
  title text not null,
  scope text not null,
  why text not null,
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table priorities enable row level security;

create policy "select own or admin" on priorities for select to authenticated
  using (
    current_profile_role() = 'admin'
    or quarter_id in (
      select id from quarters where program_id in (
        select id from programs where client_id = current_profile_client_id()
      )
    )
  );
create policy "admin insert" on priorities for insert to authenticated
  with check (current_profile_role() = 'admin');
create policy "admin update" on priorities for update to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');
create policy "admin delete" on priorities for delete to authenticated
  using (current_profile_role() = 'admin');

-- 2. Per-client icon background color (e.g. Gozo's pink), replacing a
-- one-off hardcoded hex in the code.
alter table clients add column icon_color text;
update clients set icon_color = '#fa9fc9' where name = 'Gozo';

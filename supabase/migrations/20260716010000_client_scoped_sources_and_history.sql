-- Applied manually via the Supabase dashboard SQL Editor on 2026-07-16
-- (no local DB password available for `supabase db push` at the time).
-- This file exists so migration history stays in sync with the live DB —
-- do not re-run against a database that's already had it applied.

begin;

-- ── 1. change_log: let clients read their own program's edit history ───────
-- Writes stay admin-only (unchanged); this only opens up reads.
drop policy "admin only" on change_log;

create policy "select own or admin" on change_log for select to authenticated
  using (
    current_profile_role() = 'admin'
    or program_id in (select id from programs where client_id = current_profile_client_id())
  );
create policy "admin insert" on change_log for insert to authenticated
  with check (current_profile_role() = 'admin');
create policy "admin update" on change_log for update to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');
create policy "admin delete" on change_log for delete to authenticated
  using (current_profile_role() = 'admin');

-- ── 2. data_sources: make per-client instead of shared/global ───────────────
alter table data_sources add column client_id uuid references clients(id) on delete cascade;

-- backfill existing rows onto Gozo, the only client using them before this migration
update data_sources set client_id = (select id from clients where name = 'Gozo');

alter table data_sources drop constraint data_sources_key_key;
alter table data_sources alter column client_id set not null;
alter table data_sources add constraint data_sources_client_id_key_key unique (client_id, key);

drop policy "authenticated read" on data_sources;
create policy "select own or admin" on data_sources for select to authenticated
  using (current_profile_role() = 'admin' or client_id = current_profile_client_id());
create policy "admin insert" on data_sources for insert to authenticated
  with check (current_profile_role() = 'admin');
create policy "admin update" on data_sources for update to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');
create policy "admin delete" on data_sources for delete to authenticated
  using (current_profile_role() = 'admin');

commit;

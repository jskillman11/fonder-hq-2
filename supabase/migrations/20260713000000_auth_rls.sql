-- Real per-client RLS isolation, replacing the interim permissive policies
-- from the initial schema migration. A user's role/client_id come from
-- their profiles row (linked 1:1 to auth.users). Admins see and write
-- everything; client-role users only ever see rows tracing back to their
-- own client_id through the clients -> programs -> initiatives -> projects
-- hierarchy.

create or replace function current_profile_role() returns text
language sql security definer stable
set search_path = public
as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function current_profile_client_id() returns uuid
language sql security definer stable
set search_path = public
as $$
  select client_id from profiles where id = auth.uid()
$$;

-- ── drop interim permissive policies ────────────────────────────────────
drop policy "public read" on clients;
drop policy "public read" on programs;
drop policy "public read" on initiatives;
drop policy "public read" on projects;
drop policy "public read" on project_services;
drop policy "public read" on services;
drop policy "public read" on data_sources;
drop policy "public read" on metrics;
drop policy "public read" on decisions;
drop policy "public read" on gates;
drop policy "public read" on action_items;
drop policy "public read" on quarters;

-- ── shared lookups: any authenticated user, no client scoping ──────────
create policy "authenticated read" on services for select to authenticated using (true);
create policy "authenticated read" on data_sources for select to authenticated using (true);

-- ── clients ──────────────────────────────────────────────────────────────
create policy "select own or admin" on clients for select to authenticated
  using (current_profile_role() = 'admin' or id = current_profile_client_id());
create policy "admin write" on clients for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- ── programs ─────────────────────────────────────────────────────────────
create policy "select own or admin" on programs for select to authenticated
  using (current_profile_role() = 'admin' or client_id = current_profile_client_id());
create policy "admin write" on programs for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- ── initiatives ──────────────────────────────────────────────────────────
create policy "select own or admin" on initiatives for select to authenticated
  using (
    current_profile_role() = 'admin'
    or program_id in (select id from programs where client_id = current_profile_client_id())
  );
create policy "admin write" on initiatives for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- ── projects ─────────────────────────────────────────────────────────────
create policy "select own or admin" on projects for select to authenticated
  using (
    current_profile_role() = 'admin'
    or initiative_id in (
      select id from initiatives where program_id in (
        select id from programs where client_id = current_profile_client_id()
      )
    )
  );
create policy "admin write" on projects for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- ── project_services ─────────────────────────────────────────────────────
create policy "select own or admin" on project_services for select to authenticated
  using (
    current_profile_role() = 'admin'
    or project_id in (
      select id from projects where initiative_id in (
        select id from initiatives where program_id in (
          select id from programs where client_id = current_profile_client_id()
        )
      )
    )
  );
create policy "admin write" on project_services for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- ── program-scoped content: metrics, decisions, gates, action_items, quarters ──
create policy "select own or admin" on metrics for select to authenticated
  using (
    current_profile_role() = 'admin'
    or program_id in (select id from programs where client_id = current_profile_client_id())
  );
create policy "admin write" on metrics for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

create policy "select own or admin" on decisions for select to authenticated
  using (
    current_profile_role() = 'admin'
    or program_id in (select id from programs where client_id = current_profile_client_id())
  );
create policy "admin write" on decisions for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

create policy "select own or admin" on gates for select to authenticated
  using (
    current_profile_role() = 'admin'
    or program_id in (select id from programs where client_id = current_profile_client_id())
  );
create policy "admin write" on gates for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

create policy "select own or admin" on action_items for select to authenticated
  using (
    current_profile_role() = 'admin'
    or program_id in (select id from programs where client_id = current_profile_client_id())
  );
create policy "admin write" on action_items for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

create policy "select own or admin" on quarters for select to authenticated
  using (
    current_profile_role() = 'admin'
    or program_id in (select id from programs where client_id = current_profile_client_id())
  );
create policy "admin write" on quarters for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- ── change_log: admin only, both read and write ─────────────────────────
create policy "admin only" on change_log for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- ── profiles: self can read own row; admin can read/write all ──────────
create policy "self or admin read" on profiles for select to authenticated
  using (id = auth.uid() or current_profile_role() = 'admin');
create policy "admin insert" on profiles for insert to authenticated
  with check (current_profile_role() = 'admin');
create policy "admin update" on profiles for update to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');
create policy "admin delete" on profiles for delete to authenticated
  using (current_profile_role() = 'admin');

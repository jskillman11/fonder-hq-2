-- Fixes an unintended draft leak: the 2026-07-16 migration widened
-- change_log's SELECT policy so a client can read their own program's edit
-- history, but never filtered on status — so a client-role caller could
-- read *unpublished* ('draft') rows too, directly contradicting the
-- draft/publish model ("nothing goes live to the client until published").
-- App code (get-program-data.js, EditableText.jsx) is also fixed in the
-- same change to gate draft fetching/display on isAdmin explicitly, rather
-- than relying on RLS alone.
--
-- Apply manually via the Supabase dashboard SQL editor (no local DB password
-- for `supabase db push` — see HANDOFF.md) — open this file directly in an
-- editor and copy from there, not from a chat window.

begin;

drop policy "select own or admin" on change_log;

create policy "select own or admin" on change_log for select to authenticated
  using (
    current_profile_role() = 'admin'
    or (
      status = 'published'
      and program_id in (select id from programs where client_id = current_profile_client_id())
    )
  );

commit;

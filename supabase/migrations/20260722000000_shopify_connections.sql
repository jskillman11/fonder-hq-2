-- Shopify live-data connections, secured via Supabase Vault, plus a stable
-- metric_key for the sync job to write against instead of matching on the
-- human-editable label text. Apply manually via the Supabase dashboard SQL
-- editor (no local DB password for `supabase db push`) — open this file
-- directly in an editor and copy from there, not from a chat window (see
-- the SQL-editor copy-paste note from the 2026-07-19 session).

begin;

create extension if not exists supabase_vault;

-- ── metrics: stable machine key for automated syncs ─────────────────────────
alter table metrics add column metric_key text;
create unique index metrics_program_metric_key_key on metrics (program_id, metric_key) where metric_key is not null;

update metrics set metric_key = 'shopify_revenue_3mo_avg' where label = 'Monthly revenue (3-mo avg)';
update metrics set metric_key = 'shopify_arr' where label = 'Annual run rate';
update metrics set metric_key = 'shopify_orders_per_month' where label = 'Total orders / month';
update metrics set metric_key = 'shopify_new_customers_per_month' where label = 'Total new customers / month';
update metrics set metric_key = 'shopify_aov' where label = 'Average order value';
update metrics set metric_key = 'shopify_repeat_purchase_rate' where label = 'Repeat purchase rate';

-- ── shopify_connections: one row per client; the token itself never lands
-- in a normal column, only a reference to its Vault secret ────────────────
create table shopify_connections (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients(id) on delete cascade,
  store_domain text not null, -- e.g. "gozo-snacks.myshopify.com"
  vault_secret_id uuid not null references vault.secrets(id) on delete cascade,
  last_synced_at timestamptz,
  last_sync_status text check (last_sync_status in ('ok', 'error')),
  last_sync_error text,
  created_at timestamptz not null default now()
);

alter table shopify_connections enable row level security;

-- Admin-only, read and write. Deliberately no client-role policy at all —
-- the client role gets zero rows, not even store_domain.
create policy "admin only" on shopify_connections for all to authenticated
  using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- ── credential functions: the only paths that ever touch a live token ──────

-- Called once from the admin "connect" form, under the caller's own session.
-- Re-checks admin role explicitly since SECURITY DEFINER bypasses RLS.
create or replace function set_shopify_credential(p_client_id uuid, p_domain text, p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret_id uuid;
begin
  if current_profile_role() <> 'admin' then
    raise exception 'Admin access required.';
  end if;

  select vault_secret_id into v_secret_id from shopify_connections where client_id = p_client_id;

  if v_secret_id is not null then
    perform vault.update_secret(v_secret_id, p_token);
  else
    v_secret_id := vault.create_secret(p_token, 'shopify_token:' || p_client_id::text);
  end if;

  insert into shopify_connections (client_id, store_domain, vault_secret_id)
  values (p_client_id, p_domain, v_secret_id)
  on conflict (client_id) do update
    set store_domain = excluded.store_domain, vault_secret_id = excluded.vault_secret_id;

  return v_secret_id;
end;
$$;

revoke all on function set_shopify_credential(uuid, text, text) from public, anon, authenticated;
grant execute on function set_shopify_credential(uuid, text, text) to authenticated;

-- Service-role only — this is what the cron/manual sync job calls. No
-- admin-role check by design (the service role already bypasses roles
-- entirely); instead access is locked down purely via the grant below, so
-- only a service-role connection (never the browser, never a client session)
-- can ever decrypt a token.
create or replace function get_shopify_token(p_client_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select decrypted_secret from vault.decrypted_secrets
  where id = (select vault_secret_id from shopify_connections where client_id = p_client_id);
$$;

revoke all on function get_shopify_token(uuid) from public, anon, authenticated;
grant execute on function get_shopify_token(uuid) to service_role;

-- Wipes both the vault secret and the connection row, and flips the client's
-- shopify data_sources row back to not-live if one exists.
create or replace function disconnect_shopify(p_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret_id uuid;
begin
  if current_profile_role() <> 'admin' then
    raise exception 'Admin access required.';
  end if;

  select vault_secret_id into v_secret_id from shopify_connections where client_id = p_client_id;
  delete from shopify_connections where client_id = p_client_id;
  if v_secret_id is not null then
    delete from vault.secrets where id = v_secret_id;
  end if;

  update data_sources set live = false where client_id = p_client_id and key = 'shopify';
end;
$$;

revoke all on function disconnect_shopify(uuid) from public, anon, authenticated;
grant execute on function disconnect_shopify(uuid) to authenticated;

commit;

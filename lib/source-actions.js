"use server";

import { createClient } from "./supabase/server";
import { formatRelative } from "./get-program-data";
import { syncShopifyForClient } from "./shopify-sync";

async function requireAdmin(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Admin access required.");
  return user;
}

// data_sources is per-client (see the 2026-07-16 migration) — pass a
// clientId to scope the list to one client's connections. If a live
// shopify_connections row exists for this client, its status is attached to
// the "shopify" row so the UI can show real connection state, not just the
// manual live flag. Missing/errored here (e.g. migration not applied yet)
// degrades gracefully to the plain toggle, rather than failing the page.
export async function listSources(clientId) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  let query = supabase.from("data_sources").select("id, key, label, live, client_id").order("key");
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  if (clientId) {
    const { data: connection } = await supabase
      .from("shopify_connections")
      .select("store_domain, last_synced_at, last_sync_status, last_sync_error")
      .eq("client_id", clientId)
      .maybeSingle();
    const shopifyRow = connection && data.find((s) => s.key === "shopify");
    if (shopifyRow) {
      shopifyRow.connection = {
        storeDomain: connection.store_domain,
        lastSyncedAt: connection.last_synced_at ? formatRelative(connection.last_synced_at) : null,
        lastSyncStatus: connection.last_sync_status,
        lastSyncError: connection.last_sync_error,
      };
    }
  }

  return data;
}

// Stores the store domain + access token via the set_shopify_credential SQL
// function (the token itself lands only in Supabase Vault, never a plain
// column — see the 2026-07-22 migration) and marks the source live.
export async function connectShopify(clientId, domain, token) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");

  const { error } = await supabase.rpc("set_shopify_credential", {
    p_client_id: clientId,
    p_domain: cleanDomain,
    p_token: token.trim(),
  });
  if (error) throw new Error(error.message);

  const { error: sourceError } = await supabase
    .from("data_sources")
    .update({ live: true })
    .eq("client_id", clientId)
    .eq("key", "shopify");
  if (sourceError) throw new Error(sourceError.message);
}

// Wipes the vault secret + connection row and flips the source back to
// not-live (all handled inside the disconnect_shopify SQL function).
export async function disconnectShopify(clientId) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { error } = await supabase.rpc("disconnect_shopify", { p_client_id: clientId });
  if (error) throw new Error(error.message);
}

// Runs the same sync the daily cron uses, on demand, for one client.
export async function syncShopifyNow(clientId) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  return syncShopifyForClient(clientId);
}

// Runs under the regular session client now — data_sources has a real
// "admin write" RLS policy as of the per-client migration, so this no
// longer needs the service-role key.
export async function toggleSourceLive(sourceId, live) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { error } = await supabase.from("data_sources").update({ live }).eq("id", sourceId);
  if (error) throw new Error(error.message);
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncShopifyForClient } from "@/lib/shopify-sync";

// Vercel Cron hits this daily (see vercel.json) with an
// `Authorization: Bearer $CRON_SECRET` header it injects automatically once
// CRON_SECRET is set as a project env var — this route rejects anything
// else, so it can't be triggered by an outside request.
export async function GET(request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: connections, error } = await supabase.from("shopify_connections").select("client_id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  for (const { client_id } of connections ?? []) {
    try {
      const result = await syncShopifyForClient(client_id);
      results.push({ clientId: client_id, ok: true, orderCount: result.orderCount });
    } catch (err) {
      results.push({ clientId: client_id, ok: false, error: err.message });
    }
  }

  return NextResponse.json({ synced: results.length, results });
}

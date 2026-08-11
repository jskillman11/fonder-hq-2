import { createAdminClient } from "./supabase/admin";

// Bump periodically — Shopify's Admin API versions are quarterly.
const API_VERSION = "2025-10";
const DAY_MS = 24 * 60 * 60 * 1000;
// Covers the 8-month spark window with a buffer; a single fetch here backs
// every window (30-day, 90-day, 8-month) computed below.
const FETCH_WINDOW_DAYS = 245;

function isoDaysAgo(days, now = new Date()) {
  return new Date(now.getTime() - days * DAY_MS).toISOString();
}

async function shopifyGraphQL(domain, token, query, variables) {
  const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) {
    throw new Error(`Shopify API error (${res.status}): ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.data;
}

const ORDERS_QUERY = `
  query OrdersSince($search: String!, $cursor: String) {
    orders(first: 100, after: $cursor, query: $search, sortKey: CREATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes {
        createdAt
        currentTotalPriceSet { shopMoney { amount } }
        customer { id numberOfOrders }
      }
    }
  }
`;

async function fetchOrdersSince(domain, token, sinceISO) {
  const orders = [];
  let cursor = null;
  do {
    const data = await shopifyGraphQL(domain, token, ORDERS_QUERY, {
      search: `created_at:>=${sinceISO}`,
      cursor,
    });
    orders.push(...data.orders.nodes);
    cursor = data.orders.pageInfo.hasNextPage ? data.orders.pageInfo.endCursor : null;
  } while (cursor);
  return orders;
}

function monthBucketKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function trimTrailingZero(numStr) {
  return numStr.replace(/\.0$/, "");
}

function formatK(amount) {
  const k = amount / 1000;
  return `$${k < 10 ? trimTrailingZero(k.toFixed(1)) : Math.round(k)}k`;
}

function formatMoney(amount) {
  return `$${Math.round(amount)}`;
}

function formatPercent(fraction) {
  return `${trimTrailingZero((fraction * 100).toFixed(1))}%`;
}

// Pure function over a flat order list — kept separate from the Shopify
// fetch and DB writes so the math can be sanity-checked/tested on its own.
export function computeMetrics(orders, now = new Date()) {
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * DAY_MS);

  const monthlyRevenue = new Map();
  for (const o of orders) {
    const amount = Number(o.currentTotalPriceSet.shopMoney.amount);
    const key = monthBucketKey(new Date(o.createdAt));
    monthlyRevenue.set(key, (monthlyRevenue.get(key) ?? 0) + amount);
  }
  const monthKeys = [];
  for (let i = 7; i >= 0; i--) {
    monthKeys.push(monthBucketKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  // $k, 1 decimal — matches the seeded spark arrays' precision.
  const revenueSpark = monthKeys.map((k) => Math.round((monthlyRevenue.get(k) ?? 0) / 100) / 10);
  const arrSpark = revenueSpark.map((v) => Math.round(v * 12));

  const trailing90Revenue = orders
    .filter((o) => new Date(o.createdAt) >= ninetyDaysAgo)
    .reduce((sum, o) => sum + Number(o.currentTotalPriceSet.shopMoney.amount), 0);
  const monthlyAvgRevenue = trailing90Revenue / 3;
  const arr = monthlyAvgRevenue * 12;

  const trailing30 = orders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
  const trailing30Revenue = trailing30.reduce((sum, o) => sum + Number(o.currentTotalPriceSet.shopMoney.amount), 0);
  const orderCount = trailing30.length;
  const aov = orderCount > 0 ? trailing30Revenue / orderCount : 0;

  // numberOfOrders is the customer's lifetime order count as of now, so a
  // value of 1 on an order inside the window means that order was (and
  // still is) their only order ever — i.e. a new customer this window.
  const customersInWindow = new Map();
  for (const o of trailing30) {
    if (o.customer) customersInWindow.set(o.customer.id, o.customer.numberOfOrders);
  }
  const distinctCustomers = customersInWindow.size;
  const newCustomers = [...customersInWindow.values()].filter((n) => n === 1).length;
  const repeatCustomers = [...customersInWindow.values()].filter((n) => n > 1).length;
  const repeatRate = distinctCustomers > 0 ? repeatCustomers / distinctCustomers : 0;

  return {
    shopify_revenue_3mo_avg: { now_value: formatK(monthlyAvgRevenue), spark: revenueSpark },
    shopify_arr: { now_value: formatK(arr), spark: arrSpark },
    shopify_orders_per_month: { now_value: String(orderCount), spark: null },
    shopify_new_customers_per_month: { now_value: String(newCustomers), spark: null },
    shopify_aov: { now_value: formatMoney(aov), spark: null },
    shopify_repeat_purchase_rate: { now_value: formatPercent(repeatRate), spark: null },
  };
}

async function writeMetric(supabase, programId, metricKey, result) {
  const { data: metric, error } = await supabase
    .from("metrics")
    .select("id, now_value")
    .eq("program_id", programId)
    .eq("metric_key", metricKey)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!metric) return; // not seeded for this program (yet) — nothing to update

  const patch = { now_value: result.now_value };
  if (result.spark) patch.spark = result.spark;
  const { error: updateError } = await supabase.from("metrics").update(patch).eq("id", metric.id);
  if (updateError) throw new Error(updateError.message);

  if (metric.now_value !== result.now_value) {
    const { error: logError } = await supabase.from("change_log").insert({
      program_id: programId,
      table_name: "metrics",
      record_id: metric.id,
      field_name: "now_value",
      old_value: metric.now_value,
      new_value: result.now_value,
      status: "published",
    });
    if (logError) throw new Error(logError.message);
  }
}

// The single entry point used by both the daily cron route and the admin
// "Sync now" action — one code path, so they can never drift.
export async function syncShopifyForClient(clientId) {
  const supabase = createAdminClient();

  const { data: connection, error: connError } = await supabase
    .from("shopify_connections")
    .select("store_domain")
    .eq("client_id", clientId)
    .maybeSingle();
  if (connError) throw new Error(connError.message);
  if (!connection) throw new Error("No Shopify connection for this client.");

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("id")
    .eq("client_id", clientId)
    .limit(1)
    .single();
  if (programError) throw new Error(programError.message);

  try {
    const { data: token, error: tokenError } = await supabase.rpc("get_shopify_token", { p_client_id: clientId });
    if (tokenError) throw new Error(tokenError.message);
    if (!token) throw new Error("Shopify token could not be decrypted.");

    const orders = await fetchOrdersSince(connection.store_domain, token, isoDaysAgo(FETCH_WINDOW_DAYS));
    const metrics = computeMetrics(orders);
    for (const [key, result] of Object.entries(metrics)) {
      await writeMetric(supabase, program.id, key, result);
    }

    await supabase
      .from("shopify_connections")
      .update({ last_synced_at: new Date().toISOString(), last_sync_status: "ok", last_sync_error: null })
      .eq("client_id", clientId);

    return { ok: true, orderCount: orders.length, metrics };
  } catch (err) {
    await supabase
      .from("shopify_connections")
      .update({ last_synced_at: new Date().toISOString(), last_sync_status: "error", last_sync_error: err.message })
      .eq("client_id", clientId);
    throw err;
  }
}

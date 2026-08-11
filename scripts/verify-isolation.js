// Proves RLS isolation directly against the DB (not just app-level logic),
// using the confirmed test users from seed-test-fixtures.js. Run after that
// script. Not a full test framework — just clear assertions with exit(1) on
// failure, safe to leave in the repo as a standing isolation check.
//
// Usage: npm run verify:isolation

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let failures = 0;
function assert(cond, label) {
  if (cond) {
    console.log(`  ✓ ${label}`);
  } else {
    console.log(`  ✗ ${label}`);
    failures++;
  }
}

async function signedInClient(email, password) {
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign in ${email}: ${error.message}`);
  return supabase;
}

async function main() {
  console.log("test-gozo (client role, scoped to Gozo):");
  const gozo = await signedInClient("test-gozo@example.com", "test-gozo-pw-1!");
  const gozoClients = await gozo.from("clients").select("name");
  assert(gozoClients.data?.length === 1 && gozoClients.data[0].name === "Gozo", "sees exactly its own client (Gozo)");

  const acmeViaGozo = await gozo.from("clients").select("*").eq("name", "Acme Test Co");
  assert((acmeViaGozo.data ?? []).length === 0, "cannot see the other client (Acme) even by direct query");

  const gozoWrite = await gozo.from("decisions").update({ title: "tampered" }).eq("title", "Test decision").select();
  assert((gozoWrite.data ?? []).length === 0, "client role cannot write (blocked by admin-only write policy)");

  // data_sources is per-client (both Gozo and Acme have their own "manual"
  // row) — Gozo should only ever see its own 4, never Acme's, even though
  // the key names overlap.
  const gozoSources = await gozo.from("data_sources").select("key");
  assert((gozoSources.data?.length ?? 0) === 4, "sees exactly its own 4 data sources, not Acme's");

  // shopify_connections is admin-only with no client-role policy at all —
  // Gozo's own connection fixture must be invisible even to a Gozo-scoped
  // client user, not just to other clients.
  const gozoShopifyConn = await gozo.from("shopify_connections").select("*");
  assert((gozoShopifyConn.data ?? []).length === 0, "cannot read its own shopify_connections row (admin-only table)");

  console.log("\ntest-acme (client role, scoped to Acme Test Co):");
  const acmeUser = await signedInClient("test-acme@example.com", "test-acme-pw-1!");
  const acmeClients = await acmeUser.from("clients").select("name");
  assert(
    acmeClients.data?.length === 1 && acmeClients.data[0].name === "Acme Test Co",
    "sees exactly its own client (Acme Test Co)"
  );
  const gozoViaAcme = await acmeUser.from("clients").select("*").eq("name", "Gozo");
  assert((gozoViaAcme.data ?? []).length === 0, "cannot see the other client (Gozo)");

  const acmeSources = await acmeUser.from("data_sources").select("key");
  assert((acmeSources.data?.length ?? 0) === 1, "sees exactly its own 1 data source, not Gozo's 4");

  console.log("\ntest-admin (admin role):");
  const admin = await signedInClient("test-admin@example.com", "test-admin-pw-1!");
  const adminClients = await admin.from("clients").select("name");
  const names = (adminClients.data ?? []).map((c) => c.name).sort();
  assert(names.includes("Gozo") && names.includes("Acme Test Co"), "sees both clients");

  const adminSources = await admin.from("data_sources").select("key");
  assert((adminSources.data?.length ?? 0) >= 5, "sees data sources across both clients (4 + 1)");

  const adminShopifyConn = await admin.from("shopify_connections").select("client_id");
  assert((adminShopifyConn.data?.length ?? 0) >= 1, "sees the Gozo shopify_connections fixture");

  console.log(failures === 0 ? "\nAll isolation checks passed." : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

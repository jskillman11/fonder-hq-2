// Creates a minimal second client plus three confirmed test users (one
// scoped to Gozo, one to the dummy client, one admin) so multi-tenant
// isolation can be verified end-to-end without depending on a real inbox.
// Safe to rerun: deletes/recreates the dummy client and test users first.
//
// Usage: npm run seed:test-fixtures

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const TEST_USERS = [
  { email: "test-gozo@example.com", password: "test-gozo-pw-1!", role: "client", clientName: "Gozo" },
  { email: "test-acme@example.com", password: "test-acme-pw-1!", role: "client", clientName: "Acme Test Co" },
  { email: "test-admin@example.com", password: "test-admin-pw-1!", role: "admin", clientName: null },
];

function must(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

async function deleteExistingTestUsers() {
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
  for (const email of TEST_USERS.map((u) => u.email)) {
    const existing = list.users.find((u) => u.email === email);
    if (existing) await supabase.auth.admin.deleteUser(existing.id);
  }
}

async function seedDummyClient() {
  await supabase.from("clients").delete().eq("name", "Acme Test Co");

  const client = must(
    await supabase.from("clients").insert({ name: "Acme Test Co", sub: "Isolation test fixture" }).select().single(),
    "acme client"
  );

  // data_sources is per-client — Acme needs its own "manual" row, separate
  // from Gozo's, for the fixture metric below to reference.
  await supabase
    .from("data_sources")
    .upsert({ client_id: client.id, key: "manual", label: "Manual", live: null }, { onConflict: "client_id,key" });

  const program = must(
    await supabase
      .from("programs")
      .insert({
        client_id: client.id,
        timeframe_label: "Test window",
        stage: "Test",
        health: "on-track",
        updated_on: "2026-07-01",
        next_review: "2026-08-01",
        current_week: "Week 1 of 1",
        current_quarter_code: "T1",
        headline: ["Test client.", "Fixture for isolation checks."],
        thesis: "Fixture data used to verify RLS isolation between clients.",
        north_star: {
          value: "n/a",
          hero: { label: "Test metric", now: "0", target: "1", spark: null, note: "Fixture." },
          drivers: [],
        },
        ramp: { sub: "Fixture — no ramp data.", rows: [] },
        window_start: "2026-07-01",
        window_end: "2026-08-01",
        window_label: "Test window",
        arc_start: "2026-07-01",
        arc_end: "2026-08-01",
      })
      .select()
      .single(),
    "acme program"
  );

  const initiative = must(
    await supabase
      .from("initiatives")
      .insert({
        program_id: program.id,
        code: "0",
        name: "Test initiative",
        description: "Fixture initiative.",
        timeframe_start: "2026-07-01",
        timeframe_end: "2026-08-01",
        timeframe_label: "Test",
        status: "in-progress",
        why: "Fixture.",
        bench: [],
        sort_order: 0,
      })
      .select()
      .single(),
    "acme initiative"
  );

  const brandService = must(await supabase.from("services").select("id").eq("name", "Brand").single(), "brand service");

  const project = must(
    await supabase
      .from("projects")
      .insert({
        initiative_id: initiative.id,
        code: "0A",
        name: "Test project",
        timeframe_label: "Test",
        start_date: "2026-07-01",
        end_date: "2026-08-01",
        status: "in-progress",
        sort_order: 0,
      })
      .select()
      .single(),
    "acme project"
  );
  await supabase.from("project_services").insert({ project_id: project.id, service_id: brandService.id });

  await supabase.from("gates").insert({
    program_id: program.id,
    after_initiative_id: initiative.id,
    label: "Gate · Test",
    body: "Fixture gate.",
    sort_order: 0,
  });

  const manualSource = must(
    await supabase.from("data_sources").select("id").eq("client_id", client.id).eq("key", "manual").single(),
    "manual source"
  );
  await supabase.from("metrics").insert({
    program_id: program.id,
    group_name: "Growth",
    label: "Test metric",
    now_value: "0",
    target_value: "1",
    spark: null,
    status: "pending",
    source_id: manualSource.id,
    sort_order: 0,
  });

  await supabase.from("decisions").insert({
    program_id: program.id,
    date_label: "Jul '26",
    sort_date: "2026-07-01",
    title: "Test decision",
    body: "Fixture.",
    status: "active",
  });

  await supabase.from("quarters").insert({
    program_id: program.id,
    code: "T1",
    name: "Test quarter",
    date_label: "July 2026",
    focus: "Fixture.",
    priorities: [],
    matrix: { lanes: [] },
    bench: [],
    is_current: true,
  });

  return client;
}

// Fixture for the shopify_connections isolation check — real row via the
// same set_shopify_credential path production uses (not a raw insert), so
// the FK to a real vault secret is satisfied. Service-role calls bypass the
// function's internal admin check (no auth.uid() in this context), same as
// every other service-role write in this script.
async function seedShopifyFixture(clientId) {
  const { error } = await supabase.rpc("set_shopify_credential", {
    p_client_id: clientId,
    p_domain: "test-gozo-fixture.myshopify.com",
    p_token: "fixture-token-not-real",
  });
  if (error) throw new Error(`shopify fixture: ${error.message}`);
}

async function main() {
  await deleteExistingTestUsers();
  const acmeClient = await seedDummyClient();
  const gozoClient = must(await supabase.from("clients").select("id").eq("name", "Gozo").single(), "gozo client");
  await seedShopifyFixture(gozoClient.id);

  const clientIdByName = { Gozo: gozoClient.id, "Acme Test Co": acmeClient.id };

  for (const u of TEST_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });
    if (error) throw new Error(`create user ${u.email}: ${error.message}`);

    await supabase.from("profiles").insert({
      id: data.user.id,
      role: u.role,
      client_id: u.clientName ? clientIdByName[u.clientName] : null,
    });
  }

  console.log("Test fixtures ready:");
  for (const u of TEST_USERS) console.log(`  ${u.email} / ${u.password} (${u.role}${u.clientName ? ", " + u.clientName : ""})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

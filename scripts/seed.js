// One-off/rerunnable seed script: migrates lib/seed-data.js's DATA object
// into Supabase tables. Uses the service_role key to bypass RLS (this key
// must never be used in app code — only here, and only against .env.local).
//
// Usage: npm run seed

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const { DATA } = require("../lib/seed-data.js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const pad2 = (n) => String(n).padStart(2, "0");

// "Jul 10, 2026" -> "2026-07-10"
function parseLongDate(str) {
  const m = str.match(/^(\w{3})\s+(\d{1,2}),\s*(\d{4})$/);
  if (!m) throw new Error(`Unrecognized long date: ${str}`);
  return `${m[3]}-${pad2(MONTHS[m[1]])}-${pad2(m[2])}`;
}

// "Jul '26" -> "2026-07-01"
function parseMonthYearApos(str) {
  const m = str.match(/^(\w{3})\s+'(\d{2})$/);
  if (!m) throw new Error(`Unrecognized month/year: ${str}`);
  return `${2000 + parseInt(m[2], 10)}-${pad2(MONTHS[m[1]])}-01`;
}

function must(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

async function main() {
  // ── lookups (upsert so reruns don't duplicate) ──────────────────────────
  const serviceRows = Object.entries(DATA.tags).map(([name, tag_class]) => ({ name, tag_class }));
  const services = must(
    await supabase.from("services").upsert(serviceRows, { onConflict: "name" }).select(),
    "services"
  );
  const serviceIdByName = Object.fromEntries(services.map((s) => [s.name, s.id]));

  // ── clear existing client hierarchy (cascades) for idempotent reruns ───
  await supabase.from("clients").delete().eq("name", DATA.client.name);

  // ── client ───────────────────────────────────────────────────────────────
  const client = must(
    await supabase.from("clients").insert({ name: DATA.client.name, sub: DATA.client.sub }).select().single(),
    "client insert"
  );

  // data_sources is per-client (each client has its own Shopify/GA4/etc.
  // connection) — upsert scoped to this client, keyed on (client_id, key).
  const sourceRows = Object.entries(DATA.sources).map(([key, s]) => ({ client_id: client.id, key, label: s.label, live: s.live }));
  const dataSources = must(
    await supabase.from("data_sources").upsert(sourceRows, { onConflict: "client_id,key" }).select(),
    "data_sources"
  );
  const sourceIdByKey = Object.fromEntries(dataSources.map((s) => [s.key, s.id]));

  // ── program ──────────────────────────────────────────────────────────────
  const p = DATA.program;
  const program = must(
    await supabase
      .from("programs")
      .insert({
        client_id: client.id,
        timeframe_label: p.timeframe,
        stage: p.stage,
        health: p.health,
        updated_on: parseLongDate(p.updated),
        next_review: parseLongDate(p.nextReview),
        current_week: p.week,
        current_quarter_code: p.quarter,
        headline: p.headline,
        thesis: p.thesis,
        north_star: DATA.northStar,
        ramp: DATA.ramp,
        window_start: DATA.window.start,
        window_end: DATA.window.end,
        window_label: DATA.window.label,
        arc_start: DATA.arc.start,
        arc_end: DATA.arc.end,
      })
      .select()
      .single(),
    "program insert"
  );

  // ── initiatives + projects + project_services ───────────────────────────
  const initiativeIdByOriginalId = {};
  for (let i = 0; i < DATA.initiatives.length; i++) {
    const init = DATA.initiatives[i];
    const row = must(
      await supabase
        .from("initiatives")
        .insert({
          program_id: program.id,
          code: init.code,
          name: init.name,
          description: init.desc,
          timeframe_start: init.timeframe.start,
          timeframe_end: init.timeframe.end,
          timeframe_label: init.timeframe.label,
          status: init.status,
          why: init.why,
          bench: init.bench,
          sort_order: i,
        })
        .select()
        .single(),
      `initiative ${init.code}`
    );
    initiativeIdByOriginalId[init.id] = row.id;

    for (let j = 0; j < init.projects.length; j++) {
      const proj = init.projects[j];
      const projRow = must(
        await supabase
          .from("projects")
          .insert({
            initiative_id: row.id,
            code: proj.code,
            name: proj.name,
            timeframe_label: proj.tf,
            start_date: proj.start,
            end_date: proj.end,
            status: proj.status,
            sort_order: j,
          })
          .select()
          .single(),
        `project ${proj.code}`
      );

      if (proj.tags?.length) {
        const links = proj.tags.map((tag) => ({ project_id: projRow.id, service_id: serviceIdByName[tag] }));
        must(await supabase.from("project_services").insert(links), `project_services ${proj.code}`);
      }
    }
  }

  // ── gates ────────────────────────────────────────────────────────────────
  for (let i = 0; i < DATA.gates.length; i++) {
    const g = DATA.gates[i];
    must(
      await supabase.from("gates").insert({
        program_id: program.id,
        after_initiative_id: initiativeIdByOriginalId[g.after],
        label: g.label,
        body: g.text,
        sort_order: i,
      }),
      `gate ${g.label}`
    );
  }

  // ── metrics (scorecard) ──────────────────────────────────────────────────
  let metricSort = 0;
  for (const group of DATA.scorecard) {
    for (const row of group.rows) {
      must(
        await supabase.from("metrics").insert({
          program_id: program.id,
          group_name: group.group,
          label: row.m,
          now_value: row.now,
          target_value: row.target,
          spark: row.spark,
          status: row.status,
          source_id: sourceIdByKey[row.src],
          warn_note: row.warn ?? null,
          metric_key: row.key ?? null,
          sort_order: metricSort++,
        }),
        `metric ${row.m}`
      );
    }
  }

  // ── decisions (status "open" carries a due_date; it's the same thing
  // Pulse's "Open decisions" tile shows) ──────────────────────────────────
  for (const d of DATA.decisions) {
    must(
      await supabase.from("decisions").insert({
        program_id: program.id,
        date_label: d.date,
        sort_date: parseMonthYearApos(d.date),
        title: d.title,
        body: d.body,
        status: d.status,
        due_date: d.dueDate ?? null,
      }),
      `decision ${d.title}`
    );
  }

  // ── action items: flag / up_next / activity ─────────────────────────────
  let sort = 0;
  for (const f of DATA.flags) {
    must(
      await supabase.from("action_items").insert({
        program_id: program.id,
        type: "flag",
        label: f.label,
        body: f.text,
        sort_order: sort++,
      }),
      `flag ${f.label}`
    );
  }
  sort = 0;
  for (const u of DATA.upNext) {
    must(
      await supabase.from("action_items").insert({
        program_id: program.id,
        type: "up_next",
        date_label: u.date,
        body: u.text,
        lane: u.lane,
        sort_order: sort++,
      }),
      `up_next ${u.text}`
    );
  }
  sort = 0;
  for (const a of DATA.activity) {
    must(
      await supabase.from("action_items").insert({
        program_id: program.id,
        type: "activity",
        date_label: a.date,
        body: a.entry,
        sort_order: sort++,
      }),
      `activity ${a.entry}`
    );
  }

  // ── quarter ──────────────────────────────────────────────────────────────
  const q = DATA.quarter;
  const quarterRow = must(
    await supabase
      .from("quarters")
      .insert({
        program_id: program.id,
        code: q.code,
        name: q.name,
        date_label: q.dates,
        focus: q.focus,
        matrix: q.matrix,
        bench: q.bench,
        is_current: true,
      })
      .select()
      .single(),
    "quarter"
  );

  // ── quarterly priorities (own table so title/scope/why are inline-editable) ─
  for (let i = 0; i < q.priorities.length; i++) {
    const p = q.priorities[i];
    must(
      await supabase.from("priorities").insert({
        quarter_id: quarterRow.id,
        pri_label: p.pri,
        title: p.title,
        scope: p.scope,
        why: p.why,
        tags: p.tags ?? [],
        sort_order: i,
      }),
      `priority ${p.pri}`
    );
  }

  console.log(`Seeded client "${client.name}" (program ${program.id}) successfully.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

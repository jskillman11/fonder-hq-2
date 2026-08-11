import { createClient } from "./supabase/server";
import { getPendingDrafts } from "./draft-actions";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

// Markdown -> sanitized HTML, done server-side so neither the parser nor the
// sanitizer ever ship to the browser bundle. Admin-authored content only for
// this first version (no client-facing editor), but sanitize anyway rather
// than trust that stays true forever.
function renderArtifactHtml(markdown) {
  return sanitizeHtml(marked.parse(markdown, { async: false }), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt"] },
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-07-10" -> "Jul 10, 2026"
function formatLongDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// "2026-07-18" -> "Jul 18"
function formatShortDate(iso) {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

// "2026-07-10T12:00:00Z" -> "3 days ago" / "today" / "2 months ago"
export function formatRelative(timestamp) {
  const days = Math.floor((Date.now() - new Date(timestamp).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function must(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

// Lists every client the current user can see (RLS-filtered) — for a
// client-role user this is always exactly their own; for admin, all of them.
export async function getAccessibleClients() {
  const supabase = await createClient();
  return must(await supabase.from("clients").select("id, name, sub").order("name"), "clients list");
}

// Looks up the logged-in user's profile (role + client_id).
// Returns null if signed out, or { role: null, email } if signed in but not
// yet provisioned (no profiles row) — accounts are provisioned by an admin,
// not created on first sign-in, so this is an expected state, not an error.
export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, client_id")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(`profile: ${error.message}`);
  if (!profile) return { role: null, client_id: null, email: user.email };

  return { ...profile, email: user.email };
}

// Fetches one client's full program data from Supabase and reshapes it back
// into the same nested object shape the ported UI expects (matching the
// original hardcoded DATA constant). RLS scopes what's visible: a client-role
// user only ever has their own client row to fetch; an admin can pass any
// clientId, or omit it to fall back to the first one they can see.
export async function getProgramData(clientId) {
  const supabase = await createClient();

  const clientQuery = supabase.from("clients").select("*");
  const client = must(
    await (clientId ? clientQuery.eq("id", clientId) : clientQuery).limit(1).single(),
    "client"
  );
  const program = must(
    await supabase.from("programs").select("*").eq("client_id", client.id).limit(1).single(),
    "program"
  );

  const initiativesRaw = must(
    await supabase
      .from("initiatives")
      .select("*, projects(*, project_services(services(name)))")
      .eq("program_id", program.id)
      .order("sort_order")
      .order("sort_order", { foreignTable: "projects" }),
    "initiatives"
  );

  const gatesRaw = must(
    await supabase.from("gates").select("*").eq("program_id", program.id).order("sort_order"),
    "gates"
  );

  const metricsRaw = must(
    await supabase
      .from("metrics")
      .select("*, data_sources(key, label, live)")
      .eq("program_id", program.id)
      .order("sort_order"),
    "metrics"
  );

  const decisionsRaw = must(
    await supabase
      .from("decisions")
      .select("*")
      .eq("program_id", program.id)
      .order("sort_date", { ascending: false })
      .order("created_at", { ascending: true }),
    "decisions"
  );

  const actionItemsRaw = must(
    await supabase.from("action_items").select("*").eq("program_id", program.id).order("sort_order"),
    "action_items"
  );

  const quarter = must(
    await supabase.from("quarters").select("*").eq("program_id", program.id).eq("is_current", true).limit(1).single(),
    "quarter"
  );

  const prioritiesRaw = must(
    await supabase.from("priorities").select("*").eq("quarter_id", quarter.id).order("sort_order"),
    "priorities"
  );

  const servicesRaw = must(await supabase.from("services").select("*"), "services");

  const artifactsRaw = must(
    await supabase.from("artifacts").select("*").eq("client_id", client.id).order("sort_order"),
    "artifacts"
  );

  // Last-updated per metric, derived from the existing edit history rather
  // than a new column — the most recent *published* now_value edit for each
  // metric. RLS restricts change_log to admin, so a client-role caller just
  // gets an empty array here (not an error), same as getPendingDrafts.
  const { data: metricEdits, error: metricEditsError } = await supabase
    .from("change_log")
    .select("record_id, created_at")
    .eq("program_id", program.id)
    .eq("table_name", "metrics")
    .eq("field_name", "now_value")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (metricEditsError) throw new Error(`metric edits: ${metricEditsError.message}`);
  const lastUpdatedByMetricId = new Map();
  for (const e of metricEdits ?? []) {
    if (!lastUpdatedByMetricId.has(e.record_id)) lastUpdatedByMetricId.set(e.record_id, e.created_at);
  }

  const draftsRaw = await getPendingDrafts(program.id);
  const drafts = Object.fromEntries(
    draftsRaw.map((d) => [`${d.table_name}:${d.record_id}:${d.field_name}`, { id: d.id, value: d.new_value }])
  );

  // ── reshape ──────────────────────────────────────────────────────────────

  const initiatives = initiativesRaw.map((init) => ({
    id: init.id,
    code: init.code,
    name: init.name,
    desc: init.description,
    timeframe: { start: init.timeframe_start, end: init.timeframe_end, label: init.timeframe_label },
    status: init.status,
    why: init.why,
    bench: init.bench,
    projects: init.projects.map((p) => ({
      code: p.code,
      name: p.name,
      tf: p.timeframe_label,
      start: p.start_date,
      end: p.end_date,
      status: p.status,
      tags: p.project_services.map((ps) => ps.services.name),
    })),
  }));

  const gates = gatesRaw.map((g) => ({ after: g.after_initiative_id, label: g.label, text: g.body }));

  const scorecard = [];
  const groupIndex = new Map();
  for (const m of metricsRaw) {
    if (!groupIndex.has(m.group_name)) {
      groupIndex.set(m.group_name, scorecard.length);
      scorecard.push({ group: m.group_name, rows: [] });
    }
    const lastEdit = lastUpdatedByMetricId.get(m.id);
    scorecard[groupIndex.get(m.group_name)].rows.push({
      id: m.id,
      m: m.label,
      now: m.now_value,
      target: m.target_value,
      spark: m.spark,
      status: m.status,
      src: m.data_sources?.key,
      lastUpdated: lastEdit ? formatRelative(lastEdit) : null,
      ...(m.warn_note ? { warn: m.warn_note } : {}),
    });
  }

  const sources = {};
  for (const m of metricsRaw) {
    if (m.data_sources && !sources[m.data_sources.key]) {
      sources[m.data_sources.key] = { label: m.data_sources.label, live: m.data_sources.live };
    }
  }

  const decisions = decisionsRaw.map((d) => ({ id: d.id, date: d.date_label, title: d.title, body: d.body, status: d.status, dueDate: d.due_date }));

  // "Open decisions" (Pulse + Decisions page) reads from the decisions
  // table's status='open' rows — merged out of the old action_items
  // "needs_you" type so there's one source instead of two.
  const needsYou = decisionsRaw
    .filter((d) => d.status === "open")
    .map((d) => ({ id: d.id, title: d.title, due: formatShortDate(d.due_date), dueDate: d.due_date, detail: d.body }));
  const flags = actionItemsRaw
    .filter((a) => a.type === "flag")
    .map((a) => ({ id: a.id, label: a.label, text: a.body }));
  const upNext = actionItemsRaw
    .filter((a) => a.type === "up_next")
    .map((a) => ({ id: a.id, date: a.date_label, text: a.body, lane: a.lane }));
  const activity = actionItemsRaw
    .filter((a) => a.type === "activity")
    .map((a) => ({ id: a.id, date: a.date_label, entry: a.body }));

  const tags = Object.fromEntries(servicesRaw.map((s) => [s.name, s.tag_class]));

  const artifacts = artifactsRaw.map((a) => ({
    id: a.id,
    title: a.title,
    html: renderArtifactHtml(a.content),
    updatedAt: formatLongDate(a.updated_at.slice(0, 10)),
  }));

  const data = {
    client: { id: client.id, name: client.name, sub: client.sub, iconColor: client.icon_color },
    program: {
      id: program.id,
      timeframe: program.timeframe_label,
      stage: program.stage,
      updated: formatLongDate(program.updated_on),
      nextReview: formatLongDate(program.next_review),
      week: program.current_week,
      quarter: program.current_quarter_code,
      health: program.health,
      headline: program.headline,
      thesis: program.thesis,
    },
    northStar: program.north_star,
    needsYou,
    flags,
    upNext,
    activity,
    window: { start: program.window_start, end: program.window_end, label: program.window_label },
    arc: { start: program.arc_start, end: program.arc_end },
    gates,
    initiatives,
    ramp: program.ramp,
    quarter: {
      id: quarter.id,
      code: quarter.code,
      name: quarter.name,
      dates: quarter.date_label,
      focus: quarter.focus,
      priorities: prioritiesRaw.map((p) => ({
        id: p.id, pri: p.pri_label, title: p.title, scope: p.scope, why: p.why, tags: p.tags,
      })),
      matrix: quarter.matrix,
      bench: quarter.bench,
    },
    scorecard,
    sources,
    decisions,
    tags,
    artifacts,
  };

  return { data, drafts, draftsList: draftsRaw, programId: program.id };
}

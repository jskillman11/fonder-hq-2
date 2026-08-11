# Fonder HQ — Build Kickoff Brief

## What this is

Fonder HQ is a client-facing growth operating system for Fonder, a brand growth studio. Each client logs in and sees only their own brand's growth program: a live roadmap, quarterly plan, metric scorecard, decision log, and action items. Fonder (Tom) edits content inline like a CMS; strategic updates get drafted with Claude from call transcripts and project management data, then reviewed and published.

**Source of truth:** `fonder-hq-v1.jsx` (included alongside this brief). This is the latest prototype and defines BOTH the product structure and the visual design. Do not redesign it. Port it faithfully, then wire it to real infrastructure.

## The prototype (read it first)

The JSX is a single-file React app with five views navigated from a sidebar:

1. **Pulse** — the daily read: "needs you" action items, flags, upcoming dates, activity feed
2. **Roadmap** — phased initiatives (0–3) with nested projects, phase gates, timeline arc, channel ramp
3. **This quarter** — quarterly focus, prioritized workstreams, month-by-month lane matrix, exit benchmarks
4. **Scorecard** — grouped metric tree (Growth / Acquisition / Retention / Economics) with current, target, sparkline, status, and data source
5. **Decisions** — open flags, standing gates, decision log with reasoning

All content currently lives in a hardcoded `DATA` object at the top of the file. It is real client data (client: Gozo) but somewhat stale — that's fine, it's the seed/test data. A content refresh happens as the last step before client access, not during the build.

## Design system — preserve exactly

The `CSS` constant in the JSX is the Fonder UI System v1. Keep it intact when porting:

- CSS custom properties for all colors (`--paper`, `--ink`, `--green`, `--muted`, etc.)
- Fonts: Asta Sans (primary), Inter Tight (fallback), Geist Mono (numbers, labels, codes — with tabular-nums)
- Design principle: "structure is ink, data is green" — chrome/hierarchy in near-black, live data highlighted in green
- Warm paper background (#F2F1EC), card surfaces, dotted/dashed borders for pending states, pill/chip patterns
- Existing responsive breakpoints

Porting the inline `<style>` block to a global stylesheet or CSS module is fine; changing the visual language is not.

## Stack (decided — don't relitigate)

- **Next.js** (App Router) — the JSX ports nearly directly
- **Supabase** — Postgres database, auth, and row-level security. Project already exists (name: fonder-hq). Env vars will be provided.
- **GitHub** — repo home; `gh` CLI is authenticated on this machine
- **Vercel** — deploys automatically from GitHub once the repo is imported (Tom does the one-time import click in Vercel's dashboard after first push)

## Architecture decisions (made — context so you understand why)

1. **One multi-tenant app, not per-client instances.** All clients in one codebase and one database; row-level security isolates client data. A user belongs to a client and can only ever see that client's rows.
2. **Content lives in the database, not the code.** The hardcoded DATA object migrates into Supabase tables. Code changes deploy via git push; content changes save to the DB with no deploy.
3. **CMS-style inline editing with draft/publish.** Tom (admin role) can edit designated text fields inline in the app and save. Edits and Claude-drafted updates enter as drafts; nothing goes live to the client until published. Every change writes to a change log.
4. **Deferred on purpose (do not build yet):** a monthly service-allocation layer (which services are "active build" vs "maintain" each month), weighted priority scoring, and any per-month schema. The quarter view's month-by-month matrix renders from existing project dates and the quarter data — it is a display concern, not new schema.

## Schema

Hierarchy is the load-bearing wall: **clients → programs → initiatives → projects.** A client can have multiple programs over time (re-engagements), so programs is its own table from day one even though each client has exactly one right now.

Tables:

- **clients** — name, subtitle (e.g. "Gozo", "Formerly Raw Eddy's")
- **programs** — belongs to client. Timeframe, stage, health status, headline, thesis, north star, review dates, current quarter/week
- **initiatives** — belongs to program. Code, name, description, timeframe, status, "why" rationale, benchmarks
- **projects** — belongs to initiative. Code (1A, 2B...), name, timeframe with start/end dates, status, service tags
- **services** — lookup table: Brand, Creative, Digital, Marketing, Product, Web, Email/Retention, Paid Media... Projects and metrics reference these. (The JSX `tags` object seeds this.)
- **metrics** — belongs to program. Group (Growth/Acquisition/Retention/Economics), label, current value, target, sparkline data, status, source (shopify/ga4/klaviyo/manual), optional warning note
- **decisions** — belongs to program. Date, title, body, status (active/standing)
- **gates** — belongs to program. Positioned after an initiative; label + text
- **action_items** — belongs to program. Covers the Pulse view: "needs you" items (title, due, detail, kind), flags, up-next entries, activity feed. A `type` field distinguishes them.
- **quarters** — belongs to program. Code, name, dates, focus, priorities (title/scope/why), lane matrix data, exit benchmarks. Structured JSON columns are acceptable for matrix/priorities in v1.
- **change_log** — what changed, old/new value, who, when, draft vs published
- **users** — via Supabase auth. Profile row links auth user → client, with a role: `admin` (Fonder — sees all clients, can edit) or `client` (sees own client only, read-only)

Row-level security: client-role users can only read rows belonging to their client. Admin can read/write everything. Get the hierarchy and RLS right; individual fields are cheap to add later via migrations.

## Build order

1. **Port and deploy first.** Create the repo, port the JSX into a Next.js app still using the hardcoded data, push to GitHub. Goal: a live Vercel URL on day one so the push-to-deploy loop is proven before any database work.
2. **Schema + data migration.** Create Supabase tables via migrations. Write a seed script that migrates the DATA object into the tables. Swap the app to read from Supabase.
3. **Auth + permissions.** Supabase auth (email magic link or email/password), the users/roles model, RLS policies, and a client-scoped view. Test with a dummy second client to prove isolation.
4. **Inline editing + change log.** Admin-only inline editing on text/content fields, draft → publish flow, change log writes on every save.

Each step ends with a deploy. Keep the app fully working at every step.

## Out of scope for now

- Live data connectors (Shopify, GA4, Klaviyo) — the scorecard's source pills already show "wiring" states; metrics stay manually entered for v1
- ClickUp / Fireflies / Google Drive integration — that workflow runs through Claude Desktop, outside this app
- The "Ask the brand brain" ⌘K bar — keep it in the UI as the non-functional affordance it already is
- Monthly service-allocation layer (see deferred decisions)

## Working style

Tom is the founder/creative director — strong product and editorial instincts, newer to database-level development. Explain infrastructure choices briefly when they come up, flag tradeoffs honestly, and don't over-abstract. Concise over comprehensive. When something in this brief conflicts with what you find in the JSX, the JSX wins on design and content; this brief wins on architecture.

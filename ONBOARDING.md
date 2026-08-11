# Onboarding — Fonder HQ

Welcome. This is a step-by-step setup guide for a human getting the
project running locally for the first time. For the full architecture,
schema, and "why it's built this way" picture, read **HANDOFF.md** next —
this doc only gets you to a running dev server.

## What you're setting up

Fonder HQ is a client-facing growth operating system: a Next.js app
backed by Supabase (Postgres + auth + RLS + Vault), deployed on Vercel.
Clients log in and see only their own brand's roadmap, quarterly plan,
scorecard, and decision log; admins edit content inline.

## 1. Prerequisites

- Node.js 20+ (this machine has v24 — fine)
- npm (ships with Node)
- A GitHub account with access to the repo
- A Supabase account invited to the project (ask an admin)
- A Vercel account invited to the `fonder-studio` team (ask an admin, only needed if you'll deploy/manage env vars — not required to run locally)

## 2. Clone and install

```bash
git clone https://github.com/jskillman11/fonder-hq-2.git
cd fonder-hq-2
npm install
```

## 3. Get your environment variables

Copy the template:

```bash
cp .env.example .env.local
```

Then fill in `.env.local` with real values (never commit this file — it's
gitignored):

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from
  the Supabase dashboard for this project, under **Project Settings > API**.
- `SUPABASE_SERVICE_ROLE_KEY` — same page, **service_role** secret. Only
  used by local one-off/seed scripts; never deployed. Treat it like a
  password.
- `CRON_SECRET` — any long random string, only needed if you're testing
  the Shopify sync cron route locally. Ask an admin for the value used on
  Vercel if you need them to match.

If you don't have Supabase dashboard access yet, ask an admin to invite
you, or to hand you the two `NEXT_PUBLIC_*` values directly (those are
safe to share; the service-role key is not).

## 4. Run it

```bash
npm run dev
```

Open http://localhost:3000. You'll land on the sign-in page — ask an
admin to invite you as a user (`npm run invite <email> <admin|client>`,
admin-run only, it sends a real email), or use the password-based test
fixtures for UI work without touching real auth:

```bash
npm run seed:test-fixtures
```

## 5. Get oriented in the code

- `app/` — Next.js App Router routes (`/`, `/login`, `/admin/*`, `/auth/callback`, `/api/cron/*`)
- `components/` — `FonderHQ.jsx` is the main client-facing view; `AdminUsers.jsx` / `AdminSources.jsx` are admin panels; `EditableText.jsx` + `EditContext.js` power inline CMS-style editing
- `lib/` — data access (`get-program-data.js`), Supabase clients (`lib/supabase/`), draft/publish + user/source actions, `shopify-sync.js` for the live data connector pattern
- `supabase/migrations/` — schema history, applied by hand via the Supabase SQL editor (see gotcha below), then committed here for history
- `scripts/` — seeding, invites, and isolation verification, run with `npm run <script>`

## 6. Before you touch anything real

A few things that will bite you if you don't know them going in — full
detail in HANDOFF.md's "Gotchas" section, short version here:

- **Don't use `supabase.auth.admin.generateLink()` + browser navigation**
  to sign in as a real user for testing — it leaks a live access token
  into the redirect URL. Use the password-based fixtures
  (`npm run seed:test-fixtures`) instead.
- **Don't paste SQL from a chat window into Supabase's SQL editor** —
  something in that clipboard path can silently corrupt it. Open the
  `.sql` file in a text editor and copy from there.
- **`supabase db push` doesn't work here** (no local DB password) —
  schema changes are applied by hand in the Supabase dashboard, then a
  matching migration file is added to `supabase/migrations/` afterward.
- **Never run `vercel --prod` after pushing to `master`** — the project
  auto-deploys on push; doing both creates a duplicate deployment.
- **Confirm with an admin before running anything that sends real email**
  (`npm run invite`) or touches production auth/data.

## 7. Where to go next

- **HANDOFF.md** — full architecture, current schema, infra reference, shipped-features history, what's not started yet
- **fonder-hq-kickoff-brief.md** — original design/schema rationale
- **fonder-hq-v1.jsx** — original prototype, still the visual source of truth for anything not yet redesigned

Stuck, or unsure whether something is safe to run? Ask before running it
against real data — see HANDOFF.md's "Working style notes."

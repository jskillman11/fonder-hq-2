# Fonder HQ — Handoff / Context for a New AI Session

This file exists because the repo's `README.md` is just create-next-app
boilerplate. If you're an AI picking this project up cold, read this first,
then `fonder-hq-kickoff-brief.md` for the original architecture and schema
rationale (still accurate for "why it's built this way"; not accurate for
"what exists today" — that's this file's job).

Read order: this file → `fonder-hq-kickoff-brief.md` → `fonder-hq-v1.jsx`
(the original design/data prototype, still the visual source of truth for
anything not yet redesigned).

## What this is

Fonder HQ is a client-facing growth operating system for Fonder, a brand
growth studio. Each client logs in and sees only their own brand's growth
program (roadmap, quarterly plan, metric scorecard, decision log, action
items). Tom (admin) edits content inline like a CMS.

## Stack

- Next.js 16 (App Router), React 19
- Supabase — Postgres, auth, row-level security, Vault (for secrets like
  the Shopify token)
- Hosted on Vercel, auto-deploys on push to `master` — **do not also run
  `vercel --prod` after a push**, it creates a redundant duplicate
  deployment. A plain `git push` is sufficient.
- GitHub repo: `tom-from-fonder/fonder-growth-hq` (private)

## Infra reference

- **Vercel:** team `fonder-studio`, project `fonder-growth-hq`. Live at
  https://fonder-growth-hq.vercel.app
- **Supabase:** project ref `fklncuzxnrfdovigasgc` ("Fonder-Growth-HQ")
- **Env vars** (`.env.local`, gitignored — never commit values): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (local-only,
  used by one-off/seed scripts, never deployed), `CRON_SECRET` (guards the
  Shopify sync cron route). Same two `NEXT_PUBLIC_*` + service-role key are
  set on Vercel (service-role marked Sensitive).
- Verify these still resolve before relying on them if time has passed
  (`git remote -v`, `vercel project ls`, `supabase projects list`) —
  infra references can go stale.

## Schema (current, per the migrations in `supabase/migrations/`)

Hierarchy: **clients → programs → initiatives → projects**, plus
`services` (lookup), `metrics`, `decisions` (now also covers "needs you"
open action items via `status`/`due_date`), `gates`, `action_items`,
`quarters`, `quarter_priorities`, `data_sources` (per-client, live/manual
toggle), `artifacts` (markdown docs, rendered server-side), `connections`
+ Vault functions (external data source credentials, currently Shopify),
`change_log` (draft vs published edit history), and Supabase-auth-backed
`profiles` (role: `admin` or `client`, linked to a client).

RLS: client-role users read only their own client's rows; admin reads/
writes everything.

## What's shipped, in order (see `git log` for exact diffs)

1. Ported the JSX prototype into Next.js with hardcoded data, deployed to
   Vercel — proved the push-to-deploy loop.
2. Migrated data into Supabase tables; app reads from the DB.
3. Auth + RLS (magic link), client-scoped views, isolation verified via
   `scripts/verify-isolation.js`.
4. Inline editing with draft/publish flow + change log.
5. Admin user management (`/admin/users`): invite/role-change/revoke.
   `npm run invite <email> <admin|client> [clientName]` provisions real
   users (sends a real Supabase invite email — confirm with Tom before
   running, it grants real production access).
6. Scorecard "last updated" tracking + admin data-source panel
   (`/admin/sources`), `data_sources` made genuinely per-client.
7. Design pass: North Star progress dials, grayscale token pass, Q3
   service-category tags.
8. Artifacts tab (v1): markdown docs rendered server-side (`marked` +
   `sanitize-html`) so raw markdown never ships client-side. No
   client-facing editor yet — content goes in via
   `npm run seed:artifacts "Client Name"`.
9. Custom self-hosted fonts (Marfa, Stroy Mono), replacing Google Fonts.
10. Two more full "Revisions" rounds: semantic color tokens, sign-in page
    redesign, Pulse/Roadmap/Quarter/Scorecard rebuilds, warm accent
    palette, merged "needs you" into `decisions`, various real bugs found
    and fixed along the way (see `git log` messages — they're specific).
11. **Shopify live data source** (2026-07-22, most recent) — first
    external data connector. Read-only custom-app token stored only in
    Supabase Vault (never a plain column), syncs 6 scorecard metrics daily
    via a Vercel cron (`vercel.json`, guarded by `CRON_SECRET`) plus an
    on-demand admin "Sync now" action. `lib/shopify-sync.js` +
    `connections` table establish the pattern future sources (GA4,
    Klaviyo) should follow.

## Not yet started

- Archiving completed initiatives/phases and quarterly plans (with a
  retrospective) — display-layer work, no new schema anticipated.
- Branded magic-link email template — blocked on choosing a custom-SMTP
  provider (see gotcha below).
- GA4 / Klaviyo connectors, following the Shopify pattern.

## Gotchas — read before you rediscover these the hard way

- **Never use `supabase.auth.admin.generateLink()` + browser navigation
  to sign in as a real user for testing.** It produces an implicit-flow
  link this app's `/auth/callback` can't complete, and failing that way
  puts a live access/refresh token in the redirect URL — which then leaks
  into anything that prints the page URL. For UI verification: use a
  standalone static-HTML harness (real CSS/fonts, no auth) for anything
  presentational, or the password-based fixtures in
  `scripts/seed-test-fixtures.js` via `signInWithPassword` if you
  genuinely need a session.
- **Pasting SQL from a chat window into Supabase's SQL editor can
  silently corrupt it** (dropped words, mangled quotes) — not an
  apostrophe/line-length issue, something in the browser/clipboard path.
  Workaround: open the actual `.sql` file in a text editor and copy from
  there, not from a rendered chat code block.
- **No local `SUPABASE_DB_PASSWORD`,** so `supabase db push` doesn't work.
  Schema/RLS changes are applied by hand via the Supabase dashboard SQL
  editor, then a matching migration file is added after the fact for
  history. This means the CLI's migration-history tracking is out of
  sync with what's actually applied — a future real `supabase db push`
  may need `supabase migration repair` first.
- Supabase's free tier blocks editing the auth email template
  body/subject unless you upgrade to Pro, set up custom SMTP, or use a
  Send Email auth hook. Custom SMTP (e.g. Resend) is the standing
  recommendation — it also fixes the "sender looks like Supabase, not
  Fonder" branding issue. Not yet done; raise it again if email
  deliverability or admin onboarding comes up.
- Supabase's free-tier email rate limit can be hit during admin invite
  bursts (`POST /admin/users`) — visible via `vercel logs`. Currently
  accepted as-is (generic error message is enough per Tom); same
  custom-SMTP fix above would remove it.

## Working style notes

Tom is the founder/creative director — strong product and editorial
instincts, newer to database-level development. Explain infrastructure
choices briefly when they come up, flag tradeoffs honestly, don't
over-abstract, and confirm before anything that sends real emails or
touches production auth/data.

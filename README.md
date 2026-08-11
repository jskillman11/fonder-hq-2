# Fonder HQ

Client-facing growth operating system for Fonder, a brand growth studio.
Each client logs in and sees only their own brand's growth program
(roadmap, quarterly plan, metric scorecard, decision log, action items).
Admins edit content inline like a CMS.

New to this repo? Start with **[HANDOFF.md](./HANDOFF.md)** — it has the
full picture (architecture, schema, infra, gotchas, working style) and is
kept up to date as the source of truth. If you're setting up locally for
the first time, see **[ONBOARDING.md](./ONBOARDING.md)** for step-by-step
setup.

## Stack

- [Next.js 16](https://nextjs.org) (App Router), React 19
- [Supabase](https://supabase.com) — Postgres, auth, row-level security, Vault
- Hosted on [Vercel](https://vercel.com), auto-deploys on push to `master`

## Quickstart

```bash
npm install
cp .env.example .env.local   # then fill in real values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Env vars needed in `.env.local` (never commit real values):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`. See `.env.example` for
where each one comes from.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / run |
| `npm run lint` | Lint with ESLint |
| `npm run seed` | Seed core sample data |
| `npm run seed:artifacts "Client Name"` | Seed markdown artifacts for a client |
| `npm run seed:test-fixtures` | Seed password-based test users for UI verification |
| `npm run invite <email> <admin\|client> [clientName]` | Invite a real user — sends a real Supabase email, confirm before running |
| `npm run verify:isolation` | Verify client-scoped RLS isolation |

## Learn more

- [HANDOFF.md](./HANDOFF.md) — current architecture, schema, infra, and gotchas
- [fonder-hq-kickoff-brief.md](./fonder-hq-kickoff-brief.md) — original design rationale
- [fonder-hq-v1.jsx](./fonder-hq-v1.jsx) — original prototype, still the visual source of truth for anything not yet redesigned

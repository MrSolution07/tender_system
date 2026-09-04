# Clients

Three surfaces, one backend. Do not merge internal and external apps. Roles, documents and evaluation UI are different enough that a single app with a mode switch will fight you.

| App | Path | Users | Init when you get there |
| --- | --- | --- | --- |
| Internal mobile | `apps/mobile-internal` | super_admin, procurement_officer, evaluator | `npx create-expo-app` |
| External mobile | `apps/mobile-external` | contractor, public (anon) | `npx create-expo-app` |
| Web dashboard | `apps/web` | same internal roles, desk reporting | `pnpm create next-app` |

Shared: `@tender/shared`, design tokens later (`packages/ui` when the first screen exists — not before).

## Internal app

- Tender CRUD, document upload, AI review queue
- Evaluator scoring for assigned bids
- Admin: users, roles, audit log
- Dashboards: pipeline, SLA / closing dates, compliance flags

## External app

- Contractor profile + compliance docs
- Search published tenders, submit bids, track own status
- Public (no login): awarded tenders, contractor names, project progress, spend summaries

## Web dashboard

- Same Supabase project and RLS
- Heavier tables, charts (Recharts), admin user management
- Next.js App Router; server components for reads; never `service_role` in the browser

## What not to build in v0

- Separate REST API that duplicates Supabase CRUD
- A fourth "admin only" web app — the dashboard covers it
- Ejecting Expo

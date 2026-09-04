# Build order

Apps are **not** scaffolded yet. Follow this sequence so each step has a backend to stand on. Do not start UI before Auth + schema exist.

## 0. Repo (done)

Monorepo skeleton, domain package, docs, Cursor rules.

```bash
pnpm install
```

## 1. Supabase (Week 3)

```bash
npx supabase init
npx supabase start          # local, or link a hosted project
```

Then:

1. Copy [architecture/schema.sql](./architecture/schema.sql) into `supabase/migrations/00001_core_schema.sql`.
2. Add a trigger: new `auth.users` → `profiles` row (role supplied via invite `app_metadata`).
3. Create private buckets `tender-documents` and `bid-documents`.
4. Apply remaining RLS policies table-by-table as features land (fail-closed is already the default).
5. Generate types into `packages/db` when that package exists.

Auth roles: `super_admin`, `procurement_officer`, `evaluator`, `contractor`. Public users stay `anon`.

## 2. Shared domain (already started)

`packages/shared` owns enums and tender transitions. Apps import it. If SQL enums change, update shared in the same PR.

## 3. Internal mobile (Week 4)

```bash
cd apps
npx create-expo-app@latest mobile-internal --template blank-typescript
```

Wire `@tender/shared` + Supabase JS. First screens: sign-in, tender list, tender create, document upload. No AI UI until the worker writes `ai_analyses`.

## 4. AI worker (Week 5)

`apps/services` — Node entry `ai-document`. Edge Function on storage insert. Write `ai_analyses` with `needs_review` only.

## 5. External mobile (Week 6)

```bash
npx create-expo-app@latest mobile-external --template blank-typescript
```

Published tender search, bid submit, public awarded list (anon).

## 6. Evaluation + award (Week 6)

Assignments, scores, award row, status `awarded`. Notifications for win/lose.

## 7. Web dashboard (Week 7)

```bash
cd apps
pnpm create next-app web --ts --app --eslint --tailwind --src-dir=false
```

Pipeline, closing dates, spend, compliance flags. Same RLS. No `service_role` in Next public env.

## 8. Notification worker (Week 7)

Push + email. Cron: closing in 24h.

## 9. Harden (Week 8–9)

Role/permission tests, Sentry, Turnstile on public search, documentation screenshots.

## Scope fence

Build first: tender, documents, AI review, bids, evaluation, award, public projection, dashboards.

Defer: Meilisearch, maps, SMS, multi-department orgs, App Store release polish.

## Init cheat sheet

| You want | Command / action |
| --- | --- |
| JS deps | `pnpm install` |
| Local DB | `npx supabase init` then `npx supabase start` |
| Internal app | `create-expo-app` in `apps/mobile-internal` |
| External app | `create-expo-app` in `apps/mobile-external` |
| Web | `create next-app` in `apps/web` |
| Workers | `apps/services` package when Phase 4/5 starts |

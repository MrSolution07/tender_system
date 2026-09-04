# Government Tender Intelligence and Transparency Platform

**Major Tech** — Christian Bulabula (st10538419) · Neo Yende (st10387834)  
Lecturer: Mr T Tshesebe · 2026

A procurement workspace for South African public-sector offices, and a public window onto what was awarded, to whom, and at what cost. Officials keep the decisions. Software keeps the record.

This repository is an **initialised architecture**, not a generated app farm. Clients, Supabase, and workers are scaffolded when you follow [docs/BUILD.md](docs/BUILD.md). The domain, security model, schema, and agent rules are already in place so that work does not fork on day two.

---

## Why it exists

Government procurement produces thousands of tenders, long documents, and fragmented status. Officials spend time hunting closing dates and mandatory requirements. Citizens cannot easily see awarded contracts, contractors, or expenditure. Oversight failures documented by commissions of inquiry are a reminder that opacity is expensive.

This platform:

1. **Centralises** tender records, documents, bids, evaluations, awards, projects, and spend in one Postgres database.
2. **Assists** officers with AI summaries of lengthy documents — always reviewed by a human before anything becomes official.
3. **Tracks** a tender from draft through publication, evaluation, award, and completion.
4. **Publishes** a narrow, deliberate public projection: awarded work, contractor names, progress, expenditure summaries. Not losing bids. Not evaluator comments. Not drafts.

AI does not award a tender. That is the product.

---

## Who uses it

| Role | Surface | Can |
| --- | --- | --- |
| Super admin | Internal app + web | Users, roles, audit, overrides |
| Procurement officer | Internal app + web | Tenders, documents, AI review, awards, reports |
| Evaluator | Internal app | Assigned bids, scores, compliance notes |
| Contractor | External app | Profile, search, submit, track own bids |
| Public | External app (signed out) | Awarded tenders, progress, spend summaries |

Access is enforced in **Row Level Security**, not only in the UI. If someone calls the API directly, they still only see their rows.

---

## Architecture

Three clients. One database. Two workers. No hand-rolled CRUD API.

```
Internal Expo ─┐
External Expo ─┼─► Supabase Auth / Postgres+RLS / Storage / Realtime
Next.js web  ─┘         │
                        ├─► Edge Function ─► AI document worker (LLM, optional OCR)
                        └─► Edge Function ─► Notification worker (push, email)
```

**Locked stack** (from the software-solution brief):

| Layer | Choice |
| --- | --- |
| Internal & external mobile | React Native, Expo (managed) |
| Web dashboard | Next.js App Router |
| Backend | Supabase (Postgres, Auth, RLS, Storage, Realtime, Edge Functions) |
| Workers | Node.js |
| Domain types | `@tender/shared` in this monorepo |
| Node | 22, pnpm |

Tender lifecycle:

```
draft → published → closed → evaluating → awarded → completed → archived
```

Full diagrams, schema, and service map: [docs/architecture/overview.md](docs/architecture/overview.md).

---

## Repository layout

```
apps/                  # empty shells + README — scaffold per BUILD.md
  mobile-internal/
  mobile-external/
  web/
  services/
packages/shared/       # roles, statuses, legal transitions
docs/
  references/          # converted Word briefs
  architecture/        # implementation contract + target SQL
  BUILD.md             # order of work
.cursor/rules/         # agent rules for every future session
AGENTS.md
```

Converted source documents (readable, not `.docx`):

- [Research proposal](docs/references/01-research-proposal.md)
- [Software solution & stack](docs/references/02-software-solution.md)
- [System design & plan](docs/references/03-system-design.md)

---

## Start here

```bash
corepack enable
pnpm install
```

Copy [`.env.example`](.env.example) when you have a Supabase project. Do not commit `.env`.

Then open [docs/BUILD.md](docs/BUILD.md) and run **only the current phase**:

0. This repo (done)
1. `npx supabase init` → apply [docs/architecture/schema.sql](docs/architecture/schema.sql)
2. Internal Expo app
3. AI worker (advisory rows only)
4. External Expo app
5. Evaluation and award
6. Next.js dashboard
7. Notifications
8. Tests, monitoring, write-up

Skipping to screens before RLS exists will produce a demo that cannot be secured later.

---

## Design rules that keep the build smooth

- **One source of truth.** `@tender/shared` and `schema.sql` must agree on enums. Change both in the same change.
- **Fail closed.** Tables ship with RLS enabled. Missing policy means no access, not full access.
- **AI is a draft.** Workers write `ai_analyses`. Officers approve. Then requirements and dates move.
- **Public is a view.** `awarded_tenders_public` — not “hide columns in React”.
- **Secrets stay server-side.** Publishable key in apps. Service role in workers only.

Cursor will follow the same contract via `.cursor/rules/` and `AGENTS.md`.

---

## Project plan (nine weeks)

| Week | Outcome |
| --- | --- |
| 1–2 | Requirements and design (this documentation) |
| 3 | Database, Auth, RLS |
| 4 | Tender management and uploads |
| 5 | AI analysis with human review |
| 6 | Bids and evaluations |
| 7 | Public portal and dashboards |
| 8 | Testing |
| 9 | Report and demonstration |

Risks (wrong AI, leaked bids, missed closing dates) and mitigations are in the [system design](docs/references/03-system-design.md#84-risks-and-mitigation).

---

## Academic note

This is a student SDLC project: requirements, architecture, implementation, testing, demonstration. It models how AI-assisted document analysis can sit beside procurement workflow and an open-data portal **without** replacing statutory decision-makers.

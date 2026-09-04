# Services

Business rules live in services, not in screens. First implementation can be thin modules inside each app plus workers. Do not collapse everything into one "utils" file.

| Service | Trigger | Writes | Notes |
| --- | --- | --- | --- |
| Authentication | Sign-in / invite | `auth.users`, `profiles` | Role assignment is admin-only |
| Tender management | Officer actions | `tenders`, status transitions | Enforce `canTransition` |
| Document management | Upload | Storage + `tender_documents` | Version files; never overwrite silently |
| AI document analysis | Storage webhook | `ai_analyses` only | Worker in `apps/services` |
| Bid management | Contractor submit | `bids`, `bid_documents` | Reject after `closing_at` |
| Evaluation | Evaluator score | `evaluations` | Assigned rows only |
| Compliance | Requirement checks | flags on bid/tender | Deterministic rules + AI hints |
| Award | Officer/admin | `awards`, tender status | Then notify + publish |
| Project | Post-award | `projects` | |
| Expenditure | Finance/officer | `expenditure` | Public totals only |
| Notification | DB events / cron | `notifications` + push/email | Worker in `apps/services` |
| Reporting | Dashboard reads | none (views/rpc) | |
| Transparency | Public reads | none | Projection views |

## Worker split (`apps/services`)

Two processes (or two entrypoints in one Node package):

1. **ai-document** — OCR optional, LLM extract, persist advisory JSON, never auto-approve.
2. **notify** — Expo Push + Resend; later SMS. Deadline cron: tenders closing in 24h.

Edge Functions stay small: verify event, enqueue/call worker, return. Put long LLM calls in the Node worker so they are not bound by Edge timeouts.

## Patterns (from the design doc)

- Repository for data access
- Service layer for use-cases
- Strategy for notification channels and AI providers
- Observer via Realtime + notification worker
- DI at module boundaries so tests can stub Supabase and LLM

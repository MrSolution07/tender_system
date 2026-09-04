# Security

Defence in depth: Auth → app role gates → Postgres RLS → storage policies → transparency projection.

## Auth

- Supabase Auth for every non-public action.
- Internal roles (`super_admin`, `procurement_officer`, `evaluator`) should use MFA once Auth is live.
- Store role in `auth.users.raw_app_meta_data.role` **and** `profiles.role`. Keep them in sync with a trigger.
- **Never** read `user_metadata` / `raw_user_meta_data` for authorisation. It is user-editable.
- JWT claims go stale until refresh. For sensitive writes, prefer `profiles.role` (looked up with `auth.uid()`) over a cached JWT claim if they disagree.

## RLS

Enable RLS on every table in `public`. Policies use `TO authenticated` / `TO anon` plus a row predicate — never `TO authenticated` alone.

Patterns:

| Actor | Typical predicate |
| --- | --- |
| Super admin | `public.current_app_role() = 'super_admin'` |
| Officer | role match, plus department or created_by as needed |
| Evaluator | row in `evaluator_assignments` |
| Contractor | `contractor_id` owned by `auth.uid()` |
| Public | `SELECT` on transparency views only |

Notes that bite in Supabase:

- `UPDATE` needs a `SELECT` policy as well, or updates silently affect 0 rows.
- `UPDATE` policies need both `USING` and `WITH CHECK`.
- Views bypass RLS unless `WITH (security_invoker = true)`.
- `SECURITY DEFINER` functions bypass RLS. Do not use them to "fix" permission errors. If one is required, put it in a private schema, revoke `EXECUTE` from `PUBLIC`, and check `auth.uid()` inside.
- Wrap `auth.uid()` as `(select auth.uid())` in policies so Postgres can cache it.

## Storage

- Buckets `tender-documents` and `bid-documents` are **private**.
- Clients use short-lived signed URLs. No public buckets for procurement files.
- Upsert needs INSERT + SELECT + UPDATE storage policies.

## Transparency boundary

Public users may see: awarded tender title, awarded contractor name, project progress summary, expenditure totals.

Public users must never see: draft tenders, losing bids, bid amounts before award policy says so, evaluator comments, scores, AI drafts, personal contact details of officials.

Implement this as dedicated views + `anon` SELECT, not as "hide columns in the app".

## Secrets

| Key | Where it may exist |
| --- | --- |
| Publishable / anon key | Mobile apps, Next.js `NEXT_PUBLIC_*` |
| Service role | Node workers, Edge Functions, CI secrets only |
| LLM / Resend / Twilio | Workers only |

## AI safety

AI output is advisory. See `.cursor/rules/03-ai-safety.mdc`. Operational fields (`closing_at`, requirements, criteria) change only after `ai_analyses.review_status` is `approved` or `corrected` by a procurement officer.

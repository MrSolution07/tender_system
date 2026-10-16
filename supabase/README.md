# Supabase

Schema and seed live in this folder. `docs/architecture/schema.sql` is the same contract. Apply with `npx supabase db reset` locally, or `supabase db push` after `supabase link` to the hosted project.

```bash
npx supabase init
npx supabase start
cp docs/architecture/schema.sql supabase/migrations/00001_core_schema.sql
npx supabase db reset
```

Then add:

1. `handle_new_user` trigger: `auth.users` → `profiles`
2. Private buckets `tender-documents`, `bid-documents`
3. Remaining RLS policies as each feature ships (tables already have RLS enabled = fail closed)

Hosted project: `supabase link` + `supabase db push` after local reset looks right.

Never commit `.env`, the service role, or `supabase/.temp`.

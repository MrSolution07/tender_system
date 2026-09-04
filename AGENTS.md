# Agent instructions

This repository is an **init**: architecture, rules, domain types, and converted briefs. Application code is not generated yet. Follow `docs/BUILD.md`.

## Before you write code

1. Read `docs/architecture/overview.md`.
2. Match the phase in `docs/BUILD.md`. Do not skip to UI if Supabase is not up.
3. Use `@tender/shared` for roles and tender status.
4. Treat `docs/references/` as the academic brief. Treat `docs/architecture/` as the implementation contract. If they conflict, architecture wins and you note the conflict.

## Stack (locked)

| Piece | Choice |
| --- | --- |
| Internal / external mobile | React Native, Expo (managed) |
| Web dashboard | Next.js App Router |
| Data / auth / files / realtime | Supabase |
| AI + notifications | Node.js workers |
| Package manager | pnpm |
| Node | 22 (`.nvmrc`) |

## Hard rules

- No custom REST CRUD duplicating Supabase.
- No `service_role` in any client bundle.
- No AI auto-approval of tender fields.
- No merging the two mobile apps.
- No public storage buckets for tender or bid files.
- Roles never stored in `user_metadata`.

Cursor rules in `.cursor/rules/` repeat these for the agent. Keep them in sync if the contract changes.

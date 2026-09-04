# External mobile app

Expo app for **contractors** (authenticated) and **public citizens** (anon).

Not scaffolded. When Phase 5 in `docs/BUILD.md` starts:

```bash
cd apps
npx create-expo-app@latest mobile-external --template blank-typescript
```

Public browse must work signed out against `awarded_tenders_public`. Contractors submit bids only on `published` tenders before `closing_at`.

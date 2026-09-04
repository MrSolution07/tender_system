# Internal mobile app

Expo app for **super_admin**, **procurement_officer**, and **evaluator**.

Not scaffolded. When Phase 3 in `docs/BUILD.md` starts:

```bash
cd apps
npx create-expo-app@latest mobile-internal --template blank-typescript
```

Then add `@tender/shared` and the Supabase JS client. First vertical slice: sign-in → tender list → create draft → upload document.

Do not use this folder for contractor or public screens.

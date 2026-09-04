# Apps

Empty on purpose. Scaffold in this order (full commands in `docs/BUILD.md`):

| Directory | App | Users |
| --- | --- | --- |
| `mobile-internal/` | Expo | Super admin, procurement officer, evaluator |
| `mobile-external/` | Expo | Contractor, public |
| `web/` | Next.js | Staff dashboards |
| `services/` | Node | AI document worker, notification worker |

After each scaffold, add `"apps/*"` back to `pnpm-workspace.yaml` if it is not already matching, and depend on `@tender/shared` with `workspace:*`.

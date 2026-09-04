# `@tender/shared`

Domain constants and types shared by every client and service.

Import this package. Do not copy role names or status strings into app code.

```ts
import { APP_ROLES, canTransition } from "@tender/shared";
```

Apps are not scaffolded yet. After `pnpm` workspace apps exist, add:

```json
"dependencies": { "@tender/shared": "workspace:*" }
```

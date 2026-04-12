# New Backend Domain

Scaffold a complete new backend domain: route handlers, schemas, and domain folder.

## Arguments

`$ARGUMENTS` — domain name and what it covers (e.g. "notifications — CRUD for user notification settings" or "webhooks — inbound webhook processing").

## Pre-coding step (mandatory)

Before writing any code, find a similar existing domain and read through its full structure:

```bash
# Pick a comparable domain and read its structure
ls src/routes/api/v1/<similar-domain>/
ls src/domains/<similar-domain>/schemas/
```

List the reference domain before writing code.

## Files to create

### 1. Domain schemas folder

```
src/domains/<domain>/schemas/
├── entities/
│   └── <entity>.ts          # createSelectSchema(table) + extensions
└── handlers/
    └── <verb>-<entity>/
        ├── params.ts         # path params (if any)
        ├── query.ts          # query params (if any)
        ├── body.ts           # request body (POST/PATCH)
        └── response.ts       # response schema with .meta()
```

### 2. Route handlers

```
src/routes/api/v1/<domain>/
├── index.ts                  # re-exports all route exports
└── <resource>/
    └── <method>/
        └── route.ts          # createHonoApp().basePath(...) + handler
```

### 3. DB schema (if new tables needed)

See `/db-migration` command.

### 4. MQ workers (if background processing needed)

See `/add-worker` command.

## Entity schema template

```typescript
// src/domains/<domain>/schemas/entities/<entity>.ts
import { createSelectSchema } from "drizzle-zod";
import { myEntity } from "@/db/schema";
import { z } from "@/lib/zod";

export const myEntitySchema = createSelectSchema(myEntity).meta({
  title: "<Entity>",
  description: "<Entity> description",
  ref: "<Entity>Schema",
});

export type MyEntity = z.infer<typeof myEntitySchema>;
```

## Route index template

```typescript
// src/routes/api/v1/<domain>/index.ts
export { getEntityRoute } from "./<resource>/get/route";
export { createEntityRoute } from "./<resource>/post/route";
// ...
```

## server.ts registration

After creating all routes, import and register in `src/entrypoints/server.ts`:

```typescript
import { getEntityRoute, createEntityRoute } from "@/routes/api/v1/<domain>";

app.route("/api/v1", getEntityRoute);
app.route("/api/v1", createEntityRoute);
```

## Finish checklist

- [ ] Domain folder created at `src/domains/<domain>/`
- [ ] Entity schemas in `entities/` using `createSelectSchema`
- [ ] Handler schemas in `handlers/<verb>-<entity>/`
- [ ] Routes in `src/routes/api/v1/<domain>/`
- [ ] All routes exported from domain's `index.ts`
- [ ] All routes registered in `server.ts`
- [ ] DB migration generated and applied (if new tables)
- Run: `pnpm lint:fix && pnpm lint:typescript`

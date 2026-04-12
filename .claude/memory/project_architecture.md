---
name: Project architecture
description: Core stack, source layout, entrypoints, and key implementation patterns for genario-backend
type: project
---

## Stack

- **Runtime**: Node.js + TypeScript 5.7 (ESM, `"type": "module"`)
- **HTTP framework**: Hono 4 with `hono-openapi` for OpenAPI metadata
- **Database**: PostgreSQL via Drizzle ORM + drizzle-kit migrations
- **Auth**: Better Auth — session read via `sessionMiddleware`, user at `c.get("user")`
- **Background jobs**: BullMQ + Redis (shared `@/lib/redis`)
- **Validation**: Zod 4, always imported from `@/lib/zod`
- **External API clients**: Kubb 4 codegen from Tochka and YooKassa OpenAPI specs
- **Build**: tsup (two outputs: `dist/server.js`, `dist/workers.js`)

## Two entrypoints

- `src/entrypoints/server.ts` — HTTP server, route registration, Bull Board UI, OpenAPI/Scalar docs
- `src/entrypoints/workers.ts` — BullMQ worker startup and graceful shutdown

## Source layout

```
src/
├── entrypoints/    # server.ts + workers.ts
├── routes/api/     # Hono handlers — auth/ and v1/<domain>/
├── domains/        # Domain schemas: entities/ + handlers/<verb>-<entity>/
├── db/             # Drizzle schema, migrations, types
├── mq/             # BullMQ queues + workers (one folder per job type)
├── ai/             # AI prompts and provider config
├── lib/            # Infrastructure: redis, s3, zod, api-client, ...
├── middleware/     # session, rate-limit, subscription, openapi-response
├── shared/         # Cross-domain constants, schemas, utils
└── codegen/        # GENERATED — never edit manually (Kubb output)
```

## Key patterns

**Route handler** — middleware order is strict:
`sessionMiddleware → rateLimitMiddleware → subscriptionMiddleware → openAPIResponseMiddleware → validator`

**Responses**: always `c.json<T>(responseSchema.parse({ data }))` — never raw objects.

**Errors**: always `throwAPIError({ code: APIErrorCode.X, message: "..." })` — never ad-hoc error objects.

**Entity schemas**: `createSelectSchema(table)` from `drizzle-zod`, with `.meta({ title, description, ref })`.

**BullMQ**: paired `queue.ts` + `worker.ts`; queue registered in Bull Board (`server.ts`), worker closed in shutdown (`workers.ts`).

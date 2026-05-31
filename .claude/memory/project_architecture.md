---
name: Project architecture
description: Core stack, source layout, entrypoints, and key implementation patterns for genario-backend
type: project
---

## Stack

- Runtime: Node.js + TypeScript ESM.
- HTTP framework: Hono with `hono-openapi`.
- Database: PostgreSQL via Drizzle ORM and drizzle-kit migrations.
- Auth: Better Auth, with project routes under `src/routes/api/v1/auth/**`.
- Background jobs: BullMQ + Redis via `@/lib/redis`.
- Validation: Zod through `@/lib/zod`; `env.ts` is the direct `zod` exception.
- External API clients: Kubb-generated code for Tochka, YooKassa, and Rutube.
- AI prompts: Markdown templates, typed props, and builders in `src/ai/prompts/**`.

## Entrypoints

- `src/entrypoints/server.ts` - HTTP server, route registration, Bull Board UI, OpenAPI/Scalar docs.
- `src/entrypoints/workers.ts` - BullMQ worker startup and graceful shutdown.

## Source Layout

```text
src/
  entrypoints/    server.ts and workers.ts
  routes/         Hono handlers, including api/v1/<domain>
  domains/        Domain schemas, services, constants, utilities
  db/             Drizzle schema, migrations, DB client/utilities
  mq/             BullMQ queues and workers
  ai/             Providers, prompt templates, prompt types/builders
  lib/            Infrastructure adapters and integrations
  middleware/     Hono middleware
  shared/         Cross-domain constants, schemas, types, utilities
  codegen/        Generated external API clients; do not edit manually
  globals/        Global declarations
```

## Key Patterns

- Route middleware order for protected routes:
  `sessionMiddleware -> rateLimitMiddleware -> subscriptionMiddleware -> openAPIResponseMiddleware -> validator`.
- Responses: `c.json<T>(responseSchema.parse({ data }))`.
- Errors: `throwAPIError(...)`.
- Entity schemas: `createSelectSchema(table)` from `drizzle-zod`.
- BullMQ: paired `queue.ts` + `worker.ts`, queue in Bull Board, worker closed in shutdown.
- Prompt work: keep template, type, builder, and call sites synchronized.

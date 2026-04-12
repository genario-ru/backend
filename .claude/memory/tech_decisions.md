---
name: Tech decisions
description: Key technical decisions and their rationale for genario-backend
type: project
---

## Zod always from `@/lib/zod`

Import as `import { z } from "@/lib/zod"` — never from `"zod"` directly.

**Why:** The lib wrapper adds project-wide custom error messages in Russian, consistent across all validation errors shown to users.

## Responses always via `responseSchema.parse({ data })`

Never return a raw object from a route handler.

**Why:** Strips unexpected fields, validates the response matches the OpenAPI contract, prevents accidental data leaks.

## `throwAPIError` for all domain errors

Never `c.json({ error: "..." }, 400)`. Always `throwAPIError({ code: APIErrorCode.X, message: "..." })`.

**Why:** All errors go through `errorHandlerMiddleware`, producing a consistent JSON error envelope the frontend expects.

## `drizzle-zod` for entity schemas

Use `createSelectSchema(table)` to derive Zod schemas from Drizzle table definitions.

**Why:** Single source of truth — DB schema and validation schema stay in sync automatically. Avoids drift between columns and API types.

## BullMQ paired queue + worker files

Each job type: `queue.ts` (Queue + enqueue helper) and `worker.ts` (Worker + handler) in the same folder.

**Why:** Clear producer/consumer separation. Route handlers enqueue jobs without importing worker code.

## `pnpm db:generate + db:migrate`, never `db:push`

**Why:** `db:push` bypasses migration history and can silently break production. `db:generate` creates explicit, reviewable SQL.

## External API clients via Kubb codegen

Tochka and YooKassa clients are generated — never hand-written.

**Why:** Keeps client code in sync with provider APIs automatically. Manual clients drift and cause runtime bugs.

---
name: Tech decisions
description: Key technical decisions and rationale for genario-backend
type: project
---

## Zod Comes From `@/lib/zod`

Use `import { z } from "@/lib/zod"` for project schemas.

Exception: `env.ts` imports direct `zod` because `@t3-oss/env-core` expects it.

Why: the project wrapper centralizes validation behavior and messages.

## Responses Pass Through `responseSchema.parse({ data })`

Never return raw success objects from route handlers.

Why: response parsing strips unexpected fields, validates the OpenAPI contract, and reduces accidental data leaks.

## Domain Errors Use `throwAPIError`

Do not return ad-hoc JSON error envelopes.

Why: `throwAPIError(...)` keeps backend errors compatible with the shared frontend/API error contract.

## Drizzle-Zod Derives Entity Schemas

Use `createSelectSchema(table)` for DB-backed entity schemas.

Why: DB shape and runtime/API validation stay closer to a single source of truth.

## BullMQ Uses Paired Queue And Worker Modules

Each job type should have a queue producer module and a worker consumer module.

Why: routes/services enqueue jobs without importing worker code, and entrypoints can register queues/workers explicitly.

## Agents Generate Migrations But Do Not Apply Them

For repository schema changes, agents may run `pnpm db:generate` to create migration SQL. Agents must not run `pnpm db:migrate`, `pnpm db:push`, or `pnpm db:drop` unless the user explicitly asks for that exact command in the current task.

Why: generated SQL is reviewable, while applying it mutates a real database and should remain a human-controlled action.

## External API Clients Are Generated

YooKassa and Rutube clients live under `src/codegen/api/**`.

Why: generated clients track provider specs. Manual edits drift and are overwritten by Kubb.

Note: Rutube currently uses a pinned local spec in `deps/api/rutube.json`.

## AI Prompts Are Triplets

Prompt behavior usually spans a Markdown template, typed props, and a builder.

Why: keeping placeholders, types, and call sites synchronized prevents runtime prompt gaps and malformed context blocks.

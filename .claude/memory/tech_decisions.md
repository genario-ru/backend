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

## Migrations Are Owner-Only

Agents may edit Drizzle schema files, relations, indexes, and exports. When schema changes, run `pnpm db:generate` and commit SQL under `src/db/migrations/**`. Do not run `pnpm db:migrate` (deploy applies migrations), `pnpm db:seed`, or `pnpm db:studio` unless the owner explicitly asks for that exact command in the current task.

Why: migration SQL is reviewable in PRs; application happens at deploy.

## External API Clients Are Generated

YooKassa and SocialKit clients live under `src/codegen/api/**`.

Why: generated clients track provider specs. Manual edits drift and are overwritten by Kubb.

## AI Prompts Are Triplets

Prompt behavior usually spans a Markdown template, typed props, and a builder.

Why: keeping placeholders, types, and call sites synchronized prevents runtime prompt gaps and malformed context blocks.

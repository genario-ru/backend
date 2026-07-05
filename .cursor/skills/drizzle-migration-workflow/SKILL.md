---
name: drizzle-migration-workflow
description: Workflow for DB schema changes through Drizzle schema files, relations, indexes, and application checks. Do not generate or edit migrations.
---

# Drizzle Migration Workflow

## When To Use

Use this when tables, fields, indexes, relations, or enums are changed in `src/db/schemas/**`.

## Steps

1. Inspect at least 3 relevant schemas/relations in `src/db/schemas/**`.
2. Apply schema changes in `src/db/schemas/**` and update `src/db/schema.ts` exports if required.
3. Add required indexes, foreign keys, and native Drizzle `relations(...)` immediately.
4. Update domain entity/handler schemas under `src/domains/**` when API payloads expose changed DB fields.
5. Run project checks, at least `pnpm lint:typescript`; add tests when behavior changes.
6. Tell the owner that migration generation is required and remains owner-only.

## Constraints

- Do not run `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:studio`, or any command that creates/applies schema/data changes unless the owner explicitly asks for that exact command in the current task.
- Do not create, edit, or delete files under `src/db/migrations/**`.
- Do not rewrite older migrations if it breaks migration history order.

## Production migrations & seed

- The runtime image has no `drizzle-kit`, so migrations run programmatically via `src/entrypoints/migrate.ts` (`dist/migrate.js`, drizzle's `migrate()`), exposed as `pnpm db:migrate` and executed at the deploy stage. SQL files are copied into the image at `src/db/migrations` (`Dockerfile`); a one-shot `migrate` service in `docker-compose.yml` runs them before `server`/`workers`.
- Default/reference data lives in `data/*.json`; seed runner in `src/db/seed/**`, invoked via `src/scripts/seed-database.ts` (`pnpm db:seed`, local only — not built into the image, never runs on the server). Idempotent upsert by `id` (`onConflictDoUpdate`). New default-data table: add `data/<table>.json` + an entry in `src/db/seed/config.ts` (referenced tables before dependents).

## Self-check

- Schema changes include required relations, indexes, and foreign keys.
- Owner-only migration generation is reported as required.
- API/domain schemas affected by the DB shape were updated.

## Reference Examples

- Primary table with relations and indexes: `src/db/schemas/primary/scenario.ts`.
- Billing table with enum and partial unique index: `src/db/schemas/billing/subscription.ts`.
- Linking table with composite uniqueness: `src/db/schemas/linking/application-to-product-feature.ts`.
- Many-to-many linking table: `src/db/schemas/linking/scenario-to-platform.ts`.
- Schema barrel exports: `src/db/schema.ts`.
- Seed/default data wiring: `src/db/seed/config.ts` and matching `data/*.json` files.

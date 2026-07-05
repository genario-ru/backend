---
name: drizzle-migration-workflow
description: Use for Drizzle schema changes in src/db/schemas, including table/index/relation updates and dependent API/domain schema updates. Do not generate or edit migrations.
---

# Drizzle Migration Workflow

Use when changing tables, columns, indexes, enums, relations, or migration behavior.

1. Inspect at least 3 relevant schemas/relations in `src/db/schemas/**`.
2. Change schema files in `src/db/schemas/**`; update `src/db/schema.ts` exports if required.
3. Add required indexes, foreign keys, and native Drizzle `relations(...)` immediately.
4. Update domain entity/handler schemas under `src/domains/**` when API responses expose changed DB fields.
5. Run `pnpm lint:typescript` and relevant tests when TypeScript behavior changed.
6. Tell the owner that migration generation is required and remains owner-only.

Do not run `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:studio`, or any command that creates/applies schema/data changes unless the owner explicitly asks for that exact command in the current task. Do not create, edit, or delete files under `src/db/migrations/**`.

## Production migrations

- The runtime image has no `drizzle-kit`, so migrations run programmatically via `src/entrypoints/migrate.ts` (`dist/migrate.js`, drizzle's `migrate()`), exposed as `pnpm db:migrate` and executed at the deploy stage.
- SQL files are copied into the image at `src/db/migrations` (`Dockerfile`); a one-shot `migrate` service in `docker-compose.yml` runs them on deploy before `server`/`workers`.

## Default data (seed)

- Reference data lives in `data/*.json`; the seed runner is in `src/db/seed/**` and is invoked via `src/scripts/seed-database.ts` (`pnpm db:seed`, local only — not built into the image, never runs on the server).
- Idempotent upsert by primary key `id` (`onConflictDoUpdate`, repo is source of truth). Separate manual step, not part of the deploy migration.
- New default-data table: add `data/<table>.json` and an entry in `src/db/seed/config.ts` (referenced tables before dependents for FK order).

## Reference Examples

- Primary table with relations and indexes: `src/db/schemas/primary/scenario.ts`.
- Billing table with enum and partial unique index: `src/db/schemas/billing/subscription.ts`.
- Linking table with composite uniqueness: `src/db/schemas/linking/application-to-product-feature.ts`.
- Many-to-many linking table: `src/db/schemas/linking/scenario-to-platform.ts`.
- Schema barrel exports: `src/db/schema.ts`.
- Seed/default data wiring: `src/db/seed/config.ts` and matching `data/*.json` files.

---
name: drizzle-migration-workflow
description: Use for Drizzle schema changes in src/db/schemas, including migration generation and dependent API/domain schema updates.
---

# Drizzle Migration Workflow

Use when changing tables, columns, indexes, enums, relations, or migration behavior.

1. Inspect at least 3 relevant schemas/relations in `src/db/schemas/**`.
2. Do not run database-apply commands. Agents may generate migration SQL but must not apply it.
3. Change schema files in `src/db/schemas/**`; update `src/db/schema.ts` exports if required.
4. Update domain entity/handler schemas under `src/domains/**` when API responses expose changed DB fields.
5. Generate SQL with `pnpm db:generate`.
6. Inspect generated SQL for unintended drops, rewrites, wrong defaults, or missing indexes.
7. Run `pnpm lint:typescript` and relevant tests.
8. Tell the user which migration file was generated and that a human should apply it if appropriate.

Do not run `pnpm db:migrate` or `pnpm db:seed` unless the user explicitly asks for that exact command in the current task. Commit schema and generated migrations together. There is no `db:push` — all schema changes go through reviewable migrations.

## Production migrations

- The runtime image has no `drizzle-kit`, so migrations run programmatically via `src/entrypoints/migrate.ts` (`dist/migrate.js`, drizzle's `migrate()`), exposed as `pnpm db:migrate` and executed at the deploy stage.
- SQL files are copied into the image at `src/db/migrations` (`Dockerfile`); a one-shot `migrate` service in `docker-compose.yml` runs them on deploy before `server`/`workers`.

## Default data (seed)

- Reference data lives in `data/*.json`; the seed runner is in `src/db/seed/**` and is invoked via `src/scripts/seed-database.ts` (`pnpm db:seed`, local only — not built into the image, never runs on the server).
- Idempotent upsert by primary key `id` (`onConflictDoUpdate`, repo is source of truth). Separate manual step, not part of the deploy migration.
- New default-data table: add `data/<table>.json` and an entry in `src/db/seed/config.ts` (referenced tables before dependents for FK order).

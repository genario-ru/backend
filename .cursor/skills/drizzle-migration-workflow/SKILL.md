---
name: drizzle-migration-workflow
description: Workflow for DB schema changes through Drizzle schema files, generated migrations, and application checks.
---

# Drizzle Migration Workflow

## When To Use

Use this when tables, fields, indexes, relations, or enums are changed in `src/db/schemas/**`.

## Steps

1. Inspect at least 3 relevant schemas/relations in `src/db/schemas/**`.
2. Do not run database-apply commands. Agents may generate migration SQL but must not apply it.
3. Apply schema changes in `src/db/schemas/**` and update `src/db/schema.ts` exports if required.
4. Update domain entity/handler schemas under `src/domains/**` when API payloads expose changed DB fields.
5. Generate migration: `pnpm db:generate`.
6. Inspect generated SQL for unintended drops, table rewrites, wrong defaults, or missing indexes.
7. Run project checks, at least `pnpm lint:typescript`; add tests when behavior changes.
8. Tell the user which migration file was generated and that a human should apply it if appropriate.

## Constraints

- Do not run `pnpm db:migrate`, `pnpm db:push`, or `pnpm db:drop` unless the user explicitly asks for that exact command in the current task.
- Do not rewrite older migrations if it breaks migration history order.

## Self-check

- Both schema change and migration file are present.
- No mismatch exists between schema code and SQL.
- API/domain schemas affected by the DB shape were updated.

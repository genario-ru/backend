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

Do not run `pnpm db:migrate`, `pnpm db:push`, or `pnpm db:drop` unless the user explicitly asks for that exact command in the current task. Commit schema and generated migrations together.

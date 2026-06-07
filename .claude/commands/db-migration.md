# Drizzle Migration Workflow

Plan a database schema change and generate migration SQL without applying it.

## Arguments

`$ARGUMENTS` - schema change description, for example `add slug to scenarios`.

## Mandatory Research

Before coding, read at least 3 similar table/relation files in `src/db/schemas/**`. List the reference paths before editing.

## Workflow

1. Do not run database-apply commands. Agents may generate migration SQL but must not apply it.
2. Edit schema files in `src/db/schemas/**`.
3. Update `src/db/schema.ts` exports if a new schema file was added.
4. Update domain schemas under `src/domains/**/schemas/**` when API payloads expose the changed DB shape.
5. Generate migration:
   ```bash
   pnpm db:generate
   ```
6. Review generated SQL in `src/db/migrations/**`.
7. Run `pnpm lint:typescript` and relevant tests.
8. Tell the user which migration file was generated and that a human should apply it if appropriate.

## Rules

- Do not run `pnpm db:migrate` or `pnpm db:seed` unless the user explicitly asks for that exact command in the current task. There is no `db:push` — all schema changes go through reviewable migrations.
- Do not rewrite old migrations.
- Commit schema and migration files together.

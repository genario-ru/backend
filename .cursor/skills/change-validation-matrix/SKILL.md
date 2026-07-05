---
name: change-validation-matrix
description: Selects minimally sufficient backend verification based on changed areas. Use before task finalization.
---

# Change Validation Matrix

## Goal

Do not finalize tasks without actual checks for the areas that changed.

## Steps

1. Identify changed areas:
   - docs/rules/agent instructions;
   - API/routes/schemas;
   - DB/migrations;
   - MQ/workers;
   - env/config/docker;
   - codegen;
   - tests.
2. Select commands from the matrix below.
3. Run a minimally sufficient set of checks.
4. If something is not executed because of time, environment, credentials, or database risk, report it explicitly.

## Matrix

- Docs/rules only: formatting/checks for changed Markdown/JSON/shell files, plus stale-reference search.
- TypeScript/backend code: `pnpm lint:fix`, `pnpm lint:typescript`.
- Env config: `pnpm validate:env` when a representative `.env` is available.
- Build/runtime entrypoints: `pnpm build`.
- Route/API contract: `pnpm lint:typescript`, targeted tests if available, OpenAPI metadata inspection.
- DB schema: run `pnpm lint:typescript` when schema TypeScript changed. Do not run `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, or `pnpm db:studio` unless the owner explicitly asks for that exact command in the current task.
- External API codegen: relevant `api:download:*`, `pnpm api:generate`, TypeScript check.
- Tests changed or behavior covered by tests: `pnpm test:unit` or targeted Vitest; `pnpm test` for broader validation.

## Self-check

- Explicitly list what was validated, what was not, and why.
- Do not claim completion if no checks were run.
- Do not generate or apply DB migrations from an AI workflow; migration generation is owner-only.

## Reference Examples

- Exact scripts: `package.json`.
- Shared validation policy: `AGENTS.md`.
- Route/API registration checks: `src/entrypoints/server.ts`.
- Worker registration checks: `src/entrypoints/workers.ts`.
- Env validation inputs: `env.ts`, `.env.example`, `docker-compose.yml`.

---
name: change-validation-matrix
description: Use before finishing backend changes to choose and report the right validation commands.
---

# Change Validation Matrix

Choose checks by changed area:

- Docs/rules only: format/check changed Markdown/JSON/shell files and search for stale paths.
- TypeScript/backend code: `pnpm lint:fix`, `pnpm lint:typescript`.
- Env config: `pnpm validate:env` when a representative `.env` is available.
- Build/runtime entrypoints: `pnpm build`.
- Route/API contract: `pnpm lint:typescript`, targeted tests if available, and OpenAPI metadata inspection.
- DB schema: `pnpm db:generate` only. Do not run `pnpm db:migrate`, `pnpm db:push`, or `pnpm db:drop` unless the user explicitly asks for that exact command in the current task.
- External API codegen: relevant `api:download:*`, `pnpm api:generate`, then TypeScript check.
- Tests changed or behavior covered by tests: `pnpm test:unit` or targeted Vitest; `pnpm test` for broader validation.

Always state what was run, what was skipped, and why. Do not claim DB migrations were applied from an AI workflow; generation is the maximum default action.

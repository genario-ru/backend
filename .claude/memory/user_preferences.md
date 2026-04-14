---
name: User preferences
description: Collaboration style and workflow expectations when working on genario-backend
type: user
---

## Reference-first before new files

Before creating any new file in a domain area, read at least 3 similar existing implementations and list them explicitly before writing code.

**Why:** Prevents inconsistent patterns — naming, structure, and imports must match existing conventions.
**How to apply:** For any new route, schema, worker, or lib file — find 3 references first, list them, then write.

## Completion checklist is mandatory

Every task must end with the checklist from CLAUDE.md verified: lint, typecheck, and all registration steps (server.ts, workers.ts, Bull Board) confirmed.

**How to apply:** Never report a task as done without running `pnpm lint:fix && pnpm lint:typescript` and confirming all integration points are updated.

## Both projects in the same monorepo

The user works on two related projects:

- `genario-backend` — this project (Hono API)
- `genario-frontend` — React 19 + TanStack Router SPA that consumes this API

**How to apply:** When adding or changing endpoints, note what the frontend will need (Kubb regeneration, action hook updates).

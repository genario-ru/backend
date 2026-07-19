---
name: User preferences
description: Collaboration style and workflow expectations when working on genario-backend
type: user
---

## Reference-First Before New Files

Before creating new route, schema, DB, MQ, lib, middleware, or AI prompt files, read at least 3 similar existing implementations and list them explicitly.

Why: naming, structure, imports, registration, and validation patterns must match the existing codebase.

## Ask Before Guessing

When requirements, architecture, file placement, or implementation choices are unclear, ask the owner instead of guessing. If a task requires a new custom construction with no local precedent, ask first and propose concrete options when possible.

## Database Boundaries

Agents may edit Drizzle schemas, relations, indexes, and exports. When schema files change, run `pnpm db:generate` and commit migration artifacts. Do not run `pnpm db:migrate`, `pnpm db:seed`, or `pnpm db:studio` unless explicitly asked for that exact command.

## Completion Checklist Is Mandatory

Every task should end with concrete validation: commands run, registration points checked, and skipped checks explained.

Do not report a task as fully validated when services, credentials, or an unconfirmed database target prevented relevant checks.

## Backend And Frontend Are Related

The user works on:

- `genario-backend` - this Hono API project.
- `genario-frontend` - the React + TanStack Router app that consumes this API.

When adding or changing endpoints, mention frontend implications such as API client regeneration, route action/query updates, or contract changes.

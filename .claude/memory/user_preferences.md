---
name: User preferences
description: Collaboration style and workflow expectations when working on genario-backend
type: user
---

## Reference-First Before New Files

Before creating new route, schema, DB, MQ, lib, middleware, or AI prompt files, read at least 3 similar existing implementations and list them explicitly.

Why: naming, structure, imports, registration, and validation patterns must match the existing codebase.

## Completion Checklist Is Mandatory

Every task should end with concrete validation: commands run, registration points checked, and skipped checks explained.

Do not report a task as fully validated when services, credentials, or an unconfirmed database target prevented relevant checks.

## Backend And Frontend Are Related

The user works on:

- `genario-backend` - this Hono API project.
- `genario-frontend` - the React + TanStack Router app that consumes this API.

When adding or changing endpoints, mention frontend implications such as API client regeneration, route action/query updates, or contract changes.
